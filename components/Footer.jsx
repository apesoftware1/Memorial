import Link from "next/link";
import ApeSoftwareBadge from "@/components/ApeSoftwareBadge";

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-8 mt-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h4 className="text-lg font-semibold mb-4">About TombstonesFinder.co.za</h4>
            <p className="text-yellow-500 text-sm">
              TombstonesFinder.co.za helps you honour your loved one by finding the perfect tombstone. Search trusted local manufacturers, compare designs, materials, budgets, and custom options — all in one place.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { name: "Home", href: "/" },
                { name: "Find a Tombstone", href: "/tombstones-for-sale" },
                { name: "Find a Manufacturer", href: "/manufacturers" },
                { name: "Services", href: "/services/tombstone-finance" },
                { name: "Contact Us", href: "/contact" }
              ].map((link, index) => (
                <li key={index}>
                  <Link href={link.href} className="text-gray-300 hover:text-white transition-colors text-sm">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <address className="text-gray-300 text-sm not-italic">
              <p>Email: info@tombstonesfinder.co.za</p>
              <p>Phone: 087 153 1560</p>
              <p>Address: PO Box 6891</p>
              <p>Zimbali, KZN</p>
              <p>4418</p>
            </address>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-4 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} TombstonesFinder.co.za. All rights reserved.</p>
          <div className="mt-4 flex flex-col items-center justify-center gap-3">
            <ApeSoftwareBadge />
            <a
              href="https://apesoftwares.co.za"
              target="_blank"
              rel="noreferrer"
              className="text-sm font-medium text-gray-300 transition-colors hover:text-white"
            >
              Created by Ape Softwares
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
