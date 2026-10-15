"use client";

import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import FadeIn from "../components/projects/FadeIn";
import ProjectGrid from "../components/projects/ProjectGrid";
import { getAllProjects, getFeaturedProjects } from "../lib/projects";

/**
 * The Projects section of the home page. It shows the projects marked `featured: true` in data/projects.ts,
 * so adding or removing a project there changes this section with no code changes.
 */
export default function Projects() {
  const featured = getFeaturedProjects();
  const total = getAllProjects().length;

  return (
    <section
      id="projects"
      aria-labelledby="projects-heading"
      className="relative overflow-hidden bg-[#100F17] px-6 py-24 sm:px-10 sm:py-28"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[30rem] bg-[radial-gradient(ellipse_55%_60%_at_50%_0%,rgba(184,160,255,0.08),transparent_72%)]"
      />

      <div className="relative mx-auto w-full max-w-6xl">
        <FadeIn>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#B8A0FF]">Selected work</p>
          <h2
            id="projects-heading"
            className="mt-3 text-3xl font-semibold leading-tight tracking-tight text-[#F2F0F7] sm:text-4xl"
          >
            Projects
          </h2>
          <p className="mt-4 max-w-[58ch] text-base leading-relaxed text-[#A6A0B5] sm:text-lg">
            Things I am building to learn by doing. Each project page shows what works today and what is still planned.
          </p>
        </FadeIn>

        <div className="mt-10">
          {featured.length > 0 ? (
            <ProjectGrid projects={featured} />
          ) : (
            <p className="text-[#A6A0B5]">Projects will appear here soon.</p>
          )}
        </div>

        {total > 0 && (
          <FadeIn className="mt-10">
            <Link
              href="/projects"
              className="group inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#343044] bg-[#1B1926] px-5 text-sm font-medium text-[#F2F0F7] transition-colors duration-200 hover:border-[#B8A0FF]/60 hover:text-[#B8A0FF] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#B8A0FF]"
            >
              View all projects
              <FiArrowRight aria-hidden="true" className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </FadeIn>
        )}
      </div>
    </section>
  );
}