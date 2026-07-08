import * as React from "react"
import { X } from "lucide-react"
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures" 
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/shadcn/carousel"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/shadcn/dialog"
import { Skeleton } from "@/components/ui/shadcn/skeleton"
import { ExternalLink } from "@/components/ui/content/ExternalLink"
import { sanityClient } from '@/lib/sanity' // Adjust path as needed

export interface ProductImage {
  thumb: string;
  full: string;
}

export interface Product {
  id: string;
  title: string;
  price: string;
  description: string;
  images: ProductImage[]; 
  url: string;
  condition?: string;
  size?: string;
}

interface ShopCarouselProps {
  products: Product[];
  storeName: "Vinted" | "eBay";
}

function ProductCard({ product, storeName, gradientStyle }: { product: Product, storeName: string, gradientStyle: React.CSSProperties }) {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [isMounted, setIsMounted] = React.useState(false);
  const [loadedImages, setLoadedImages] = React.useState<Record<string, boolean>>({});
  
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [showToggle, setShowToggle] = React.useState(false);
  const textRef = React.useRef<HTMLParagraphElement>(null);

  const [isOpen, setIsOpen] = React.useState(false);
  const [dialogApi, setDialogApi] = React.useState<CarouselApi>()
  const [lightboxActiveSlides, setLightboxActiveSlides] = React.useState<Set<number>>(new Set())

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  React.useEffect(() => {
    const checkTruncation = () => {
      if (textRef.current && !isExpanded) {
        const isTruncated = textRef.current.scrollHeight > textRef.current.clientHeight + 2;
        setShowToggle(isTruncated);
      }
    };
    checkTruncation();
    window.addEventListener('resize', checkTruncation);
    return () => window.removeEventListener('resize', checkTruncation);
  }, [product.description, isExpanded]);

  const handleImageLoad = (key: string) => {
    setLoadedImages((prev) => ({ ...prev, [key]: true }));
  };

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

  React.useEffect(() => {
    if (!dialogApi) return;
    const onDialogSelect = () => {
      const current = dialogApi.selectedScrollSnap();
      setLightboxActiveSlides(prev => {
        const next = new Set(prev);
        getActiveWindow(current, product.images.length).forEach(i => next.add(i));
        return next;
      });
    };
    onDialogSelect();
    dialogApi.on("select", onDialogSelect);
  }, [dialogApi, product.images.length, getActiveWindow]);

  // CAPTURE-PHASE EVENT INTERCEPTOR
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

  const handleDialogOpen = () => {
    setIsOpen(true);
    setLightboxActiveSlides(prev => {
      const next = new Set(prev);
      getActiveWindow(activeIndex, product.images.length).forEach(i => next.add(i));
      return next;
    });
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <div className="card bg-surface-primary shadow-sm hover:shadow-lg transition-shadow border border-border flex flex-col group overflow-hidden rounded-2xl transform-gpu">
        
        <figure 
          className="relative z-10 w-full aspect-[3/4] overflow-hidden bg-surface-secondary cursor-pointer shadow-lg"
          onMouseLeave={() => setActiveIndex(0)}
          onClick={handleDialogOpen}
        >
          <Skeleton className="absolute inset-0 w-full h-full rounded-none" />

          {product.images.map((imgObj, i) => (
            <img 
              key={i} 
              src={imgObj.thumb} 
              alt={`${product.title} - Image ${i + 1}`} 
              onLoad={() => handleImageLoad(`card-${i}`)}
              className="absolute inset-0 object-cover w-full h-full"
              style={{
                opacity: activeIndex === i && loadedImages[`card-${i}`] ? 1 : 0,
                zIndex: activeIndex === i ? 0 : -10
              }}
              loading={i === 0 ? "eager" : "lazy"} 
              decoding="async"
            />
          ))}

          <div className="absolute inset-0 z-10 hidden md:flex">
            {product.images.map((_, i) => (
              <div 
                key={i} 
                className="flex-1 h-full"
                onMouseEnter={() => setActiveIndex(i)}
              />
            ))}
          </div>
        </figure>

        <div className="card-body p-5 flex flex-col flex-grow">
          <h2 className="card-title flex items-start justify-between text-foreground text-lg mb-2 gap-4 h-[3.5rem]">
            <span className="line-clamp-2 leading-snug">{product.title}</span>
            <span className="font-bold whitespace-nowrap text-brand-500 shrink-0">{product.price}</span>
          </h2>

          <div className="flex flex-col gap-0.5 mb-3 text-sm text-foreground h-[2.5rem] justify-start">
            {product.condition && (
              <span><span className="font-semibold opacity-80">Condition:</span> {product.condition}</span>
            )}
            {product.size && (
              <span><span className="font-semibold opacity-80">Size:</span> {product.size}</span>
            )}
          </div>

          <div className="flex-grow flex flex-col items-start w-full">
            <div className="transition-all duration-200 w-full min-h-[2.5rem]">
              <p 
                ref={textRef}
                className={`text-sm text-foreground-muted ${isExpanded ? '' : 'line-clamp-2'}`}
              >
                {product.description}
              </p>
            </div>
            
            <div className="h-[1.5rem] mt-1.5 w-full flex items-start">
              {showToggle && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(!isExpanded);
                  }}
                  className="text-xs font-semibold text-foreground cursor-pointer hover:underline outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                >
                  {isExpanded ? 'Show less' : 'Read more'}
                </button>
              )}
            </div>
          </div>
          
          <div className="card-actions justify-end mt-5">
            <ExternalLink 
              href={product.url}
              requireConfirm={false} 
              showIndicator={false}
              className="btn border-none rounded-xl text-white w-full opacity-90 hover:opacity-100 hover:scale-[1.02] transition-all shadow-sm flex justify-center items-center"
              style={gradientStyle}
            >
            Buy on {storeName}
          </ExternalLink>
        </div>
        </div>
      </div>

      {isMounted && (
        <DialogContent 
          showCloseButton={false}
          className="max-w-none sm:max-w-none w-screen h-[100dvh] bg-transparent border-none shadow-none p-0 flex flex-col justify-center overflow-hidden data-[state=open]:animate-none outline-none"
        >
          <DialogTitle className="sr-only">{product.title} Lightbox View</DialogTitle>

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

          <Carousel 
            setApi={setDialogApi}
            opts={{ 
              align: "center", 
              loop: true, 
              startIndex: activeIndex,
              watchDrag: (root) => window.matchMedia('(max-width: 768px)').matches
            }}
            plugins={[WheelGesturesPlugin()]} 
            className="w-full h-full flex items-center justify-center max-md:pointer-events-none"
          >
            <CarouselContent className="h-full ml-0">
              {product.images.map((imgObj, i) => {
                const shouldLoad = lightboxActiveSlides.has(i);

                return (
                  <CarouselItem key={i} className="flex h-[100dvh] flex-col items-center justify-center pl-0 relative">
                    
                    <div 
                      className="absolute inset-0 z-0 cursor-pointer"
                      onClick={() => setIsOpen(false)} 
                      onPointerDown={(e) => e.stopPropagation()} 
                    />

                    <div className="relative w-full h-full p-4 md:p-24 flex items-center justify-center pointer-events-none z-10 md:cursor-pointer" onClick={() => setIsOpen(false)}>
                      
                      {shouldLoad && (
                        <img 
                          src={imgObj.full} 
                          alt={`${product.title} - Expanded Image ${i + 1}`} 
                          onLoad={() => handleImageLoad(`lightbox-${i}`)}
                          ref={(img) => {
                            if (img && img.complete && !loadedImages[`lightbox-${i}`]) {
                              handleImageLoad(`lightbox-${i}`);
                            }
                          }}
                          onClick={(e) => e.stopPropagation()}
                          onPointerDown={(e) => {
                            if (e.pointerType === 'mouse' || window.matchMedia('(min-width: 768px)').matches) {
                              e.stopPropagation();
                            }
                          }}
                          className="max-w-full max-h-[85dvh] w-auto h-auto object-contain drop-shadow-2xl pointer-events-auto cursor-grab active:cursor-grabbing md:cursor-default z-20 transition-opacity duration-300"
                          style={{ opacity: loadedImages[`lightbox-${i}`] ? 1 : 0 }}
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
      )}
    </Dialog>
  )
}

export function ShopCarousel({ storeName }: { storeName: "Vinted" | "eBay" }) {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchLiveProducts = async () => {
      try {
        // Fetches strictly the items for this specific carousel's platform
        const query = `*[_type == "product" && storeName == "${storeName}"]`;
        const data = await sanityClient.fetch(query);
        
        // Map Sanity's internal _id to our component's expected id
        const formattedData = data.map((item: any) => ({
          ...item,
          id: item._id
        }));

        setProducts(formattedData);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLiveProducts();
  }, [storeName]);

  const gradientStyle = { background: 'linear-gradient(135deg, #ff0055, #ff2e43)' };

  // Show a loading state while fetching live prices
  if (isLoading) {
    return (
      <div className="w-full flex space-x-4 px-4 overflow-hidden">
        <Skeleton className="w-[85%] sm:w-[60%] md:w-[50%] lg:w-[33%] aspect-[3/4] rounded-2xl" />
        <Skeleton className="hidden md:block w-[50%] lg:w-[33%] aspect-[3/4] rounded-2xl" />
        <Skeleton className="hidden lg:block w-[33%] aspect-[3/4] rounded-2xl" />
      </div>
    );
  }

  if (!products || products.length === 0) return <p className="px-4 text-foreground-muted">No items currently listed.</p>;

  return (
      <Carousel 
        opts={{ 
          align: "start", 
          dragFree: false,
          breakpoints: {
            '(min-width: 1024px)': { watchDrag: products.length > 3 }
          }
        }} 
        plugins={[WheelGesturesPlugin()]} 
        className="w-full px-4 md:px-0 group [&_.overflow-hidden]:rounded-2xl relative"
      >
        <CarouselContent className="-ml-4 items-start">
          {products.map((product) => (
            <CarouselItem key={product.id} className="pl-4 basis-[85%] sm:basis-[60%] md:basis-1/2 lg:basis-1/3">
              <div className="p-1">
                <ProductCard product={product} storeName={storeName} gradientStyle={gradientStyle} />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        <CarouselPrevious className="hidden md:flex w-12 h-12 [&>svg]:w-6 [&>svg]:h-6 left-0 md:-left-6 bg-background shadow-md border-border opacity-0 transition-opacity duration-300 delay-500 group-hover:opacity-100 group-hover:delay-0 group-focus-within:opacity-100 group-focus-within:delay-0 disabled:opacity-0 disabled:hidden disabled:pointer-events-none top-0 mt-56 lg:mt-56 -translate-y-1/2" />
        <CarouselNext className="hidden md:flex w-12 h-12 [&>svg]:w-6 [&>svg]:h-6 right-0 md:-right-6 bg-background shadow-md border-border opacity-0 transition-opacity duration-300 delay-500 group-hover:opacity-100 group-hover:delay-0 group-focus-within:opacity-100 group-focus-within:delay-0 disabled:opacity-0 disabled:hidden disabled:pointer-events-none top-0 mt-56 lg:mt-56 -translate-y-1/2" />
      </Carousel>
  )
}