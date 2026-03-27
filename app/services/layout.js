import { notFound } from "next/navigation";
import { readPageVisibilityConfig } from "@/lib/pageVisibility";

export default async function ServicesLayout({ children }) {
  const config = await readPageVisibilityConfig();
  if (Array.isArray(config?.hidden) && config.hidden.includes("services")) {
    notFound();
  }
  return children;
}

