import { PaymentGateway } from '../ports/payment.gateway';
import { GetAcceptanceDocumentsUseCase } from './get-acceptance-documents.use-case';

describe('GetAcceptanceDocumentsUseCase', () => {
  it('returns the documents supplied by the payment gateway', async () => {
    const gateway = { getAcceptanceDocuments: jest.fn().mockResolvedValue({ termsUrl: 'https://terms', personalDataUrl: 'https://data' }), charge: jest.fn(), getTransaction: jest.fn() } as jest.Mocked<PaymentGateway>;
    await expect(new GetAcceptanceDocumentsUseCase(gateway).execute()).resolves.toEqual({ termsUrl: 'https://terms', personalDataUrl: 'https://data' });
  });
});