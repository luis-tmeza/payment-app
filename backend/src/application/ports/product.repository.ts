import { Product } from '../../domain/product/product';

export const PRODUCT_REPOSITORY = Symbol('PRODUCT_REPOSITORY');

export interface ProductRepository {
  findFeatured(): Promise<Product | null>;
  reserveStock(productId: string, quantity: number): Promise<Product>;
}
