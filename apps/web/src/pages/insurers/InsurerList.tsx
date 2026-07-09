import { useState } from "react";
import { Buildings, Plus, Trash } from "@phosphor-icons/react";
import { usePageHeader } from "../../components/layout/PageHeaderContext";
import { PageContainer } from "../../components/ui/Card";
import { Button, IconButton } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { LoadingState, ErrorState, EmptyState } from "../../components/ui/States";
import { useInsurers, useDeleteInsurer } from "../../api/insurers";
import { BILLING_METHOD_LABEL, BILLING_METHOD_TONE } from "../../lib/tokens";
import type { Insurer } from "../../api/types";
import { InsurerFormModal } from "./InsurerFormModal";

export function InsurerList() {
  usePageHeader("Kranken- & Pflegekassen", "Kostenträger und Abrechnungswege");
  const { data: insurers, isLoading, isError } = useInsurers();
  const deleteInsurer = useDeleteInsurer();

  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Insurer | null>(null);
  const [deleting, setDeleting] = useState<Insurer | null>(null);

  return (
    <PageContainer>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 13, color: "#7C8983" }}>
          {insurers?.length ?? 0} Kranken- & Pflegekassen · verwaltet nach Institutionskennzeichen (IK)
        </div>
        <Button
          variant="primary"
          icon={<Plus size={16} />}
          style={{ marginLeft: "auto" }}
          onClick={() => setCreateOpen(true)}
        >
          Kostenträger anlegen
        </Button>
      </div>

      {isLoading && <LoadingState />}
      {isError && <ErrorState message="Kostenträger konnten nicht geladen werden." />}

      {insurers && (
        <div style={{ background: "#fff", border: "1px solid #E4E8E6", borderRadius: 13, overflow: "hidden" }}>
          {insurers.length === 0 ? (
            <EmptyState label="Keine Kostenträger vorhanden." />
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
              <thead>
                <tr style={{ background: "#FAFBFA", color: "#7C8983", textAlign: "left", fontSize: 11.5, textTransform: "uppercase", letterSpacing: ".05em" }}>
                  <th style={{ padding: "12px 16px", fontWeight: 600 }}>Kostenträger</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600 }}>IK-Nummer</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600 }}>Ansprechpartner</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600 }}>Abrechnungsweg</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600, textAlign: "center" }}>Kunden</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600, width: 40 }} />
                </tr>
              </thead>
              <tbody>
                {insurers.map((k) => (
                  <tr
                    key={k.id}
                    className="rowhov"
                    style={{ borderTop: "1px solid #EEF1EF", cursor: "pointer" }}
                    onClick={() => setEditing(k)}
                  >
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div
                          style={{
                            width: 34,
                            height: 34,
                            flex: "none",
                            borderRadius: 8,
                            background: "#EEF1F5",
                            color: "#2C6B8C",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Buildings size={18} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: "#17211C" }}>{k.name}</div>
                          <div style={{ fontSize: 12, color: "#8A958F" }}>{k.type}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px", fontFamily: "'IBM Plex Mono',monospace", color: "#4A574F" }}>{k.ik}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ fontWeight: 500 }}>{k.contactPerson}</div>
                      <div style={{ fontSize: 12, color: "#8A958F", fontFamily: "'IBM Plex Mono',monospace" }}>{k.phone}</div>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <Badge tone={BILLING_METHOD_TONE[k.billingMethod]}>{BILLING_METHOD_LABEL[k.billingMethod]}</Badge>
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "center", fontWeight: 600, fontFamily: "'IBM Plex Mono',monospace" }}>
                      {k.customerCount ?? 0}
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "center" }}>
                      <IconButton
                        icon={<Trash size={15} />}
                        style={{ width: 30, height: 30, color: "#B24A3F", border: "none", background: "transparent" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleting(k);
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {createOpen && <InsurerFormModal onClose={() => setCreateOpen(false)} />}
      {editing && <InsurerFormModal insurer={editing} onClose={() => setEditing(null)} />}
      {deleting && (
        <ConfirmDialog
          title="Kostenträger löschen"
          message={`Möchten Sie „${deleting.name}“ wirklich löschen? Dies kann nicht rückgängig gemacht werden.`}
          onCancel={() => setDeleting(null)}
          onConfirm={async () => {
            await deleteInsurer.mutateAsync(deleting.id);
            setDeleting(null);
          }}
        />
      )}
    </PageContainer>
  );
}
