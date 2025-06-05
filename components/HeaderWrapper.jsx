"use client";

import { useState } from "react";
import Header from "@/components/Header";

export default function HeaderWrapper() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileDropdown, setMobileDropdown] = useState(null);

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleMobileDropdownToggle = (dropdown) => {
    setMobileDropdown(mobileDropdown === dropdown ? null : dropdown);
  };

  return (
    <Header
      mobileMenuOpen={mobileMenuOpen}
      handleMobileMenuToggle={handleMobileMenuToggle}
      mobileDropdown={mobileDropdown}
      handleMobileDropdownToggle={handleMobileDropdownToggle}
    />
  );
}
 