import { BadGatewayException, Controller, Get } from '@nestjs/common';
import { ApiBadGatewayResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetAcceptanceDocumentsUseCase } from '../../../application/checkout/get-acceptance-documents.use-case';

class AcceptanceDocumentsResponse {
  termsUrl!: string;
  personalDataUrl!: string;
}

@ApiTags('checkout')
@Controller('checkout')
export class AcceptanceDocumentsController {
  constructor(private readonly getAcceptanceDocuments: GetAcceptanceDocumentsUseCase) {}

  @Get('acceptance-documents')
  @ApiOperation({ summary: 'Get current Wompi terms and personal data authorization links' })
  @ApiOkResponse({ type: AcceptanceDocumentsResponse })
  @ApiBadGatewayResponse({ description: 'Wompi acceptance documents are unavailable' })
  async getDocuments(): Promise<AcceptanceDocumentsResponse> {
    try {
      return await this.getAcceptanceDocuments.execute();
    } catch {
      throw new BadGatewayException('Wompi acceptance documents are unavailable');
    }
  }
}