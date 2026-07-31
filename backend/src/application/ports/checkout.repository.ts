import { CheckoutCustomer, CheckoutDelivery, PendingCheckout } from '../../domain/checkout/checkout';
import { Product } from '../../domain/product/product';

export const CHECKOUT_REPOSITORY = Symbol('CHECKOUT_REPOSITORY');
export class StockUnavailableError extends Error { constructor() { super('Product stock is unavailable'); } }
export class DuplicateCheckoutError extends Error { constructor() { super('Checkout already exists'); } }
export type CheckoutProductLine = { product: Product; quantity: number; };
export type CreatePendingCheckout = { checkoutKey: string; reference: string; items: CheckoutProductLine[]; baseFeeCents: number; deliveryFeeCents: number; customer: CheckoutCustomer; delivery: CheckoutDelivery; cardBrand?: string; cardLastFour: string; };
export type CompleteCheckout = { transactionId: string; status: 'PENDING' | 'APPROVED' | 'DECLINED' | 'ERROR'; wompiTransactionId?: string; statusMessage?: string; gatewayResponse?: Record<string, unknown>; };
export type StoredCheckout = { transactionId: string; reference: string; status: CompleteCheckout['status']; wompiTransactionId?: string; statusMessage?: string; totalAmountCents: number; };
export interface CheckoutRepository {
  findProducts(productIds: string[]): Promise<Product[]>;
  findByCheckoutKey(checkoutKey: string): Promise<StoredCheckout | null>;
  createPending(input: CreatePendingCheckout): Promise<PendingCheckout>;
  findByReference(reference: string): Promise<StoredCheckout | null>;
  complete(input: CompleteCheckout): Promise<'COMPLETED' | 'OUT_OF_STOCK'>;
}
