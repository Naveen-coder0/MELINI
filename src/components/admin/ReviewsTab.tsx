import { useState, useEffect } from 'react';
import { adminFetch } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, MessageSquare, CheckCircle, XCircle, Trash2, User, Package } from 'lucide-react';

interface Review {
    id: string;
    product: {
        id: string;
        name: string;
    };
    user: string;
    rating: number;
    comment: string;
    isApproved: boolean;
    createdAt: string;
}

export const ReviewsTab = () => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            const res = await adminFetch(`${import.meta.env.VITE_API_URL || ""}/api/admin/reviews`);
            const data = await res.json();
            setReviews(data.items || []);
        } catch (err) {
            console.error("Review fetch error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleApproveReview = async (id: string, isApproved: boolean) => {
        try {
            const res = await adminFetch(`${import.meta.env.VITE_API_URL || ""}/api/admin/reviews/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ isApproved }),
            });
            if (res.ok) fetchReviews();
        } catch (err) {
            console.error("Review approval error:", err);
        }
    };

    const handleDeleteReview = async (id: string) => {
        if (!confirm('Are you sure you want to delete this review?')) return;
        try {
            const res = await adminFetch(`${import.meta.env.VITE_API_URL || ""}/api/admin/reviews/${id}`, {
                method: 'DELETE',
            });
            if (res.ok) fetchReviews();
        } catch (err) {
            console.error("Review delete error:", err);
        }
    };

    const displayed = reviews.filter((r) => {
        if (filter === 'pending') return !r.isApproved;
        if (filter === 'approved') return r.isApproved;
        return true;
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex gap-1 overflow-x-auto pb-0.5">
                    {[
                        { label: 'All Reviews', value: 'all' },
                        { label: 'Pending', value: 'pending' },
                        { label: 'Approved', value: 'approved' }
                    ].map((f) => (
                        <button key={f.value} onClick={() => setFilter(f.value as typeof filter)}
                            className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${filter === f.value ? 'bg-violet-600 text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            <Card className="border-none shadow-sm overflow-hidden bg-white">
                <CardHeader className="border-b bg-slate-50/50">
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-violet-600" />
                        Customer Reviews
                        <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs font-normal text-muted-foreground">{displayed.length}</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="p-12 text-center text-sm text-muted-foreground">Loading reviews...</div>
                    ) : displayed.length === 0 ? (
                        <div className="p-20 text-center">
                            <MessageSquare className="h-12 w-12 text-muted-foreground/10 mx-auto mb-4" />
                            <p className="text-sm text-muted-foreground">No reviews found matching this filter.</p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-slate-100">
                            {displayed.map((review) => (
                                <li key={review.id} className="p-6 transition-colors hover:bg-muted/10">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 space-y-3">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-500">
                                                    <User className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-sm">{review.user}</span>
                                                        <div className="flex items-center">
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star key={i} className={`h-3 w-3 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'}`} />
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <p className="text-[10px] text-muted-foreground">
                                                        {new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="pl-[52px]">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Package className="h-3 w-3 text-violet-600" />
                                                    <span className="text-xs font-medium text-violet-600">{review.product?.name || 'Unknown Product'}</span>
                                                </div>
                                                <p className="text-sm leading-relaxed text-slate-600 italic">
                                                    "{review.comment}"
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex shrink-0 flex-col items-end gap-2">
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => handleApproveReview(review.id, !review.isApproved)}
                                                    className={`flex h-9 items-center gap-2 rounded-lg px-3 text-xs font-bold transition-colors ${review.isApproved ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-muted text-slate-600 hover:bg-muted/80'}`}
                                                >
                                                    {review.isApproved ? <CheckCircle className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                                                    {review.isApproved ? 'Approved' : 'Approve'}
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteReview(review.id)}
                                                    className="flex h-9 w-9 items-center justify-center rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                            {!review.isApproved && (
                                                <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[9px] font-bold text-amber-600 uppercase">Awaiting Approval</span>
                                            )}
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
