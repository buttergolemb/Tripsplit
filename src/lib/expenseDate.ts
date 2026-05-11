/** Stable numeric rank for sorting expenses / activity by calendar meaning (newest first = larger rank sorts first when doing b - a). */
export function expenseDateRank(label: string | undefined): number {
  if (!label?.trim()) return 0;
  const s = label.trim();
  const direct = Date.parse(s);
  if (!Number.isNaN(direct)) return direct;
  const stripped = s.replace(/^[A-Za-z]+,\s*/, "").trim();
  const withYear = /(?:19|20)\d{2}/.test(stripped) ? stripped : `${stripped}, 2026`;
  const d2 = Date.parse(withYear);
  return Number.isNaN(d2) ? 0 : d2;
}

/** Builds UI/API date labels like "Sunday, Mar 18" from `yyyy-mm-dd`. */
export function formatExpenseDateLabelFromISO(iso: string): string {
  if (!iso?.trim()) {
    const now = new Date();
    return now.toLocaleDateString("en-US", {
      weekday: "long", month: "short", day: "numeric",
    });
  }
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString("en-US", {
    weekday: "long", month: "short", day: "numeric",
  });
}

/** Today as yyyy-mm-dd for date inputs. */
export function todayISODate(): string {
  const n = new Date();
  const pad = (x: number) => String(x).padStart(2, "0");
  return `${n.getFullYear()}-${pad(n.getMonth() + 1)}-${pad(n.getDate())}`;
}

/** Compact label for chips, e.g. `Fri Mar 18` (no comma). */
export function formatShortExpenseDateFromISO(iso: string): string {
  if (!iso?.trim()) return "";
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso.trim();
  const dt = new Date(y, m - 1, d);
  const s = dt.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  return s.replace(/,/g, "").replace(/\s+/g, " ").trim();
}

/** Add-expense row chip: `Now · Fri Mar 18` when the date is today, else short date only. */
export function formatExpenseWhenChipFromISO(iso: string): string {
  const short = formatShortExpenseDateFromISO(iso);
  if (!short) return "";
  return iso.trim() === todayISODate() ? `Now · ${short}` : short;
}
