import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { Product } from '@/data/products';
import { useProducts } from '@/contexts/ProductContext';

const KEY = 'melini_recently_viewed';
const MAX = 6;

export const addRecentlyViewed = (productId: string) => {
    try {
        const prev: string[] = JSON.parse(localStorage.getItem(KEY) || '[]');
        const updated = [productId, ...prev.filter((id) => id !== productId)].slice(0, MAX);
        localStorage.setItem(KEY, JSON.stringify(updated));
    } catch { /* ignore */ }
};

export const getRecentlyViewed = (): string[] => {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
    catch { return []; }
};

interface Props { excludeId?: string; }

const RecentlyViewed = ({ excludeId }: Props) => {
    const { products } = useProducts();
    const [ids, setIds] = useState<string[]>([]);

    useEffect(() => {
        setIds(getRecentlyViewed().filter((id) => id !== excludeId));
    }, [excludeId]);

    const items = ids
        .map((id) => products.find((p) => p.id === id))
        .filter(Boolean) as Product[];

    if (items.length === 0) return null;

    return (
        <section className="section-padding border-t">
            <div className="container-custom">
                <h2 className="mb-6 flex items-center gap-2 font-display text-2xl font-medium">
                    <Clock className="h-5 w-5 text-primary" /> Recently Viewed
                </h2>
                <div className="flex gap-4 overflow-x-auto pb-2">
                    {items.map((product, i) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="shrink-0 w-40"
                        >
                            <Link to={`/product/${product.slug}`} className="group block">
                                <div className="aspect-[3/4] overflow-hidden rounded-xl bg-secondary">
                                    <img
                                        src={product.images[0]}
                                        alt={product.name}
                                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                </div>
                                <p className="mt-2 text-sm font-medium line-clamp-1 group-hover:text-primary transition-colors">{product.name}</p>
                                <p className="text-xs text-muted-foreground">₹{product.price.toLocaleString('en-IN')}</p>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default RecentlyViewed;
