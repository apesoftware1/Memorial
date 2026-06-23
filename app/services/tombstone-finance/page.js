import TombstoneFinanceClient from "./tombstone-finance-client";
import { toAbsoluteUrl } from "@/lib/serverGraphql";
import { notFound } from "next/navigation";
import { isPageHidden, readPageVisibilityConfig } from "@/lib/pageVisibility";

export const metadata = {
  title: "Tombstone Finance Solutions",
  description:
    "Explore tombstone financing options in South Africa with flexible support for memorial purchases.",
  alternates: {
    canonical: toAbsoluteUrl("/services/tombstone-finance"),
  },
};

export default async function TombstoneFinancePage() {
  const config = await readPageVisibilityConfig();
  if (isPageHidden(config, "tombstoneFinance")) {
    notFound();
  }
  return <TombstoneFinanceClient />;
}
