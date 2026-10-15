import type { IconType } from "react-icons";
import { FiFolder, FiGlobe, FiServer, FiShield, FiTool } from "react-icons/fi";
import type { ProjectStatus } from "../../data/projects";

/**
 * Presentation details for the project components. Nothing here needs editing to add a project.
 * A category without an icon here gets a neutral folder icon, so a new category works straight away.
 */
const CATEGORY_ICONS: Partial<Record<string, IconType>> = {
  "Web Development": FiGlobe,
  Backend: FiServer,
  Cybersecurity: FiShield,
  "Developer Tools": FiTool,
};

export function categoryIcon(category: string): IconType {
  return CATEGORY_ICONS[category] ?? FiFolder;
}

export function getCategoryIconName(category: string): string {
  if (category === "Web Development") return "globe";
  if (category === "Backend") return "server";
  if (category === "Cybersecurity") return "shield";
  if (category === "Developer Tools") return "tool";
  return "folder";
}

/** Colour of the small dot in the status badge. */
export const STATUS_DOT: Record<ProjectStatus, string> = {
  Planned: "bg-[#A6A0B5]",
  "In Progress": "bg-amber-300",
  Completed: "bg-emerald-400",
  Demo: "bg-[#B8A0FF]",
};

/** Plain-language meaning of each status, shown on the project page so nothing is overstated. */
export const STATUS_MEANING: Record<ProjectStatus, string> = {
  Planned: "An idea at the planning stage. Nothing has been built yet.",
  "In Progress": "Being built right now. Some parts may work; the rest is still planned.",
  Completed: "Finished and working.",
  Demo: "A placeholder entry that shows how a project is presented. What it describes is a plan, not finished work.",
};