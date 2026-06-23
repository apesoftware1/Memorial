import ContactClient from "./contact-client";
import { toAbsoluteUrl } from "@/lib/serverGraphql";

export const metadata = {
  title: "Contact Tombstone Finder",
  description:
    "Contact Tombstone Finder for advertising, listing support and customer enquiries across South Africa.",
  alternates: {
    canonical: toAbsoluteUrl("/contact"),
  },
};

export default function ContactPage() {
  return <ContactClient />;
}
