import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingBag, Eye, Flame, Check, X } from 'lucide-react';
import { Product } from '@/data/products';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { useWishlist } from '@/contexts/WishlistContext';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  variant?: 'grid' | 'list';
}
const ProductCard = ({ product, variant = 'grid' }: ProductCardProps) => {
  const { addItem } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const wishlisted = isWishlisted(product.id);

  const [hoveredImage, setHoveredImage] = useState<string | null>(null);
  const [showSizePicker, setShowSizePicker] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Calculate min price from sizePricing
  const minPrice = useMemo(() => {
    if (product.sizePricing && product.sizePricing.length > 0) {
      return Math.min(...product.sizePricing.map(sp => sp.price));
    }
    return product.price;
  }, [product.sizePricing, product.price]);

  const hasVariablePricing = product.sizePricing && product.sizePricing.length > 1 &&
    new Set(product.sizePricing.map(sp => sp.price)).size > 1;

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - minPrice) / product.originalPrice) * 100)
    : 0;

  const displayImage = hoveredImage || (product.colors?.[0]?.images?.[0] || product.images?.[0] || '');

  const handleQuickAdd = (e: React.MouseEvent, size?: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product.inStock) return;

    if (!size && !showSizePicker) {
      setShowSizePicker(true);
      return;
    }

    const selectedSize = size || 'M';
    const sizePrice = product.sizePricing?.find(sp => sp.size === selectedSize)?.price || product.price;

    addItem({
      id: product.id,
      name: product.name,
      price: sizePrice,
      image: displayImage,
      size: selectedSize,
      color: product.colors?.[0]?.name || 'Default',
      slug: product.slug,
    });

    toast({ title: '🛍️ Added to cart', description: `${product.name} (${selectedSize}) added` });
    setShowSizePicker(false);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
    toast({
      title: wishlisted ? '💔 Removed from wishlist' : '💛 Added to wishlist',
      description: product.name,
    });
  };

  const lowStock = (product as any).stockCount !== undefined && (product as any).stockCount < 5 && (product as any).stockCount > 0;

  if (variant === 'list') {
    return (
      <motion.div
        whileHover={{ y: -2 }}
        className="group flex gap-6 rounded-xl border bg-card p-4 transition-shadow hover:shadow-medium"
      >
        <Link
          to={`/product/${product.slug}`}
          className="relative h-40 w-32 shrink-0 overflow-hidden rounded-lg bg-secondary"
        >
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>
        <div className="flex flex-1 flex-col justify-between py-2">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              {product.category.replace('-', ' ')}
            </p>
            <Link
              to={`/product/${product.slug}`}
              className="mt-1 font-display text-lg font-medium hover:text-primary"
            >
              {product.name}
            </Link>
            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
              {product.shortDescription}
            </p>
            {lowStock && (
              <p className="mt-1 flex items-center gap-1 text-xs font-medium text-orange-500">
                <Flame className="h-3 w-3" /> Only {(product as any).stockCount} left!
              </p>
            )}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-semibold">₹{product.price.toLocaleString()}</span>
              {product.originalPrice && (
                <span className="text-sm text-muted-foreground line-through">
                  ₹{product.originalPrice.toLocaleString()}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={handleWishlist} className={cn(wishlisted && 'text-rose-500 border-rose-500')}>
                <Heart className={cn('mr-1 h-4 w-4', wishlisted && 'fill-rose-500')} />
              </Button>
              <Button size="sm" variant="outline" onClick={handleQuickAdd} disabled={!product.inStock}>
                <ShoppingBag className="mr-2 h-4 w-4" />
                {product.inStock ? 'Add to Cart' : 'Out of Stock'}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div whileHover={{ y: -4 }} className="product-card group">
      <Link to={`/product/${product.slug}`} className="block">
        {/* Image Container */}
        <div className="relative aspect-[3/4] overflow-hidden rounded-t-xl bg-secondary">
          {!imageLoaded && (
            <Skeleton className="absolute inset-0 h-full w-full" />
          )}
          {displayImage ? (
            <motion.img
              key={displayImage}
              src={displayImage}
              alt={product.name}
              onLoad={() => setImageLoaded(true)}
              initial={{ opacity: 0 }}
              animate={{ opacity: imageLoaded ? 1 : 0 }}
              transition={{ duration: 0.3 }}
              className="product-card-image h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground text-sm">No image</div>
          )}

          {/* Quick Actions */}
          <div className="absolute right-3 top-3 z-10 flex flex-col gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <Button
              size="icon"
              variant="secondary"
              className={cn('h-9 w-9 rounded-full shadow-md transition-colors', wishlisted && 'bg-rose-50 hover:bg-rose-100')}
              onClick={handleWishlist}
            >
              <Heart className={cn('h-4 w-4', wishlisted && 'fill-rose-500 stroke-rose-500')} />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className="h-9 w-9 rounded-full shadow-md"
              onClick={(e) => { e.preventDefault(); navigate(`/product/${product.slug}`); }}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>

          {/* Hover Image */}
          {product.images?.[1] && (
            <img
              src={product.images[1]}
              alt={`${product.name} alternate`}
              className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            />
          )}

          {/* Badges */}
          <div className="absolute left-3 top-3 flex flex-col gap-2">
            {product.isNewProduct && (
              <Badge className="bg-primary text-primary-foreground">New</Badge>
            )}
            {product.isBestSeller && (
              <Badge variant="secondary">Best Seller</Badge>
            )}
            {discount > 0 && (
              <Badge className="bg-destructive text-destructive-foreground">-{discount}%</Badge>
            )}
            {!product.inStock && (
              <Badge variant="outline" className="bg-background">Out of Stock</Badge>
            )}
            {lowStock && (
              <Badge className="bg-orange-500 text-white flex items-center gap-0.5">
                <Flame className="h-2.5 w-2.5" /> Only {(product as any).stockCount} left
              </Badge>
            )}
          </div>

          {/* Add to Cart Button or Size Picker */}
          <AnimatePresence mode="wait">
            {!showSizePicker ? (
              <motion.div
                key="quick-add"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute inset-x-3 bottom-3 z-10 hidden group-hover:block"
              >
                <Button
                  className="w-full shadow-lg h-9 text-xs"
                  onClick={handleQuickAdd}
                  disabled={!product.inStock}
                >
                  <ShoppingBag className="mr-1.5 h-3.5 w-3.5" />
                  {product.inStock ? 'Quick Add' : 'Out of Stock'}
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="size-picker"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute inset-x-2 bottom-3 z-20 rounded-lg bg-background/95 p-2 shadow-xl backdrop-blur-sm border"
                onClick={(e) => e.preventDefault()}
              >
                <div className="mb-2 flex items-center justify-between px-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Select Size</span>
                  <button onClick={() => setShowSizePicker(false)} className="text-muted-foreground hover:text-foreground"><X className="h-3 w-3" /></button>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={(e) => handleQuickAdd(e, size)}
                      className="flex h-8 items-center justify-center rounded border bg-muted/50 text-[10px] font-bold transition-all hover:bg-primary hover:text-white"
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Product Info */}
        <div className="rounded-b-xl bg-card p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            {product.category.replace('-', ' ')}
          </p>
          <h3 className="mt-1 font-display text-base font-medium line-clamp-1 transition-colors group-hover:text-primary">
            {product.name}
          </h3>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-semibold">{hasVariablePricing && 'From '}₹{minPrice.toLocaleString()}</span>
            {product.originalPrice && product.originalPrice > minPrice && (
              <span className="text-sm text-muted-foreground line-through">
                ₹{product.originalPrice.toLocaleString()}
              </span>
            )}
            {discount > 0 && (
              <span className="text-xs font-medium text-primary">-{discount}%</span>
            )}
          </div>
          {/* Color Dots with Swatch Hover */}
          <div className="mt-3 flex items-center gap-1.5">
            {product.colors.slice(0, 5).map((color, idx) => (
              <div
                key={color.name}
                onMouseEnter={() => color.images?.[0] && setHoveredImage(color.images[0])}
                onMouseLeave={() => setHoveredImage(null)}
                className={cn(
                  "h-5 w-5 rounded-full border border-border cursor-pointer transition-transform hover:scale-110 flex items-center justify-center",
                  hoveredImage === color.images?.[0] && "ring-1 ring-primary ring-offset-1"
                )}
                style={{ backgroundColor: color.value }}
                title={color.name}
              >
                {hoveredImage === color.images?.[0] && <Check className="h-2.5 w-2.5 text-white mix-blend-difference" />}
              </div>
            ))}
            {product.colors.length > 5 && (
              <span className="text-[10px] font-medium text-muted-foreground ml-0.5">+{product.colors.length - 5}</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
