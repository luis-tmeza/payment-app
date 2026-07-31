import { Inject, Injectable } from '@nestjs/common';
import { Product } from '../../domain/product/product';
import { Result, err, ok } from '../../domain/shared/result';
import { PRODUCT_REPOSITORY, ProductRepository } from '../ports/product.repository';

export type GetFeaturedProductError = 'PRODUCT_NOT_FOUND';

@Injectable()
export class GetFeaturedProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(): Promise<Result<Product, GetFeaturedProductError>> {
    const product = await this.productRepository.findFeatured();

    if (!product) {
      return err('PRODUCT_NOT_FOUND');
    }

    return ok(product);
  }
}