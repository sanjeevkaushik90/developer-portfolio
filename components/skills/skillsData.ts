import type { IconType } from "react-icons";
import { FaCss3Alt, FaHtml5 } from "react-icons/fa";
import { FiTerminal } from "react-icons/fi";
import { LuNetwork } from "react-icons/lu";
import {
  SiFastapi,
  SiGit,
  SiGithub,
  SiJavascript,
  SiJson,
  SiLinux,
  SiNextdotjs,
  SiNodedotjs,
  SiOwasp,
  SiPostgresql,
  SiPostman,
  SiPython,
  SiReact,
  SiRust,
  SiTailwindcss,
} from "react-icons/si";
import {
  TbApi,
  TbArrowsExchange,
  TbBug,
  TbDevices,
  TbLockCode,
  TbPlugConnected,
  TbScript,
  TbShieldLock,
  TbSql,
  TbWorldWww,
} from "react-icons/tb";
import { VscCode } from "react-icons/vsc";

/**
 * All the content of the Skills section lives here: edit this file to add, remove or rename a skill.
 *
 * Skills are listed by name only, on purpose. There are no levels or percentages, so nothing here claims
 * mastery of anything you are still learning.
 *
 * Icons: every one below exists in react-icons 5.0 and in the latest 5.x. If a skill has no `icon`, the card
 * shows a neutral code icon instead. Brand icons that are missing from some versions (Burp Suite, and the
 * VS Code logo) use a close generic icon; if your react-icons has SiBurpsuite or SiVisualstudiocode you can
 * swap them in.
 */

export type CategoryId = "languages" | "frontend" | "backend" | "databases" | "security" | "tools";

export type Skill = {
  name: string;
  icon?: IconType;
};

export type SkillCategory = {
  id: CategoryId;
  /** Heading shown above the group of skills. */
  title: string;
  /** Shorter label used on the filter button. */
  filterLabel: string;
  skills: readonly Skill[];
};

export const SKILL_CATEGORIES: readonly SkillCategory[] = [
  {
    id: "languages",
    title: "Programming Languages",
    filterLabel: "Programming",
    skills: [
      { name: "Python", icon: SiPython },
      { name: "JavaScript", icon: SiJavascript },
      { name: "Rust", icon: SiRust },
    ],
  },
  {
    id: "frontend",
    title: "Frontend Development",
    filterLabel: "Frontend",
    skills: [
      { name: "HTML5", icon: FaHtml5 },
      { name: "CSS3", icon: FaCss3Alt },
      { name: "React", icon: SiReact },
      { name: "Next.js", icon: SiNextdotjs },
      { name: "Tailwind CSS", icon: SiTailwindcss },
      { name: "Responsive Web Design", icon: TbDevices },
    ],
  },
  {
    id: "backend",
    title: "Backend Development",
    filterLabel: "Backend",
    skills: [
      { name: "FastAPI", icon: SiFastapi },
      { name: "REST API Development", icon: TbApi },
      { name: "HTTP", icon: TbArrowsExchange },
      { name: "JSON", icon: SiJson },
      { name: "Node.js", icon: SiNodedotjs },
    ],
  },
  {
    id: "databases",
    title: "Databases",
    filterLabel: "Databases",
    skills: [
      { name: "PostgreSQL", icon: SiPostgresql },
      { name: "SQL", icon: TbSql },
    ],
  },
  {
    id: "security",
    title: "Cybersecurity",
    filterLabel: "Cybersecurity",
    skills: [
      { name: "Linux", icon: SiLinux },
      { name: "Computer Networking", icon: LuNetwork },
      { name: "TCP/IP", icon: TbPlugConnected },
      { name: "DNS", icon: TbWorldWww },
      { name: "Web Security", icon: TbShieldLock },
      { name: "API Security", icon: TbLockCode },
      { name: "Python Security Scripting", icon: TbScript },
      { name: "OWASP Top 10", icon: SiOwasp },
    ],
  },
  {
    id: "tools",
    title: "Developer Tools",
    filterLabel: "Tools",
    skills: [
      { name: "Git", icon: SiGit },
      { name: "GitHub", icon: SiGithub },
      { name: "VS Code", icon: VscCode },
      { name: "Postman", icon: SiPostman },
      { name: "Linux Command Line", icon: FiTerminal },
      { name: "Burp Suite", icon: TbBug },
    ],
  },
];