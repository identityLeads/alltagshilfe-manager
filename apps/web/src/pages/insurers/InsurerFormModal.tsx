import { useState, type FormEvent } from "react";
import { Modal } from "../../components/ui/Modal";
import { Field, FieldRow, Select, TextInput } from "../../components/ui/FormField";
import { Button } from "../../components/ui/Button";
import { useCreateInsurer, useUpdateInsurer } from "../../api/insurers";
import type { Insurer, BillingMethod } from "../../api/types";
import { BILLING_METHOD_LABEL } from "../../lib/tokens";

export function InsurerFormModal({ insurer, onClose }: { insurer?: Insurer; onClose: () => void }) {
  const isEdit = !!insurer;
  const createInsurer = useCreateInsurer();
  const updateInsurer = useUpdateInsurer();

  const [name, setName] = useState(insurer?.name ?? "");
  const [type, setType] = useState(insurer?.type ?? "Gesetzliche Pflegekasse");
  const [ik, setIk] = useState(insurer?.ik ?? "");
  const [contactPerson, setContactPerson] = useState(insurer?.contactPerson ?? "");
  const [phone, setPhone] = useState(insurer?.phone ?? "");
  const [billingMethod, setBillingMethod] = useState<BillingMethod>(insurer?.billingMethod ?? "DTA_302");

  const saving = createInsurer.isPending || updateInsurer.isPending;
  const error = createInsurer.error ?? updateInsurer.error;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const data = { name, type, ik, contactPerson, phone, billingMethod };
    if (isEdit) {
      await updateInsurer.mutateAsync({ id: insurer.id, data });
    } else {
      await createInsurer.mutateAsync(data);
    }
    onClose();
  }

  return (
    <Modal title={isEdit ? "Kostenträger bearbeiten" : "Kostenträger anlegen"} onClose={onClose} width={520}>
      <form onSubmit={handleSubmit}>
        <Field label="Name">
          <TextInput value={name} onChange={(e) => setName(e.target.value)} required />
        </Field>
        <Field label="Typ">
          <TextInput value={type} onChange={(e) => setType(e.target.value)} required />
        </Field>
        <FieldRow>
          <Field label="IK-Nummer">
            <TextInput value={ik} onChange={(e) => setIk(e.target.value)} required />
          </Field>
          <Field label="Abrechnungsweg">
            <Select value={billingMethod} onChange={(e) => setBillingMethod(e.target.value as BillingMethod)}>
              <option value="DTA_302">{BILLING_METHOD_LABEL.DTA_302}</option>
              <option value="PAPIER_POST">{BILLING_METHOD_LABEL.PAPIER_POST}</option>
            </Select>
          </Field>
        </FieldRow>
        <FieldRow>
          <Field label="Ansprechpartner">
            <TextInput value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} required />
          </Field>
          <Field label="Telefon">
            <TextInput value={phone} onChange={(e) => setPhone(e.target.value)} required />
          </Field>
        </FieldRow>

        {error && (
          <div style={{ color: "#B24A3F", fontSize: 12.5, marginBottom: 12 }}>{(error as Error).message}</div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
          <Button type="button" variant="secondary" onClick={onClose}>
            Abbrechen
          </Button>
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? "Speichern…" : isEdit ? "Speichern" : "Kostenträger anlegen"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
