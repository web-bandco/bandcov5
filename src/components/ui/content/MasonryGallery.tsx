import * as React from "react"
import { X } from "lucide-react" 
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures" 
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/shadcn/carousel"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/shadcn/dialog"
import { Skeleton } from "@/components/ui/shadcn/skeleton"
import { Spinner } from "@/components/ui/shadcn/spinner"

export interface GalleryImage {
  src: string;
  fullSrc: string;
  alt: string;
}

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
  const [dialogApi, setDialogApi] = React.useState<CarouselApi>()
  const [isOpen, setIsOpen] = React.useState(false)
  const [selectedIndex, setSelectedIndex] = React.useState(0)
  
  const [gridLoadedImages, setGridLoadedImages] = React.useState<Record<string, boolean>>({})
  const [lightboxLoadedImages, setLightboxLoadedImages] = React.useState<Record<string, boolean>>({})

  const getActiveWindow = React.useCallback((currentIndex: number, total: number) => {
    const window = new Set<number>();
    window.add(currentIndex);
    if (total > 1) {
      window.add((currentIndex - 1 + total) % total);
      window.add((currentIndex + 1) % total);
    }
    if (total > 3) {
      window.add((currentIndex - 2 + total) % total);
      window.add((currentIndex + 2) % total);
    }
    return window;
  }, []);

  const [lightboxActiveSlides, setLightboxActiveSlides] = React.useState<Set<number>>(new Set())

  React.useEffect(() => {
    if (!dialogApi) return;
    const onDialogSelect = () => {
      const current = dialogApi.selectedScrollSnap();
      setLightboxActiveSlides(prev => {
        const next = new Set(prev);
        getActiveWindow(current, images.length).forEach(i => next.add(i));
        return next;
      });
    };
    onDialogSelect();
    dialogApi.on("select", onDialogSelect);
  }, [dialogApi, images.length, getActiveWindow]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || !dialogApi) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        e.stopPropagation();
        dialogApi.scrollPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        e.stopPropagation();
        dialogApi.scrollNext();
      }
    };
    window.addEventListener("keydown", handleKeyDown, { capture: true });
    return () => window.removeEventListener("keydown", handleKeyDown, { capture: true });
  }, [isOpen, dialogApi]);

  if (!images || images.length === 0) return null;

  const handleImageClick = (index: number) => {
    setSelectedIndex(index);
    setIsOpen(true);
    
    setLightboxActiveSlides(prev => {
      const next = new Set(prev);
      getActiveWindow(index, images.length).forEach(i => next.add(i));
      return next;
    });

    trackEvent('photo_lightbox_open', {
      event_category: 'Photography',
      event_label: images[index].alt || `Image ${index + 1}`,
      gallery_name: galleryName,
      ui_section: 'Masonry Grid'
    });
  }

  const handleGridImageLoad = (key: string) => {
    setGridLoadedImages((prev) => ({ ...prev, [key]: true }));
  };

  const handleLightboxImageLoad = (key: string) => {
    setLightboxLoadedImages((prev) => ({ ...prev, [key]: true }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      
      {/* THE MASONRY GRID */}
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-6">
        {images.map((image, index) => {
          const isLoaded = gridLoadedImages[`grid-${index}`];
          
          return (
            <div key={index} className="break-inside-avoid mb-6 relative group rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-border/50 bg-surface-secondary min-h-[200px]">
              <DialogTrigger asChild>
                <button 
                  type="button"
                  aria-label={`View full image: ${image.alt}`}
                  onClick={() => handleImageClick(index)}
                  className="w-full h-full block p-0 m-0 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-brand-500 text-left relative"
                >
                  {!isLoaded && (
                    <Skeleton className="absolute inset-0 w-full h-full rounded-none z-10" />
                  )}
                  
                  <img 
                    src={image.src} 
                    alt={image.alt} 
                    onLoad={() => handleGridImageLoad(`grid-${index}`)}
                    ref={(img) => {
                      if (img && img.complete && !isLoaded) {
                        handleGridImageLoad(`grid-${index}`);
                      }
                    }}
                    className={`w-full h-auto object-cover transition-all duration-700 group-hover:scale-105 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                    decoding="async"
                    loading="lazy"
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                </button>
              </DialogTrigger>
            </div>
          )
        })}
      </div>

      {/* THE LIGHTBOX */}
      <DialogContent 
        showCloseButton={false}
        className="max-w-none sm:max-w-none w-screen h-[100dvh] bg-transparent border-none shadow-none p-0 flex flex-col justify-center overflow-hidden data-[state=open]:animate-none outline-none"
      >
        <DialogTitle className="sr-only">{galleryName} Gallery</DialogTitle>

        <button 
          onClick={() => setIsOpen(false)}
          data-track-ui="Lightbox Controls"
          data-track-label="Close Button Clicked"
          className="absolute top-4 right-4 md:top-6 md:right-6 z-[100] p-3 rounded-full bg-background/60 hover:bg-background backdrop-blur-md transition-all text-foreground outline-none shadow-md cursor-pointer"
          aria-label="Close Lightbox"
        >
          <X className="w-6 h-6 md:w-8 md:h-8" />
        </button>

        <button 
          onClick={() => dialogApi?.scrollPrev()}
          data-track-ui="Lightbox Controls"
          data-track-label="Lightbox Prev Arrow Clicked"
          className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-[100] hidden md:flex w-14 h-14 bg-background/60 hover:bg-background border-none shadow-md backdrop-blur-md rounded-full items-center justify-center text-foreground outline-none transition-all cursor-pointer"
          aria-label="Previous image"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7"><path d="m15 18-6-6 6-6"/></svg>
        </button>

        <button 
          onClick={() => dialogApi?.scrollNext()}
          data-track-ui="Lightbox Controls"
          data-track-label="Lightbox Next Arrow Clicked"
          className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-[100] hidden md:flex w-14 h-14 bg-background/60 hover:bg-background border-none shadow-md backdrop-blur-md rounded-full items-center justify-center text-foreground outline-none transition-all cursor-pointer"
          aria-label="Next image"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7"><path d="m9 18 6-6-6-6"/></svg>
        </button>

        <div 
          className="absolute inset-0 z-0 cursor-pointer pointer-events-auto"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />

        <Carousel 
          setApi={setDialogApi}
          opts={{ 
            align: "center", 
            startIndex: selectedIndex, 
            loop: true
            // FIX: Removed watchDrag constraint to allow desktop drag/scroll
          }}
          plugins={[WheelGesturesPlugin()]}
          className="w-full h-full flex items-center justify-center max-md:pointer-events-none z-10"
        >
          <CarouselContent className="h-full ml-0 items-center">
            {images.map((image, index) => {
              const shouldLoad = lightboxActiveSlides.has(index);
              const isLoaded = lightboxLoadedImages[`lightbox-${index}`];

              return (
                <CarouselItem key={index} className="flex h-[100dvh] flex-col items-center justify-center pl-0 relative">
                  
                  {/* FIX: Let Embla naturally handle pointer events so dragging/swiping natively closes or suppresses clicks */}
                  <div 
                    className="absolute inset-0 z-0 cursor-pointer pointer-events-auto"
                    onClick={() => setIsOpen(false)} 
                  />

                  <div className="relative w-full h-full p-4 md:p-24 flex items-center justify-center pointer-events-none z-10 md:cursor-pointer" onClick={() => setIsOpen(false)}>
                    
                    {!isLoaded && shouldLoad && (
                      <div className="absolute inset-0 flex items-center justify-center z-10">
                        <Spinner className="w-12 h-12 text-brand-500 animate-spin" />
                      </div>
                    )}

                    {shouldLoad && (
                      <img 
                        src={image.fullSrc} 
                        alt={image.alt} 
                        onLoad={() => handleLightboxImageLoad(`lightbox-${index}`)}
                        ref={(img) => {
                          if (img && img.complete && !isLoaded) {
                            handleLightboxImageLoad(`lightbox-${index}`);
                          }
                        }}
                        onClick={(e) => e.stopPropagation()} 
                        draggable={false} // FIX: Prevent native ghost image drag
                        className={`max-w-full max-h-[85dvh] w-auto h-auto object-contain drop-shadow-2xl pointer-events-auto cursor-grab active:cursor-grabbing z-20 transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                        decoding="async"
                      />
                    )}
                  </div>

                </CarouselItem>
              )
            })}
          </CarouselContent>
        </Carousel>
      </DialogContent>
    </Dialog>
  )
}