"use client";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { CloudinaryResource } from "../types/responseCloudinary";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface visualizerContext {
  visualizerImage: (currentImage: CloudinaryResource) => void;
  updateImagesToVisualizer: (images: CloudinaryResource[]) => void;
}

const VisualizerContext = createContext<visualizerContext | undefined>(
  undefined
);

export function VisualizerProvider({ children }: { children: ReactNode }) {
  const [openDialog, SetOpenDialog] = useState<boolean>(false);
  const [imagesView, SetImagesView] = useState<CloudinaryResource[]>([]);

  const [currentIndex, setCurrentIndex] = useState<number | null>(null);

  // API del carrusel (Embla)
  const apiRef = useRef<CarouselApi | null>(null);
  const setApi = (api: CarouselApi) => {
    apiRef.current = api;
    // Sync hacia React cuando el carrusel cambie
    if (api) {
      api.on("select", () => {
        const idx = api.selectedScrollSnap();
        setCurrentIndex(idx);
      });
    }
  };

  useEffect(() => {
    if (!openDialog || currentIndex == null || !apiRef.current) return;

    // Asegurar que el carrusel esté listo antes del scroll
    const scrollToIndex = () => {
      if (apiRef.current) {
        apiRef.current.scrollTo(currentIndex);
      }
    };

    // Intentar inmediatamente y con un pequeño delay como respaldo
    scrollToIndex();
    const timeoutId = setTimeout(scrollToIndex, 50);

    return () => clearTimeout(timeoutId);
  }, [openDialog, currentIndex]);

  const total = imagesView.length;

  const updateImagesToVisualizer = (images: CloudinaryResource[]) => {
    SetImagesView(images);
  };

  const visualizerImage = useCallback(
    (currentImage: CloudinaryResource) => {
      if (!imagesView.length) return;

      const indexCurrentImage = imagesView.findIndex(
        (img) => img.asset_id === currentImage.asset_id
      );
      const nextIndex = indexCurrentImage >= 0 ? indexCurrentImage : 0;
      setCurrentIndex(nextIndex);
      SetOpenDialog(true);
    },
    [imagesView]
  );
  const next = useCallback(() => {
    if (!apiRef.current) return;
    apiRef.current.scrollNext();
  }, []);

  const prev = useCallback(() => {
    if (!apiRef.current) return;
    apiRef.current.scrollPrev();
  }, []);

  useEffect(() => {
    if (!openDialog) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
      // if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openDialog, next, prev]);

  return (
    <VisualizerContext.Provider
      value={{ visualizerImage, updateImagesToVisualizer }}
    >
      <Dialog open={openDialog} modal={true} onOpenChange={SetOpenDialog}>
        <VisuallyHidden>
          <DialogTitle>Title</DialogTitle>
        </VisuallyHidden>
        <DialogContent
          aria-describedby="dialogVisualizerImg"
          className="h-screen w-screen max-w-screen overflow-hidden sm:max-w-full flex flex-col p-0 "
        >
          <div className="flex-1 flex items-center justify-center">
            <Carousel
              className="relative w-full h-full"
              opts={{ loop: true, startIndex: currentIndex || 0 }}
              setApi={setApi}
            >
              <CarouselContent className="h-full">
                {imagesView.map((image, index) => (
                  <CarouselItem
                    key={"carousel-" + index}
                    className="flex items-center justify-center h-full"
                  >
                    <img
                      src={image.secure_url}
                      alt={image.display_name}
                      className="h-screen w-auto object-contain"
                      loading="lazy"
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
              {/* <CarouselPrevious /> */}
              {/* <CarouselNext /> */}
              {/* Flecha Izquierda */}
              {imagesView.length > 1 && (
                <button
                  type="button"
                  onClick={prev}
                  aria-label="Imagen anterior"
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-50
                 inline-flex items-center justify-center h-10 w-10
                 rounded-full bg-black/60 hover:bg-black/75
                 text-white shadow focus:outline-none focus:ring-2 focus:ring-white/60 cursor-pointer"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              )}

              {/* Flecha Derecha */}
              {imagesView.length > 1 && (
                <button
                  type="button"
                  onClick={next}
                  aria-label="Imagen siguiente"
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-50
                 inline-flex items-center justify-center h-10 w-10
                 rounded-full bg-black/60 hover:bg-black/75
                 text-white shadow focus:outline-none focus:ring-2 focus:ring-white/60 cursor-pointer"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              )}
            </Carousel>
          </div>
        </DialogContent>
      </Dialog>
      {children}
    </VisualizerContext.Provider>
  );
}

export function useVisualizerContext() {
  const context = useContext(VisualizerContext);
  if (!context)
    throw new Error(
      "visualizaer context must be used within VisualizerProvider"
    );
  return context;
}
