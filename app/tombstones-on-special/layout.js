import { notFound } from "next/navigation";
import { readPageVisibilityConfig } from "@/lib/pageVisibility";

export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function TombstonesOnSpecialLayout({ children }) {
  const config = await readPageVisibilityConfig();
  if (
    Array.isArray(config?.hidden) &&
    config.hidden.includes("tombstonesOnSpecial")
  ) {
    notFound();
  }
  return children;
}
