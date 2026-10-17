
"use client";

import type { ReactNode } from "react";
import { motion, useTransform, type MotionValue } from "motion/react";
import ProfilePhoto from "../about/ProfilePhoto";
import AboutTerminal from "../about/AboutTerminal";
import {
  ABOUT_GOAL,
  ABOUT_INTRO,
  ABOUT_LEARNING,
  INTERESTS,
} from "../../app/about/aboutCopy";
import { seg } from "./scrollMath";

type RevealProps = {
  /** Scroll progress of the Hero-to-About transition (0 to 1). */
  progress: MotionValue<number>;
  /** True when the pinned, scroll-driven transition is running; otherwise the item reveals when it enters the view. */
  scrollDriven: boolean;
  /** Part of the transition (0 to 1) during which this item fades and slides in. */
  range: readonly [number, number];
  from?: "up" | "left";
  /** False for reduced motion: the item only fades, it does not slide. */
  translate: boolean;
  className?: string;
  children: ReactNode;
};

/**
 * One piece of About content. In the scroll-driven transition its opacity and offset
 * are pure functions of scroll progress, so scrolling back up reverses it exactly.
 */
function Reveal({
  progress,
  scrollDriven,
  range,
  from = "up",
  translate,
  className,
  children,
}: RevealProps) {
  const t = useTransform(progress, (v) => seg(v, range[0], range[1]));
  const x = useTransform(t, (v) =>
    translate && from === "left" ? (1 - v) * -40 : 0
  );
  const y = useTransform(t, (v) =>
    translate && from === "up" ? (1 - v) * 28 : 0
  );

  if (!scrollDriven) {
    return (
      <motion.div
        key="in-view"
        initial={{ opacity: 0, y: translate ? 24 : 0 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-8% 0px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={className}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      key="scroll-driven"
      style={{ opacity: t, x, y }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

type AboutIntroProps = {
  progress: MotionValue<number>;
  scrollDriven: boolean;
  translate: boolean;
};

/** The first screen of About: photo, heading, introduction and interests. */
export function AboutIntro({
  progress,
  scrollDriven,
  translate,
}: AboutIntroProps) {
  const common = { progress, scrollDriven, translate } as const;

  return (
    <section
      aria-labelledby="about-heading"
      className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-10 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] md:gap-14 lg:gap-20"
    >
      <Reveal
        {...common}
        range={[0.64, 0.9]}
        from="left"
        className="mx-auto w-full max-w-xs md:mx-0"
      >
        <ProfilePhoto
          sizes="(min-width: 768px) 30vw, 80vw"
          className="rounded-none"
          style={{ maxHeight: "62dvh" }}
        />
      </Reveal>

      <div className="flex flex-col items-start">
        <Reveal {...common} range={[0.68, 0.92]}>
          <h2
            id="about-heading"
            className="mt-3 text-[18rm] font-bold leading-tight tracking-tight sm:text-5xl"
          >
            <span
              className="text-transparent"
              style={{ WebkitTextStroke: "1.5px #F2F0F7" }}
            >
              SANJEEV
            </span>{" "}
            <span className="text-[#B8A0FF]">KAUSHIK</span>
          </h2>
        </Reveal>

        <Reveal
          {...common}
          range={[0.72, 0.95]}
          className="mt-5 max-w-[62ch] space-y-4 text-base leading-relaxed text-[#A6A0B5]"
        >
          {ABOUT_INTRO.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </Reveal>

        <Reveal {...common} range={[0.76, 0.98]} className="mt-5">
          <ul aria-label="Interests" className="flex flex-wrap gap-2">
            {INTERESTS.map((interest) => (
              <li
                key={interest}
                className="rounded-full border border-[#343044] bg-[#1B1926] px-3.5 py-1.5 text-sm text-[#F2F0F7]"
              >
                {interest}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}

/** The rest of About, after the pinned transition, in normal page flow. */
export function AboutDetails() {
  const reveal = {
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-8% 0px" },
    transition: { duration: 0.6, ease: "easeOut" as const },
  };




  return (
    <section
      id="about"
      aria-label="About me"
      className="bg-[#100F17] px-6 py-16 sm:px-10 lg:py-24"
    >
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-10 md:grid-cols-[0.8fr_1.2fr] md:gap-12 lg:gap-16">
        {/* Left: Avatar */}
        <div className="mx-auto w-full max-w-[360px] md:max-w-none">
          <ProfilePhoto sizes="(min-width: 768px) 35vw, 85vw" />
        </div>

        {/* Right: Interactive terminal */}
        <div className="min-w-0 w-full">
          <AboutTerminal />
        </div>
      </div>
    </section>
  );

}

