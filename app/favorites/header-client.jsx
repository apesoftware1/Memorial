"use client"

import { useState } from "react"
import Header from "@/components/Header"

export default function HeaderClient() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileDropdown, setMobileDropdown] = useState(null)

  const handleMobileMenuToggle = () => setMobileMenuOpen((prev) => !prev)
  const handleMobileDropdownToggle = (key) =>
    setMobileDropdown((prev) => (prev === key ? null : key))

  return (
    <Header
      mobileMenuOpen={mobileMenuOpen}
      handleMobileMenuToggle={handleMobileMenuToggle}
      mobileDropdown={mobileDropdown}
      handleMobileDropdownToggle={handleMobileDropdownToggle}
    />
  )
}