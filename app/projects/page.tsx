import type { Metadata } from "next";
import ProjectsIndex from "../../components/projects/ProjectsIndex";
import { getAllProjects } from "../../lib/projects";

export const metadata: Metadata = {
  title: "Projects | Sanjeev Kaushik",
  description: "Projects I am building to learn by doing: what works today and what is still planned.",
};

export default function ProjectsPage() {
  return <ProjectsIndex projects={getAllProjects()} />;
}