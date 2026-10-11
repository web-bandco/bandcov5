import * as React from "react"
import { 
  ChevronDown, ArrowDownAZ, ArrowUpZA, TrendingUp, TrendingDown, 
  Sparkles, History, Filter, SlidersHorizontal, RefreshCw, PackageX 
} from "lucide-react" 
import { Skeleton } from "@/components/ui/shadcn/skeleton"
import { sanityClient, urlFor } from '@/lib/sanity'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/shadcn/select"
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/shadcn/sheet"
import { SiVinted, SiEbay } from "react-icons/si"

export interface ProductImage { thumb: string; full: string; }
export interface Product {
  id: string; title: string; slug: string; price: string; description: string;
  images: ProductImage[]; url: string; condition?: string; size?: string; fit?: string;
  createdAt?: string; category?: string; storeName: "Vinted" | "eBay";
  features?: string[];
  materials?: string[];
}

const trackEvent = (eventName: string, params: Record<string, any>) => {
  if (typeof window === 'undefined') return;
  if (typeof (window as any).gtag === 'function') {
    (window as any).gtag('event', eventName, params);
  } else if ((window as any).dataLayer) {
    (window as any).dataLayer.push({ event: eventName, ...params });
  }
};

function FilterSection({ title, children }: { title: string, children: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(true);
  return (
    <div className="space-y-3">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between py-2 border-b border-border text-sm font-semibold text-foreground hover:text-brand-500 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm">
        {title}
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && <div className="flex flex-col gap-3 pt-1 animate-in fade-in slide-in-from-top-1 duration-200">{children}</div>}
    </div>
  );
}

