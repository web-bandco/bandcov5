import * as React from "react"
import { X, ChevronLeft, ChevronRight } from "lucide-react"
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures"
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/shadcn/carousel"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/shadcn/dialog"
import { Spinner } from "@/components/ui/shadcn/spinner"

export interface LightboxImage {
  src: string;
  srcset?: string;
  alt: string;
}

interface LightboxProps {
  images: LightboxImage[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Image shown when the lightbox opens */
  startIndex: number;
  /** Called when the image in view changes (e.g. to keep a gallery in sync) */
  onIndexChange?: (index: number) => void;
  /** Accessible name for the dialog */
  title: string;
  /** The page's copy of the start image, shown until the large one loads */
  placeholder?: string;
}

/** The photo in a clicked element, if the page has finished loading it (for `placeholder`) */
export const pagePhoto = (e: React.MouseEvent<HTMLElement>) => {
  const img = e.currentTarget.querySelector("img")
  return img?.complete && img.naturalWidth ? img.currentSrc : undefined
}

/**
 * Full-screen image viewer shared by the photo carousels, holiday galleries and
 * product pages: dark backdrop, close button, swipe / drag / arrow-key navigation
 * and a bottom pill (‹ 1 of N ›). Only the image in view and its neighbours load.
 */
export function Lightbox({ open, onOpenChange, title, ...body }: LightboxProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="group !max-w-[100vw] !w-screen !h-[100dvh] !m-0 !p-0 !border-none !rounded-none bg-black/95 flex flex-col justify-center overflow-hidden outline-none z-[200] cursor-default duration-300 ease-out data-[state=closed]:duration-200 data-[state=open]:zoom-in-100 data-[state=closed]:zoom-out-100"
      >
        <DialogTitle className="sr-only">{title}</DialogTitle>
        {/* Mounted each time the lightbox opens, so it starts on the chosen image */}
        <LightboxBody {...body} close={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  )
}

interface LightboxBodyProps extends Omit<LightboxProps, "open" | "onOpenChange" | "title"> {
  close: () => void;
}

function LightboxBody({ images, startIndex, onIndexChange, placeholder, close }: LightboxBodyProps) {
  const [initialIndex] = React.useState(startIndex)
  const [api, setApi] = React.useState<CarouselApi>()
  const [index, setIndex] = React.useState(startIndex)
  const [requested, setRequested] = React.useState<Set<number>>(() => neighbours(startIndex, images.length))
  const [loaded, setLoaded] = React.useState<Set<number>>(() => new Set())

  const markLoaded = React.useCallback((i: number) => {
    setLoaded((prev) => (prev.has(i) ? prev : new Set(prev).add(i)))
  }, [])

  React.useEffect(() => {
    if (!api) return
    const onSelect = () => {
      const i = api.selectedScrollSnap()
      setIndex(i)
      setRequested((prev) => {
        const next = new Set([...prev, ...neighbours(i, images.length)])
        return next.size === prev.size ? prev : next
      })
      onIndexChange?.(i)
    }
    api.on("select", onSelect)
    return () => { api.off("select", onSelect) }
  }, [api, images.length, onIndexChange])

  // Left / right arrow keys move between images
  React.useEffect(() => {
    if (!api) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") { e.preventDefault(); api.scrollPrev() }
      else if (e.key === "ArrowRight") { e.preventDefault(); api.scrollNext() }
    }
    window.addEventListener("keydown", onKeyDown, { capture: true })
    return () => window.removeEventListener("keydown", onKeyDown, { capture: true })
  }, [api])

