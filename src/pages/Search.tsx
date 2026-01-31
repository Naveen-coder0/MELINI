import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search as SearchIcon, X } from 'lucide-react';
import { products } from '@/data/products';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/shop/ProductCard';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    
    const lowerQuery = query.toLowerCase();
    return products.filter(
      product =>
        product.name.toLowerCase().includes(lowerQuery) ||
        product.description.toLowerCase().includes(lowerQuery) ||
        product.category.toLowerCase().includes(lowerQuery) ||
        product.material.toLowerCase().includes(lowerQuery)
    );
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ q: query });
    }
  };

  const clearSearch = () => {
    setQuery('');
    setSearchParams({});
  };

  return (
    <div className="pt-24">
      <div className="container-custom py-12">
        {/* Search Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-2xl"
        >
          <h1 className="text-center font-display text-3xl font-medium md:text-4xl">
            Search Products
          </h1>
          
          <form onSubmit={handleSearch} className="relative mt-8">
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for products, categories, materials..."
              className="h-14 pl-12 pr-20 text-lg"
            />
            <SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            {query && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={clearSearch}
                className="absolute right-14 top-1/2 -translate-y-1/2"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            <Button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2">
              Search
            </Button>
          </form>
        </motion.div>

        {/* Results */}
        <div className="mt-12">
          {query && (
            <p className="mb-8 text-center text-muted-foreground">
              {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{query}"
            </p>
          )}

          {searchResults.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {searchResults.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          ) : query ? (
            <div className="flex flex-col items-center py-16 text-center">
              <SearchIcon className="h-16 w-16 text-muted-foreground/50" />
              <h2 className="mt-6 font-display text-2xl font-medium">No products found</h2>
              <p className="mt-2 text-muted-foreground">
                Try adjusting your search terms or browse our categories
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center py-16 text-center">
              <SearchIcon className="h-16 w-16 text-muted-foreground/50" />
              <h2 className="mt-6 font-display text-2xl font-medium">Start your search</h2>
              <p className="mt-2 text-muted-foreground">
                Discover our collection of premium comfort wear
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;
