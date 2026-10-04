// components/PdfExporterButton.jsx
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { EVENT_DEFS } from "./useCompanyPerformance";

const EVENT_LABELS = Object.fromEntries(
  (Array.isArray(EVENT_DEFS) ? EVENT_DEFS : []).map((d) => [d.key, d.label])
);

const EVENT_KEY_LOOKUP = {
  list: "listing_view",
  phone: "phone_click",
  website: "website_click",
  map: "map_view",
  contact: "contact_view",
  inquiries: "inquiry_click",
  whatsapp: "whatsapp_tracker",
  rep: "rep_call_tracker",
};

const COL_KEYS = [
  "idx",
  "title",
  "total",
  "list",
  "phone",
  "map",
  "contact",
  "inquiries",
  "whatsapp",
  "rep",
];

const COL_LABELS = {
  idx: "#",
  title: "Listing Name",
  total: "Total",
  list: "Listing",
  phone: "Phone",
  map: "Map",
  contact: "Contact",
  inquiries: "Inquiries",
  whatsapp: "WhatsApp",
  rep: "Rep",
};

// Percent of table usable content width. Landscape A4 = 297mm wide, minus 14mm
// left+right margins = 269mm table width. Listing Name shrunk to 20% of table
// (was the largest column by far); Website column removed entirely; remaining
// numeric stat columns re-balanced to fill the full 100%.
const COL_WIDTH_PCT = {
  idx: 4,
  title: 20,
  total: 7,
  list: 9,
  phone: 7,
  map: 5,
  contact: 8,
  inquiries: 9,
  whatsapp: 10,
  rep: 7,
};

const LISTINGS_PER_PAGE = 20;

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

function buildListingRows(listings) {
  const arr = Array.isArray(listings) ? listings : [];
  return arr.map((l, idx) => {
    const counts = l?._counts || {};
    const total = (Array.isArray(EVENT_DEFS) ? EVENT_DEFS : []).reduce(
      (n, def) => n + (counts[def.key] || 0),
      0
    );
    return {
      idx: idx + 1,
      title: l?.title || "-",
      total,
      list: counts[EVENT_KEY_LOOKUP.list] || 0,
      phone: counts[EVENT_KEY_LOOKUP.phone] || 0,
      map: counts[EVENT_KEY_LOOKUP.map] || 0,
      contact: counts[EVENT_KEY_LOOKUP.contact] || 0,
      inquiries: counts[EVENT_KEY_LOOKUP.inquiries] || 0,
      whatsapp: counts[EVENT_KEY_LOOKUP.whatsapp] || 0,
      rep: counts[EVENT_KEY_LOOKUP.rep] || 0,
    };
  });
}

function getDocUsableWidthMm(doc) {
  return doc.internal.pageSize.getWidth() - 5 * 2; // 5mm left+right margins
}

function getColWidthsMm(doc) {
  const totalW = getDocUsableWidthMm(doc);
  const widths = {};
  COL_KEYS.forEach((k) => {
    widths[k] = (totalW * (COL_WIDTH_PCT[k] || 0)) / 100;
  });
  return widths;
}

function renderReportHeader(doc, company, periodLabel, pageInfo, isFirstPage) {
  const usable = getDocUsableWidthMm(doc);
  const marginLeft = 5;
  let y = 6;

  if (isFirstPage) {
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Company Performance Report", marginLeft, y);
    y += 5;
  } else {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`${company?.name || "Company Performance"} — continued`, marginLeft, y);
    y += 4.5;
  }

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const parts = isFirstPage ? [`Company: ${company?.name || "-"}`] : [];
  if (periodLabel) parts.push(`Period: ${periodLabel}`);
  if (pageInfo && pageInfo.pageCount > 1)
    parts.push(
      `Page ${pageInfo.pageIndex + 1} / ${pageInfo.pageCount} · ` +
        `Listings ${pageInfo.rangeStart}–${pageInfo.rangeEnd} of ${pageInfo.totalListings}`
    );
  doc.text(parts.join("   ·   "), marginLeft, y);
  y += isFirstPage ? 5 : 4;
  return { y, usable, marginLeft };
}

function renderTotals(doc, headerY, totals) {
  const defs = Array.isArray(EVENT_DEFS) ? EVENT_DEFS : [];
  const usable = getDocUsableWidthMm(doc);
  const labelW = usable * 0.6;
  const valueW = usable - labelW;
  const rows = defs.length
    ? defs.map((def) => [
        EVENT_LABELS[def.key] || def.key,
        String(totals?.[def.key] || 0),
      ])
    : [["-", "0"]];

  autoTable(doc, {
    startY: headerY,
    margin: { left: 5, right: 5, top: 1, bottom: 0 },
    tableWidth: usable,
    styles: { fontSize: 9, cellPadding: 1.6, overflow: "linebreak", minCellHeight: 5.5 },
    headStyles: {
      fillColor: [74, 108, 247],
      textColor: 255,
      fontSize: 9.5,
      fontStyle: "bold",
      cellPadding: 1.8,
    },
    head: [["Metric", "Value"]],
    body: rows,
    pageBreak: "auto",
    rowPageBreak: "avoid",
    columnStyles: {
      0: { cellWidth: labelW },
      1: { cellWidth: valueW, halign: "right", fontStyle: "bold" },
    },
  });
  const lastY = doc.lastAutoTable?.finalY;
  return typeof lastY === "number" ? lastY + 3 : headerY + 12;
}

