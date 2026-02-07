import { Product } from '@/data/products';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const parseResponse = async <T>(response: Response): Promise<T> => {
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.error || 'Request failed');
  }
  return payload as T;
};

export const fetchProducts = async (): Promise<Product[]> => {
  const response = await fetch(`${API_BASE_URL}/api/products`);
  const payload = await parseResponse<{ items: Product[] }>(response);
  return payload.items;
};

export const createProduct = async (product: Product): Promise<Product> => {
  const response = await fetch(`${API_BASE_URL}/api/admin/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product),
  });
  return parseResponse<Product>(response);
};

export const editProduct = async (product: Product): Promise<Product> => {
  const response = await fetch(`${API_BASE_URL}/api/admin/products/${product.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product),
  });
  return parseResponse<Product>(response);
};

export const removeProduct = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/admin/products/${id}`, {
    method: 'DELETE',
  });
  await parseResponse<{ success: boolean }>(response);
};
