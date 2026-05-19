// components/PdfExporterButton.jsx
import { jsPDF } from "jspdf";
import { EVENT_DEFS } from "./useCompanyPerformance";

const EVENT_LABELS = Object.fromEntries(
  (Array.isArray(EVENT_DEFS) ? EVENT_DEFS : []).map((d) => [d.key, d.label])
);

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
  for (const def of Array.isArray(EVENT_DEFS) ? EVENT_DEFS : []) {
    const v = totals?.[def.key] || 0;
    doc.text(`- ${EVENT_LABELS[def.key] || def.key}: ${v}`, 18, y);
    y += 6;
  }
  y += 4;

  doc.setFontSize(12);
  doc.text("Listings", 14, y); y += 7;

  listings.forEach((l, idx) => {
    const total = (Array.isArray(EVENT_DEFS) ? EVENT_DEFS : []).reduce(
      (n, def) => n + (l?._counts?.[def.key] || 0),
      0
    );

    const compact = [
      `Total: ${total}`,
      `Listing: ${l?._counts?.listing_view || 0}`,
      `Phone: ${l?._counts?.phone_click || 0}`,
      `Website: ${l?._counts?.website_click || 0}`,
      `Map: ${l?._counts?.map_view || 0}`,
      `Contact: ${l?._counts?.contact_view || 0}`,
      `Inquiries: ${l?._counts?.inquiry_click || 0}`,
      `WhatsApp: ${l?._counts?.whatsapp_tracker || 0}`,
      `Rep Calls: ${l?._counts?.rep_call_tracker || 0}`,
    ].join(", ");

    const line = `${idx + 1}. ${l.title} — ${compact}`;

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

  for (const def of Array.isArray(EVENT_DEFS) ? EVENT_DEFS : []) {
    doc.text(`- ${EVENT_LABELS[def.key] || def.key}: ${counts?.[def.key] || 0}`, 18, y);
    y += 6;
  }

  doc.save(`${(listing?.title || "listing").replace(/\s+/g, "-")}-performance.pdf`);
}
