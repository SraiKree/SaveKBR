import { useState } from 'react';
import { PhotoLightbox } from './PhotoLightbox';

/**
 * PhotoGallery — thumbnail grid for up to 3 evidence photos.
 * Clicking any thumbnail opens the full-screen PhotoLightbox.
 */
function PhotoGallery({ urls = [], className }) {
    const [lightboxIdx, setLightboxIdx] = useState(null);
    const showing = urls.slice(0, 3);
    if (showing.length === 0) return null;

    const cols = showing.length === 1 ? 'grid-cols-1' : 'grid-cols-3';

    return (
        <>
            <div className={`grid ${cols} gap-1 ${className ?? ''}`}>
                {showing.map((url, i) => (
                    <button
                        key={url}
                        type="button"
                        onClick={() => setLightboxIdx(i)}
                        className="relative overflow-hidden rounded-[6px] aspect-square hover:opacity-90 transition-opacity"
                        style={{ background: 'rgba(28,33,28,0.06)' }}
                        aria-label={`View photo ${i + 1}`}
                    >
                        <img
                            src={url}
                            alt={`Evidence photo ${i + 1}`}
                            loading="lazy"
                            className="w-full h-full object-cover"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                    </button>
                ))}
            </div>

            {lightboxIdx !== null && (
                <PhotoLightbox
                    urls={showing}
                    initialIndex={lightboxIdx}
                    onClose={() => setLightboxIdx(null)}
                />
            )}
        </>
    );
}

export { PhotoGallery };
