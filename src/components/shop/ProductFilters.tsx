import { useSearchParams } from 'react-router-dom';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { categories } from '@/data/products';

interface ProductFiltersProps {
  onClose?: () => void;
}

const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const ProductFilters = ({ onClose }: ProductFiltersProps) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedCategory = searchParams.get('category') || 'all';
  const selectedSizes = searchParams.get('sizes')?.split(',').filter(Boolean) || [];
  const minPrice = Number(searchParams.get('minPrice')) || 0;
  const maxPrice = Number(searchParams.get('maxPrice')) || 15000;
  const inStockOnly = searchParams.get('inStock') === 'true';

  const updateParams = (key: string, value: string | null) => {
    if (value === null || value === '' || value === 'all') {
      searchParams.delete(key);
    } else {
      searchParams.set(key, value);
    }
    setSearchParams(searchParams);
  };

  const handleCategoryChange = (category: string) => {
    updateParams('category', category);
  };

  const handleSizeChange = (size: string, checked: boolean) => {
    const newSizes = checked
      ? [...selectedSizes, size]
      : selectedSizes.filter(s => s !== size);
    updateParams('sizes', newSizes.length > 0 ? newSizes.join(',') : null);
  };

  const handlePriceChange = (values: number[]) => {
    updateParams('minPrice', values[0] > 0 ? values[0].toString() : null);
    updateParams('maxPrice', values[1] < 15000 ? values[1].toString() : null);
  };

  const handleInStockChange = (checked: boolean) => {
    updateParams('inStock', checked ? 'true' : null);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  const hasFilters = selectedCategory !== 'all' || selectedSizes.length > 0 || minPrice > 0 || maxPrice < 15000 || inStockOnly;

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div>
        <h3 className="mb-4 font-semibold">Category</h3>
        <div className="space-y-3">
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="radio"
              name="category"
              checked={selectedCategory === 'all'}
              onChange={() => handleCategoryChange('all')}
              className="h-4 w-4 accent-primary"
            />
            <span className="text-sm">All Products</span>
          </label>
          {categories.map((category) => (
            <label key={category.slug} className="flex cursor-pointer items-center gap-3">
              <input
                type="radio"
                name="category"
                checked={selectedCategory === category.slug}
                onChange={() => handleCategoryChange(category.slug)}
                className="h-4 w-4 accent-primary"
              />
              <span className="text-sm">{category.name}</span>
            </label>
          ))}
        </div>
      </div>

      <Separator />

      {/* Size Filter */}
      <div>
        <h3 className="mb-4 font-semibold">Size</h3>
        <div className="grid grid-cols-3 gap-2">
          {sizes.map((size) => (
            <label
              key={size}
              className={`flex cursor-pointer items-center justify-center rounded-lg border py-2 text-sm transition-all ${
                selectedSizes.includes(size)
                  ? 'border-primary bg-primary/10 font-medium'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <Checkbox
                checked={selectedSizes.includes(size)}
                onCheckedChange={(checked) => handleSizeChange(size, checked as boolean)}
                className="sr-only"
              />
              {size}
            </label>
          ))}
        </div>
      </div>

      <Separator />

      {/* Price Filter */}
      <div>
        <h3 className="mb-4 font-semibold">Price Range</h3>
        <Slider
          min={0}
          max={15000}
          step={500}
          value={[minPrice, maxPrice]}
          onValueChange={handlePriceChange}
          className="mb-4"
        />
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>₹{minPrice.toLocaleString()}</span>
          <span>₹{maxPrice.toLocaleString()}</span>
        </div>
      </div>

      <Separator />

      {/* Availability Filter */}
      <div>
        <h3 className="mb-4 font-semibold">Availability</h3>
        <label className="flex cursor-pointer items-center gap-3">
          <Checkbox
            checked={inStockOnly}
            onCheckedChange={(checked) => handleInStockChange(checked as boolean)}
          />
          <Label className="cursor-pointer text-sm">In Stock Only</Label>
        </label>
      </div>

      {/* Clear Filters */}
      {hasFilters && (
        <>
          <Separator />
          <Button variant="outline" className="w-full" onClick={clearFilters}>
            Clear All Filters
          </Button>
        </>
      )}

      {/* Mobile Close Button */}
      {onClose && (
        <Button className="w-full lg:hidden" onClick={onClose}>
          Apply Filters
        </Button>
      )}
    </div>
  );
};

export default ProductFilters;
