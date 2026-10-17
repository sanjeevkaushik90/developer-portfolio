import type { ContactConfig } from "../../data/contact";
import type { Project } from "../../data/projects";
import { safeEmail, safeHttpUrl } from "../../lib/contact";
import { ABOUT_GOAL, ABOUT_LEARNING, INTERESTS } from "../../app/about/aboutCopy";

/**
 * The commands of the simulated terminal on the About page.
 *
 * This is a SIMULATION. Typing a command only looks it up in the list below and returns text to display;
 * nothing is ever executed, evaluated, fetched or sent anywhere. Unknown input just gets a friendly message.
 *
 * Everything the terminal says comes from content that already exists on the site (the Hero and About copy,
 * data/projects.ts and data/contact.ts), so it cannot drift from, or invent anything beyond, the rest of the page.
 */

export type Tone = "default" | "strong" | "accent" | "muted";

/** A piece of text on one line. With `href` it is a link: internal (a site page) or `external` (opens a new tab). */
export type Segment = { text: string; tone?: Tone; href?: string; external?: boolean };

/** One visible line of output. An empty line (no segments) is a blank spacer. */
export type OutputLine = readonly Segment[];

export type TerminalContext = {
  projects: readonly Project[];
  contact: ContactConfig;
};

export type CommandResult =
  | { kind: "clear" }
  | { kind: "output"; lines: OutputLine[]; known: boolean };

/** Buttons shown above the terminal, in this order. */
export const CHIP_COMMANDS = ["whoami", "focus", "approach", "projects", "contact"] as const;

/** Run one after another, typed out, when the terminal first comes into view. */
export const STARTUP_COMMANDS = ["whoami", "focus", "currently"] as const;

/* -------------------------------------------------------------------------- */
/* Small helpers                                                               */
/* -------------------------------------------------------------------------- */

const t = (text: string, tone?: Tone): Segment => ({ text, tone });
const row = (...segments: Segment[]): OutputLine => segments;
const plain = (text: string, tone?: Tone): OutputLine => [t(text, tone)];
const BLANK: OutputLine = [];

/** The visible text of a line, for screen readers and tests. */
export function lineText(line: OutputLine): string {
  return line.map((s) => s.text).join("");
}

/** "https://github.com/name/" to "github.com/name" for display. */
function display(url: string): string {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

/** Splits a paragraph into its sentences. */
function sentences(paragraph: string): string[] {
  return paragraph.split(/(?<=[.!?])\s+/).filter(Boolean);
}

/* -------------------------------------------------------------------------- */
/* The commands                                                                */
/* -------------------------------------------------------------------------- */

type CommandDef = {
  name: string;
  summary: string;
  run: (ctx: TerminalContext) => OutputLine[];
};

const COMMANDS: readonly CommandDef[] = [
  {
    name: "whoami",
    summary: "who I am",
    run: () => [
      plain("Sanjeev Kaushik", "strong"),
      plain("Developer & Security Enthusiast", "accent"),
      plain("I build software, solve problems, and explore how systems work."),
    ],
  },
  {
    name: "focus",
    summary: "what I work with",
    run: () => INTERESTS.map((interest) => row(t("- ", "muted"), t(interest))),
  },
  {
    name: "currently",
    summary: "what I am doing right now",
    run: () => [plain("Learning by building projects and exploring cybersecurity.")],
  },
  {
    name: "approach",
    summary: "how I learn and work",
    run: () => [
      // The first two sentences of "How I learn" (the third, about right now, is what `currently` says).
      ...sentences(ABOUT_LEARNING)
        .slice(0, 2)
        .map((s) => plain(s)),
      BLANK,
      plain(ABOUT_GOAL),
    ],
  },
  {
    name: "projects",
    summary: "things I am building",
    run: ({ projects }) => {
      if (projects.length === 0) {
        return [row(t("No projects listed yet. Browse the page: "), { text: "/projects", href: "/projects", tone: "accent" })];
      }
      return [
        plain(`Projects (${projects.length}):`, "strong"),
        ...projects.map((p) =>
          row(t("- ", "muted"), { text: p.title, href: `/projects/${p.slug}`, tone: "accent" }, t(`  [${p.status}]`, "muted")),
        ),
        BLANK,
        row(t("All projects: "), { text: "/projects", href: "/projects", tone: "accent" }),
      ];
    },
  },
  {
    name: "contact",
    summary: "how to reach me",
    run: ({ contact }) => {
      const email = safeEmail(contact.email);
      const github = safeHttpUrl(contact.githubUrl);
      const linkedin = safeHttpUrl(contact.linkedinUrl);
      const lines: OutputLine[] = [];
      // Only details that are really set are shown; nothing is made up for the ones that are not.
      if (email) lines.push(row(t("email     ", "muted"), { text: email, href: `mailto:${email}`, tone: "accent" }));
      if (github) lines.push(row(t("github    ", "muted"), { text: display(github), href: github, external: true, tone: "accent" }));
      if (linkedin) lines.push(row(t("linkedin  ", "muted"), { text: display(linkedin), href: linkedin, external: true, tone: "accent" }));
      lines.push(row(t("message   ", "muted"), { text: "/contact", href: "/contact", tone: "accent" }));
      lines.push(plain(contact.availability));
      return lines;
    },
  },
];

const HELP_ROWS: ReadonlyArray<readonly [string, string]> = [
  ...COMMANDS.map((c) => [c.name, c.summary] as const),
  ["help", "show this list"],
  ["clear", "clear the screen"],
];

function helpLines(): OutputLine[] {
  const width = Math.max(...HELP_ROWS.map(([name]) => name.length)) + 2;
  return [
    plain("Available commands:", "strong"),
    ...HELP_ROWS.map(([name, summary]) => row(t(name.padEnd(width), "accent"), t(summary, "muted"))),
    BLANK,
    plain("Tip: press the up and down arrow keys to repeat earlier commands.", "muted"),
  ];
}

/* -------------------------------------------------------------------------- */
/* Running a line of input                                                     */
/* -------------------------------------------------------------------------- */

const KNOWN_NAMES: readonly string[] = [...COMMANDS.map((c) => c.name), "help", "clear"];

/** Number of single-letter edits between two words, used to suggest "did you mean ...?". */
export function editDistance(a: string, b: string): number {
  const prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let diagonal = prev[0];
    prev[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const above = prev[j];
      prev[j] = Math.min(prev[j] + 1, prev[j - 1] + 1, diagonal + (a[i - 1] === b[j - 1] ? 0 : 1));
      diagonal = above;
    }
  }
  return prev[b.length];
}

