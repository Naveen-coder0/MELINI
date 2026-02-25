# MELINI Inspired Fashion

A modern, responsive e-commerce fashion platform built with React 18, TypeScript, and Tailwind CSS. Featuring curated fashion collections with seamless shopping, search, and checkout experience.

## ✨ Features

- **Hero Section** - Eye-catching landing page with brand showcase
- **Product Catalog** - Browse and filter fashion products by category
- **Advanced Search** - Find products quickly with full-text search functionality
- **Shopping Cart** - Add/remove items with persistent cart management using Context API
- **Product Details** - Comprehensive product information with high-quality images
- **Checkout System** - Secure and intuitive checkout process with order creation
- **Responsive Design** - Fully optimized for desktop, tablet, and mobile devices
- **Brand Story** - Learn about the brand's inspiration and values
- **Customer Testimonials** - Display social proof and customer statistics
- **Seasonal Collections** - Themed product collections throughout the year
- **Modern UI Components** - Built with shadcn/ui and Radix UI primitives

## 🛠 Tech Stack

| Component | Technology |
|-----------|-----------|
| **Frontend Framework** | React 18.3+ with TypeScript |
| **Build Tool** | Vite |
| **Styling** | Tailwind CSS + PostCSS |
| **UI Components** | shadcn/ui + Radix UI |
| **State Management** | React Context API |
| **HTTP Client** | TanStack React Query v5 |
| **Form Handling** | React Hook Form + Zod |
| **Package Manager** | Bun |
| **Testing** | Vitest |
| **Linting** | ESLint |
| **3D Graphics** | Three.js + React Three Fiber |
| **Notifications** | Sonner |
| **Server Runtime** | Vercel Node |

## 📁 Project Structure

```
src/
├── components/
│   ├── home/                    # Home page components
│   │   ├── HeroSection.tsx
│   │   ├── FeaturedProducts.tsx
│   │   ├── BrandStory.tsx
│   │   ├── CategoryShowcase.tsx
│   │   ├── CustomerStats.tsx
│   │   └── SeasonalCollection.tsx
│   ├── shop/                    # Shop page components
│   │   ├── ProductCard.tsx
│   │   └── ProductFilters.tsx
│   ├── layout/                  # Layout components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Layout.tsx
│   ├── ui/                      # shadcn/ui components (30+ components)
│   ├── NavLink.tsx              # Navigation link component
│   └── ScrollToTop.tsx          # Scroll to top utility
├── pages/                       # Page components
│   ├── Index.tsx                # Home page
│   ├── Shop.tsx                 # Product catalog
│   ├── ProductDetails.tsx       # Product detail view
│   ├── Search.tsx               # Search results
│   ├── Category.tsx             # Category filtered view
│   ├── Cart.tsx                 # Shopping cart
│   ├── Checkout.tsx             # Checkout process
│   ├── About.tsx                # About page
│   ├── Contact.tsx              # Contact page
│   └── NotFound.tsx             # 404 page
├── contexts/
│   └── CartContext.tsx          # Cart state management
├── hooks/
│   ├── use-mobile.tsx           # Mobile responsiveness hook
│   └── use-toast.ts             # Toast notification hook
├── lib/
│   └── utils.ts                 # Utility functions
├── data/
│   └── products.ts              # Product catalog data
├── assets/                      # Images and static files
├── test/                        # Test files
│   ├── example.test.ts
│   └── setup.ts
├── App.tsx                      # Main app component
├── main.tsx                     # Entry point
└── index.css                    # Global styles
```

## 🚀 Getting Started

### Prerequisites

- **Bun** (recommended) or Node.js v18+
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/Naveen-coder0/MELINI.git
cd MELINI

# Install dependencies
bun install
# or with npm
npm install
```

### Development Server

```bash
# Start development server with hot reload
bun run dev
```

The application will be available at `http://localhost:8080`

### Building for Production

```bash
# Build for production
bun run build

# Preview production build
bun run preview
```

### Development Mode Build

```bash
# Build with development mode (includes component tagging)
bun run build:dev
```

## 📋 Available Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start development server with HMR |
| `bun run build` | Build for production |
| `bun run build:dev` | Build with development features |
| `bun run preview` | Preview production build locally |
| `bun run lint` | Run ESLint checks |
| `bun run test` | Run tests with Vitest |
| `bun run test:watch` | Run tests in watch mode |

## 📄 Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | `Index` | Home page with hero, featured products, brand story |
| `/shop` | `Shop` | Product catalog with filters and sorting |
| `/product/:id` | `ProductDetails` | Detailed product information |
| `/search` | `Search` | Search results page |
| `/category/:id` | `Category` | Products filtered by category |
| `/cart` | `Cart` | Shopping cart management |
| `/checkout` | `Checkout` | Checkout and order creation |
| `/about` | `About` | About the brand |
| `/contact` | `Contact` | Contact information |
| `/*` | `NotFound` | 404 page |

## 📦 API

### Order Creation
- **File**: [api/create-order.ts](api/create-order.ts)
- **Purpose**: Serverless function for processing orders

### Backend
- **File**: [backend/index.js](backend/index.js)
- **Purpose**: Express.js server for backend operations

## 🎨 Styling

- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **PostCSS**: CSS processing with plugins for optimization
- **Custom Theme**: Configured in [tailwind.config.ts](tailwind.config.ts)

## 🧪 Testing

- **Framework**: Vitest
- **Test Files**: Located in `src/test/`
- Run tests with `bun run test` or `bun run test:watch`

## 📱 Responsive Design

The application is fully responsive with breakpoints for:
- **Mobile**: < 768px (base styles)
- **Tablet**: 768px - 1024px (md breakpoint)
- **Desktop**: > 1024px (lg breakpoint and up)

Implemented using Tailwind CSS responsive utilities and custom mobile hook.

## 🔧 Configuration Files

- `vite.config.ts` - Vite configuration with React SWC plugin
- `tailwind.config.ts` - Tailwind CSS theme and plugin configuration
- `tsconfig.json` - TypeScript compiler options
- `eslint.config.js` - ESLint configuration
- `postcss.config.js` - PostCSS configuration
- `vitest.config.ts` - Vitest testing configuration
- `components.json` - shadcn/ui components configuration

## 📝 Environment Setup

Create a `.env.local` file for environment variables (if needed):
```env
VITE_API_BASE_URL=http://localhost:5000
MONGODB_URI=mongodb://127.0.0.1:27017/melini
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
```


### Backend (MongoDB)

```bash
cd backend
npm install
npm run start
```

The backend now exposes DB-powered product APIs:
- `GET /api/products`
- `GET /api/products/:slug`
- `POST /api/admin/products`
- `PUT /api/admin/products/:id`
- `DELETE /api/admin/products/:id`

## 🚀 Deployment

The project is configured for deployment on Vercel with serverless functions support via `@vercel/node`.

## 📞 Support

For issues or questions, please open an issue on the [GitHub repository](https://github.com/Naveen-coder0/MELINI).

## 📄 License

This project is part of the MELINI fashion platform.
- **About** (`/about`) - Company information
- **Contact** (`/contact`) - Contact form and information

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is open source and available under the MIT License 

JTHTFJFGYUH
