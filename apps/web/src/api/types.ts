export type CustomerStatus = "AKTIV" | "NEU" | "PAUSIERT";
export type BillingMethod = "DTA_302" | "PAPIER_POST";
export type ServiceCategory = "HAUSHALTSNAHE_DL" | "BETREUUNG_IM_ALLTAG" | "SONSTIGES";
export type BillingType = "KASSE_45B" | "SELBSTZAHLER";
export type DocumentType = "RECHNUNG" | "ANGEBOT";
export type InvoiceStatus = "ENTWURF" | "VERSENDET" | "OFFEN" | "BEZAHLT" | "UEBERFAELLIG";
export type TaskPriority = "HOCH" | "MITTEL" | "NIEDRIG";
export type RequestStatus = "NEU" | "ANGENOMMEN" | "ABGELEHNT";

export interface Insurer {
  id: string;
  name: string;
  type: string;
  ik: string;
  contactPerson: string;
  phone: string;
  billingMethod: BillingMethod;
  customerCount?: number;
}

export interface Contact {
  id: string;
  customerId: string;
  name: string;
  role: string;
  phone: string;
}

export interface CustomerDocument {
  id: string;
  customerId: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
  uploadedAt: string;
}

export interface Service {
  id: string;
  name: string;
  category: ServiceCategory;
  billingType: BillingType;
  priceCents: number;
  unit: string;
  icon: string;
}

export interface ServiceRecord {
  id: string;
  customerId: string;
  serviceId: string | null;
  service: Service | null;
  staffId: string | null;
  staff: Staff | null;
  date: string;
  amountCents: number;
  billedToReliefBudget: boolean;
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  street: string;
  postalCode: string;
  city: string;
  district: string | null;
  phone: string;
  birthDate: string | null;
  careLevel: number;
  status: CustomerStatus;
  customerSince: string;
  insurerId: string | null;
  insurer: Insurer | null;
  contacts?: Contact[];
  documents?: CustomerDocument[];
  serviceRecords?: ServiceRecord[];
  reliefBudgetUsedCents: number;
  reliefBudgetMonthlyCents: number;
}

export interface Staff {
  id: string;
  firstName: string;
  lastName: string;
  area: string;
  phone: string;
  qualifications: string[];
  availabilityLabel: string;
  weeklyCapacityHours: number;
  utilizationPct: number;
}

export interface InvoiceLineItem {
  id: string;
  invoiceId: string;
  serviceId: string | null;
  service: Service | null;
  description: string;
  quantity: string;
  unit: string;
  unitPriceCents: number;
}

export interface Invoice {
  id: string;
  number: string;
  documentType: DocumentType;
  status: InvoiceStatus;
  customerId: string;
  customer: Customer;
  issueDate: string;
  period: string;
  assignedToReliefBudget: boolean;
  lineItems: InvoiceLineItem[];
  subtotalCents: number;
  totalCents: number;
}

export interface TourAssignment {
  id: string;
  staffId: string;
  staff: Staff;
  customerId: string;
  customer: Customer;
  serviceLabel: string;
  date: string;
  startMinutes: number;
  durationMinutes: number;
}

export interface Task {
  id: string;
  text: string;
  meta: string | null;
  priority: TaskPriority;
  done: boolean;
  dueDate: string | null;
}

export interface ServiceRequest {
  id: string;
  name: string;
  info: string;
  status: RequestStatus;
  createdAt: string;
}

export interface DashboardData {
  openInvoicesCount: number;
  openInvoicesOverdueCount: number;
  openInvoicesTotalCents: number;
  toursTodayCount: number;
  staffTodayCount: number;
  newRequestsCount: number;
  avgBudgetUsedPct: number;
  week: number[];
  upcomingToday: TourAssignment[];
}
