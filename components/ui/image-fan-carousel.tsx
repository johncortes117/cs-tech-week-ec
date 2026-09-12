"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

// ─────────────────────────────────────────────
// Default commemorative merchandising & sticker assets
// ─────────────────────────────────────────────

const DEFAULT_IMAGES = [
  "/images/merch-stickers.png",
  "/chapters/CS_ESPOL.png",
  "/chapters/CS_EPN.png",
  "/chapters/CS_USFQ.png",
  "/chapters/CS_UTN.png",
  "/chapters/CS_UPS_CUENCA.png",
  "/chapters/CS_UIDE.png",
  "/chapters/CS_UCACUE.png",
  "/chapters/CS_UPEC.png",
  "/chapters/CS_YACHAY.png",
  "/chapters/CS_ESPOCH.png",
  "/chapters/CS_TECH_WEEK_EC_fullcolor.png",
];

// How often the carousel auto-rotates (ms)
const AUTOPLAY_INTERVAL_MS = 2800;

// Spring physics for the ring rotation
const springTransition = {
  type: "spring",
  stiffness: 70,
  damping: 18,
  mass: 0.6,
} as const;

// Ring geometry bounds
const RADIUS_MIN = 140;
const RADIUS_MAX = 340;
const RADIUS_WIDTH_RATIO = 0.52;
const PERSPECTIVE_MULTIPLIER = 2.4;
const RING_TILT_DEG = 26; // subtle tilt angle

// Center image crossfade
const CROSSFADE_DURATION_S = 0.35;
const CROSSFADE_EASE = [0.22, 1, 0.36, 1] as const;

// Size attributes
const THUMB_SIZES_ATTR =
  "(max-width: 640px) 72px, (max-width: 768px) 96px, 120px";
const CENTER_SIZES_ATTR =
  "(max-width: 640px) 260px, (max-width: 768px) 340px, 420px";

// Nav button size
const BUTTON_SIZE_CLASSES = "w-9 h-9 sm:w-10 sm:h-10";

// Small spinner shown while an image is loading
const ImageLoader: React.FC = () => (
  <div className="absolute inset-0 flex items-center justify-center bg-black/10 dark:bg-white/5">
    <div className="w-5 h-5 rounded-full border-2 border-black/15 dark:border-white/20 border-t-primary animate-spin" />
  </div>
);

export interface Carousel360Props {
  images?: string[];
  className?: string;
}

