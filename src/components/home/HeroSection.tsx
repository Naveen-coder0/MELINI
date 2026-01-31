import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, ChevronDown, Sparkles, Star, Heart, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import heroProduct from '@/assets/hero-product.png';

const FloatingParticle = ({ delay, duration, x, y }: { delay: number; duration: number; x: string; y: string }) => (
  <motion.div
    className="absolute h-1 w-1 rounded-full bg-primary/30"
    style={{ left: x, top: y }}
    animate={{
      y: [0, -30, 0],
      opacity: [0, 1, 0],
      scale: [0, 1.5, 0],
    }}
    transition={{
      duration,
      delay,
      repeat: Infinity,
      ease: 'easeInOut',
    }}
  />
);

const AnimatedText = ({ children, delay }: { children: string; delay: number }) => {
  const words = children.split(' ');
  return (
    <span className="inline-flex flex-wrap">
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 50, rotateX: -90 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{
            duration: 0.8,
            delay: delay + i * 0.1,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          className="mr-[0.25em] inline-block"
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
};

const HeroSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

  const particles = Array.from({ length: 20 }, (_, i) => ({
    delay: i * 0.3,
    duration: 3 + Math.random() * 2,
    x: `${10 + Math.random() * 80}%`,
    y: `${10 + Math.random() * 80}%`,
  }));

  return (
    <section
      ref={containerRef}
      className="relative flex min-h-screen items-center overflow-hidden bg-gradient-to-br from-background via-secondary/30 to-accent/20"
    >
      {/* Animated Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -right-20 top-0 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-primary/20 via-accent/30 to-transparent blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            x: [0, -30, 0],
            y: [0, 50, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-secondary via-primary/10 to-transparent blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          className="absolute left-1/2 top-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/5"
        />
      </div>

      {/* Floating Particles */}
      {particles.map((particle, i) => (
        <FloatingParticle key={i} {...particle} />
      ))}

      {/* Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
                           linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      <motion.div style={{ y, opacity, scale }} className="container-custom relative z-10">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16">
          {/* Content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2"
            >
              <motion.span
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="h-4 w-4 text-primary" />
              </motion.span>
              <span className="text-sm font-medium text-primary">New Collection 2024</span>
            </motion.div>
            
            {/* Main Heading */}
            <h1 className="font-display text-4xl font-medium leading-[1.1] md:text-5xl lg:text-6xl xl:text-7xl">
              <AnimatedText delay={0.2}>Elegance in</AnimatedText>
              <br />
              <span className="relative inline-block">
                <AnimatedText delay={0.5}>Every Stitch</AnimatedText>
                <motion.span
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 1.2, duration: 0.8, ease: 'easeOut' }}
                  className="absolute -bottom-2 left-0 h-1 w-full origin-left rounded-full bg-gradient-to-r from-primary via-primary/80 to-transparent"
                />
              </span>
            </h1>
            
            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="mx-auto mt-8 max-w-lg text-base text-muted-foreground md:text-lg lg:mx-0"
            >
              Discover premium comfort wear that blends traditional craftsmanship 
              with modern elegance. Experience luxury in its purest form.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start"
            >
              <Button asChild size="lg" className="group relative overflow-hidden bg-foreground px-8 py-6 text-base text-background hover:bg-foreground/90">
                <Link to="/shop">
                  <span className="relative z-10 flex items-center">
                    Shop Collection
                    <motion.span
                      className="ml-2"
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRight className="h-5 w-5" />
                    </motion.span>
                  </span>
                  <motion.div
                    className="absolute inset-0 bg-primary"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </Link>
              </Button>
              <Button 
                asChild 
                variant="outline" 
                size="lg" 
                className="group border-2 border-foreground/20 px-8 py-6 text-base backdrop-blur-sm hover:border-foreground/40 hover:bg-foreground/5"
              >
                <Link to="/about">
                  <span>Our Story</span>
                  <motion.span
                    className="ml-2 inline-block"
                    whileHover={{ rotate: 45 }}
                    transition={{ duration: 0.2 }}
                  >
                    →
                  </motion.span>
                </Link>
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="mt-12 flex justify-center gap-8 lg:justify-start"
            >
              {[
                { value: '10K+', label: 'Happy Customers', icon: Heart },
                { value: '500+', label: 'Products', icon: Star },
                { value: '50+', label: 'Cities', icon: Truck },
              ].map((stat, index) => (
                <motion.div 
                  key={stat.label} 
                  className="group text-center lg:text-left"
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center gap-2 lg:justify-start justify-center">
                    <stat.icon className="h-4 w-4 text-primary opacity-60" />
                    <p className="font-display text-2xl font-semibold md:text-3xl">{stat.value}</p>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Product Showcase */}
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="relative hidden h-[550px] lg:block lg:h-[650px]"
          >
            {/* Decorative Rings */}
            <motion.div 
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              animate={{ rotate: 360 }}
              transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
            >
              <div className="h-[500px] w-[500px] rounded-full border border-dashed border-primary/20" />
            </motion.div>
            
            <motion.div 
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              animate={{ rotate: -360 }}
              transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
            >
              <div className="h-[420px] w-[420px] rounded-full border border-primary/10" />
            </motion.div>

            <motion.div 
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="h-[340px] w-[340px] rounded-full bg-gradient-to-br from-primary/10 via-accent/20 to-transparent blur-2xl" />
            </motion.div>

            {/* Main Product Image */}
            <motion.div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <motion.div
                whileHover={{ scale: 1.05, rotateY: 5 }}
                transition={{ duration: 0.4 }}
                className="relative cursor-pointer"
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Glow Effect */}
                <div className="absolute inset-0 scale-90 blur-3xl">
                  <div className="h-full w-full rounded-full bg-gradient-to-b from-primary/30 via-accent/20 to-transparent" />
                </div>
                
                <img 
                  src={heroProduct} 
                  alt="Premium Lounge Wear" 
                  className="relative z-10 h-[520px] w-auto object-contain drop-shadow-2xl"
                />

                {/* Shine Effect */}
                <motion.div
                  className="absolute inset-0 z-20 rounded-3xl bg-gradient-to-r from-transparent via-white/10 to-transparent"
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                />
              </motion.div>
            </motion.div>

            {/* Floating Info Cards */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.5, duration: 0.6 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="absolute left-0 top-16 cursor-pointer"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="rounded-2xl border border-border/50 bg-card/80 p-4 shadow-lg backdrop-blur-md"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Premium Quality</p>
                    <p className="text-xs text-muted-foreground">100% Organic Cotton</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.7, duration: 0.6 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="absolute bottom-40 right-0 cursor-pointer"
            >
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, delay: 0.5 }}
                className="rounded-2xl border border-border/50 bg-card/80 p-4 shadow-lg backdrop-blur-md"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400/20 to-orange-400/20">
                    <Star className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-medium">Best Seller</p>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.9, duration: 0.6 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="absolute bottom-16 left-10 cursor-pointer"
            >
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 6, repeat: Infinity, delay: 1 }}
                className="rounded-2xl border border-border/50 bg-card/80 p-4 shadow-lg backdrop-blur-md"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-400/20 to-emerald-400/20">
                    <Truck className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">Free Shipping</p>
                    <p className="text-xs text-muted-foreground">On orders above ₹2,000</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Floating Sparkles */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  left: `${15 + i * 14}%`,
                  top: `${5 + (i % 3) * 30}%`,
                }}
                animate={{ 
                  scale: [1, 1.8, 1],
                  opacity: [0.2, 0.8, 0.2],
                  rotate: [0, 180, 360],
                }}
                transition={{ 
                  duration: 3 + i * 0.5, 
                  repeat: Infinity,
                  delay: i * 0.4,
                }}
              >
                <Sparkles className="h-4 w-4 text-primary/50" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 12, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Scroll to explore</span>
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default HeroSection;
