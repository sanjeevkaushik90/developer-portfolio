"use client";

import { useState } from "react";
import { AnimatePresence, MotionConfig, motion, type Variants } from "motion/react";
import type { Project, ProjectCategory } from "../../data/projects";
import { getCategories } from "../../lib/projects";
import ProjectCard from "./ProjectCard";

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#B8A0FF]";

const listVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

type Filter = "all" | ProjectCategory;

/**
 * The cards, revealed with a gentle stagger the first time they scroll into view. With `filterable`, a row
 * of category buttons (built from the categories actually used by the projects) is shown above the grid.
 */
export default function ProjectGrid({
  projects,
  filterable = false,
}: {
  projects: readonly Project[];
  filterable?: boolean;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const categories = getCategories(projects);
  const showFilters = filterable && categories.length > 1;
  const visible = filter === "all" ? projects : projects.filter((p) => p.category === filter);

  return (
    <MotionConfig reducedMotion="user">
      {showFilters && (
        <div role="group" aria-label="Filter projects by category" className="mb-8 flex flex-wrap gap-2">
          {(["all", ...categories] as Filter[]).map((f) => {
            const selected = filter === f;
            const count = f === "all" ? projects.length : projects.filter((p) => p.category === f).length;
            return (
              <button
                key={f}
                type="button"
                aria-pressed={selected}
                onClick={() => setFilter(f)}
                className={`inline-flex min-h-10 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors duration-200 ${focusRing} ${
                  selected
                    ? "border-[#B8A0FF] bg-[#B8A0FF] text-[#100F17]"
                    : "border-[#343044] bg-[#1B1926]/60 text-[#A6A0B5] hover:border-[#B8A0FF]/50 hover:text-[#F2F0F7]"
                }`}
              >
                {f === "all" ? "All" : f}
                <span className="text-xs tabular-nums opacity-70">{count}</span>
              </button>
            );
          })}
        </div>
      )}

      {showFilters && (
        <p role="status" className="sr-only">
          Showing {visible.length} {visible.length === 1 ? "project" : "projects"}
        </p>
      )}

      <AnimatePresence mode="wait">
        <motion.ul
          key={filter}
          variants={listVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "0px 0px -10% 0px" }}
          exit={{ opacity: 0, transition: { duration: 0.18, ease: "easeIn" } }}
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {visible.map((project) => (
            <motion.li key={project.id} variants={itemVariants} className="min-w-0">
              <ProjectCard project={project} />
            </motion.li>
          ))}
        </motion.ul>
      </AnimatePresence>
    </MotionConfig>
  );
}