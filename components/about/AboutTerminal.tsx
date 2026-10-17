"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import Link from "next/link";
import { useInView, useReducedMotion } from "motion/react";
import { FiTerminal } from "react-icons/fi";
import { CONTACT } from "../../data/contact";
import { getAllProjects } from "../../lib/projects";
import {
  CHIP_COMMANDS,
  STARTUP_COMMANDS,
  addToHistory,
  lineText,
  runCommand,
  stepHistory,
  type OutputLine,
  type Segment,
  type Tone,
} from "./terminalCommands";

/* -------------------------------------------------------------------------- */
/* Timing (all skipped when the visitor prefers reduced motion)                */
/* -------------------------------------------------------------------------- */

const TYPE_MS = 38; // per typed character
const AFTER_TYPE_MS = 180; // short pause before the output appears
const LINE_MS = 55; // between output lines
const MAX_REVEAL_MS = 700; // a long output never takes longer than this to appear
const BETWEEN_MS = 450; // between the three commands of the intro
const MAX_ENTRIES = 30; // older commands scroll away so the page does not grow without limit

const sleep = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

/* -------------------------------------------------------------------------- */
/* Transcript                                                                  */
/* -------------------------------------------------------------------------- */

type Entry = {
  id: number;
  command: string;
  lines: readonly OutputLine[];
  /** How many lines are visible so far (the output appears line by line). */
  shown: number;
};

/** Shows every line of every entry. Used when an animation is cancelled, so nothing is left half printed. */
function finishAll(entries: Entry[]): Entry[] {
  return entries.some((e) => e.shown < e.lines.length)
    ? entries.map((e) => (e.shown < e.lines.length ? { ...e, shown: e.lines.length } : e))
    : entries;
}

function spoken(lines: readonly OutputLine[]): string {
  return lines
    .map(lineText)
    .filter((text) => text.trim() !== "")
    .join(" ");
}

const TONE_CLASS: Record<Tone, string> = {
  default: "text-[#F2F0F7]",
  strong: "font-semibold text-[#F2F0F7]",
  accent: "text-[#B8A0FF]",
  muted: "text-[#A6A0B5]",
};

const linkClass =
  "underline decoration-[#B8A0FF]/40 underline-offset-2 transition-colors duration-200 hover:text-[#F2F0F7] hover:decoration-[#F2F0F7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B8A0FF]";

function SegmentView({ segment }: { segment: Segment }) {
  const tone = TONE_CLASS[segment.tone ?? "default"];
  if (!segment.href) return <span className={tone}>{segment.text}</span>;

  if (segment.external) {
    return (
      <a href={segment.href} target="_blank" rel="noopener noreferrer" className={`${tone} ${linkClass}`}>
        {segment.text}
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    );
  }
  if (segment.href.startsWith("mailto:")) {
    return (
      <a href={segment.href} className={`${tone} ${linkClass}`}>
        {segment.text}
      </a>
    );
  }
  return (
    <Link href={segment.href} className={`${tone} ${linkClass}`}>
      {segment.text}
    </Link>
  );
}

