import { ConfigService } from '@nestjs/config';
import { CheckoutRepository, StockUnavailableError } from '../ports/checkout.repository';
import { PaymentGateway } from '../ports/payment.gateway';
import { CreateCheckoutTransactionUseCase } from './create-checkout-transaction.use-case';

describe('CreateCheckoutTransactionUseCase', () => {
  const repository: jest.Mocked<CheckoutRepository> = { findProducts: jest.fn(), findByCheckoutKey: jest.fn(), createPending: jest.fn(), findByReference: jest.fn(), complete: jest.fn() };
  const gateway: jest.Mocked<PaymentGateway> = { getAcceptanceDocuments: jest.fn(), charge: jest.fn(), getTransaction: jest.fn() };
  const config = { get: jest.fn((key: string) => (key === 'BASE_FEE_CENTS' ? '250000' : '900000')) } as unknown as ConfigService;
  const useCase = new CreateCheckoutTransactionUseCase(repository, gateway, config);
  const command = { checkoutKey: '11111111-1111-4111-8111-111111111111', items: [{ productId: 'product-1', quantity: 1 }, { productId: 'product-2', quantity: 2 }], acceptedTerms: true, acceptedPersonalData: true, customer: { fullName: 'Ana Perez', email: 'ana@example.com', phone: '3000000000', documentType: 'CC', document: '12345678' }, delivery: { addressLine: 'Calle 1 # 2-3', city: 'Bogota', region: 'Cundinamarca' }, card: { number: '4242424242424242', expiration: '12/31', cvc: '123', holderName: 'Ana Perez' } };
  const products = [{ id: 'product-1', name: 'Headphones', description: 'Test', priceCents: 100000, stock: 2, imageUrl: null }, { id: 'product-2', name: 'Speaker', description: 'Test', priceCents: 50000, stock: 3, imageUrl: null }];
  beforeEach(() => { jest.resetAllMocks(); repository.findByCheckoutKey.mockResolvedValue(null); });
  it('creates one payment for all cart lines and completes it', async () => {
    repository.findProducts.mockResolvedValue(products); repository.createPending.mockResolvedValue({ transactionId: 'transaction-1', reference: 'PAY-1', totalAmountCents: 1350000 }); gateway.charge.mockResolvedValue({ status: 'APPROVED', transactionId: 'wompi-1' }); repository.complete.mockResolvedValue('COMPLETED');
    await expect(useCase.execute(command)).resolves.toEqual({ ok: true, value: expect.objectContaining({ reference: 'PAY-1', status: 'APPROVED' }) });
    expect(repository.createPending).toHaveBeenCalledWith(expect.objectContaining({ items: [{ product: products[0], quantity: 1 }, { product: products[1], quantity: 2 }] }));
  });
  it('returns the existing checkout instead of charging a retry', async () => {
    repository.findByCheckoutKey.mockResolvedValue({ transactionId: 'transaction-1', reference: 'PAY-1', status: 'APPROVED', totalAmountCents: 1350000 });
    await expect(useCase.execute(command)).resolves.toEqual({ ok: true, value: { reference: 'PAY-1', status: 'APPROVED', totalAmountCents: 1350000, statusMessage: undefined } });
    expect(repository.createPending).not.toHaveBeenCalled();
    expect(gateway.charge).not.toHaveBeenCalled();
  });  it('rejects before charging when any cart line has insufficient stock', async () => { repository.findProducts.mockResolvedValue([{ ...products[0], stock: 0 }, products[1]]); await expect(useCase.execute(command)).resolves.toEqual({ ok: false, error: 'OUT_OF_STOCK' }); expect(gateway.charge).not.toHaveBeenCalled(); });
  it('rejects when a cart product does not exist', async () => { repository.findProducts.mockResolvedValue([products[0]]); await expect(useCase.execute(command)).resolves.toEqual({ ok: false, error: 'PRODUCT_NOT_FOUND' }); });
  it('does not charge when atomic inventory reservation is rejected', async () => { repository.findProducts.mockResolvedValue(products); repository.createPending.mockRejectedValue(new StockUnavailableError()); await expect(useCase.execute(command)).resolves.toEqual({ ok: false, error: 'OUT_OF_STOCK' }); expect(gateway.charge).not.toHaveBeenCalled(); });
  it('releases the reservation when charging fails', async () => { repository.findProducts.mockResolvedValue(products); repository.createPending.mockResolvedValue({ transactionId: 'transaction-1', reference: 'PAY-1', totalAmountCents: 1350000 }); gateway.charge.mockRejectedValue(new Error('gateway')); repository.complete.mockResolvedValue('COMPLETED'); await expect(useCase.execute(command)).resolves.toEqual({ ok: false, error: 'PAYMENT_GATEWAY_ERROR' }); expect(repository.complete).toHaveBeenCalledWith(expect.objectContaining({ status: 'ERROR' })); });
});
