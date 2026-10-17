"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { motion, useReducedMotion } from "motion/react";

/* -------------------------------------------------------------------------- */
/*  Types & props                                                             */
/* -------------------------------------------------------------------------- */

export type TerminalProject = {
  name: string;
  description: string;
  /** Optional honest status label, e.g. "in progress". Rendered only if given. */
  status?: string;
  /** Only pass a real, existing route. Without it the project shows "no page yet". */
  href?: string;
};

export type InteractiveTerminalProps = {
  projects: TerminalProject[];
  /** Existing contact route or anchor, e.g. "/contact" or "#contact". */
  contactHref?: string;
};

type Entry = { id: number; cmd: string; typed: string; done: boolean };

/* -------------------------------------------------------------------------- */
/*  Commands                                                                  */
/* -------------------------------------------------------------------------- */

const CHIPS = ["whoami", "focus", "approach", "projects", "contact"] as const;
const INITIAL_SEQUENCE = ["whoami", "focus", "currently"];
const KNOWN = new Set([...CHIPS, "currently", "help", "clear"]);

const HELP: [string, string][] = [
  ["whoami", "who I am"],
  ["focus", "what I focus on"],
  ["approach", "how I work"],
  ["currently", "what I'm building now"],
  ["projects", "project links"],
  ["contact", "get in touch"],
  ["help", "show this list"],
  ["clear", "clear the terminal"],
];

const TYPE_MS = 28; // per character
const GAP_MS = 220; // pause between auto-run commands
const MAX_INPUT = 40;

/* Syntax colours: palette tokens + two soft supporting tones. */
const C = {
  accent: "text-[#B8A0FF]",
  text: "text-[#F2F0F7]",
  muted: "text-[#A6A0B5]",
  string: "text-[#8FD6B5]",
  warn: "text-[#E6C79C]",
};

/* -------------------------------------------------------------------------- */
/*  Output renderer (pure, simulated: no shell, fs, or env access)            */
/* -------------------------------------------------------------------------- */

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B8A0FF]";

