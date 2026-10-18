import * as React from "react"
import { flushSync } from "react-dom"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/shadcn/carousel"
import { Lightbox, withPillMorph } from "./Lightbox"

export interface CarouselImage {
  src: string;
  srcset?: string;
  fullSrc: string;
  width?: number;
  height?: number;
  alt: string;
}

interface ImageCarouselProps {
  images: CarouselImage[];
  galleryName?: string;
  /** Rendered width of the carousel, used to pick the right image from srcset */
  sizes?: string;
  /** Load the first image straight away (for carousels near the top of the page) */
  priority?: boolean;
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

// Slides within two of the current one are rendered (so swiping never shows a blank slide)
const getActiveWindow = (currentIndex: number, total: number) => {
  const window = new Set<number>([currentIndex]);
  if (total > 1) {
    window.add((currentIndex - 1 + total) % total);
    window.add((currentIndex + 1) % total);
  }
  if (total > 3) {
    window.add((currentIndex - 2 + total) % total);
    window.add((currentIndex + 2) % total);
  }
  return window;
};

export function ImageCarousel({ images, galleryName = "Uncategorized Gallery", sizes = "(min-width: 1024px) 50vw, calc(100vw - 56px)", priority = false }: ImageCarouselProps) {
  const [mainApi, setMainApi] = React.useState<CarouselApi>()
  const [isOpen, setIsOpen] = React.useState(false)
  const [selectedIndex, setSelectedIndex] = React.useState(0)

  // The first slide is rendered on the server so it loads without waiting for JavaScript
  const [mainActiveSlides, setMainActiveSlides] = React.useState<Set<number>>(() => new Set([0]))

  // The photo last shown in the lightbox, so the carousel can follow it on close
  const lastViewed = React.useRef(0)
  const handleLightboxIndex = React.useCallback((index: number) => { lastViewed.current = index }, [])

  // Shared by this carousel's pill and its lightbox pill so one morphs into the other.
  // Built from the gallery name so two carousels on the same page never clash.
  const pillName = `pill-${galleryName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`

  // The lightbox uses the large image, with smaller sizes for phones
  const lightboxImages = React.useMemo(() => images.map((image) => ({
    src: image.fullSrc,
    srcset: image.srcset ? `${image.srcset}, ${image.fullSrc} 1600w` : undefined,
    alt: image.alt,
  })), [images]);

  React.useEffect(() => {
    if (!mainApi) return;
    const onMainSelect = () => {
      const current = mainApi.selectedScrollSnap();
      setMainActiveSlides(prev => {
        const next = new Set(prev);
        getActiveWindow(current, images.length).forEach(i => next.add(i));
        return next;
      });
    };
    onMainSelect();
    mainApi.on("select", onMainSelect);
    return () => { mainApi.off("select", onMainSelect) };
  }, [mainApi, images.length]);

  if (!images || images.length === 0) return null;

  const setLightboxOpen = (open: boolean, index?: number) => {
    withPillMorph(() => flushSync(() => {
      if (index !== undefined) {
        setSelectedIndex(index);
        lastViewed.current = index;
      }
      // On close, the carousel moves to the last photo shown in the lightbox
      if (!open) mainApi?.scrollTo(lastViewed.current, true);
      setIsOpen(open);
    }));
  };

  const handleImageClick = (index: number) => {
    setLightboxOpen(true, index);

    trackEvent('photo_lightbox_open', {
      event_category: 'Photography',
      event_label: images[index].alt || `Image ${index + 1}`,
      gallery_name: galleryName,
      ui_section: 'Image Carousel'
    });
  }

  return (
    <>
      <Carousel
        setApi={setMainApi}
        opts={{ align: "start", loop: true }}
        plugins={[WheelGesturesPlugin()]}
        className="w-full relative"
      >
        <CarouselContent>
          {images.map((image, index) => {
            const shouldLoad = mainActiveSlides.has(index);
            const isPriority = priority && index === 0;

            return (
              <CarouselItem key={index}>
                <div className="p-1">
                  <button
                    type="button"
                    aria-label={`View full image: ${image.alt}`}
                    onClick={() => handleImageClick(index)}
                    className="w-full block overflow-hidden rounded-2xl border border-border bg-surface-secondary shadow-sm aspect-[4/3] relative flex items-center justify-center cursor-pointer p-0 focus-visible:ring-2 focus-visible:ring-ring outline-none"
                  >
                    {shouldLoad && (
                      <img
                        src={image.src}
                        srcSet={image.srcset}
                        sizes={sizes}
                        width={image.width}
                        height={image.height}
                        alt={image.alt}
                        className="absolute inset-0 object-cover w-full h-full"
                        loading={isPriority ? "eager" : "lazy"}
                        fetchPriority={isPriority ? "high" : undefined}
                        decoding="async"
                      />
                    )}
                  </button>
                </div>
              </CarouselItem>
            )
          })}
        </CarouselContent>

        {/* Small pill (arrows only); it morphs into the lightbox's ‹ 1 of N › pill */}
        {images.length > 1 && (
          <div
            className="absolute bottom-4 right-4 z-10 hidden md:flex items-center gap-1 p-1 rounded-full glass select-none [view-transition-class:lightbox-pill]"
            style={{ viewTransitionName: isOpen ? undefined : pillName }}
          >
            <button
              type="button"
              onClick={() => mainApi?.scrollPrev()}
              aria-label="Previous slide"
              data-track-ui="Carousel Navigation"
              data-track-label="Main Prev Arrow Clicked"
              className="p-2 hover:bg-current/15 rounded-full transition-colors outline-none cursor-pointer focus-visible:ring-2 focus-visible:ring-current"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => mainApi?.scrollNext()}
              aria-label="Next slide"
              data-track-ui="Carousel Navigation"
              data-track-label="Main Next Arrow Clicked"
              className="p-2 hover:bg-current/15 rounded-full transition-colors outline-none cursor-pointer focus-visible:ring-2 focus-visible:ring-current"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </Carousel>

      <Lightbox
        images={lightboxImages}
        open={isOpen}
        onOpenChange={(open) => setLightboxOpen(open)}
        startIndex={selectedIndex}
        onIndexChange={handleLightboxIndex}
        title={`${galleryName} gallery`}
        pillTransitionName={pillName}
      />
    </>
  )
}
