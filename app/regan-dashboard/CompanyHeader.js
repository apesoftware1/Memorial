// components/CompanyHeader.jsx
export default function CompanyHeader({
  logoUrl,
  name,
  period,
  monthYear,
  onChangePeriod,
  onChangeMonthYear,
  totals,
  eventDefs,
}) {
  const defs = Array.isArray(eventDefs) && eventDefs.length > 0 ? eventDefs : [];
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
          {defs.map((d) => (
            <Stat key={d.key} label={d.label} value={totals?.[d.key] || 0} />
          ))}
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
