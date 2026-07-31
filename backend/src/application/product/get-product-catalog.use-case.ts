import { Inject, Injectable } from '@nestjs/common';
import { Product } from '../../domain/product/product';
import { PRODUCT_REPOSITORY, ProductRepository } from '../ports/product.repository';

@Injectable()
export class GetProductCatalogUseCase {
  constructor(@Inject(PRODUCT_REPOSITORY) private readonly productRepository: ProductRepository) {}

  execute(): Promise<Product[]> {
    return this.productRepository.findAll();
  }
}