import { CheckoutCard, CheckoutCustomer } from '../../domain/checkout/checkout';

export const PAYMENT_GATEWAY = Symbol('PAYMENT_GATEWAY');

export type PaymentRequest = {
  reference: string;
  amountInCents: number;
  customer: CheckoutCustomer;
  card: CheckoutCard;
  acceptedTerms: boolean;
  acceptedPersonalData: boolean;
  clientIp?: string;
};

export type PaymentResponse = {
  status: 'PENDING' | 'APPROVED' | 'DECLINED' | 'ERROR';
  transactionId?: string;
  statusMessage?: string;
  rawResponse?: Record<string, unknown>;
};

export interface PaymentGateway {
  charge(input: PaymentRequest): Promise<PaymentResponse>;
}