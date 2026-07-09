import { useState, type FormEvent } from "react";
import { Modal } from "../../components/ui/Modal";
import { Field, FieldRow, Select, TextInput } from "../../components/ui/FormField";
import { Button } from "../../components/ui/Button";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { useCreateTourAssignment, useDeleteTourAssignment, useUpdateTourAssignment } from "../../api/tours";
import { useCustomers } from "../../api/customers";
import { useStaffList } from "../../api/staff";
import { useServices } from "../../api/services";
import { fullName } from "../../lib/format";
import type { TourAssignment } from "../../api/types";

function minutesToTime(mins: number) {
  return `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;
}
function timeToMinutes(time: string) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function TourAssignmentFormModal({
  assignment,
  date,
  onClose,
}: {
  assignment?: TourAssignment;
  date: string;
  onClose: () => void;
}) {
  const isEdit = !!assignment;
  const customers = useCustomers();
  const staff = useStaffList();
  const services = useServices();
  const createAssignment = useCreateTourAssignment();
  const updateAssignment = useUpdateTourAssignment();
  const deleteAssignment = useDeleteTourAssignment();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [staffId, setStaffId] = useState(assignment?.staffId ?? "");
  const [customerId, setCustomerId] = useState(assignment?.customerId ?? "");
  const [serviceLabel, setServiceLabel] = useState(assignment?.serviceLabel ?? "");
  const [startTime, setStartTime] = useState(assignment ? minutesToTime(assignment.startMinutes) : "09:00");
  const [durationMinutes, setDurationMinutes] = useState(assignment?.durationMinutes ?? 60);

  const saving = createAssignment.isPending || updateAssignment.isPending;
  const error = createAssignment.error ?? updateAssignment.error;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const data = {
      staffId,
      customerId,
      serviceLabel,
      date,
      startMinutes: timeToMinutes(startTime),
      durationMinutes: Number(durationMinutes),
    };
    if (isEdit) {
      await updateAssignment.mutateAsync({ id: assignment.id, data });
    } else {
      await createAssignment.mutateAsync(data);
    }
    onClose();
  }

  return (
    <Modal title={isEdit ? "Einsatz bearbeiten" : "Einsatz planen"} onClose={onClose} width={480}>
      <form onSubmit={handleSubmit}>
        <Field label="Mitarbeiter">
          <Select value={staffId} onChange={(e) => setStaffId(e.target.value)} required>
            <option value="" disabled>
              Mitarbeiter wählen…
            </option>
            {staff.data?.map((s) => (
              <option key={s.id} value={s.id}>
                {fullName(s)}
              </option>
            ))}
          </Select>
        </Field>
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
        <Field label="Leistung">
          <Select value={serviceLabel} onChange={(e) => setServiceLabel(e.target.value)} required>
            <option value="" disabled>
              Leistung wählen…
            </option>
            {services.data?.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name}
              </option>
            ))}
          </Select>
        </Field>
        <FieldRow>
          <Field label="Beginn">
            <TextInput type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
          </Field>
          <Field label="Dauer (Minuten)">
            <TextInput
              type="number"
              min={15}
              step={15}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              required
            />
          </Field>
        </FieldRow>

        {error && <div style={{ color: "#B24A3F", fontSize: 12.5, marginBottom: 12 }}>{(error as Error).message}</div>}

        <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginTop: 8 }}>
          {isEdit ? (
            <Button type="button" variant="danger" onClick={() => setConfirmDelete(true)}>
              Löschen
            </Button>
          ) : (
            <span />
          )}
          <div style={{ display: "flex", gap: 8 }}>
            <Button type="button" variant="secondary" onClick={onClose}>
              Abbrechen
            </Button>
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? "Speichern…" : isEdit ? "Speichern" : "Einsatz anlegen"}
            </Button>
          </div>
        </div>
      </form>
      {confirmDelete && assignment && (
        <ConfirmDialog
          title="Einsatz löschen"
          message="Möchten Sie diesen Einsatz wirklich aus der Tourenplanung entfernen?"
          onCancel={() => setConfirmDelete(false)}
          onConfirm={() => {
            deleteAssignment.mutate(assignment.id);
            setConfirmDelete(false);
            onClose();
          }}
        />
      )}
    </Modal>
  );
}
