import { Controller, Get, HttpCode, NotFoundException } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetFeaturedProductUseCase } from '../../../application/product/get-featured-product.use-case';

class FeaturedProductResponse {
  id!: string;
  name!: string;
  description!: string;
  priceCents!: number;
  stock!: number;
  imageUrl!: string | null;
}

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly getFeaturedProduct: GetFeaturedProductUseCase) {}

  @Get('featured')
  @HttpCode(200)
  @ApiOperation({ summary: 'Get the available product for checkout' })
  @ApiOkResponse({ type: FeaturedProductResponse })
  async getFeatured(): Promise<FeaturedProductResponse> {
    const result = await this.getFeaturedProduct.execute();

    if (!result.ok) {
      throw new NotFoundException('No available product was found');
    }

    return { ...result.value, imageUrl: result.value.imageUrl ?? null };
  }
}