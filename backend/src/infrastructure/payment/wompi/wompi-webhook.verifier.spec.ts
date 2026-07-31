import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';
import { WompiWebhookVerifier } from './wompi-webhook.verifier';

describe('WompiWebhookVerifier', () => {
  const secret = 'event-secret';
  const verifier = new WompiWebhookVerifier({ get: jest.fn(() => secret) } as unknown as ConfigService);
  const event = {
    data: { transaction: { id: 'wompi-1', status: 'APPROVED' } },
    signature: { properties: ['transaction.id', 'transaction.status'] },
    timestamp: 123456,
  };

  it('accepts a checksum built with dynamic signature properties', () => {
    const checksum = createHash('sha256').update(`wompi-1APPROVED123456${secret}`).digest('hex');
    expect(verifier.isValid(event, checksum)).toBe(true);
  });

  it('rejects an invalid checksum', () => {
    expect(verifier.isValid(event, 'invalid')).toBe(false);
  });
});