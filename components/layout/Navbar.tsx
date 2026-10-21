"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { FiArrowUpRight, FiMenu, FiTerminal, FiX } from "react-icons/fi";

type NavLink = {
  label: string;
  id: string;
  /**
   * Home-page sections use "/#id" so they also work from other pages (like /contact): from the home page they
   * scroll, from elsewhere they go home first. Contact is a page of its own.
   */
  href: string;
};

const NAV_LINKS: readonly NavLink[] = [
  { label: "Home", id: "home", href: "/#home" },
  { label: "About", id: "about", href: "/about" },
  { label: "Skills", id: "skills", href: "/#skills" },
  { label: "Projects", id: "projects", href: "/#projects" },
  { label: "Contact", id: "contact", href: "/contact" },
] as const;

const CONTACT_HREF = "/contact";

// Only the links that point at sections of the home page take part in the scroll highlighting.
const SECTION_IDS: readonly string[] = NAV_LINKS.filter((l) => l.href.startsWith("/#")).map((l) => l.id);

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B8A0FF]";

function useActiveSection(ids: readonly string[]): string {
  const [active, setActive] = useState<string>(ids[0]);

  useEffect(() => {
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    // Highlights the section crossing the middle band of the viewport.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [ids]);

  return active;
}

export default function Navbar() {
  const [open, setOpen] = useState<boolean>(false);
  const pathname = usePathname();
  const sectionId = useActiveSection(SECTION_IDS);
  const onHome = pathname === "/";

  /** "location" for the home-page section in view, "page" for the page you are on, otherwise nothing. */
  const currentFor = (link: NavLink): "page" | "location" | undefined => {
    if (link.href === pathname) return "page";
    if (onHome && link.href.startsWith("/#") && sectionId === link.id) return "location";
    return undefined;
  };

  const close = () => setOpen(false);

  // Close the menu with Escape.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  // Close the menu if the viewport grows to desktop width.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) setOpen(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="fixed inset-x-0 top-0 z-50 px-4 pt-4"
      >
        <div className="relative mx-auto max-w-5xl">
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-[#343044] bg-[#100F17]/75 px-3 py-2.5 shadow-lg shadow-black/30 backdrop-blur-md sm:px-4">
            {/* Brand */}
            <Link
              href="/#home"
              onClick={close}
              aria-label="Sanjeev Kaushik, back to top"
              className={`group flex items-center gap-2.5 rounded-lg ${focusRing}`}
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-[#B8A0FF]/25 bg-[#B8A0FF]/10 text-[#B8A0FF] transition-colors duration-200 group-hover:bg-[#B8A0FF]/20">
                <FiTerminal aria-hidden="true" className="size-4" />
              </span>
              <span className="whitespace-nowrap text-sm font-semibold tracking-tight text-[#F2F0F7] transition-colors duration-200 group-hover:text-[#B8A0FF] sm:text-base">
                Sanjeev Kaushik
              </span>
            </Link>

            {/* Desktop navigation */}
            <nav aria-label="Primary" className="hidden md:block">
              <ul className="flex items-center gap-1">
                {NAV_LINKS.map((link) => {
                  const current = currentFor(link);
                  const isActive = current !== undefined;
                  return (
                    <li key={link.id}>
                      <Link
                        href={link.href}
                        aria-current={current}
                        className={`relative block rounded-lg px-3.5 py-2 text-sm font-medium transition-colors duration-200 hover:text-[#F2F0F7] ${focusRing} ${isActive ? "text-[#F2F0F7]" : "text-[#A6A0B5]"
                          }`}
                      >
                        {link.label}
                        {isActive && (
                          <motion.span
                            layoutId="nav-active-indicator"
                            aria-hidden="true"
                            transition={{ duration: 0.25, ease: "easeOut" }}
                            className="absolute inset-x-3.5 -bottom-0.5 h-px bg-[#B8A0FF]"
                          />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Desktop CTA */}
            <Link
              href={CONTACT_HREF}
              className={`hidden items-center gap-1.5 rounded-xl bg-[#B8A0FF] px-4 py-2 text-sm font-semibold text-[#100F17] transition-transform duration-200 hover:-translate-y-0.5 md:inline-flex ${focusRing}`}
            >
              Let&apos;s talk
              <FiArrowUpRight aria-hidden="true" className="size-4" />
            </Link>

            {/* Mobile toggle */}
            <button
              type="button"
              onClick={() => setOpen((prev) => !prev)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              className={`inline-flex size-9 items-center justify-center rounded-lg border border-[#343044] bg-[#1B1926] text-[#F2F0F7] transition-colors duration-200 hover:border-[#B8A0FF]/50 md:hidden ${focusRing}`}
            >
              {open ? (
                <FiX aria-hidden="true" className="size-5" />
              ) : (
                <FiMenu aria-hidden="true" className="size-5" />
              )}
            </button>
          </div>

          {/* Mobile menu */}
          <AnimatePresence>
            {open && (
              <motion.div
                id="mobile-menu"
                key="mobile-menu"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="absolute inset-x-0 top-full mt-2 max-h-[calc(100dvh-5.5rem)] overflow-y-auto rounded-2xl border border-[#343044] bg-[#100F17]/95 p-3 shadow-lg shadow-black/30 backdrop-blur-md md:hidden"
              >
                <nav aria-label="Mobile">
                  <ul className="flex flex-col gap-1">
                    {NAV_LINKS.map((link) => {
                      const current = currentFor(link);
                      const isActive = current !== undefined;
                      return (
                        <li key={link.id}>
                          <Link
                            href={link.href}
                            onClick={close}
                            aria-current={current}
                            className={`block rounded-lg px-3 py-3 text-base font-medium transition-colors duration-200 hover:bg-[#1B1926] hover:text-[#F2F0F7] ${focusRing} ${isActive
                                ? "bg-[#1B1926] text-[#F2F0F7]"
                                : "text-[#A6A0B5]"
                              }`}
                          >
                            {link.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </nav>
                <Link
                  href={CONTACT_HREF}
                  onClick={close}
                  className={`mt-3 flex items-center justify-center gap-1.5 rounded-xl bg-[#B8A0FF] px-4 py-3 text-sm font-semibold text-[#100F17] ${focusRing}`}
                >
                  Let&apos;s talk
                  <FiArrowUpRight aria-hidden="true" className="size-4" />
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.header>
    </MotionConfig>
  );
}