"use client";

import { useRef, type ReactNode } from "react";
import { MotionConfig, motion, useInView, type Variants } from "motion/react";
import { AcademicCard, CourseCard } from "../components/education/EducationCards";
import {
  ACADEMIC_EDUCATION,
  EDUCATION_CLOSING,
  EDUCATION_SUBTITLE,
  EDUCATION_TITLE,
  TECHNICAL_COURSES,
} from "../data/education";

/** The heading and subtitle rise in one after another; `custom` is each one's delay in seconds. */
const rise: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: (delay: number) => ({ opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut", delay } }),
};

/** Each group's cards arrive with a gentle stagger when the group scrolls into view (once). */
const listVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

function Group({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <div className="mt-12 first-of-type:mt-10">
      <div className="flex items-center gap-4">
        <h3 id={id} className="text-base font-semibold tracking-tight text-[#F2F0F7] sm:text-lg">
          {title}
        </h3>
        <span aria-hidden="true" className="h-px flex-1 bg-[#343044]" />
      </div>
      <motion.ul
        aria-labelledby={id}
        variants={listVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "0px 0px -10% 0px" }}
        className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2"
      >
        {children}
      </motion.ul>
    </div>
  );
}

/**
 * Education & Technical Training. Everything it shows comes from data/education.ts.
 * Academic education and technical courses are two separate groups, so a course is never mistaken for a degree.
 */
export default function Education() {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "0px 0px -15% 0px" });
  const reveal = (delay: number) =>
    ({ variants: rise, custom: delay, initial: "hidden", animate: inView ? "show" : "hidden" }) as const;

  return (
    <MotionConfig reducedMotion="user">
      <section
        ref={sectionRef}
        id="education"
        aria-labelledby="education-heading"
        className="relative overflow-hidden bg-[#100F17] px-6 py-24 sm:px-10 sm:py-28"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[30rem] bg-[radial-gradient(ellipse_55%_60%_at_50%_0%,rgba(184,160,255,0.08),transparent_72%)]"
        />

        <div className="relative mx-auto w-full max-w-6xl">
          <motion.div {...reveal(0)}>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#B8A0FF]">Background</p>
            <h2
              id="education-heading"
              className="mt-3 text-3xl font-semibold leading-tight tracking-tight text-[#F2F0F7] sm:text-4xl"
            >
              {EDUCATION_TITLE}
            </h2>
          </motion.div>

          <motion.p {...reveal(0.12)} className="mt-4 max-w-[58ch] text-base leading-relaxed text-[#A6A0B5] sm:text-lg">
            {EDUCATION_SUBTITLE}
          </motion.p>

          <Group id="education-academic" title="Academic Education">
            {ACADEMIC_EDUCATION.map((entry) => (
              <AcademicCard key={entry.id} entry={entry} />
            ))}
          </Group>

          <Group id="education-courses" title="Technical Courses">
            {TECHNICAL_COURSES.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </Group>

          <p className="mt-10 max-w-[62ch] border-l-2 border-[#B8A0FF]/40 pl-4 text-base leading-relaxed text-[#A6A0B5]">
            {EDUCATION_CLOSING}
          </p>
        </div>
      </section>
    </MotionConfig>
  );
}