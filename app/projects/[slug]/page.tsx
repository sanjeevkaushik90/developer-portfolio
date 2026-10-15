import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProjectDetail from "../../../components/projects/ProjectDetail";
import { getAllProjects, getProjectBySlug } from "../../../lib/projects";

type PageProps = { params: Promise<{ slug: string }> };

// One page is generated for every project in data/projects.ts. Any other address is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllProjects().map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return { title: "Project not found | Sanjeev Kaushik" };
  return {
    title: `${project.title} | Projects | Sanjeev Kaushik`,
    description: project.shortDescription,
  };
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();
  return <ProjectDetail project={project} />;
}