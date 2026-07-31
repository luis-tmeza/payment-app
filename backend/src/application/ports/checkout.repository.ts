import { CheckoutCustomer, CheckoutDelivery, PendingCheckout } from '../../domain/checkout/checkout';
import { Product } from '../../domain/product/product';

export const CHECKOUT_REPOSITORY = Symbol('CHECKOUT_REPOSITORY');

export class StockUnavailableError extends Error {
  constructor() {
    super('Product stock is unavailable');
  }
}

export type CreatePendingCheckout = {
  reference: string;
  product: Product;
  quantity: number;
  baseFeeCents: number;
  deliveryFeeCents: number;
  customer: CheckoutCustomer;
  delivery: CheckoutDelivery;
  cardBrand?: string;
  cardLastFour: string;
};

export type CompleteCheckout = {
  transactionId: string;
  status: 'PENDING' | 'APPROVED' | 'DECLINED' | 'ERROR';
  wompiTransactionId?: string;
  statusMessage?: string;
  gatewayResponse?: Record<string, unknown>;
};

export type StoredCheckout = {
  transactionId: string;
  reference: string;
  status: CompleteCheckout['status'];
  wompiTransactionId?: string;
  statusMessage?: string;
  totalAmountCents: number;
};

export interface CheckoutRepository {
  findProduct(productId: string): Promise<Product | null>;
  createPending(input: CreatePendingCheckout): Promise<PendingCheckout>;
  findByReference(reference: string): Promise<StoredCheckout | null>;
  complete(input: CompleteCheckout): Promise<'COMPLETED' | 'OUT_OF_STOCK'>;
}