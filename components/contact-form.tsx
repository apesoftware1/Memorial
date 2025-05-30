"use client"

import Link from "next/link"
import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted:", formData)
    // Here you would typically send the data to your backend
    alert("Thank you for your message. We will contact you shortly.")
    setFormData({ name: "", email: "", phone: "", message: "" })
  }

  return (
    <section className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Contact the Manufacturer</CardTitle>
          <CardDescription>Fill out the form below and we'll get back to you as soon as possible.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Name & Surname
              </label>
              <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium">
                Mobile Number
              </label>
              <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <label htmlFor="message" className="text-sm font-medium">
                Message
              </label>
              <Textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={4}
                required
              />
            </div>

            <div className="text-xs text-gray-500">
              By submitting this form, you agree to our{" "}
              <Link href="#" className="underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="#" className="underline">
                Privacy Policy
              </Link>
              .
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" onClick={handleSubmit}>
            Send Message
          </Button>
        </CardFooter>
      </Card>

      <div className="mt-8 border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">Business Hours</h3>
        <div className="grid grid-cols-2 gap-2">
          <div>Monday to Friday</div>
          <div>08:00 - 17:00</div>
          <div>Saturday</div>
          <div>08:00 - 13:00</div>
          <div>Public Holidays</div>
          <div>09:00 - 12:00</div>
        </div>
      </div>
    </section>
  )
} 