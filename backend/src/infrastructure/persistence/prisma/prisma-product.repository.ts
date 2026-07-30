import { Injectable } from '@nestjs/common';
import { ProductRepository } from '../../../application/ports/product.repository';
import { Product } from '../../../domain/product/product';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class PrismaProductRepository implements ProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findFeatured(): Promise<Product | null> {
    return this.prisma.product.findFirst({
      where: { stock: { gt: 0 } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async reserveStock(productId: string, quantity: number): Promise<Product> {
    return this.prisma.product.update({
      where: { id: productId },
      data: { stock: { decrement: quantity } },
    });
  }
}