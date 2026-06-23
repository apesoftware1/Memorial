import InstallationGuideClient from "./installation-guide-client";
import { toAbsoluteUrl } from "@/lib/serverGraphql";
import { notFound } from "next/navigation";
import { isPageHidden, readPageVisibilityConfig } from "@/lib/pageVisibility";

export const metadata = {
  title: "Tombstone Installation Guide",
  description:
    "Read the tombstone installation guide for preparation, foundation work, safety and finishing steps.",
  alternates: {
    canonical: toAbsoluteUrl("/services/installation-guide"),
  },
};

export default async function InstallationGuidePage() {
  const config = await readPageVisibilityConfig();
  if (isPageHidden(config, "installationGuide")) {
    notFound();
  }
  return <InstallationGuideClient />;
}
