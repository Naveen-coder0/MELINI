import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, X, Minus, Plus, Trash2 } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';

interface CartDrawerProps {
    open: boolean;
    onClose: () => void;
}

const CartDrawer = ({ open, onClose }: CartDrawerProps) => {
    const { items, totalItems, totalPrice, removeItem, updateQuantity } = useCart();

    return (
        <Sheet open={open} onOpenChange={onClose}>
            <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
                <SheetHeader className="border-b pb-4">
                    <SheetTitle className="flex items-center gap-2">
                        <ShoppingBag className="h-5 w-5 text-primary" />
                        Cart
                        {totalItems > 0 && (
                            <span className="ml-1 rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">{totalItems}</span>
                        )}
                    </SheetTitle>
                </SheetHeader>

                {items.length === 0 ? (
                    <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
                        <ShoppingBag className="h-16 w-16 text-muted-foreground/20" />
                        <p className="font-display text-lg">Your cart is empty</p>
                        <p className="text-sm text-muted-foreground">Add some beautiful pieces to get started</p>
                        <Button asChild className="mt-2" onClick={onClose}>
                            <Link to="/shop">Shop Now</Link>
                        </Button>
                    </div>
                ) : (
                    <>
                        {/* Items */}
                        <div className="flex-1 overflow-y-auto py-4">
                            <ul className="space-y-4">
                                {items.map((item) => (
                                    <motion.li
                                        key={`${item.id}-${item.size}-${item.color}`}
                                        layout
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="flex gap-4 rounded-xl border p-3"
                                    >
                                        <Link to={`/product/${item.slug}`} onClick={onClose} className="h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-secondary">
                                            <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                                        </Link>
                                        <div className="flex flex-1 flex-col justify-between">
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <Link to={`/product/${item.slug}`} onClick={onClose} className="text-sm font-medium hover:text-primary transition-colors line-clamp-1">{item.name}</Link>
                                                    <p className="text-xs text-muted-foreground mt-0.5">{item.size} · {item.color}</p>
                                                </div>
                                                <button onClick={() => removeItem(item.id, item.size)} className="shrink-0 rounded p-1 text-muted-foreground hover:text-destructive transition-colors">
                                                    <X className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-1 rounded-lg border">
                                                    <button onClick={() => updateQuantity(item.id, item.size, Math.max(1, item.quantity - 1))} className="flex h-7 w-7 items-center justify-center rounded-l-lg hover:bg-muted transition-colors">
                                                        <Minus className="h-3 w-3" />
                                                    </button>
                                                    <span className="w-7 text-center text-xs font-medium">{item.quantity}</span>
                                                    <button onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)} className="flex h-7 w-7 items-center justify-center rounded-r-lg hover:bg-muted transition-colors">
                                                        <Plus className="h-3 w-3" />
                                                    </button>
                                                </div>
                                                <span className="text-sm font-semibold">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                                            </div>
                                        </div>
                                    </motion.li>
                                ))}
                            </ul>
                        </div>

                        {/* Footer */}
                        <div className="border-t pt-4 space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span className="font-semibold text-lg">₹{totalPrice.toLocaleString('en-IN')}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">Shipping and taxes calculated at checkout</p>
                            <div className="grid grid-cols-2 gap-2">
                                <Button variant="outline" asChild onClick={onClose}>
                                    <Link to="/cart">View Cart</Link>
                                </Button>
                                <Button asChild className="btn-premium" onClick={onClose}>
                                    <Link to="/checkout">Checkout</Link>
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </SheetContent>
        </Sheet>
    );
};

export default CartDrawer;
