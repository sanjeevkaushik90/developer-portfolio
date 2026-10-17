/**
 * The About text, shared by the scroll scene on the home page and the standalone /about page,
 * so the two can never drift apart. Only details you gave me are used: no experience,
 * employment, certifications or achievements.
 */

/**
 * Put your photo at public/images/profile.jpg (a portrait, roughly 4:5, at least 800px wide).
 * Until that file exists, a neutral placeholder is shown instead.
 */
export const PROFILE_PHOTO = "/images/my-avatar-profile.png";

export const INTERESTS = ["Python", "Web development", "Backend development", "Cybersecurity"] as const;

export const ABOUT_INTRO = [
  "I'm a developer who enjoys understanding how software really works. I like solving logical problems, building practical software, and finding out what happens beneath the surface of the tools and systems I use every day.",
  "My main interests are Python, web development, backend development, and cybersecurity. Python is where I turn ideas into working programs, web and backend development let me build complete applications, and cybersecurity keeps me asking how systems can fail and how to make them safer.",
] as const;

export const ABOUT_LEARNING =
  "I learn best by building. Taking on a project and working through the problems that come up, testing ideas, debugging, and trying again, teaches me far more than reading alone. Right now I'm learning by building projects and exploring cybersecurity.";

export const ABOUT_GOAL =
  "My goal is to become a capable software and security engineer: someone who can build reliable software and also understands how to protect it.";