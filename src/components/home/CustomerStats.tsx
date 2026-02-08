import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';

const stats = [
  { value: 10000, suffix: '+', label: 'Happy Customers' },
  { value: 500, suffix: '+', label: 'Products' },
  { value: 50, suffix: '+', label: 'Cities Delivered' },
  { value: 98, suffix: '%', label: 'Customer Satisfaction' },
];

const Counter = ({ value, suffix }: { value: number; suffix: string }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      const duration = 2000;
      const steps = 60;
      const increment = value / steps;
      let current = 0;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= value) {
          setCount(value);
          clearInterval(timer);
        } else {
          setCount(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [isInView, value]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}{suffix}
    </span>
  );
};

const CustomerStats = () => {
  return (
    <section className="section-padding">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="font-display text-3xl font-medium md:text-4xl">
            Trusted by Thousands
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Join our growing community of comfort enthusiasts across India
          </p>
        </motion.div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <div className="font-display text-4xl font-semibold text-gradient md:text-5xl">
                <Counter value={stat.value} suffix={stat.suffix} />
              </div>
              <p className="mt-2 text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Testimonial */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto mt-20 max-w-3xl text-center"
        >
          <div className="relative">
            <svg
              className="absolute -left-4 -top-4 h-8 w-8 text-brand-rose/30 md:-left-8 md:-top-8 md:h-12 md:w-12"
              fill="currentColor"
              viewBox="0 0 32 32"
            >
              <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
            </svg>
            <p className="font-display text-xl italic leading-relaxed text-foreground md:text-2xl">
              The quality and comfort of Melini's clothing is unmatched. 
              Every piece I own feels like luxury without the pretentiousness. 
              It's become my go-to for both work-from-home days and weekend brunches.
            </p>
          </div>
          <div className="mt-8">
            <div className="mx-auto h-14 w-14 overflow-hidden rounded-full bg-secondary">
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80"
                alt="Customer"
                className="h-full w-full object-cover"
              />
            </div>
            <p className="mt-3 font-medium">Priya Sharma</p>
            <p className="text-sm text-muted-foreground">Mumbai, India</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CustomerStats;
