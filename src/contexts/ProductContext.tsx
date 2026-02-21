import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Product } from '@/data/products';
import { createProduct, editProduct, fetchProducts, removeProduct } from '@/lib/productApi';

const STORAGE_KEY = 'melini_products';

const loadFromStorage = (): Product[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Product[]) : [];
  } catch {
    return [];
  }
};

const saveToStorage = (products: Product[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  } catch {
    // ignore storage errors
  }
};

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
  const [products, setProductsRaw] = useState<Product[]>(loadFromStorage);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Keep localStorage in sync whenever products change
  const setProducts = (updater: Product[] | ((prev: Product[]) => Product[])) => {
    setProductsRaw((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      saveToStorage(next);
      return next;
    });
  };

  const refreshProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const dbProducts = await fetchProducts();
      // Always trust the DB — localStorage is only a loading cache
      setProducts(dbProducts ?? []);
    } catch {
      // DB unavailable — keep whatever is already loaded (localStorage cache)
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo<ProductContextValue>(() => ({
    products,
    isLoading,
    error,
    refreshProducts,
    addProduct: async (product) => {
      try {
        const createdProduct = await createProduct(product);
        setProducts((prev) => [createdProduct, ...prev]);
      } catch {
        setProducts((prev) => [{ ...product, id: `local-${Date.now()}` }, ...prev]);
      }
    },
    updateProduct: async (updatedProduct) => {
      try {
        const product = await editProduct(updatedProduct);
        setProducts((prev) => prev.map((item) => (item.id === product.id ? product : item)));
      } catch {
        setProducts((prev) => prev.map((item) => (item.id === updatedProduct.id ? updatedProduct : item)));
      }
    },
    deleteProduct: async (id) => {
      try {
        await removeProduct(id);
      } catch {
        // ignore backend error
      }
      setProducts((prev) => prev.filter((product) => product.id !== id));
    },
    getProductBySlug: (slug) => products.find((product) => product.slug === slug),
    getProductsByCategory: (category) => products.filter((product) => product.category === category),
    getFeaturedProducts: () => products.filter((product) => product.isBestSeller || product.isNewProduct).slice(0, 8),
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
