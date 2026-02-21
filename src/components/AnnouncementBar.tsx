import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Tag } from 'lucide-react';

const DEFAULT_TEXT = '🎉 Free shipping on orders above ₹999 | Use code MELINI10 for 10% off!';

interface AnnouncementBarProps {
    text?: string;
}

const AnnouncementBar = ({ text = DEFAULT_TEXT }: AnnouncementBarProps) => {
    const [dismissed, setDismissed] = useState(() => {
        try { return sessionStorage.getItem('announcement_dismissed') === '1'; }
        catch { return false; }
    });

    const dismiss = () => {
        sessionStorage.setItem('announcement_dismissed', '1');
        setDismissed(true);
    };

    return (
        <AnimatePresence>
            {!dismissed && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                >
                    <div className="flex items-center justify-center gap-3 bg-primary px-4 py-2 text-center text-xs font-medium text-primary-foreground sm:text-sm">
                        <Tag className="h-3.5 w-3.5 shrink-0" />
                        <span>{text}</span>
                        <button
                            onClick={dismiss}
                            className="ml-auto shrink-0 rounded-full p-0.5 hover:bg-white/20 transition-colors"
                            aria-label="Dismiss"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default AnnouncementBar;
