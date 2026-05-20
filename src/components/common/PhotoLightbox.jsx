import { useEffect, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight, Download } from 'lucide-react';

/**
 * PhotoLightbox — full-screen photo viewer rendered via a portal.
 *
 * Keyboard: ArrowLeft / ArrowRight to navigate, Escape to close.
 */
function PhotoLightbox({ urls = [], initialIndex = 0, onClose }) {
    const [idx, setIdx] = useState(Math.max(0, Math.min(initialIndex, urls.length - 1)));
    const total = urls.length;

    const prev = useCallback(() => setIdx((i) => (i - 1 + total) % total), [total]);
    const next = useCallback(() => setIdx((i) => (i + 1) % total), [total]);

    useEffect(() => {
        const handle = (e) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowLeft') prev();
            if (e.key === 'ArrowRight') next();
        };
        window.addEventListener('keydown', handle);
        return () => window.removeEventListener('keydown', handle);
    }, [onClose, prev, next]);

    const handleDownload = () => {
        const a = document.createElement('a');
        a.href = urls[idx];
        a.download = `kbr-evidence-${idx + 1}.jpg`;
        a.target = '_blank';
        a.click();
    };

    return createPortal(
        <div
            role="dialog"
            aria-modal="true"
            aria-label="Photo viewer"
            className="fixed inset-0 z-[9999] flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.93)' }}
            onClick={onClose}
        >
            <div
                className="relative w-full h-full flex items-center justify-center"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Main image */}
                <img
                    src={urls[idx]}
                    alt={`Evidence ${idx + 1} of ${total}`}
                    className="max-w-[90vw] max-h-[85vh] object-contain rounded-xl select-none"
                    draggable={false}
                />

                {/* Close */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full"
                    style={{ background: 'rgba(255,255,255,0.18)', color: '#fff' }}
                    aria-label="Close"
                    type="button"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Download */}
                <button
                    onClick={handleDownload}
                    className="absolute top-4 right-16 w-10 h-10 flex items-center justify-center rounded-full"
                    style={{ background: 'rgba(255,255,255,0.18)', color: '#fff' }}
                    aria-label="Download photo"
                    type="button"
                >
                    <Download className="w-4 h-4" />
                </button>

                {/* Prev */}
                {total > 1 && (
                    <button
                        onClick={prev}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-full"
                        style={{ background: 'rgba(255,255,255,0.18)', color: '#fff' }}
                        aria-label="Previous photo"
                        type="button"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                )}

                {/* Next */}
                {total > 1 && (
                    <button
                        onClick={next}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-full"
                        style={{ background: 'rgba(255,255,255,0.18)', color: '#fff' }}
                        aria-label="Next photo"
                        type="button"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                )}

                {/* Counter */}
                {total > 1 && (
                    <div
                        className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[13px] font-medium text-white px-3 py-1 rounded-full"
                        style={{ background: 'rgba(0,0,0,0.55)' }}
                    >
                        {idx + 1} / {total}
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
}

export { PhotoLightbox };