export const Carousel360: React.FC<Carousel360Props> = ({
  images = DEFAULT_IMAGES,
  className = "",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState(0);
  const [radius, setRadius] = useState(230);
  const [loadedThumbs, setLoadedThumbs] = useState<boolean[]>(() =>
    images.map(() => false),
  );

  const numImages = images.length;
  const angleStep = 360 / numImages;

  // Calculate current center active index from rotation
  const steps = Math.round(rotation / angleStep);
  const centerIndex = ((-steps % numImages) + numImages) % numImages;
  const centerImage = images[centerIndex];

  const [prevCenterIndex, setPrevCenterIndex] = useState(centerIndex);
  const [centerLoaded, setCenterLoaded] = useState(false);
  if (centerIndex !== prevCenterIndex) {
    setPrevCenterIndex(centerIndex);
    setCenterLoaded(false);
  }

  useEffect(() => {
    const updateRadius = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.offsetWidth;
      setRadius(
        Math.max(RADIUS_MIN, Math.min(RADIUS_MAX, width * RADIUS_WIDTH_RATIO)),
      );
    };
    updateRadius();
    window.addEventListener("resize", updateRadius);
    return () => window.removeEventListener("resize", updateRadius);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation((prev) => prev + angleStep);
    }, AUTOPLAY_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [angleStep]);

  const rotateCarousel = useCallback(
    (direction: "left" | "right") => {
      setRotation(
        (prev) => prev + (direction === "left" ? -angleStep : angleStep),
      );
    },
    [angleStep],
  );

  const markThumbLoaded = useCallback((index: number) => {
    setLoadedThumbs((prev) => {
      if (prev[index]) return prev;
      const next = [...prev];
      next[index] = true;
      return next;
    });
  }, []);

  return (
    <div
      className={`relative w-full flex flex-col items-center justify-center select-none py-2 sm:py-4 ${className}`}
    >
      <div
        ref={containerRef}
        className="relative w-full max-w-4xl h-[270px] sm:h-[310px] md:h-[360px] flex items-center justify-center"
      >
        {/* 3D Cylindrical Ring with mathematically exact Z-sorting */}
        <div
          className="relative w-full h-full"
          style={{ perspective: radius * PERSPECTIVE_MULTIPLIER }}
        >
          {images.map((item, index) => {
            const targetAngle = rotation + angleStep * index;
            const rad = (targetAngle * Math.PI) / 180;
            // cosVal: +1 at the front, -1 at the back
            const cosVal = Math.cos(rad);
            // Dynamic z-index strictly derived from depth (front items ALWAYS overlap back items)
            const dynamicZIndex = Math.round((cosVal + 1) * 50) + 1;
            // Depth scaling & opacity: items in back are slightly smaller and more subtle
            const depthScale = 0.8 + 0.2 * ((cosVal + 1) / 2);
            const depthOpacity = 0.5 + 0.45 * ((cosVal + 1) / 2);

            return (
              <motion.div
                key={`${item}-${index}`}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                style={{
                  transformStyle: "preserve-3d",
                  zIndex: dynamicZIndex,
                }}
                animate={{ rotateY: targetAngle }}
                transition={springTransition}
              >
                <motion.div
                  className="relative overflow-hidden rounded-xl border border-line bg-ink-raise/95 p-1.5 sm:p-2 shadow-[0_6px_20px_rgba(0,0,0,0.4)] backdrop-blur-sm flex items-center justify-center w-fit h-fit max-w-[90px] sm:max-w-[110px] md:max-w-[130px] max-h-[64px] sm:max-h-[76px] md:max-h-[90px]"
                  style={{ transformStyle: "preserve-3d" }}
                  animate={{
                    rotateY: -targetAngle,
                    rotateX: RING_TILT_DEG,
                    z: radius,
                    scale: depthScale,
                    opacity: depthOpacity,
                  }}
                  transition={springTransition}
                >
                  {!loadedThumbs[index] && <ImageLoader />}
                  <Image
                    src={item}
                    alt={`Sticker ${index + 1}`}
                    width={130}
                    height={90}
                    sizes={THUMB_SIZES_ATTR}
                    onLoad={() => markThumbLoaded(index)}
                    className={`object-contain w-auto h-auto max-h-11 sm:max-h-13 md:max-h-16 max-w-18 sm:max-w-22 md:max-w-26 transition-opacity duration-300 ${
                      loadedThumbs[index] ? "opacity-100" : "opacity-0"
                    }`}
                  />
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        {/* Center active sticker with highest Z-index (200), perfectly layered in front */}
        <div className="absolute inset-0 flex items-center justify-center z-[200] pointer-events-none">
          <AnimatePresence mode="wait">
            <motion.div
              key={centerIndex}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{
                duration: CROSSFADE_DURATION_S,
                ease: CROSSFADE_EASE,
              }}
              className="relative w-fit h-fit max-w-[90vw] sm:max-w-[440px] max-h-[220px] sm:max-h-[260px] md:max-h-[300px] rounded-2xl overflow-hidden border border-primary/45 bg-ink-raise/95 p-3 sm:p-4 shadow-[0_12px_44px_rgba(0,0,0,0.8)] backdrop-blur-md flex items-center justify-center"
            >
              {!centerLoaded && <ImageLoader />}
              <Image
                src={centerImage}
                alt="Sticker conmemorativo destacado"
                width={420}
                height={280}
                sizes={CENTER_SIZES_ATTR}
                loading="lazy"
                onLoad={() => setCenterLoaded(true)}
                className={`object-contain w-auto h-auto max-h-[170px] sm:max-h-[210px] md:max-h-[250px] max-w-[280px] sm:max-w-[360px] md:max-w-[400px] transition-opacity duration-300 ${
                  centerLoaded ? "opacity-100" : "opacity-0"
                }`}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Directional control buttons */}
      <div className="flex items-center gap-3 mt-6 sm:mt-7 z-30">
        <button
          type="button"
          aria-label="Sticker anterior"
          onClick={() => rotateCarousel("left")}
          className={`group relative flex items-center justify-center ${BUTTON_SIZE_CLASSES} rounded-full overflow-hidden
                     border border-line bg-ink-raise/90 hover:border-primary/60 shadow-lg hover:shadow-[0_0_16px_rgba(255,163,0,0.2)]
                     transition-all duration-200 active:scale-90 cursor-pointer backdrop-blur-md`}
        >
          <span className="absolute inset-0 rounded-full bg-primary/0 group-hover:bg-primary/10 transition-colors" />
          <FaArrowLeft className="relative z-10 h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
        </button>

        <button
          type="button"
          aria-label="Siguiente sticker"
          onClick={() => rotateCarousel("right")}
          className={`group relative flex items-center justify-center ${BUTTON_SIZE_CLASSES} rounded-full overflow-hidden
                     border border-line bg-ink-raise/90 hover:border-primary/60 shadow-lg hover:shadow-[0_0_16px_rgba(255,163,0,0.2)]
                     transition-all duration-200 active:scale-90 cursor-pointer backdrop-blur-md`}
        >
          <span className="absolute inset-0 rounded-full bg-primary/0 group-hover:bg-primary/10 transition-colors" />
          <FaArrowRight className="relative z-10 h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
        </button>
      </div>
    </div>
  );
};

export default Carousel360;
