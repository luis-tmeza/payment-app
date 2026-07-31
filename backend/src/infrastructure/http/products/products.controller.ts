import { Controller, Get, HttpCode, NotFoundException } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetFeaturedProductUseCase } from '../../../application/product/get-featured-product.use-case';
import { GetProductCatalogUseCase } from '../../../application/product/get-product-catalog.use-case';
import { Product } from '../../../domain/product/product';

class ProductResponse {
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
  constructor(
    private readonly getFeaturedProduct: GetFeaturedProductUseCase,
    private readonly getProductCatalog: GetProductCatalogUseCase,
  ) {}

  @Get()
  @HttpCode(200)
  @ApiOperation({ summary: 'Get the checkout product catalog' })
  @ApiOkResponse({ type: [ProductResponse] })
  async getAll(): Promise<ProductResponse[]> {
    const products = await this.getProductCatalog.execute();
    return products.map((product) => this.toResponse(product));
  }

  @Get('featured')
  @HttpCode(200)
  @ApiOperation({ summary: 'Get the featured product for checkout' })
  @ApiOkResponse({ type: ProductResponse })
  async getFeatured(): Promise<ProductResponse> {
    const result = await this.getFeaturedProduct.execute();
    if (!result.ok) throw new NotFoundException('No available product was found');
    return this.toResponse(result.value);
  }
  private toResponse(product: Product): ProductResponse {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      priceCents: product.priceCents,
      stock: product.stock,
      imageUrl: product.imageUrl ?? null,
    };
  }
}