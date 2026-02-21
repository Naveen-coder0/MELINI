import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShoppingBag, Menu, X, Heart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import CartDrawer from '@/components/CartDrawer';

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Shop', path: '/shop' },
  { name: 'Summer Wear', path: '/category/summer' },
  { name: 'Semi-Winter', path: '/category/semi-winter' },
  { name: 'Winter Wear', path: '/category/winter' },
  { name: 'About', path: '/about' },
  { name: 'Contact', path: '/contact' },
];

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const location = useLocation();
  const { totalItems } = useCart();
  const { count: wishlistCount } = useWishlist();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  return (
    <>
      <CartDrawer open={isCartOpen} onClose={() => setIsCartOpen(false)} />

      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={cn(
          'fixed left-0 right-0 top-0 z-50 transition-all duration-500',
          isScrolled ? 'glass border-b py-3' : 'bg-transparent py-5'
        )}
      >
        <div className="container-custom flex items-center justify-between">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center">
            <motion.span
              className="font-display text-2xl font-semibold tracking-wide md:text-3xl"
              whileHover={{ scale: 1.02 }}
            >
              MELINI
            </motion.span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-8 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  'link-underline text-sm font-medium uppercase tracking-wider transition-colors',
                  location.pathname === link.path
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Right Icons */}
          <div className="flex items-center gap-2 md:gap-4">
            <Link to="/search" className="p-2 transition-colors hover:text-primary">
              <Search className="h-5 w-5" />
            </Link>

            {/* Wishlist */}
            <Link to="/shop" className="relative hidden p-2 transition-colors hover:text-primary md:block" title="Wishlist">
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white"
                >
                  {wishlistCount}
                </motion.span>
              )}
            </Link>

            {/* Cart — opens drawer */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 transition-colors hover:text-primary"
              aria-label="Open cart"
            >
              <ShoppingBag className="h-5 w-5" />
              {totalItems > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground"
                >
                  {totalItems}
                </motion.span>
              )}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 w-80 bg-background p-6 shadow-large lg:hidden"
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-2xl font-semibold">MELINI</span>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2">
                  <X className="h-6 w-6" />
                </button>
              </div>
              <nav className="mt-10 flex flex-col gap-4">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.path}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      to={link.path}
                      className={cn(
                        'block py-2 text-lg font-medium transition-colors',
                        location.pathname === link.path
                          ? 'text-primary'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                ))}
              </nav>
              <div className="mt-10 flex gap-4">
                <Button variant="outline" size="icon" className="relative" onClick={() => { setIsMobileMenuOpen(false); setIsCartOpen(true); }}>
                  <Heart className="h-5 w-5" />
                  {wishlistCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">{wishlistCount}</span>
                  )}
                </Button>
                <Button variant="outline" size="icon" className="relative" onClick={() => { setIsMobileMenuOpen(false); setIsCartOpen(true); }}>
                  <ShoppingBag className="h-5 w-5" />
                  {totalItems > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">{totalItems}</span>
                  )}
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
