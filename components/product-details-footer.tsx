import Link from "next/link"
import { Facebook, Twitter, Instagram, Linkedin, Youtube } from "lucide-react"

export default function ProductDetailsFooter() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">About Us</h3>
            <p className="text-gray-300">
              We provide high-quality memorial products with exceptional craftsmanship and attention to detail.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link href="#products" className="text-gray-300 hover:text-white">
                  Products
                </Link>
              </li>
              <li>
                <Link href="#about" className="text-gray-300 hover:text-white">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="#contact" className="text-gray-300 hover:text-white">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="#terms" className="text-gray-300 hover:text-white">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
            <p className="text-gray-300 mb-2">Email: info@memorialproducts.com</p>
            <p className="text-gray-300 mb-2">Phone: +27 123 456 789</p>
            <div className="flex space-x-4 mt-4">
              <Link href="#" className="text-gray-300 hover:text-white">
                <Facebook size={20} />
              </Link>
              <Link href="#" className="text-gray-300 hover:text-white">
                <Twitter size={20} />
              </Link>
              <Link href="#" className="text-gray-300 hover:text-white">
                <Instagram size={20} />
              </Link>
              <Link href="#" className="text-gray-300 hover:text-white">
                <Linkedin size={20} />
              </Link>
              <Link href="#" className="text-gray-300 hover:text-white">
                <Youtube size={20} />
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 text-center">
          <p className="text-gray-400">© {new Date().getFullYear()} TombstonesFinder.co.za. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}