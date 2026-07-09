import { useState, type FormEvent } from "react";
import { Modal } from "../../components/ui/Modal";
import { Field, FieldRow, Select, TextInput } from "../../components/ui/FormField";
import { Button } from "../../components/ui/Button";
import { useCreateCustomer, useUpdateCustomer } from "../../api/customers";
import { useInsurers } from "../../api/insurers";
import type { Customer, CustomerStatus } from "../../api/types";
import { toDateInputValue } from "../../lib/format";

export function CustomerFormModal({ customer, onClose }: { customer?: Customer; onClose: () => void }) {
  const isEdit = !!customer;
  const insurers = useInsurers();
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();

  const [firstName, setFirstName] = useState(customer?.firstName ?? "");
  const [lastName, setLastName] = useState(customer?.lastName ?? "");
  const [street, setStreet] = useState(customer?.street ?? "");
  const [postalCode, setPostalCode] = useState(customer?.postalCode ?? "");
  const [city, setCity] = useState(customer?.city ?? "");
  const [district, setDistrict] = useState(customer?.district ?? "");
  const [phone, setPhone] = useState(customer?.phone ?? "");
  const [birthDate, setBirthDate] = useState(customer?.birthDate ? toDateInputValue(customer.birthDate) : "");
  const [careLevel, setCareLevel] = useState(customer?.careLevel ?? 2);
  const [status, setStatus] = useState<CustomerStatus>(customer?.status ?? "NEU");
  const [insurerId, setInsurerId] = useState(customer?.insurerId ?? "");

  const saving = createCustomer.isPending || updateCustomer.isPending;
  const error = createCustomer.error ?? updateCustomer.error;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const data = {
      firstName,
      lastName,
      street,
      postalCode,
      city,
      district: district || null,
      phone,
      birthDate: birthDate || null,
      careLevel: Number(careLevel),
      status,
      insurerId: insurerId || null,
    };
    if (isEdit) {
      await updateCustomer.mutateAsync({ id: customer.id, data });
    } else {
      await createCustomer.mutateAsync(data);
    }
    onClose();
  }

  return (
    <Modal title={isEdit ? "Kunde bearbeiten" : "Kunde anlegen"} onClose={onClose} width={560}>
      <form onSubmit={handleSubmit}>
        <FieldRow>
          <Field label="Vorname">
            <TextInput value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
          </Field>
          <Field label="Nachname">
            <TextInput value={lastName} onChange={(e) => setLastName(e.target.value)} required />
          </Field>
        </FieldRow>
        <Field label="Straße & Hausnummer">
          <TextInput value={street} onChange={(e) => setStreet(e.target.value)} required />
        </Field>
        <FieldRow>
          <Field label="PLZ">
            <TextInput value={postalCode} onChange={(e) => setPostalCode(e.target.value)} required />
          </Field>
          <Field label="Ort">
            <TextInput value={city} onChange={(e) => setCity(e.target.value)} required />
          </Field>
        </FieldRow>
        <Field label="Stadtteil (optional)">
          <TextInput value={district ?? ""} onChange={(e) => setDistrict(e.target.value)} />
        </Field>
        <FieldRow>
          <Field label="Telefon">
            <TextInput value={phone} onChange={(e) => setPhone(e.target.value)} required />
          </Field>
          <Field label="Geburtsdatum">
            <TextInput type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
          </Field>
        </FieldRow>
        <FieldRow>
          <Field label="Pflegegrad">
            <Select value={careLevel} onChange={(e) => setCareLevel(Number(e.target.value))}>
              {[1, 2, 3, 4, 5].map((g) => (
                <option key={g} value={g}>
                  Grad {g}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Status">
            <Select value={status} onChange={(e) => setStatus(e.target.value as CustomerStatus)}>
              <option value="NEU">Neu</option>
              <option value="AKTIV">Aktiv</option>
              <option value="PAUSIERT">Pausiert</option>
            </Select>
          </Field>
        </FieldRow>
        <Field label="Pflegekasse">
          <Select value={insurerId} onChange={(e) => setInsurerId(e.target.value)}>
            <option value="">Keine zugeordnet</option>
            {insurers.data?.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name}
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
            {saving ? "Speichern…" : isEdit ? "Speichern" : "Kunde anlegen"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
