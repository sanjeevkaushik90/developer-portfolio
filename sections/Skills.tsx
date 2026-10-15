"use client";

import { useRef, useState } from "react";
import { AnimatePresence, MotionConfig, motion, useInView, type Variants } from "motion/react";
import SkillCard from "../components/skills/SkillCard";
import { SKILL_CATEGORIES, type CategoryId } from "../components/skills/skillsData";

type Filter = "all" | CategoryId;

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#B8A0FF]";

/** Heading, subtitle and filters rise in one after another; `custom` is each one's delay in seconds. */
const rise: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: (delay: number) => ({ opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut", delay } }),
};

/**
 * Each category group reveals itself when it scrolls into view, and staggers its own cards (see SkillCard).
 * `custom` is how long the cards wait before starting: the first time they wait for the heading, subtitle and
 * filters to appear; after the visitor has used a filter, they start almost immediately.
 */
const groupVariants: Variants = {
  hidden: { opacity: 0 },
  show: (wait: number) => ({
    opacity: 1,
    transition: { duration: 0.3, delayChildren: wait, staggerChildren: 0.04 },
  }),
};

const total = SKILL_CATEGORIES.reduce((sum, c) => sum + c.skills.length, 0);

const FILTERS: ReadonlyArray<{ id: Filter; label: string; count: number }> = [
  { id: "all", label: "All", count: total },
  ...SKILL_CATEGORIES.map((c) => ({ id: c.id, label: c.filterLabel, count: c.skills.length })),
];

export default function Skills() {
  const sectionRef = useRef<HTMLElement>(null);
  // Flips to true once, when the section has scrolled into view, and then stays true: the reveal plays once
  // and is not replayed as you scroll back and forth.
  const inView = useInView(sectionRef, { once: true, margin: "0px 0px -15% 0px" });
  const [filter, setFilter] = useState<Filter>("all");
  const [interacted, setInteracted] = useState(false);

  const visible = filter === "all" ? SKILL_CATEGORIES : SKILL_CATEGORIES.filter((c) => c.id === filter);
  const visibleCount = visible.reduce((sum, c) => sum + c.skills.length, 0);
  const activeLabel = FILTERS.find((f) => f.id === filter)?.label ?? "All";

  const reveal = (delay: number) =>
    ({ variants: rise, custom: delay, initial: "hidden", animate: inView ? "show" : "hidden" }) as const;

  return (
    <MotionConfig reducedMotion="user">
      <section
        ref={sectionRef}
        id="skills"
        aria-labelledby="skills-heading"
        className="relative overflow-hidden bg-[#100F17] px-6 py-24 sm:px-10 sm:py-28"
      >
        {/* A faint lavender light from the top edge, matching the Hero and About lighting */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[30rem] bg-[radial-gradient(ellipse_55%_60%_at_50%_0%,rgba(184,160,255,0.08),transparent_72%)]"
        />

        <div className="relative mx-auto w-full max-w-6xl">
          <motion.div {...reveal(0)}>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#B8A0FF]">What I work with</p>
            <h2
              id="skills-heading"
              className="mt-3 text-3xl font-semibold leading-tight tracking-tight text-[#F2F0F7] sm:text-4xl"
            >
              Skills &amp; Technologies
            </h2>
          </motion.div>

          <motion.p
            {...reveal(0.12)}
            className="mt-4 max-w-[58ch] text-base leading-relaxed text-[#A6A0B5] sm:text-lg"
          >
            The languages, tools and ideas I use and keep learning as I build projects and explore cybersecurity.
          </motion.p>

          {/* Filters */}
          <motion.div
            {...reveal(0.24)}
            role="group"
            aria-label="Filter skills by category"
            className="mt-8 flex flex-wrap gap-2"
          >
            {FILTERS.map((f) => {
              const selected = filter === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => {
                    setInteracted(true);
                    setFilter(f.id);
                  }}
                  className={`inline-flex min-h-10 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors duration-200 ${focusRing} ${
                    selected
                      ? "border-[#B8A0FF] bg-[#B8A0FF] text-[#100F17]"
                      : "border-[#343044] bg-[#1B1926]/60 text-[#A6A0B5] hover:border-[#B8A0FF]/50 hover:text-[#F2F0F7]"
                  }`}
                >
                  {f.label}
                  <span className="text-xs tabular-nums opacity-70">{f.count}</span>
                </button>
              );
            })}
          </motion.div>

          {/* Tells screen readers what a filter change did */}
          <p role="status" className="sr-only">
            Showing {visibleCount} skills: {activeLabel}
          </p>

          {/* Skills. Changing the filter fades the old set out, then the new set staggers in. */}
          <AnimatePresence mode="wait">
            <motion.div
              key={filter}
              exit={{ opacity: 0, transition: { duration: 0.18, ease: "easeIn" } }}
              className="mt-10 space-y-12"
            >
              {visible.map((category) => (
                <motion.section
                  key={category.id}
                  variants={groupVariants}
                  custom={interacted ? 0.05 : 0.35}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: "0px 0px -12% 0px" }}
                  aria-labelledby={`skills-${category.id}`}
                >
                  <div className="flex items-center gap-4">
                    <h3
                      id={`skills-${category.id}`}
                      className="text-base font-semibold tracking-tight text-[#F2F0F7] sm:text-lg"
                    >
                      {category.title}
                    </h3>
                    <span aria-hidden="true" className="h-px flex-1 bg-[#343044]" />
                  </div>

                  <ul className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
                    {category.skills.map((skill) => (
                      <SkillCard key={skill.name} skill={skill} />
                    ))}
                  </ul>
                </motion.section>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>
    </MotionConfig>
  );
}