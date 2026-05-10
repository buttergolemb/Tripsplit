// Client-side store for receipt photo attachments. The MVP backend doesn't
// persist images, so we keep them in localStorage keyed by a stable fingerprint
// of the expense (trip + description + amount). This survives refresh on the
// same device but isn't synced — fine for proof-of-concept.

const STORAGE_PREFIX = "tripsplit:receipt-photo:v1:";

function fingerprint(tripId: string, description: string, amount: number): string {
  const desc = description.trim().toLowerCase();
  return `${STORAGE_PREFIX}${tripId}:${desc}:${amount.toFixed(2)}`;
}

export function saveReceiptPhoto(
  tripId: string,
  description: string,
  amount: number,
  url: string,
): void {
  try {
    localStorage.setItem(fingerprint(tripId, description, amount), url);
  } catch {
    // Storage may be full or disabled; silently ignore — feature is best-effort.
  }
}

export function getReceiptPhoto(
  tripId: string,
  description: string,
  amount: number,
): string | null {
  try {
    return localStorage.getItem(fingerprint(tripId, description, amount));
  } catch {
    return null;
  }
}
