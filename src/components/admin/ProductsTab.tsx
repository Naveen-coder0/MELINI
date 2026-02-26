import { useMemo, useRef, useState } from 'react';
import {
    AlertTriangle, CheckCircle, ChevronDown, Package, Pencil, Plus,
    RefreshCw, Save, Search, Trash2, Upload, X, ChevronLeft, ChevronRight
} from 'lucide-react';
import { Product } from '@/data/products';
import { useProducts } from '@/contexts/ProductContext';
import { authHeaders } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

/* ════ components ════ */

const StatCard = ({ icon: Icon, label, value, sub, gradient }: {
    icon: React.ElementType; label: string; value: string | number; sub?: string; gradient: string;
}) => (
    <div className={`relative overflow-hidden rounded-2xl p-5 text-white shadow-md ${gradient}`}>
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-white/70">{label}</p>
                <p className="mt-1 text-3xl font-bold">{value}</p>
                {sub && <p className="mt-0.5 text-xs text-white/60">{sub}</p>}
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                <Icon className="h-6 w-6" />
            </div>
        </div>
        <div className="pointer-events-none absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10" />
    </div>
);

const SL = ({ children }: { children: React.ReactNode }) => (
    <p className="mb-2.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">{children}</p>
);

const Lightbox = ({ images, startIndex, onClose }: { images: string[]; startIndex: number; onClose: () => void }) => {
    const [cur, setCur] = useState(startIndex);
    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-sm" onClick={onClose}>
            <div className="relative flex max-h-screen max-w-4xl flex-col items-center p-4" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute right-0 top-0 z-10 rounded-full bg-white/10 p-2 text-white hover:bg-white/20">
                    <X className="h-5 w-5" />
                </button>
                <img src={images[cur]} alt="" className="max-h-[75vh] max-w-full rounded-xl object-contain shadow-2xl" />
                {images.length > 1 && (
                    <div className="mt-4 flex items-center gap-2">
                        <button
                            onClick={() => setCur(c => (c - 1 + images.length) % images.length)}
                            className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20 transition-colors"
                        >
                            <ChevronLeft className="h-4 w-4" /> Prev
                        </button>
                        <span className="text-sm font-bold text-white/60 min-w-[60px] text-center">{cur + 1} / {images.length}</span>
                        <button
                            onClick={() => setCur(c => (c + 1) % images.length)}
                            className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20 transition-colors"
                        >
                            Next <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                )}
                <div className="mt-3 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
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

/* ════ constants ════ */

const PRESET_SIZES = ['S', 'M', 'L', 'XL', 'XXL', '5XL'];
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
    colors: [{ name: 'Default', value: '#111111', images: [] }], inStock: true, material: '',
    careInstructions: ['Machine wash cold'], features: ['Comfort fit'],
    metaTitle: '', metaDescription: '', tags: [],
    articleNo: '',
    sizePricing: [{ size: 'S', price: 0, originalPrice: 0 }, { size: 'M', price: 0, originalPrice: 0 }, { size: 'L', price: 0, originalPrice: 0 }],
};

const createSlug = (n: string) =>
    n.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');

/* ════ component ════ */

