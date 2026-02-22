import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer,
    LineChart, Line, AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import {
    ShoppingBag, TrendingUp, Package, Users, Star, ArrowUpRight, ArrowDownRight,
    AlertTriangle, CheckCircle
} from 'lucide-react';
import { Product } from '@/data/products';
import { Order } from './OrdersTab';

const COLORS = ['#7c3aed', '#10b981', '#f59e0b', '#ef4444', '#3b82f6'];

interface DashboardProps {
    products: Product[];
    orders: Order[];
}

export const DashboardTab = ({ products, orders }: DashboardProps) => {
    // Mock data for charts if orders are empty
    const salesData = useMemo(() => {
        // Group orders by date for the last 7 days
        const last7Days = [...Array(7)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
        }).reverse();

        return last7Days.map(date => {
            const dayOrders = orders.filter(o => new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) === date);
            return {
                date,
                sales: dayOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0),
                orders: dayOrders.length
            };
        });
    }, [orders]);

    const categoryData = useMemo(() => {
        const cats: Record<string, number> = {};
        products.forEach(p => {
            cats[p.category] = (cats[p.category] || 0) + 1;
        });
        return Object.entries(cats).map(([name, value]) => ({ name, value }));
    }, [products]);

    const stats = useMemo(() => {
        const totalRevenue = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
        const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
        const outOfStock = products.filter(p => !p.inStock).length;

        return [
            { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}`, icon: TrendingUp, color: 'bg-violet-500', trend: '+12%', trendUp: true },
            { label: 'Orders', value: orders.length, icon: ShoppingBag, color: 'bg-emerald-500', trend: '+5%', trendUp: true },
            { label: 'Products', value: products.length, icon: Package, color: 'bg-blue-500', trend: 'Stable', trendUp: null },
            { label: 'Out of Stock', value: outOfStock, icon: AlertTriangle, color: 'bg-rose-500', trend: outOfStock > 0 ? `Attention` : 'Perfect', trendUp: outOfStock > 0 ? false : null },
        ];
    }, [orders, products]);

    return (
        <div className="space-y-8 pb-10">
            {/* Quick Stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((s, i) => {
                    const Icon = s.icon;
                    return (
                        <Card key={i} className="border-none shadow-sm overflow-hidden bg-white hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className={`p-3 rounded-2xl ${s.color} text-white`}>
                                        <Icon className="h-6 w-6" />
                                    </div>
                                    {s.trend && (
                                        <div className={`flex items-center gap-1 text-xs font-bold ${s.trendUp === true ? 'text-emerald-600' : s.trendUp === false ? 'text-rose-600' : 'text-slate-400'}`}>
                                            {s.trendUp === true ? <ArrowUpRight className="h-3 w-3" /> : s.trendUp === false ? <ArrowDownRight className="h-3 w-3" /> : null}
                                            {s.trend}
                                        </div>
                                    )}
                                </div>
                                <div className="mt-4">
                                    <p className="text-sm font-medium text-muted-foreground">{s.label}</p>
                                    <p className="text-2xl font-bold mt-1 tracking-tight">{s.value}</p>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Sales Chart */}
                <Card className="lg:col-span-2 border-none shadow-sm bg-white">
                    <CardHeader>
                        <CardTitle className="text-base font-semibold">Revenue Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={salesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(value) => `₹${value}`} />
                                    <RTooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                        itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                                        labelStyle={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}
                                    />
                                    <Area type="monotone" dataKey="sales" stroke="#7c3aed" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Categories Pie Chart */}
                <Card className="border-none shadow-sm bg-white">
                    <CardHeader>
                        <CardTitle className="text-base font-semibold">Inventory Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RTooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="flex flex-wrap justify-center gap-4 mt-2">
                                {categoryData.map((entry, index) => (
                                    <div key={index} className="flex items-center gap-1.5">
                                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                        <span className="text-xs text-muted-foreground capitalize">{entry.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Recent Activity or Best Sellers would go here */}
                <Card className="border-none shadow-sm bg-white overflow-hidden">
                    <CardHeader className="border-b bg-slate-50/50">
                        <CardTitle className="text-sm font-bold flex items-center justify-between">
                            Best Selling Products
                            <button className="text-xs text-violet-600 hover:underline">View All</button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <ul className="divide-y">
                            {products.slice(0, 5).map((p, i) => (
                                <li key={i} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-lg overflow-hidden border">
                                            {p.images?.[0] ? <img src={p.images[0]} className="h-full w-full object-cover" /> : <Package className="h-5 w-5 m-auto text-muted-foreground/30" />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold truncate max-w-[150px]">{p.name}</p>
                                            <p className="text-[10px] text-muted-foreground uppercase">{p.category}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold">₹{p.price.toLocaleString()}</p>
                                        <p className="text-[10px] text-emerald-600 font-bold">In Stock</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-white overflow-hidden">
                    <CardHeader className="border-b bg-slate-50/50">
                        <CardTitle className="text-sm font-bold flex items-center justify-between">
                            Recent Stock Alerts
                            <button className="text-xs text-violet-600 hover:underline">Manage</button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <ul className="divide-y">
                            {products.filter(p => !p.inStock).slice(0, 5).map((p, i) => (
                                <li key={i} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-rose-50 flex items-center justify-center">
                                            <AlertTriangle className="h-4 w-4 text-rose-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">{p.name}</p>
                                            <p className="text-[10px] text-rose-600 font-bold uppercase">OUT OF STOCK</p>
                                        </div>
                                    </div>
                                    <button onClick={() => {/* navigate to product edit */ }} className="text-xs font-bold text-violet-600 hover:underline">Restock</button>
                                </li>
                            ))}
                            {products.filter(p => !p.inStock).length === 0 && (
                                <li className="p-8 text-center">
                                    <CheckCircle className="h-8 w-8 text-emerald-500 mx-auto mb-2 opacity-20" />
                                    <p className="text-xs text-muted-foreground">All products are currently in stock.</p>
                                </li>
                            )}
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
