import { Inject, Injectable } from '@nestjs/common';
import { AcceptanceDocuments, PAYMENT_GATEWAY, PaymentGateway } from '../ports/payment.gateway';

@Injectable()
export class GetAcceptanceDocumentsUseCase {
  constructor(@Inject(PAYMENT_GATEWAY) private readonly paymentGateway: PaymentGateway) {}

  execute(): Promise<AcceptanceDocuments> {
    return this.paymentGateway.getAcceptanceDocuments();
  }
}