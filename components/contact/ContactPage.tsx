"use client";

import Link from "next/link";
import { MotionConfig, motion, type Variants } from "motion/react";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import ContactForm from "./ContactForm";
import ContactInfo from "./ContactInfo";

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#B8A0FF]";

/** The heading block fades and rises in one piece at a time, on load. */
const heroVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
};
const heroItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

/** The whole /contact page. The Navbar and footer come from the site layout, not from here. */
export default function ContactPage() {
  return (
    <MotionConfig reducedMotion="user">
      <main className="relative min-h-dvh overflow-hidden bg-[#100F17] px-6 pb-24 pt-28 sm:px-10 sm:pt-32">
        {/* A faint lavender light from the top edge, matching the other sections */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[32rem] bg-[radial-gradient(ellipse_55%_60%_at_50%_0%,rgba(184,160,255,0.09),transparent_72%)]"
        />

        <div className="relative mx-auto w-full max-w-6xl">
          <Link
            href="/"
            className={`group inline-flex items-center gap-2 rounded text-sm font-medium text-[#A6A0B5] transition-colors duration-200 hover:text-[#F2F0F7] ${focusRing}`}
          >
            <FiArrowLeft aria-hidden="true" className="size-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
            Back to home
          </Link>

          {/* A. Heading */}
          <motion.div variants={heroVariants} initial="hidden" animate="show" className="mt-8 max-w-3xl">
            <motion.p
              variants={heroItem}
              className="text-xs font-medium uppercase tracking-[0.18em] text-[#B8A0FF]"
            >
              Get in touch
            </motion.p>
            <motion.h1
              variants={heroItem}
              className="mt-3 text-4xl font-semibold leading-tight tracking-tight text-[#F2F0F7] sm:text-5xl"
            >
              Let&apos;s build something meaningful.
            </motion.h1>
            <motion.p
              variants={heroItem}
              className="mt-4 max-w-[58ch] text-base leading-relaxed text-[#A6A0B5] sm:text-lg"
            >
              Whether you are a recruiter, a fellow developer or a possible collaborator, I would be glad to hear
              from you. Send a message and I will get back to you.
            </motion.p>
          </motion.div>

          {/* B. Two columns: details and form */}
          <div className="mt-12 grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-14">
            <ContactInfo />
            <ContactForm />
          </div>

          {/* C. Closing */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -10% 0px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mt-16 flex flex-col gap-4 border-t border-[#343044] pt-8 sm:flex-row sm:items-center sm:justify-between"
          >
            <p className="max-w-[48ch] text-base leading-relaxed text-[#A6A0B5]">
              Have an idea or opportunity in mind? I&apos;d love to hear from you.
            </p>
            <Link
              href="/projects"
              className={`group inline-flex items-center gap-2 rounded text-sm font-medium text-[#F2F0F7] transition-colors duration-200 hover:text-[#B8A0FF] ${focusRing}`}
            >
              See my projects
              <FiArrowRight aria-hidden="true" className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>
      </main>
    </MotionConfig>
  );
}