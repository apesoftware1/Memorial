import LifeInsuranceClient from "./life-insurance-client";
import { toAbsoluteUrl } from "@/lib/serverGraphql";
import { notFound } from "next/navigation";
import { isPageHidden, readPageVisibilityConfig } from "@/lib/pageVisibility";

export const metadata = {
  title: "Life Insurance For Memorial Planning",
  description:
    "Compare life insurance support options that help families plan and protect memorial costs in South Africa.",
  alternates: {
    canonical: toAbsoluteUrl("/services/life-insurance"),
  },
};

export default async function LifeInsurancePage() {
  const config = await readPageVisibilityConfig();
  if (isPageHidden(config, "lifeInsurance")) {
    notFound();
  }
  return <LifeInsuranceClient />;
}
