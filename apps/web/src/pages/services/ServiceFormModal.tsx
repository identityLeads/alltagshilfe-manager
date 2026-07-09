import { useState, type FormEvent } from "react";
import { Modal } from "../../components/ui/Modal";
import { Field, FieldRow, Select, TextInput } from "../../components/ui/FormField";
import { Button } from "../../components/ui/Button";
import { useCreateService, useUpdateService } from "../../api/services";
import type { Service, ServiceCategory, BillingType } from "../../api/types";
import { SERVICE_CATEGORY_LABEL, BILLING_TYPE_LABEL } from "../../lib/tokens";
import { SERVICE_ICON_OPTIONS } from "../../lib/serviceIcons";

function formatPriceInput(cents: number): string {
  return (cents / 100).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function parsePriceInput(value: string): number {
  return Math.round(parseFloat(value.replace(",", ".")) * 100);
}

export function ServiceFormModal({ service, onClose }: { service?: Service; onClose: () => void }) {
  const isEdit = !!service;
  const createService = useCreateService();
  const updateService = useUpdateService();

  const [name, setName] = useState(service?.name ?? "");
  const [category, setCategory] = useState<ServiceCategory>(service?.category ?? "HAUSHALTSNAHE_DL");
  const [billingType, setBillingType] = useState<BillingType>(service?.billingType ?? "KASSE_45B");
  const [price, setPrice] = useState(service ? formatPriceInput(service.priceCents) : "");
  const [unit, setUnit] = useState(service?.unit ?? "pro Stunde");
  const [icon, setIcon] = useState(service?.icon ?? SERVICE_ICON_OPTIONS[0].value);

  const saving = createService.isPending || updateService.isPending;
  const error = createService.error ?? updateService.error;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const data = {
      name,
      category,
      billingType,
      priceCents: parsePriceInput(price),
      unit,
      icon,
    };
    if (isEdit) {
      await updateService.mutateAsync({ id: service.id, data });
    } else {
      await createService.mutateAsync(data);
    }
    onClose();
  }

  return (
    <Modal title={isEdit ? "Leistung bearbeiten" : "Leistung anlegen"} onClose={onClose} width={520}>
      <form onSubmit={handleSubmit}>
        <Field label="Bezeichnung">
          <TextInput value={name} onChange={(e) => setName(e.target.value)} required />
        </Field>
        <FieldRow>
          <Field label="Kategorie">
            <Select value={category} onChange={(e) => setCategory(e.target.value as ServiceCategory)}>
              <option value="HAUSHALTSNAHE_DL">{SERVICE_CATEGORY_LABEL.HAUSHALTSNAHE_DL}</option>
              <option value="BETREUUNG_IM_ALLTAG">{SERVICE_CATEGORY_LABEL.BETREUUNG_IM_ALLTAG}</option>
              <option value="SONSTIGES">{SERVICE_CATEGORY_LABEL.SONSTIGES}</option>
            </Select>
          </Field>
          <Field label="Abrechnung">
            <Select value={billingType} onChange={(e) => setBillingType(e.target.value as BillingType)}>
              <option value="KASSE_45B">{BILLING_TYPE_LABEL.KASSE_45B}</option>
              <option value="SELBSTZAHLER">{BILLING_TYPE_LABEL.SELBSTZAHLER}</option>
            </Select>
          </Field>
        </FieldRow>
        <FieldRow>
          <Field label="Preis (€)" hint="z. B. 32,00">
            <TextInput value={price} onChange={(e) => setPrice(e.target.value)} required inputMode="decimal" />
          </Field>
          <Field label="Einheit">
            <TextInput value={unit} onChange={(e) => setUnit(e.target.value)} required />
          </Field>
        </FieldRow>
        <Field label="Symbol">
          <Select value={icon} onChange={(e) => setIcon(e.target.value)}>
            {SERVICE_ICON_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </Field>

        {error && (
          <div style={{ color: "#B24A3F", fontSize: 12.5, marginBottom: 12 }}>{(error as Error).message}</div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
          <Button type="button" variant="secondary" onClick={onClose}>
            Abbrechen
          </Button>
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? "Speichern…" : isEdit ? "Speichern" : "Leistung anlegen"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
