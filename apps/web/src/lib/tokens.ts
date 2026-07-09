import type {
  BillingMethod,
  BillingType,
  CustomerStatus,
  DocumentType,
  InvoiceStatus,
  RequestStatus,
  ServiceCategory,
  TaskPriority,
} from "../api/types";

export type Tone = "gray" | "info" | "warn" | "danger" | "success" | "neu";

export const TONE_COLORS: Record<Tone, [string, string]> = {
  gray: ["#F0F2F1", "#63706A"],
  info: ["#E9F1F5", "#2C6B8C"],
  warn: ["#FBF2DC", "#8A6D1E"],
  danger: ["#FBECEA", "#B24A3F"],
  success: ["var(--accent-soft)", "var(--accent)"],
  neu: ["#E9F1F5", "#2C6B8C"],
};

export const AVATAR_PALETTE: [string, string][] = [
  ["#EAF3EF", "#2E7D63"],
  ["#EEF1F5", "#2C6B8C"],
  ["#F3EEF5", "#7A4B8C"],
  ["#FBF2E4", "#A9721A"],
  ["#F5EEEE", "#A0524A"],
  ["#EAF1F0", "#357A72"],
];

export function avatarColors(seed: number): [string, string] {
  return AVATAR_PALETTE[seed % AVATAR_PALETTE.length];
}

export const CUSTOMER_STATUS_LABEL: Record<CustomerStatus, string> = {
  AKTIV: "Aktiv",
  NEU: "Neu",
  PAUSIERT: "Pausiert",
};

export const CUSTOMER_STATUS_TONE: Record<CustomerStatus, Tone> = {
  AKTIV: "success",
  NEU: "neu",
  PAUSIERT: "gray",
};

export const CARE_LEVEL_LABEL = (level: number) => `Grad ${level}`;

export const BILLING_METHOD_LABEL: Record<BillingMethod, string> = {
  DTA_302: "DTA §302",
  PAPIER_POST: "Papier / Post",
};

export const BILLING_METHOD_TONE: Record<BillingMethod, Tone> = {
  DTA_302: "success",
  PAPIER_POST: "gray",
};

export const SERVICE_CATEGORY_LABEL: Record<ServiceCategory, string> = {
  HAUSHALTSNAHE_DL: "Haushaltsnahe DL",
  BETREUUNG_IM_ALLTAG: "Betreuung im Alltag",
  SONSTIGES: "Sonstiges",
};

export const BILLING_TYPE_LABEL: Record<BillingType, string> = {
  KASSE_45B: "Kasse §45b",
  SELBSTZAHLER: "Selbstzahler",
};

export const BILLING_TYPE_TONE: Record<BillingType, Tone> = {
  KASSE_45B: "info",
  SELBSTZAHLER: "warn",
};

export const INVOICE_STATUS_LABEL: Record<InvoiceStatus, string> = {
  ENTWURF: "Entwurf",
  VERSENDET: "Versendet",
  OFFEN: "Offen",
  BEZAHLT: "Bezahlt",
  UEBERFAELLIG: "Überfällig",
};

export const INVOICE_STATUS_TONE: Record<InvoiceStatus, Tone> = {
  ENTWURF: "gray",
  VERSENDET: "info",
  OFFEN: "warn",
  BEZAHLT: "success",
  UEBERFAELLIG: "danger",
};

export const DOCUMENT_TYPE_LABEL: Record<DocumentType, string> = {
  RECHNUNG: "Rechnung",
  ANGEBOT: "Angebot",
};

export const TASK_PRIORITY_COLOR: Record<TaskPriority, string> = {
  HOCH: "#B24A3F",
  MITTEL: "#B5820E",
  NIEDRIG: "#B9D4C8",
};

export const TASK_PRIORITY_LABEL: Record<TaskPriority, string> = {
  HOCH: "Hoch",
  MITTEL: "Mittel",
  NIEDRIG: "Niedrig",
};

export const REQUEST_STATUS_LABEL: Record<RequestStatus, string> = {
  NEU: "Neu",
  ANGENOMMEN: "Angenommen",
  ABGELEHNT: "Abgelehnt",
};

export function budgetColor(usedCents: number, monthlyCents: number): string {
  const pct = (usedCents / monthlyCents) * 100;
  if (pct >= 94.4) return "#B24A3F";
  if (pct >= 76) return "#B5820E";
  return "var(--accent)";
}

export const ACCENT_OPTIONS = [
  { label: "Pflege-Grün", value: "#2E7D63" },
  { label: "Tanne", value: "#357A72" },
  { label: "Ozean", value: "#2C6B8C" },
  { label: "Lavendel", value: "#6C6FB0" },
  { label: "Terrakotta", value: "#A0703A" },
];