function LineView({ line }: { line: OutputLine }) {
  // An empty line is a blank spacer, so give it a height.
  if (line.length === 0) return <div className="h-[1.4em]" aria-hidden="true" />;
  return (
    <div className="whitespace-pre-wrap break-words">
      {line.map((segment, i) => (
        <SegmentView key={i} segment={segment} />
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* The terminal                                                                */
/* -------------------------------------------------------------------------- */

type ExecuteOptions = {
  /** "user": the visitor asked for it (cancels the intro). "intro": the automatic start-up sequence. */
  source: "user" | "intro";
  /** Type the command out letter by letter first (used for the intro and for the buttons). */
  typeIt: boolean;
  /** Tell screen readers the result when it is done. */
  announce: boolean;
};

const chipClass =
  "inline-flex min-h-9 items-center rounded-full border border-[#343044] bg-[#1B1926]/60 px-3.5 font-mono text-xs text-[#A6A0B5] transition-colors duration-200 hover:border-[#B8A0FF]/50 hover:text-[#F2F0F7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B8A0FF] active:border-[#B8A0FF]";

/**
 * A SIMULATED terminal. Commands are looked up in a fixed list (see terminalCommands.ts) and only produce text;
 * nothing the visitor types is ever executed, evaluated, fetched or sent anywhere.
 */
export default function AboutTerminal() {
  const reduce = useReducedMotion() ?? false;
  const reduceRef = useRef(reduce);
  useEffect(() => {
    reduceRef.current = reduce;
  }, [reduce]);

  const headingId = useId();
  const noteId = useId();
  const inputId = useId();

  const rootRef = useRef<HTMLElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const inView = useInView(rootRef, { once: true, amount: 0.35 });

  const [entries, setEntries] = useState<Entry[]>([]);
  /** The command being typed out by an animation (shown on its own line, hidden from screen readers). */
  const [ghost, setGhost] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [announcement, setAnnouncement] = useState<{ id: number; text: string } | null>(null);

  // Whatever is animating checks this number after every pause. Starting anything new changes it, which
  // cancels the older animation, so two animations can never run (or print) at the same time.
  const runRef = useRef(0);
  const entryIdRef = useRef(0);
  const announceIdRef = useRef(0);
  const introDoneRef = useRef(false);
  const historyRef = useRef<string[]>([]);
  const historyIndexRef = useRef(0); // equal to the history length means "the line being typed now"
  const draftRef = useRef("");

  const execute = useCallback(async (raw: string, opts: ExecuteOptions): Promise<boolean> => {
    const command = raw.trim();
    if (!command) return false;
    if (opts.source === "user") introDoneRef.current = true;

    const run = ++runRef.current; // cancels anything still animating
    setGhost(null);
    setEntries(finishAll); // a cancelled command still shows its full output

    const animate = !reduceRef.current;

    if (opts.typeIt && animate) {
      for (let i = 1; i <= command.length; i++) {
        setGhost(command.slice(0, i));
        await sleep(TYPE_MS);
        if (runRef.current !== run) return false;
      }
      await sleep(AFTER_TYPE_MS);
      if (runRef.current !== run) return false;
      setGhost(null);
    }

    // Only commands the visitor ran themselves are remembered; the automatic intro is not their history.
    if (opts.source === "user") {
      historyRef.current = addToHistory(historyRef.current, command);
      historyIndexRef.current = historyRef.current.length;
      draftRef.current = "";
    }

    const announce = (text: string) => setAnnouncement({ id: ++announceIdRef.current, text });
    const result = runCommand(command, { projects: getAllProjects(), contact: CONTACT });

    if (result.kind === "clear") {
      setEntries([]);
      if (opts.announce) announce("Screen cleared.");
      return true;
    }

    const id = ++entryIdRef.current;
    const lines = result.lines;
    setEntries((prev) =>
      [...finishAll(prev), { id, command, lines, shown: animate ? 0 : lines.length }].slice(-MAX_ENTRIES),
    );

    if (animate) {
      const step = Math.max(20, Math.min(LINE_MS, Math.floor(MAX_REVEAL_MS / Math.max(1, lines.length))));
      for (let n = 1; n <= lines.length; n++) {
        await sleep(step);
        if (runRef.current !== run) return false;
        setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, shown: n } : e)));
      }
    }

    if (opts.announce) announce(`${command}. ${spoken(lines)}`);
    return true;
  }, []);

  // The intro: when the terminal first scrolls into view, type out whoami, focus and currently, one after another.
  // It stops for good the moment the visitor does anything themselves.
  useEffect(() => {
    if (!inView || introDoneRef.current) return;
    let active = true;
    void (async () => {
      for (const command of STARTUP_COMMANDS) {
        const finished = await execute(command, { source: "intro", typeIt: true, announce: false });
        if (!active || !finished) return;
        const mark = runRef.current;
        if (!reduceRef.current) await sleep(BETWEEN_MS);
        if (!active || runRef.current !== mark) return;
      }
      introDoneRef.current = true;
    })();
    return () => {
      active = false;
      runRef.current += 1; // also cancels the intro if the page is left
    };
  }, [inView, execute]);

  // Keep the newest line in view, by scrolling only the terminal itself (never the page).
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [entries, ghost]);

  const stopAnimation = useCallback(() => {
    introDoneRef.current = true;
    runRef.current += 1;
    setGhost(null);
    setEntries(finishAll);
  }, []);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = input.trim();
    setInput("");
    if (!value) return;
    void execute(value, { source: "user", typeIt: false, announce: true });
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;

    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      const history = historyRef.current;
      if (history.length === 0) return;
      event.preventDefault();
      if (historyIndexRef.current === history.length) draftRef.current = input; // remember what was being typed
      const step = stepHistory(history, historyIndexRef.current, event.key === "ArrowUp" ? "up" : "down");
      historyIndexRef.current = step.index;
      setInput(step.useDraft ? draftRef.current : history[step.index]);
    } else if (event.key === "Escape") {
      stopAnimation(); // lets a visitor skip an animation without leaving the keyboard
    }
  };

  // Clicking empty space inside the terminal puts the cursor in the input, like a real terminal.
  const onBodyClick = (event: MouseEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("a, button, input")) return;
    if (window.getSelection()?.toString()) return; // do not interrupt selecting text to copy it
    inputRef.current?.focus();
  };

  return (
    <section ref={rootRef} aria-labelledby={headingId} className="w-full">
      <h2 id={headingId} className="text-xl font-semibold tracking-tight text-[#F2F0F7]">
        Explore with a terminal
      </h2>
      <p id={noteId} className="mt-3 max-w-[62ch] text-base leading-relaxed text-[#A6A0B5] sm:text-lg">
        A simulated terminal: click a command or type one. Nothing you type is ever run.
      </p>

      <div className="mt-5 overflow-hidden rounded-2xl border border-[#343044] bg-[#100F17] shadow-[0_0_48px_-20px_rgba(184,160,255,0.30)]">
        <div className="flex items-center gap-2 border-b border-[#343044] bg-[#1B1926] px-4 py-2.5">
          <FiTerminal aria-hidden="true" className="size-4 text-[#B8A0FF]" />
          <span className="font-mono text-xs text-[#A6A0B5]">guest@portfolio</span>
          <span className="ml-auto font-mono text-xs text-[#A6A0B5]">simulated</span>
        </div>

        <div role="group" aria-label="Quick commands" className="flex flex-wrap gap-2 border-b border-[#343044] px-4 py-3">
          {CHIP_COMMANDS.map((command) => (
            <button
              key={command}
              type="button"
              aria-label={`Run command ${command}`}
              onClick={() => void execute(command, { source: "user", typeIt: true, announce: true })}
              className={chipClass}
            >
              {command}
            </button>
          ))}
        </div>

        {/* The terminal itself. It can scroll, so it is a keyboard-focusable region. */}
        <div
          ref={scrollRef}
          role="region"
          aria-label="Terminal"
          aria-describedby={noteId}
          tabIndex={0}
          onClick={onBodyClick}
          className="max-h-80 min-h-56 overflow-y-auto px-4 py-4 font-mono text-[13px] leading-relaxed focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#B8A0FF] sm:text-sm"
        >
          {entries.map((entry) => (
            <div key={entry.id} className="mb-3">
              <div className="flex gap-2">
                <span aria-hidden="true" className="select-none text-[#B8A0FF]">
                  $
                </span>
                <span className="break-all text-[#F2F0F7]">{entry.command}</span>
              </div>
              <div className="mt-1 pl-4">
                {entry.lines.slice(0, entry.shown).map((line, i) => (
                  <LineView key={i} line={line} />
                ))}
              </div>
            </div>
          ))}

          {/* Text being typed out by an animation: purely visual, so screen readers skip it */}
          {ghost !== null && (
            <div aria-hidden="true" className="mb-3 flex gap-2">
              <span className="select-none text-[#B8A0FF]">$</span>
              <span className="break-all text-[#F2F0F7]">
                {ghost}
                <span className="ml-0.5 inline-block h-[1.1em] w-[0.5em] translate-y-[0.2em] bg-[#B8A0FF]" />
              </span>
            </div>
          )}

          <form
            onSubmit={onSubmit}
            className="flex items-center gap-2 rounded focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[#B8A0FF]"
          >
            <label htmlFor={inputId} className="sr-only">
              Terminal command. Press Enter to run it, or the up and down arrow keys for earlier commands.
            </label>
            <span aria-hidden="true" className="select-none text-[#B8A0FF]">
              $
            </span>
            <input
              ref={inputRef}
              id={inputId}
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={onKeyDown}
              autoComplete="off"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint="go"
              placeholder='try "help"'
              className="min-w-0 flex-1 bg-transparent text-base text-[#F2F0F7] caret-[#B8A0FF] outline-none placeholder:text-[#A6A0B5] sm:text-sm"
            />
          </form>
        </div>
      </div>

      {/* Tells screen readers what a command printed, once, when it has finished */}
      <div role="status" aria-live="polite" className="sr-only">
        {announcement && <p key={announcement.id}>{announcement.text}</p>}
      </div>
    </section>
  );
}