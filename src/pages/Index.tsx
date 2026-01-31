import { motion } from 'framer-motion';
import HeroSection from '@/components/home/HeroSection';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import CategoryShowcase from '@/components/home/CategoryShowcase';
import BrandStory from '@/components/home/BrandStory';
import CustomerStats from '@/components/home/CustomerStats';
import SeasonalCollection from '@/components/home/SeasonalCollection';

const Index = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="overflow-hidden"
    >
      <HeroSection />
      <CategoryShowcase />
      <FeaturedProducts />
      <SeasonalCollection />
      <BrandStory />
      <CustomerStats />
    </motion.div>
  );
};

export default Index;