function ProductCard({ product, isPriority }: { product: Product, isPriority?: boolean }) {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [loadedImages, setLoadedImages] = React.useState<Record<string, boolean>>({});
  
  // Limit scrubber to max 3 images
  const previewImages = product.images.slice(0, 3);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (previewImages.length <= 1) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    const index = Math.floor(percentage * previewImages.length);
    setActiveIndex(Math.min(index, previewImages.length - 1));
  };

  const handleMouseLeave = () => setActiveIndex(0);
  const handleImageLoad = (key: string) => setLoadedImages(prev => ({ ...prev, [key]: true }));

  const PlatformIcon = product.storeName === "Vinted" ? SiVinted : SiEbay;
  const platformColor = product.storeName === "Vinted" ? "#017573" : "#0064D2";

  return (
    <a href={`/shop/${product.slug}`} className="group flex flex-col gap-3 outline-none h-full">
      <figure 
        className="relative w-full aspect-[3/4] overflow-hidden rounded-2xl bg-surface-secondary shadow-sm group-hover:shadow-lg transition-all duration-300"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div className="absolute top-3 left-3 z-20 flex items-center justify-center w-8 h-8 rounded-full bg-background/90 backdrop-blur shadow-sm border border-border">
          <PlatformIcon className="w-4 h-4" style={{ color: platformColor }} />
        </div>

        {previewImages.map((imgObj, i) => {
          const isLoaded = loadedImages[`card-${i}`];
          return (
            <React.Fragment key={i}>
              {!isLoaded && activeIndex === i && <Skeleton className="absolute inset-0 w-full h-full rounded-none z-10" />}
              <img 
                src={imgObj.thumb} 
                alt={`${product.title} - Preview ${i + 1}`} 
                onLoad={() => handleImageLoad(`card-${i}`)}
                className={`absolute inset-0 object-cover w-full h-full transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                style={{ zIndex: activeIndex === i ? 10 : 0 }}
                loading={isPriority && i === 0 ? "eager" : "lazy"} 
                decoding="async"
              />
            </React.Fragment>
          );
        })}
        {previewImages.length > 1 && (
          <div className="absolute bottom-3 left-0 right-0 z-20 flex justify-center gap-1.5 px-4">
            {previewImages.map((_, i) => (
              <div key={i} className={`h-1 rounded-full transition-all duration-300 ${activeIndex === i ? 'w-4 bg-white' : 'w-1.5 bg-white/50'}`} />
            ))}
          </div>
        )}
      </figure>

      <div className="flex flex-col flex-grow px-1">
        <h2 className="text-sm md:text-base font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-brand-500 transition-colors">
          {product.title}
        </h2>
        {/* mt-auto pushes the price to the bottom, aligning it with all other items in the row */}
        <div className="mt-auto pt-2">
          <span className="font-bold text-lg text-foreground">{product.price}</span>
        </div>
      </div>
    </a>
  );
}

export function ShopGrid({ children }: { children?: React.ReactNode }) {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [sortOption, setSortOption] = React.useState<string>("date-desc");
  const [selectedPlatforms, setSelectedPlatforms] = React.useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = React.useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = React.useState<string[]>([]);

  React.useEffect(() => {
    const fetchLiveProducts = async () => {
      try {
        const query = `*[_type == "product"]`;
        const data = await sanityClient.fetch(query);
        const formattedData = data.map((item: any) => ({
          ...item, id: item._id, slug: item.slug?.current || '', createdAt: item._createdAt, category: item.category, size: item.size, condition: item.condition, storeName: item.storeName,
          images: item.images?.map((img: any) => ({
            thumb: urlFor(img).width(600).format('webp').quality(80).url(), full: urlFor(img).width(1600).format('webp').quality(90).url()
          })) || []
        })).filter((item: Product) => item.slug); // ensure slug exists
        setProducts(formattedData);
      } catch (error) { console.error("Failed to fetch products:", error); } 
      finally { setIsLoading(false); }
    };
    fetchLiveProducts();
  }, []);

  const availableCategories = React.useMemo(() => Array.from(new Set(products.map(p => p.category).filter(Boolean) as string[])).sort(), [products]);
  const availableSizes = React.useMemo(() => Array.from(new Set(products.map(p => p.size).filter(Boolean) as string[])).sort(), [products]);
  const availablePlatforms = ["Vinted", "eBay"];

  const matchesFilter = React.useCallback((p: Product) => {
    const platformMatch = selectedPlatforms.length === 0 || selectedPlatforms.includes(p.storeName);
    const categoryMatch = selectedCategories.length === 0 || (p.category && selectedCategories.includes(p.category));
    const sizeMatch = selectedSizes.length === 0 || (p.size && selectedSizes.includes(p.size));
    return platformMatch && categoryMatch && sizeMatch;
  }, [selectedPlatforms, selectedCategories, selectedSizes]);

  const totalActiveFilters = selectedPlatforms.length + selectedCategories.length + selectedSizes.length;

  const clearAllFilters = () => {
    setSelectedPlatforms([]); setSelectedCategories([]); setSelectedSizes([]);
    trackEvent('use_filter', { filter_action: 'clear_all' });
  };

  const filteredAndSortedProducts = React.useMemo(() => {
    const filtered = products.filter(matchesFilter);
    return [...filtered].sort((a, b) => {
      const parsePrice = (priceStr?: string) => parseFloat((priceStr || "").replace(/[^0-9.-]+/g, "")) || 0;
      switch(sortOption) {
        case 'price-asc': return parsePrice(a.price) - parsePrice(b.price);
        case 'price-desc': return parsePrice(b.price) - parsePrice(a.price);
        case 'name-asc': return a.title.localeCompare(b.title);
        case 'name-desc': return b.title.localeCompare(a.title);
        case 'date-asc': return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
        case 'date-desc': default: return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
    });
  }, [products, sortOption, matchesFilter]);

  const FilterCheckbox = ({ label, isChecked, onChange, filterType }: { label: string, isChecked: boolean, onChange: (checked: boolean) => void, filterType: string }) => (
    <label className="flex items-center justify-between cursor-pointer group">
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-5 h-5 border border-border rounded shadow-sm group-hover:border-brand-500 transition-colors bg-background shrink-0">
          <input type="checkbox" className="peer sr-only" checked={isChecked} onChange={(e) => {
            const checked = e.target.checked; onChange(checked);
            trackEvent('use_filter', { filter_type: filterType, filter_value: label, filter_action: checked ? 'add' : 'remove' });
          }} />
          <div className="absolute inset-0 bg-brand-500 rounded opacity-0 peer-checked:opacity-100 transition-opacity flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          </div>
        </div>
        <span className="text-sm font-medium text-foreground group-hover:text-brand-500 transition-colors">{label}</span>
      </div>
    </label>
  );

  const sortOptionsData = [
    { value: "name-asc", label: "Name: A to Z", icon: ArrowDownAZ }, { value: "name-desc", label: "Name: Z to A", icon: ArrowUpZA },
    { value: "price-asc", label: "Price: Low to High", icon: TrendingUp }, { value: "price-desc", label: "Price: High to Low", icon: TrendingDown },
    { value: "date-desc", label: "Newest First", icon: Sparkles }, { value: "date-asc", label: "Oldest First", icon: History },
  ];

  if (isLoading) {
    return (
      <div className="w-full flex flex-col">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8"><div className="flex-1">{children}</div></div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 w-full">
          {[...Array(8)].map((_, i) => ( <Skeleton key={i} className="w-full aspect-[3/4] rounded-2xl" /> ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div className="flex-1">{children}</div>
        <div className="flex flex-row items-center gap-3 w-full md:w-auto z-20">
          
          <Sheet>
            <SheetTrigger asChild>
              <button className="flex-1 md:flex-none flex items-center justify-center gap-2 h-11 px-6 rounded-xl bg-surface-primary border border-border text-foreground shadow-sm hover:shadow-md transition-all font-medium whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <SlidersHorizontal className="w-4 h-4 text-foreground-muted" /><span>Filters</span>
                {totalActiveFilters > 0 && (<span className="flex items-center justify-center w-5 h-5 rounded-full bg-brand-500 text-white text-[10px] font-bold">{totalActiveFilters}</span>)}
              </button>
            </SheetTrigger>
            
            <SheetContent side="right" className="w-full sm:max-w-md bg-background border-l border-border p-0 flex flex-col z-[150]">
              <SheetHeader className="p-6 border-b border-border text-left">
                <SheetTitle className="text-xl font-bold">Filter & Sort</SheetTitle>
                <SheetDescription>Refine the B&Co catalog.</SheetDescription>
              </SheetHeader>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <FilterSection title="Sort By">
                  <Select value={sortOption} onValueChange={(val) => setSortOption(val)}>
                    <SelectTrigger aria-label="Sort products" className="w-full bg-surface-primary border-border text-foreground !h-11 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring"><SelectValue placeholder="Newest First" /></SelectTrigger>
                    <SelectContent position="popper" sideOffset={8} className="rounded-xl border-border bg-background shadow-2xl z-[200]">
                      <SelectGroup>
                        {sortOptionsData.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value} className="cursor-pointer py-2 focus:bg-accent focus:text-accent-foreground">
                            <div className="flex items-center gap-2.5"><opt.icon className="w-4 h-4 text-foreground-muted" /><span>{opt.label}</span></div>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FilterSection>

                <FilterSection title="Platform">
                  {availablePlatforms.map(plat => <FilterCheckbox key={plat} label={plat} filterType="Platform" isChecked={selectedPlatforms.includes(plat)} onChange={(c) => { if (c) setSelectedPlatforms(prev => [...prev, plat]); else setSelectedPlatforms(prev => prev.filter(item => item !== plat)); }} />)}
                </FilterSection>
                
                {availableCategories.length > 0 && (
                  <FilterSection title="Category">
                    {availableCategories.map(cat => <FilterCheckbox key={cat} label={cat} filterType="Category" isChecked={selectedCategories.includes(cat)} onChange={(c) => { if (c) setSelectedCategories(prev => [...prev, cat]); else setSelectedCategories(prev => prev.filter(item => item !== cat)); }} />)}
                  </FilterSection>
                )}
                
                {availableSizes.length > 0 && (
                  <FilterSection title="Size">
                    {availableSizes.map(size => <FilterCheckbox key={size} label={size} filterType="Size" isChecked={selectedSizes.includes(size)} onChange={(c) => { if (c) setSelectedSizes(prev => [...prev, size]); else setSelectedSizes(prev => prev.filter(item => item !== size)); }} />)}
                  </FilterSection>
                )}
              </div>

              <SheetFooter className="p-6 border-t border-border mt-auto">
                <button onClick={clearAllFilters} disabled={totalActiveFilters === 0} className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium text-foreground bg-surface-secondary border border-border transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent hover:text-accent-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <RefreshCw className="w-4 h-4" /> Clear Filters
                </button>
              </SheetFooter>
            </SheetContent>
          </Sheet>

          <div className="hidden md:block relative shrink-0 w-[240px]">
            <Select value={sortOption} onValueChange={(val) => setSortOption(val)}>
              <SelectTrigger aria-label="Sort products" className="w-full !h-11 px-4 bg-surface-primary border-border text-foreground rounded-xl shadow-sm hover:shadow-md transition-all font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <div className="flex items-center gap-2 overflow-hidden"><span className="text-foreground-muted font-normal shrink-0">Sort by:</span><SelectValue placeholder="Newest First" /></div>
              </SelectTrigger>
              <SelectContent position="popper" sideOffset={8} className="rounded-xl border-border bg-background shadow-2xl z-[100]">
                <SelectGroup>
                  {sortOptionsData.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="cursor-pointer py-2 focus:bg-accent focus:text-accent-foreground">
                      <div className="flex items-center gap-2.5"><opt.icon className="w-4 h-4 text-foreground-muted" /><span>{opt.label}</span></div>
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {filteredAndSortedProducts.length === 0 ? (
        <div className="w-full py-24 flex flex-col items-center justify-center text-center px-4 bg-surface-secondary rounded-3xl border border-border/50">
          <div className="w-16 h-16 rounded-2xl bg-brand-500/10 flex items-center justify-center mb-6"><PackageX className="w-8 h-8 text-brand-500" /></div>
          <h3 className="text-xl md:text-2xl font-bold text-foreground mb-2">No matches found</h3>
          <p className="text-foreground-muted max-w-sm">Try removing some filters to explore more of our catalog.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-6 md:gap-y-12 w-full">
          {filteredAndSortedProducts.map((product, index) => (
            <ProductCard key={product.id} product={product} isPriority={index < 4} />
          ))}
        </div>
      )}
    </div>
  )
}