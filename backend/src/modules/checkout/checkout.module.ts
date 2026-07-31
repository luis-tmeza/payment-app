import { Module } from '@nestjs/common';
import { CreateCheckoutTransactionUseCase } from '../../application/checkout/create-checkout-transaction.use-case';
import { GetAcceptanceDocumentsUseCase } from '../../application/checkout/get-acceptance-documents.use-case';
import { ReconcileCheckoutTransactionUseCase } from '../../application/checkout/reconcile-checkout-transaction.use-case';
import { CHECKOUT_REPOSITORY } from '../../application/ports/checkout.repository';
import { PAYMENT_GATEWAY } from '../../application/ports/payment.gateway';
import { CheckoutController } from '../../infrastructure/http/checkout/checkout.controller';
import { CheckoutReconciliationController } from '../../infrastructure/http/checkout/checkout-reconciliation.controller';
import { AcceptanceDocumentsController } from '../../infrastructure/http/checkout/acceptance-documents.controller';
import { WompiPaymentGateway } from '../../infrastructure/payment/wompi/wompi-payment.gateway';
import { WompiWebhookVerifier } from '../../infrastructure/payment/wompi/wompi-webhook.verifier';
import { PrismaCheckoutRepository } from '../../infrastructure/persistence/prisma/prisma-checkout.repository';

@Module({
  controllers: [CheckoutController, CheckoutReconciliationController, AcceptanceDocumentsController],
  providers: [
    CreateCheckoutTransactionUseCase,
    GetAcceptanceDocumentsUseCase,
    ReconcileCheckoutTransactionUseCase,
    WompiWebhookVerifier,
    { provide: CHECKOUT_REPOSITORY, useClass: PrismaCheckoutRepository },
    { provide: PAYMENT_GATEWAY, useClass: WompiPaymentGateway },
  ],
})
export class CheckoutModule {}