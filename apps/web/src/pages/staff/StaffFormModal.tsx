import { useState, type FormEvent, type KeyboardEvent } from "react";
import { X } from "@phosphor-icons/react";
import { Modal } from "../../components/ui/Modal";
import { Field, FieldRow, TextInput } from "../../components/ui/FormField";
import { Button } from "../../components/ui/Button";
import { useCreateStaff, useUpdateStaff } from "../../api/staff";
import type { Staff } from "../../api/types";

export function StaffFormModal({ staff, onClose }: { staff?: Staff; onClose: () => void }) {
  const isEdit = !!staff;
  const createStaff = useCreateStaff();
  const updateStaff = useUpdateStaff();

  const [firstName, setFirstName] = useState(staff?.firstName ?? "");
  const [lastName, setLastName] = useState(staff?.lastName ?? "");
  const [area, setArea] = useState(staff?.area ?? "");
  const [phone, setPhone] = useState(staff?.phone ?? "");
  const [availabilityLabel, setAvailabilityLabel] = useState(staff?.availabilityLabel ?? "Mo–Fr");
  const [weeklyCapacityHours, setWeeklyCapacityHours] = useState(staff?.weeklyCapacityHours ?? 20);
  const [qualifications, setQualifications] = useState<string[]>(staff?.qualifications ?? []);
  const [qualInput, setQualInput] = useState("");

  const saving = createStaff.isPending || updateStaff.isPending;
  const error = createStaff.error ?? updateStaff.error;

  function addQualification() {
    const value = qualInput.trim();
    if (value && !qualifications.includes(value)) {
      setQualifications([...qualifications, value]);
    }
    setQualInput("");
  }

  function handleQualKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      addQualification();
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const data = {
      firstName,
      lastName,
      area,
      phone,
      availabilityLabel,
      weeklyCapacityHours: Number(weeklyCapacityHours),
      qualifications,
    };
    if (isEdit) {
      await updateStaff.mutateAsync({ id: staff.id, data });
    } else {
      await createStaff.mutateAsync(data);
    }
    onClose();
  }

  return (
    <Modal title={isEdit ? "Mitarbeiter bearbeiten" : "Mitarbeiter anlegen"} onClose={onClose} width={560}>
      <form onSubmit={handleSubmit}>
        <FieldRow>
          <Field label="Vorname">
            <TextInput value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
          </Field>
          <Field label="Nachname">
            <TextInput value={lastName} onChange={(e) => setLastName(e.target.value)} required />
          </Field>
        </FieldRow>
        <FieldRow>
          <Field label="Einsatzgebiet">
            <TextInput value={area} onChange={(e) => setArea(e.target.value)} required />
          </Field>
          <Field label="Telefon">
            <TextInput value={phone} onChange={(e) => setPhone(e.target.value)} required />
          </Field>
        </FieldRow>
        <FieldRow>
          <Field label="Verfügbarkeit" hint="z. B. Mo–Fr">
            <TextInput value={availabilityLabel} onChange={(e) => setAvailabilityLabel(e.target.value)} required />
          </Field>
          <Field label="Wochenstunden">
            <TextInput
              type="number"
              min={0}
              value={weeklyCapacityHours}
              onChange={(e) => setWeeklyCapacityHours(Number(e.target.value))}
              required
            />
          </Field>
        </FieldRow>
        <Field label="Qualifikationen">
          <div style={{ display: "flex", gap: 8 }}>
            <TextInput
              value={qualInput}
              onChange={(e) => setQualInput(e.target.value)}
              onKeyDown={handleQualKeyDown}
              placeholder="z. B. Betreuungskraft §43b"
            />
            <Button type="button" variant="secondary" onClick={addQualification}>
              Hinzufügen
            </Button>
          </div>
          {qualifications.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
              {qualifications.map((q) => (
                <span
                  key={q}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    background: "var(--accent-soft)",
                    color: "var(--accent)",
                    fontSize: 11.5,
                    fontWeight: 600,
                    padding: "3px 9px",
                    borderRadius: 6,
                  }}
                >
                  {q}
                  <X
                    size={11}
                    weight="bold"
                    style={{ cursor: "pointer" }}
                    onClick={() => setQualifications(qualifications.filter((x) => x !== q))}
                  />
                </span>
              ))}
            </div>
          )}
        </Field>

        {error && (
          <div style={{ color: "#B24A3F", fontSize: 12.5, marginBottom: 12 }}>{(error as Error).message}</div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
          <Button type="button" variant="secondary" onClick={onClose}>
            Abbrechen
          </Button>
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? "Speichern…" : isEdit ? "Speichern" : "Mitarbeiter anlegen"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
