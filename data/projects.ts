/**
 * ALL PROJECT CONTENT LIVES IN THIS FILE.
 *
 * To add, edit or remove a project, change only the PROJECTS list below. The projects page, the cards on
 * the home page, the category filter and every /projects/<slug> detail page are generated from it, so you
 * never need to touch a component. A ready-to-copy template is at the bottom of this file.
 *
 * Images go in the public folder, one folder per project, and are referenced by their path from /public:
 *
 *   public/images/projects/python-visualizer/cover.png     ->  "/images/projects/python-visualizer/cover.png"
 *
 * If an image is missing (or you have not added one yet), the card shows a clearly labelled placeholder
 * instead of a broken image. Never use a placeholder as if it were a real screenshot: set
 * `imageIsPlaceholder: true` on any illustrative image so it is labelled as one.
 */

/* -------------------------------------------------------------------------- */
/* Types. TypeScript checks every project below against these.                 */
/* -------------------------------------------------------------------------- */

/** To use a new category, add it here once; it then appears automatically as a filter. */
export const PROJECT_CATEGORIES = ["Web Development", "Backend", "Cybersecurity", "Developer Tools"] as const;
export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number];

export const PROJECT_STATUSES = ["Planned", "In Progress", "Completed", "Demo"] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export type ProjectImage = {
  /** Path inside /public, starting with a slash, e.g. "/images/projects/my-app/editor.png". */
  src: string;
  /** Describes the image for screen readers. If left out, a generic description is generated. */
  alt?: string;
  caption?: string;
  /** True for an illustrative image that is not a real screenshot; it is then labelled as a placeholder. */
  isPlaceholder?: boolean;
};

/**
 * A plain string is a PLANNED feature. Use { text, done: true } only once the feature really works, so the
 * page never claims something is built before it is.
 */
export type ProjectFeature = string | { text: string; done: boolean };

export type Project = {
  /** Unique identifier. Also a good name for the project's image folder. */
  id: string;
  title: string;
  /** Unique, URL-friendly name: lowercase letters, numbers and hyphens. The page will be /projects/<slug>. */
  slug: string;
  /** One or two sentences, shown on the card. */
  shortDescription: string;
  /** The detailed explanation. Separate paragraphs with a blank line. */
  fullDescription: string;

  /** Cover image path inside /public. Leave out until you have a real image. */
  image?: string;
  imageAlt?: string;
  /** Set to true if `image` is an illustration rather than a real screenshot. */
  imageIsPlaceholder?: boolean;
  /** Additional screenshots shown in the gallery on the detail page. */
  gallery?: readonly ProjectImage[];

  technologies: readonly string[];
  status: ProjectStatus;
  category: ProjectCategory;

  features: readonly ProjectFeature[];
  /** What the project is intended to accomplish. */
  goal?: string;
  /** What still needs to be built to complete it, in a sensible order. */
  whatToBuild: readonly string[];
  whatIWillLearn: readonly string[];
  challenges?: readonly string[];
  futureImprovements?: readonly string[];

  /** Leave out (or leave empty) until the link really exists. The button is only shown when it is set. */
  githubUrl?: string;
  liveDemoUrl?: string;

  /** Featured projects appear in the Projects section on the home page. */
  featured: boolean;
  /** Dates as "YYYY-MM-DD". Optional. */
  startDate?: string;
  lastUpdated?: string;
};

/* -------------------------------------------------------------------------- */
/* The projects                                                                */
/* -------------------------------------------------------------------------- */

