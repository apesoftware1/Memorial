"use client";

import { useState } from "react";
import Header from "@/components/Header";

export default function LocationHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileDropdown, setMobileDropdown] = useState<string | null>(null);

  return (
    <Header
      mobileMenuOpen={mobileMenuOpen}
      handleMobileMenuToggle={() => setMobileMenuOpen((open) => !open)}
      mobileDropdown={mobileDropdown}
      handleMobileDropdownToggle={(dropdown: string) =>
        setMobileDropdown((prev) => (prev === dropdown ? null : dropdown))
      }
      onMobileFilterClick={undefined}
    />
  );
}
