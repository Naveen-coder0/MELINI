import { useState, useEffect } from 'react';
import { adminFetch } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Layout, Image as ImageIcon, Megaphone, Save, CheckCircle, AlertTriangle } from 'lucide-react';
import { useConfig } from '@/contexts/ConfigContext';

interface HomeConfig {
    heroTitle: string;
    heroSubtitle: string;
    heroBadge: string;
    announcement: string;
    promoBannerUrl?: string;
    promoLink?: string;
}

const defaultHome: HomeConfig = {
    heroTitle: 'Elegance in Every Stitch',
    heroSubtitle: 'Discover premium comfort wear that blends traditional craftsmanship with modern elegance.',
    heroBadge: 'New Collection 2025',
    announcement: 'Free shipping on orders above ₹999',
};

export const ContentTab = () => {
    const { refreshConfig } = useConfig();
    const [config, setConfig] = useState<HomeConfig>(defaultHome);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || ""}/api/site-config`);
            const data = await res.json();
            if (data) setConfig({ ...defaultHome, ...data });
        } catch (err) {
            console.error("Config fetch error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);
        try {
            const res = await adminFetch(`${import.meta.env.VITE_API_URL || ""}/api/admin/site-config`, {
                method: 'PUT',
                body: JSON.stringify(config),
            });
            if (res.ok) {
                setSuccess(true);
                await refreshConfig();
                setTimeout(() => setSuccess(false), 3000);
            } else {
                throw new Error('Failed to save configuration');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error saving');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="p-12 text-center text-sm text-muted-foreground">Loading content configuration...</div>;

    return (
        <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
            {success && (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                    <CheckCircle className="h-4 w-4" /> Homepage content updated successfully!
                </div>
            )}

            <Card className="border-none shadow-sm bg-white overflow-hidden">
                <CardHeader className="border-b bg-slate-50/50">
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                        <Layout className="h-4 w-4 text-violet-600" />
                        Hero Section
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold uppercase text-muted-foreground">Hero Badge</Label>
                            <Input
                                value={config.heroBadge}
                                onChange={(e) => setConfig({ ...config, heroBadge: e.target.value })}
                                placeholder="New Collection 2025"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold uppercase text-muted-foreground">Hero Title</Label>
                            <Input
                                value={config.heroTitle}
                                onChange={(e) => setConfig({ ...config, heroTitle: e.target.value })}
                                placeholder="Elegance in Every Stitch"
                            />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-xs font-bold uppercase text-muted-foreground">Hero Subtitle</Label>
                        <Textarea
                            value={config.heroSubtitle}
                            onChange={(e) => setConfig({ ...config, heroSubtitle: e.target.value })}
                            placeholder="Describe your collection..."
                            rows={3}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-white overflow-hidden">
                <CardHeader className="border-b bg-slate-50/50">
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                        <Megaphone className="h-4 w-4 text-violet-600" />
                        Announcements
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                    <div className="space-y-1.5">
                        <Label className="text-xs font-bold uppercase text-muted-foreground">Main Announcement Bar</Label>
                        <Input
                            value={config.announcement}
                            onChange={(e) => setConfig({ ...config, announcement: e.target.value })}
                            placeholder="Free shipping on orders above ₹999"
                        />
                    </div>
                </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-white overflow-hidden">
                <CardHeader className="border-b bg-slate-50/50">
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                        <ImageIcon className="h-4 w-4 text-violet-600" />
                        Promotional Banner
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold uppercase text-muted-foreground">Banner Image URL</Label>
                            <Input
                                value={config.promoBannerUrl || ''}
                                onChange={(e) => setConfig({ ...config, promoBannerUrl: e.target.value })}
                                placeholder="https://..."
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs font-bold uppercase text-muted-foreground">Redirect Link</Label>
                            <Input
                                value={config.promoLink || ''}
                                onChange={(e) => setConfig({ ...config, promoLink: e.target.value })}
                                placeholder="/shop/winter"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end gap-3 pt-4">
                <Button type="submit" disabled={isSaving} className="px-8 bg-violet-600 hover:bg-violet-700">
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Save All Changes'}
                </Button>
            </div>
        </form>
    );
};
