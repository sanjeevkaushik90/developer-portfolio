import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import type { Project } from "../../data/projects";
import { cleanUrl } from "../../lib/projects";
import ProjectImage from "./ProjectImage";
import { ProjectLinks, StatusBadge, TechTags } from "./ProjectMeta";

/**
 * One project card. The whole card is clickable through the "View Details" link (a stretched link), while the
 * GitHub and Live Demo buttons stay separately clickable above it. On hover the card lifts, its border
 * brightens, a soft lavender light appears and the image zooms slightly. Hover styles only apply on devices
 * that can hover, so nothing gets stuck on a phone; with reduced motion the lift and zoom are switched off.
 */
export default function ProjectCard({ project }: { project: Project }) {
  const githubUrl = cleanUrl(project.githubUrl);
  const liveUrl = cleanUrl(project.liveDemoUrl);

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-[#343044] bg-[#1B1926]/70 transition-[translate,border-color,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:border-[#B8A0FF]/50 hover:shadow-[0_18px_40px_-18px_rgba(184,160,255,0.40)] focus-within:border-[#B8A0FF]/60 motion-reduce:transition-none motion-reduce:hover:translate-y-0">
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden border-b border-[#343044]">
        <div className="absolute inset-0 transition-transform duration-500 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100">
          <ProjectImage
            src={project.image?.trim() || undefined}
            alt={project.imageAlt ?? `${project.title} cover image`}
            sizes="(min-width: 1024px) 380px, (min-width: 640px) 45vw, 92vw"
            category={project.category}
            title={project.title}
            isPlaceholder={project.imageIsPlaceholder}
          />
        </div>
        <div className="absolute left-3 top-3">
          <StatusBadge status={project.status} />
        </div>
      </div>

      {/* Text */}
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#B8A0FF]">{project.category}</p>
        <h3 className="mt-2 text-xl font-semibold tracking-tight text-[#F2F0F7]">{project.title}</h3>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[#A6A0B5]">{project.shortDescription}</p>

        <div className="mt-4">
          <TechTags technologies={project.technologies} max={4} />
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 pt-5">
          <Link
            href={`/projects/${project.slug}`}
            aria-label={`View details: ${project.title}`}
            className="inline-flex items-center gap-1.5 rounded text-sm font-medium text-[#F2F0F7] transition-colors duration-200 group-hover:text-[#B8A0FF] after:absolute after:inset-0 after:content-[''] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#B8A0FF]"
          >
            View Details
            <FiArrowRight
              aria-hidden="true"
              className="size-4 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
            />
          </Link>
          <div className="relative z-10">
            <ProjectLinks title={project.title} githubUrl={githubUrl} liveUrl={liveUrl} variant="icon" />
          </div>
        </div>
      </div>
    </article>
  );
}