import { ConfigService } from '@nestjs/config';
import { CheckoutRepository, StockUnavailableError } from '../ports/checkout.repository';
import { PaymentGateway } from '../ports/payment.gateway';
import { CreateCheckoutTransactionUseCase } from './create-checkout-transaction.use-case';

describe('CreateCheckoutTransactionUseCase', () => {
  const repository: jest.Mocked<CheckoutRepository> = {
    findProduct: jest.fn(),
    createPending: jest.fn(),
    complete: jest.fn(),
  };
  const gateway: jest.Mocked<PaymentGateway> = {
    getAcceptanceDocuments: jest.fn(),
    charge: jest.fn(),
  };
  const config = { get: jest.fn((key: string) => (key === 'BASE_FEE_CENTS' ? '250000' : '900000')) } as unknown as ConfigService;
  const useCase = new CreateCheckoutTransactionUseCase(repository, gateway, config);
  const command = {
    productId: 'product-1', quantity: 1, acceptedTerms: true, acceptedPersonalData: true,
    customer: { fullName: 'Ana Perez', email: 'ana@example.com', phone: '3000000000', documentType: 'CC', document: '12345678' },
    delivery: { addressLine: 'Calle 1 # 2-3', city: 'Bogota', region: 'Cundinamarca' },
    card: { number: '4242424242424242', expiration: '12/31', cvc: '123', holderName: 'Ana Perez' },
  };

  beforeEach(() => jest.resetAllMocks());

  it('creates a pending transaction and completes an approved payment', async () => {
    repository.findProduct.mockResolvedValue({ id: 'product-1', name: 'Headphones', description: 'Test', priceCents: 100000, stock: 2, imageUrl: null });
    repository.createPending.mockResolvedValue({ transactionId: 'transaction-1', reference: 'PAY-1', productId: 'product-1', productAmountCents: 100000, totalAmountCents: 1250000 });
    gateway.charge.mockResolvedValue({ status: 'APPROVED', transactionId: 'wompi-1' });
    repository.complete.mockResolvedValue('COMPLETED');

    const result = await useCase.execute(command);

    expect(result).toEqual({ ok: true, value: expect.objectContaining({ reference: 'PAY-1', status: 'APPROVED' }) });
    expect(repository.complete).toHaveBeenCalledWith(expect.objectContaining({ transactionId: 'transaction-1', status: 'APPROVED' }));
  });

  it('rejects the checkout before payment when stock is insufficient', async () => {
    repository.findProduct.mockResolvedValue({ id: 'product-1', name: 'Headphones', description: 'Test', priceCents: 100000, stock: 0, imageUrl: null });

    await expect(useCase.execute(command)).resolves.toEqual({ ok: false, error: 'OUT_OF_STOCK' });
    expect(gateway.charge).not.toHaveBeenCalled();
  });

  it('does not charge when the atomic inventory reservation is rejected', async () => {
    repository.findProduct.mockResolvedValue({ id: 'product-1', name: 'Headphones', description: 'Test', priceCents: 100000, stock: 1, imageUrl: null });
    repository.createPending.mockRejectedValue(new StockUnavailableError());

    await expect(useCase.execute(command)).resolves.toEqual({ ok: false, error: 'OUT_OF_STOCK' });
    expect(gateway.charge).not.toHaveBeenCalled();
    expect(repository.complete).not.toHaveBeenCalled();
  });});