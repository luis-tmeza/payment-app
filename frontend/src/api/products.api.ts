import { http } from './http';
import { Product } from '../types/product';

export const getProducts = async (): Promise<Product[]> => {
  const { data } = await http.get<Product[]>('/products');
  return data;
};

export const getFeaturedProduct = async (): Promise<Product> => {
  const { data } = await http.get<Product>('/products/featured');
  return data;
};