import { useState, useEffect } from 'react';
import { authHeaders } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Tag, Percent, Calendar, CheckCircle, XCircle } from 'lucide-react';

interface Coupon {
    id: string;
    code: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    minOrderAmount?: number;
    maxDiscountAmount?: number;
    expiresAt?: string;
    usageLimit?: number;
    usedCount: number;
    isActive: boolean;
}

export const MarketingTab = () => {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Form state
    const [newCoupon, setNewCoupon] = useState<Partial<Coupon>>({
        code: '',
        discountType: 'percentage',
        discountValue: 0,
        isActive: true,
        usedCount: 0
    });

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || ""}/api/admin/coupons`, { headers: authHeaders() });
            const data = await res.json();
            setCoupons(data.items || []);
        } catch (err) {
            console.error("Coupon fetch error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateCoupon = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || ""}/api/admin/coupons`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...authHeaders() },
                body: JSON.stringify(newCoupon),
            });
            if (res.ok) {
                fetchCoupons();
                setNewCoupon({ code: '', discountType: 'percentage', discountValue: 0, isActive: true, usedCount: 0 });
            }
        } catch (err) {
            console.error("Coupon create error:", err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteCoupon = async (id: string) => {
        if (!confirm('Are you sure you want to delete this coupon?')) return;
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || ""}/api/admin/coupons/${id}`, {
                method: 'DELETE',
                headers: authHeaders(),
            });
            if (res.ok) fetchCoupons();
        } catch (err) {
            console.error("Coupon delete error:", err);
        }
    };

    const toggleCouponStatus = async (coupon: Coupon) => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || ""}/api/admin/coupons/${coupon.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', ...authHeaders() },
                body: JSON.stringify({ isActive: !coupon.isActive }),
            });
            if (res.ok) fetchCoupons();
        } catch (err) {
            console.error("Coupon status toggle error:", err);
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-[1fr_350px]">
                {/* Coupon List */}
                <Card className="border-none shadow-sm overflow-hidden bg-white">
                    <CardHeader className="border-b bg-slate-50/50">
                        <CardTitle className="text-base font-bold flex items-center gap-2">
                            <Tag className="h-4 w-4 text-violet-600" />
                            Active Coupons
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {isLoading ? (
                            <div className="p-8 text-center text-sm text-muted-foreground">Loading coupons...</div>
                        ) : coupons.length === 0 ? (
                            <div className="p-12 text-center">
                                <Tag className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
                                <p className="text-sm text-muted-foreground">No coupons created yet.</p>
                            </div>
                        ) : (
                            <ul className="divide-y">
                                {coupons.map((c) => (
                                    <li key={c.id} className="p-4 hover:bg-muted/30 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600 font-bold">
                                                    {c.discountType === 'percentage' ? <Percent className="h-4 w-4" /> : '₹'}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono font-bold text-sm tracking-wider uppercase">{c.code}</span>
                                                        <span className={`h-1.5 w-1.5 rounded-full ${c.isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">
                                                        {c.discountValue}{c.discountType === 'percentage' ? '%' : ' OFF'}
                                                        {c.minOrderAmount ? ` • Min ₹${c.minOrderAmount}` : ''}
                                                        {c.expiresAt ? ` • Exp ${new Date(c.expiresAt).toLocaleDateString('en-IN')}` : ''}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right hidden sm:block">
                                                    <p className="text-xs font-bold">{c.usedCount} / {c.usageLimit || '∞'}</p>
                                                    <p className="text-[10px] text-muted-foreground uppercase tracking-tight">Usages</p>
                                                </div>
                                                <button
                                                    onClick={() => toggleCouponStatus(c)}
                                                    className={`p-2 rounded-lg transition-colors ${c.isActive ? 'text-emerald-600 hover:bg-emerald-50' : 'text-slate-400 hover:bg-slate-100'}`}
                                                >
                                                    {c.isActive ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteCoupon(c.id)}
                                                    className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>

                {/* Create Coupon Form */}
                <Card className="border-none shadow-sm bg-white sticky top-24 h-fit">
                    <CardHeader className="border-b">
                        <CardTitle className="text-base font-bold">New Coupon</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <form onSubmit={handleCreateCoupon} className="space-y-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold uppercase tracking-tight text-muted-foreground">Coupon Code</Label>
                                <Input
                                    placeholder="SUMMER25"
                                    className="uppercase font-mono"
                                    value={newCoupon.code}
                                    onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold uppercase tracking-tight text-muted-foreground">Type</Label>
                                    <select
                                        className="h-9 w-full rounded-md border bg-background px-3 text-sm focus:ring-2 focus:ring-ring"
                                        value={newCoupon.discountType}
                                        onChange={(e) => setNewCoupon({ ...newCoupon, discountType: e.target.value as Coupon['discountType'] })}
                                    >
                                        <option value="percentage">Percentage (%)</option>
                                        <option value="fixed">Fixed (₹)</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold uppercase tracking-tight text-muted-foreground">Value</Label>
                                    <Input
                                        type="number"
                                        placeholder="10"
                                        value={newCoupon.discountValue}
                                        onChange={(e) => setNewCoupon({ ...newCoupon, discountValue: Number(e.target.value) })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold uppercase tracking-tight text-muted-foreground">Min. Order Amount (₹)</Label>
                                <Input
                                    type="number"
                                    placeholder="0"
                                    value={newCoupon.minOrderAmount || ''}
                                    onChange={(e) => setNewCoupon({ ...newCoupon, minOrderAmount: Number(e.target.value) })}
                                />
                                <p className="text-[10px] text-muted-foreground italic">Optional: Leave 0 for no limit</p>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold uppercase tracking-tight text-muted-foreground">Max Discount Cap (₹)</Label>
                                <Input
                                    type="number"
                                    placeholder="e.g. 500"
                                    value={newCoupon.maxDiscountAmount || ''}
                                    onChange={(e) => setNewCoupon({ ...newCoupon, maxDiscountAmount: Number(e.target.value) })}
                                />
                                <p className="text-[10px] text-muted-foreground italic">Optional: Max discount for % type coupons</p>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold uppercase tracking-tight text-muted-foreground">Usage Limit</Label>
                                <Input
                                    type="number"
                                    placeholder="100"
                                    value={newCoupon.usageLimit || ''}
                                    onChange={(e) => setNewCoupon({ ...newCoupon, usageLimit: Number(e.target.value) })}
                                />
                                <p className="text-[10px] text-muted-foreground italic">Optional: Total times coupon can be used</p>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold uppercase tracking-tight text-muted-foreground">Expiry Date</Label>
                                <Input
                                    type="date"
                                    value={newCoupon.expiresAt ? newCoupon.expiresAt.slice(0, 10) : ''}
                                    onChange={(e) => setNewCoupon({ ...newCoupon, expiresAt: e.target.value })}
                                />
                            </div>
                            <Button type="submit" className="w-full mt-4" disabled={isSaving}>
                                {isSaving ? 'Saving...' : 'Create Coupon'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
