import { PROJECTS, type Project, type ProjectCategory, type ProjectFeature } from "../data/projects";

/* -------------------------------------------------------------------------- */
/* Reading the data                                                            */
/* -------------------------------------------------------------------------- */

export function getAllProjects(): readonly Project[] {
  return PROJECTS;
}

export function getFeaturedProjects(): readonly Project[] {
  return PROJECTS.filter((p) => p.featured);
}

export function getProjectBySlug(slug: string): Project | undefined {
  return PROJECTS.find((p) => p.slug === slug);
}

/** The categories in use, in the order they first appear. */
export function getCategories(projects: readonly Project[]): ProjectCategory[] {
  return Array.from(new Set(projects.map((p) => p.category)));
}

/* -------------------------------------------------------------------------- */
/* Optional fields, handled gracefully                                         */
/* -------------------------------------------------------------------------- */

/** A link counts as "provided" only if it is a non-empty http(s) address. Anything else is treated as missing. */
export function cleanUrl(url: string | undefined): string | undefined {
  const value = url?.trim();
  if (!value) return undefined;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" || parsed.protocol === "http:" ? parsed.toString() : undefined;
  } catch {
    return undefined;
  }
}

export type ResolvedImage = {
  src: string;
  alt: string;
  caption?: string;
  isPlaceholder: boolean;
};

/** The cover image first (if there is one), then the gallery, each with a sensible alt text. */
export function getGalleryImages(project: Project): ResolvedImage[] {
  const images: ResolvedImage[] = [];
  if (project.image?.trim()) {
    images.push({
      src: project.image.trim(),
      alt: project.imageAlt ?? `${project.title} cover image`,
      isPlaceholder: Boolean(project.imageIsPlaceholder),
    });
  }
  (project.gallery ?? []).forEach((img, i) => {
    if (!img.src.trim()) return;
    images.push({
      src: img.src.trim(),
      alt: img.alt ?? `${project.title} screenshot ${i + 1}`,
      caption: img.caption,
      isPlaceholder: Boolean(img.isPlaceholder),
    });
  });
  return images;
}

export function splitFeatures(features: readonly ProjectFeature[]): { built: string[]; planned: string[] } {
  const built: string[] = [];
  const planned: string[] = [];
  for (const f of features) {
    if (typeof f === "string") planned.push(f);
    else (f.done ? built : planned).push(f.text);
  }
  return { built, planned };
}

/** "2026-10-14" to "Oct 2026". Uses UTC so the server and the browser always print the same text. */
export function formatDate(iso: string | undefined): string | undefined {
  if (!iso) return undefined;
  const date = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return undefined;
  return new Intl.DateTimeFormat("en", { month: "short", year: "numeric", timeZone: "UTC" }).format(date);
}

export function paragraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

/* -------------------------------------------------------------------------- */
/* Validation: catches mistakes in data/projects.ts with a clear message        */
/* -------------------------------------------------------------------------- */

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

export function validateProjects(projects: readonly Project[]): string[] {
  const problems: string[] = [];
  const ids = new Set<string>();
  const slugs = new Set<string>();

  projects.forEach((p, i) => {
    const label = `Project #${i + 1} ("${p.title || p.id || "untitled"}")`;
    const fail = (msg: string) => problems.push(`${label}: ${msg}`);

    if (!p.id.trim()) fail("id is empty.");
    else if (ids.has(p.id)) fail(`id "${p.id}" is used by another project; ids must be unique.`);
    ids.add(p.id);

    if (!SLUG.test(p.slug)) fail(`slug "${p.slug}" must be lowercase letters, numbers and single hyphens (for example "my-project").`);
    else if (slugs.has(p.slug)) fail(`slug "${p.slug}" is used by another project; slugs must be unique.`);
    slugs.add(p.slug);

    if (!p.title.trim()) fail("title is empty.");
    if (!p.shortDescription.trim()) fail("shortDescription is empty.");
    if (!p.fullDescription.trim()) fail("fullDescription is empty.");
    if (p.technologies.length === 0) fail("technologies needs at least one entry.");

    const paths = [p.image, ...(p.gallery ?? []).map((g) => g.src)].filter((v): v is string => Boolean(v?.trim()));
    for (const path of paths) {
      if (!path.startsWith("/")) fail(`image path "${path}" must start with "/" (it is relative to the public folder).`);
    }

    for (const [field, value] of [["githubUrl", p.githubUrl], ["liveDemoUrl", p.liveDemoUrl]] as const) {
      if (value?.trim() && !cleanUrl(value)) fail(`${field} "${value}" is not a valid http(s) address. Leave it empty if there is no link yet.`);
    }

    for (const [field, value] of [["startDate", p.startDate], ["lastUpdated", p.lastUpdated]] as const) {
      if (value && (!DATE.test(value) || Number.isNaN(new Date(`${value}T00:00:00Z`).getTime()))) {
        fail(`${field} "${value}" must be a real date written as YYYY-MM-DD.`);
      }
    }
    if (p.startDate && p.lastUpdated && p.lastUpdated < p.startDate) fail("lastUpdated is earlier than startDate.");
  });

  return problems;
}

// Check once on the server (during `npm run dev` and `npm run build`). A mistake in the data fails loudly
// with every problem listed, instead of producing a broken page.
if (typeof window === "undefined") {
  const problems = validateProjects(PROJECTS);
  if (problems.length > 0) {
    throw new Error(`Invalid project data in data/projects.ts:\n - ${problems.join("\n - ")}`);
  }
}