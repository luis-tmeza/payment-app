import { Injectable } from '@nestjs/common';
import { Prisma, TransactionStatus } from '@prisma/client';
import { CheckoutRepository, CompleteCheckout, CreatePendingCheckout, StockUnavailableError } from '../../../application/ports/checkout.repository';
import { PendingCheckout } from '../../../domain/checkout/checkout';
import { Product } from '../../../domain/product/product';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class PrismaCheckoutRepository implements CheckoutRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findProduct(productId: string): Promise<Product | null> {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    return product ? { ...product, stock: product.stock - product.reservedStock } : null;
  }

  async createPending(input: CreatePendingCheckout): Promise<PendingCheckout> {
    const totalAmountCents = input.product.priceCents * input.quantity + input.baseFeeCents + input.deliveryFeeCents;
    return this.prisma.$transaction(async (tx) => {
      const reserved = await tx.$executeRaw`
        UPDATE "Product"
        SET "reservedStock" = "reservedStock" + ${input.quantity}
        WHERE "id" = ${input.product.id}
          AND "stock" - "reservedStock" >= ${input.quantity}
      `;
      if (reserved !== 1) throw new StockUnavailableError();

      const customer = await tx.customer.create({ data: input.customer });
      const delivery = await tx.delivery.create({ data: { customerId: customer.id, ...input.delivery } });
      const transaction = await tx.transaction.create({
        data: {
          reference: input.reference,
          productId: input.product.id,
          customerId: customer.id,
          deliveryId: delivery.id,
          quantity: input.quantity,
          productAmountCents: input.product.priceCents * input.quantity,
          baseFeeCents: input.baseFeeCents,
          deliveryFeeCents: input.deliveryFeeCents,
          totalAmountCents,
          cardBrand: input.cardBrand,
          cardLastFour: input.cardLastFour,
        },
      });
      return { transactionId: transaction.id, reference: transaction.reference, productId: transaction.productId, productAmountCents: transaction.productAmountCents, totalAmountCents: transaction.totalAmountCents };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  }

  async complete(input: CompleteCheckout): Promise<'COMPLETED' | 'OUT_OF_STOCK'> {
    return this.prisma.$transaction<'COMPLETED' | 'OUT_OF_STOCK'>(async (tx) => {
      const transaction = await tx.transaction.findUniqueOrThrow({ where: { id: input.transactionId } });
      if (transaction.status !== TransactionStatus.PENDING) return 'COMPLETED';
      const gatewayResponse = input.gatewayResponse as Prisma.InputJsonValue | undefined;

      if (input.status === 'APPROVED') {
        await tx.product.update({ where: { id: transaction.productId }, data: { stock: { decrement: transaction.quantity }, reservedStock: { decrement: transaction.quantity } } });
        await tx.delivery.update({ where: { id: transaction.deliveryId }, data: { status: 'ASSIGNED', assignedAt: new Date() } });
      } else if (input.status !== 'PENDING') {
        await tx.product.update({ where: { id: transaction.productId }, data: { reservedStock: { decrement: transaction.quantity } } });
        await tx.delivery.update({ where: { id: transaction.deliveryId }, data: { status: 'CANCELLED' } });
      }

      await tx.transaction.update({
        where: { id: transaction.id },
        data: { status: input.status, wompiTransactionId: input.wompiTransactionId, wompiStatus: input.status, wompiStatusMessage: input.statusMessage, gatewayResponse },
      });
      return 'COMPLETED';
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  }
}