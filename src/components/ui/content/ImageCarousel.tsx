import * as React from "react"
import { X } from "lucide-react" 
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
  DialogTrigger,
  DialogTitle,
  DialogClose,
} from "@/components/ui/shadcn/dialog"

export interface CarouselImage {
  src: string;
  alt: string;
}

interface ImageCarouselProps {
  images: CarouselImage[];
}

export function ImageCarousel({ images }: ImageCarouselProps) {
  const [mainApi, setMainApi] = React.useState<CarouselApi>()
  const [dialogApi, setDialogApi] = React.useState<CarouselApi>()
  const [selectedIndex, setSelectedIndex] = React.useState(0)

  if (!images || images.length === 0) return null;

  const handleImageClick = (index: number) => {
    setSelectedIndex(index);
    if (dialogApi) {
      dialogApi.scrollTo(index, true);
    }
  }

  React.useEffect(() => {
    if (!dialogApi || !mainApi) return

    dialogApi.on("select", () => {
      const newIndex = dialogApi.selectedScrollSnap();
      mainApi.scrollTo(newIndex);
    })
  }, [dialogApi, mainApi])

  return (
    <Dialog>
      {/* 1. THE MAIN PAGE CAROUSEL */}
      <Carousel 
        setApi={setMainApi}
        opts={{ align: "start", loop: true }}
        className="w-full group"
      >
        <CarouselContent>
          {images.map((image, index) => (
            <CarouselItem key={index}>
              <div className="p-1">
                <DialogTrigger asChild>
                  <div 
                    onClick={() => handleImageClick(index)}
                    className="overflow-hidden rounded-2xl border border-border bg-surface-primary shadow-sm aspect-video relative flex items-center justify-center cursor-pointer"
                  >
                    <img 
                      src={image.src} 
                      alt={image.alt} 
                      className="object-cover w-full h-full"
                    />
                  </div>
                </DialogTrigger>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        <CarouselPrevious className="left-4 bg-background/80 hover:bg-background border-none shadow-sm opacity-0 transition-opacity group-hover:opacity-100" />
        <CarouselNext className="right-4 bg-background/80 hover:bg-background border-none shadow-sm opacity-0 transition-opacity group-hover:opacity-100" />
      </Carousel>


      {/* 2. THE FULL-SCREEN LIGHTBOX */}
      <DialogContent 
        showCloseButton={false}
        className="max-w-none sm:max-w-none w-screen h-screen bg-transparent border-none shadow-none p-0 flex flex-col justify-center"
      >
        <DialogTitle className="sr-only">Image Gallery</DialogTitle>

        <Carousel 
          setApi={setDialogApi}
          opts={{ align: "center", loop: true, startIndex: selectedIndex }}
          className="w-full h-full flex items-center justify-center"
        >
          <CarouselContent className="h-full ml-0">
            {images.map((image, index) => (
              <CarouselItem key={index} className="h-full flex items-center justify-center pl-0">
                <div className="relative flex items-center justify-center w-full h-full p-4 md:p-8">
                  
                  {/* INVISIBLE BACKDROP: Clicking the empty space still closes the modal! */}
                  <DialogClose asChild>
                    <div className="absolute inset-0 z-0 cursor-default" />
                  </DialogClose>

                  {/* IMAGE & BUTTON WRAPPER */}
                  {/* FIX 1: We wrap the image and buttons together in a group/lightbox container */}
                  <div className="relative z-10 group/lightbox pointer-events-auto">
                    
                    {/* The Image */}
                    <img 
                      src={image.src} 
                      alt={image.alt} 
                      className="max-h-[90vh] max-w-[95vw] md:max-w-[90vw] object-contain rounded-lg shadow-2xl drop-shadow-2xl cursor-grab active:cursor-grabbing"
                    />

                    {/* FIX 2: The 'X' Button is now anchored inside the image corner! */}
                    {/* Opacity is 100 on mobile, but fades in on hover on desktop */}
                    <DialogClose className="absolute top-3 right-3 md:top-4 md:right-4 z-50 p-2 rounded-full bg-background/60 hover:bg-background backdrop-blur-md transition-all text-foreground outline-none opacity-100 md:opacity-0 md:group-hover/lightbox:opacity-100">
                      <X className="w-5 h-5 md:w-6 md:h-6" />
                      <span className="sr-only">Close</span>
                    </DialogClose>

                    {/* FIX 3: Nav buttons moved inside the wrapper so they perfectly hug the image edges */}
                    <CarouselPrevious className="left-3 md:left-4 bg-background/60 hover:bg-background border-none shadow-md backdrop-blur-md z-50 opacity-100 md:opacity-0 md:transition-opacity md:group-hover/lightbox:opacity-100" />
                    <CarouselNext className="right-3 md:right-4 bg-background/60 hover:bg-background border-none shadow-md backdrop-blur-md z-50 opacity-100 md:opacity-0 md:transition-opacity md:group-hover/lightbox:opacity-100" />
                  </div>

                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </DialogContent>

    </Dialog>
  )
}