import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { ProductProvider } from '@/contexts/ProductContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { WishlistProvider } from '@/contexts/WishlistContext';
import Layout from "@/components/layout/Layout";
import Index from "./pages/Index";
import Shop from "./pages/Shop";
import ProductDetails from "./pages/ProductDetails";
import Category from "./pages/Category";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Search from "./pages/Search";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import ScrollToTop from "./components/ScrollToTop";
import BackToTop from "./components/BackToTop";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <ProductProvider>
          <CartProvider>
            <WishlistProvider>
              <Toaster />
              <Sonner />

              <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <ScrollToTop />
                <BackToTop />

                <Routes>
                  {/* Admin login — no layout (full-page auth form) */}
                  <Route path="/admin-login" element={<AdminLogin />} />

                  {/* Protected admin panel — inside Layout so nav+footer are shown */}
                  <Route
                    path="/admin"
                    element={
                      <Layout>
                        <ProtectedAdminRoute>
                          <Admin />
                        </ProtectedAdminRoute>
                      </Layout>
                    }
                  />

                  {/* Public routes with layout */}
                  <Route element={<Layout><Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/shop" element={<Shop />} />
                    <Route path="/product/:slug" element={<ProductDetails />} />
                    <Route path="/category/:category" element={<Category />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/search" element={<Search />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes></Layout>} path="/*" />
                </Routes>
              </BrowserRouter>

            </WishlistProvider>
          </CartProvider>
        </ProductProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

