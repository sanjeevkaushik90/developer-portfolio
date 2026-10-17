import type { Metadata } from "next";
import ContactPage from "../../components/contact/ContactPage";

export const metadata: Metadata = {
  title: "Contact | Sanjeev Kaushik",
  description: "Get in touch about internships, collaborations or ideas.",
};

export default function Contact() {
  return <ContactPage />;
}