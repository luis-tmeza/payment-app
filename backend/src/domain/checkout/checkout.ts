export type CheckoutCustomer = {
  fullName: string;
  email: string;
  phone: string;
  documentType: string;
  document: string;
};

export type CheckoutDelivery = {
  addressLine: string;
  city: string;
  region: string;
  notes?: string;
};

export type CheckoutCard = {
  number: string;
  expiration: string;
  cvc: string;
  holderName: string;
};

export type CheckoutCommand = {
  productId: string;
  quantity: number;
  customer: CheckoutCustomer;
  delivery: CheckoutDelivery;
  card: CheckoutCard;
  acceptedTerms: boolean;
  acceptedPersonalData: boolean;
  clientIp?: string;
};

export type PendingCheckout = {
  transactionId: string;
  reference: string;
  productId: string;
  productAmountCents: number;
  totalAmountCents: number;
};

export type CheckoutResult = {
  reference: string;
  status: 'PENDING' | 'APPROVED' | 'DECLINED' | 'ERROR';
  statusMessage?: string;
  totalAmountCents: number;
};