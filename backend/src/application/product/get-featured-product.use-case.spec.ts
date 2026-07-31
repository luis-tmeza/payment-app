import { ProductRepository } from '../ports/product.repository';
import { GetFeaturedProductUseCase } from './get-featured-product.use-case';

describe('GetFeaturedProductUseCase', () => {
  const repository: jest.Mocked<ProductRepository> = {
    findFeatured: jest.fn(),
    findAll: jest.fn(),
    reserveStock: jest.fn(),
  };
  const useCase = new GetFeaturedProductUseCase(repository);

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('returns the available product', async () => {
    repository.findFeatured.mockResolvedValue({
      id: 'product-1',
      name: 'Headphones',
      description: 'Noise cancelling headphones',
      priceCents: 15990000,
      stock: 3,
      imageUrl: null,
    });

    const result = await useCase.execute();

    expect(result).toEqual({
      ok: true,
      value: expect.objectContaining({ id: 'product-1', stock: 3 }),
    });
  });

  it('returns PRODUCT_NOT_FOUND when no product has stock', async () => {
    repository.findFeatured.mockResolvedValue(null);

    const result = await useCase.execute();

    expect(result).toEqual({ ok: false, error: 'PRODUCT_NOT_FOUND' });
  });
});