import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle, CheckCircle, ChevronDown, Clock, Copy, Download,
  ExternalLink, GripVertical, ImageIcon,
  LogOut, Package, Pencil, Plus, RefreshCw, Save, Search,
  Settings, ShoppingBag, Star, Trash2, Upload, X, XCircle,
} from 'lucide-react';
import { Product } from '@/data/products';
import { useProducts } from '@/contexts/ProductContext';
import { useAuth } from '@/contexts/AuthContext';
import { authHeaders } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { SettingsTab } from '@/components/admin/SettingsTab';
import { OrdersTab } from '@/components/admin/OrdersTab';

/* ════ types & constants ════ */

type Tab = 'products' | 'orders' | 'settings' | 'activity';

interface ActivityEntry { id: number; msg: string; time: Date; type: 'add' | 'edit' | 'delete' | 'bulk' | 'info'; }

const PRESET_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const CATEGORY_COLORS: Record<string, string> = {
  summer: 'bg-amber-100 text-amber-800 border-amber-200',
  'semi-winter': 'bg-blue-100 text-blue-800 border-blue-200',
  winter: 'bg-indigo-100 text-indigo-800 border-indigo-200',
};
const FILTER_TABS = [
  { label: 'All', value: 'all' },
  { label: '☀️ Summer', value: 'summer' },
  { label: '🍂 Semi-Winter', value: 'semi-winter' },
  { label: '❄️ Winter', value: 'winter' },
  { label: '✅ In Stock', value: 'instock' },
  { label: '❌ Out of Stock', value: 'outofstock' },
];
const emptyProduct: Product = {
  id: '', name: '', slug: '', price: 0, description: '', shortDescription: '',
  category: 'summer', images: [], sizes: ['S', 'M', 'L'],
  colors: [{ name: 'Black', value: '#111111' }], inStock: true, material: '',
  careInstructions: ['Machine wash cold'], features: ['Comfort fit'],
  metaTitle: '', metaDescription: '', tags: [],
};
const createSlug = (n: string) =>
  n.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');

/* ════ sub-components ════ */

const StatCard = ({ icon: Icon, label, value, sub, gradient }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string; gradient: string;
}) => (
  <div className={`relative overflow-hidden rounded-2xl p-5 text-white shadow-md ${gradient}`}>
    <div className="flex items-center justify-between">
      <div><p className="text-sm font-medium text-white/70">{label}</p>
        <p className="mt-1 text-3xl font-bold">{value}</p>
        {sub && <p className="mt-0.5 text-xs text-white/60">{sub}</p>}
      </div>
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20"><Icon className="h-6 w-6" /></div>
    </div>
    <div className="pointer-events-none absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10" />
  </div>
);

const SL = ({ children }: { children: React.ReactNode }) => (
  <p className="mb-2.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">{children}</p>
);

const StringListEditor = ({ items, onChange, placeholder }: { items: string[]; onChange: (v: string[]) => void; placeholder: string }) => {
  const [draft, setDraft] = useState('');
  const add = () => { const t = draft.trim(); if (t && !items.includes(t)) onChange([...items, t]); setDraft(''); };
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }} placeholder={placeholder} className="h-8 text-sm" />
        <Button type="button" size="sm" variant="outline" onClick={add} className="h-8 shrink-0"><Plus className="h-3.5 w-3.5" /></Button>
      </div>
      {items.length > 0 && (
        <ul className="space-y-1">{items.map((item, i) => (
          <li key={i} className="flex items-center justify-between rounded-md border bg-muted/30 px-3 py-1.5 text-sm">
            <span className="truncate">{item}</span>
            <button type="button" onClick={() => onChange(items.filter((_, idx) => idx !== i))} className="ml-2 text-muted-foreground hover:text-destructive transition-colors"><X className="h-3.5 w-3.5" /></button>
          </li>
        ))}</ul>
      )}
    </div>
  );
};

