"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { MotionConfig, motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { FiArrowUpRight } from "react-icons/fi";
import AboutBackdrop from "../about/AboutBackdrop";
import { AboutDetails, AboutIntro } from "./AboutScene";
import { seg } from "./scrollMath";

const LaptopModel = dynamic(() => import("./LaptopModel"), {
  ssr: false,
  loading: () => <WorkspaceIllustration />,
});

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#B8A0FF]";

const enter = (delay: number, scale = 1) => ({
  initial: {
    opacity: 0,
    y: scale === 1 ? 20 : 0,
    scale: scale === 1 ? 1 : scale,
  },
  animate: { opacity: 1, y: 0, scale: 1 },
  transition: {
    duration: 0.7,
    delay,
    ease: "easeOut" as const,
  },
});

/** How far the left and right columns slide toward the centre during the transition (viewport width %). */
const SIDE_SHIFT_VW = 6;

/** Re-renders only when the media query flips (for example when the window is resized), never on scroll. */
function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false, // the server (and the first client render) assume "not desktop", so hydration always matches
  );
}

/**
 * Stand-in shown while the 3D laptop loads, and if it fails to load.
 * Pure inline SVG with a transparent background.
 */
function WorkspaceIllustration() {
  return (
    <svg
      viewBox="0 0 420 340"
      role="img"
      aria-label="Abstract illustration of a laptop surrounded by code symbols"
      className="h-auto w-full"
    >
      <defs>
        <linearGradient id="screen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#B8A0FF" stopOpacity="0.28" />
          <stop offset="1" stopColor="#B8A0FF" stopOpacity="0.04" />
        </linearGradient>

        <linearGradient id="base" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2A2639" />
          <stop offset="1" stopColor="#1B1926" />
        </linearGradient>

        <radialGradient id="floor" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#B8A0FF" stopOpacity="0.22" />
          <stop offset="1" stopColor="#B8A0FF" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Orbital accents */}
      <ellipse
        cx="210"
        cy="170"
        rx="190"
        ry="62"
        transform="rotate(-14 210 170)"
        fill="none"
        stroke="#B8A0FF"
        strokeOpacity="0.16"
        strokeWidth="1"
      />

      <ellipse
        cx="210"
        cy="170"
        rx="150"
        ry="46"
        transform="rotate(12 210 170)"
        fill="none"
        stroke="#A6A0B5"
        strokeOpacity="0.1"
        strokeWidth="1"
        strokeDasharray="2 7"
      />

      {/* Soft contact light under the laptop */}
      <ellipse cx="210" cy="288" rx="130" ry="16" fill="url(#floor)" />

      {/* Screen */}
      <path
        d="M118 70 L302 70 L312 214 L108 214 Z"
        fill="url(#screen)"
        stroke="#B8A0FF"
        strokeOpacity="0.55"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />

      {/* Code lines on screen */}
      <g stroke="#F2F0F7" strokeLinecap="round" strokeWidth="3">
        <line x1="138" y1="102" x2="186" y2="102" strokeOpacity="0.55" />
        <line x1="150" y1="122" x2="228" y2="122" strokeOpacity="0.32" />
        <line x1="150" y1="142" x2="204" y2="142" strokeOpacity="0.32" />
        <line x1="162" y1="162" x2="250" y2="162" strokeOpacity="0.22" />
        <line x1="138" y1="182" x2="172" y2="182" strokeOpacity="0.4" />
      </g>

      <rect
        x="236"
        y="96"
        width="30"
        height="6"
        rx="3"
        fill="#B8A0FF"
        fillOpacity="0.7"
      />

      {/* Base */}
      <path
        d="M96 222 L324 222 L344 252 L76 252 Z"
        fill="url(#base)"
        stroke="#B8A0FF"
        strokeOpacity="0.3"
        strokeWidth="1"
        strokeLinejoin="round"
      />

      <path
        d="M178 238 L242 238"
        stroke="#A6A0B5"
        strokeOpacity="0.35"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Floating code symbols */}
      <g
        fill="#B8A0FF"
        fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
        fontWeight="500"
      >
        <text x="40" y="96" fontSize="22" fillOpacity="0.75">
          {"</>"}
        </text>

        <text x="338" y="70" fontSize="24" fillOpacity="0.6">
          {"{ }"}
        </text>

        <text x="352" y="196" fontSize="18" fillOpacity="0.5">
          {">_"}
        </text>

        <text x="26" y="206" fontSize="18" fillOpacity="0.4">
          {"#!"}
        </text>
      </g>

      {/* Particles */}
      <g fill="#F2F0F7">
        <circle cx="84" cy="48" r="1.8" fillOpacity="0.6" />
        <circle cx="206" cy="30" r="1.4" fillOpacity="0.4" />
        <circle cx="300" cy="36" r="2" fillOpacity="0.55" />
        <circle cx="392" cy="124" r="1.6" fillOpacity="0.4" />
        <circle cx="18" cy="148" r="1.5" fillOpacity="0.4" />
        <circle cx="380" cy="262" r="1.8" fillOpacity="0.45" />
        <circle cx="52" cy="270" r="2" fillOpacity="0.5" />
      </g>
    </svg>
  );
}

