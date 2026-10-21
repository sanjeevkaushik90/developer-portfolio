"use client";

import { motion, type Variants } from "motion/react";
import type { AcademicEntry, Course, Detail, Topic } from "../../data/education";

/** In development, details that are still empty show as dashed "Not set yet" lines; on the live site they are hidden. */
const SHOW_MISSING = process.env.NODE_ENV === "development";

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

/**
 * Card style shared with the Skills and Projects sections. On hover the card lifts a few pixels, its border
 * brightens and a soft lavender light appears. Tailwind only applies hover styles on devices that can hover,
 * and reduced motion switches the lift off.
 */
const cardShell =
  "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-[#343044] bg-[#1B1926]/70 p-6 transition-[translate,border-color,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:border-[#B8A0FF]/50 hover:shadow-[0_18px_40px_-18px_rgba(184,160,255,0.40)] motion-reduce:transition-none motion-reduce:hover:translate-y-0";

function Glow() {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_0%,rgba(184,160,255,0.16),transparent_60%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
    />
  );
}

function IconTile({ icon: Icon }: { icon: Topic["icon"] }) {
  return (
    <span className="relative grid size-12 shrink-0 place-items-center rounded-xl border border-[#B8A0FF]/25 bg-[#B8A0FF]/10 text-[#B8A0FF] transition-colors duration-300 group-hover:border-[#B8A0FF]/55">
      <Icon aria-hidden="true" className="size-6" />
    </span>
  );
}

/** The status is always written out in words; the colour of the dot is only decoration. */
function StatusPill({ label, tone }: { label: string; tone: "done" | "active" }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#343044] bg-[#100F17]/70 px-3 py-1 text-xs font-medium text-[#F2F0F7]">
      <span aria-hidden="true" className={`size-1.5 rounded-full ${tone === "done" ? "bg-emerald-400" : "bg-amber-300"}`} />
      {label}
    </span>
  );
}

function MissingNote({ children }: { children: string }) {
  return (
    <p className="rounded-lg border border-dashed border-[#343044] px-3 py-1.5 text-sm text-[#A6A0B5]">{children}</p>
  );
}

/** Labelled lines (Institution, Stream, ...). Empty values are hidden on the live site. */
function Details({ details }: { details: readonly Detail[] }) {
  const rows = details.filter((d) => d.value.trim() !== "" || SHOW_MISSING);
  if (rows.length === 0) return null;
  return (
    <dl className="relative mt-5 space-y-3 text-sm">
      {rows.map((d) => (
        <div key={d.label} className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
          <dt className="shrink-0 text-[#A6A0B5] sm:w-40">{d.label}</dt>
          {d.value.trim() !== "" ? (
            <dd className="min-w-0 text-[#F2F0F7]">{d.value}</dd>
          ) : (
            <dd className="min-w-0 text-[#A6A0B5]">
              <span className="rounded border border-dashed border-[#343044] px-2 py-0.5">
                Not set yet: add it in data/education.ts
              </span>
            </dd>
          )}
        </div>
      ))}
    </dl>
  );
}

/** A school or university qualification. */
export function AcademicCard({ entry }: { entry: AcademicEntry }) {
  const titleId = `education-${entry.id}`;
  return (
    <motion.li variants={cardVariants} className="min-w-0">
      <article aria-labelledby={titleId} className={cardShell}>
        <Glow />
        <div className="relative flex items-start gap-4">
          <IconTile icon={entry.icon} />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#B8A0FF]">{entry.eyebrow}</p>
            <h4 id={titleId} className="mt-1 text-xl font-semibold tracking-tight text-[#F2F0F7]">
              {entry.title}
            </h4>
          </div>
        </div>
        <div className="relative mt-4">
          <StatusPill label={entry.status} tone={entry.status === "Completed" ? "done" : "active"} />
        </div>
        <Details details={entry.details} />
      </article>
    </motion.li>
  );
}

function TopicRow({ topic }: { topic: Topic }) {
  const Icon = topic.icon;
  return (
    <li className="flex items-center gap-2.5 text-sm text-[#F2F0F7]">
      <Icon aria-hidden="true" className="size-4 shrink-0 text-[#B8A0FF]" />
      {topic.name}
    </li>
  );
}

/** A technical course: its own card, with what was studied. */
export function CourseCard({ course }: { course: Course }) {
  const titleId = `education-${course.id}`;
  const statusKnown = course.status !== "Not specified";
  return (
    <motion.li variants={cardVariants} className="min-w-0">
      <article aria-labelledby={titleId} className={cardShell}>
        <Glow />
        <div className="relative flex items-start gap-4">
          <IconTile icon={course.icon} />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#B8A0FF]">Technical course</p>
            <h4 id={titleId} className="mt-1 text-xl font-semibold tracking-tight text-[#F2F0F7]">
              {course.title}
            </h4>
          </div>
        </div>

        <div className="relative mt-4 space-y-2">
          {statusKnown ? (
            <StatusPill label={course.statusLabel ?? course.status} tone={course.status === "Completed" ? "done" : "active"} />
          ) : (
            SHOW_MISSING && <MissingNote>Status not set yet: add it in data/education.ts</MissingNote>
          )}
          {course.note && <p className="text-sm text-[#A6A0B5]">{course.note}</p>}
        </div>

        <Details details={course.details} />

        <div className="relative mt-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#A6A0B5]">Topics studied</p>
          <ul aria-label={`Topics studied in ${course.title}`} className="mt-3 grid grid-cols-1 gap-x-6 gap-y-2.5 sm:grid-cols-2">
            {course.topics.map((topic) => (
              <TopicRow key={topic.name} topic={topic} />
            ))}
          </ul>
        </div>
      </article>
    </motion.li>
  );
}