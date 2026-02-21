import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Ruler } from 'lucide-react';

interface SizeGuideModalProps {
    open: boolean;
    onClose: () => void;
}

const sizes = [
    { size: 'XS', chest: '32-34"', waist: '24-26"', hips: '34-36"', inseam: '30"' },
    { size: 'S', chest: '34-36"', waist: '26-28"', hips: '36-38"', inseam: '30"' },
    { size: 'M', chest: '36-38"', waist: '28-30"', hips: '38-40"', inseam: '31"' },
    { size: 'L', chest: '38-40"', waist: '30-32"', hips: '40-42"', inseam: '31"' },
    { size: 'XL', chest: '40-42"', waist: '32-34"', hips: '42-44"', inseam: '32"' },
    { size: 'XXL', chest: '42-44"', waist: '34-36"', hips: '44-46"', inseam: '32"' },
];

const SizeGuideModal = ({ open, onClose }: SizeGuideModalProps) => {
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Ruler className="h-5 w-5 text-primary" /> Size Guide
                    </DialogTitle>
                </DialogHeader>
                <p className="text-sm text-muted-foreground mb-4">
                    All measurements are in inches. For the best fit, measure yourself and compare with the chart below.
                </p>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b">
                                {['Size', 'Chest', 'Waist', 'Hips', 'Inseam'].map((h) => (
                                    <th key={h} className="py-2 px-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {sizes.map((row, i) => (
                                <tr key={row.size} className={i % 2 === 0 ? 'bg-muted/30' : ''}>
                                    <td className="py-2.5 px-3 font-semibold">{row.size}</td>
                                    <td className="py-2.5 px-3 text-muted-foreground">{row.chest}</td>
                                    <td className="py-2.5 px-3 text-muted-foreground">{row.waist}</td>
                                    <td className="py-2.5 px-3 text-muted-foreground">{row.hips}</td>
                                    <td className="py-2.5 px-3 text-muted-foreground">{row.inseam}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <p className="mt-4 text-xs text-muted-foreground">
                    💡 Tip: If you're between sizes, we recommend sizing up for a relaxed fit or sizing down for a fitted look.
                </p>
            </DialogContent>
        </Dialog>
    );
};

export default SizeGuideModal;
