import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const BrandStory = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

  return (
    <section ref={containerRef} className="relative overflow-hidden py-24 md:py-32">
      {/* Background */}
      <div className="absolute inset-0 bg-brand-charcoal" />
      
      {/* Decorative Elements */}
      <motion.div
        style={{ y }}
        className="absolute -left-20 top-20 h-60 w-60 rounded-full bg-brand-rose/10 blur-3xl"
      />
      <motion.div
        style={{ y: useTransform(y, v => -v) }}
        className="absolute -right-20 bottom-20 h-80 w-80 rounded-full bg-brand-gold/10 blur-3xl"
      />

      <div className="container-custom relative z-10">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Images */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
              <img
                src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&auto=format&fit=crop&q=80"
                alt="Melini craftsmanship"
                className="h-full w-full object-cover"
              />
            </div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="absolute -bottom-6 -right-6 aspect-square w-48 overflow-hidden rounded-xl border-4 border-brand-charcoal md:w-64"
            >
              <img
                src="https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400&auto=format&fit=crop&q=80"
                alt="Behind the scenes"
                className="h-full w-full object-cover"
              />
            </motion.div>
          </motion.div>

          {/* Content */}
          <motion.div style={{ opacity }} className="text-primary-foreground">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-sm font-medium uppercase tracking-widest text-brand-rose"
            >
              Our Story
            </motion.span>
            
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="mt-4 font-display text-3xl font-medium md:text-4xl lg:text-5xl"
            >
              Crafting Comfort Since 2018
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="mt-6 text-lg leading-relaxed text-primary-foreground/80"
            >
              Born from a passion for quality and a love for timeless style, 
              Melini represents the perfect blend of traditional craftsmanship 
              and modern elegance. Every piece we create tells a story of 
              dedication, sustainability, and unwavering commitment to your comfort.
            </motion.p>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="mt-4 text-lg leading-relaxed text-primary-foreground/80"
            >
              We believe that true luxury lies in comfort. Our artisans pour 
              their hearts into every stitch, ensuring that each garment not 
              only looks beautiful but feels like a second skin.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="mt-8"
            >
              <Button asChild variant="secondary" size="lg">
                <Link to="/about">
                  Learn More About Us
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default BrandStory;
