import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, CreditCard, CheckCircle } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const Checkout = () => {
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [step, setStep] = useState<'details' | 'payment' | 'success'>('details');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const shipping = totalPrice > 0 ? 0 : 199;
  const total = totalPrice + shipping;

  // ✅ WhatsApp message
  const sendOrderToWhatsapp = (paymentId: string) => {
    const firstName = (document.getElementById('firstName') as HTMLInputElement)?.value;
    const lastName = (document.getElementById('lastName') as HTMLInputElement)?.value;
    const phone = (document.getElementById('phone') as HTMLInputElement)?.value;

    const address = (document.getElementById('address') as HTMLInputElement)?.value;
    const city = (document.getElementById('city') as HTMLInputElement)?.value;
    const state = (document.getElementById('state') as HTMLInputElement)?.value;
    const pincode = (document.getElementById('pincode') as HTMLInputElement)?.value;

    const productsText = items
      .map(
        (item, i) =>
          `${i + 1}. ${item.name}
Size: ${item.size}
Quantity: ${item.quantity}
Image: ${item.image}`
      )
      .join('\n\n');

    const message = `
🛍️ New Order – MELINI

Name: ${firstName} ${lastName}
Phone: ${phone}

Products:
${productsText}

Address:
${address}, ${city}, ${state} - ${pincode}

Total: ₹${total}

Payment ID:
${paymentId}
`;

    const shopWhatsappNumber = '919467269782';

    const url =
      'https://wa.me/' +
      shopWhatsappNumber +
      '?text=' +
      encodeURIComponent(message);

    window.location.href = url;
  };

  // ✅ Razorpay payment
  const handleSubmitOrder = async () => {
    try {
      setIsSubmitting(true);

      const res = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: total })
      });

      const order = await res.json();

      if (!window.Razorpay) {
        alert('Razorpay SDK not loaded');
        setIsSubmitting(false);
        return;
      }

      const firstName = (document.getElementById('firstName') as HTMLInputElement)?.value;
      const lastName = (document.getElementById('lastName') as HTMLInputElement)?.value;
      const email = (document.getElementById('email') as HTMLInputElement)?.value;
      const phone = (document.getElementById('phone') as HTMLInputElement)?.value;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY,
        amount: order.amount,
        currency: 'INR',
        name: 'MELINI',
        description: 'MELINI Order Payment',
        order_id: order.id,

        prefill: {
          name: `${firstName} ${lastName}`,
          email,
          contact: phone
        },

        handler: (response: any) => {
          sendOrderToWhatsapp(response.razorpay_payment_id);

          setStep('success');
          clearCart();

          toast({
            title: 'Payment successful!',
            description: `Payment ID: ${response.razorpay_payment_id}`
          });
        },

        // ✅ ADDED (popup close / cancel)
        modal: {
          ondismiss: () => {
            setIsSubmitting(false);

            toast({
              title: 'Payment cancelled ⚠️',
              description: 'You closed the payment window.'
            });
          }
        },

        theme: { color: '#000000' }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

      // ✅ Payment failed message
      rzp.on('payment.failed', (res: any) => {
        setIsSubmitting(false);
        toast({
          title: 'Payment failed ❌',
          description: res?.error?.description || 'Please try again'
        });
      });

    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
      toast({
        title: 'Error',
        description: 'Unable to start payment'
      });
    }
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
            Thank you for your order.
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

          {/* LEFT */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div>
              <h1 className="font-display text-3xl font-medium">Checkout</h1>
              <p className="mt-2 text-muted-foreground">Complete your order</p>
            </div>

            {/* Contact */}
            <div className="space-y-4 rounded-xl border bg-card p-6">
              <h2 className="flex items-center gap-2 font-semibold">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">1</span>
                Contact Information
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" className="mt-1" />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" className="mt-1" />
              </div>

              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" type="tel" className="mt-1" />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-4 rounded-xl border bg-card p-6">
              <h2 className="flex items-center gap-2 font-semibold">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">2</span>
                Shipping Address
              </h2>

              <div>
                <Label htmlFor="address">Street Address</Label>
                <Input id="address" className="mt-1" />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input id="city" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input id="state" className="mt-1" />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="pincode">PIN Code</Label>
                  <Input id="pincode" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input id="country" value="India" disabled className="mt-1" />
                </div>
              </div>
            </div>

            {/* Shipping */}
            <div className="space-y-4 rounded-xl border bg-card p-6">
              <h2 className="flex items-center gap-2 font-semibold">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">3</span>
                Shipping Method
              </h2>

              <RadioGroup defaultValue="standard" className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value="standard" id="standard" />
                    <Label htmlFor="standard">
                      <div className="font-medium">Standard Delivery</div>
                      <div className="text-sm text-muted-foreground">5-7 business days</div>
                    </Label>
                  </div>
                  <span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
                </div>
              </RadioGroup>
            </div>

            {/* Payment */}
            <div className="space-y-4 rounded-xl border bg-card p-6">
              <h2 className="flex items-center gap-2 font-semibold">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">4</span>
                Payment Method
              </h2>

              <div className="flex items-center gap-4 rounded-lg border border-dashed p-6">
                <CreditCard className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="font-medium">Razorpay Secure Payment</p>
                  <p className="text-sm text-muted-foreground">
                    Pay using UPI, Cards, Netbanking & Wallets
                  </p>
                </div>
              </div>
            </div>

          </motion.div>

          {/* RIGHT */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="sticky top-28 space-y-6 rounded-xl border bg-card p-6">

              <h2 className="font-display text-xl font-medium">Order Summary</h2>

              <div className="max-h-64 space-y-4 overflow-y-auto">
                {items.map((item) => (
                  <div key={`${item.id}-${item.size}`} className="flex gap-3">
                    <div className="h-16 w-12 overflow-hidden rounded-lg bg-secondary">
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.size} • Qty: {item.quantity}
                      </p>
                    </div>
                    <span className="text-sm font-medium">
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
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

            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default Checkout;
