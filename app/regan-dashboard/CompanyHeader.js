// components/CompanyHeader.jsx
"use client";

import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

function formatMonthLabel(monthYear) {
  if (!monthYear) return "Pick a month";
  const [y, m] = String(monthYear).split("-").map(Number);
  if (!y || !m) return "Pick a month";
  try {
    const date = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0));
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      timeZone: "UTC",
    });
  } catch {
    return `${y}-${String(m).padStart(2, "0")}`;
  }
}

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
  const defaultAnchor = monthYear
    ? (() => {
        const [y, m] = String(monthYear).split("-").map(Number);
        return new Date(Date.UTC(y || 2024, (m || 1) - 1, 1, 0, 0, 0));
      })()
    : new Date();

  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState(defaultAnchor);

  const onMonthChangeHandler = (next) => {
    setAnchor(next);
    const y = next.getUTCFullYear
      ? next.getUTCFullYear()
      : next instanceof Date
      ? next.getFullYear()
      : 2024;
    const m = next.getUTCMonth !== undefined
      ? next.getUTCMonth()
      : next instanceof Date
      ? next.getMonth()
      : 0;
    const value = `${y}-${String(m + 1).padStart(2, "0")}`;
    onChangeMonthYear(value);
    setOpen(false);
  };

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
            <p className="text-sm text-muted-foreground">Performance Analytics</p>
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
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !monthYear && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formatMonthLabel(monthYear)}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="month"
                  month={anchor}
                  selected={monthYear
                    ? (() => {
                        const [y, m] = String(monthYear).split("-").map(Number);
                        return new Date(Date.UTC(y, (m || 1) - 1, 1, 0, 0, 0));
                      })()
                    : undefined}
                  onMonthChange={onMonthChangeHandler}
                  onSelect={(d) => {
                    if (!d) return;
                    const y = d.getUTCFullYear
                      ? d.getUTCFullYear()
                      : d.getFullYear();
                    const m = d.getUTCMonth !== undefined
                      ? d.getUTCMonth()
                      : d.getMonth();
                    onChangeMonthYear(`${y}-${String(m + 1).padStart(2, "0")}`);
                    setOpen(false);
                  }}
                />
                <div className="border-t border-border p-3 text-xs text-muted-foreground">
                  Navigate months above, then click any day to select that month.
                </div>
              </PopoverContent>
            </Popover>
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