export const PROJECTS: readonly Project[] = [
  {
    id: "python-visualizer",
    title: "Python Code Visualizer",
    slug: "python-code-visualizer",
    shortDescription:
      "A web tool that will show how Python code runs one step at a time, with the variables changing as it goes.",
    fullDescription: `The Python Code Visualizer is a learning tool for seeing what a Python program does while it runs. The idea is to paste in some code, step through it one line at a time, and watch the variables and the output change at every step.

This entry is a demo: it describes the plan for the project. None of the capabilities below are built yet, so they are all listed as planned until they exist and work.`,
    // image: "/images/projects/python-visualizer/cover.png",
    // gallery: [
    //   { src: "/images/projects/python-visualizer/editor.png", alt: "The code editor", caption: "Code input" },
    //   { src: "/images/projects/python-visualizer/output.png", alt: "Step-by-step output" },
    // ],
    technologies: ["Python", "React", "Next.js", "TypeScript", "FastAPI"],
    status: "Demo",
    category: "Developer Tools",
    features: [
      "Code input",
      "Step-by-step execution",
      "Variable state shown at each step",
      "Output display",
      "Clear error handling for code that fails",
    ],
    goal: "Make it easier to understand how Python runs a program by showing every step, instead of only showing the final result.",
    whatToBuild: [
      "A FastAPI endpoint that accepts a piece of Python code and returns the list of steps it went through.",
      "A way to record each executed line and the value of the variables at that moment.",
      "Safety limits for running someone else's code (a time limit and no access to files or the network). This is the most important part of the backend.",
      "A React code input with controls to go to the previous step, the next step, or play through.",
      "Panels that show the current variables and the output for the selected step.",
      "Readable messages for syntax errors and runtime errors.",
      "Connect the frontend to the backend and test it with a handful of example programs.",
    ],
    whatIWillLearn: [
      "How Python executes a program line by line",
      "How to design an API that runs untrusted input safely",
      "How to build a step-through interface in React and TypeScript",
      "How to share data cleanly between a FastAPI backend and a TypeScript frontend",
      "How to handle errors so the user sees a helpful message instead of a crash",
    ],
    challenges: [
      "Running submitted code safely needs careful limits and is the hardest part to get right.",
      "Recording the variables at every step without making the response huge.",
      "Keeping the display clear when a loop runs many times.",
    ],
    futureImprovements: ["A view of the call stack for functions", "A set of ready-made example programs to try"],
    featured: true,
  },
  {
    id: "android-security-lab",
    title: "Android Security Lab",
    slug: "android-security-lab",
    shortDescription:
      "A controlled local lab for learning networking and Android security by running small experiments and inspecting what happens.",
    fullDescription: `The Android Security Lab is a way to learn how networked apps talk to each other and how security problems can show up, by running small experiments in a lab I control. It uses only my own devices, my own network and software I write for the purpose.

This entry is a demo: it describes the plan. The capabilities below are not built yet, so they are all listed as planned.`,
    technologies: ["Python", "Sockets", "Linux", "Android", "Networking"],
    status: "Demo",
    category: "Cybersecurity",
    features: [
      "Client-server communication",
      "Request and response inspection",
      "Logging of traffic and events",
      "Security tests run in a local, controlled lab",
    ],
    goal: "Build a safe place to learn how client-server communication works, and how to examine it and test its security, using only equipment I own.",
    whatToBuild: [
      "Set up the lab: a Linux machine and an Android emulator or test device, on a network kept separate from anything important.",
      "Write a simple client and server with Python sockets so I understand the traffic from first principles.",
      "Add request and response inspection and logging, so each experiment leaves a readable record.",
      "Connect an Android client to the lab server.",
      "Write small experiments, each with a clear question, the expected result and what was actually observed.",
      "Document what each experiment showed and what it means for building safer apps.",
    ],
    whatIWillLearn: [
      "How sockets and request/response protocols work under the hood",
      "How to read logs and captured traffic",
      "The basics of how Android apps use the network",
      "Why encryption and input validation matter",
      "How to run security experiments responsibly: only on my own systems, in an isolated lab",
    ],
    challenges: [
      "Keeping the lab properly isolated so experiments cannot affect anything else.",
      "Android blocks plain, unencrypted connections by default on newer versions, which the lab will have to handle.",
      "Understanding captured traffic well enough to draw correct conclusions.",
    ],
    featured: true,
  },
  {
    id: "csc-website",
    title: "CSC Website",
    slug: "csc-website",
    shortDescription:
      "A website for a Common Services Centre that will present its services and its completed work.",
    fullDescription: `The CSC Website is a site for a Common Services Centre. Its job is to present the services the centre offers, make it easy to find contact information, and show examples of completed work.

This entry is a demo: it describes the plan. The features below are not built yet, so they are all listed as planned. The technologies are the ones I expect to use, and some, like the backend, may come in a later stage.`,
    technologies: ["React", "Tailwind CSS", "FastAPI", "PostgreSQL"],
    status: "Demo",
    category: "Web Development",
    features: [
      "Service listings",
      "Contact information",
      "Work showcase",
      "Responsive user interface",
      "Backend integration in a later stage",
    ],
    goal: "Give the centre a clear, professional website that helps people find its services and contact it.",
    whatToBuild: [
      "Collect the real content: the list of services, the contact details and examples of completed work (with permission to show them).",
      "Design the pages and the navigation.",
      "Build the React and Tailwind CSS frontend, starting with the service listings and the contact page.",
      "Add the work showcase.",
      "Make every page work well on phones, tablets and desktops.",
      "Later: add a FastAPI backend and a PostgreSQL database so services and enquiries can be managed without editing code.",
    ],
    whatIWillLearn: [
      "How to turn real requirements into a working website",
      "How to build a responsive layout that works on any screen",
      "How to model content in a PostgreSQL database",
      "How to build a small REST API with FastAPI",
    ],
    challenges: [
      "Getting accurate, up-to-date content from the centre.",
      "Making the site easy to update after it is delivered.",
    ],
    featured: true,
  },

  /* ------------------------------------------------------------------------ */
  /* TEMPLATE: copy this block, remove the comment markers and fill it in.     */
  /*                                                                          */
  /*  {                                                                       */
  /*    id: "my-project",                       // unique                       */
  /*    title: "My Project",                                                  */
  /*    slug: "my-project",                     // unique; becomes /projects/my-project */
  /*    shortDescription: "One or two sentences for the card.",               */
  /*    fullDescription: `First paragraph.                                     */
  /*                                                                          */
  /*  Second paragraph, after a blank line.`,                                 */
  /*    image: "/images/projects/my-project/cover.png",                       */
  /*    gallery: [                                                            */
  /*      { src: "/images/projects/my-project/editor.png", alt: "The editor" }, */
  /*    ],                                                                    */
  /*    technologies: ["Python", "FastAPI"],                                  */
  /*    status: "In Progress",                  // Planned | In Progress | Completed | Demo */
  /*    category: "Backend",                    // one of PROJECT_CATEGORIES   */
  /*    features: [                                                           */
  /*      "A feature that is only planned",                                   */
  /*      { text: "A feature that really works", done: true },                */
  /*    ],                                                                    */
  /*    goal: "What the project is meant to accomplish.",                     */
  /*    whatToBuild: ["Next thing to build", "Then this"],                    */
  /*    whatIWillLearn: ["A concept", "A skill"],                             */
  /*    challenges: ["A hard part"],            // optional                     */
  /*    futureImprovements: ["An idea"],        // optional                     */
  /*    githubUrl: "",                          // leave empty until it exists   */
  /*    liveDemoUrl: "",                        // leave empty until it exists   */
  /*    featured: true,                                                       */
  /*    startDate: "2026-10-01",                // optional, YYYY-MM-DD          */
  /*    lastUpdated: "2026-10-14",              // optional                      */
  /*  },                                                                      */
];