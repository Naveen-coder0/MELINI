import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Instagram, Facebook, Twitter, Mail, MapPin, Phone } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const footerLinks = {
  shop: [
    { name: 'All Products', path: '/shop' },
    { name: 'Summer Collection', path: '/category/summer' },
    { name: 'Winter Collection', path: '/category/winter' },
    { name: 'New Arrivals', path: '/shop?sort=newest' },
    { name: 'Best Sellers', path: '/shop?sort=best-selling' },
  ],
  company: [
    { name: 'About Us', path: '/about' },
    { name: 'Contact', path: '/contact' },
    { name: 'Careers', path: '#' },
    { name: 'Press', path: '#' },
  ],
  help: [
    { name: 'FAQs', path: '#' },
    { name: 'Shipping & Returns', path: '#' },
    { name: 'Size Guide', path: '#' },
    { name: 'Track Order', path: '#' },
  ],
};

const socialLinks = [
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Facebook, href: '#', label: 'Facebook' },
  { icon: Twitter, href: '#', label: 'Twitter' },
];

const Footer = () => {
  return (
    <footer className="border-t bg-secondary/30">
      {/* Newsletter Section */}
      <div className="border-b">
        <div className="container-custom py-16">
          <div className="mx-auto max-w-2xl text-center">
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-display text-3xl font-medium md:text-4xl"
            >
              Join the Melini Family
            </motion.h3>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="mt-4 text-muted-foreground"
            >
              Subscribe for exclusive offers, new arrivals, and style inspiration delivered to your inbox.
            </motion.p>
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="mt-8 flex flex-col gap-3 sm:flex-row"
              onSubmit={(e) => e.preventDefault()}
            >
              <Input
                type="email"
                placeholder="Enter your email"
                className="flex-1 bg-background"
              />
              <Button className="btn-premium px-8">
                Subscribe
              </Button>
            </motion.form>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container-custom py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="font-display text-2xl font-semibold tracking-wide">
              MELINI
            </Link>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              Crafting premium comfort wear that blends elegance with everyday luxury. 
              Experience the art of conscious fashion.
            </p>
            <div className="mt-6 flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border transition-all hover:border-primary hover:bg-primary hover:text-primary-foreground"
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h4 className="font-semibold uppercase tracking-wider">Shop</h4>
            <ul className="mt-4 space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-semibold uppercase tracking-wider">Company</h4>
            <ul className="mt-4 space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help Links */}
          <div>
            <h4 className="font-semibold uppercase tracking-wider">Help</h4>
            <ul className="mt-4 space-y-3">
              {footerLinks.help.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-12 flex flex-wrap gap-6 border-t pt-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>Mumbai, India</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            <span>+91 9988324455</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <span>hello@melini.in</span>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t">
        <div className="container-custom flex flex-col items-center justify-between gap-4 py-6 text-sm text-muted-foreground md:flex-row">
          <p>© 2025 Melini India. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="#" className="hover:text-foreground">Privacy Policy</Link>
            <Link to="#" className="hover:text-foreground">Terms of Service</Link>
            <Link to="#" className="hover:text-foreground">Refund Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
