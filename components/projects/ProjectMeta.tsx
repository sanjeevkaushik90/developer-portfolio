import { FiExternalLink, FiGithub } from "react-icons/fi";
import type { ProjectStatus } from "../../data/projects";
import { STATUS_DOT } from "./projectUi";

export function StatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#343044] bg-[#100F17]/85 px-2.5 py-1 text-xs font-medium text-[#F2F0F7] backdrop-blur">
      <span aria-hidden="true" className={`size-1.5 rounded-full ${STATUS_DOT[status]}`} />
      {status}
    </span>
  );
}

/** Technology tags. `max` shows the first few and "+N" for the rest (used on cards). */
export function TechTags({ technologies, max }: { technologies: readonly string[]; max?: number }) {
  const shown = max ? technologies.slice(0, max) : technologies;
  const hidden = technologies.length - shown.length;
  return (
    <ul aria-label="Technologies" className="flex flex-wrap gap-1.5">
      {shown.map((tech) => (
        <li
          key={tech}
          className="rounded-full border border-[#343044] bg-[#100F17]/60 px-2.5 py-1 text-xs text-[#A6A0B5]"
        >
          {tech}
        </li>
      ))}
      {hidden > 0 && (
        <li className="rounded-full border border-[#343044] px-2.5 py-1 text-xs text-[#A6A0B5]">+{hidden}</li>
      )}
    </ul>
  );
}

type ProjectLinksProps = {
  title: string;
  githubUrl?: string;
  liveUrl?: string;
  /** "icon": small round buttons for cards. "button": labelled buttons for the project page. */
  variant: "icon" | "button";
};

/** GitHub and Live Demo links. Each one is only drawn when a real address was given. */
export function ProjectLinks({ title, githubUrl, liveUrl, variant }: ProjectLinksProps) {
  if (!githubUrl && !liveUrl) return null;

  const base =
    variant === "icon"
      ? "inline-flex size-9 items-center justify-center rounded-full border border-[#343044] bg-[#100F17]/60 text-[#A6A0B5] transition-colors duration-200 hover:border-[#B8A0FF]/60 hover:text-[#F2F0F7]"
      : "inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#343044] bg-[#1B1926] px-4 text-sm font-medium text-[#F2F0F7] transition-colors duration-200 hover:border-[#B8A0FF]/60 hover:text-[#B8A0FF]";
  const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B8A0FF]";

  return (
    <div className="flex flex-wrap items-center gap-2">
      {githubUrl && (
        <a
          href={githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${title} on GitHub (opens in a new tab)`}
          className={`${base} ${focus}`}
        >
          <FiGithub aria-hidden="true" className="size-4" />
          {variant === "button" && "GitHub"}
        </a>
      )}
      {liveUrl && (
        <a
          href={liveUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${title} live demo (opens in a new tab)`}
          className={`${base} ${focus}`}
        >
          <FiExternalLink aria-hidden="true" className="size-4" />
          {variant === "button" && "Live Demo"}
        </a>
      )}
    </div>
  );
}