import { ProductRepository } from '../ports/product.repository';
import { GetProductCatalogUseCase } from './get-product-catalog.use-case';

describe('GetProductCatalogUseCase', () => {
  it('returns all available checkout products', async () => {
    const repository = { findFeatured: jest.fn(), findAll: jest.fn().mockResolvedValue([{ id: 'product-1' }]), reserveStock: jest.fn() } as unknown as jest.Mocked<ProductRepository>;
    await expect(new GetProductCatalogUseCase(repository).execute()).resolves.toEqual([{ id: 'product-1' }]);
  });
});