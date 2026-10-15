"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { FiArrowLeft, FiCheckCircle, FiCircle } from "react-icons/fi";
import type { Project } from "../../data/projects";
import { cleanUrl, formatDate, getGalleryImages, paragraphs, splitFeatures } from "../../lib/projects";
import FadeIn from "./FadeIn";
import ProjectGallery from "./ProjectGallery";
import { ProjectLinks, StatusBadge, TechTags } from "./ProjectMeta";
import { STATUS_MEANING } from "./projectUi";

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#B8A0FF]";
const navLink = `group inline-flex items-center gap-2 rounded text-sm font-medium text-[#A6A0B5] transition-colors duration-200 hover:text-[#F2F0F7] ${focusRing}`;

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <FadeIn className="mt-12">
      <h2 className="text-xl font-semibold tracking-tight text-[#F2F0F7] sm:text-2xl">{title}</h2>
      <div className="mt-4">{children}</div>
    </FadeIn>
  );
}

function BulletList({ items }: { items: readonly string[] }) {
  return (
    <ul className="space-y-2.5 text-base leading-relaxed text-[#A6A0B5]">
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <span aria-hidden="true" className="mt-2.5 size-1.5 shrink-0 rounded-full bg-[#B8A0FF]" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/** The full page for one project, built entirely from its entry in data/projects.ts. */
export default function ProjectDetail({ project }: { project: Project }) {
  const images = getGalleryImages(project);
  const githubUrl = cleanUrl(project.githubUrl);
  const liveUrl = cleanUrl(project.liveDemoUrl);
  const { built, planned } = splitFeatures(project.features);
  const started = formatDate(project.startDate);
  const updated = formatDate(project.lastUpdated);

  return (
    <main className="relative min-h-dvh bg-[#100F17] px-6 pb-24 pt-28 sm:px-10 sm:pt-32">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[32rem] bg-[radial-gradient(ellipse_55%_60%_at_50%_0%,rgba(184,160,255,0.08),transparent_72%)]"
      />

      <div className="relative mx-auto w-full max-w-6xl">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <Link href="/projects" className={navLink}>
            <FiArrowLeft aria-hidden="true" className="size-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
            All projects
          </Link>
          <Link href="/" className={navLink}>
            Home
          </Link>
        </nav>

        {/* Header */}
        <FadeIn className="mt-8">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#B8A0FF]">{project.category}</p>
            <StatusBadge status={project.status} />
          </div>
          <h1 className="mt-3 text-4xl font-semibold leading-tight tracking-tight text-[#F2F0F7] sm:text-5xl">
            {project.title}
          </h1>
          <p className="mt-4 max-w-[62ch] text-lg leading-relaxed text-[#A6A0B5]">{project.shortDescription}</p>
          {(githubUrl || liveUrl) && (
            <div className="mt-6">
              <ProjectLinks title={project.title} githubUrl={githubUrl} liveUrl={liveUrl} variant="button" />
            </div>
          )}
        </FadeIn>

        <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_19rem] lg:gap-14">
          {/* Main column */}
          <div className="min-w-0">
            <FadeIn>
              <ProjectGallery images={images} title={project.title} category={project.category} />
            </FadeIn>

            <Section title="Overview">
              <div className="max-w-[68ch] space-y-4 text-base leading-relaxed text-[#A6A0B5] sm:text-lg">
                {paragraphs(project.fullDescription).map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            </Section>

            {project.goal && (
              <Section title="What it is meant to accomplish">
                <p className="max-w-[68ch] text-base leading-relaxed text-[#A6A0B5] sm:text-lg">{project.goal}</p>
              </Section>
            )}

            {project.features.length > 0 && (
              <Section title="Features">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-[#F2F0F7]">What works today</h3>
                    {built.length > 0 ? (
                      <ul className="mt-3 space-y-2.5 text-base text-[#A6A0B5]">
                        {built.map((f) => (
                          <li key={f} className="flex gap-3">
                            <FiCheckCircle aria-hidden="true" className="mt-1 size-4 shrink-0 text-[#B8A0FF]" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-3 text-base text-[#A6A0B5]">
                        Nothing is built yet. Everything below is planned.
                      </p>
                    )}
                  </div>
                  {planned.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-[#F2F0F7]">Planned</h3>
                      <ul className="mt-3 space-y-2.5 text-base text-[#A6A0B5]">
                        {planned.map((f) => (
                          <li key={f} className="flex gap-3">
                            <FiCircle aria-hidden="true" className="mt-1 size-4 shrink-0 text-[#A6A0B5]" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </Section>
            )}

            {project.whatToBuild.length > 0 && (
              <Section title="What I need to build">
                <ol className="space-y-3 text-base leading-relaxed text-[#A6A0B5]">
                  {project.whatToBuild.map((step, i) => (
                    <li key={step} className="flex gap-4">
                      <span
                        aria-hidden="true"
                        className="grid size-7 shrink-0 place-items-center rounded-full border border-[#B8A0FF]/30 bg-[#B8A0FF]/10 text-xs font-semibold tabular-nums text-[#B8A0FF]"
                      >
                        {i + 1}
                      </span>
                      <span className="pt-0.5">{step}</span>
                    </li>
                  ))}
                </ol>
              </Section>
            )}

            {project.whatIWillLearn.length > 0 && (
              <Section title="What I will learn">
                <BulletList items={project.whatIWillLearn} />
              </Section>
            )}

            {project.challenges && project.challenges.length > 0 && (
              <Section title="Challenges">
                <BulletList items={project.challenges} />
              </Section>
            )}

            {project.futureImprovements && project.futureImprovements.length > 0 && (
              <Section title="Future improvements">
                <BulletList items={project.futureImprovements} />
              </Section>
            )}
          </div>

          {/* Side column */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <FadeIn className="space-y-6 rounded-2xl border border-[#343044] bg-[#1B1926]/70 p-5">
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#A6A0B5]">Technologies</h2>
                <div className="mt-3">
                  <TechTags technologies={project.technologies} />
                </div>
              </div>

              <dl className="space-y-4 text-sm">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-[#A6A0B5]">Status</dt>
                  <dd className="mt-1.5 text-[#F2F0F7]">{project.status}</dd>
                  <dd className="mt-1 leading-relaxed text-[#A6A0B5]">{STATUS_MEANING[project.status]}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-[#A6A0B5]">Category</dt>
                  <dd className="mt-1.5 text-[#F2F0F7]">{project.category}</dd>
                </div>
                {started && (
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-[#A6A0B5]">Started</dt>
                    <dd className="mt-1.5 text-[#F2F0F7]">{started}</dd>
                  </div>
                )}
                {updated && (
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-[#A6A0B5]">Last updated</dt>
                    <dd className="mt-1.5 text-[#F2F0F7]">{updated}</dd>
                  </div>
                )}
              </dl>

              {githubUrl || liveUrl ? (
                <div>
                  <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#A6A0B5]">Links</h2>
                  <div className="mt-3">
                    <ProjectLinks title={project.title} githubUrl={githubUrl} liveUrl={liveUrl} variant="button" />
                  </div>
                </div>
              ) : (
                <p className="text-sm leading-relaxed text-[#A6A0B5]">
                  No repository or live demo is linked yet.
                </p>
              )}
            </FadeIn>
          </aside>
        </div>
      </div>
    </main>
  );
}