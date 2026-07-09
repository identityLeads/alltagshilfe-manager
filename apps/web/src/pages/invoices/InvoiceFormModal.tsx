import { useState, type FormEvent } from "react";
import { Plus, Trash } from "@phosphor-icons/react";
import { Modal } from "../../components/ui/Modal";
import { Field, FieldRow, Select, TextInput } from "../../components/ui/FormField";
import { Button } from "../../components/ui/Button";
import { useCreateInvoice, useUpdateInvoice, type InvoiceLineItemInput } from "../../api/invoices";
import { useCustomers } from "../../api/customers";
import { useServices } from "../../api/services";
import { centsToEuroInput, eur, fullName, parseEuroToCents, toDateInputValue } from "../../lib/format";
import type { DocumentType, Invoice, InvoiceStatus } from "../../api/types";

interface LineItemDraft {
  serviceId: string;
  description: string;
  quantity: string;
  unit: string;
  unitPrice: string;
}

function emptyLine(): LineItemDraft {
  return { serviceId: "", description: "", quantity: "1", unit: "Std", unitPrice: "0,00" };
}

export function InvoiceFormModal({
  invoice,
  defaultCustomerId,
  onClose,
}: {
  invoice?: Invoice;
  defaultCustomerId?: string;
  onClose: () => void;
}) {
  const isEdit = !!invoice;
  const customers = useCustomers();
  const services = useServices();
  const createInvoice = useCreateInvoice();
  const updateInvoice = useUpdateInvoice();

  const [documentType, setDocumentType] = useState<DocumentType>(invoice?.documentType ?? "RECHNUNG");
  const [status, setStatus] = useState<InvoiceStatus>(invoice?.status ?? "ENTWURF");
  const [customerId, setCustomerId] = useState(invoice?.customerId ?? defaultCustomerId ?? "");
  const [issueDate, setIssueDate] = useState(invoice ? toDateInputValue(invoice.issueDate) : toDateInputValue(new Date()));
  const [period, setPeriod] = useState(invoice?.period ?? "");
  const [assignedToReliefBudget, setAssignedToReliefBudget] = useState(invoice?.assignedToReliefBudget ?? false);
  const [lines, setLines] = useState<LineItemDraft[]>(
    invoice && invoice.lineItems.length > 0
      ? invoice.lineItems.map((li) => ({
          serviceId: li.serviceId ?? "",
          description: li.description,
          quantity: String(li.quantity),
          unit: li.unit,
          unitPrice: centsToEuroInput(li.unitPriceCents),
        }))
      : [emptyLine()]
  );

  const saving = createInvoice.isPending || updateInvoice.isPending;
  const error = createInvoice.error ?? updateInvoice.error;

  function updateLine(index: number, patch: Partial<LineItemDraft>) {
    setLines((prev) => prev.map((l, i) => (i === index ? { ...l, ...patch } : l)));
  }

  function applyService(index: number, serviceId: string) {
    const service = services.data?.find((s) => s.id === serviceId);
    updateLine(index, {
      serviceId,
      description: service?.name ?? "",
      unit: service?.unit.replace("pro ", "") ?? "Std",
      unitPrice: service ? centsToEuroInput(service.priceCents) : "0,00",
    });
  }

  const subtotalCents = lines.reduce(
    (sum, l) => sum + Math.round(parseFloat(l.quantity.replace(",", ".") || "0") * parseEuroToCents(l.unitPrice)),
    0
  );

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const lineItems: InvoiceLineItemInput[] = lines
      .filter((l) => l.description.trim())
      .map((l) => ({
        serviceId: l.serviceId || null,
        description: l.description,
        quantity: parseFloat(l.quantity.replace(",", ".")) || 0,
        unit: l.unit,
        unitPriceCents: parseEuroToCents(l.unitPrice),
      }));
    const data = { documentType, status, customerId, issueDate, period, assignedToReliefBudget, lineItems };
    if (isEdit) {
      await updateInvoice.mutateAsync({ id: invoice.id, data });
    } else {
      await createInvoice.mutateAsync(data);
    }
    onClose();
  }

  return (
    <Modal title={isEdit ? `${invoice.number} bearbeiten` : "Dokument erstellen"} onClose={onClose} width={680}>
      <form onSubmit={handleSubmit}>
        <FieldRow>
          <Field label="Dokumenttyp">
            <Select value={documentType} onChange={(e) => setDocumentType(e.target.value as DocumentType)}>
              <option value="RECHNUNG">Rechnung</option>
              <option value="ANGEBOT">Angebot</option>
            </Select>
          </Field>
          <Field label="Status">
            <Select value={status} onChange={(e) => setStatus(e.target.value as InvoiceStatus)}>
              <option value="ENTWURF">Entwurf</option>
              <option value="VERSENDET">Versendet</option>
              <option value="OFFEN">Offen</option>
              <option value="BEZAHLT">Bezahlt</option>
              <option value="UEBERFAELLIG">Überfällig</option>
            </Select>
          </Field>
        </FieldRow>
        <FieldRow>
          <Field label="Kunde">
            <Select value={customerId} onChange={(e) => setCustomerId(e.target.value)} required>
              <option value="" disabled>
                Kunde wählen…
              </option>
              {customers.data?.map((c) => (
                <option key={c.id} value={c.id}>
                  {fullName(c)}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Datum">
            <TextInput type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} required />
          </Field>
        </FieldRow>
        <FieldRow>
          <Field label="Zeitraum" hint="z. B. Juli 2026">
            <TextInput value={period} onChange={(e) => setPeriod(e.target.value)} required />
          </Field>
          <Field label="Entlastungsbetrag">
            <label style={{ display: "flex", alignItems: "center", gap: 8, height: 38, fontSize: 13 }}>
              <input
                type="checkbox"
                checked={assignedToReliefBudget}
                onChange={(e) => setAssignedToReliefBudget(e.target.checked)}
              />
              An § 45b abgetreten
            </label>
          </Field>
        </FieldRow>

        <div style={{ fontSize: 12.5, fontWeight: 600, color: "#3B473F", margin: "18px 0 8px" }}>Leistungspositionen</div>
        <div style={{ border: "1px solid #E4E8E6", borderRadius: 10, overflow: "hidden", marginBottom: 8 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1.3fr 60px 60px 85px 28px",
              gap: 8,
              padding: "8px 10px",
              background: "#FAFBFA",
              fontSize: 11,
              fontWeight: 600,
              color: "#8A958F",
              textTransform: "uppercase",
              letterSpacing: ".04em",
            }}
          >
            <span>Aus Katalog</span>
            <span>Beschreibung</span>
            <span>Menge</span>
            <span>Einheit</span>
            <span>Preis (€)</span>
            <span />
          </div>
          {lines.map((line, i) => (
            <div
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1.3fr 60px 60px 85px 28px",
                gap: 8,
                padding: "8px 10px",
                borderTop: "1px solid #EEF1EF",
                alignItems: "center",
              }}
            >
              <Select value={line.serviceId} onChange={(e) => applyService(i, e.target.value)} style={{ height: 32, fontSize: 12.5, padding: "0 8px" }}>
                <option value="">Freitext…</option>
                {services.data?.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </Select>
              <TextInput
                placeholder="Beschreibung"
                value={line.description}
                onChange={(e) => updateLine(i, { description: e.target.value })}
                style={{ height: 32, fontSize: 12.5, padding: "0 8px" }}
              />
              <TextInput value={line.quantity} onChange={(e) => updateLine(i, { quantity: e.target.value })} style={{ height: 32, fontSize: 12.5, padding: "0 8px" }} />
              <TextInput value={line.unit} onChange={(e) => updateLine(i, { unit: e.target.value })} style={{ height: 32, fontSize: 12.5, padding: "0 8px" }} />
              <TextInput value={line.unitPrice} onChange={(e) => updateLine(i, { unitPrice: e.target.value })} style={{ height: 32, fontSize: 12.5, padding: "0 8px" }} />
              <button
                type="button"
                className="pbtn"
                onClick={() => setLines((prev) => (prev.length > 1 ? prev.filter((_, idx) => idx !== i) : prev))}
                style={{ border: "none", background: "none", color: "#B5BEB9", display: "flex", justifyContent: "center" }}
              >
                <Trash size={15} />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          className="pbtn"
          onClick={() => setLines((prev) => [...prev, emptyLine()])}
          style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12.5, fontWeight: 600, border: "none", background: "none", color: "var(--accent)", padding: 0 }}
        >
          <Plus size={14} /> Position hinzufügen
        </button>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14, fontSize: 13.5 }}>
          <div>
            Zwischensumme:{" "}
            <span className="mono" style={{ fontWeight: 700 }}>
              {eur(subtotalCents)}
            </span>
          </div>
        </div>

        {error && <div style={{ color: "#B24A3F", fontSize: 12.5, margin: "12px 0" }}>{(error as Error).message}</div>}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
          <Button type="button" variant="secondary" onClick={onClose}>
            Abbrechen
          </Button>
          <Button type="submit" variant="primary" disabled={saving || !customerId}>
            {saving ? "Speichern…" : isEdit ? "Speichern" : "Erstellen"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
