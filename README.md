# Melini Inspired Fashion

A modern, responsive e-commerce fashion platform built with React, TypeScript, and Tailwind CSS. Discover curated fashion collections with seamless shopping and checkout experience.

## Features

- **Hero Section** - Eye-catching landing page with brand showcase
- **Product Catalog** - Browse and filter fashion products by category
- **Search Functionality** - Find products quickly with full-text search
- **Shopping Cart** - Add/remove items with persistent cart management
- **Product Details** - Detailed product information with images
- **Checkout** - Secure and intuitive checkout process
- **Responsive Design** - Optimized for desktop, tablet, and mobile devices
- **Brand Story** - Learn about the brand's inspiration and values
- **Customer Stats** - Display social proof and customer testimonials
- **Seasonal Collections** - Themed product collections throughout the year

## Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Package Manager**: Bun
- **Testing**: Vitest
- **Linting**: ESLint

## Project Structure

```
src/
├── components/
│   ├── home/           # Home page components (HeroSection, BrandStory, etc.)
│   ├── shop/           # Shop page components (ProductCard, ProductFilters)
│   ├── layout/         # Layout components (Header, Footer)
│   └── ui/             # shadcn/ui components
├── pages/              # Page components (Home, Shop, Cart, Checkout, etc.)
├── contexts/           # React contexts (CartContext)
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
├── data/               # Static data (products)
└── assets/             # Images and static files
```

## Getting Started

### Prerequisites

- Bun (or Node.js with npm)
- Git

### Installation

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to the project directory
cd melini-inspired-fashion

# Install dependencies using Bun
bun install
```

### Development

```sh
# Start the development server
bun run dev
```

The application will be available at `http://localhost:5173`

### Building for Production

```sh
# Build the project
bun run build

# Preview the production build
bun run preview
```

## Available Scripts

- `bun run dev` - Start development server with hot reload
- `bun run build` - Build for production
- `bun run preview` - Preview production build locally
- `bun run lint` - Run ESLint
- `bun run test` - Run tests with Vitest

## Pages

- **Home** (`/`) - Landing page with featured products and brand showcase
- **Shop** (`/shop`) - Product catalog with filtering and sorting
- **Product Details** (`/product/:id`) - Detailed product information
- **Search** (`/search`) - Search results page
- **Category** (`/category/:id`) - Products filtered by category
- **Cart** (`/cart`) - Shopping cart management
- **Checkout** (`/checkout`) - Order completion
- **About** (`/about`) - Company information
- **Contact** (`/contact`) - Contact form and information

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is open source and available under the MIT License.
