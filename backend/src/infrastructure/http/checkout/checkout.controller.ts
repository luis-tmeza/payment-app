import { BadGatewayException, ConflictException, Controller, HttpCode, NotFoundException, Post, Req, Body } from '@nestjs/common';
import { ApiBadGatewayResponse, ApiConflictResponse, ApiCreatedResponse, ApiNotFoundResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { CreateCheckoutTransactionUseCase } from '../../../application/checkout/create-checkout-transaction.use-case';
import { CreateCheckoutTransactionDto } from './dto/create-checkout-transaction.dto';

class CheckoutTransactionResponse {
  reference!: string;
  status!: string;
  statusMessage?: string;
  totalAmountCents!: number;
}

@ApiTags('checkout')
@Controller('checkout')
export class CheckoutController {
  constructor(private readonly createCheckoutTransaction: CreateCheckoutTransactionUseCase) {}

  @Post('transactions')
  @HttpCode(201)
  @ApiOperation({ summary: 'Create a PENDING transaction and charge it through Wompi' })
  @ApiCreatedResponse({ type: CheckoutTransactionResponse })
  @ApiNotFoundResponse({ description: 'Product was not found' })
  @ApiConflictResponse({ description: 'Product has insufficient stock' })
  @ApiBadGatewayResponse({ description: 'Wompi request failed' })
  async create(
    @Body() body: CreateCheckoutTransactionDto,
    @Req() request: Request,
  ): Promise<CheckoutTransactionResponse> {
    const result = await this.createCheckoutTransaction.execute({
      items: body.items,
      customer: {
        fullName: body.fullName,
        email: body.email,
        phone: body.phone,
        documentType: body.documentType,
        document: body.document,
      },
      delivery: { addressLine: body.addressLine, city: body.city, region: body.region, notes: body.notes },
      card: {
        number: body.cardNumber,
        expiration: body.cardExpiration,
        cvc: body.cardCvv,
        holderName: body.cardholderName,
      },
      acceptedTerms: body.acceptedTerms,
      acceptedPersonalData: body.acceptedPersonalData,
      clientIp: request.ip,
    });

    if (result.ok) return result.value;
    if (result.error === 'PRODUCT_NOT_FOUND') throw new NotFoundException('Product was not found');
    if (result.error === 'OUT_OF_STOCK') throw new ConflictException('Product has insufficient stock');
    throw new BadGatewayException('Payment gateway request failed');
  }
}
