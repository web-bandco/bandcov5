import * as React from "react"
import { 
  X, 
  ChevronDown, 
  ChevronUp, 
  ArrowDownAZ, 
  ArrowUpZA, 
  TrendingUp, 
  TrendingDown, 
  Sparkles, 
  History,
  Filter,
  SlidersHorizontal,
  RefreshCw
} from "lucide-react" 
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
import { Spinner } from "@/components/ui/shadcn/spinner"
import { ExternalLink } from "@/components/ui/content/ExternalLink"
import { sanityClient, urlFor } from '@/lib/sanity'

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/shadcn/select"

import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/shadcn/sheet"

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
  createdAt?: string; 
  category?: string; 
}

interface ShopCarouselProps {
  storeName: "Vinted" | "eBay";
  children?: React.ReactNode; 
}

function FilterSection({ title, children }: { title: string, children: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(true);
  
  return (
    <div className="space-y-3">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full flex items-center justify-between py-2 border-b border-border text-sm font-semibold text-foreground hover:text-brand-500 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
      >
        {title}
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="flex flex-col gap-3 pt-1 animate-in fade-in slide-in-from-top-1 duration-200">
          {children}
        </div>
      )}
    </div>
  );
}

function ProductCard({ product, storeName, gradientStyle }: { product: Product, storeName: string, gradientStyle: React.CSSProperties }) {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [isMounted, setIsMounted] = React.useState(false);
  const [loadedImages, setLoadedImages] = React.useState<Record<string, boolean>>({});
  
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [showToggle, setShowToggle] = React.useState(false);
  const textRef = React.useRef<HTMLParagraphElement>(null);

  const [isTitleExpanded, setIsTitleExpanded] = React.useState(false);
  const [showTitleToggle, setShowTitleToggle] = React.useState(false);
  const titleRef = React.useRef<HTMLSpanElement>(null);

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
      if (titleRef.current && !isTitleExpanded) {
        const isTruncated = titleRef.current.scrollHeight > titleRef.current.clientHeight + 2;
        setShowTitleToggle(isTruncated);
      }
    };
    checkTruncation();
    window.addEventListener('resize', checkTruncation);
    return () => window.removeEventListener('resize', checkTruncation);
  }, [product.description, product.title, isExpanded, isTitleExpanded]);

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
          {product.images.map((imgObj, i) => {
            const isLoaded = loadedImages[`card-${i}`];
            return (
              <React.Fragment key={i}>
                {!isLoaded && activeIndex === i && (
                  <Skeleton className="absolute inset-0 w-full h-full rounded-none z-10" />
                )}
                <img 
                  src={imgObj.thumb} 
                  alt={`${product.title} - Image ${i + 1}`} 
                  onLoad={() => handleImageLoad(`card-${i}`)}
                  className={`absolute inset-0 object-cover w-full h-full transition-opacity duration-300 z-0 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                  style={{
                    zIndex: activeIndex === i ? 0 : -10
                  }}
                  loading={i === 0 ? "eager" : "lazy"} 
                  decoding="async"
                />
              </React.Fragment>
            );
          })}

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
          <div className="flex flex-col mb-2 min-h-[3.5rem]">
            <h2 className="card-title flex items-start justify-between text-foreground text-lg gap-4">
              <span 
                ref={titleRef}
                className={`leading-snug break-words ${isTitleExpanded ? '' : 'line-clamp-2'}`}
              >
                {product.title}
              </span>
              <span className="font-bold whitespace-nowrap text-brand-500 shrink-0 mt-0.5">{product.price}</span>
            </h2>
            
            {showTitleToggle && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsTitleExpanded(!isTitleExpanded);
                }}
                className="mt-1 flex items-center justify-center w-6 h-6 rounded-full bg-surface-secondary hover:bg-surface-tertiary text-foreground-muted hover:text-foreground transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={isTitleExpanded ? 'Show less' : 'Read full title'}
                title={isTitleExpanded ? 'Show less' : 'Read full title'}
              >
                {isTitleExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            )}
          </div>

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
                className={`text-sm text-foreground-muted whitespace-pre-wrap ${isExpanded ? '' : 'line-clamp-2'}`}
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
              requireConfirm={true} 
              showIndicator={true}
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
                const isLoaded = loadedImages[`lightbox-${i}`];

                return (
                  <CarouselItem key={i} className="flex h-[100dvh] flex-col items-center justify-center pl-0 relative">
                    
                    <div 
                      className="absolute inset-0 z-0 cursor-pointer"
                      onClick={() => setIsOpen(false)} 
                      onPointerDown={(e) => e.stopPropagation()} 
                    />

                    <div className="relative w-full h-full p-4 md:p-24 flex items-center justify-center pointer-events-none z-10 md:cursor-pointer" onClick={() => setIsOpen(false)}>
                      
                      {!isLoaded && shouldLoad && (
                        <div className="absolute inset-0 flex items-center justify-center z-10">
                          <Spinner className="w-12 h-12 text-brand-500 animate-spin" />
                        </div>
                      )}
                      
                      {shouldLoad && (
                        <img 
                          src={imgObj.full} 
                          alt={`${product.title} - Expanded Image ${i + 1}`} 
                          onLoad={() => handleImageLoad(`lightbox-${i}`)}
                          ref={(img) => {
                            if (img && img.complete && !isLoaded) {
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
                          style={{ opacity: isLoaded ? 1 : 0 }}
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

export function ShopCarousel({ storeName, children }: ShopCarouselProps) {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  
  const [sortOption, setSortOption] = React.useState<string>("date-desc");
  
  const [selectedCategories, setSelectedCategories] = React.useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = React.useState<string[]>([]);
  const [selectedConditions, setSelectedConditions] = React.useState<string[]>([]);

  React.useEffect(() => {
    const fetchLiveProducts = async () => {
      try {
        const query = `*[_type == "product" && storeName == "${storeName}"]`;
        const data = await sanityClient.fetch(query);
        
        const formattedData = data.map((item: any) => ({
          ...item,
          id: item._id,
          createdAt: item._createdAt, 
          category: item.category,
          size: item.size,
          condition: item.condition,
          images: item.images?.map((img: any) => ({
            thumb: urlFor(img).width(600).format('webp').quality(80).url(),
            full: urlFor(img).width(1600).format('webp').quality(90).url()
          })) || []
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

  const availableCategories = React.useMemo(() => {
    const items = products.map(p => p.category).filter(Boolean) as string[];
    return Array.from(new Set(items)).sort();
  }, [products]);

  const availableSizes = React.useMemo(() => {
    const items = products.map(p => p.size).filter(Boolean) as string[];
    return Array.from(new Set(items)).sort();
  }, [products]);

  const availableConditions = React.useMemo(() => {
    const items = products.map(p => p.condition).filter(Boolean) as string[];
    return Array.from(new Set(items)).sort();
  }, [products]);

  const matchesSizes = React.useCallback((p: Product) => selectedSizes.length === 0 || (p.size && selectedSizes.includes(p.size)), [selectedSizes]);
  const matchesConditions = React.useCallback((p: Product) => selectedConditions.length === 0 || (p.condition && selectedConditions.includes(p.condition)), [selectedConditions]);
  const matchesCategories = React.useCallback((p: Product) => selectedCategories.length === 0 || (p.category && selectedCategories.includes(p.category)), [selectedCategories]);

  const getCategoryCount = React.useCallback((cat: string) => {
    return products.filter(p => p.category === cat && matchesSizes(p) && matchesConditions(p)).length;
  }, [products, matchesSizes, matchesConditions]);

  const getSizeCount = React.useCallback((size: string) => {
    return products.filter(p => p.size === size && matchesCategories(p) && matchesConditions(p)).length;
  }, [products, matchesCategories, matchesConditions]);

  const getConditionCount = React.useCallback((cond: string) => {
    return products.filter(p => p.condition === cond && matchesCategories(p) && matchesSizes(p)).length;
  }, [products, matchesCategories, matchesSizes]);

  const totalActiveFilters = selectedCategories.length + selectedSizes.length + selectedConditions.length;

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedSizes([]);
    setSelectedConditions([]);
  };

  const filteredAndSortedProducts = React.useMemo(() => {
    const filtered = products.filter((product) => matchesCategories(product) && matchesSizes(product) && matchesConditions(product));

    return [...filtered].sort((a, b) => {
      const parsePrice = (priceStr?: string) => {
        if (!priceStr) return 0;
        const parsed = parseFloat(priceStr.replace(/[^0-9.-]+/g, ""));
        return isNaN(parsed) ? 0 : parsed;
      };

      const priceA = parsePrice(a.price);
      const priceB = parsePrice(b.price);
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();

      switch(sortOption) {
        case 'price-asc': return priceA - priceB;
        case 'price-desc': return priceB - priceA;
        case 'name-asc': return a.title.localeCompare(b.title);
        case 'name-desc': return b.title.localeCompare(a.title);
        case 'date-asc': return dateA - dateB;
        case 'date-desc': 
        default: 
          return dateB - dateA;
      }
    });
  }, [products, sortOption, matchesCategories, matchesSizes, matchesConditions]);

  const gradientStyle = { background: 'linear-gradient(135deg, #ff0055, #ff2e43)' };

  const FilterCheckbox = ({ label, isChecked, onChange, count }: { label: string, isChecked: boolean, onChange: (checked: boolean) => void, count: number }) => {
    const isDisabled = count === 0 && !isChecked;
    
    return (
      <label className={`flex items-center justify-between cursor-pointer group ${isDisabled ? 'opacity-40 pointer-events-none' : ''}`}>
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-5 h-5 border border-border rounded shadow-sm group-hover:border-brand-500 transition-colors bg-background shrink-0">
            <input 
              type="checkbox"
              className="peer sr-only"
              checked={isChecked}
              onChange={(e) => onChange(e.target.checked)}
              disabled={isDisabled}
            />
            <div className="absolute inset-0 bg-brand-500 rounded opacity-0 peer-checked:opacity-100 transition-opacity flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <span className="text-sm font-medium text-foreground group-hover:text-brand-500 transition-colors">
            {label}
          </span>
        </div>
        <span className="text-xs text-foreground-muted group-hover:text-foreground transition-colors font-medium">
          ({count})
        </span>
      </label>
    );
  };

  const sortOptionsData = [
    { value: "name-asc", label: "Name: A to Z", icon: ArrowDownAZ },
    { value: "name-desc", label: "Name: Z to A", icon: ArrowUpZA },
    { value: "price-asc", label: "Price: Low to High", icon: TrendingUp },
    { value: "price-desc", label: "Price: High to Low", icon: TrendingDown },
    { value: "date-desc", label: "Newest First", icon: Sparkles },
    { value: "date-asc", label: "Oldest First", icon: History },
  ];

  if (isLoading) {
    return (
      <div className="w-full flex space-x-4 px-4 overflow-hidden mt-10">
        <Skeleton className="w-[85%] sm:w-[60%] md:w-[50%] lg:w-[33%] aspect-[3/4] rounded-2xl" />
        <Skeleton className="hidden md:block w-[50%] lg:w-[33%] aspect-[3/4] rounded-2xl" />
        <Skeleton className="hidden lg:block w-[33%] aspect-[3/4] rounded-2xl" />
      </div>
    );
  }

  if (!products || products.length === 0) return <p className="px-4 text-foreground-muted mt-10">No items currently listed.</p>;

  return (
    <div className="w-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-4 md:px-0 mb-8">
        
        <div className="flex-1">
          {children}
        </div>

        <div className="flex flex-row items-center gap-3 self-start md:self-end z-20 w-full md:w-auto">
          
          <Sheet>
            
            <SheetTrigger asChild>
              <button className="md:hidden flex-1 flex items-center justify-center gap-2 h-11 px-4 rounded-xl bg-surface-primary border border-border text-foreground shadow-sm hover:shadow-md transition-all font-medium whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <SlidersHorizontal className="w-4 h-4 text-foreground-muted" />
                <span>Sort & Filter</span>
                {totalActiveFilters > 0 && (
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-brand-500 text-white text-[10px] font-bold">
                    {totalActiveFilters}
                  </span>
                )}
              </button>
            </SheetTrigger>

            <SheetTrigger asChild>
              <button className="hidden md:flex items-center justify-center gap-2 h-11 px-4 rounded-xl bg-surface-primary border border-border text-foreground shadow-sm hover:shadow-md transition-all font-medium whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <Filter className="w-4 h-4 text-foreground-muted" />
                <span>Filter</span>
                {totalActiveFilters > 0 && (
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-brand-500 text-white text-[10px] font-bold">
                    {totalActiveFilters}
                  </span>
                )}
              </button>
            </SheetTrigger>
            
            <SheetContent side="right" className="w-full sm:max-w-md bg-background border-l border-border p-0 flex flex-col z-[150]">
              
              <SheetHeader className="p-6 border-b border-border text-left">
                <div className="mb-1">
                  <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-widest bg-brand-500/10 text-brand-500">
                    SHOP: B&CO - {storeName.toUpperCase()}
                  </span>
                </div>
                <SheetTitle className="text-xl font-bold">Refine Results</SheetTitle>
                <SheetDescription>Adjust sorting and active filters below.</SheetDescription>
              </SheetHeader>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                <div className="md:hidden">
                  <FilterSection title="Sort By">
                    <Select value={sortOption} onValueChange={setSortOption}>
                      <SelectTrigger className="w-full bg-surface-primary border-border text-foreground !h-11 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring">
                        <SelectValue placeholder="Newest First" />
                      </SelectTrigger>
                      <SelectContent position="popper" sideOffset={8} className="rounded-xl border-border bg-background shadow-2xl z-[200]">
                        <SelectGroup>
                          {sortOptionsData.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value} className="cursor-pointer py-2 focus:bg-accent focus:text-accent-foreground">
                              <div className="flex items-center gap-2.5">
                                <opt.icon className="w-4 h-4 text-foreground-muted" />
                                <span>{opt.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FilterSection>
                </div>

                {availableCategories.length > 0 && (
                  <FilterSection title="Category">
                    {availableCategories.map(cat => (
                      <FilterCheckbox 
                        key={cat} 
                        label={cat} 
                        count={getCategoryCount(cat)}
                        isChecked={selectedCategories.includes(cat)}
                        onChange={(checked) => {
                          if (checked) setSelectedCategories(prev => [...prev, cat]);
                          else setSelectedCategories(prev => prev.filter(c => c !== cat));
                        }} 
                      />
                    ))}
                  </FilterSection>
                )}

                {availableSizes.length > 0 && (
                  <FilterSection title="Size">
                    {availableSizes.map(size => (
                      <FilterCheckbox 
                        key={size} 
                        label={size} 
                        count={getSizeCount(size)}
                        isChecked={selectedSizes.includes(size)}
                        onChange={(checked) => {
                          if (checked) setSelectedSizes(prev => [...prev, size]);
                          else setSelectedSizes(prev => prev.filter(s => s !== size));
                        }} 
                      />
                    ))}
                  </FilterSection>
                )}

                {availableConditions.length > 0 && (
                  <FilterSection title="Condition">
                    {availableConditions.map(cond => (
                      <FilterCheckbox 
                        key={cond} 
                        label={cond} 
                        count={getConditionCount(cond)}
                        isChecked={selectedConditions.includes(cond)}
                        onChange={(checked) => {
                          if (checked) setSelectedConditions(prev => [...prev, cond]);
                          else setSelectedConditions(prev => prev.filter(c => c !== cond));
                        }} 
                      />
                    ))}
                  </FilterSection>
                )}

                {totalActiveFilters === 0 && (
                   <p className="text-sm text-foreground-muted hidden md:block pt-2">No active filters applied.</p>
                )}
              </div>

              <SheetFooter className="p-6 border-t border-border mt-auto">
                <button 
                  onClick={clearAllFilters}
                  disabled={totalActiveFilters === 0}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium text-foreground bg-surface-secondary border border-border transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent hover:text-accent-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <RefreshCw className="w-4 h-4" />
                  Clear Filters
                </button>
              </SheetFooter>
            </SheetContent>
          </Sheet>

          <div className="hidden md:block relative shrink-0 w-[240px]">
            <Select value={sortOption} onValueChange={setSortOption}>
              <SelectTrigger className="w-full !h-11 px-4 bg-surface-primary border-border text-foreground rounded-xl shadow-sm hover:shadow-md transition-all font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className="text-foreground-muted font-normal shrink-0">Sort by:</span>
                  <SelectValue placeholder="Newest First" />
                </div>
              </SelectTrigger>
              
              <SelectContent 
                position="popper" 
                sideOffset={8}
                className="rounded-xl border-border bg-background shadow-2xl z-[100]"
              >
                <SelectGroup>
                  {sortOptionsData.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="cursor-pointer py-2 focus:bg-accent focus:text-accent-foreground">
                      <div className="flex items-center gap-2.5">
                        <opt.icon className="w-4 h-4 text-foreground-muted" />
                        <span>{opt.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

        </div>
      </div>

      {filteredAndSortedProducts.length === 0 ? (
        <div className="w-full py-16 flex flex-col items-center justify-center text-center px-4">
          <Filter className="w-12 h-12 text-border mb-4" />
          <h3 className="text-lg font-bold text-foreground mb-1">No matches found</h3>
          <p className="text-foreground-muted">Try removing some filters to see more results.</p>
        </div>
      ) : (
        <Carousel 
          opts={{ 
            align: "start", 
            dragFree: false,
            breakpoints: {
              '(min-width: 1024px)': { watchDrag: filteredAndSortedProducts.length > 3 }
            }
          }} 
          plugins={[WheelGesturesPlugin()]} 
          className="w-full px-4 md:px-0 group [&_.overflow-hidden]:rounded-2xl relative"
        >
          <CarouselContent className="-ml-4 items-start">
            {filteredAndSortedProducts.map((product) => (
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
      )}
    </div>
  )
}