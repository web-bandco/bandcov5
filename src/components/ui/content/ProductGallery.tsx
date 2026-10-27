import * as React from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures" 
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/shadcn/carousel"
import { Lightbox, pagePhoto } from "./Lightbox"
import type { ProductImage } from "@/lib/sanity"

interface ProductGalleryProps {
  images: ProductImage[];
  title: string;
}

// Main image width: full width below 1000px, the gallery column above it.
// Both layouts use the same value so the first image is only downloaded once.
const MAIN_SIZES = "(min-width: 1280px) 720px, (min-width: 1000px) 55vw, calc(100vw - 48px)";
const GRID_SIZES = "(min-width: 1280px) 350px, (min-width: 1000px) 27vw, 50vw";

export function ProductGallery({ images, title }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = React.useState(0);
  // Mobile carousel slides only load once they are next to the one in view
  const [loadedSlides, setLoadedSlides] = React.useState<Set<number>>(() => new Set([0]));
  const [isLightboxOpen, setIsLightboxOpen] = React.useState(false);
  const [placeholder, setPlaceholder] = React.useState<string>();
  const lightboxImages = React.useMemo(
    () => images.map((img, i) => ({ src: img.full, alt: `${title} ${i + 1}` })),
    [images, title]
  );
  const [isMobile, setIsMobile] = React.useState(false);
  
  const [mainApi, setMainApi] = React.useState<CarouselApi>();
  
  const thumbnailsRef = React.useRef<(HTMLButtonElement | null)[]>([]);
  
  const [isExpanded, setIsExpanded] = React.useState(false);
  const MAX_GRID_ITEMS = 6;
  const extraImages = images.slice(1);
  const hasMore = extraImages.length > MAX_GRID_ITEMS;
  const visibleExtra = isExpanded ? extraImages : extraImages.slice(0, MAX_GRID_ITEMS);

  React.useEffect(() => {
    // Custom middle-ground breakpoint at 1000px
    const checkMobile = () => setIsMobile(window.innerWidth < 1000);
    checkMobile(); 
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  React.useEffect(() => {
    if (!mainApi) return;
    mainApi.on("select", () => setActiveIndex(mainApi.selectedScrollSnap()));
  }, [mainApi]);

  React.useEffect(() => {
    if (!mainApi) return;
    mainApi.scrollTo(activeIndex);
  }, [activeIndex, mainApi]);

  React.useEffect(() => {
    const total = images.length;
    setLoadedSlides((prev) => {
      const next = new Set(prev);
      [activeIndex - 1, activeIndex, activeIndex + 1].forEach((i) => next.add((i + total) % total));
      return next.size === prev.size ? prev : next;
    });
  }, [activeIndex, images.length]);

  React.useEffect(() => {
    if (isMobile && thumbnailsRef.current[activeIndex]) {
      // Smooth (or instant for reduced motion) through the strip's scroll-smooth class
      thumbnailsRef.current[activeIndex]?.scrollIntoView({
        inline: 'center',
        block: 'nearest'
      });
    }
  }, [activeIndex, isMobile]);

  const handleImageClick = (index: number, src?: string) => {
    setActiveIndex(index);
    setPlaceholder(src);
    if (!isMobile) setIsLightboxOpen(true);
  };

  const cursorClass = "cursor-[url('/zoom-cursor.svg')_32_32,_zoom-in]";

  return (
    <div className="w-full flex flex-col gap-4">
      
      {/* ==========================================
          MOBILE LAYOUT (< 1000px)
         ========================================== */}
      <div className="w-full flex flex-col gap-4 min-[1000px]:hidden">
        
        <Carousel setApi={setMainApi} opts={{ align: "center", loop: true }} plugins={[WheelGesturesPlugin()]} className="w-full bg-surface-secondary rounded-2xl overflow-hidden">
          <CarouselContent className="ml-0">
            {images.map((img, i) => (
              <CarouselItem key={i} className="pl-0 relative w-full flex items-center justify-center">
                {loadedSlides.has(i) ? (
                  <img
                    src={img.src}
                    srcSet={img.srcset}
                    sizes={MAIN_SIZES}
                    alt={`${title} ${i + 1}`}
                    className="w-full aspect-[3/4] object-cover rounded-2xl"
                    loading={i === 0 ? "eager" : "lazy"}
                    fetchPriority={i === 0 ? "high" : undefined}
                  />
                ) : (
                  <div className="w-full aspect-[3/4]" />
                )}
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {images.length > 1 && (
          <div className="flex flex-row gap-3 overflow-x-auto scroll-smooth pb-2 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden px-1">
            {images.map((img, i) => (
              <button
                key={i}
                ref={(el) => { thumbnailsRef.current[i] = el; }}
                onClick={() => handleImageClick(i)}
                className={`relative shrink-0 snap-center w-28 aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${activeIndex === i ? 'border-brand-500 shadow-md opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
                aria-label={`View image ${i + 1}`}
              >
                <img src={img.thumb} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
              </button>
            ))}
          </div>
        )}
      </div>


      {/* ==========================================
          DESKTOP LAYOUT (>= 1000px)
         ========================================== */}
      <div className="hidden min-[1000px]:flex flex-col gap-4">
        
        <div 
          className={`w-full bg-surface-secondary rounded-2xl overflow-hidden hover-lift ${cursorClass}`}
          onClick={(e) => handleImageClick(0, pagePhoto(e))}
        >
          <img
            src={images[0].src}
            srcSet={images[0].srcset}
            sizes={MAIN_SIZES}
            alt={`${title} Main`}
            className="w-full aspect-[3/4] object-cover rounded-2xl mx-auto"
            loading="eager"
            fetchPriority="high"
          />
        </div>

        {extraImages.length > 0 && (
          <div className="relative w-full">
            <div className="grid grid-cols-2 gap-4">
              {visibleExtra.map((img, i) => {
                const actualIndex = i + 1; 
                return (
                  <div 
                    key={actualIndex}
                    className={`w-full bg-surface-secondary rounded-2xl overflow-hidden break-inside-avoid hover-lift ${cursorClass}`}
                    onClick={(e) => handleImageClick(actualIndex, pagePhoto(e))}
                  >
                    <img src={img.src} srcSet={img.srcset} sizes={GRID_SIZES} alt={`${title} Detail ${actualIndex}`} className="w-full aspect-[3/4] object-cover rounded-2xl" loading="lazy" />
                  </div>
                )
              })}
            </div>

            {hasMore && !isExpanded && (
              <div className="absolute bottom-0 left-0 w-full h-[40%] bg-gradient-to-t from-background via-background/90 to-transparent flex items-end justify-center pb-8 pointer-events-none z-20">
                <button 
                  onClick={() => setIsExpanded(true)} 
                  className="pointer-events-auto flex items-center gap-2 text-sm font-extrabold tracking-widest uppercase text-foreground hover:text-foreground-muted transition-colors drop-shadow-lg"
                >
                  CLICK TO VIEW MORE <ChevronDown className="w-5 h-5" />
                </button>
              </div>
            )}

            {hasMore && isExpanded && (
              <div className="w-full flex justify-center mt-8">
                <button 
                  onClick={() => setIsExpanded(false)} 
                  className="flex items-center gap-2 text-sm font-extrabold tracking-widest uppercase text-foreground hover:text-foreground-muted transition-colors"
                >
                  CLICK TO VIEW LESS <ChevronUp className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>


      {/* ==========================================
          DESKTOP LIGHTBOX (Overlay)
         ========================================== */}
      {!isMobile && (
        <Lightbox
          images={lightboxImages}
          open={isLightboxOpen}
          onOpenChange={setIsLightboxOpen}
          startIndex={activeIndex}
          onIndexChange={setActiveIndex}
          title={`${title} image viewer`}
          placeholder={placeholder}
        />
      )}
    </div>
  )
}