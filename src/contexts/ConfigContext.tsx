import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SiteConfig {
    heroTitle: string;
    heroSubtitle: string;
    heroBadge: string;
    announcement: string;
    promoBannerUrl?: string;
    promoLink?: string;
    // Store Identity
    storeName: string;
    tagline: string;
    contactEmail: string;
    whatsapp: string;
    instagram: string;
    freeShippingThreshold: number;
    currency: string;
}

interface ConfigContextType {
    config: SiteConfig;
    isLoading: boolean;
    refreshConfig: () => Promise<void>;
}

const defaultConfig: SiteConfig = {
    heroTitle: 'Elegance in Every Stitch',
    heroSubtitle: 'Discover premium comfort wear that blends traditional craftsmanship with modern elegance.',
    heroBadge: 'New Collection 2025',
    announcement: 'Free shipping on orders above ₹999',
    storeName: 'MELINI',
    tagline: 'Timeless Indian Clothing',
    contactEmail: '',
    whatsapp: '',
    instagram: '',
    freeShippingThreshold: 999,
    currency: 'INR',
};

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export const ConfigProvider = ({ children }: { children: ReactNode }) => {
    const [config, setConfig] = useState<SiteConfig>(defaultConfig);
    const [isLoading, setIsLoading] = useState(true);

    const fetchConfig = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || ""}/api/site-config`);
            if (res.ok) {
                const data = await res.json();
                if (data) setConfig({ ...defaultConfig, ...data });
            }
        } catch (err) {
            console.error("Failed to fetch site config:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchConfig();
    }, []);

    return (
        <ConfigContext.Provider value={{ config, isLoading, refreshConfig: fetchConfig }}>
            {children}
        </ConfigContext.Provider>
    );
};

export const useConfig = () => {
    const context = useContext(ConfigContext);
    if (context === undefined) {
        throw new Error('useConfig must be used within a ConfigProvider');
    }
    return context;
};
