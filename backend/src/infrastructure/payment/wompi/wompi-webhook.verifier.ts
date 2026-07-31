import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, timingSafeEqual } from 'crypto';

type WompiEvent = {
  data?: Record<string, unknown>;
  signature?: { properties?: string[]; checksum?: string };
  timestamp?: number;
};

@Injectable()
export class WompiWebhookVerifier {
  constructor(private readonly config: ConfigService) {}

  isValid(event: WompiEvent, checksum?: string): boolean {
    const secret = this.config.get<string>('WOMPI_EVENTS_SECRET');
    const properties = event.signature?.properties;
    const received = checksum ?? event.signature?.checksum;
    if (!secret || !properties?.length || !received || !Number.isInteger(event.timestamp)) return false;

    const payload = `${properties.map((property) => String(this.valueAtPath(event.data, property) ?? '')).join('')}${event.timestamp}${secret}`;
    const expected = createHash('sha256').update(payload).digest('hex');
    const receivedBuffer = Buffer.from(received.toLowerCase());
    const expectedBuffer = Buffer.from(expected);
    return receivedBuffer.length === expectedBuffer.length && timingSafeEqual(receivedBuffer, expectedBuffer);
  }

  private valueAtPath(source: Record<string, unknown> | undefined, path: string): unknown {
    return path.split('.').reduce<unknown>((value, segment) => (
      value && typeof value === 'object' ? (value as Record<string, unknown>)[segment] : undefined
    ), source);
  }
}