"use client";

import type { IconType } from "react-icons";
import { MotionConfig, motion, type Variants } from "motion/react";
import { FiArrowUpRight, FiCheckCircle, FiGithub, FiLinkedin, FiMail, FiMapPin } from "react-icons/fi";
import { CONTACT } from "../../data/contact";
import { safeEmail, safeHttpUrl } from "../../lib/contact";

const listVariants: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

type InfoItem = {
  key: string;
  label: string;
  value: string;
  icon: IconType;
  href?: string;
  /** Opens in a new tab (profile links). Email links do not. */
  external?: boolean;
  /** The value has not been filled in yet (only ever shown while developing). */
  missing?: boolean;
};

/** "https://github.com/name" to "github.com/name" for display. */
function display(url: string): string {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

const SHOW_MISSING = process.env.NODE_ENV === "development";

function buildItems(): InfoItem[] {
  const email = safeEmail(CONTACT.email);
  const github = safeHttpUrl(CONTACT.githubUrl);
  const linkedin = safeHttpUrl(CONTACT.linkedinUrl);

  const items: InfoItem[] = [
    email
      ? { key: "email", label: "Email", value: email, icon: FiMail, href: `mailto:${email}` }
      : { key: "email", label: "Email", value: "Not set yet: add it in data/contact.ts", icon: FiMail, missing: true },
    github
      ? { key: "github", label: "GitHub", value: display(github), icon: FiGithub, href: github, external: true }
      : { key: "github", label: "GitHub", value: "Not set yet: add it in data/contact.ts", icon: FiGithub, missing: true },
    linkedin
      ? { key: "linkedin", label: "LinkedIn", value: display(linkedin), icon: FiLinkedin, href: linkedin, external: true }
      : { key: "linkedin", label: "LinkedIn", value: "Not set yet: add it in data/contact.ts", icon: FiLinkedin, missing: true },
    { key: "location", label: "Location", value: CONTACT.location, icon: FiMapPin },
  ];

  // On the live site, anything not filled in is simply left out rather than shown half-finished.
  return items.filter((item) => !item.missing || SHOW_MISSING);
}

const cardBase =
  "group relative flex items-center gap-4 rounded-2xl border bg-[#1B1926]/70 p-4 transition-[translate,border-color,box-shadow] duration-300 ease-out";
const cardLive =
  "border-[#343044] hover:-translate-y-0.5 hover:border-[#B8A0FF]/50 hover:shadow-[0_14px_34px_-16px_rgba(184,160,255,0.40)] focus-visible:-translate-y-0.5 focus-visible:border-[#B8A0FF]/60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#B8A0FF] motion-reduce:transition-none motion-reduce:hover:translate-y-0";

function InfoCard({ item }: { item: InfoItem }) {
  const Icon = item.icon;
  const inner = (
    <>
      <span
        className={`grid size-11 shrink-0 place-items-center rounded-xl border bg-[#B8A0FF]/10 text-[#B8A0FF] transition-colors duration-300 ${
          item.missing ? "border-[#343044]" : "border-[#B8A0FF]/25 group-hover:border-[#B8A0FF]/55"
        }`}
      >
        <Icon aria-hidden="true" className="size-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-medium uppercase tracking-[0.16em] text-[#A6A0B5]">{item.label}</span>
        <span className={`mt-1 block break-words text-base ${item.missing ? "text-[#A6A0B5]" : "text-[#F2F0F7]"}`}>
          {item.value}
        </span>
      </span>
      {item.href && (
        <FiArrowUpRight
          aria-hidden="true"
          className="size-4 shrink-0 text-[#A6A0B5] transition-[translate,color] duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#B8A0FF] motion-reduce:transition-none motion-reduce:group-hover:translate-x-0 motion-reduce:group-hover:translate-y-0"
        />
      )}
    </>
  );

  if (item.href) {
    return (
      <a
        href={item.href}
        {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        className={`${cardBase} ${cardLive}`}
      >
        {inner}
        {item.external && <span className="sr-only">(opens in a new tab)</span>}
      </a>
    );
  }
  return <div className={`${cardBase} ${item.missing ? "border-dashed border-[#343044]" : "border-[#343044]"}`}>{inner}</div>;
}

/** The left column: where to find me, and whether I am available. */
export default function ContactInfo() {
  const items = buildItems();

  return (
    <MotionConfig reducedMotion="user">
      <div>
        <motion.ul
          variants={listVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "0px 0px -10% 0px" }}
          aria-label="Contact details"
          className="space-y-3"
        >
          {items.map((item) => (
            <motion.li key={item.key} variants={itemVariants}>
              <InfoCard item={item} />
            </motion.li>
          ))}
        </motion.ul>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "0px 0px -10% 0px" }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.35 }}
          className="mt-5 flex items-start gap-3 rounded-2xl border border-[#B8A0FF]/25 bg-[#B8A0FF]/5 p-4 text-base leading-relaxed text-[#F2F0F7]"
        >
          <FiCheckCircle aria-hidden="true" className="mt-1 size-4 shrink-0 text-[#B8A0FF]" />
          {CONTACT.availability}
        </motion.p>
      </div>
    </MotionConfig>
  );
}