function renderOutput(
  cmd: string,
  projects: TerminalProject[],
  contactHref?: string
): ReactNode {
  switch (cmd) {
    case "whoami":
      return (
        <p className={C.text}>
          <span className={`${C.accent} font-semibold`}>Sanjeev Kaushik</span>{" "}
          <span className={C.muted}>—</span> Developer focused on{" "}
          <span className={C.string}>Python</span>,{" "}
          <span className={C.string}>backend systems</span>, and{" "}
          <span className={C.string}>cybersecurity</span>.
        </p>
      );

    case "focus":
      return (
        <ul className="space-y-0.5">
          {[
            "Python and backend development",
            "Cybersecurity fundamentals",
            "Building practical software tools",
          ].map((item) => (
            <li key={item} className="flex gap-2">
              <span aria-hidden className={C.accent}>
                ▸
              </span>
              <span className={C.text}>{item}</span>
            </li>
          ))}
        </ul>
      );

    case "approach":
      return (
        <p className={C.text}>
          Learn by building <span className={C.accent}>→</span> Understand
          systems deeply <span className={C.accent}>→</span> Make things safer.
        </p>
      );

    case "currently":
      return (
        <ul className="space-y-0.5">
          {[
            "Python Code Visualizer — step-through execution",
            "Android Security Lab",
            "Full-stack development tools",
          ].map((item) => (
            <li key={item} className="flex gap-2">
              <span aria-hidden className={C.warn}>
                ●
              </span>
              <span className={C.text}>{item}</span>
            </li>
          ))}
        </ul>
      );

    case "projects":
      return (
        <ul className="space-y-2">
          {projects.map((p) => (
            <li key={p.name}>
              <div className="flex flex-wrap items-baseline gap-x-2">
                {p.href ? (
                  <Link
                    href={p.href}
                    className={`${C.accent} rounded-sm font-semibold underline decoration-[#B8A0FF]/40 underline-offset-4 hover:decoration-[#B8A0FF] ${focusRing}`}
                  >
                    {p.name}
                  </Link>
                ) : (
                  <span className={`${C.text} font-semibold`}>{p.name}</span>
                )}
                {p.status && (
                  <span className={`${C.warn} text-xs`}>[{p.status}]</span>
                )}
                {!p.href && (
                  <span className={`${C.muted} text-xs`}>(no page yet)</span>
                )}
              </div>
              <p className={C.muted}>{p.description}</p>
            </li>
          ))}
        </ul>
      );

    case "contact":
      return contactHref ? (
        <p className={C.text}>
          Say hello →{" "}
          <Link
            href={contactHref}
            className={`${C.accent} rounded-sm underline decoration-[#B8A0FF]/40 underline-offset-4 hover:decoration-[#B8A0FF] ${focusRing}`}
          >
            Contact me
          </Link>
        </p>
      ) : (
        <p className={C.muted}>Contact link is not configured yet.</p>
      );

    case "help":
      return (
        <div className="space-y-2">
          <dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-0.5">
            {HELP.map(([name, desc]) => (
              <div key={name} className="contents">
                <dt className={C.accent}>{name}</dt>
                <dd className={C.muted}>{desc}</dd>
              </div>
            ))}
          </dl>
          <p className={C.muted}>
            Tip: you don&apos;t need to type. Click any command chip below the
            terminal.
          </p>
        </div>
      );

    default:
      return (
        <p>
          <span className={C.warn}>command not found:</span>{" "}
          <span className={C.text}>{cmd}</span>
          <span className={C.muted}> — type </span>
          <span className={C.accent}>help</span>
          <span className={C.muted}> to see available commands.</span>
        </p>
      );
  }
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export default function InteractiveTerminal({
  projects,
  contactHref,
}: InteractiveTerminalProps) {
  const reduceMotion = useReducedMotion();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [value, setValue] = useState("");

  const tokenRef = useRef(0); // bumping this cancels any in-flight animation
  const idRef = useRef(0);
  const historyRef = useRef<string[]>([]);
  const historyIdxRef = useRef(-1);
  const scrollRef = useRef<HTMLDivElement>(null);

  const run = useCallback(
    async (
      cmds: string[],
      opts: { animate?: boolean; reset?: boolean } = {}
    ) => {
      const { animate = true, reset = false } = opts;
      const token = ++tokenRef.current; // supersedes any earlier run
      const reduce =
        window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
        !animate;
      const sleep = (ms: number) =>
        new Promise<void>((resolve) => setTimeout(resolve, ms));

      // Instantly finish whatever was mid-typing so animations never overlap.
      setEntries((es) =>
        reset
          ? []
          : es.map((e) => (e.done ? e : { ...e, typed: e.cmd, done: true }))
      );
      if (reset) setActive(null);

      for (const cmd of cmds) {
        if (cmd === "clear") {
          setEntries([]);
          setActive(null);
          continue;
        }

        const id = ++idRef.current;
        setActive(KNOWN.has(cmd) ? cmd : null);

        if (reduce) {
          setEntries((es) => [...es, { id, cmd, typed: cmd, done: true }]);
          continue;
        }

        setEntries((es) => [...es, { id, cmd, typed: "", done: false }]);
        for (let i = 1; i <= cmd.length; i++) {
          await sleep(TYPE_MS);
          if (token !== tokenRef.current) return;
          setEntries((es) =>
            es.map((e) => (e.id === id ? { ...e, typed: cmd.slice(0, i) } : e))
          );
        }
        await sleep(120);
        if (token !== tokenRef.current) return;
        setEntries((es) =>
          es.map((e) => (e.id === id ? { ...e, done: true } : e))
        );
        await sleep(GAP_MS);
        if (token !== tokenRef.current) return;
      }
    },
    []
  );

  // Auto-run the intro sequence once; cancel on unmount (also safe in StrictMode).
  useEffect(() => {
    void run(INITIAL_SEQUENCE, { animate: true, reset: true });
    return () => {
      tokenRef.current++;
    };
  }, [run]);

  // Keep the newest output visible, scrolling only the terminal body.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [entries]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const cmd = value.trim().toLowerCase().slice(0, MAX_INPUT);
    if (!cmd) return;
    historyRef.current.push(cmd);
    historyIdxRef.current = -1;
    setValue("");
    void run([cmd], { animate: false });
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const h = historyRef.current;
    if (e.key === "ArrowUp" && h.length) {
      e.preventDefault();
      const next =
        historyIdxRef.current === -1
          ? h.length - 1
          : Math.max(0, historyIdxRef.current - 1);
      historyIdxRef.current = next;
      setValue(h[next]);
    } else if (e.key === "ArrowDown" && historyIdxRef.current !== -1) {
      e.preventDefault();
      const next = historyIdxRef.current + 1;
      if (next >= h.length) {
        historyIdxRef.current = -1;
        setValue("");
      } else {
        historyIdxRef.current = next;
        setValue(h[next]);
      }
    }
  };

  return (
    <section aria-labelledby="terminal-heading" className="w-full">
      <h2 id="terminal-heading" className="sr-only">
        Interactive terminal
      </h2>

      <div className="overflow-hidden rounded-xl border border-[#343044] bg-[#100F17] shadow-lg shadow-black/30">
        {/* Title bar */}
        <div className="flex items-center gap-3 border-b border-[#343044] bg-[#1B1926] px-4 py-2.5">
          <div aria-hidden className="flex gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[#FF6B6B]/80" />
            <span className="h-3 w-3 rounded-full bg-[#E6C79C]/80" />
            <span className="h-3 w-3 rounded-full bg-[#8FD6B5]/80" />
          </div>
          <span className="truncate font-mono text-xs text-[#A6A0B5]">
            sanjeev@portfolio: ~/about
          </span>
        </div>

        {/* Output */}
        <div
          ref={scrollRef}
          role="log"
          aria-live="polite"
          aria-label="Terminal output"
          className="h-[320px] space-y-3 overflow-y-auto p-4 font-mono text-[13px] leading-relaxed sm:h-[360px] sm:p-5 sm:text-sm"
        >
          {entries.length === 0 && (
            <p className={C.muted}>
              Terminal cleared. Click a command below or type{" "}
              <span className={C.accent}>help</span>.
            </p>
          )}

          {entries.map((e) => (
            <div key={e.id}>
              <p className="flex gap-2">
                <span aria-hidden className={C.accent}>
                  $
                </span>
                {/* Screen readers get the full command; the animated copy is hidden. */}
                <span className="sr-only">{e.cmd}</span>
                <span aria-hidden className={`${C.text} break-all`}>
                  {e.typed}
                  {!e.done && (
                    <span className="ml-0.5 inline-block h-4 w-2 translate-y-0.5 bg-[#B8A0FF] motion-safe:animate-pulse" />
                  )}
                </span>
              </p>
              {e.done && (
                <motion.div
                  initial={reduceMotion ? false : { opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18 }}
                  className="mt-1.5 border-l border-[#343044] pl-4"
                >
                  {renderOutput(e.cmd, projects, contactHref)}
                </motion.div>
              )}
            </div>
          ))}
        </div>

        {/* Optional manual input */}
        <form
          onSubmit={onSubmit}
          className="flex items-center gap-2 border-t border-[#343044] bg-[#1B1926] px-4 py-2.5 font-mono"
        >
          <span aria-hidden className={`${C.accent} text-sm`}>
            $
          </span>
          <label htmlFor="terminal-input" className="sr-only">
            Terminal command
          </label>
          <input
            id="terminal-input"
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            maxLength={MAX_INPUT}
            autoComplete="off"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            aria-describedby="terminal-hint"
            className="min-w-0 flex-1 rounded-sm bg-transparent text-base text-[#F2F0F7] caret-[#B8A0FF] outline-none placeholder:text-[#A6A0B5]/60 focus-visible:ring-2 focus-visible:ring-[#B8A0FF]/60 sm:text-sm"
          />
        </form>
      </div>

      <p id="terminal-hint" className="mt-3 text-sm text-[#A6A0B5]">
        Type a command or click one below
      </p>

      {/* Command chips */}
      <ul className="mt-2 flex flex-wrap gap-2" aria-label="Terminal commands">
        {CHIPS.map((c) => {
          const isActive = active === c;
          return (
            <li key={c}>
              <button
                type="button"
                aria-pressed={isActive}
                onClick={() => void run([c], { animate: true })}
                className={`rounded-md border px-3 py-1.5 font-mono text-sm transition-colors ${focusRing} ${isActive
                    ? "border-[#B8A0FF] bg-[#B8A0FF]/15 text-[#B8A0FF]"
                    : "border-[#343044] bg-[#1B1926] text-[#A6A0B5] hover:border-[#B8A0FF]/60 hover:text-[#F2F0F7]"
                  }`}
              >
                {c}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}