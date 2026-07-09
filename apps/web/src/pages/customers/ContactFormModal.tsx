import { useState, type FormEvent } from "react";
import { Modal } from "../../components/ui/Modal";
import { Field, TextInput } from "../../components/ui/FormField";
import { Button } from "../../components/ui/Button";
import { useCreateContact } from "../../api/customers";

export function ContactFormModal({ customerId, onClose }: { customerId: string; onClose: () => void }) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [phone, setPhone] = useState("");
  const createContact = useCreateContact(customerId);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    await createContact.mutateAsync({ name, role, phone });
    onClose();
  }

  return (
    <Modal title="Kontakt hinzufügen" onClose={onClose} width={420}>
      <form onSubmit={handleSubmit}>
        <Field label="Name">
          <TextInput value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
        </Field>
        <Field label="Rolle" hint="z. B. Sohn · Bevollmächtigter, Hausärztin">
          <TextInput value={role} onChange={(e) => setRole(e.target.value)} required />
        </Field>
        <Field label="Telefon">
          <TextInput value={phone} onChange={(e) => setPhone(e.target.value)} required />
        </Field>
        {createContact.error && (
          <div style={{ color: "#B24A3F", fontSize: 12.5, marginBottom: 12 }}>{createContact.error.message}</div>
        )}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
          <Button type="button" variant="secondary" onClick={onClose}>
            Abbrechen
          </Button>
          <Button type="submit" variant="primary" disabled={createContact.isPending}>
            {createContact.isPending ? "Speichern…" : "Hinzufügen"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