  // Swipe down to close (touch and pen): the photo follows the finger and the
  // background fades. Past 120px, or after a quick flick, the lightbox closes;
  // otherwise the photo springs back. Sideways swipes stay with the carousel.
  const swipeArea = React.useRef<HTMLDivElement>(null)
  const closeRef = React.useRef(close)
  closeRef.current = close
  React.useEffect(() => {
    const area = swipeArea.current
    const backdrop = area?.closest<HTMLElement>('[data-slot="dialog-content"]')
    if (!area || !backdrop) return
    let start: { id: number; x: number; y: number; time: number } | null = null
    let dragging = false
    let distance = 0

    const springBack = () => {
      area.style.transition = "translate 250ms cubic-bezier(0.2, 0.8, 0.2, 1)"
      area.style.translate = ""
      backdrop.style.backgroundColor = ""
    }
    const down = (e: PointerEvent) => {
      if (e.pointerType === "mouse" || start) return
      start = { id: e.pointerId, x: e.clientX, y: e.clientY, time: e.timeStamp }
      dragging = false
      distance = 0
    }
    const move = (e: PointerEvent) => {
      if (!start || e.pointerId !== start.id) return
      const dx = e.clientX - start.x
      distance = e.clientY - start.y
      if (!dragging) {
        if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(distance)) { start = null; return }
        if (distance < 10) return
        dragging = true
        area.setPointerCapture(e.pointerId)
        area.style.transition = "none"
      }
      const offset = Math.max(0, distance)
      area.style.translate = `0 ${offset}px`
      backdrop.style.backgroundColor = `rgb(0 0 0 / ${0.95 * Math.max(0.3, 1 - offset / 400)})`
    }
    const up = (e: PointerEvent) => {
      if (!start || e.pointerId !== start.id) return
      const speed = distance / Math.max(1, e.timeStamp - start.time)
      start = null
      if (!dragging) return
      dragging = false
      if (distance > 120 || speed > 0.6) closeRef.current()
      else springBack()
    }

    area.addEventListener("pointerdown", down)
    area.addEventListener("pointermove", move)
    area.addEventListener("pointerup", up)
    area.addEventListener("pointercancel", up)
    return () => {
      area.removeEventListener("pointerdown", down)
      area.removeEventListener("pointermove", move)
      area.removeEventListener("pointerup", up)
      area.removeEventListener("pointercancel", up)
    }
  }, [])

  return (
    <>
      <button
        type="button"
        onClick={close}
        aria-label="Close image viewer"
        data-track-ui="Lightbox Controls"
        data-track-label="Close Button Clicked"
        className="absolute top-6 right-6 z-[250] p-3 rounded-full glass glass-dark glass-btn outline-none cursor-pointer focus-visible:ring-2 focus-visible:ring-white"
      >
        <X className="w-6 h-6" />
      </button>

      {/* The photos grow in as the lightbox opens and shrink a little as it closes.
          pinch-zoom: single-finger drags reach the swipe and carousel code */}
      <div
        ref={swipeArea}
        className="w-full h-full [touch-action:pinch-zoom] animate-in zoom-in-95 duration-300 ease-out group-data-[state=closed]:animate-out group-data-[state=closed]:zoom-out-95 group-data-[state=closed]:duration-200 motion-reduce:animate-none"
      >
      <Carousel
        setApi={setApi}
        opts={{ align: "center", loop: true, startIndex: initialIndex }}
        plugins={[WheelGesturesPlugin()]}
        className="w-full h-full"
      >
        <CarouselContent className="h-full ml-0">
          {images.map((image, i) => {
            // The start image fades in over the page's copy of the photo, which hides once the fade ends
            const preview = i === initialIndex ? placeholder : undefined
            return (
            <CarouselItem key={i} className="relative flex h-[100dvh] items-center justify-center pl-0">
              {/* Clicking the dark area around the image closes the viewer */}
              <div className="absolute inset-0" onClick={close} aria-hidden="true" />

              {requested.has(i) && !loaded.has(i) && !preview && (
                <Spinner className="absolute w-10 h-10 text-white/70 animate-spin" />
              )}

              {preview && (
                <img src={preview} alt="" aria-hidden="true" draggable={false} className={`absolute inset-0 w-full h-full object-contain pointer-events-none transition-opacity duration-0 delay-300 ${loaded.has(i) ? "opacity-0" : ""}`} />
              )}

              {requested.has(i) && (
                <img
                  src={image.src}
                  srcSet={image.srcset}
                  sizes={image.srcset ? "100vw" : undefined}
                  alt={image.alt}
                  draggable={false}
                  onLoad={() => markLoaded(i)}
                  ref={(el) => { if (el?.complete) markLoaded(i) }}
                  className={`relative max-w-full max-h-[100dvh] object-contain select-none cursor-grab active:cursor-grabbing transition-opacity duration-300 ${loaded.has(i) ? "opacity-100" : "opacity-0"}`}
                />
              )}
            </CarouselItem>
            )
          })}
        </CarouselContent>
      </Carousel>
      </div>

      {images.length > 1 && (
        <div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[250] flex items-center gap-4 px-4 py-2 rounded-full glass glass-dark select-none">
          <button
            type="button"
            onClick={() => api?.scrollPrev()}
            aria-label="Previous image"
            data-track-ui="Lightbox Controls"
            data-track-label="Lightbox Prev Arrow Clicked"
            className="p-1 hover:bg-white/20 rounded-full transition-colors outline-none cursor-pointer focus-visible:ring-2 focus-visible:ring-white"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <span className="text-sm font-bold tracking-wider px-2 tabular-nums" aria-live="polite">
            {index + 1} of {images.length}
          </span>
          <button
            type="button"
            onClick={() => api?.scrollNext()}
            aria-label="Next image"
            data-track-ui="Lightbox Controls"
            data-track-label="Lightbox Next Arrow Clicked"
            className="p-1 hover:bg-white/20 rounded-full transition-colors outline-none cursor-pointer focus-visible:ring-2 focus-visible:ring-white"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      )}
    </>
  )
}

/** The image at `i` and the one either side of it (wrapping around) */
function neighbours(i: number, total: number) {
  return new Set([i - 1, i, i + 1].map((n) => (n + total) % total))
}
