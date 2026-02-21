import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, ArrowRight } from 'lucide-react';
import { useProducts } from '@/contexts/ProductContext';
import ProductCard from '@/components/shop/ProductCard';

const BestSellersSection = () => {
    const { products } = useProducts();
    const bestSellers = products.filter((p) => p.isBestSeller).slice(0, 4);

    if (bestSellers.length === 0) return null;

    return (
        <section className="section-padding bg-secondary/30">
            <div className="container-custom">
                <div className="flex items-end justify-between mb-10">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Star className="h-5 w-5 fill-amber-400 stroke-amber-400" />
                            <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Customer Favourites</span>
                        </div>
                        <h2 className="font-display text-3xl font-medium md:text-4xl">Best Sellers</h2>
                        <p className="mt-2 text-muted-foreground">Our most loved pieces, chosen by you</p>
                    </div>
                    <Link
                        to="/shop?sort=best-selling"
                        className="hidden items-center gap-1 text-sm font-medium text-primary hover:underline sm:flex"
                    >
                        View all <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {bestSellers.map((product, i) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <ProductCard product={product} />
                        </motion.div>
                    ))}
                </div>
                <div className="mt-8 text-center sm:hidden">
                    <Link to="/shop?sort=best-selling" className="text-sm font-medium text-primary hover:underline">
                        View all best sellers →
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default BestSellersSection;
