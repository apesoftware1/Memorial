// components/PdfExporterButton.jsx
import { jsPDF } from "jspdf";

const EVENT_LABELS = {
  listing_view: "Listing Views",
  map_view: "Map Views",
  contact_view: "Contact Views",
  inquiry_click: "Inquiries",
  whatsapp_tracker: "WhatsApp",
  rep_call_tracker: "Rep Calls",
};

export default function PdfExporterButton(props) {
  const { mode } = props; // "company" | "listing"

  return (
    <button
      onClick={() => handleExport(props)}
      className="px-3 py-2 rounded border border-border bg-card text-card-foreground hover:bg-muted transition-colors"
    >
      {mode === "company" ? "Download Company PDF" : "Download Listing PDF"}
    </button>
  );
}

function handleExport(props) {
  if (props.mode === "company") return exportCompany(props);
  return exportListing(props);
}

function exportCompany({ company, listings, totals, periodLabel }) {
  const doc = new jsPDF();
  let y = 15;

  doc.setFontSize(16);
  doc.text(`Company Performance Report`, 14, y); y += 8;
  doc.setFontSize(11);
  doc.text(`Company: ${company?.name || "-"}`, 14, y); y += 6;
  if (periodLabel) doc.text(`Period: ${periodLabel}`, 14, y);
  y += 10;

  doc.setFontSize(12);
  doc.text("Totals", 14, y); y += 7;
  for (const [k, v] of Object.entries(totals || {})) {
    doc.text(`- ${EVENT_LABELS[k] || k}: ${v}`, 18, y);
    y += 6;
  }
  y += 4;

  doc.setFontSize(12);
  doc.text("Listings", 14, y); y += 7;

  listings.forEach((l, idx) => {
    const total =
      (l._counts?.listing_view || 0) +
      (l._counts?.map_view || 0) +
      (l._counts?.contact_view || 0) +
      (l._counts?.inquiry_click || 0);

    const line = `${idx + 1}. ${l.title} — Total: ${total}  (Views: ${l._counts?.listing_view || 0}, Map: ${l._counts?.map_view || 0}, Contact: ${l._counts?.contact_view || 0}, Inquiries: ${l._counts?.inquiry_click || 0})`;

    // paginate
    if (y > 280) {
      doc.addPage();
      y = 15;
    }
    doc.text(line, 18, y);
    y += 6;
  });

  doc.save(`company-performance.pdf`);
}

function exportListing({ listing, counts, periodLabel }) {
  const doc = new jsPDF();
  let y = 15;
  doc.setFontSize(16);
  doc.text(`Listing Performance`, 14, y); y += 8;
  doc.setFontSize(11);
  doc.text(`Title: ${listing?.title || "-"}`, 14, y); y += 6;
  if (periodLabel) doc.text(`Period: ${periodLabel}`, 14, y); y += 10;

  doc.setFontSize(12);
  doc.text("Metrics", 14, y); y += 7;

  const ordered = [
    ["Listing Views", counts?.listing_view || 0],
    ["Map Views", counts?.map_view || 0],
    ["Contact Views", counts?.contact_view || 0],
    ["Inquiries", counts?.inquiry_click || 0],
    ["WhatsApp", counts?.whatsapp_tracker || 0],
    ["Rep Calls", counts?.rep_call_tracker || 0],
  ];

  ordered.forEach(([label, val]) => {
    doc.text(`- ${label}: ${val}`, 18, y);
    y += 6;
  });

  doc.save(`${(listing?.title || "listing").replace(/\s+/g, "-")}-performance.pdf`);
}
