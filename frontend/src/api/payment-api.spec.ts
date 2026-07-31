import { describe, expect, it, vi } from 'vitest';

const { get, post } = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }));
vi.mock('./http', () => ({ http: { get, post } }));

import { getFeaturedProduct } from './products.api';
import { createCheckoutTransaction, getAcceptanceDocuments } from './checkout.api';

const payment = { cardNumber: '4242 4242 4242 4242', expiration: '12/31', cvv: '123', cardholderName: 'Ana', fullName: 'Ana Perez', email: 'ana@example.com', phone: '3000000000', documentType: 'CC', document: '123', addressLine: 'Calle 1', city: 'Bogota', region: 'Cundinamarca', notes: '', acceptedTerms: true, acceptedPersonalData: true };

describe('payment API', () => {
  it('returns the featured product and acceptance documents', async () => {
    get.mockResolvedValueOnce({ data: { id: 'p1' } }).mockResolvedValueOnce({ data: { termsUrl: 'https://terms', personalDataUrl: 'https://data' } });
    await expect(getFeaturedProduct()).resolves.toEqual({ id: 'p1' });
    await expect(getAcceptanceDocuments()).resolves.toEqual({ termsUrl: 'https://terms', personalDataUrl: 'https://data' });
  });

  it('maps payment data to the checkout contract', async () => {
    post.mockResolvedValue({ data: { reference: 'PAY-1', status: 'APPROVED', totalAmountCents: 100 } });
    await expect(createCheckoutTransaction([{ id: 'p1', name: 'Producto', description: 'Prueba', priceCents: 100, stock: 2, imageUrl: null, quantity: 1 }], payment, '11111111-1111-4111-8111-111111111111')).resolves.toMatchObject({ reference: 'PAY-1' });
    expect(post).toHaveBeenCalledWith('/checkout/transactions', expect.objectContaining({ checkoutKey: '11111111-1111-4111-8111-111111111111', items: [{ productId: 'p1', quantity: 1 }], cardCvv: '123', notes: undefined }));
  });
});
