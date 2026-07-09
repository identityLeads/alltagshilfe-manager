import { useState } from "react";
import { UserPlus, MapPin, CalendarDots, Trash } from "@phosphor-icons/react";
import { usePageHeader } from "../../components/layout/PageHeaderContext";
import { PageContainer } from "../../components/ui/Card";
import { Button, IconButton } from "../../components/ui/Button";
import { Avatar } from "../../components/ui/Avatar";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { ProgressBar, LoadingState, ErrorState, EmptyState } from "../../components/ui/States";
import { useStaffList, useDeleteStaff } from "../../api/staff";
import { initials, fullName } from "../../lib/format";
import type { Staff } from "../../api/types";
import { StaffFormModal } from "./StaffFormModal";

export function StaffList() {
  usePageHeader("Mitarbeiter", "Qualifikationen, Verfügbarkeiten und Einsatzgebiete");
  const { data: staff, isLoading, isError } = useStaffList();
  const deleteStaff = useDeleteStaff();

  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Staff | null>(null);
  const [deleting, setDeleting] = useState<Staff | null>(null);

  return (
    <PageContainer>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 13, color: "#7C8983" }}>
          {staff?.length ?? 0} Mitarbeiter · Qualifikationen, Verfügbarkeit und Einsatzgebiete
        </div>
        <Button
          variant="primary"
          icon={<UserPlus size={16} />}
          style={{ marginLeft: "auto" }}
          onClick={() => setCreateOpen(true)}
        >
          Mitarbeiter anlegen
        </Button>
      </div>

      {isLoading && <LoadingState />}
      {isError && <ErrorState message="Mitarbeiter konnten nicht geladen werden." />}

      {staff && (
        <>
          {staff.length === 0 ? (
            <div style={{ background: "#fff", border: "1px solid #E4E8E6", borderRadius: 13 }}>
              <EmptyState label="Keine Mitarbeiter vorhanden." />
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
              {staff.map((m, i) => {
                const aColor = m.utilizationPct >= 88 ? "#B5820E" : "var(--accent)";
                return (
                  <div
                    key={m.id}
                    className="lift"
                    style={{ background: "#fff", border: "1px solid #E4E8E6", borderRadius: 13, padding: 18, cursor: "pointer", position: "relative" }}
                    onClick={() => setEditing(m)}
                  >
                    <IconButton
                      icon={<Trash size={14} />}
                      style={{
                        position: "absolute",
                        top: 12,
                        right: 12,
                        width: 28,
                        height: 28,
                        border: "none",
                        background: "transparent",
                        color: "#B24A3F",
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleting(m);
                      }}
                    />
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                      <Avatar initials={initials(m.firstName, m.lastName)} seed={i} size={44} fontSize={15} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14.5 }}>{fullName(m)}</div>
                        <div style={{ fontSize: 12, color: "#8A958F", display: "flex", alignItems: "center", gap: 2 }}>
                          <MapPin size={13} />
                          {m.area}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14, minHeight: 24 }}>
                      {m.qualifications.map((q) => (
                        <span
                          key={q}
                          style={{
                            background: "var(--accent-soft)",
                            color: "var(--accent)",
                            fontSize: 11.5,
                            fontWeight: 600,
                            padding: "3px 9px",
                            borderRadius: 6,
                          }}
                        >
                          {q}
                        </span>
                      ))}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#8A958F", marginBottom: 5 }}>
                      <span>Auslastung diese Woche</span>
                      <span style={{ fontWeight: 600, color: "#3B473F", fontFamily: "'IBM Plex Mono',monospace" }}>{m.utilizationPct}%</span>
                    </div>
                    <div style={{ marginBottom: 14 }}>
                      <ProgressBar pct={m.utilizationPct} color={aColor} height={7} />
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        paddingTop: 12,
                        borderTop: "1px solid #EEF1EF",
                        fontSize: 12.5,
                      }}
                    >
                      <span style={{ color: "#4A574F", display: "flex", alignItems: "center", gap: 4 }}>
                        <CalendarDots size={14} />
                        {m.availabilityLabel}
                      </span>
                      <span style={{ color: "#4A574F", fontFamily: "'IBM Plex Mono',monospace" }}>{m.phone}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {createOpen && <StaffFormModal onClose={() => setCreateOpen(false)} />}
      {editing && <StaffFormModal staff={editing} onClose={() => setEditing(null)} />}
      {deleting && (
        <ConfirmDialog
          title="Mitarbeiter löschen"
          message={`Möchten Sie „${fullName(deleting)}“ wirklich löschen? Dies kann nicht rückgängig gemacht werden.`}
          onCancel={() => setDeleting(null)}
          onConfirm={async () => {
            await deleteStaff.mutateAsync(deleting.id);
            setDeleting(null);
          }}
        />
      )}
    </PageContainer>
  );
}
