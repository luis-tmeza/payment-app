import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { createHash } from 'crypto';
import { PaymentGateway, PaymentRequest, PaymentResponse } from '../../../application/ports/payment.gateway';

@Injectable()
export class WompiPaymentGateway implements PaymentGateway {
  private readonly baseUrl: string;
  private readonly publicKey: string;
  private readonly privateKey: string;
  private readonly integritySecret: string;

  constructor(private readonly config: ConfigService) {
    this.baseUrl = this.config.get<string>('WOMPI_BASE_URL') ?? 'https://sandbox.wompi.co/v1';
    this.publicKey = this.config.get<string>('WOMPI_PUBLIC_KEY') ?? '';
    this.privateKey = this.config.get<string>('WOMPI_PRIVATE_KEY') ?? '';
    this.integritySecret = this.config.get<string>('WOMPI_INTEGRITY_SECRET') ?? '';
  }

  async charge(input: PaymentRequest): Promise<PaymentResponse> {
    this.ensureConfiguration();
    const acceptance = await this.getAcceptanceTokens();
    const token = await this.tokenizeCard(input);
    const response = await axios.post(`${this.baseUrl}/transactions`, {
      acceptance_token: acceptance.acceptanceToken,
      accept_personal_auth: acceptance.personalDataToken,
      amount_in_cents: input.amountInCents,
      currency: 'COP',
      customer_email: input.customer.email,
      customer_data: {
        full_name: input.customer.fullName,
        phone_number: input.customer.phone,
        legal_id: input.customer.document,
        legal_id_type: input.customer.documentType,
      },
      payment_method: { type: 'CARD', token, installments: 1 },
      payment_method_type: 'CARD',
      reference: input.reference,
      signature: this.integritySignature(input.reference, input.amountInCents),
      ip: input.clientIp,
    }, {
      headers: { Authorization: `Bearer ${this.privateKey}` },
      timeout: 15_000,
    });

    const data = response.data?.data as Record<string, unknown> | undefined;
    return {
      status: this.normalizeStatus(String(data?.status ?? 'ERROR')),
      transactionId: typeof data?.id === 'string' ? data.id : undefined,
      statusMessage: typeof data?.status_message === 'string' ? data.status_message : undefined,
      rawResponse: data,
    };
  }

  private async getAcceptanceTokens(): Promise<{ acceptanceToken: string; personalDataToken: string }> {
    const response = await axios.get(`${this.baseUrl}/merchants/${this.publicKey}`, {
      headers: { Authorization: `Bearer ${this.publicKey}` },
      timeout: 10_000,
    });
    const data = response.data?.data;
    const acceptanceToken = data?.presigned_acceptance?.acceptance_token;
    const personalDataToken = data?.presigned_personal_data_auth?.acceptance_token;
    if (typeof acceptanceToken !== 'string' || typeof personalDataToken !== 'string') {
      throw new Error('Wompi acceptance tokens are unavailable');
    }
    return { acceptanceToken, personalDataToken };
  }

  private async tokenizeCard(input: PaymentRequest): Promise<string> {
    const [month, year] = input.card.expiration.split('/');
    const response = await axios.post(`${this.baseUrl}/tokens/cards`, {
      number: input.card.number.replace(/\D/g, ''),
      exp_month: month,
      exp_year: year,
      cvc: input.card.cvc,
      card_holder: input.card.holderName,
    }, {
      headers: { Authorization: `Bearer ${this.publicKey}` },
      timeout: 10_000,
    });
    const token = response.data?.data?.id;
    if (typeof token !== 'string') throw new Error('Wompi card token was not created');
    return token;
  }

  private integritySignature(reference: string, amountInCents: number): string {
    return createHash('sha256').update(`${reference}${amountInCents}COP${this.integritySecret}`).digest('hex');
  }

  private normalizeStatus(status: string): PaymentResponse['status'] {
    return status === 'APPROVED' || status === 'DECLINED' || status === 'PENDING' ? status : 'ERROR';
  }

  private ensureConfiguration(): void {
    if (!this.publicKey || !this.privateKey || !this.integritySecret) {
      throw new Error('Wompi credentials are not configured');
    }
  }
}