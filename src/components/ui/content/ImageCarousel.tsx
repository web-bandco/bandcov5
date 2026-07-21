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

export interface CarouselImage {
  src: string;
  fullSrc: string; 
  width?: number; 
  height?: number;
  alt: string;
}

interface ImageCarouselProps {
  images: CarouselImage[];
}

export function ImageCarousel({ images }: ImageCarouselProps) {
  const [mainApi, setMainApi] = React.useState<CarouselApi>()
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

  const [mainActiveSlides, setMainActiveSlides] = React.useState<Set<number>>(new Set())
  const [lightboxActiveSlides, setLightboxActiveSlides] = React.useState<Set<number>>(new Set())

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
  }, [mainApi, images.length, getActiveWindow]);

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
  }

  const handleGridImageLoad = (key: string) => {
    setGridLoadedImages((prev) => ({ ...prev, [key]: true }));
  };

  const handleLightboxImageLoad = (key: string) => {
    setLightboxLoadedImages((prev) => ({ ...prev, [key]: true }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      
      <Carousel 
        setApi={setMainApi}
        opts={{ align: "start", loop: true }}
        plugins={[WheelGesturesPlugin()]}
        className="w-full group relative"
      >
        <CarouselContent>
          {images.map((image, index) => {
            const shouldLoad = mainActiveSlides.has(index);
            const isLoaded = gridLoadedImages[`main-${index}`];
            
            return (
              <CarouselItem key={index}>
                <div className="p-1">
                  <DialogTrigger asChild>
                    {/* ACCESSIBILITY FIX: Changed <div> to <button type="button"> so DialogTrigger passes valid ARIA props */}
                    <button 
                      type="button"
                      aria-label={`View full image: ${image.alt}`}
                      onClick={() => handleImageClick(index)}
                      className="w-full block overflow-hidden rounded-2xl border border-border bg-surface-primary shadow-sm aspect-[4/3] relative flex items-center justify-center cursor-pointer p-0 focus-visible:ring-2 focus-visible:ring-ring outline-none"
                    >
                      {!isLoaded && (
                        <Skeleton className="absolute inset-0 w-full h-full rounded-none z-10" />
                      )}
                      
                      {shouldLoad && (
                        <img 
                          src={image.src} 
                          alt={image.alt} 
                          onLoad={() => handleGridImageLoad(`main-${index}`)}
                          ref={(img) => {
                            if (img && img.complete && !isLoaded) {
                              handleGridImageLoad(`main-${index}`);
                            }
                          }}
                          className={`absolute inset-0 object-cover w-full h-full transition-opacity duration-300 z-0 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                          decoding="async"
                        />
                      )}
                    </button>
                  </DialogTrigger>
                </div>
              </CarouselItem>
            )
          })}
        </CarouselContent>
        
        <button 
          onClick={() => mainApi?.scrollPrev()}
          className="absolute left-4 top-1/2 -translate-y-1/2 hidden md:flex w-12 h-12 bg-background/80 hover:bg-background border-none shadow-sm opacity-0 transition-opacity duration-300 delay-500 group-hover:opacity-100 group-hover:delay-0 group-focus-within:opacity-100 group-focus-within:delay-0 rounded-full items-center justify-center text-foreground z-10 cursor-pointer outline-none"
          aria-label="Previous slide"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="m15 18-6-6 6-6"/></svg>
        </button>

        <button 
          onClick={() => mainApi?.scrollNext()}
          className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:flex w-12 h-12 bg-background/80 hover:bg-background border-none shadow-sm opacity-0 transition-opacity duration-300 delay-500 group-hover:opacity-100 group-hover:delay-0 group-focus-within:opacity-100 group-focus-within:delay-0 rounded-full items-center justify-center text-foreground z-10 cursor-pointer outline-none"
          aria-label="Next slide"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="m9 18 6-6-6-6"/></svg>
        </button>
      </Carousel>

      <DialogContent 
        showCloseButton={false}
        className="max-w-none sm:max-w-none w-screen h-[100dvh] bg-transparent border-none shadow-none p-0 flex flex-col justify-center overflow-hidden data-[state=open]:animate-none outline-none"
      >
        <DialogTitle className="sr-only">Image Gallery</DialogTitle>

        <button 
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 md:top-6 md:right-6 z-[100] p-3 rounded-full bg-background/60 hover:bg-background backdrop-blur-md transition-all text-foreground outline-none shadow-md cursor-pointer"
          aria-label="Close Lightbox"
        >
          <X className="w-6 h-6 md:w-8 md:h-8" />
        </button>

        <button 
          onClick={() => dialogApi?.scrollPrev()}
          className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-[100] hidden md:flex w-14 h-14 bg-background/60 hover:bg-background border-none shadow-md backdrop-blur-md rounded-full items-center justify-center text-foreground outline-none transition-all cursor-pointer"
          aria-label="Previous image"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7"><path d="m15 18-6-6 6-6"/></svg>
        </button>

        <button 
          onClick={() => dialogApi?.scrollNext()}
          className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-[100] hidden md:flex w-14 h-14 bg-background/60 hover:bg-background border-none shadow-md backdrop-blur-md rounded-full items-center justify-center text-foreground outline-none transition-all cursor-pointer"
          aria-label="Next image"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7"><path d="m9 18 6-6-6-6"/></svg>
        </button>

        {/* UX OPTIMIZATION: Full-screen click-to-close backdrop layer behind the carousel */}
        <div 
          className="absolute inset-0 z-0 cursor-pointer"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />

        <Carousel 
          setApi={setDialogApi}
          opts={{ 
            align: "center", 
            startIndex: selectedIndex, 
            loop: true,
            watchDrag: (root) => window.matchMedia('(max-width: 768px)').matches
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
                  
                  {/* UX OPTIMIZATION: Inner backdrop covering entire CarouselItem to catch missed mobile taps */}
                  <div 
                    className="absolute inset-0 z-0 cursor-pointer pointer-events-auto"
                    onClick={() => setIsOpen(false)} 
                    onPointerDown={(e) => {
                      if (e.pointerType === 'mouse') e.stopPropagation()
                    }} 
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
                        onPointerDown={(e) => {
                          if (e.pointerType === 'mouse' || window.matchMedia('(min-width: 768px)').matches) {
                            e.stopPropagation();
                          }
                        }}
                        className={`max-w-full max-h-[85dvh] w-auto h-auto object-contain drop-shadow-2xl pointer-events-auto cursor-grab active:cursor-grabbing md:cursor-default z-20 transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
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