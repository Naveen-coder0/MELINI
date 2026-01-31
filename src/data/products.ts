export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  description: string;
  shortDescription: string;
  category: 'summer' | 'semi-winter' | 'winter';
  images: string[];
  sizes: string[];
  colors: { name: string; value: string }[];
  inStock: boolean;
  isNew?: boolean;
  isBestSeller?: boolean;
  material: string;
  careInstructions: string[];
  features: string[];
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

const productImages = {
  summer: [
    'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=800&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=60',
  ],
  semiWinter: [
    'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=800&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800&auto=format&fit=crop&q=60',
  ],
  winter: [
    'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=800&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1548126032-079a0fb0099d?w=800&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=800&auto=format&fit=crop&q=60',
  ],
};

const colors = [
  { name: 'Cream', value: '#F5F0E8' },
  { name: 'Rose', value: '#D4A5A5' },
  { name: 'Sage', value: '#9CAF88' },
  { name: 'Charcoal', value: '#36454F' },
  { name: 'Blush', value: '#E8C4C4' },
  { name: 'Oat', value: '#E5DDD3' },
  { name: 'Terracotta', value: '#C9725E' },
  { name: 'Navy', value: '#2C3E50' },
];

const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const generateProducts = (): Product[] => {
  const products: Product[] = [];
  
  const summerItems = [
    { name: 'Linen Breeze Shirt', material: 'Premium Linen' },
    { name: 'Cotton Cloud Dress', material: '100% Organic Cotton' },
    { name: 'Silk Touch Blouse', material: 'Mulberry Silk Blend' },
    { name: 'Breezy Summer Pants', material: 'Linen Cotton Blend' },
    { name: 'Airy Maxi Dress', material: 'Lightweight Cotton' },
    { name: 'Resort Shirt', material: 'Premium Linen' },
    { name: 'Cotton Loungewear Set', material: 'Organic Cotton' },
    { name: 'Flowy Palazzo Pants', material: 'Viscose Blend' },
    { name: 'Summer Kaftan', material: 'Cotton Voile' },
    { name: 'Beach Cover-Up', material: 'Linen' },
  ];

  const semiWinterItems = [
    { name: 'Cashmere Blend Cardigan', material: 'Cashmere Wool Blend' },
    { name: 'Layering Sweater', material: 'Merino Wool' },
    { name: 'Transition Jacket', material: 'Cotton Twill' },
    { name: 'Cozy Hoodie', material: 'French Terry' },
    { name: 'Knit Pullover', material: 'Organic Cotton Knit' },
    { name: 'Fleece Joggers', material: 'Brushed Fleece' },
    { name: 'Light Quilted Vest', material: 'Recycled Polyester' },
    { name: 'Lounge Sweatshirt', material: 'Premium Fleece' },
    { name: 'Ribbed Turtleneck', material: 'Cotton Rib' },
    { name: 'Thermal Henley', material: 'Waffle Knit Cotton' },
  ];

  const winterItems = [
    { name: 'Wool Overcoat', material: 'Italian Wool' },
    { name: 'Puffer Jacket', material: 'Down Fill' },
    { name: 'Chunky Knit Sweater', material: 'Alpaca Blend' },
    { name: 'Sherpa Lined Hoodie', material: 'Sherpa Fleece' },
    { name: 'Thermal Leggings', material: 'Heat-Tech Fabric' },
    { name: 'Cable Knit Dress', material: 'Merino Wool' },
    { name: 'Velvet Blazer', material: 'Cotton Velvet' },
    { name: 'Quilted Long Coat', material: 'Recycled Down' },
    { name: 'Cashmere Scarf Set', material: '100% Cashmere' },
    { name: 'Plush Lounge Set', material: 'Velour' },
  ];

  // Generate summer products
  summerItems.forEach((item, index) => {
    const imageSet = productImages.summer;
    products.push({
      id: `summer-${index + 1}`,
      name: item.name,
      slug: item.name.toLowerCase().replace(/\s+/g, '-'),
      price: 2499 + (index * 500),
      originalPrice: index % 3 === 0 ? 3499 + (index * 500) : undefined,
      description: `Experience ultimate comfort with our ${item.name}. Crafted with ${item.material} for breathability and style. Perfect for the Indian summer, this piece combines traditional craftsmanship with modern design sensibilities. Each garment is carefully constructed to ensure lasting quality and timeless appeal.`,
      shortDescription: `Lightweight ${item.material} perfect for warm days`,
      category: 'summer',
      images: [
        imageSet[index % imageSet.length],
        imageSet[(index + 1) % imageSet.length],
        imageSet[(index + 2) % imageSet.length],
      ],
      sizes: sizes.slice(0, 5),
      colors: colors.slice(0, 4),
      inStock: index !== 4,
      isNew: index < 3,
      isBestSeller: index === 1 || index === 5,
      material: item.material,
      careInstructions: ['Machine wash cold', 'Tumble dry low', 'Iron on low heat', 'Do not bleach'],
      features: ['Breathable fabric', 'Comfort fit', 'Sustainable production', 'Easy care'],
    });
  });

  // Generate semi-winter products
  semiWinterItems.forEach((item, index) => {
    const imageSet = productImages.semiWinter;
    products.push({
      id: `semi-winter-${index + 1}`,
      name: item.name,
      slug: item.name.toLowerCase().replace(/\s+/g, '-'),
      price: 3499 + (index * 500),
      originalPrice: index % 4 === 0 ? 4999 + (index * 500) : undefined,
      description: `Stay cozy in style with our ${item.name}. Made from ${item.material} for the perfect balance of warmth and comfort. Ideal for transitional weather, this versatile piece layers beautifully and stands alone as a statement of quiet luxury.`,
      shortDescription: `Cozy ${item.material} for transitional weather`,
      category: 'semi-winter',
      images: [
        imageSet[index % imageSet.length],
        imageSet[(index + 1) % imageSet.length],
        imageSet[(index + 2) % imageSet.length],
      ],
      sizes,
      colors: colors.slice(2, 6),
      inStock: true,
      isNew: index < 2,
      isBestSeller: index === 0 || index === 3,
      material: item.material,
      careInstructions: ['Hand wash recommended', 'Lay flat to dry', 'Steam iron', 'Dry clean for best results'],
      features: ['Temperature regulating', 'Soft touch', 'Durable construction', 'Timeless design'],
    });
  });

  // Generate winter products
  winterItems.forEach((item, index) => {
    const imageSet = productImages.winter;
    products.push({
      id: `winter-${index + 1}`,
      name: item.name,
      slug: item.name.toLowerCase().replace(/\s+/g, '-'),
      price: 4999 + (index * 700),
      originalPrice: index % 3 === 0 ? 6999 + (index * 700) : undefined,
      description: `Embrace the cold in pure luxury with our ${item.name}. Crafted from ${item.material} to keep you warm without compromising on style. This exceptional piece represents the pinnacle of winter comfort wear, designed for those who appreciate the finer things.`,
      shortDescription: `Luxurious ${item.material} for cold weather`,
      category: 'winter',
      images: [
        imageSet[index % imageSet.length],
        imageSet[(index + 1) % imageSet.length],
        imageSet[(index + 2) % imageSet.length],
      ],
      sizes,
      colors: colors.slice(3, 8),
      inStock: index !== 7,
      isNew: index < 2,
      isBestSeller: index === 2 || index === 4,
      material: item.material,
      careInstructions: ['Dry clean only', 'Store folded', 'Use garment bag', 'Avoid direct sunlight'],
      features: ['Premium insulation', 'Luxurious feel', 'Expert tailoring', 'Season-spanning style'],
    });
  });

  return products;
};

export const products = generateProducts();

export const getProductBySlug = (slug: string): Product | undefined => {
  return products.find(p => p.slug === slug);
};

export const getProductsByCategory = (category: string): Product[] => {
  return products.filter(p => p.category === category);
};

export const getFeaturedProducts = (): Product[] => {
  return products.filter(p => p.isBestSeller || p.isNew).slice(0, 8);
};

export const getNewArrivals = (): Product[] => {
  return products.filter(p => p.isNew).slice(0, 6);
};

export const getBestSellers = (): Product[] => {
  return products.filter(p => p.isBestSeller).slice(0, 6);
};
