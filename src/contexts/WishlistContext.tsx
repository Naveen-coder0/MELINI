import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '@/data/products';

interface WishlistContextType {
    wishlist: string[]; // product IDs
    toggleWishlist: (id: string) => void;
    isWishlisted: (id: string) => boolean;
    count: number;
}

const WishlistContext = createContext<WishlistContextType>({
    wishlist: [],
    toggleWishlist: () => { },
    isWishlisted: () => false,
    count: 0,
});

const STORAGE_KEY = 'melini_wishlist';

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
    const [wishlist, setWishlist] = useState<string[]>(() => {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
        catch { return []; }
    });

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlist));
    }, [wishlist]);

    const toggleWishlist = (id: string) => {
        setWishlist((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const isWishlisted = (id: string) => wishlist.includes(id);

    return (
        <WishlistContext.Provider value={{ wishlist, toggleWishlist, isWishlisted, count: wishlist.length }}>
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => useContext(WishlistContext);
export type { Product };
