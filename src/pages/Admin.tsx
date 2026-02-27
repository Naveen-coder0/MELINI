import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  LogOut, Package, Pencil, Plus, RefreshCw,
  Settings, ShoppingBag, Star, LayoutDashboard, Menu, X, CheckCircle
} from 'lucide-react';
import { useProducts } from '@/contexts/ProductContext';
import { useAuth } from '@/contexts/AuthContext';
import { adminFetch } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SettingsTab } from '@/components/admin/SettingsTab';
import { ReviewsTab } from '@/components/admin/ReviewsTab';
import { ProductsTab } from '@/components/admin/ProductsTab';
import { DashboardTab } from '@/components/admin/DashboardTab';
import { MarketingTab } from '@/components/admin/MarketingTab';
import { ContentTab } from '@/components/admin/ContentTab';
import { Order, OrdersTab } from '@/components/admin/OrdersTab';

/* ════ types & constants ════ */

type Tab = 'dashboard' | 'products' | 'orders' | 'marketing' | 'content' | 'reviews' | 'settings';

const SL = ({ children }: { children: React.ReactNode }) => (
  <p className="mb-2.5 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">{children}</p>
);

/* ════ main ════ */

const Admin = () => {
  const { products, refreshProducts } = useProducts();
  const { logout } = useAuth();
  const navigate = useNavigate();

  /* tabs & ui state */
  const [tab, setTab] = useState<Tab>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'marketing', label: 'Marketing', icon: Star },
    { id: 'content', label: 'Content', icon: Pencil },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  /* data */
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (tab === 'dashboard' || tab === 'orders') {
      adminFetch(`${import.meta.env.VITE_API_URL || ""}/api/admin/orders`)
        .then(r => r.json())
        .then(data => setOrders(data.items || []))
        .catch(err => console.error("Admin order fetch error:", err));
    }
    // Auto-close mobile sidebar on tab change
    setIsMobileMenuOpen(false);
  }, [tab]);

  const showSuccess = (msg: string) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(null), 3000); };
  const handleLogout = () => { logout(); navigate('/admin-login'); };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await refreshProducts();
      showSuccess('Database Synced');
    } catch {
      // Error handled by context/toast
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 selection:bg-violet-100 selection:text-violet-900">
      {/* Dynamic Success Toast */}
      {successMsg && (
        <div className="fixed bottom-10 left-1/2 z-[100] -translate-x-1/2 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-3 rounded-2xl bg-slate-900 px-6 py-4 text-sm font-bold text-white shadow-2xl ring-1 ring-white/10">
            <CheckCircle className="h-5 w-5 text-emerald-400" /> {successMsg}
          </div>
        </div>
      )}

      {/* Mobile Menu Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-md lg:hidden transition-all duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 border-r border-slate-200 bg-white transition-all duration-500 ease-in-out lg:translate-x-0 shadow-2xl lg:shadow-none",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-24 items-center justify-between px-8">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-600 font-display text-xl font-black text-white shadow-xl shadow-violet-200 group-hover:scale-105 transition-transform">M</div>
            <span className="text-2xl font-black tracking-tighter text-slate-800">MELINI</span>
          </Link>
          <button className="lg:hidden p-2 text-slate-400 hover:text-slate-900" onClick={() => setIsMobileMenuOpen(false)}><X className="h-6 w-6" /></button>
        </div>

        <nav className="flex flex-col gap-1.5 p-6">
          <SL>Control Panel</SL>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = tab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id as Tab)}
                className={cn(
                  "group flex items-center gap-4 rounded-2xl px-5 py-4 text-sm font-bold transition-all duration-300",
                  isActive
                    ? "bg-violet-600 text-white shadow-xl shadow-violet-300/50"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <Icon className={cn("h-5 w-5 transition-colors", isActive ? "text-white" : "text-slate-400 group-hover:text-violet-500")} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-full p-6">
          <div className="rounded-3xl bg-slate-50 p-6">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-4 rounded-2xl px-4 py-3 text-sm font-bold text-rose-500 hover:bg-rose-100/50 transition-colors"
            >
              <LogOut className="h-5 w-5" /> Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-72">
        <header className="sticky top-0 z-30 flex h-24 items-center justify-between bg-white/80 px-8 backdrop-blur-2xl lg:px-14 border-b border-slate-100">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-3 text-slate-500 hover:bg-slate-100 rounded-2xl transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-2xl font-black text-slate-800 capitalize tracking-tight">{tab}</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Admin Management System</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSync}
              disabled={isSyncing}
              className="hidden h-11 gap-3 rounded-2xl border-slate-200 bg-white px-6 text-xs font-bold uppercase tracking-[0.1em] text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all sm:flex shadow-sm"
            >
              <RefreshCw className={cn("h-4 w-4", isSyncing && "animate-spin")} />
              Sync Cloud
            </Button>
            <div className="group relative h-12 w-12 cursor-pointer">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-400 opacity-20 group-hover:opacity-40 transition-opacity" />
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=MELINI&backgroundColor=b6e3f4"
                alt="Admin Avatar"
                className="relative h-full w-full rounded-2xl border-2 border-white object-cover shadow-sm bg-white"
              />
            </div>
          </div>
        </header>

        <main className="min-h-[calc(100vh-96px)] p-6 lg:p-14">
          <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-700">
            {tab === 'dashboard' && <DashboardTab products={products} orders={orders} />}
            {tab === 'products' && <ProductsTab />}
            {tab === 'orders' && <OrdersTab />}
            {tab === 'marketing' && <MarketingTab />}
            {tab === 'content' && <ContentTab />}
            {tab === 'reviews' && <ReviewsTab />}
            {tab === 'settings' && <SettingsTab />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Admin;
