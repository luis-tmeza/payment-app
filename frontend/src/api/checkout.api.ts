import { http } from './http';
import type { CheckoutPaymentData } from '../components/checkout/CheckoutModal.vue';

export type CheckoutTransactionResponse = {
  reference: string;
  status: 'PENDING' | 'APPROVED' | 'DECLINED' | 'ERROR';
  statusMessage?: string;
  totalAmountCents: number;
};

export const createCheckoutTransaction = async (
  productId: string,
  payment: CheckoutPaymentData,
): Promise<CheckoutTransactionResponse> => {
  const { data } = await http.post<CheckoutTransactionResponse>('/checkout/transactions', {
    productId,
    quantity: 1,
    fullName: payment.fullName,
    email: payment.email,
    phone: payment.phone,
    documentType: payment.documentType,
    document: payment.document,
    addressLine: payment.addressLine,
    city: payment.city,
    region: payment.region,
    notes: payment.notes || undefined,
    cardNumber: payment.cardNumber,
    cardExpiration: payment.expiration,
    cardCvv: payment.cvv,
    cardholderName: payment.cardholderName,
    acceptedTerms: payment.acceptedTerms,
    acceptedPersonalData: payment.acceptedPersonalData,
  });
  return data;
};