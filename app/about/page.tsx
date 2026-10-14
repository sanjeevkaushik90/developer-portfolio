import type { Metadata } from "next";
import AboutContent from "../../components/about/AboutContent";

export const metadata: Metadata = {
  title: "About Me | Sanjeev Kaushik",
  description:
    "Developer interested in Python, web development, backend development, and cybersecurity, learning by building projects.",
};

export default function AboutPage() {
  return <AboutContent />;
}