export default function Hero() {
  const containerRef = useRef<HTMLElement>(null);
  const heroLayerRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion() ?? false;
  const desktop = useMediaQuery("(min-width: 1024px)");
  /** 1 normally, 0 for reduced motion: the transition then only cross-fades and nothing slides or scales. */
  const m = reduced ? 0 : 1;

  // Desktop: progress through the pinned Hero-to-About stage (0 = Hero, 1 = About fully revealed).
  const { scrollYProgress: p } = useScroll({ target: containerRef, offset: ["start start", "end end"] });
  // Phones: progress of the Hero scrolling out of view (only used for the laptop's gentle turn).
  const { scrollYProgress: heroExit } = useScroll({ target: heroLayerRef, offset: ["start start", "end start"] });

  // Every value below is a pure function of the scroll position, evaluated by Motion outside React:
  // scrolling down plays the transition, scrolling up plays it backwards, and no React state changes per frame.
  // Hero side columns glide toward the centre and fade out.
  const sideOpacity = useTransform(p, (v) => 1 - seg(v, 0, 0.3));
  const leftX = useTransform(p, (v) => `${seg(v, 0, 0.3) * SIDE_SHIFT_VW * m}vw`);
  const rightX = useTransform(p, (v) => `${-seg(v, 0, 0.3) * SIDE_SHIFT_VW * m}vw`);
  const sideScale = useTransform(p, (v) => 1 - 0.08 * seg(v, 0, 0.3) * m);
  // The laptop becomes the focus, then recedes (its 3D turn and camera pull-back happen inside the scene).
  const laptopScale = useTransform(p, (v) => 1 + 0.12 * seg(v, 0, 0.4) * m);
  const laptopY = useTransform(p, (v) => -48 * seg(v, 0.4, 0.8) * m);
  const laptopOpacity = useTransform(p, (v) => 1 - seg(v, 0.42, 0.72));
  const laptopPointer = useTransform(p, (v) => (v < 0.25 ? "auto" : "none"));
  // Lighting: the Hero's glow gives way to the About scene's glow.
  const heroGlow = useTransform(p, (v) => 1 - seg(v, 0.3, 0.7));
  const aboutGlow = useTransform(p, (v) => seg(v, 0.5, 0.9));
  // The About layer rises into view; the Hero layer is switched off once it has faded (no clicks, no focus).
  // The layer itself is already opaque by 0.6, so the glow (0.5 to 0.9) leads and brightens before any text;
  // each piece of text then fades in on its own range (see AboutScene), so the layer does not slide as well.
  const aboutOpacity = useTransform(p, (v) => seg(v, 0.45, 0.6));
  const aboutVisibility = useTransform(p, (v) => (v > 0.04 ? "visible" : "hidden"));
  const heroVisibility = useTransform(p, (v) => (v < 0.75 ? "visible" : "hidden"));
  const heroPointer = useTransform(p, (v) => (v < 0.25 ? "auto" : "none"));

  // A link to #about (for example from the navbar) should land where the About scene is fully revealed.
  useEffect(() => {
    if (window.location.hash !== "#about") return;
    const frame = requestAnimationFrame(() => document.getElementById("about")?.scrollIntoView({ block: "start" }));
    return () => cancelAnimationFrame(frame);
  }, [desktop]);

  const scrollLevel = reduced ? "off" : desktop ? "full" : "light";

  return (
    <MotionConfig reducedMotion="user">
      {/*
        Desktop (lg and up, 1024px+): a tall section holds a sticky, viewport-high stage. Scrolling through the extra
        200dvh plays the Hero-to-About transition, then the stage scrolls away and the page carries on normally.
        Phones and tablets: no pinning at all. Hero and About simply stack and scroll like any other sections.
      */}
      <section ref={containerRef} id="home" className="relative bg-[#100F17] lg:h-[300dvh]">
        {desktop && <span id="about" aria-hidden="true" className="pointer-events-none absolute left-0 top-[200dvh] size-px" />}

        <div className="lg:sticky lg:top-0 lg:h-dvh lg:overflow-hidden">
          {/* Scene 1: Hero */}
          <motion.div
            ref={heroLayerRef}
            style={desktop ? { visibility: heroVisibility, pointerEvents: heroPointer } : undefined}
            className="relative flex min-h-dvh items-center overflow-x-clip pb-16 pt-28 sm:pt-32 lg:absolute lg:inset-0"
          >
            {/*
              Desktop grid: narrow text columns (0.85fr) around a wide centre (1.5fr),
              so the laptop gets about 47% of the row instead of 38%.
            */}
            <div className="relative mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 px-6 sm:px-10 md:grid-cols-2 md:gap-x-10 md:gap-y-4 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.5fr)_minmax(0,0.85fr)] lg:gap-x-6 xl:max-w-[92rem] xl:gap-x-8">

              {/* Left: identity */}
              <motion.div {...enter(0.05)} className="order-1">
                <motion.div
                  style={desktop ? { x: leftX, opacity: sideOpacity, scale: sideScale } : undefined}
                  className="flex flex-col items-start"
                >
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#B8A0FF]">
                    Hello, I&apos;m
                  </p>

                  <h1 className="mt-3 text-4xl font-semibold leading-[1.02] tracking-tight text-[#F2F0F7] sm:text-5xl">
                    <span className="block text-purple-600">Sanjeev</span>
                    <span className="block">Kaushik</span>
                  </h1>

                  <p className="mt-3 text-base font-medium text-purple-500 font-semibold sm:text-lg">
                    Developer focused on Python, backend &amp; cybersecurity
                  </p>

                  <p className="mt-3 max-w-[32ch] text-sm leading-relaxed text-[#A6A0B5] sm:text-base">
                    I learn by building. Currently exploring safe code execution,
                    networking labs, and practical full-stack tools.
                  </p>

                  <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
                    <a
                      href="#projects"
                      className={`inline-flex items-center justify-center rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-semibold text-[#100F17] transition-transform duration-200 hover:-translate-y-0.5 ${focusRing}`}
                    >
                      Explore My Work
                    </a>

                    <a
                      href="#about"
                      className={`group inline-flex items-center gap-1 rounded text-sm font-medium text-[#A6A0B5] transition-colors duration-200 hover:text-[#F2F0F7] ${focusRing}`}
                    >
                      More About Me
                      <FiArrowUpRight
                        aria-hidden="true"
                        className="size-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      />
                    </a>
                  </div>
                </motion.div>
              </motion.div>

              {/* Center: 3D laptop */}
              <motion.div
                {...enter(0.2, 0.94)}
                className="relative order-2 mx-auto w-full max-w-[34rem] md:order-3 md:col-span-2 md:max-w-2xl lg:order-2 lg:col-span-1 lg:max-w-none"
              >
                <motion.div
                  aria-hidden="true"
                  style={desktop ? { opacity: heroGlow } : undefined}
                  className="pointer-events-none absolute left-1/2 top-1/2 size-[140%] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(closest-side,rgba(184,160,255,0.16),rgba(184,160,255,0.05)_55%,transparent)]"
                />

                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{
                    duration: 7,
                    ease: "easeInOut",
                    repeat: Infinity,
                  }}
                  whileHover={{ scale: 1.015 }}
                  className="relative"
                >
                  <motion.div
                    style={
                      desktop
                        ? { scale: laptopScale, y: laptopY, opacity: laptopOpacity, pointerEvents: laptopPointer }
                        : undefined
                    }
                  >
                    <LaptopModel
                      fallback={<WorkspaceIllustration />}
                      scroll={desktop ? p : heroExit}
                      scrollLevel={scrollLevel}
                    />
                  </motion.div>
                </motion.div>
              </motion.div>

              {/* Right: about */}
              <motion.div {...enter(0.35)} className="order-3 md:order-2 lg:order-3">
                <motion.div
                  style={desktop ? { x: rightX, opacity: sideOpacity, scale: sideScale } : undefined}
                  className="flex flex-col items-start"
                >
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#A6A0B5]">
                    A little about me
                  </p>

                  <h2 className="mt-3 text-2xl font-semibold leading-tight tracking-tight text-purple-400 sm:text-3xl">
                    Curious by nature.
                  </h2>

                  <p className="mt-3 max-w-[34ch] text-sm leading-relaxed text-[#A6A0B5] sm:text-base">
                    I enjoy solving{" "}
                    <span className="text-[#B8A0FF]">logical problems</span>, building{" "}
                    <span className="text-[#B8A0FF]">practical software</span>, and understanding
                    what happens <span className="text-[#B8A0FF]">beneath the surface</span>.
                  </p>

                  <p className="mt-3 max-w-[34ch] text-sm leading-relaxed text-[#A6A0B5] sm:text-base">
                    Currently learning by{" "}
                    <span className="text-[#B8A0FF]">building projects</span> and exploring{" "}
                    <span className="text-[#B8A0FF]">cybersecurity</span>.
                  </p>

                  <a
                    href="#about"
                    className={`group mt-5 inline-flex items-center gap-1  text-sm font-medium text-[#B8A0FF] bg-purple-600 p-3 rounded-2xl transition-colors duration-200 hover:text-[#F2F0F7] ${focusRing}`}
                  >
                    Discover my journey
                    <FiArrowUpRight
                      aria-hidden="true"
                      className="size-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                  </a>
                </motion.div>
              </motion.div>


            </div>
          </motion.div>

          {/* Scene 3: About Me (first screen). Hidden at the start; revealed by the scroll on desktop. */}
          <motion.div
            id={desktop ? undefined : "about"}
            style={desktop ? { opacity: aboutOpacity, visibility: aboutVisibility } : undefined}
            className="relative px-6 py-20 sm:px-10 lg:pointer-events-none lg:absolute lg:inset-0 lg:flex lg:items-center lg:py-0 lg:pt-20 lg:opacity-0"
          >
            <motion.div
              aria-hidden="true"
              style={desktop ? { opacity: aboutGlow } : undefined}
              className="pointer-events-none absolute inset-0"
            >
              <AboutBackdrop />
            </motion.div>
            <div className="relative w-full">
              <AboutIntro progress={p} scrollDriven={desktop} translate={!reduced} />
            </div>
          </motion.div>
        </div>
      </section>

      {/* The rest of About, in normal page flow: once the transition ends, scrolling simply continues. */}
      <AboutDetails />
    </MotionConfig>
  );
}