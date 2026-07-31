import { CheckoutRepository } from '../ports/checkout.repository';
import { PaymentGateway } from '../ports/payment.gateway';
import { ReconcileCheckoutTransactionUseCase } from './reconcile-checkout-transaction.use-case';

describe('ReconcileCheckoutTransactionUseCase', () => {
  const repository: jest.Mocked<CheckoutRepository> = {
    findProducts: jest.fn(), createPending: jest.fn(), findByReference: jest.fn(), complete: jest.fn(),
  };
  const gateway: jest.Mocked<PaymentGateway> = {
    getAcceptanceDocuments: jest.fn(), charge: jest.fn(), getTransaction: jest.fn(),
  };
  const useCase = new ReconcileCheckoutTransactionUseCase(repository, gateway);
  const pending = { transactionId: 'checkout-1', reference: 'PAY-1', status: 'PENDING' as const, wompiTransactionId: 'wompi-1', totalAmountCents: 1250000 };

  beforeEach(() => jest.resetAllMocks());

  it('refreshes a pending checkout and persists the terminal Wompi status', async () => {
    repository.findByReference.mockResolvedValue(pending);
    gateway.getTransaction.mockResolvedValue({ status: 'APPROVED', transactionId: 'wompi-1' });
    repository.complete.mockResolvedValue('COMPLETED');

    await expect(useCase.refresh('PAY-1')).resolves.toEqual({ result: expect.objectContaining({ status: 'APPROVED' }) });
    expect(repository.complete).toHaveBeenCalledWith(expect.objectContaining({ transactionId: 'checkout-1', status: 'APPROVED' }));
  });

  it('does not call Wompi for a transaction already finalized', async () => {
    repository.findByReference.mockResolvedValue({ ...pending, status: 'DECLINED' });

    await expect(useCase.refresh('PAY-1')).resolves.toEqual({ result: expect.objectContaining({ status: 'DECLINED' }) });
    expect(gateway.getTransaction).not.toHaveBeenCalled();
  });

  it('rejects an event whose Wompi transaction does not belong to the checkout', async () => {
    repository.findByReference.mockResolvedValue(pending);

    await expect(useCase.reconcileEvent({ reference: 'PAY-1', payment: { status: 'APPROVED', transactionId: 'other-wompi-id' } }))
      .resolves.toEqual({ error: 'TRANSACTION_MISMATCH' });
    expect(repository.complete).not.toHaveBeenCalled();
  });

  it('reports missing and not-ready transactions without calling Wompi', async () => {
    repository.findByReference.mockResolvedValueOnce(null).mockResolvedValueOnce({ ...pending, wompiTransactionId: undefined });
    await expect(useCase.refresh('missing')).resolves.toEqual({ error: 'TRANSACTION_NOT_FOUND' });
    await expect(useCase.refresh('PAY-1')).resolves.toEqual({ error: 'TRANSACTION_NOT_READY' });
    expect(gateway.getTransaction).not.toHaveBeenCalled();
  });

  it('returns a gateway error when refresh fails', async () => {
    repository.findByReference.mockResolvedValue(pending);
    gateway.getTransaction.mockRejectedValue(new Error('network'));
    await expect(useCase.refresh('PAY-1')).resolves.toEqual({ error: 'PAYMENT_GATEWAY_ERROR' });
  });});
