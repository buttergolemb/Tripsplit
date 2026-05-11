// Tracks how each line-item (by normalized name) is typically split on a trip.
// Used by the receipt-scan flow to pre-fill assignments next time.
//
// Stored client-side per trip in localStorage — best-effort, no sync.

const PREFIX = "tripsplit:item-memory:v1:";

type Memory = {
  // member name -> count of times they were assigned to this item
  counts: Record<string, number>;
  total: number; // total assignments observed
};

function key(tripId: string): string {
  return `${PREFIX}${tripId}`;
}

function normalize(name: string): string {
  return name
    .toLowerCase()
    // strip leading qty: "2× Gyudon" → "Gyudon"
    .replace(/^\s*\d+\s*[x×]\s+/, "")
    .trim();
}

type AllMemory = Record<string, Memory>;

function readAll(tripId: string): AllMemory {
  try {
    const raw = localStorage.getItem(key(tripId));
    return raw ? (JSON.parse(raw) as AllMemory) : {};
  } catch {
    return {};
  }
}

function writeAll(tripId: string, mem: AllMemory): void {
  try {
    localStorage.setItem(key(tripId), JSON.stringify(mem));
  } catch {
    // best-effort
  }
}

// Record an item's final assignment so future scans can suggest it.
export function rememberAssignment(
  tripId: string,
  itemName: string,
  members: string[],
): void {
  if (!tripId || members.length === 0) return;
  const all = readAll(tripId);
  const k = normalize(itemName);
  if (!k) return;
  const cur: Memory = all[k] ?? { counts: {}, total: 0 };
  for (const m of members) {
    cur.counts[m] = (cur.counts[m] ?? 0) + 1;
  }
  cur.total += 1;
  all[k] = cur;
  writeAll(tripId, all);
}

// Suggest an assignment for an item we're seeing now.
// Returns the members who appeared in >50% of past assignments for this item.
// Returns null if there's no usable history (caller falls back to manual).
export function suggestAssignment(
  tripId: string,
  itemName: string,
  candidates: string[],
): string[] | null {
  if (!tripId) return null;
  const all = readAll(tripId);
  const k = normalize(itemName);
  const mem = all[k];
  if (!mem || mem.total === 0) return null;

  const threshold = mem.total * 0.5;
  const suggested = candidates.filter((c) => (mem.counts[c] ?? 0) > threshold);
  return suggested.length > 0 ? suggested : null;
}
