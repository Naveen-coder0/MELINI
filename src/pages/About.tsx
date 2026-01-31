import { motion } from 'framer-motion';
import { Heart, Leaf, Users, Award, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const values = [
  {
    icon: Heart,
    title: 'Crafted with Love',
    description: 'Every piece is thoughtfully designed with attention to detail and passion for quality.',
  },
  {
    icon: Leaf,
    title: 'Sustainable Fashion',
    description: 'We prioritize eco-friendly materials and ethical manufacturing practices.',
  },
  {
    icon: Users,
    title: 'Community First',
    description: 'Supporting local artisans and communities through fair trade partnerships.',
  },
  {
    icon: Award,
    title: 'Premium Quality',
    description: 'Using only the finest fabrics to ensure comfort and longevity.',
  },
];

const timeline = [
  { year: '2018', title: 'The Beginning', description: 'Started with a dream to redefine Indian comfort wear' },
  { year: '2019', title: 'First Collection', description: 'Launched our debut summer collection to overwhelming response' },
  { year: '2021', title: 'Sustainable Shift', description: 'Transitioned to 100% sustainable materials and packaging' },
  { year: '2023', title: 'Pan-India', description: 'Expanded to deliver premium comfort wear across India' },
  { year: '2024', title: 'Global Vision', description: 'Planning international expansion while staying true to our roots' },
];

const About = () => {
  return (
    <div className="pt-24">
      {/* Hero */}
      <section className="relative h-[60vh] min-h-[400px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1558171813-4c088753af8f?w=1920&auto=format&fit=crop&q=80)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        <div className="container-custom relative z-10 flex h-full flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <h1 className="font-display text-4xl font-medium md:text-5xl lg:text-6xl">
              Our Story
            </h1>
            <p className="mt-6 text-lg text-muted-foreground md:text-xl">
              Born from a passion for comfort and a love for timeless style, 
              Melini represents the perfect blend of traditional craftsmanship and modern elegance.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="mx-auto max-w-3xl text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-display text-3xl font-medium md:text-4xl"
            >
              Redefining Comfort Wear
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="mt-6 text-lg leading-relaxed text-muted-foreground"
            >
              At Melini, we believe that true luxury lies in comfort. Our collections are designed 
              for the modern individual who refuses to compromise between looking elegant and feeling 
              at ease. Each garment tells a story of meticulous craftsmanship, sustainable practices, 
              and an unwavering commitment to quality.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section-padding bg-secondary/30">
        <div className="container-custom">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center font-display text-3xl font-medium md:text-4xl"
          >
            What We Stand For
          </motion.h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <value.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mt-6 font-display text-xl font-medium">{value.title}</h3>
                <p className="mt-3 text-muted-foreground">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="section-padding">
        <div className="container-custom">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center font-display text-3xl font-medium md:text-4xl"
          >
            Our Journey
          </motion.h2>
          <div className="relative mt-16">
            {/* Timeline line */}
            <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-border" />
            
            <div className="space-y-12">
              {timeline.map((item, index) => (
                <motion.div
                  key={item.year}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className={`relative flex items-center ${
                    index % 2 === 0 ? 'justify-start' : 'justify-end'
                  } md:justify-center`}
                >
                  <div
                    className={`w-full max-w-sm ${
                      index % 2 === 0 ? 'md:mr-auto md:pr-16 md:text-right' : 'md:ml-auto md:pl-16 md:text-left'
                    }`}
                  >
                    <span className="text-gradient font-display text-2xl font-semibold">
                      {item.year}
                    </span>
                    <h3 className="mt-2 font-display text-xl font-medium">{item.title}</h3>
                    <p className="mt-2 text-muted-foreground">{item.description}</p>
                  </div>
                  {/* Dot */}
                  <div className="absolute left-1/2 hidden h-4 w-4 -translate-x-1/2 rounded-full bg-primary md:block" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-primary text-primary-foreground">
        <div className="container-custom text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-3xl font-medium md:text-4xl"
          >
            Experience Melini
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mx-auto mt-4 max-w-xl text-primary-foreground/80"
          >
            Discover our collection and experience the perfect blend of comfort and elegance.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="mt-8"
            >
              <Link to="/shop">
                Shop Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default About;
