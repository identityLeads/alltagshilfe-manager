import { useState } from "react";
import { Plus, Trash } from "@phosphor-icons/react";
import { usePageHeader } from "../../components/layout/PageHeaderContext";
import { PageContainer, FilterPill } from "../../components/ui/Card";
import { Button, IconButton } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { LoadingState, ErrorState, EmptyState } from "../../components/ui/States";
import { useServices, useDeleteService } from "../../api/services";
import { eur } from "../../lib/format";
import { SERVICE_CATEGORY_LABEL, BILLING_TYPE_LABEL, BILLING_TYPE_TONE } from "../../lib/tokens";
import { ServiceIcon } from "../../lib/serviceIcons";
import type { Service, ServiceCategory } from "../../api/types";
import { ServiceFormModal } from "./ServiceFormModal";

const FILTERS: { key: ServiceCategory | "ALLE"; label: string }[] = [
  { key: "ALLE", label: "Alle" },
  { key: "HAUSHALTSNAHE_DL", label: "Haushaltsnahe DL" },
  { key: "BETREUUNG_IM_ALLTAG", label: "Betreuung im Alltag" },
  { key: "SONSTIGES", label: "Sonstiges" },
];

export function ServiceList() {
  usePageHeader("Leistungskatalog", "Angebotene Leistungen und Preise");
  const [filter, setFilter] = useState<ServiceCategory | "ALLE">("ALLE");
  const { data: allServices } = useServices();
  const { data: services, isLoading, isError } = useServices(filter === "ALLE" ? undefined : filter);
  const deleteService = useDeleteService();

  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [deleting, setDeleting] = useState<Service | null>(null);

  const counts = {
    ALLE: allServices?.length ?? 0,
    HAUSHALTSNAHE_DL: allServices?.filter((s) => s.category === "HAUSHALTSNAHE_DL").length ?? 0,
    BETREUUNG_IM_ALLTAG: allServices?.filter((s) => s.category === "BETREUUNG_IM_ALLTAG").length ?? 0,
    SONSTIGES: allServices?.filter((s) => s.category === "SONSTIGES").length ?? 0,
  };

  return (
    <PageContainer>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 7 }}>
          {FILTERS.map((f) => (
            <FilterPill key={f.key} active={filter === f.key} onClick={() => setFilter(f.key)}>
              {f.label} · {counts[f.key]}
            </FilterPill>
          ))}
        </div>
        <Button variant="primary" icon={<Plus size={16} />} style={{ marginLeft: "auto" }} onClick={() => setCreateOpen(true)}>
          Leistung anlegen
        </Button>
      </div>

      {isLoading && <LoadingState />}
      {isError && <ErrorState message="Leistungen konnten nicht geladen werden." />}

      {services && (
        <div style={{ background: "#fff", border: "1px solid #E4E8E6", borderRadius: 13, overflow: "hidden" }}>
          {services.length === 0 ? (
            <EmptyState label="Keine Leistungen in dieser Ansicht." />
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
              <thead>
                <tr style={{ background: "#FAFBFA", color: "#7C8983", textAlign: "left", fontSize: 11.5, textTransform: "uppercase", letterSpacing: ".05em" }}>
                  <th style={{ padding: "12px 16px", fontWeight: 600 }}>Bezeichnung</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600 }}>Kategorie</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600 }}>Abrechnung</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600, textAlign: "right" }}>Preis</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600 }}>Einheit</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600, width: 40 }} />
                </tr>
              </thead>
              <tbody>
                {services.map((l) => (
                  <tr
                    key={l.id}
                    className="rowhov"
                    style={{ borderTop: "1px solid #EEF1EF", cursor: "pointer" }}
                    onClick={() => setEditing(l)}
                  >
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            flex: "none",
                            borderRadius: 8,
                            background: "var(--accent-soft)",
                            color: "var(--accent)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <ServiceIcon icon={l.icon} size={17} />
                        </div>
                        <span style={{ fontWeight: 600 }}>{l.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <Badge tone="gray">{SERVICE_CATEGORY_LABEL[l.category]}</Badge>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <Badge tone={BILLING_TYPE_TONE[l.billingType]}>{BILLING_TYPE_LABEL[l.billingType]}</Badge>
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "right", fontWeight: 600, fontFamily: "'IBM Plex Mono',monospace" }}>
                      {eur(l.priceCents)}
                    </td>
                    <td style={{ padding: "12px 16px", color: "#8A958F" }}>{l.unit}</td>
                    <td style={{ padding: "12px 16px", textAlign: "center" }}>
                      <IconButton
                        icon={<Trash size={15} />}
                        style={{ width: 30, height: 30, color: "#B24A3F", border: "none", background: "transparent" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleting(l);
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

      {createOpen && <ServiceFormModal onClose={() => setCreateOpen(false)} />}
      {editing && <ServiceFormModal service={editing} onClose={() => setEditing(null)} />}
      {deleting && (
        <ConfirmDialog
          title="Leistung löschen"
          message={`Möchten Sie „${deleting.name}“ wirklich löschen? Dies kann nicht rückgängig gemacht werden.`}
          onCancel={() => setDeleting(null)}
          onConfirm={async () => {
            await deleteService.mutateAsync(deleting.id);
            setDeleting(null);
          }}
        />
      )}
    </PageContainer>
  );
}
