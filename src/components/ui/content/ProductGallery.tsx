import * as React from "react"
import { ChevronLeft, ChevronRight, X, ChevronDown, ChevronUp } from "lucide-react"
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures" 
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/shadcn/carousel"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/shadcn/dialog"
import type { ProductImage } from "./ShopGrid"

interface ProductGalleryProps {
  images: ProductImage[];
  title: string;
}

export function ProductGallery({ images, title }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);
  
  const [dialogApi, setDialogApi] = React.useState<CarouselApi>();
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
    if (!dialogApi) return;
    dialogApi.on("select", () => setActiveIndex(dialogApi.selectedScrollSnap()));
  }, [dialogApi]);

  React.useEffect(() => {
    if (!mainApi) return;
    mainApi.on("select", () => setActiveIndex(mainApi.selectedScrollSnap()));
  }, [mainApi]);

  React.useEffect(() => {
    if (!mainApi) return;
    mainApi.scrollTo(activeIndex);
  }, [activeIndex, mainApi]);

  React.useEffect(() => {
    if (isMobile && thumbnailsRef.current[activeIndex]) {
      thumbnailsRef.current[activeIndex]?.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest'
      });
    }
  }, [activeIndex, isMobile]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLightboxOpen || !dialogApi) return;
      if (e.key === "ArrowLeft") dialogApi.scrollPrev();
      if (e.key === "ArrowRight") dialogApi.scrollNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen, dialogApi]);

  const handleImageClick = (index: number) => {
    setActiveIndex(index);
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
                <img src={img.full} alt={`${title} ${i + 1}`} className="w-full aspect-[3/4] object-cover rounded-2xl" loading={i === 0 ? "eager" : "lazy"} />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {images.length > 1 && (
          <div className="flex flex-row gap-3 overflow-x-auto pb-2 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden px-1">
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
          className={`w-full bg-surface-secondary rounded-2xl overflow-hidden transition-transform hover:opacity-95 ${cursorClass}`}
          onClick={() => handleImageClick(0)}
        >
          <img src={images[0].full} alt={`${title} Main`} className="w-full aspect-[3/4] object-cover rounded-2xl mx-auto" loading="eager" />
        </div>

        {extraImages.length > 0 && (
          <div className="relative w-full">
            <div className="grid grid-cols-2 gap-4">
              {visibleExtra.map((img, i) => {
                const actualIndex = i + 1; 
                return (
                  <div 
                    key={actualIndex}
                    className={`w-full bg-surface-secondary rounded-2xl overflow-hidden break-inside-avoid hover:opacity-95 transition-opacity ${cursorClass}`}
                    onClick={() => handleImageClick(actualIndex)}
                  >
                    <img src={img.thumb} alt={`${title} Detail ${actualIndex}`} className="w-full aspect-[3/4] object-cover rounded-2xl" loading="lazy" />
                  </div>
                )
              })}
            </div>

            {hasMore && !isExpanded && (
              <div className="absolute bottom-0 left-0 w-full h-[40%] bg-gradient-to-t from-background via-background/90 to-transparent flex items-end justify-center pb-8 pointer-events-none z-20">
                <button 
                  onClick={() => setIsExpanded(true)} 
                  className="pointer-events-auto flex items-center gap-2 text-sm font-extrabold tracking-widest uppercase text-foreground hover:text-brand-500 transition-colors drop-shadow-lg"
                >
                  CLICK TO VIEW MORE <ChevronDown className="w-5 h-5" />
                </button>
              </div>
            )}

            {hasMore && isExpanded && (
              <div className="w-full flex justify-center mt-8">
                <button 
                  onClick={() => setIsExpanded(false)} 
                  className="flex items-center gap-2 text-sm font-extrabold tracking-widest uppercase text-foreground hover:text-brand-500 transition-colors"
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
        <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
          <DialogContent 
            showCloseButton={false} 
            className="!max-w-[100vw] !w-screen !h-[100dvh] !m-0 !p-0 !border-none !rounded-none bg-black/95 flex flex-col justify-center overflow-hidden outline-none z-[200] cursor-default data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-[0.96] data-[state=open]:zoom-in-[0.96] duration-300 ease-out"
          >
            <DialogTitle className="sr-only">{title} Image Viewer</DialogTitle>
            
            <button onClick={() => setIsLightboxOpen(false)} className="absolute top-6 right-6 z-[250] p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all text-white outline-none cursor-pointer">
              <X className="w-6 h-6" />
            </button>

            <Carousel setApi={setDialogApi} opts={{ align: "center", loop: true, startIndex: activeIndex }} plugins={[WheelGesturesPlugin()]} className="w-full h-full flex items-center justify-center z-10">
              <CarouselContent className="h-full ml-0">
                {images.map((img, i) => (
                  <CarouselItem key={i} className="flex h-[100dvh] flex-col items-center justify-center pl-0 relative">
                    <div className="absolute inset-0 z-0 cursor-default pointer-events-auto" onClick={() => setIsLightboxOpen(false)} />
                    <div className="relative w-full h-[100dvh] flex items-center justify-center pointer-events-none z-10">
                      <img src={img.full} alt={`Expanded Image ${i + 1}`} draggable={false} className="max-w-full h-[100dvh] object-contain pointer-events-auto select-none cursor-default" loading={Math.abs(activeIndex - i) <= 1 ? "eager" : "lazy"} />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>

            {images.length > 1 && (
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[250] flex items-center gap-4 bg-black/70 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-white shadow-2xl select-none cursor-auto">
                <button onClick={() => dialogApi?.scrollPrev()} className="p-1 hover:bg-white/20 rounded-full transition-colors outline-none cursor-pointer" aria-label="Previous image">
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <span className="text-sm font-bold tracking-wider px-2 tabular-nums">
                  {activeIndex + 1} of {images.length}
                </span>
                <button onClick={() => dialogApi?.scrollNext()} className="p-1 hover:bg-white/20 rounded-full transition-colors outline-none cursor-pointer" aria-label="Next image">
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}