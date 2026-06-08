import * as React from "react"
import { X } from "lucide-react"
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures" 
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/shadcn/carousel"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogClose,
} from "@/components/ui/shadcn/dialog"

export interface Product {
  id: string;
  title: string;
  price: string;
  description: string;
  images: string[];
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

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <Dialog>
      <div className="card bg-surface-primary shadow-sm hover:shadow-md transition-shadow border border-border h-full flex flex-col group overflow-hidden rounded-2xl">
        
        <DialogTrigger asChild>
          <figure 
            className="relative w-full aspect-[3/4] overflow-hidden border-b border-border bg-surface-secondary cursor-pointer"
            onMouseLeave={() => setActiveIndex(0)}
          >
            {product.images.map((img, i) => (
              <img 
                key={i} 
                src={img} 
                alt={`${product.title} - Image ${i + 1}`} 
                className="absolute inset-0 object-cover w-full h-full"
                // CHANGED: Transitions completely removed for an instant hard-snap
                style={{
                  opacity: activeIndex === i ? 1 : 0,
                  zIndex: activeIndex === i ? 0 : -10
                }}
                loading="eager" 
                decoding="async"
              />
            ))}

            <div className="absolute inset-0 z-10 flex">
              {product.images.map((_, i) => (
                <div 
                  key={i} 
                  className="flex-1 h-full"
                  onMouseEnter={() => setActiveIndex(i)}
                />
              ))}
            </div>
          </figure>
        </DialogTrigger>

        <div className="card-body p-5 flex flex-col flex-grow">
          <h2 className="card-title flex items-start justify-between text-foreground text-lg mb-2 gap-4 min-h-[3.5rem]">
            <span className="line-clamp-2 leading-tight">{product.title}</span>
            <span className="font-bold whitespace-nowrap text-brand-500">{product.price}</span>
          </h2>

          {(product.condition || product.size) && (
            <div className="flex flex-col gap-0.5 mb-3 text-sm text-foreground">
              {product.condition && (
                <span><span className="font-semibold opacity-80">Condition:</span> {product.condition}</span>
              )}
              {product.size && (
                <span><span className="font-semibold opacity-80">Size:</span> {product.size}</span>
              )}
            </div>
          )}

          <p className="text-sm text-foreground-muted line-clamp-2 flex-grow">{product.description}</p>
          
          <div className="card-actions justify-end mt-4">
            <a 
              href={product.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn border-none rounded-xl text-white w-full opacity-90 hover:opacity-100 hover:scale-[1.02] transition-all shadow-sm"
              style={gradientStyle}
            >
              Buy on {storeName}
            </a>
          </div>
        </div>
      </div>

      {isMounted && (
        <DialogContent 
          showCloseButton={false}
          className="max-w-none sm:max-w-none w-screen h-screen bg-transparent border-none shadow-none p-0 flex flex-col justify-center"
        >
          <DialogTitle className="sr-only">{product.title} Lightbox View</DialogTitle>

          <Carousel 
            opts={{ align: "center", loop: true, startIndex: activeIndex }}
            plugins={[WheelGesturesPlugin()]} 
            className="w-full h-full flex items-center justify-center"
          >
            <CarouselContent className="h-full ml-0">
              {product.images.map((img, i) => (
                <CarouselItem key={i} className="h-full flex items-center justify-center pl-0">
                  <div className="relative flex items-center justify-center w-full h-full p-4 md:p-8">
                    
                    <DialogClose asChild>
                      <div className="absolute inset-0 z-0 cursor-default" />
                    </DialogClose>

                    <div className="relative z-10 group/lightbox pointer-events-auto w-full max-w-[85vw] md:max-w-none md:w-auto max-h-[70vh] md:h-full md:max-h-[85vh] aspect-[3/4] rounded-lg shadow-2xl drop-shadow-2xl overflow-hidden bg-black/5">
                      
                      {/* CHANGED: Removed transition-transform to keep lightbox rendering completely static */}
                      <img 
                        src={img} 
                        alt={`${product.title} - Expanded Image ${i + 1}`} 
                        className="w-full h-full object-cover"
                      />

                      <DialogClose className="absolute top-3 right-3 md:top-4 md:right-4 z-50 p-2 rounded-full bg-background/60 hover:bg-background backdrop-blur-md transition-all text-foreground outline-none opacity-100 md:opacity-0 md:group-hover/lightbox:opacity-100">
                        <X className="w-5 h-5 md:w-6 md:h-6" />
                        <span className="sr-only">Close</span>
                      </DialogClose>

                      <CarouselPrevious className="left-3 md:left-4 bg-background/60 hover:bg-background border-none shadow-md backdrop-blur-md z-50 opacity-100 md:opacity-0 md:transition-opacity md:group-hover/lightbox:opacity-100" />
                      <CarouselNext className="right-3 md:right-4 bg-background/60 hover:bg-background border-none shadow-md backdrop-blur-md z-50 opacity-100 md:opacity-0 md:transition-opacity md:group-hover/lightbox:opacity-100" />
                    </div>

                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </DialogContent>
      )}
    </Dialog>
  )
}

export function ShopCarousel({ products, storeName }: ShopCarouselProps) {
  if (!products || products.length === 0) return null;

  const gradientStyle = { background: 'linear-gradient(135deg, #ff0055, #ff2e43)' };

  return (
    <Carousel 
      opts={{ align: "start", dragFree: true }} 
      plugins={[WheelGesturesPlugin()]} 
      className="w-full px-4 md:px-0"
    >
      <CarouselContent className="-ml-4">
        {products.map((product) => (
          <CarouselItem key={product.id} className="pl-4 basis-[85%] sm:basis-[60%] md:basis-1/2 lg:basis-1/3">
            <div className="p-1 h-full">
              <ProductCard product={product} storeName={storeName} gradientStyle={gradientStyle} />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      
      <CarouselPrevious className="flex left-0 md:-left-4 bg-background shadow-md border-border" />
      <CarouselNext className="flex right-0 md:-right-4 bg-background shadow-md border-border" />
    </Carousel>
  )
}