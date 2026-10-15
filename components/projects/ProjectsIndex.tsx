"use client";

import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";
import type { Project } from "../../data/projects";
import FadeIn from "./FadeIn";
import ProjectGrid from "./ProjectGrid";

/** The /projects page: every project in data/projects.ts, with category filters. */
export default function ProjectsIndex({ projects }: { projects: readonly Project[] }) {
  return (
    <main className="relative min-h-dvh bg-[#100F17] px-6 pb-24 pt-28 sm:px-10 sm:pt-32">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[30rem] bg-[radial-gradient(ellipse_55%_60%_at_50%_0%,rgba(184,160,255,0.08),transparent_72%)]"
      />
      <div className="relative mx-auto w-full max-w-6xl">
        <Link
          href="/"
          className="group inline-flex items-center gap-2 rounded text-sm font-medium text-[#A6A0B5] transition-colors duration-200 hover:text-[#F2F0F7] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#B8A0FF]"
        >
          <FiArrowLeft aria-hidden="true" className="size-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
          Back to home
        </Link>

        <FadeIn className="mt-8">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#B8A0FF]">All work</p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight tracking-tight text-[#F2F0F7] sm:text-5xl">
            Projects
          </h1>
          <p className="mt-4 max-w-[58ch] text-base leading-relaxed text-[#A6A0B5] sm:text-lg">
            Things I am building to learn by doing. Each project page shows what works today and what is still planned.
          </p>
        </FadeIn>

        <div className="mt-10">
          {projects.length > 0 ? (
            <ProjectGrid projects={projects} filterable />
          ) : (
            <p className="text-[#A6A0B5]">Projects will appear here soon.</p>
          )}
        </div>
      </div>
    </main>
  );
}