export const ProductsTab = () => {
    const { products, addProduct, updateProduct, deleteProduct, isLoading } = useProducts();
    const formRef = useRef<HTMLDivElement>(null);

    /* state */
    const [form, setForm] = useState<Product>(emptyProduct);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [newColorName, setNewColorName] = useState('');
    const [newColorValue, setNewColorValue] = useState('#111111');
    const [search, setSearch] = useState('');
    const [filterTab, setFilterTab] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const [lightbox, setLightbox] = useState<{ images: string[]; index: number } | null>(null);
    const [requestError, setRequestError] = useState<string | null>(null);

    const isEditMode = Boolean(editingId);

    /* filtering / sorting */
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

    const allChecked = displayed.length > 0 && displayed.every((p) => selected.has(p.id!));
    const toggleAll = () => {
        if (allChecked) setSelected((s) => { const n = new Set(s); displayed.forEach((p) => n.delete(p.id!)); return n; });
        else setSelected((s) => { const n = new Set(s); displayed.forEach((p) => n.add(p.id!)); return n; });
    };

    /* form actions */
    const updateForm = <K extends keyof Product>(field: K, value: Product[K]) => setForm((prev) => ({ ...prev, [field]: value }));
    const resetForm = () => { setForm(emptyProduct); setEditingId(null); setRequestError(null); };

    const addColor = () => {
        const name = newColorName.trim() || 'Custom Color';
        if (!form.colors.some((c) => c.value === newColorValue)) {
            updateForm('colors', [...form.colors, { name, value: newColorValue, images: [] }]);
        }
        setNewColorName('');
        setNewColorValue('#111111');
    };

    const handleUpload = async (files: FileList | null): Promise<string[]> => {
        if (!files?.length) return [];
        setIsUploading(true); setRequestError(null);
        try {
            const headers = authHeaders();
            const urls = await Promise.all(Array.from(files).map(async (file) => {
                const formData = new FormData();
                formData.append('file', file);
                const res = await fetch(`${import.meta.env.VITE_API_URL || ""}/api/upload`, {
                    method: 'POST',
                    headers: { ...headers },
                    body: formData,
                });
                const json = await res.json();
                if (!res.ok) throw new Error(json.error || 'Upload failed');
                return json.url;
            }));
            return urls;
        } catch (err) {
            setRequestError(err instanceof Error ? err.message : 'Upload failed');
            return [];
        } finally {
            setIsUploading(false);
        }
    };

    const handleColorImageUpload = async (colorIdx: number, files: FileList | null) => {
        const urls = await handleUpload(files);
        if (urls.length > 0) {
            const updatedColors = [...form.colors];
            updatedColors[colorIdx] = {
                ...updatedColors[colorIdx],
                images: [...(updatedColors[colorIdx].images || []), ...urls]
            };
            updateForm('colors', updatedColors);
        }
    };

    const removeImage = (colorIdx: number, imgIdx: number) => {
        const updatedColors = [...form.colors];
        updatedColors[colorIdx].images = (updatedColors[colorIdx].images || []).filter((_, i) => i !== imgIdx);
        updateForm('colors', updatedColors);
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        const id = editingId ?? "";
        const normalizedName = form.name.trim();
        const sPrice = form.sizePricing?.find(sp => sp.size.toUpperCase() === 'S');
        const basePrice = sPrice?.price || (form.sizePricing && form.sizePricing.length > 0 ? form.sizePricing[0].price : 0);

        const payload: Product = {
            ...form,
            id,
            name: normalizedName,
            slug: form.slug.trim() || createSlug(normalizedName),
            price: basePrice,
            images: form.colors.flatMap(c => c.images || []) // Flat array for backward compatibility if needed
        };

        try {
            if (editingId) await updateProduct(payload);
            else await addProduct(payload);
            resetForm();
        } catch (err) {
            setRequestError(err instanceof Error ? err.message : 'Failed to save');
        }
    };

    if (isLoading) return <div className="p-12 text-center text-muted-foreground">Loading products...</div>;

    return (
        <div className="space-y-8 pb-10">
            {/* Stats Area */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard icon={Package} label="Total Products" value={products.length} gradient="bg-gradient-to-br from-violet-500 to-indigo-600" />
                <StatCard icon={CheckCircle} label="Active Items" value={products.filter(p => p.inStock).length} gradient="bg-gradient-to-br from-emerald-500 to-teal-600" />
                <StatCard icon={AlertTriangle} label="Out of Stock" value={products.filter(p => !p.inStock).length} gradient="bg-gradient-to-br from-rose-500 to-pink-600" />
                <StatCard icon={RefreshCw} label="Avg. Price" value={`₹${Math.round(products.reduce((acc, p) => acc + p.price, 0) / (products.length || 1)).toLocaleString()}`} gradient="bg-gradient-to-br from-amber-400 to-orange-600" />
            </div>

            <div className="grid gap-8 lg:grid-cols-[1fr_440px]">
                {/* Product List Card */}
                <Card className="border-none shadow-sm overflow-hidden bg-white">
                    <CardHeader className="border-b bg-slate-50/50 space-y-4">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base font-bold">Catalog Management</CardTitle>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => setSelected(new Set())} disabled={selected.size === 0} className="h-8 text-[10px] font-bold uppercase tracking-wider">Deselect ({selected.size})</Button>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row">
                            <div className="relative flex-1">
                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
                                <Input
                                    placeholder="Search products..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9 h-10 border-slate-200 focus:border-violet-500 focus:ring-violet-500"
                                />
                            </div>
                            <div className="relative">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="h-10 w-full sm:w-32 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-violet-500 appearance-none"
                                >
                                    <option value="newest">Newest First</option>
                                    <option value="price-asc">Price: Low to High</option>
                                    <option value="price-desc">Price: High to Low</option>
                                    <option value="name">Name: A–Z</option>
                                </select>
                                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            </div>
                        </div>

                        <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar">
                            {FILTER_TABS.map((t) => (
                                <button
                                    key={t.value}
                                    onClick={() => setFilterTab(t.value)}
                                    className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-bold transition-all ${filterTab === t.value ? 'bg-violet-600 text-white shadow-sm' : 'bg-white text-slate-500 hover:bg-slate-100'}`}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>
                    </CardHeader>

                    <CardContent className="p-0">
                        <div className="max-h-[700px] overflow-y-auto no-scrollbar">
                            {displayed.length > 0 && (
                                <div className="flex items-center gap-3 border-b bg-slate-50/30 px-6 py-2">
                                    <input type="checkbox" checked={allChecked} onChange={toggleAll} className="h-4 w-4 rounded border-slate-300 accent-violet-600" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                        {selected.size > 0 ? `${selected.size} items selected` : 'Select all products'}
                                    </span>
                                </div>
                            )}

                            {displayed.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground opacity-40">
                                    <Package className="mb-4 h-12 w-12" />
                                    <p className="font-medium">{search ? 'No products match your search' : 'Your catalog is empty'}</p>
                                </div>
                            ) : (
                                <ul className="divide-y divide-slate-100">
                                    {displayed.map((product) => (
                                        <li key={product.id} className={`group flex items-center gap-4 px-6 py-4 transition-colors hover:bg-slate-50/80 ${selected.has(product.id!) ? 'bg-violet-50/50' : ''}`}>
                                            <input
                                                type="checkbox"
                                                checked={selected.has(product.id!) || false}
                                                onChange={() => {
                                                    const n = new Set(selected);
                                                    if (n.has(product.id!)) n.delete(product.id!);
                                                    else n.add(product.id!);
                                                    setSelected(n);
                                                }}
                                                className="h-4 w-4 shrink-0 rounded border-slate-300 accent-violet-600"
                                            />

                                            <button
                                                type="button"
                                                onClick={() => product.images?.length > 0 && setLightbox({ images: product.images, index: 0 })}
                                                className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 group-hover:shadow-sm transition-all"
                                            >
                                                {product.images?.[0] ? (
                                                    <img src={product.images[0]} alt="" className="h-full w-full object-cover" />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center text-slate-300"><Package className="h-6 w-6" /></div>
                                                )}
                                            </button>

                                            <div className="min-w-0 flex-1">
                                                <h4 className="truncate text-sm font-bold text-slate-800">{product.name}</h4>
                                                <div className="mt-1 flex flex-wrap items-center gap-2">
                                                    <span className={`inline-flex items-center rounded-lg border px-2 py-0.5 text-[9px] font-bold uppercase tracking-tight ${CATEGORY_COLORS[product.category] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                                                        {product.category}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-slate-400">₹{product.price.toLocaleString()}</span>
                                                    {!product.inStock && (
                                                        <span className="rounded-lg bg-rose-50 px-2 py-0.5 text-[9px] font-bold text-rose-600 uppercase">Stock Out</span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex shrink-0 items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => { setForm(product); setEditingId(product.id!); formRef.current?.scrollIntoView({ behavior: 'smooth' }); }}
                                                    className="p-2 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => setConfirmDeleteId(product.id!)}
                                                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                                >
                                                    {confirmDeleteId === product.id ? <AlertTriangle className="h-4 w-4 animate-pulse" /> : <Trash2 className="h-4 w-4" />}
                                                </button>
                                            </div>

                                            <div className="w-12 flex justify-end">
                                                <Switch
                                                    checked={product.inStock}
                                                    onCheckedChange={() => updateProduct({ ...product, inStock: !product.inStock })}
                                                    className="scale-75"
                                                />
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Editor Card */}
                <div ref={formRef} className="space-y-6">
                    <Card className="border-none shadow-sm bg-white sticky top-24">
                        <CardHeader className="border-b">
                            <CardTitle className="text-base font-bold flex items-center justify-between">
                                {isEditMode ? 'Modify Product' : 'Create Product'}
                                {isEditMode && <button onClick={resetForm} className="text-[10px] text-slate-400 hover:text-slate-600 uppercase">Clear</button>}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {requestError && (
                                    <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg text-rose-600 text-xs font-bold animate-in slide-in-from-top-1">
                                        Error: {requestError}
                                    </div>
                                )}

                                <div>
                                    <SL>Identity & Details</SL>
                                    <div className="grid gap-4">
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-bold uppercase text-slate-400">Product Name</Label>
                                            <Input value={form.name} onChange={(e) => updateForm('name', e.target.value)} required placeholder="Silk Banarasi Saree" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <Label className="text-[10px] font-bold uppercase text-slate-400">Category</Label>
                                                <select
                                                    className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm focus:ring-2 focus:ring-violet-500 appearance-none"
                                                    value={form.category}
                                                    onChange={(e) => updateForm('category', e.target.value as Product['category'])}
                                                >
                                                    <option value="summer">Summer Wear</option>
                                                    <option value="semi-winter">Semi-Winter</option>
                                                    <option value="winter">Winter Wear</option>
                                                </select>
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-[10px] font-bold uppercase text-slate-400">Material</Label>
                                                <Input value={form.material} onChange={(e) => updateForm('material', e.target.value)} placeholder="Pure Mulmul Cotton" />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-bold uppercase text-slate-400">Short Pitch</Label>
                                            <Input value={form.shortDescription} onChange={(e) => updateForm('shortDescription', e.target.value)} placeholder="Breezy cotton saree for summer elegance" />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <SL>Size & Specific Pricing</SL>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {PRESET_SIZES.map((size) => (
                                            <button
                                                key={size}
                                                type="button"
                                                onClick={() => {
                                                    const has = form.sizes.includes(size);
                                                    if (has) {
                                                        updateForm('sizes', form.sizes.filter(s => s !== size));
                                                        updateForm('sizePricing', form.sizePricing.filter(sp => sp.size !== size));
                                                    } else {
                                                        updateForm('sizes', [...form.sizes, size]);
                                                        updateForm('sizePricing', [...form.sizePricing, { size, price: 0, originalPrice: 0 }]);
                                                    }
                                                }}
                                                className={`h-9 w-10 rounded-lg border text-xs font-bold transition-all ${form.sizes.includes(size) ? 'bg-violet-600 text-white border-violet-600 shadow-md scale-105' : 'bg-white text-slate-400 border-slate-200'}`}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-dashed border-slate-200">
                                        {form.sizes.length === 0 ? (
                                            <p className="text-[10px] text-center text-slate-400 italic">Select sizes above to set prices</p>
                                        ) : form.sizes.map((size) => {
                                            const sp = form.sizePricing.find(x => x.size === size);
                                            return (
                                                <div key={size} className="flex gap-3 items-center">
                                                    <span className="w-8 text-[11px] font-bold text-violet-600">{size}</span>
                                                    <div className="flex-1 grid grid-cols-2 gap-2">
                                                        <Input
                                                            type="number"
                                                            placeholder="Sale ₹"
                                                            className="h-8 text-[11px] bg-white border-slate-200"
                                                            value={sp?.price || 0}
                                                            onChange={(e) => updateForm('sizePricing', form.sizePricing.map(x => x.size === size ? { ...x, price: Number(e.target.value) } : x))}
                                                        />
                                                        <Input
                                                            type="number"
                                                            placeholder="MRP ₹"
                                                            className="h-8 text-[11px] bg-white border-slate-200"
                                                            value={sp?.originalPrice || 0}
                                                            onChange={(e) => updateForm('sizePricing', form.sizePricing.map(x => x.size === size ? { ...x, originalPrice: Number(e.target.value) } : x))}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div>
                                    <SL>Visual Variants</SL>
                                    <div className="p-4 bg-slate-50 rounded-xl border space-y-4">
                                        <div className="flex gap-2">
                                            <Input
                                                className="bg-white"
                                                placeholder="Color Name (e.g. Royal Blue)"
                                                value={newColorName}
                                                onChange={(e) => setNewColorName(e.target.value)}
                                            />
                                            <Input
                                                type="color"
                                                className="h-10 w-14 p-1 rounded-md cursor-pointer bg-white"
                                                value={newColorValue}
                                                onChange={(e) => setNewColorValue(e.target.value)}
                                            />
                                            <Button type="button" onClick={addColor} size="icon" className="h-10 w-10 shrink-0"><Plus className="h-4 w-4" /></Button>
                                        </div>

                                        <div className="grid gap-3">
                                            {form.colors.map((color, i) => (
                                                <div key={i} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm animate-in fade-in zoom-in-95">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-4 w-4 rounded-full border shadow-inner" style={{ backgroundColor: color.value }} />
                                                            <span className="text-xs font-bold">{color.name}</span>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => updateForm('colors', form.colors.filter((_, idx) => idx !== i))}
                                                            className="text-slate-300 hover:text-rose-500 transition-colors"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </button>
                                                    </div>

                                                    <div className="flex flex-wrap gap-2 mb-3">
                                                        {(color.images || []).map((img, imgIdx) => (
                                                            <div key={imgIdx} className="relative group h-14 w-14 rounded-md overflow-hidden border border-slate-100">
                                                                <img src={img} className="h-full w-full object-cover" />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeImage(i, imgIdx)}
                                                                    className="absolute top-0 right-0 p-0.5 bg-rose-500 text-white rounded-bl opacity-0 group-hover:opacity-100 transition-opacity"
                                                                >
                                                                    <X className="h-2 w-2" />
                                                                </button>
                                                            </div>
                                                        ))}
                                                        <label className="flex h-14 w-14 items-center justify-center rounded-md border-2 border-dashed border-slate-200 hover:border-violet-300 hover:bg-violet-50 transition-all cursor-pointer">
                                                            <Upload className="h-4 w-4 text-slate-300" />
                                                            <input type="file" multiple className="hidden" onChange={(e) => handleColorImageUpload(i, e.target.files)} />
                                                        </label>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4 border-t">
                                    <Button type="submit" className="flex-1 bg-violet-600 hover:bg-violet-700 h-11" disabled={isUploading}>
                                        {isUploading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                                        {isEditMode ? 'Save Product' : 'Create Product'}
                                    </Button>
                                    {isEditMode && <Button type="button" variant="outline" onClick={resetForm} className="h-11">Cancel</Button>}
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {lightbox && <Lightbox images={lightbox.images} startIndex={lightbox.index} onClose={() => setLightbox(null)} />}

            {/* Confirmation Dialog Placeholder */}
            {confirmDeleteId && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 p-4">
                    <Card className="max-w-sm w-full animate-in zoom-in-95">
                        <CardHeader>
                            <CardTitle className="text-base text-rose-600">Delete Product?</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0 space-y-6">
                            <p className="text-sm text-slate-500">This action will permanently remove this item from your catalog. It cannot be undone.</p>
                            <div className="flex gap-2">
                                <Button variant="destructive" className="flex-1" onClick={() => { deleteProduct(confirmDeleteId); setConfirmDeleteId(null); }}>Delete Permanently</Button>
                                <Button variant="outline" className="flex-1" onClick={() => setConfirmDeleteId(null)}>Cancel</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};
