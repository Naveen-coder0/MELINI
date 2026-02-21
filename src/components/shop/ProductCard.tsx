import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag, Eye, Flame } from 'lucide-react';
import { Product } from '@/data/products';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product.inStock) return;
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] || '',
      size: product.sizes?.[Math.floor((product.sizes?.length ?? 0) / 2)] || 'M',
      color: product.colors?.[0]?.name || 'Default',
      slug: product.slug,
    });
    toast({ title: '🛍️ Added to cart', description: `${product.name} has been added to your cart` });
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
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="product-card-image h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground text-sm">No image</div>
          )}

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

          {/* Quick Actions */}
          <div className="absolute right-3 top-3 flex flex-col gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
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

          {/* Add to Cart Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileHover={{ opacity: 1, y: 0 }}
            className="absolute inset-x-3 bottom-3 opacity-0 transition-all duration-300 group-hover:opacity-100"
          >
            <Button
              className="w-full shadow-lg"
              onClick={handleQuickAdd}
              disabled={!product.inStock}
            >
              <ShoppingBag className="mr-2 h-4 w-4" />
              {product.inStock ? 'Quick Add' : 'Out of Stock'}
            </Button>
          </motion.div>
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
            <span className="font-semibold">₹{product.price.toLocaleString()}</span>
            {product.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                ₹{product.originalPrice.toLocaleString()}
              </span>
            )}
            {discount > 0 && (
              <span className="text-xs font-medium text-primary">-{discount}%</span>
            )}
          </div>
          {/* Color Dots */}
          <div className="mt-3 flex items-center gap-1">
            {product.colors.slice(0, 4).map((color) => (
              <div
                key={color.name}
                className="h-4 w-4 rounded-full border border-border"
                style={{ backgroundColor: color.value }}
                title={color.name}
              />
            ))}
            {product.colors.length > 4 && (
              <span className="text-xs text-muted-foreground">+{product.colors.length - 4}</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
