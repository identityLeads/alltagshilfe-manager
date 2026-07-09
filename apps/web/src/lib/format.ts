export function eur(cents: number): string {
  return (cents / 100).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
}

export function initials(firstName: string, lastName: string): string {
  return `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();
}

export function fullName(p: { firstName: string; lastName: string }): string {
  return `${p.firstName} ${p.lastName}`;
}

const dateFormatter = new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
const monthFormatter = new Intl.DateTimeFormat("de-DE", { month: "long", year: "numeric" });
const weekdayDateFormatter = new Intl.DateTimeFormat("de-DE", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function formatDate(iso: string | Date): string {
  return dateFormatter.format(new Date(iso));
}

export function formatMonth(iso: string | Date): string {
  return monthFormatter.format(new Date(iso));
}

export function formatWeekdayDate(iso: string | Date): string {
  return weekdayDateFormatter.format(new Date(iso));
}

export function formatTimeRange(startMinutes: number, durationMinutes: number): string {
  const fmt = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  };
  return `${fmt(startMinutes)}–${fmt(startMinutes + durationMinutes)}`;
}

export function formatDuration(minutes: number): string {
  const hours = minutes / 60;
  return hours.toLocaleString("de-DE", { minimumFractionDigits: hours % 1 === 0 ? 0 : 1 }) + " h";
}

export function toDateInputValue(iso: string | Date): string {
  const date = new Date(iso);
  return date.toISOString().slice(0, 10);
}

export function parseEuroToCents(value: string): number {
  const normalized = value.trim().replace(/\./g, "").replace(",", ".");
  const num = parseFloat(normalized);
  return Number.isFinite(num) ? Math.round(num * 100) : 0;
}

export function centsToEuroInput(cents: number): string {
  return (cents / 100).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
