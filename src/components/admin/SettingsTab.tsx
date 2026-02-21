import { useEffect, useState } from 'react';
import { authHeaders } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, AlertTriangle, Settings2, Save } from 'lucide-react';

interface StoreSettings {
    storeName: string;
    tagline: string;
    contactEmail: string;
    whatsapp: string;
    instagram: string;
    announcementBar: string;
    freeShippingThreshold: number;
    currency: string;
}

const defaultSettings: StoreSettings = {
    storeName: 'MELINI', tagline: 'Timeless Indian Clothing', contactEmail: '',
    whatsapp: '', instagram: '', announcementBar: 'Free shipping on orders above ₹999',
    freeShippingThreshold: 999, currency: 'INR',
};

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
    <p className="mb-2.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">{children}</p>
);

export const SettingsTab = () => {
    const [settings, setSettings] = useState<StoreSettings>(defaultSettings);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
       fetch(`${import.meta.env.VITE_API_URL}/api/admin/settings`, { headers: authHeaders() })
            .then((r) => r.json())
            .then((data) => setSettings({ ...defaultSettings, ...data }))
            .catch(() => { })
            .finally(() => setIsLoading(false));
    }, []);

    const update = (field: keyof StoreSettings, value: string | number) =>
        setSettings((prev) => ({ ...prev, [field]: value }));

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true); setError(null);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/settings`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', ...authHeaders() },
                body: JSON.stringify(settings),
            });
            if (!res.ok) throw new Error('Save failed');
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Save failed');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">Loading settings…</div>;

    return (
        <form onSubmit={handleSave} className="max-w-2xl space-y-6">
            {success && (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                    <CheckCircle className="h-4 w-4" /> Settings saved!
                </div>
            )}
            {error && (
                <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <AlertTriangle className="h-4 w-4" /> {error}
                </div>
            )}

            <Card>
                <CardHeader className="pb-3 border-b">
                    <CardTitle className="flex items-center gap-2 text-base"><Settings2 className="h-4 w-4 text-primary" /> Store Identity</CardTitle>
                </CardHeader>
                <CardContent className="pt-5 space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <Label className="mb-1.5 block text-xs">Store Name</Label>
                            <Input value={settings.storeName} onChange={(e) => update('storeName', e.target.value)} placeholder="MELINI" />
                        </div>
                        <div>
                            <Label className="mb-1.5 block text-xs">Tagline</Label>
                            <Input value={settings.tagline} onChange={(e) => update('tagline', e.target.value)} placeholder="Timeless Indian Clothing" />
                        </div>
                    </div>
                    <div>
                        <Label className="mb-1.5 block text-xs">Announcement Bar Text</Label>
                        <Input value={settings.announcementBar} onChange={(e) => update('announcementBar', e.target.value)} placeholder="Free shipping on orders above ₹999" />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <Label className="mb-1.5 block text-xs">Free Shipping Threshold (₹)</Label>
                            <Input type="number" value={settings.freeShippingThreshold} onChange={(e) => update('freeShippingThreshold', Number(e.target.value))} min={0} />
                        </div>
                        <div>
                            <Label className="mb-1.5 block text-xs">Currency</Label>
                            <select
                                className="h-10 w-full rounded-md border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                value={settings.currency}
                                onChange={(e) => update('currency', e.target.value)}
                            >
                                <option value="INR">INR (₹)</option>
                                <option value="USD">USD ($)</option>
                            </select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-3 border-b">
                    <CardTitle className="text-base">Contact & Social</CardTitle>
                </CardHeader>
                <CardContent className="pt-5 space-y-4">
                    <div>
                        <Label className="mb-1.5 block text-xs">Contact Email</Label>
                        <Input type="email" value={settings.contactEmail} onChange={(e) => update('contactEmail', e.target.value)} placeholder="hello@melini.in" />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <Label className="mb-1.5 block text-xs">WhatsApp Number</Label>
                            <Input value={settings.whatsapp} onChange={(e) => update('whatsapp', e.target.value)} placeholder="+91 9876543210" />
                        </div>
                        <div>
                            <Label className="mb-1.5 block text-xs">Instagram Handle</Label>
                            <Input value={settings.instagram} onChange={(e) => update('instagram', e.target.value)} placeholder="@meliniofficial" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Button type="submit" disabled={isSaving} className="gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700">
                <Save className="h-4 w-4" /> {isSaving ? 'Saving…' : 'Save Settings'}
            </Button>
        </form>
    );
};
