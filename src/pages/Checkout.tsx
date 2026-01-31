import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, CreditCard, Truck, CheckCircle } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';

const Checkout = () => {
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState<'details' | 'payment' | 'success'>('details');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const shipping = totalPrice > 2000 ? 0 : 199;
  const total = totalPrice + shipping;

  const handleSubmitOrder = async () => {
    setIsSubmitting(true);
    
    // Simulate order submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setStep('success');
    clearCart();
    
    toast({
      title: 'Order placed successfully!',
      description: 'You will receive a confirmation email shortly.',
    });
  };

  if (items.length === 0 && step !== 'success') {
    navigate('/cart');
    return null;
  }

  if (step === 'success') {
    return (
      <div className="flex min-h-screen items-center justify-center pt-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
          >
            <CheckCircle className="mx-auto h-20 w-20 text-primary" />
          </motion.div>
          <h1 className="mt-6 font-display text-3xl font-medium">Order Confirmed!</h1>
          <p className="mt-4 text-muted-foreground">
            Thank you for your order. We'll send you a confirmation email with order details.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Order #MELINI{Date.now().toString().slice(-8)}
          </p>
          <Button asChild className="mt-8">
            <Link to="/shop">Continue Shopping</Link>
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-24">
      <div className="container-custom py-12">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/cart">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Cart
          </Link>
        </Button>

        <div className="grid gap-12 lg:grid-cols-2">
          {/* Checkout Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div>
              <h1 className="font-display text-3xl font-medium">Checkout</h1>
              <p className="mt-2 text-muted-foreground">Complete your order</p>
            </div>

            {/* Contact Info */}
            <div className="space-y-4 rounded-xl border bg-card p-6">
              <h2 className="flex items-center gap-2 font-semibold">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  1
                </span>
                Contact Information
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" placeholder="John" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" placeholder="Doe" className="mt-1" />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="john@example.com" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" type="tel" placeholder="+91 98765 43210" className="mt-1" />
              </div>
            </div>

            {/* Shipping Address */}
            <div className="space-y-4 rounded-xl border bg-card p-6">
              <h2 className="flex items-center gap-2 font-semibold">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  2
                </span>
                Shipping Address
              </h2>
              <div>
                <Label htmlFor="address">Street Address</Label>
                <Input id="address" placeholder="123 Main Street" className="mt-1" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input id="city" placeholder="Mumbai" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input id="state" placeholder="Maharashtra" className="mt-1" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="pincode">PIN Code</Label>
                  <Input id="pincode" placeholder="400001" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input id="country" value="India" disabled className="mt-1" />
                </div>
              </div>
            </div>

            {/* Shipping Method */}
            <div className="space-y-4 rounded-xl border bg-card p-6">
              <h2 className="flex items-center gap-2 font-semibold">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  3
                </span>
                Shipping Method
              </h2>
              <RadioGroup defaultValue="standard" className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value="standard" id="standard" />
                    <Label htmlFor="standard" className="cursor-pointer">
                      <div className="font-medium">Standard Delivery</div>
                      <div className="text-sm text-muted-foreground">5-7 business days</div>
                    </Label>
                  </div>
                  <span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value="express" id="express" />
                    <Label htmlFor="express" className="cursor-pointer">
                      <div className="font-medium">Express Delivery</div>
                      <div className="text-sm text-muted-foreground">2-3 business days</div>
                    </Label>
                  </div>
                  <span>₹299</span>
                </div>
              </RadioGroup>
            </div>

            {/* Payment (Placeholder) */}
            <div className="space-y-4 rounded-xl border bg-card p-6">
              <h2 className="flex items-center gap-2 font-semibold">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  4
                </span>
                Payment Method
              </h2>
              <div className="flex items-center gap-4 rounded-lg border border-dashed p-6 text-center">
                <CreditCard className="h-8 w-8 text-muted-foreground" />
                <div className="text-left">
                  <p className="font-medium">Payment integration coming soon</p>
                  <p className="text-sm text-muted-foreground">
                    Razorpay will be integrated for secure payments
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="sticky top-28 space-y-6 rounded-xl border bg-card p-6">
              <h2 className="font-display text-xl font-medium">Order Summary</h2>

              {/* Items */}
              <div className="max-h-64 space-y-4 overflow-y-auto">
                {items.map((item) => (
                  <div key={`${item.id}-${item.size}`} className="flex gap-3">
                    <div className="h-16 w-12 shrink-0 overflow-hidden rounded-lg bg-secondary">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.size} • {item.color} • Qty: {item.quantity}
                      </p>
                    </div>
                    <span className="text-sm font-medium">
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Totals */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span>Included</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>
              </div>

              <Button
                onClick={handleSubmitOrder}
                disabled={isSubmitting}
                className="btn-premium w-full py-6"
              >
                {isSubmitting ? 'Processing...' : 'Place Order'}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                By placing this order, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
