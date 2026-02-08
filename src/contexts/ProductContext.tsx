import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Product, products as seedProducts } from '@/data/products';
import { createProduct, editProduct, fetchProducts, removeProduct } from '@/lib/productApi';

interface ProductContextValue {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  refreshProducts: () => Promise<void>;
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  getProductBySlug: (slug: string) => Product | undefined;
  getProductsByCategory: (category: string) => Product[];
  getFeaturedProducts: () => Product[];
}

const ProductContext = createContext<ProductContextValue | undefined>(undefined);

export const ProductProvider = ({ children }: { children: React.ReactNode }) => {
  const [products, setProducts] = useState<Product[]>(seedProducts);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const dbProducts = await fetchProducts();
      setProducts(dbProducts);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Failed to fetch products');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshProducts();
  }, []);

  const value = useMemo<ProductContextValue>(() => ({
    products,
    isLoading,
    error,
    refreshProducts,
    addProduct: async (product) => {
      const createdProduct = await createProduct(product);
      setProducts((prevProducts) => [createdProduct, ...prevProducts]);
    },
    updateProduct: async (updatedProduct) => {
      const product = await editProduct(updatedProduct);
      setProducts((prevProducts) =>
        prevProducts.map((item) => (item.id === product.id ? product : item))
      );
    },
    deleteProduct: async (id) => {
      await removeProduct(id);
      setProducts((prevProducts) => prevProducts.filter((product) => product.id !== id));
    },
    getProductBySlug: (slug) => products.find((product) => product.slug === slug),
    getProductsByCategory: (category) => products.filter((product) => product.category === category),
    getFeaturedProducts: () => products.filter((product) => product.isBestSeller || product.isNew).slice(0, 8),
  }), [error, isLoading, products]);

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within ProductProvider');
  }
  return context;
};
