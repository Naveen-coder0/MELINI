import { useEffect, useState } from 'react';
import { authHeaders } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Package, ShoppingBag, XCircle, Clock } from 'lucide-react';

interface Order {
    _id: string;
    razorpayOrderId: string;
    razorpayPaymentId?: string;
    amount: number;
    currency: string;
    status: 'created' | 'paid' | 'failed' | 'shipped' | 'delivered';
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    items: { name: string; price: number; qty: number }[];
    createdAt: string;
}

const STATUS_STYLES: Record<string, string> = {
    created: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    shipped: 'bg-blue-50 text-blue-700 border-blue-200',
    delivered: 'bg-violet-50 text-violet-700 border-violet-200',
    failed: 'bg-red-50 text-red-600 border-red-200',
};

const STATUS_ICONS: Record<string, React.ElementType> = {
    created: Clock, paid: CheckCircle, shipped: Package, delivered: ShoppingBag, failed: XCircle,
};

export const OrdersTab = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetch('/api/admin/orders', { headers: authHeaders() })
            .then((r) => r.json())
            .then((data) => setOrders(data.orders || []))
            .catch(() => { })
            .finally(() => setIsLoading(false));
    }, []);

    const updateStatus = async (id: string, status: string) => {
        setUpdating(id);
        try {
            const res = await fetch(`/api/admin/orders/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', ...authHeaders() },
                body: JSON.stringify({ status }),
            });
            if (res.ok) {
                setOrders((prev) => prev.map((o) => o._id === id ? { ...o, status: status as Order['status'] } : o));
            }
        } catch { /* ignore */ }
        setUpdating(null);
    };

    const displayed = filter === 'all' ? orders : orders.filter((o) => o.status === filter);
    const stats = {
        total: orders.length,
        paid: orders.filter((o) => o.status === 'paid' || o.status === 'shipped' || o.status === 'delivered').length,
        revenue: orders.filter((o) => o.status === 'paid' || o.status === 'shipped' || o.status === 'delivered')
            .reduce((s, o) => s + o.amount, 0),
    };

    if (isLoading) return <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">Loading orders…</div>;

    return (
        <div className="space-y-6">
            {/* mini stats */}
            <div className="grid gap-4 sm:grid-cols-3">
                {[
                    { label: 'Total Orders', value: stats.total, color: 'from-violet-500 to-purple-700' },
                    { label: 'Paid Orders', value: stats.paid, color: 'from-emerald-500 to-green-700' },
                    { label: 'Revenue', value: `₹${stats.revenue.toLocaleString('en-IN')}`, color: 'from-amber-500 to-orange-600' },
                ].map((s) => (
                    <div key={s.label} className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${s.color} p-5 text-white shadow-md`}>
                        <p className="text-sm text-white/70">{s.label}</p>
                        <p className="mt-1 text-3xl font-bold">{s.value}</p>
                        <div className="pointer-events-none absolute -right-4 -top-4 h-20 w-20 rounded-full bg-white/10" />
                    </div>
                ))}
            </div>

            {/* filter */}
            <div className="flex gap-1 overflow-x-auto pb-0.5">
                {['all', 'created', 'paid', 'shipped', 'delivered', 'failed'].map((f) => (
                    <button key={f} onClick={() => setFilter(f)}
                        className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors capitalize ${filter === f ? 'bg-violet-600 text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
                        {f}
                    </button>
                ))}
            </div>

            <Card className="shadow-sm overflow-hidden">
                <CardHeader className="border-b pb-3">
                    <CardTitle className="text-base">Orders <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs font-normal text-muted-foreground">{displayed.length}</span></CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {displayed.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                            <ShoppingBag className="mb-3 h-10 w-10 opacity-30" />
                            <p className="text-sm">No orders{filter !== 'all' ? ` with status "${filter}"` : ' yet'}</p>
                            {filter === 'all' && <p className="mt-1 text-xs text-muted-foreground/60">Orders will appear here after customers complete checkout</p>}
                        </div>
                    ) : (
                        <ul className="divide-y">
                            {displayed.map((order) => {
                                const StatusIcon = STATUS_ICONS[order.status] ?? Clock;
                                return (
                                    <li key={order._id} className="px-5 py-4 hover:bg-muted/20 transition-colors">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="font-medium text-sm">{order.customerName || 'Guest'}</span>
                                                    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize ${STATUS_STYLES[order.status] ?? ''}`}>
                                                        <StatusIcon className="h-2.5 w-2.5" /> {order.status}
                                                    </span>
                                                    <span className="text-xs font-semibold text-emerald-700">₹{order.amount.toLocaleString('en-IN')}</span>
                                                </div>
                                                <p className="mt-0.5 text-xs text-muted-foreground">
                                                    {order.customerEmail && <span className="mr-2">{order.customerEmail}</span>}
                                                    {order.customerPhone && <span className="mr-2">{order.customerPhone}</span>}
                                                    <span className="font-mono text-[10px] text-muted-foreground/60">{order.razorpayOrderId}</span>
                                                </p>
                                                {order.items.length > 0 && (
                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                        {order.items.map((i) => `${i.name} ×${i.qty}`).join(', ')}
                                                    </p>
                                                )}
                                                <p className="mt-0.5 text-[10px] text-muted-foreground/50">
                                                    {new Date(order.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                            {/* status updater */}
                                            <div className="shrink-0">
                                                <select
                                                    disabled={updating === order._id}
                                                    value={order.status}
                                                    onChange={(e) => updateStatus(order._id, e.target.value)}
                                                    className="h-8 rounded-lg border bg-background px-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                                                >
                                                    <option value="created">Created</option>
                                                    <option value="paid">Paid</option>
                                                    <option value="shipped">Shipped</option>
                                                    <option value="delivered">Delivered</option>
                                                    <option value="failed">Failed</option>
                                                </select>
                                            </div>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
