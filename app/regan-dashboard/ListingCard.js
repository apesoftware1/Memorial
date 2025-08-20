// components/ListingCard.jsx
export default function ListingCard({ listing, counts, performance, children }) {
  return (
    <div className="bg-white border rounded-xl overflow-hidden shadow-sm flex flex-col">
      <div className="relative">
        <img
          src={listing.mainImageUrl || "/placeholder.svg"}
          alt={listing.title}
          className="w-full h-44 object-cover"
        />
        <span
          className={`absolute top-3 left-3 text-xs px-2 py-1 rounded text-white ${performance.color}`}
        >
          {performance.label.toUpperCase()}
        </span>
      </div>

      <div className="p-4 flex flex-col gap-3 flex-1">
        <div>
          <h3 className="font-semibold text-lg">{listing.title}</h3>
          <p className="text-gray-600">Price: {formatPrice(listing.price)}</p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <Metric label="Listing Views" value={counts.listing_view || 0} />
          <Metric label="Map Views" value={counts.map_view || 0} />
          <Metric label="Contact Views" value={counts.contact_view || 0} />
          <Metric label="Inquiries" value={counts.inquiry_click || 0} />
        </div>

        <div className="mt-auto pt-2 flex items-center gap-2">
          {children /* place buttons here, e.g., PDF export */}
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded border bg-gray-50 px-3 py-2 flex items-center justify-between">
      <span className="text-gray-600">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

function formatPrice(p) {
  if (p == null) return "N/A";
  try {
    return `R ${Number(p).toLocaleString("en-ZA")}`;
  } catch {
    return String(p);
  }
}
