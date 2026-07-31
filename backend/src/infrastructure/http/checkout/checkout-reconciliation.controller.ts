import { BadGatewayException, BadRequestException, ConflictException, Controller, Get, Headers, HttpCode, NotFoundException, Param, Post, UnauthorizedException, Body } from '@nestjs/common';
import { ApiBadGatewayResponse, ApiConflictResponse, ApiCreatedResponse, ApiNotFoundResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ReconcileCheckoutTransactionUseCase } from '../../../application/checkout/reconcile-checkout-transaction.use-case';
import { PaymentResponse } from '../../../application/ports/payment.gateway';
import { WompiWebhookVerifier } from '../../../infrastructure/payment/wompi/wompi-webhook.verifier';

@ApiTags('checkout')
@Controller('checkout')
export class CheckoutReconciliationController {
  constructor(
    private readonly reconcileCheckoutTransaction: ReconcileCheckoutTransactionUseCase,
    private readonly webhookVerifier: WompiWebhookVerifier,
  ) {}

  @Get('transactions/:reference')
  @ApiOperation({ summary: 'Refresh a pending transaction with Wompi' })
  @ApiNotFoundResponse({ description: 'Transaction was not found' })
  @ApiConflictResponse({ description: 'Transaction has no Wompi identifier yet' })
  @ApiBadGatewayResponse({ description: 'Wompi request failed' })
  async refresh(@Param('reference') reference: string) {
    const outcome = await this.reconcileCheckoutTransaction.refresh(reference);
    if (outcome.result) return outcome.result;
    if (outcome.error === 'TRANSACTION_NOT_FOUND') throw new NotFoundException('Transaction was not found');
    if (outcome.error === 'TRANSACTION_NOT_READY') throw new ConflictException('Transaction is not ready for reconciliation');
    throw new BadGatewayException('Payment gateway request failed');
  }

  @Post('wompi/events')
  @HttpCode(200)
  @ApiOperation({ summary: 'Receive signed transaction updates from Wompi' })
  async webhook(@Body() event: Record<string, any>, @Headers('x-event-checksum') checksum?: string): Promise<{ received: true }> {
    if (!this.webhookVerifier.isValid(event, checksum)) throw new UnauthorizedException('Invalid Wompi event signature');
    if (event.event !== 'transaction.updated') return { received: true };

    const transaction = event.data?.transaction;
    if (!transaction?.reference || !transaction?.id || !transaction?.status) throw new BadRequestException('Invalid transaction event');
    const payment: PaymentResponse = {
      transactionId: transaction.id,
      status: this.normalizeStatus(transaction.status),
      statusMessage: transaction.status_message,
      rawResponse: transaction,
    };
    const outcome = await this.reconcileCheckoutTransaction.reconcileEvent({ reference: transaction.reference, payment });
    if (outcome.error === 'TRANSACTION_NOT_FOUND') throw new NotFoundException('Transaction was not found');
    if (outcome.error === 'TRANSACTION_MISMATCH') throw new ConflictException('Transaction identifier does not match');
    return { received: true };
  }

  private normalizeStatus(status: string): PaymentResponse['status'] {
    return status === 'APPROVED' || status === 'DECLINED' || status === 'PENDING' ? status : 'ERROR';
  }
}