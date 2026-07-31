import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { CheckoutCommand, CheckoutResult } from '../../domain/checkout/checkout';
import { Result, err, ok } from '../../domain/shared/result';
import { CHECKOUT_REPOSITORY, CheckoutRepository, StockUnavailableError } from '../ports/checkout.repository';
import { PAYMENT_GATEWAY, PaymentGateway } from '../ports/payment.gateway';
export type CheckoutError = 'PRODUCT_NOT_FOUND' | 'OUT_OF_STOCK' | 'PAYMENT_GATEWAY_ERROR';
@Injectable()
export class CreateCheckoutTransactionUseCase {
  constructor(@Inject(CHECKOUT_REPOSITORY) private readonly checkoutRepository: CheckoutRepository, @Inject(PAYMENT_GATEWAY) private readonly paymentGateway: PaymentGateway, private readonly config: ConfigService) {}
  async execute(command: CheckoutCommand): Promise<Result<CheckoutResult, CheckoutError>> {
    const quantities = new Map<string, number>();
    for (const item of command.items) quantities.set(item.productId, (quantities.get(item.productId) ?? 0) + item.quantity);
    const products = await this.checkoutRepository.findProducts([...quantities.keys()]);
    if (products.length !== quantities.size) return err('PRODUCT_NOT_FOUND');
    const items = products.map((product) => ({ product, quantity: quantities.get(product.id)! }));
    if (items.some((item) => item.product.stock < item.quantity)) return err('OUT_OF_STOCK');
    const baseFeeCents = Number(this.config.get<string>('BASE_FEE_CENTS') ?? 250000);
    const deliveryFeeCents = Number(this.config.get<string>('DELIVERY_FEE_CENTS') ?? 900000);
    let pending;
    try { pending = await this.checkoutRepository.createPending({ reference: `PAY-${randomUUID()}`, items, baseFeeCents, deliveryFeeCents, customer: command.customer, delivery: command.delivery, cardBrand: this.cardBrand(command.card.number), cardLastFour: command.card.number.replace(/\D/g, '').slice(-4) }); }
    catch (error) { if (error instanceof StockUnavailableError) return err('OUT_OF_STOCK'); throw error; }
    try {
      const payment = await this.paymentGateway.charge({ reference: pending.reference, amountInCents: pending.totalAmountCents, customer: command.customer, card: command.card, acceptedTerms: command.acceptedTerms, acceptedPersonalData: command.acceptedPersonalData, clientIp: command.clientIp });
      const completion = await this.checkoutRepository.complete({ transactionId: pending.transactionId, status: payment.status, wompiTransactionId: payment.transactionId, statusMessage: payment.statusMessage, gatewayResponse: payment.rawResponse });
      if (completion === 'OUT_OF_STOCK') return err('OUT_OF_STOCK');
      return ok({ reference: pending.reference, status: payment.status, statusMessage: payment.statusMessage, totalAmountCents: pending.totalAmountCents });
    } catch { await this.checkoutRepository.complete({ transactionId: pending.transactionId, status: 'ERROR', statusMessage: 'Payment gateway request failed' }); return err('PAYMENT_GATEWAY_ERROR'); }
  }
  private cardBrand(cardNumber: string): string | undefined { const digits = cardNumber.replace(/\D/g, ''); if (/^4/.test(digits)) return 'VISA'; if (/^(5[1-5]|2(2[2-9]|[3-6][0-9]|7[01]))/.test(digits)) return 'MASTERCARD'; return undefined; }
}
