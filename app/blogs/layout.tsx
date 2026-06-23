import { notFound } from "next/navigation";
import { isPageHidden, readPageVisibilityConfig } from "@/lib/pageVisibility";

export default async function BlogsLayout({ children }: { children: React.ReactNode }) {
  const config = await readPageVisibilityConfig();
  if (isPageHidden(config, "blogs")) {
    notFound();
  }
  return children;
}