function renderListingsTable(doc, startY, rows) {
  const usable = getDocUsableWidthMm(doc);
  const colWidthsMm = getColWidthsMm(doc);
  const head = [COL_KEYS.map((k) => COL_LABELS[k])];
  const body = rows.map((r) =>
    COL_KEYS.map((k) => {
      const v = r[k];
      return typeof v === "number" ? String(v) : v == null ? "" : String(v);
    })
  );
  autoTable(doc, {
    startY: startY,
    margin: { left: 5, right: 5, top: 0, bottom: 2 },
    tableWidth: usable,
    styles: {
      fontSize: 9,
      cellPadding: 1.3,
      overflow: "hidden",
      minCellHeight: 5.4,
      lineWidth: 0.08,
    },
    tableLineWidth: 0.08,
    tableLineColor: [225, 227, 232],
    headStyles: {
      fillColor: [74, 108, 247],
      textColor: 255,
      fontSize: 9,
      fontStyle: "bold",
      halign: "center",
      cellPadding: 1.6,
      overflow: "hidden",
      minCellHeight: 6,
    },
    alternateRowStyles: { fillColor: [248, 249, 252] },
    head,
    body,
    pageBreak: "auto",
    rowPageBreak: "avoid",
    showHead: "firstPage",
    columnStyles: COL_KEYS.reduce((acc, k, i) => {
      const style = {
        cellWidth: colWidthsMm[k],
        overflow: k === "title" ? "ellipsize" : "hidden",
      };
      if (k === "idx") style.halign = "center";
      else if (k === "title") {
        style.fontStyle = "bold";
        style.halign = "left";
        style.cellPadding = 1.3;
      } else {
        style.halign = "right";
        style.cellPadding = 1.1;
      }
      acc[i] = style;
      return acc;
    }, {}),
  });
  return typeof doc.lastAutoTable?.finalY === "number"
    ? doc.lastAutoTable.finalY + 1.5
    : startY + 10;
}

function exportCompany({ company, listings, totals, periodLabel }) {
  const allRows = buildListingRows(listings);
  const totalListings = allRows.length;
  const pageCount = Math.max(1, Math.ceil(totalListings / LISTINGS_PER_PAGE));

  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
    compress: true,
  });
  // Landscape A4 = 297mm (w) × 210mm (h)

  for (let p = 0; p < pageCount; p += 1) {
    if (p > 0) doc.addPage("a4", "landscape");
    const sliceStart = p * LISTINGS_PER_PAGE;
    const sliceEnd = Math.min(sliceStart + LISTINGS_PER_PAGE, totalListings);
    const pageRows = allRows.slice(sliceStart, sliceEnd);
    const pageInfo = {
      pageIndex: p,
      pageCount,
      totalListings,
      rangeStart: totalListings === 0 ? 0 : sliceStart + 1,
      rangeEnd: sliceEnd,
    };
    const isFirstPage = p === 0;

    const header = renderReportHeader(doc, company, periodLabel, pageInfo, isFirstPage);
    const afterTotals = isFirstPage
      ? renderTotals(doc, header.y, totals)
      : header.y + 2;
    renderListingsTable(doc, afterTotals, pageRows);
  }

  const base = (company?.name || "company-performance")
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9-_]/g, "")
    .toLowerCase();
  const suffix = periodLabel
    ? `-${periodLabel.replace(/\s+/g, "-")}`
    : "";
  doc.save(`${base}${suffix}-performance-report.pdf`);
}

function exportListing({ listing, counts, periodLabel }) {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
    compress: true,
  });
  let y = 6;
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Listing Performance", 5, y);
  y += 5;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const parts = [`Title: ${listing?.title || "-"}`];
  if (periodLabel) parts.push(`Period: ${periodLabel}`);
  doc.text(parts.join("   ·   "), 5, y);
  y += 5;

  const defs = Array.isArray(EVENT_DEFS) ? EVENT_DEFS : [];
  const usable = getDocUsableWidthMm(doc);
  const body = defs.length
    ? defs.map((d) => [EVENT_LABELS[d.key] || d.key, String(counts?.[d.key] || 0)])
    : [["-", "0"]];

  autoTable(doc, {
    startY: y,
    margin: { left: 5, right: 5, top: 1, bottom: 2 },
    tableWidth: usable * 0.7,
    styles: { fontSize: 9.5, cellPadding: 1.8, overflow: "linebreak", minCellHeight: 5.6 },
    headStyles: {
      fillColor: [74, 108, 247],
      textColor: 255,
      fontSize: 10,
      fontStyle: "bold",
      cellPadding: 2,
    },
    head: [["Metric", "Value"]],
    body,
    pageBreak: "auto",
    rowPageBreak: "avoid",
    columnStyles: {
      0: { cellWidth: usable * 0.7 * 0.62 },
      1: {
        cellWidth: usable * 0.7 * 0.38,
        halign: "right",
        fontStyle: "bold",
      },
    },
  });

  const base = (listing?.title || "listing")
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9-_]/g, "")
    .toLowerCase();
  const suffix = periodLabel ? `-${periodLabel.replace(/\s+/g, "-")}` : "";
  doc.save(`${base}${suffix}-performance.pdf`);
}
