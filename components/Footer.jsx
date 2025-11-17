import Link from "next/link";

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
              <p>Email: info@tombstonefinder.co.za</p>
              <p>Phone: 087 153 1560</p>
              <p>Address: 18 EMOYENI</p>
              <p>17 CORKWOOD CLOSE, SIMBITHI ECOESTATE, KWA-ZULU NATAL, 4399</p>
            </address>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-4 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} TombstonesFinder.co.za. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}