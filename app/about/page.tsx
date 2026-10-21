import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import AboutContent from "@/components/about/AboutContent";

export const metadata: Metadata = {
  title: "About Me | Sanjeev Kaushik",
  description:
    "Learn about Sanjeev Kaushik, his development journey, technical interests, and cybersecurity goals.",
};

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <AboutContent />
    </>
  );
}
