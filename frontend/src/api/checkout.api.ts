import { http } from './http';
import type { CheckoutPaymentData } from '../components/checkout/CheckoutModal.vue';
import type { AcceptanceDocuments } from '../types/acceptance-documents';
import type { CartItem } from '../types/cart';

export type CheckoutTransactionResponse = { reference: string; status: 'PENDING' | 'APPROVED' | 'DECLINED' | 'ERROR'; statusMessage?: string; totalAmountCents: number; };
export const createCheckoutTransaction = async (items: CartItem[], payment: CheckoutPaymentData, checkoutKey: string): Promise<CheckoutTransactionResponse> => {
  const { data } = await http.post<CheckoutTransactionResponse>('/checkout/transactions', {
    checkoutKey,
    items: items.map(({ id, quantity }) => ({ productId: id, quantity })),
    fullName: payment.fullName, email: payment.email, phone: payment.phone, documentType: payment.documentType, document: payment.document,
    addressLine: payment.addressLine, city: payment.city, region: payment.region, notes: payment.notes || undefined,
    cardNumber: payment.cardNumber, cardExpiration: payment.expiration, cardCvv: payment.cvv, cardholderName: payment.cardholderName,
    acceptedTerms: payment.acceptedTerms, acceptedPersonalData: payment.acceptedPersonalData,
  }, { timeout: 45_000 });
  return data;
};
export const getAcceptanceDocuments = async (): Promise<AcceptanceDocuments> => { const { data } = await http.get<AcceptanceDocuments>('/checkout/acceptance-documents'); return data; };

