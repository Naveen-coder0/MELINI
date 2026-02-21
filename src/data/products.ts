export interface SizePrice {
  size: string;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  articleNo?: string;           // unique article / SKU number
  price: number;                // default / base price
  originalPrice?: number;
  sizePricing?: SizePrice[];    // per-size pricing overrides
  description: string;
  shortDescription: string;
  category: 'summer' | 'semi-winter' | 'winter';
  images: string[];
  sizes: string[];
  colors: { name: string; value: string }[];
  inStock: boolean;
  isNewProduct?: boolean;
  isBestSeller?: boolean;
  material: string;
  careInstructions: string[];
  features: string[];
  // SEO
  metaTitle?: string;
  metaDescription?: string;
  tags?: string[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
}

export const categories: Category[] = [
  {
    id: '1',
    name: 'Summer Wear',
    slug: 'summer',
    description: 'Light, breathable pieces perfect for warm days. Crafted with premium cotton and linen blends.',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=60',
  },
  {
    id: '2',
    name: 'Semi-Winter Wear',
    slug: 'semi-winter',
    description: 'Transitional pieces for those in-between seasons. Comfortable layering essentials.',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&auto=format&fit=crop&q=60',
  },
  {
    id: '3',
    name: 'Winter Wear',
    slug: 'winter',
    description: 'Cozy, warm pieces to embrace the cold in style. Luxurious fabrics for maximum comfort.',
    image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&auto=format&fit=crop&q=60',
  },
];

export const colors = [
  { name: 'Cream', value: '#F5F0E8' },
  { name: 'Rose', value: '#D4A5A5' },
  { name: 'Sage', value: '#9CAF88' },
  { name: 'Charcoal', value: '#36454F' },
  { name: 'Blush', value: '#E8C4C4' },
  { name: 'Oat', value: '#E5DDD3' },
  { name: 'Terracotta', value: '#C9725E' },
  { name: 'Navy', value: '#2C3E50' },
];

export const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