function suggest(name: string): string | undefined {
  if (name.length < 3) return undefined;
  let best: { name: string; distance: number } | undefined;
  for (const candidate of KNOWN_NAMES) {
    const distance = editDistance(name, candidate);
    if (distance <= 2 && (!best || distance < best.distance)) best = { name: candidate, distance };
  }
  return best?.name;
}

/**
 * Looks up the first word of the input (case-insensitive; any extra words are ignored) and returns what to show.
 * Never evaluates or executes anything: it only reads from the fixed command list.
 */
export function runCommand(input: string, ctx: TerminalContext): CommandResult {
  const first = input.trim().split(/\s+/)[0] ?? "";
  const name = first.toLowerCase();

  if (name === "clear") return { kind: "clear" };
  if (name === "help") return { kind: "output", lines: helpLines(), known: true };

  const command = COMMANDS.find((c) => c.name === name);
  if (command) return { kind: "output", lines: command.run(ctx), known: true };

  const shown = first.length > 40 ? `${first.slice(0, 40)}...` : first;
  const guess = suggest(name);
  return {
    kind: "output",
    known: false,
    lines: [
      row(t("command not found: ", "muted"), t(shown, "strong")),
      ...(guess ? [row(t("Did you mean "), t(guess, "accent"), t("?"))] : []),
      row(t("Type "), t("help", "accent"), t(" to see what I can do. This terminal is a simulation: nothing you type is ever run.")),
    ],
  };
}

/* -------------------------------------------------------------------------- */
/* Command history (the up and down arrow keys)                                */
/* -------------------------------------------------------------------------- */

/**
 * `index` is the position in the history; `history.length` means "the line being typed now" (the draft).
 * Up goes to an older command, down to a newer one, and down past the newest returns to the draft.
 */
export function stepHistory(
  history: readonly string[],
  index: number,
  direction: "up" | "down",
): { index: number; useDraft: boolean } {
  const next = direction === "up" ? Math.max(0, index - 1) : Math.min(history.length, index + 1);
  return { index: next, useDraft: next === history.length };
}

export const HISTORY_LIMIT = 50;

/** Adds a command to the history, skipping an immediate repeat and keeping only the most recent ones. */
export function addToHistory(history: readonly string[], command: string): string[] {
  if (history[history.length - 1] === command) return [...history];
  return [...history, command].slice(-HISTORY_LIMIT);
}