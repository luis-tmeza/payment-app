import { Injectable } from '@nestjs/common';
import { Prisma, TransactionStatus } from '@prisma/client';
import { CheckoutRepository, CompleteCheckout, CreatePendingCheckout, StockUnavailableError } from '../../../application/ports/checkout.repository';
import { PendingCheckout } from '../../../domain/checkout/checkout';
import { Product } from '../../../domain/product/product';
import { PrismaService } from '../../database/prisma.service';
@Injectable()
export class PrismaCheckoutRepository implements CheckoutRepository {
  constructor(private readonly prisma: PrismaService) {}
  async findProducts(productIds: string[]): Promise<Product[]> { const products = await this.prisma.product.findMany({ where: { id: { in: productIds } } }); return products.map((product) => ({ ...product, stock: product.stock - product.reservedStock })); }
  async createPending(input: CreatePendingCheckout): Promise<PendingCheckout> {
    const productAmountCents = input.items.reduce((total, item) => total + item.product.priceCents * item.quantity, 0); const totalAmountCents = productAmountCents + input.baseFeeCents + input.deliveryFeeCents; const primary = input.items[0];
    return this.prisma.$transaction(async (tx) => {
      for (const item of input.items) { const reserved = await tx.$executeRaw`UPDATE "Product" SET "reservedStock" = "reservedStock" + ${item.quantity} WHERE "id" = ${item.product.id} AND "stock" - "reservedStock" >= ${item.quantity}`; if (reserved !== 1) throw new StockUnavailableError(); }
      const customer = await tx.customer.create({ data: input.customer }); const delivery = await tx.delivery.create({ data: { customerId: customer.id, ...input.delivery } });
      const transaction = await tx.transaction.create({ data: { reference: input.reference, productId: primary.product.id, customerId: customer.id, deliveryId: delivery.id, quantity: primary.quantity, productAmountCents, baseFeeCents: input.baseFeeCents, deliveryFeeCents: input.deliveryFeeCents, totalAmountCents, cardBrand: input.cardBrand, cardLastFour: input.cardLastFour, items: { create: input.items.map((item) => ({ productId: item.product.id, quantity: item.quantity, unitPriceCents: item.product.priceCents, totalAmountCents: item.product.priceCents * item.quantity })) } } });
      return { transactionId: transaction.id, reference: transaction.reference, totalAmountCents };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  }
  async findByReference(reference: string) { const transaction = await this.prisma.transaction.findUnique({ where: { reference } }); if (!transaction) return null; return { transactionId: transaction.id, reference: transaction.reference, status: transaction.status, wompiTransactionId: transaction.wompiTransactionId ?? undefined, statusMessage: transaction.wompiStatusMessage ?? undefined, totalAmountCents: transaction.totalAmountCents }; }
  async complete(input: CompleteCheckout): Promise<'COMPLETED' | 'OUT_OF_STOCK'> { return this.prisma.$transaction<'COMPLETED' | 'OUT_OF_STOCK'>(async (tx) => { const transaction = await tx.transaction.findUniqueOrThrow({ where: { id: input.transactionId }, include: { items: true } }); if (transaction.status !== TransactionStatus.PENDING) return 'COMPLETED'; const gatewayResponse = input.gatewayResponse as Prisma.InputJsonValue | undefined; if (input.status === 'APPROVED') { for (const item of transaction.items) await tx.product.update({ where: { id: item.productId }, data: { stock: { decrement: item.quantity }, reservedStock: { decrement: item.quantity } } }); await tx.delivery.update({ where: { id: transaction.deliveryId }, data: { status: 'ASSIGNED', assignedAt: new Date() } }); } else if (input.status !== 'PENDING') { for (const item of transaction.items) await tx.product.update({ where: { id: item.productId }, data: { reservedStock: { decrement: item.quantity } } }); await tx.delivery.update({ where: { id: transaction.deliveryId }, data: { status: 'CANCELLED' } }); } await tx.transaction.update({ where: { id: transaction.id }, data: { status: input.status, wompiTransactionId: input.wompiTransactionId, wompiStatus: input.status, wompiStatusMessage: input.statusMessage, gatewayResponse } }); return 'COMPLETED'; }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }); }
}
