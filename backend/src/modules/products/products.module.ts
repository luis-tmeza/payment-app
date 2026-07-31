import { Module } from '@nestjs/common';
import { GetFeaturedProductUseCase } from '../../application/product/get-featured-product.use-case';
import { GetProductCatalogUseCase } from '../../application/product/get-product-catalog.use-case';
import { PRODUCT_REPOSITORY } from '../../application/ports/product.repository';
import { ProductsController } from '../../infrastructure/http/products/products.controller';
import { PrismaProductRepository } from '../../infrastructure/persistence/prisma/prisma-product.repository';

@Module({
  controllers: [ProductsController],
  providers: [
    GetFeaturedProductUseCase,
    GetProductCatalogUseCase,
    {
      provide: PRODUCT_REPOSITORY,
      useClass: PrismaProductRepository,
    },
  ],
})
export class ProductsModule {}