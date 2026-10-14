"use client";

import { motion, type Variants } from "motion/react";
import { FiCode } from "react-icons/fi";
import type { Skill } from "./skillsData";

/** Entrance of one card. The parent section staggers these, so cards arrive one after another. */
const cardVariants: Variants = {
  hidden: { opacity: 0, y: 14, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: "easeOut" } },
};

/**
 * One skill tile. Hover and focus effects are plain CSS (cheap, and they never fight the entrance animation):
 * the tile lifts a few pixels, its border brightens, a soft lavender light appears, and the icon tilts and
 * grows slightly. Tailwind only applies `hover:` styles on devices that really hover, so on a phone nothing
 * gets stuck in a hover state; the name and icon are always visible, and a tap gives a small press effect.
 *
 * The `group-focus-visible` styles mirror the hover ones. The tile is not a tab stop by default (29 of them
 * would make keyboard navigation tedious for something that does nothing when activated); add tabIndex={0}
 * to the <motion.li> below if you want them focusable, and the focus state is already styled.
 */
export default function SkillCard({ skill }: { skill: Skill }) {
  const Icon = skill.icon ?? FiCode; // consistent fallback when a skill has no icon

  return (
    <motion.li
      variants={cardVariants}
      className="group relative rounded-2xl outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#B8A0FF]"
    >
      <div className="relative flex h-full min-h-[7.25rem] flex-col justify-between overflow-hidden rounded-2xl border border-[#343044] bg-[#1B1926]/70 p-4 transition-[translate,scale,border-color,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:border-[#B8A0FF]/50 hover:shadow-[0_14px_34px_-14px_rgba(184,160,255,0.40)] active:scale-[0.98] group-focus-visible:-translate-y-1 group-focus-visible:border-[#B8A0FF]/60 group-focus-visible:shadow-[0_14px_34px_-14px_rgba(184,160,255,0.40)] motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:group-focus-visible:translate-y-0">
        {/* Soft lavender light that appears on hover or focus */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(184,160,255,0.18),transparent_62%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
        />

        <span className="relative grid size-11 place-items-center rounded-xl border border-[#B8A0FF]/20 bg-[#B8A0FF]/10 text-[#B8A0FF] transition-colors duration-300 group-hover:border-[#B8A0FF]/50 group-hover:text-[#F2F0F7] group-focus-visible:border-[#B8A0FF]/50 group-focus-visible:text-[#F2F0F7]">
          <Icon
            aria-hidden="true"
            className="size-6 transition-transform duration-300 ease-out group-hover:-rotate-6 group-hover:scale-110 group-focus-visible:-rotate-6 group-focus-visible:scale-110 motion-reduce:transition-none motion-reduce:group-hover:rotate-0 motion-reduce:group-hover:scale-100 motion-reduce:group-focus-visible:rotate-0 motion-reduce:group-focus-visible:scale-100"
          />
        </span>

        <span className="relative mt-4 text-sm font-medium leading-snug text-[#F2F0F7]">{skill.name}</span>
      </div>
    </motion.li>
  );
}