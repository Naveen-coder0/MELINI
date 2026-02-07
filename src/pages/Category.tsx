import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { categories } from '@/data/products';
import { useProducts } from '@/contexts/ProductContext';
import ProductCard from '@/components/shop/ProductCard';
import { Button } from '@/components/ui/button';

const Category = () => {
  const { category } = useParams();
  const categoryData = categories.find(c => c.slug === category);
  const { getProductsByCategory } = useProducts();
  const products = getProductsByCategory(category || '');

  if (!categoryData) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-24">
        <div className="text-center">
          <h1 className="font-display text-3xl font-medium">Category Not Found</h1>
          <p className="mt-4 text-muted-foreground">The category you're looking for doesn't exist.</p>
          <Button asChild className="mt-6">
            <Link to="/shop">Browse All Products</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24">
      {/* Hero Banner */}
      <section className="relative h-80 overflow-hidden md:h-96">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${categoryData.image})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/70 to-transparent" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="container-custom relative z-10 flex h-full flex-col justify-center"
        >
          <h1 className="font-display text-4xl font-medium md:text-5xl lg:text-6xl">
            {categoryData.name}
          </h1>
          <p className="mt-4 max-w-xl text-lg text-muted-foreground">
            {categoryData.description}
          </p>
        </motion.div>
      </section>

      {/* Products */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="mb-8 flex items-center justify-between">
            <p className="text-muted-foreground">{products.length} products</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Category;
