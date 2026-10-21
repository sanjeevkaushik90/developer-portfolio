import type { IconType } from "react-icons";
import { FaCss3Alt, FaHtml5 } from "react-icons/fa";
import { FiCode, FiGlobe, FiMonitor, FiServer, FiShield, FiTerminal } from "react-icons/fi";
import { LuGraduationCap } from "react-icons/lu";
import { SiJavascript, SiPython, SiReact } from "react-icons/si";
import { TbCpu, TbSchool } from "react-icons/tb";

/**
 * ALL EDUCATION CONTENT LIVES IN THIS FILE. Edit it to update the Education section; no component changes needed.
 *
 * Honesty rules built into the content below:
 *  - The bachelor's degree is "Pursuing", never completed.
 *  - The O-Level course is shown as a completed course of study, with the note that no certificate was obtained.
 *  - The second course has no assumed status, institute, duration or certificate.
 *
 * PLACEHOLDERS: a detail whose `value` is empty ("") is HIDDEN on the live site, and shown as a dashed
 * "Not set yet" line while you run `npm run dev`, so you can see exactly what is left to fill in.
 * Every placeholder is marked TODO.
 */

/* -------------------------------------------------------------------------- */
/* Types                                                                       */
/* -------------------------------------------------------------------------- */

/** One labelled line on a card, such as "Institution: ...". Leave `value` empty to hide it until you know it. */
export type Detail = { label: string; value: string };

export type AcademicStatus = "Completed" | "Pursuing";

export type AcademicEntry = {
  id: string;
  /** Small label above the title. */
  eyebrow: string;
  title: string;
  status: AcademicStatus;
  icon: IconType;
  details: readonly Detail[];
};

/**
 * "Not specified" is for a course whose status you have not confirmed: no status is shown on the live site.
 * Change it to "In progress" or "Completed" only when that is true.
 */
export type CourseStatus = "Completed" | "In progress" | "Not specified";

export type Topic = { name: string; icon: IconType };

export type Course = {
  id: string;
  /** The course name. Edit it to the official name when you have it. */
  title: string;
  status: CourseStatus;
  /** Wording shown for the status. If left out, the status itself is shown. */
  statusLabel?: string;
  /** A short honest note under the status, for example about a certificate. */
  note?: string;
  icon: IconType;
  details: readonly Detail[];
  topics: readonly Topic[];
};

/* -------------------------------------------------------------------------- */
/* Section text                                                                */
/* -------------------------------------------------------------------------- */

export const EDUCATION_TITLE = "Education & Technical Training";
export const EDUCATION_SUBTITLE = "My academic background and technical learning journey.";
/** The line at the end of the section. */
export const EDUCATION_CLOSING = "Building on this foundation, I am now expanding my skills in backend development and cybersecurity.";

/* -------------------------------------------------------------------------- */
/* Academic education                                                          */
/* -------------------------------------------------------------------------- */

export const ACADEMIC_EDUCATION: readonly AcademicEntry[] = [
  {
    id: "class-12",
    eyebrow: "Class 12",
    title: "Higher Secondary Education",
    status: "Completed",
    icon: TbSchool,
    details: [
      { label: "Qualification", value: "Class 12 / Senior Secondary" },
      { label: "Institution", value: "" }, // TODO: your school's name
      { label: "Stream", value: "" }, // TODO: for example Science, Commerce or Arts
      { label: "Year completed", value: "" }, // TODO: the year you completed Class 12
    ],
  },
  {
    id: "bachelors-ignou",
    eyebrow: "Bachelor's degree",
    title: "Bachelor's Degree",
    status: "Pursuing", // keep "Pursuing" until the degree is actually completed
    icon: LuGraduationCap,
    details: [
      { label: "Qualification", value: "Bachelor's degree" },
      { label: "University", value: "Indira Gandhi National Open University (IGNOU)" },
      { label: "Expected graduation", value: "" }, // TODO: the year, once confirmed
    ],
  },
];

/* -------------------------------------------------------------------------- */
/* Technical courses (two separate courses, not one qualification)             */
/* -------------------------------------------------------------------------- */

export const TECHNICAL_COURSES: readonly Course[] = [
  {
    id: "o-level",
    title: "O-Level Computer Course",
    status: "Completed",
    statusLabel: "Course completed",
    note: "Certificate not obtained.", // remove this line if you later obtain the certificate
    icon: FiTerminal,
    details: [],
    topics: [
      { name: "Python programming", icon: SiPython },
      { name: "Internet of Things (IoT)", icon: TbCpu },
      { name: "Web development fundamentals", icon: FiGlobe },
      { name: "HTML", icon: FaHtml5 },
      { name: "CSS", icon: FaCss3Alt },
      { name: "JavaScript", icon: SiJavascript },
    ],
  },
  {
    id: "web-cyber-training",
    title: "Web Development & Cybersecurity Training", // TODO: replace with the official course name
    status: "Not specified", // TODO: set to "In progress" or "Completed" once confirmed
    icon: FiCode,
    details: [
      { label: "Institute", value: "" }, // TODO: add once known; do not guess
      { label: "Duration", value: "" }, // TODO: add once known
    ],
    topics: [
      { name: "Cybersecurity fundamentals", icon: FiShield },
      { name: "Web development", icon: FiGlobe },
      { name: "Frontend development", icon: FiMonitor },
      { name: "React", icon: SiReact },
      { name: "HTML and CSS", icon: FaHtml5 },
      { name: "JavaScript", icon: SiJavascript },
      { name: "Backend development", icon: FiServer },
    ],
  },
];