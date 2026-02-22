import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useConfig } from '@/contexts/ConfigContext';
import { Button } from '@/components/ui/button';

const PromoBanner = () => {
    const { config } = useConfig();

    if (!config.promoBannerUrl) return null;

    return (
        <section className="container-custom py-12 md:py-20">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="relative overflow-hidden rounded-3xl bg-slate-900 aspect-[21/9] md:aspect-[25/8] lg:aspect-[30/7]"
            >
                {/* Background Image */}
                <img
                    src={config.promoBannerUrl}
                    alt="Promotional Banner"
                    className="absolute inset-0 h-full w-full object-cover opacity-60 transition-transform duration-700 hover:scale-105"
                />

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/40 to-transparent" />

                {/* Content */}
                <div className="relative z-10 flex h-full flex-col justify-center px-6 md:px-12 lg:px-20 max-w-2xl">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex items-center gap-2 rounded-full bg-primary/20 backdrop-blur-md px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary-foreground mb-4"
                    >
                        <Sparkles className="h-3 w-3" />
                        Exclusive Offer
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-2xl md:text-3xl lg:text-4xl font-display font-medium text-white leading-tight mb-4"
                    >
                        {config.storeName} Selection <br />
                        <span className="text-primary italic">Handcrafted for You</span>
                    </motion.h2>

                    {config.promoLink && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <Button asChild className="w-fit bg-white text-slate-900 hover:bg-slate-100 transition-all group">
                                <Link to={config.promoLink}>
                                    Explore Now
                                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </Link>
                            </Button>
                        </motion.div>
                    )}
                </div>

                {/* Decorative Elements */}
                <div className="absolute -bottom-12 -right-12 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
                <div className="absolute -top-12 -right-12 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />
            </motion.div>
        </section>
    );
};

export default PromoBanner;
