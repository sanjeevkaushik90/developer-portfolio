"use client";

import { MotionConfig, motion, type Variants } from "motion/react";
import AboutBackdrop from "./AboutBackdrop";
import { ABOUT_GOAL, ABOUT_INTRO, ABOUT_LEARNING, INTERESTS } from "../../app/about/aboutCopy";
import ProfilePhoto from "./ProfilePhoto";

/**
 * Entrance sequence. Each element rises a few pixels while fading in, after the `custom` delay (seconds)
 * it is given below: photo, label, heading, paragraphs, then the tags, then the two closing sections.
 * Opacity and a small upward move only: no bounce, blur, typing effect or continuous motion.
 */





const rise: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: (delay: number) => ({ opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut", delay } }),
};
const riseSmall: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: (delay: number) => ({ opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut", delay } }),
};

export default function AboutContent() {
  return (
    <MotionConfig reducedMotion="user">
      <main className="relative isolate min-h-dvh overflow-hidden bg-[#100F17] px-6 pb-24 pt-28 sm:px-10 sm:pt-32">
        <AboutBackdrop />

        {/* "initial" and "animate" here pass the sequence down to every element that has `variants`. */}
        <motion.div initial="hidden" animate="show" className="relative z-10 mx-auto w-full max-w-6xl">


          <div className="mt-10 grid grid-cols-1 items-start gap-12 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-14 lg:gap-16">            {/* Photo */}
            <motion.div variants={rise} custom={0.05} className="mx-auto w-full max-w-sm md:mx-0 md:max-w-none">
              <ProfilePhoto sizes="(min-width: 768px) 40vw, 80vw" />
            </motion.div>

            {/* Text */}
            <div className="flex flex-col items-start">
              <motion.p
                variants={rise}
                custom={0.15}
                className="text-xs font-medium uppercase tracking-[0.18em] text-[#B8A0FF]"
              >
                About me
              </motion.p>
              <motion.h1
                variants={rise}
                custom={0.3}
                className="mt-3 text-4xl font-semibold leading-tight tracking-tight text-[#F2F0F7] sm:text-5xl"
              >
                Sanjeev Kaushik
              </motion.h1>

              <div className="mt-6 max-w-[62ch] space-y-5 text-base leading-relaxed text-[#A6A0B5] sm:text-lg">
                {ABOUT_INTRO.map((paragraph, i) => (
                  <motion.p key={paragraph} variants={rise} custom={0.45 + i * 0.12}>
                    {paragraph}
                  </motion.p>
                ))}
              </div>

              <ul aria-label="Interests" className="mt-6 flex flex-wrap gap-2">
                {INTERESTS.map((interest, i) => (
                  <motion.li
                    key={interest}
                    variants={riseSmall}
                    custom={0.75 + i * 0.06}
                    className="rounded-full border border-[#343044] bg-[#1B1926] px-3.5 py-1.5 text-sm text-[#F2F0F7]"
                  >
                    {interest}
                  </motion.li>
                ))}
              </ul>

              <motion.div variants={rise} custom={1.05} className="mt-10">
                <h2 className="text-xl font-semibold tracking-tight text-[#F2F0F7]">How I learn</h2>
                <p className="mt-3 max-w-[62ch] text-base leading-relaxed text-[#A6A0B5] sm:text-lg">
                  {ABOUT_LEARNING}
                </p>
              </motion.div>

              <motion.div variants={rise} custom={1.15} className="mt-10">
                <h2 className="text-xl font-semibold tracking-tight text-[#F2F0F7]">Where I&apos;m headed</h2>
                <p className="mt-3 max-w-[62ch] text-base leading-relaxed text-[#A6A0B5] sm:text-lg">
                  {ABOUT_GOAL}
                </p>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </main>
    </MotionConfig>
  );
}