import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SeasonalCollection = () => {
  return (
    <section className="section-padding overflow-hidden bg-secondary/30">
      <div className="container-custom">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-sm font-medium uppercase tracking-widest text-primary">
              Limited Edition
            </span>
            <h2 className="mt-4 font-display text-3xl font-medium md:text-4xl lg:text-5xl">
              Spring Summer<br />
              <span className="text-gradient">2024 Collection</span>
            </h2>
            <p className="mt-6 text-lg text-muted-foreground">
              Embrace the warmth with our latest collection featuring breathable 
              fabrics, vibrant colors, and timeless designs. Perfect for the 
              season of renewal.
            </p>
            
            <ul className="mt-8 space-y-4">
              {[
                'Organic Cotton & Linen Blends',
                'Sustainable Production',
                'Comfort-First Design',
                'Versatile Styling Options',
              ].map((feature, index) => (
                <motion.li
                  key={feature}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span>{feature}</span>
                </motion.li>
              ))}
            </ul>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="mt-10"
            >
              <Button asChild size="lg" className="btn-premium">
                <Link to="/category/summer">
                  Shop Summer Collection
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* Image Grid */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="grid grid-cols-2 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="space-y-4"
              >
                <div className="aspect-[3/4] overflow-hidden rounded-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&auto=format&fit=crop&q=80"
                    alt="Summer collection 1"
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
                <div className="aspect-square overflow-hidden rounded-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=400&auto=format&fit=crop&q=80"
                    alt="Summer collection 2"
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="mt-8 space-y-4"
              >
                <div className="aspect-square overflow-hidden rounded-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&auto=format&fit=crop&q=80"
                    alt="Summer collection 3"
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
                <div className="aspect-[3/4] overflow-hidden rounded-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=600&auto=format&fit=crop&q=80"
                    alt="Summer collection 4"
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
              </motion.div>
            </div>

            {/* Floating Badge */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -left-4 bottom-20 rounded-full bg-primary px-6 py-3 text-primary-foreground shadow-large"
            >
              <p className="text-sm font-medium">New Arrivals</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default SeasonalCollection;
