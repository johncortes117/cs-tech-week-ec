"use client";

import { motion, useSpring } from "framer-motion";
import React, {
  useState,
  useRef,
  useEffect,
  createContext,
  useContext,
} from "react";
import confetti from "canvas-confetti";
import Link from "next/link";
import { Check, Star as LucideStar, ShieldCheck, Ticket } from "lucide-react";
import NumberFlow from "@number-flow/react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { pricingCombos, priceNote, event } from "@/lib/content";

// --- UTILITY FUNCTIONS ---

function cnLocal(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function useMediaQuery(query: string) {
  const [value, setValue] = useState(false);

  useEffect(() => {
    function onChange(event: MediaQueryListEvent) {
      setValue(event.matches);
    }

    const result = matchMedia(query);
    result.addEventListener("change", onChange);
    setValue(result.matches);

    return () => result.removeEventListener("change", onChange);
  }, [query]);

  return value;
}

// --- BASE UI COMPONENTS (BUTTON) ---

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-[6px] text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[0_0_24px_rgba(255,163,0,0.3)] hover:bg-[#FFB733] hover:shadow-[0_0_32px_rgba(255,163,0,0.5)]",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-line bg-ink-raise text-foreground hover:border-primary/50 hover:bg-ink-plate",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "border border-line bg-ink text-muted-foreground hover:border-line-strong hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cnLocal(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

// --- INTERACTIVE STARFIELD ---

function Star({
  mousePosition,
  containerRef,
}: {
  mousePosition: { x: number | null; y: number | null };
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const [initialPos] = useState({
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
  });

  const springConfig = { stiffness: 100, damping: 15, mass: 0.1 };
  const springX = useSpring(0, springConfig);
  const springY = useSpring(0, springConfig);

  useEffect(() => {
    if (
      !containerRef.current ||
      mousePosition.x === null ||
      mousePosition.y === null
    ) {
      springX.set(0);
      springY.set(0);
      return;
    }

    const containerRect = containerRef.current.getBoundingClientRect();
    const starX =
      containerRect.left +
      (parseFloat(initialPos.left) / 100) * containerRect.width;
    const starY =
      containerRect.top +
      (parseFloat(initialPos.top) / 100) * containerRect.height;

    const deltaX = mousePosition.x - starX;
    const deltaY = mousePosition.y - starY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    const radius = 500; // Radius of magnetic influence

    if (distance < radius) {
      const force = 1 - distance / radius;
      const pullX = deltaX * force * 0.45;
      const pullY = deltaY * force * 0.45;
      springX.set(pullX);
      springY.set(pullY);
    } else {
      springX.set(0);
      springY.set(0);
    }
  }, [mousePosition, initialPos, containerRef, springX, springY]);

  return (
    <motion.div
      className="absolute bg-primary/70 rounded-full pointer-events-none"
      style={{
        top: initialPos.top,
        left: initialPos.left,
        width: `${1.2 + Math.random() * 2}px`,
        height: `${1.2 + Math.random() * 2}px`,
        x: springX,
        y: springY,
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 0.85, 0] }}
      transition={{
        duration: 2.5 + Math.random() * 3.5,
        repeat: Infinity,
        delay: Math.random() * 4,
      }}
    />
  );
}

function InteractiveStarfield({
  mousePosition,
  containerRef,
}: {
  mousePosition: { x: number | null; y: number | null };
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
      {Array.from({ length: 90 }).map((_, i) => (
        <Star
          key={`star-${i}`}
          mousePosition={mousePosition}
          containerRef={containerRef}
        />
      ))}
    </div>
  );
}

// --- PRICING COMPONENT LOGIC ---

export interface PricingPlan {
  name: string;
  price: string | number;
  yearlyPrice: string | number;
  period: string;
  features: string[];
  description: string;
  buttonText: string;
  href: string;
  isPopular?: boolean;
  badge?: string;
}

interface PricingSectionProps {
  plans?: PricingPlan[];
  title?: string;
  description?: string;
  className?: string;
}

// Default event combos mapped to PricingPlans
const DEFAULT_EVENT_PLANS: PricingPlan[] = pricingCombos.map((combo) => ({
  name: combo.name,
  price: combo.price.member,
  yearlyPrice: combo.price.general,
  period: "acceso total",
  features: combo.features,
  description: combo.tagline,
  buttonText: combo.cta,
  href: event.registerUrl,
  isPopular: combo.popular,
  badge: combo.badge,
}));

// Context for state management: isMember (IEEE) vs General
const PricingContext = createContext<{
  isMember: boolean;
  setIsMember: (value: boolean) => void;
}>({
  isMember: true,
  setIsMember: () => { },
});

// Pricing Toggle Component with IEEE vs General discount & Confetti
function PricingToggle() {
  const { isMember, setIsMember } = useContext(PricingContext);
  const confettiRef = useRef<HTMLDivElement>(null);
  const memberBtnRef = useRef<HTMLButtonElement>(null);
  const generalBtnRef = useRef<HTMLButtonElement>(null);

  const [pillStyle, setPillStyle] = useState<{ width?: number; transform?: string }>({});

  useEffect(() => {
    const btnRef = isMember ? memberBtnRef : generalBtnRef;
    if (btnRef.current) {
      setPillStyle({
        width: btnRef.current.offsetWidth,
        transform: `translateX(${btnRef.current.offsetLeft}px)`,
      });
    }
  }, [isMember]);

  const handleToggle = (member: boolean) => {
    if (isMember === member) return;
    setIsMember(member);

    if (member && confettiRef.current) {
      const rect = memberBtnRef.current?.getBoundingClientRect();
      if (!rect) return;

      const originX = (rect.left + rect.width / 2) / window.innerWidth;
      const originY = (rect.top + rect.height / 2) / window.innerHeight;

      confetti({
        particleCount: 75,
        spread: 70,
        origin: { x: originX, y: originY },
        colors: [
          "#FFA300",
          "#00B5E2",
          "#981D97",
          "#FFFFFF",
        ],
        ticks: 280,
        gravity: 1.1,
        decay: 0.94,
        startVelocity: 28,
      });
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        ref={confettiRef}
        className="relative flex w-fit items-center rounded-pill border border-line bg-ink-raise/90 p-1 backdrop-blur-md"
      >
        <motion.div
          className="absolute left-0 top-0 h-full rounded-pill bg-primary p-1 shadow-[0_0_16px_rgba(255,163,0,0.35)]"
          style={pillStyle}
          transition={{ type: "spring", stiffness: 500, damping: 40 }}
        />
        <button
          ref={memberBtnRef}
          type="button"
          onClick={() => handleToggle(true)}
          className={cnLocal(
            "relative z-10 rounded-pill px-4 sm:px-6 py-2 font-display text-[13px] font-bold transition-colors cursor-pointer",
            isMember
              ? "text-primary-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          Miembros IEEE CS
          <span
            className={cnLocal(
              "ml-1.5 rounded-pill px-1.5 py-0.5 font-mono text-[9px] font-extrabold uppercase",
              isMember
                ? "bg-ink/20 text-ink"
                : "bg-primary/15 text-primary",
            )}
          >
            Tarifa Especial
          </span>
        </button>
        <button
          ref={generalBtnRef}
          type="button"
          onClick={() => handleToggle(false)}
          className={cnLocal(
            "relative z-10 rounded-pill px-4 sm:px-6 py-2 font-display text-[13px] font-bold transition-colors cursor-pointer",
            !isMember
              ? "text-primary-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          Público General
        </button>
      </div>
      <p className="font-mono text-[10px] uppercase tracking-label text-subtle">
        {isMember
          ? "Mostrando tarifa preferencial para miembros de IEEE / Computer Society"
          : "Mostrando tarifa estándar para estudiantes y profesionales no miembros"}
      </p>
    </div>
  );
}

// Pricing Card Component
function PricingCard({ plan, index }: { plan: PricingPlan; index: number }) {
  const { isMember } = useContext(PricingContext);
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const currentPrice = isMember ? Number(plan.price) : Number(plan.yearlyPrice);

  return (
    <motion.div
      initial={{ y: 40, opacity: 0 }}
      whileInView={{
        y: plan.isPopular && isDesktop ? -12 : 0,
        opacity: 1,
      }}
      viewport={{ once: true }}
      transition={{
        duration: 0.6,
        type: "spring",
        stiffness: 100,
        damping: 20,
        delay: index * 0.1,
      }}
      className={cnLocal(
        "rounded-2xl p-6 sm:p-7 flex flex-col relative bg-ink/80 backdrop-blur-md transition-all duration-300",
        plan.isPopular
          ? "border-2 border-primary shadow-[0_0_36px_rgba(255,163,0,0.18)] bg-ink-raise"
          : "border border-line hover:border-line-strong hover:bg-ink-raise/50",
      )}
    >
      {plan.isPopular && (
        <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2">
          <div className="bg-primary py-1 px-4 rounded-pill flex items-center gap-1.5 shadow-lg">
            <LucideStar className="text-ink h-3.5 w-3.5 fill-current" />
            <span className="text-ink text-[11px] font-bold uppercase tracking-wider font-mono">
              {plan.badge || "Recomendado"}
            </span>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col text-left">
        <div className="flex items-baseline justify-between gap-2">
          <h3
            className={cnLocal(
              "text-lg font-bold font-display tracking-tight",
              plan.isPopular ? "text-primary" : "text-foreground"
            )}
          >
            {plan.name}
          </h3>
          <span className="font-mono text-[10px] uppercase tracking-label text-subtle">
            Opción 0{index + 1}
          </span>
        </div>

        <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-muted-foreground">
          {plan.description}
        </p>

        <div className="mt-6 flex items-baseline gap-x-1.5 border-y border-line/60 py-4">
          <span className="text-4xl sm:text-5xl font-black font-display tracking-tight text-foreground">
            <NumberFlow
              value={currentPrice}
              format={{
                style: "currency",
                currency: "USD",
                minimumFractionDigits: 0,
              }}
              className="tabular-nums"
            />
          </span>
          <span className="text-[12px] font-medium tracking-wide text-subtle font-mono">
            / {isMember ? "Miembro IEEE" : "General"}
          </span>
        </div>

        <ul
          role="list"
          className="mt-6 space-y-2.5 text-[0.8125rem] leading-relaxed text-muted-foreground"
        >
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2.5">
              <Check
                className={cnLocal(
                  "mt-0.5 h-3.5 w-3.5 flex-none",
                  plan.isPopular ? "text-primary" : "text-cyan"
                )}
                aria-hidden="true"
              />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        <div className="mt-auto pt-8">
          <Link
            href={plan.href}
            className={cnLocal(
              buttonVariants({
                variant: plan.isPopular ? "default" : "outline",
                size: "lg",
              }),
              "w-full text-center",
            )}
          >
            {plan.buttonText}
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

// Main PricingSection Component
export function PricingSection({
  plans = DEFAULT_EVENT_PLANS,
  title = "Charlas gratis y concursos",
  description = "Regístrate gratis para las charlas o elige tu inscripción a los concursos",
  className = "",
}: PricingSectionProps) {
  const [isMember, setIsMember] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState<{
    x: number | null;
    y: number | null;
  }>({ x: null, y: null });

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY } = event;
    setMousePosition({ x: clientX, y: clientY });
  };

  return (
    <PricingContext.Provider value={{ isMember, setIsMember }}>
      <section
        id="precios"
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setMousePosition({ x: null, y: null })}
        className={cnLocal(
          "relative isolate w-full scroll-mt-24 py-24 md:py-32 overflow-hidden",
          className
        )}
      >
        <InteractiveStarfield
          mousePosition={mousePosition}
          containerRef={containerRef}
        />

        <div className="relative z-10 shell">
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-10">
            <span className="inline-flex items-center gap-2.5">
              <span className="h-px w-6 bg-primary" />
              <span className="label text-primary">Inscripciones & Entradas</span>
              <span className="h-px w-6 bg-primary" />
            </span>
            <h2 className="font-display text-[clamp(1.9rem,4.4vw,3.1rem)] font-extrabold leading-[1.05] tracking-head text-foreground">
              {title}
            </h2>
            <p className="text-muted-foreground text-[1.0625rem] leading-relaxed max-w-[58ch] mx-auto">
              {description}
            </p>
          </div>

          <PricingToggle />

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 items-stretch gap-5">
            {plans.map((plan, index) => (
              <PricingCard key={plan.name} plan={plan} index={index} />
            ))}
          </div>

          {/* Info guarantee badges */}
          <div className="mt-12 grid gap-4 md:grid-cols-2">
            <div className="flex items-start gap-3.5 rounded-card border border-line bg-ink-raise/80 p-5 text-[0.875rem] text-muted-foreground backdrop-blur-sm">
              <Ticket className="mt-0.5 h-5 w-5 flex-none text-primary" />
              <div>
                <strong className="text-foreground">Charlas gratuitas: </strong>
                {priceNote}
              </div>
            </div>

            <div className="flex items-start gap-3.5 rounded-card border border-line bg-ink-raise/80 p-5 text-[0.875rem] text-muted-foreground backdrop-blur-sm">
              <ShieldCheck className="mt-0.5 h-5 w-5 flex-none text-cyan" />
              <div>
                <strong className="text-foreground">Certificación Digital Oficial: </strong>
                Todas las entradas incluyen certificado avalado por horas académicas y de competencia, respaldado por IEEE Computer Society Ecuador.
              </div>
            </div>
          </div>
        </div>
      </section>
    </PricingContext.Provider>
  );
}

export default PricingSection;