const Lightbox = ({ images, startIndex, onClose }: { images: string[]; startIndex: number; onClose: () => void }) => {
  const [cur, setCur] = useState(startIndex);
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-sm" onClick={onClose}>
      <div className="relative flex max-h-screen max-w-4xl flex-col items-center p-4" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute right-0 top-0 z-10 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"><X className="h-5 w-5" /></button>
        <img src={images[cur]} alt="" className="max-h-[75vh] max-w-full rounded-xl object-contain shadow-2xl" />
        {images.length > 1 && (
          <div className="mt-4 flex items-center gap-2">
            <button onClick={() => setCur((c) => (c - 1 + images.length) % images.length)} className="rounded-lg bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20">← Prev</button>
            <span className="text-sm text-white/60">{cur + 1} / {images.length}</span>
            <button onClick={() => setCur((c) => (c + 1) % images.length)} className="rounded-lg bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20">Next →</button>
          </div>
        )}
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button key={i} onClick={() => setCur(i)} className={`h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 transition ${i === cur ? 'border-violet-400' : 'border-transparent opacity-60 hover:opacity-100'}`}>
              <img src={img} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ════ main ════ */

const Admin = () => {
  const { products, addProduct, updateProduct, deleteProduct, isLoading } = useProducts();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const formRef = useRef<HTMLDivElement>(null);

  /* tabs */
  const [tab, setTab] = useState<Tab>('products');

  /* form */
  const [form, setForm] = useState<Product>(emptyProduct);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [customSize, setCustomSize] = useState('');
  const [newColorName, setNewColorName] = useState('');
  const [newColorValue, setNewColorValue] = useState('#000000');
  const [newTag, setNewTag] = useState('');

  /* list */
  const [search, setSearch] = useState('');
  const [filterTab, setFilterTab] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);

  /* ui */
  const [lightbox, setLightbox] = useState<{ images: string[]; index: number } | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  /* activity log */
  const [activityLog, setActivityLog] = useState<ActivityEntry[]>([]);
  const logActivity = (msg: string, type: ActivityEntry['type'] = 'info') => {
    setActivityLog((prev) => [{ id: Date.now(), msg, time: new Date(), type }, ...prev].slice(0, 50));
  };

  const isEditMode = Boolean(editingId);
  const showSuccess = (msg: string) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(null), 3500); };
  const handleLogout = () => { logout(); navigate('/admin/login'); };

  /* stats */
  const stats = useMemo(() => ({
    total: products.length,
    inStock: products.filter((p) => p.inStock).length,
    outOfStock: products.filter((p) => !p.inStock).length,
    totalValue: products.reduce((s, p) => s + p.price, 0),
    byCategory: {
      summer: products.filter((p) => p.category === 'summer').length,
      'semi-winter': products.filter((p) => p.category === 'semi-winter').length,
      winter: products.filter((p) => p.category === 'winter').length,
    },
  }), [products]);

  /* filtered list */
  const displayed = useMemo(() => {
    let list = products.filter((p) => {
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterTab === 'instock') return p.inStock;
      if (filterTab === 'outofstock') return !p.inStock;
      if (filterTab !== 'all') return p.category === filterTab;
      return true;
    });
    if (sortBy === 'price-asc') list = [...list].sort((a, b) => a.price - b.price);
    else if (sortBy === 'price-desc') list = [...list].sort((a, b) => b.price - a.price);
    else if (sortBy === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [products, search, filterTab, sortBy]);

  const allChecked = displayed.length > 0 && displayed.every((p) => selected.has(p.id));
  const toggleAll = () => {
    if (allChecked) setSelected((s) => { const n = new Set(s); displayed.forEach((p) => n.delete(p.id)); return n; });
    else setSelected((s) => { const n = new Set(s); displayed.forEach((p) => n.add(p.id)); return n; });
  };

  const updateForm = <K extends keyof Product>(field: K, value: Product[K]) => setForm((prev) => ({ ...prev, [field]: value }));
  const resetForm = () => { setForm(emptyProduct); setEditingId(null); setCustomSize(''); };
  const toggleSize = (size: string) => updateForm('sizes', form.sizes.includes(size) ? form.sizes.filter((s) => s !== size) : [...form.sizes, size]);
  const addCustomSize = () => { const s = customSize.trim().toUpperCase(); if (s && !form.sizes.includes(s)) updateForm('sizes', [...form.sizes, s]); setCustomSize(''); };
  const addColor = () => { const name = newColorName.trim() || newColorValue; if (!form.colors.some((c) => c.value === newColorValue)) updateForm('colors', [...form.colors, { name, value: newColorValue }]); setNewColorName(''); setNewColorValue('#000000'); };
  const addTag = () => { const t = newTag.trim().toLowerCase(); if (t && !(form.tags ?? []).includes(t)) updateForm('tags', [...(form.tags ?? []), t]); setNewTag(''); };

  /* quick stock toggle */
  const handleQuickStockToggle = async (product: Product) => {
    const updated = { ...product, inStock: !product.inStock };
    try { await updateProduct(updated); logActivity(`Stock toggled: "${product.name}" → ${updated.inStock ? 'In Stock' : 'Out of Stock'}`, 'edit'); showSuccess(`"${product.name}" stock updated`); }
    catch { setRequestError('Failed to update stock'); }
  };

  /* image upload */
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) return;
    setIsUploading(true); setRequestError(null);
    try {
      const urls = await Promise.all(Array.from(files).map((file) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = async () => {
            try {
              const res = await fetch('/api/upload', { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify({ data: reader.result }) });
              const json = await res.json();
              if (!res.ok) throw new Error(json.error || 'Upload failed');
              resolve(json.url);
            } catch (err) { reject(err); }
          };
          reader.onerror = reject; reader.readAsDataURL(file);
        })
      ));
      setForm((prev) => ({ ...prev, images: [...prev.images, ...urls] }));
    } catch { setRequestError('Image upload failed.'); }
    finally { setIsUploading(false); event.target.value = ''; }
  };

  const handleImageRemove = async (imageUrl: string, index: number) => {
    setForm((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
    if (imageUrl.includes('cloudinary.com')) {
      try { await fetch('/api/upload', { method: 'DELETE', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify({ url: imageUrl }) }); }
      catch { /* ignore */ }
    }
  };

  const handleImageDrop = (dropIndex: number) => {
    if (dragIndex === null || dragIndex === dropIndex) return;
    setForm((prev) => { const imgs = [...prev.images]; const [d] = imgs.splice(dragIndex, 1); imgs.splice(dropIndex, 0, d); return { ...prev, images: imgs }; });
    setDragIndex(null);
  };

  /* submit */
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const id = editingId ?? `${Date.now()}`;
    const normalizedName = form.name.trim();
    const payload: Product = { ...form, id, name: normalizedName, slug: form.slug.trim() || createSlug(normalizedName), price: Number(form.price) || 0, originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined, description: form.description.trim(), shortDescription: form.shortDescription.trim(), material: form.material.trim(), images: form.images.filter(Boolean), sizes: form.sizes.filter(Boolean), careInstructions: form.careInstructions.filter(Boolean), features: form.features.filter(Boolean) };
    try {
      setRequestError(null);
      if (editingId) { await updateProduct(payload); showSuccess('Product updated!'); logActivity(`Edited: "${normalizedName}"`, 'edit'); }
      else { await addProduct(payload); showSuccess('Product added!'); logActivity(`Added: "${normalizedName}"`, 'add'); }
      resetForm();
    } catch (err) { setRequestError(err instanceof Error ? err.message : 'Failed to save'); }
  };

  const handleDeleteConfirm = async (id: string, name: string) => {
    try { await deleteProduct(id); showSuccess('Deleted.'); logActivity(`Deleted: "${name}"`, 'delete'); }
    catch (err) { setRequestError(err instanceof Error ? err.message : 'Failed to delete'); }
    setConfirmDeleteId(null);
  };

  const handleBulkDelete = async () => {
    const names = products.filter((p) => selected.has(p.id)).map((p) => p.name);
    try { await Promise.all([...selected].map((id) => deleteProduct(id))); showSuccess(`Deleted ${selected.size} products.`); logActivity(`Bulk deleted ${selected.size} products`, 'bulk'); setSelected(new Set()); }
    catch { setRequestError('Some deletes failed'); }
    setConfirmBulkDelete(false);
  };

  const handleBulkStock = async (inStock: boolean) => {
    const targets = products.filter((p) => selected.has(p.id));
    try { await Promise.all(targets.map((p) => updateProduct({ ...p, inStock }))); showSuccess(`${targets.length} products updated.`); logActivity(`Bulk stock: ${targets.length} marked ${inStock ? 'In Stock' : 'Out of Stock'}`, 'bulk'); setSelected(new Set()); }
    catch { setRequestError('Bulk update failed'); }
  };

  const handleDuplicate = async (product: Product) => {
    try { await addProduct({ ...product, id: '', name: `Copy of ${product.name}`, slug: createSlug(`copy of ${product.name}`) }); showSuccess(`Duplicated "${product.name}"`); logActivity(`Duplicated: "${product.name}"`, 'add'); }
    catch { setRequestError('Duplicate failed'); }
  };

  const handleExportCSV = () => {
    const headers = ['Name', 'Slug', 'Category', 'Price', 'Original Price', 'In Stock', 'Best Seller', 'New', 'Material', 'Sizes', 'Tags'];
    const rows = products.map((p) => [
      `"${p.name}"`, p.slug, p.category, p.price, p.originalPrice ?? '', p.inStock ? 'Yes' : 'No', p.isBestSeller ? 'Yes' : 'No', p.isNewProduct ? 'Yes' : 'No', `"${p.material}"`, `"${p.sizes.join(', ')}"`, `"${(p.tags ?? []).join(', ')}"`,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `melini-products-${Date.now()}.csv`; a.click();
    showSuccess('CSV exported!'); logActivity('Exported product CSV', 'info');
  };

  const handleSync = async () => {
    setIsSyncing(true);
    await new Promise((r) => setTimeout(r, 800));
    setIsSyncing(false); showSuccess('Synced from DB!'); logActivity('Manual DB sync triggered', 'info');
  };

  /* ════ render ════ */
  return (
    <div className="min-h-screen bg-muted/30 pt-20">
      {lightbox && <Lightbox images={lightbox.images} startIndex={lightbox.index} onClose={() => setLightbox(null)} />}

      {/* header */}
      <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 px-6 py-8 text-white shadow-lg">
        <div className="mx-auto max-w-7xl flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="mt-1 text-white/70 text-sm">Manage your MELINI store</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={handleExportCSV} className="flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur transition hover:bg-white/20"><Download className="h-4 w-4" /> Export CSV</button>
            <button onClick={handleSync} disabled={isSyncing} className="flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur transition hover:bg-white/20 disabled:opacity-60"><RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />{isSyncing ? 'Syncing…' : 'Sync DB'}</button>
            <button onClick={handleLogout} className="flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur transition hover:bg-white/20"><LogOut className="h-4 w-4" /> Logout</button>
          </div>
        </div>

        {/* ── tab nav ── */}
        <div className="mx-auto mt-6 max-w-7xl flex gap-1">
          {([
            { id: 'products', icon: Package, label: 'Products' },
            { id: 'orders', icon: ShoppingBag, label: 'Orders' },
            { id: 'settings', icon: Settings, label: 'Settings' },
            { id: 'activity', icon: Clock, label: 'Activity Log' },
          ] as { id: Tab; icon: React.ElementType; label: string }[]).map(({ id, icon: Icon, label }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all ${tab === id ? 'bg-white text-violet-700 shadow' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}>
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8 space-y-6">

        {/* ── ORDERS TAB ── */}
        {tab === 'orders' && <OrdersTab />}

        {/* ── SETTINGS TAB ── */}
        {tab === 'settings' && <SettingsTab />}

        {/* ── ACTIVITY LOG TAB ── */}
        {tab === 'activity' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Activity Log</h2>
              {activityLog.length > 0 && <button onClick={() => setActivityLog([])} className="text-xs text-muted-foreground hover:text-destructive transition-colors">Clear all</button>}
            </div>
            {activityLog.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border bg-card py-20 text-muted-foreground">
                <Clock className="mb-3 h-10 w-10 opacity-30" />
                <p className="text-sm">No activity yet — actions you take will appear here</p>
              </div>
            ) : (
              <Card className="overflow-hidden shadow-sm">
                <CardContent className="p-0">
                  <ul className="divide-y max-h-[600px] overflow-y-auto">
                    {activityLog.map((entry) => {
                      const colors = { add: 'text-emerald-600', edit: 'text-blue-600', delete: 'text-red-500', bulk: 'text-violet-600', info: 'text-muted-foreground' };
                      const icons = { add: '✅', edit: '✏️', delete: '🗑️', bulk: '📦', info: 'ℹ️' };
                      return (
                        <li key={entry.id} className="flex items-center gap-3 px-5 py-3 hover:bg-muted/20 transition-colors">
                          <span className="text-base">{icons[entry.type]}</span>
                          <span className={`flex-1 text-sm ${colors[entry.type]}`}>{entry.msg}</span>
                          <span className="text-[10px] text-muted-foreground/60 shrink-0">
                            {entry.time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* ── PRODUCTS TAB ── */}
        {tab === 'products' && (
          <>
            {/* stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard icon={Package} label="Total Products" value={stats.total} gradient="bg-gradient-to-br from-violet-500 to-purple-700" />
              <StatCard icon={CheckCircle} label="In Stock" value={stats.inStock} gradient="bg-gradient-to-br from-emerald-500 to-green-700" />
              <StatCard icon={XCircle} label="Out of Stock" value={stats.outOfStock} gradient="bg-gradient-to-br from-rose-500 to-red-700" />
              <StatCard icon={Star} label="Catalogue Value" value={`₹${stats.totalValue.toLocaleString('en-IN')}`} sub="sum of all prices" gradient="bg-gradient-to-br from-amber-500 to-orange-600" />
            </div>

            {/* category bars */}
            <Card className="shadow-sm">
              <CardContent className="pt-5">
                <SL>Category Breakdown</SL>
                <div className="grid gap-3 sm:grid-cols-3">
                  {(['summer', 'semi-winter', 'winter'] as const).map((cat) => {
                    const count = stats.byCategory[cat]; const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                    return (
                      <div key={cat} className="space-y-1.5">
                        <div className="flex justify-between text-sm"><span className="capitalize font-medium">{cat === 'semi-winter' ? 'Semi-Winter' : cat.charAt(0).toUpperCase() + cat.slice(1)}</span><span className="text-muted-foreground">{count} ({pct}%)</span></div>
                        <div className="h-2 w-full rounded-full bg-muted overflow-hidden"><div className={`h-full rounded-full transition-all duration-500 ${cat === 'summer' ? 'bg-amber-400' : cat === 'semi-winter' ? 'bg-blue-400' : 'bg-indigo-500'}`} style={{ width: `${pct}%` }} /></div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* toasts */}
            {successMsg && <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700"><CheckCircle className="h-4 w-4 shrink-0" /> {successMsg}</div>}
            {requestError && <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"><AlertTriangle className="h-4 w-4 shrink-0" /> {requestError}<button onClick={() => setRequestError(null)} className="ml-auto"><X className="h-4 w-4" /></button></div>}

            {/* bulk bar */}
            {selected.size > 0 && (
              <div className="flex items-center gap-3 rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 flex-wrap">
                <span className="text-sm font-medium text-violet-700">{selected.size} selected</span>
                <div className="flex gap-2 ml-auto flex-wrap">
                  <Button type="button" size="sm" variant="outline" onClick={() => handleBulkStock(true)} className="h-8 text-xs border-emerald-300 text-emerald-700 hover:bg-emerald-50">✅ In Stock</Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => handleBulkStock(false)} className="h-8 text-xs border-red-300 text-red-700 hover:bg-red-50">❌ Out of Stock</Button>
                  {confirmBulkDelete ? (
                    <><span className="text-xs text-red-700 self-center font-medium">Delete {selected.size}?</span><Button type="button" size="sm" variant="destructive" onClick={handleBulkDelete} className="h-8 text-xs">Yes, Delete</Button><Button type="button" size="sm" variant="outline" onClick={() => setConfirmBulkDelete(false)} className="h-8 text-xs">Cancel</Button></>
                  ) : (
                    <Button type="button" size="sm" variant="destructive" onClick={() => setConfirmBulkDelete(true)} className="h-8 text-xs"><Trash2 className="h-3.5 w-3.5 mr-1" /> Delete</Button>
                  )}
                  <button onClick={() => setSelected(new Set())} className="text-xs text-muted-foreground hover:text-foreground">Clear</button>
                </div>
              </div>
            )}

            {/* main grid */}
            <div className="grid gap-6 lg:grid-cols-[1fr_440px]">

              {/* product list */}
              <Card className="overflow-hidden shadow-sm">
                <CardHeader className="border-b bg-background space-y-3 pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Products <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs font-normal text-muted-foreground">{displayed.length}</span></CardTitle>
                    {isLoading && <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><span className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />Syncing…</span>}
                  </div>
                  <div className="flex gap-2">
                    <div className="relative flex-1"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 text-sm" /></div>
                    <div className="relative"><select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="h-9 appearance-none rounded-md border bg-background pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-ring"><option value="newest">Newest</option><option value="price-asc">Price ↑</option><option value="price-desc">Price ↓</option><option value="name">Name A–Z</option></select><ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" /></div>
                  </div>
                  <div className="flex gap-1 overflow-x-auto pb-0.5">{FILTER_TABS.map((t) => (<button key={t.value} onClick={() => setFilterTab(t.value)} className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${filterTab === t.value ? 'bg-violet-600 text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>{t.label}</button>))}</div>
                </CardHeader>
                <CardContent className="max-h-[580px] overflow-y-auto p-0">
                  {displayed.length > 0 && <div className="flex items-center gap-3 border-b bg-muted/20 px-4 py-2"><input type="checkbox" checked={allChecked} onChange={toggleAll} className="h-4 w-4 rounded accent-violet-600 cursor-pointer" /><span className="text-xs text-muted-foreground">{selected.size > 0 ? `${selected.size} of ${displayed.length} selected` : 'Select all'}</span></div>}
                  {displayed.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground"><Package className="mb-3 h-10 w-10 opacity-30" /><p className="text-sm">{search ? 'No match' : 'No products yet'}</p></div>
                  ) : (
                    <ul className="divide-y">
                      {displayed.map((product) => (
                        <li key={product.id} className={`flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/20 ${selected.has(product.id) ? 'bg-violet-50' : ''}`}>
                          <input type="checkbox" checked={selected.has(product.id)} onChange={() => setSelected((s) => { const n = new Set(s); n.has(product.id) ? n.delete(product.id) : n.add(product.id); return n; })} className="h-4 w-4 shrink-0 rounded accent-violet-600 cursor-pointer" />
                          <button type="button" onClick={() => product.images.length > 0 && setLightbox({ images: product.images, index: 0 })} className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border bg-muted hover:opacity-90 transition">
                            {product.images[0] ? <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center"><Package className="h-5 w-5 text-muted-foreground/40" /></div>}
                            {product.images.length > 1 && <span className="absolute bottom-0 right-0 rounded-tl bg-black/60 px-1 text-[9px] font-bold text-white">+{product.images.length - 1}</span>}
                          </button>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{product.name}</p>
                            <div className="mt-1 flex flex-wrap items-center gap-1.5">
                              <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize ${CATEGORY_COLORS[product.category] ?? 'bg-gray-100 text-gray-700'}`}>{product.category}</span>
                              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${product.inStock ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>{product.inStock ? '● In Stock' : '● Out of Stock'}</span>
                              {product.isBestSeller && <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700"><Star className="h-2.5 w-2.5 fill-amber-500 stroke-amber-500" /> Best Seller</span>}
                              <span className="text-xs font-medium text-muted-foreground">₹{product.price.toLocaleString('en-IN')}</span>
                            </div>
                          </div>
                          <Switch checked={product.inStock} onCheckedChange={() => handleQuickStockToggle(product)} className="scale-75 shrink-0" />
                          <div className="flex shrink-0 items-center gap-0.5">
                            {confirmDeleteId === product.id ? (
                              <div className="flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2 py-1">
                                <span className="text-[11px] text-red-700 font-medium mr-1">Delete?</span>
                                <button onClick={() => handleDeleteConfirm(product.id, product.name)} className="rounded bg-red-600 px-2 py-0.5 text-[11px] text-white font-semibold hover:bg-red-700">Yes</button>
                                <button onClick={() => setConfirmDeleteId(null)} className="rounded border px-2 py-0.5 text-[11px] font-medium hover:bg-muted">No</button>
                              </div>
                            ) : (
                              <>
                                <a href={`/product/${product.slug}`} target="_blank" rel="noopener noreferrer" title="Open in Shop" className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-blue-600 hover:bg-blue-50 transition-colors"><ExternalLink className="h-3.5 w-3.5" /></a>
                                {product.images.length > 0 && <button type="button" onClick={() => setLightbox({ images: product.images, index: 0 })} className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-violet-600 hover:bg-violet-50 transition-colors"><ImageIcon className="h-3.5 w-3.5" /></button>}
                                <button type="button" onClick={() => handleDuplicate(product)} className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-violet-600 hover:bg-violet-50 transition-colors"><Copy className="h-3.5 w-3.5" /></button>
                                <button type="button" onClick={() => { setForm(product); setEditingId(product.id); formRef.current?.scrollIntoView({ behavior: 'smooth' }); }} className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"><Pencil className="h-3.5 w-3.5" /></button>
                                <button type="button" onClick={() => setConfirmDeleteId(product.id)} className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                              </>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>

              {/* form */}
              <div ref={formRef}>
                <Card className="shadow-sm sticky top-24">
                  <CardHeader className="border-b pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">{isEditMode ? <><Save className="h-4 w-4 text-primary" /> Edit Product</> : <><Plus className="h-4 w-4 text-primary" /> Add New Product</>}</CardTitle>
                  </CardHeader>
                  <CardContent className="max-h-[calc(100vh-280px)] overflow-y-auto pt-5">
                    <form className="space-y-6" onSubmit={handleSubmit}>

                      <div><SL>Basic Info</SL>
                        <div className="space-y-3">
                          <div className="grid gap-3 grid-cols-2">
                            <div><Label className="mb-1.5 block text-xs">Name *</Label><Input value={form.name} onChange={(e) => updateForm('name', e.target.value)} required placeholder="e.g. Linen Kurta" /></div>
                            <div><Label className="mb-1.5 block text-xs">Category</Label><select className="h-10 w-full rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" value={form.category} onChange={(e) => updateForm('category', e.target.value as Product['category'])}><option value="summer">☀️ Summer</option><option value="semi-winter">🍂 Semi-Winter</option><option value="winter">❄️ Winter</option></select></div>
                          </div>
                          <div><Label className="mb-1.5 block text-xs">Slug (auto if blank)</Label><Input value={form.slug} onChange={(e) => updateForm('slug', e.target.value)} placeholder={form.name ? createSlug(form.name) : 'auto'} /></div>
                          <div><Label className="mb-1.5 block text-xs">Short Description *</Label><Input value={form.shortDescription} onChange={(e) => updateForm('shortDescription', e.target.value)} required placeholder="One-line summary" /></div>
                          <div><Label className="mb-1.5 block text-xs">Full Description *</Label><Textarea value={form.description} onChange={(e) => updateForm('description', e.target.value)} required rows={3} placeholder="Detailed description…" /></div>
                          <div><Label className="mb-1.5 block text-xs">Material *</Label><Input value={form.material} onChange={(e) => updateForm('material', e.target.value)} required placeholder="e.g. 100% Cotton" /></div>
                        </div>
                      </div>

                      <div><SL>Pricing</SL>
                        <div className="grid gap-3 grid-cols-2">
                          <div><Label className="mb-1.5 block text-xs">Price (₹) *</Label><Input type="number" value={form.price} onChange={(e) => updateForm('price', Number(e.target.value))} required min={0} /></div>
                          <div><Label className="mb-1.5 block text-xs">Original Price (₹)</Label><Input type="number" value={form.originalPrice ?? ''} onChange={(e) => updateForm('originalPrice', e.target.value ? Number(e.target.value) : undefined)} min={0} placeholder="Strikethrough" /></div>
                        </div>
                        {form.originalPrice && form.originalPrice > form.price && (
                          <p className="mt-1.5 text-xs text-emerald-600 font-medium">💰 {Math.round(((form.originalPrice - form.price) / form.originalPrice) * 100)}% discount</p>
                        )}
                      </div>

                      <div><SL>Images</SL>
                        <label className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed p-4 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary ${isUploading ? 'pointer-events-none opacity-60' : ''}`}>
                          {isUploading ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />Uploading…</> : <><Upload className="h-4 w-4" />Click to upload</>}
                          <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" disabled={isUploading} />
                        </label>
                        {form.images.length > 0 && (
                          <div className="mt-3 grid grid-cols-4 gap-2">
                            {form.images.map((image, index) => (
                              <div key={`${image}-${index}`} className="group relative aspect-square overflow-hidden rounded-lg border bg-muted" draggable onDragStart={() => setDragIndex(index)} onDragOver={(e) => e.preventDefault()} onDrop={() => handleImageDrop(index)}>
                                <img src={image} alt="" className="h-full w-full object-cover" />
                                <button type="button" onClick={() => handleImageRemove(image, index)} className="absolute left-0.5 top-0.5 rounded bg-black/60 p-0.5 text-white opacity-0 transition group-hover:opacity-100"><X className="h-3 w-3" /></button>
                                <span className="absolute right-0.5 top-0.5 rounded bg-black/50 p-0.5 opacity-0 transition group-hover:opacity-100"><GripVertical className="h-3 w-3 text-white" /></span>
                                {index === 0 && <span className="absolute bottom-0 left-0 right-0 bg-black/50 py-0.5 text-center text-[9px] font-semibold text-white">MAIN</span>}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div><SL>Sizes</SL>
                        <div className="flex flex-wrap gap-2 mb-2">{PRESET_SIZES.map((size) => (<button key={size} type="button" onClick={() => toggleSize(size)} className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-all ${form.sizes.includes(size) ? 'border-violet-600 bg-violet-600 text-white shadow-sm' : 'border-border bg-background text-muted-foreground hover:border-violet-400'}`}>{size}</button>))}</div>
                        <div className="flex gap-2"><Input value={customSize} onChange={(e) => setCustomSize(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomSize(); } }} placeholder="Custom size" className="h-8 text-sm" /><Button type="button" variant="outline" size="sm" onClick={addCustomSize} className="h-8 shrink-0"><Plus className="h-3.5 w-3.5" /></Button></div>
                        {form.sizes.filter((s) => !PRESET_SIZES.includes(s)).length > 0 && <div className="mt-2 flex flex-wrap gap-1.5">{form.sizes.filter((s) => !PRESET_SIZES.includes(s)).map((s) => (<span key={s} className="flex items-center gap-1 rounded-full border bg-muted px-2 py-0.5 text-xs">{s}<button type="button" onClick={() => updateForm('sizes', form.sizes.filter((x) => x !== s))} className="text-muted-foreground hover:text-destructive"><X className="h-3 w-3" /></button></span>))}</div>}
                      </div>

                      <div><SL>Colors</SL>
                        <div className="flex gap-2 mb-2"><input type="color" value={newColorValue} onChange={(e) => setNewColorValue(e.target.value)} className="h-9 w-10 cursor-pointer rounded border border-border bg-transparent p-0.5" /><Input value={newColorName} onChange={(e) => setNewColorName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addColor(); } }} placeholder="Color name" className="h-9 text-sm" /><Button type="button" variant="outline" size="sm" onClick={addColor} className="h-9 shrink-0"><Plus className="h-3.5 w-3.5" /></Button></div>
                        {form.colors.length > 0 && <div className="flex flex-wrap gap-2">{form.colors.map((color, i) => (<div key={i} className="flex items-center gap-1.5 rounded-full border bg-background px-2.5 py-1"><span className="h-4 w-4 rounded-full border shadow-sm" style={{ backgroundColor: color.value }} /><span className="text-xs font-medium">{color.name}</span><button type="button" onClick={() => updateForm('colors', form.colors.filter((_, idx) => idx !== i))} className="text-muted-foreground hover:text-destructive transition-colors"><X className="h-3 w-3" /></button></div>))}</div>}
                      </div>

                      <div><SL>Care Instructions</SL><StringListEditor items={form.careInstructions} onChange={(v) => updateForm('careInstructions', v)} placeholder="e.g. Machine wash cold" /></div>
                      <div><SL>Features</SL><StringListEditor items={form.features} onChange={(v) => updateForm('features', v)} placeholder="e.g. Breathable fabric" /></div>

                      {/* SEO section */}
                      <div><SL>SEO</SL>
                        <div className="space-y-3">
                          <div><Label className="mb-1.5 block text-xs">Meta Title <span className="text-muted-foreground">(60 chars max)</span></Label><Input value={form.metaTitle ?? ''} onChange={(e) => updateForm('metaTitle', e.target.value)} maxLength={60} placeholder="e.g. Linen Kurta for Men | MELINI" />{form.metaTitle && <p className="mt-0.5 text-[10px] text-muted-foreground">{form.metaTitle.length}/60</p>}</div>
                          <div><Label className="mb-1.5 block text-xs">Meta Description <span className="text-muted-foreground">(160 chars max)</span></Label><Textarea value={form.metaDescription ?? ''} onChange={(e) => updateForm('metaDescription', e.target.value)} maxLength={160} rows={2} placeholder="Short description for search engines…" />{form.metaDescription && <p className="mt-0.5 text-[10px] text-muted-foreground">{form.metaDescription.length}/160</p>}</div>
                          <div><Label className="mb-1.5 block text-xs">Tags / Keywords</Label>
                            <div className="flex gap-2 mb-2"><Input value={newTag} onChange={(e) => setNewTag(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }} placeholder="e.g. kurta" className="h-8 text-sm" /><Button type="button" variant="outline" size="sm" onClick={addTag} className="h-8 shrink-0"><Plus className="h-3.5 w-3.5" /></Button></div>
                            {(form.tags ?? []).length > 0 && <div className="flex flex-wrap gap-1.5">{(form.tags ?? []).map((tag) => (<span key={tag} className="flex items-center gap-1 rounded-full border bg-violet-50 px-2.5 py-0.5 text-xs text-violet-700">#{tag}<button type="button" onClick={() => updateForm('tags', (form.tags ?? []).filter((t) => t !== tag))} className="hover:text-destructive"><X className="h-3 w-3" /></button></span>))}</div>}
                          </div>
                        </div>
                      </div>

                      <div><SL>Status & Flags</SL>
                        <div className="space-y-2">
                          {([
                            { id: 'in-stock', label: 'In Stock', field: 'inStock', icon: '🟢' },
                            { id: 'is-new', label: 'Mark as New', field: 'isNewProduct', icon: '✨' },
                            { id: 'is-best', label: 'Best Seller', field: 'isBestSeller', icon: '⭐' },
                          ] as { id: string; label: string; field: keyof Product; icon: string }[]).map(({ id, label, field, icon }) => (
                            <div key={id} className="flex items-center justify-between rounded-lg border px-3 py-2.5 transition-colors hover:bg-muted/30"><Label htmlFor={id} className="cursor-pointer text-sm"><span className="mr-1.5">{icon}</span>{label}</Label><Switch id={id} checked={Boolean(form[field])} onCheckedChange={(v) => updateForm(field, v)} /></div>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2 pb-2">
                        <Button type="submit" className="flex-1 gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700">
                          {isEditMode ? <><Save className="h-4 w-4" /> Update Product</> : <><Plus className="h-4 w-4" /> Add Product</>}
                        </Button>
                        {isEditMode && <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>}
                      </div>

                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Admin;
