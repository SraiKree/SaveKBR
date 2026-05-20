import { useState } from 'react';
import { PhotoLightbox } from './PhotoLightbox';

/**
 * PhotoGallery — thumbnail grid for up to 3 evidence photos.
 * Each thumbnail shows a skeleton-striped placeholder until the image loads.
 * Clicking any thumbnail opens the full-screen PhotoLightbox.
 */
function PhotoGallery({ urls = [], className }) {
    const [lightboxIdx, setLightboxIdx] = useState(null);
    const [loadedUrls, setLoadedUrls] = useState(new Set());
    const showing = urls.slice(0, 3);
    if (showing.length === 0) return null;

    const cols = showing.length === 1 ? 'grid-cols-1' : 'grid-cols-3';
    const markLoaded = (url) => setLoadedUrls((prev) => new Set([...prev, url]));

    return (
        <>
            <div className={`grid ${cols} gap-1 ${className ?? ''}`}>
                {showing.map((url, i) => (
                    <button
                        key={url}
                        type="button"
                        onClick={() => setLightboxIdx(i)}
                        className="relative overflow-hidden rounded-[6px] aspect-square hover:opacity-90 transition-opacity"
                        aria-label={`View photo ${i + 1}`}
                    >
                        {/* Skeleton shown while the image is still fetching */}
                        {!loadedUrls.has(url) && (
                            <div className="skeleton-striped absolute inset-0 border border-base-content/20" />
                        )}
                        <img
                            src={url}
                            alt={`Evidence photo ${i + 1}`}
                            loading="lazy"
                            onLoad={() => markLoaded(url)}
                            onError={(e) => { e.currentTarget.style.display = 'none'; markLoaded(url); }}
                            className={`w-full h-full object-cover transition-opacity duration-300 ${
                                loadedUrls.has(url) ? 'opacity-100' : 'opacity-0'
                            }`}
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
