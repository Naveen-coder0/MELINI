import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, Grid3X3, LayoutList } from 'lucide-react';
import { Product } from '@/data/products';
import { useProducts } from '@/contexts/ProductContext';
import ProductCard from '@/components/shop/ProductCard';
import ProductFilters from '@/components/shop/ProductFilters';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

type SortOption = 'newest' | 'price-low' | 'price-high' | 'best-selling';

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, isLoading } = useProducts();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const sortOption = (searchParams.get('sort') as SortOption) || 'newest';
  const selectedCategory = searchParams.get('category') || 'all';
  const selectedSizes = searchParams.get('sizes')?.split(',').filter(Boolean) || [];
  const priceRange = {
    min: Number(searchParams.get('minPrice')) || 0,
    max: Number(searchParams.get('maxPrice')) || 15000,
  };
  const inStockOnly = searchParams.get('inStock') === 'true';

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter(p => p.category === selectedCategory);
    }

    // Size filter
    if (selectedSizes.length > 0) {
      result = result.filter(p => selectedSizes.some(size => p.sizes.includes(size)));
    }

    // Price filter
    result = result.filter(p => p.price >= priceRange.min && p.price <= priceRange.max);

    // Stock filter
    if (inStockOnly) {
      result = result.filter(p => p.inStock);
    }

    // Sorting
    switch (sortOption) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'best-selling':
        result.sort((a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0));
        break;
      case 'newest':
      default:
        result.sort((a, b) => (b.isNewProduct ? 1 : 0) - (a.isNewProduct ? 1 : 0));
    }

    return result;
  }, [products, selectedCategory, selectedSizes, priceRange, inStockOnly, sortOption]);

  const handleSortChange = (value: SortOption) => {
    searchParams.set('sort', value);
    setSearchParams(searchParams);
  };

  return (
    <div className="pt-24">
      {/* Hero Banner */}
      <section className="relative h-64 overflow-hidden bg-secondary md:h-80">
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-transparent" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="container-custom relative z-10 flex h-full flex-col justify-center"
        >
          <h1 className="font-display text-4xl font-medium md:text-5xl lg:text-6xl">
            Shop Collection
          </h1>
          <p className="mt-4 max-w-xl text-lg text-muted-foreground">
            Discover our curated selection of premium comfort wear
          </p>
        </motion.div>
      </section>

      <div className="container-custom py-12">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Desktop Filters */}
          <aside className="hidden w-64 shrink-0 lg:block">
            <ProductFilters />
          </aside>

          {/* Products Section */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {/* Mobile Filter Button */}
                <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="lg:hidden">
                      <SlidersHorizontal className="mr-2 h-4 w-4" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80 overflow-y-auto">
                    <SheetHeader>
                      <SheetTitle>Filters</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      <ProductFilters onClose={() => setIsFilterOpen(false)} />
                    </div>
                  </SheetContent>
                </Sheet>

                <span className="text-sm text-muted-foreground">
                  {filteredProducts.length} products
                </span>
              </div>

              <div className="flex items-center gap-4">
                <Select value={sortOption} onValueChange={(value) => handleSortChange(value as SortOption)}>
                  <SelectTrigger className="w-44">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="best-selling">Best Selling</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                  </SelectContent>
                </Select>

                <div className="hidden items-center gap-1 md:flex">
                  <Button
                    variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                    size="icon"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                    size="icon"
                    onClick={() => setViewMode('list')}
                  >
                    <LayoutList className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-24">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <p className="text-lg font-medium">No products found</p>
                <p className="mt-2 text-sm text-muted-foreground">Try adjusting your filters</p>
              </div>
            ) : (
              <div
                className={`grid gap-6 ${viewMode === 'grid'
                    ? 'sm:grid-cols-2 lg:grid-cols-3'
                    : 'grid-cols-1'
                  }`}
              >
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <ProductCard product={product} variant={viewMode} />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;
