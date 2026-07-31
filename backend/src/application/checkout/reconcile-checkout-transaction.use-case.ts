import { Inject, Injectable } from '@nestjs/common';
import { CheckoutResult } from '../../domain/checkout/checkout';
import { CHECKOUT_REPOSITORY, CheckoutRepository } from '../ports/checkout.repository';
import { PAYMENT_GATEWAY, PaymentGateway, PaymentResponse } from '../ports/payment.gateway';

export type ReconcileError = 'TRANSACTION_NOT_FOUND' | 'TRANSACTION_NOT_READY' | 'PAYMENT_GATEWAY_ERROR' | 'TRANSACTION_MISMATCH';

@Injectable()
export class ReconcileCheckoutTransactionUseCase {
  constructor(
    @Inject(CHECKOUT_REPOSITORY) private readonly checkoutRepository: CheckoutRepository,
    @Inject(PAYMENT_GATEWAY) private readonly paymentGateway: PaymentGateway,
  ) {}

  async refresh(reference: string): Promise<{ result?: CheckoutResult; error?: ReconcileError }> {
    const transaction = await this.checkoutRepository.findByReference(reference);
    if (!transaction) return { error: 'TRANSACTION_NOT_FOUND' };
    if (transaction.status !== 'PENDING') return { result: this.toResult(transaction) };
    if (!transaction.wompiTransactionId) return { error: 'TRANSACTION_NOT_READY' };

    try {
      const payment = await this.paymentGateway.getTransaction(transaction.wompiTransactionId);
      return this.persist(transaction, payment);
    } catch {
      return { error: 'PAYMENT_GATEWAY_ERROR' };
    }
  }

  async reconcileEvent(input: { reference: string; payment: PaymentResponse }): Promise<{ result?: CheckoutResult; error?: ReconcileError }> {
    const transaction = await this.checkoutRepository.findByReference(input.reference);
    if (!transaction) return { error: 'TRANSACTION_NOT_FOUND' };
    if (transaction.wompiTransactionId && input.payment.transactionId && transaction.wompiTransactionId !== input.payment.transactionId) {
      return { error: 'TRANSACTION_MISMATCH' };
    }
    return this.persist(transaction, input.payment);
  }

  private async persist(transaction: Awaited<ReturnType<CheckoutRepository['findByReference']>> extends infer T ? Exclude<T, null> : never, payment: PaymentResponse): Promise<{ result: CheckoutResult }> {
    await this.checkoutRepository.complete({
      transactionId: transaction.transactionId,
      status: payment.status,
      wompiTransactionId: payment.transactionId,
      statusMessage: payment.statusMessage,
      gatewayResponse: payment.rawResponse,
    });
    return { result: { reference: transaction.reference, status: payment.status, statusMessage: payment.statusMessage, totalAmountCents: transaction.totalAmountCents } };
  }

  private toResult(transaction: { reference: string; status: CheckoutResult['status']; statusMessage?: string; totalAmountCents: number }): CheckoutResult {
    return { reference: transaction.reference, status: transaction.status, statusMessage: transaction.statusMessage, totalAmountCents: transaction.totalAmountCents };
  }
}