// components/CompanyHeader.jsx
export default function CompanyHeader({
  logoUrl,
  name,
  period,
  monthYear,
  onChangePeriod,
  onChangeMonthYear,
  totals,
}) {
  return (
    <div className="bg-card text-card-foreground border border-border rounded-xl p-4 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={name}
              className="w-16 h-16 object-cover rounded-full border border-border"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-muted border border-border" />
          )}
          <div>
            <h1 className="text-2xl font-semibold">{name}</h1>
            <p className="text-sm text-muted-foreground">
              Performance Analytics
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            className="border border-border rounded px-3 py-2 bg-background text-foreground"
            value={period}
            onChange={(e) => onChangePeriod(e.target.value)}
          >
            <option value="all">All time</option>
            <option value="month">By month</option>
          </select>
          {period === "month" && (
            <input
              type="month"
              className="border border-border rounded px-3 py-2 bg-background text-foreground"
              value={monthYear}
              onChange={(e) => onChangeMonthYear(e.target.value)}
            />
          )}
        </div>
      </div>

      {/* totals - horizontally scrollable */}
      <div className="mt-4 overflow-x-auto">
        <div className="flex gap-3 min-w-max pr-2">
          <Stat label="Listing Views" value={totals.listing_view || 0} />
          <Stat label="Map Views" value={totals.map_view || 0} />
          <Stat label="Contact Views" value={totals.contact_view || 0} />
          <Stat label="Inquiries" value={totals.inquiry_click || 0} />
          <Stat label="WhatsApp" value={totals.whatsapp_tracker || 0} />
          <Stat label="Rep Calls" value={totals.rep_call_tracker || 0} />
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-lg border border-border bg-muted p-4 min-w-[180px]">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}
