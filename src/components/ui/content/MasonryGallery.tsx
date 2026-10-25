import * as React from "react"
import { Lightbox, pagePhoto } from "./Lightbox"

export interface GalleryImage {
  src: string;
  srcset?: string;
  fullSrc: string;
  width?: number;
  height?: number;
  alt: string;
}

// Column width: 1 column on mobile, 2 from sm, 3 from lg (capped by max-w-7xl), minus page padding
const GRID_SIZES = "(min-width: 1280px) 400px, (min-width: 1024px) calc(33vw - 32px), (min-width: 640px) calc(50vw - 36px), calc(100vw - 48px)";

interface MasonryGalleryProps {
  images: GalleryImage[];
  galleryName?: string;
}

// ── GA4 TRACKING HELPER ──
const trackEvent = (eventName: string, params: Record<string, any>) => {
  if (typeof window === 'undefined') return;
  if (typeof (window as any).gtag === 'function') {
    (window as any).gtag('event', eventName, params);
  } else if ((window as any).dataLayer) {
    (window as any).dataLayer.push({ event: eventName, ...params });
  }
};
// -------------------------

export function MasonryGallery({ images, galleryName = "Uncategorized Gallery" }: MasonryGalleryProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [selectedIndex, setSelectedIndex] = React.useState(0)
  const [placeholder, setPlaceholder] = React.useState<string>()

  // The lightbox uses the large image, with smaller sizes for phones. The large one goes
  // first: if a page size has the same width, the browser keeps the first of the two.
  const lightboxImages = React.useMemo(() => images.map((image) => ({
    src: image.fullSrc,
    srcset: image.srcset ? `${image.fullSrc} ${image.width}w, ${image.srcset}` : undefined,
    alt: image.alt,
  })), [images]);

  if (!images || images.length === 0) return null;

  const handleImageClick = (index: number, src?: string) => {
    setSelectedIndex(index);
    setPlaceholder(src);
    setIsOpen(true);

    trackEvent('photo_lightbox_open', {
      event_category: 'Photography',
      event_label: images[index].alt || `Image ${index + 1}`,
      gallery_name: galleryName,
      ui_section: 'Masonry Grid'
    });
  }

  return (
    <>
      {/* THE MASONRY GRID */}
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-6">
        {images.map((image, index) => (
          <div key={index} className="break-inside-avoid mb-6 relative rounded-2xl overflow-hidden shadow-sm hover-lift border border-border/50 bg-surface-secondary">
            <button
              type="button"
              aria-label={`View full image: ${image.alt}`}
              onClick={(e) => handleImageClick(index, pagePhoto(e))}
              className="w-full h-full block p-0 m-0 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-brand-500 text-left relative"
            >
              <img
                src={image.src}
                srcSet={image.srcset}
                sizes={GRID_SIZES}
                width={image.width}
                height={image.height}
                alt={image.alt}
                className="w-full h-auto object-cover"
                decoding="async"
                loading={index === 0 ? "eager" : "lazy"}
                fetchPriority={index === 0 ? "high" : undefined}
              />
            </button>
          </div>
        ))}
      </div>

      <Lightbox
        images={lightboxImages}
        open={isOpen}
        onOpenChange={setIsOpen}
        startIndex={selectedIndex}
        title={`${galleryName} gallery`}
        placeholder={placeholder}
      />
    </>
  )
}
