import { useState } from "react";
import { CaretLeft, CaretRight, Plus, MapTrifold } from "@phosphor-icons/react";
import { usePageHeader } from "../../components/layout/PageHeaderContext";
import { Card, PageContainer } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Avatar } from "../../components/ui/Avatar";
import { LoadingState, ErrorState } from "../../components/ui/States";
import { useTourAssignments } from "../../api/tours";
import { fullName, formatTimeRange, formatWeekdayDate, initials } from "../../lib/format";
import type { TourAssignment } from "../../api/types";
import { TourAssignmentFormModal } from "./TourAssignmentFormModal";

const START_HOUR = 7;
const END_HOUR = 18;
const SPAN = END_HOUR - START_HOUR;
const HOURS = Array.from({ length: SPAN }, (_, i) => String(START_HOUR + i).padStart(2, "0"));

function toDateStr(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function TourPlanning() {
  usePageHeader("Tourenplanung", "Einsätze planen und Mitarbeitern zuweisen");
  const [date, setDate] = useState(() => toDateStr(new Date()));
  const [formState, setFormState] = useState<{ mode: "create" | "edit"; assignment?: TourAssignment } | null>(null);

  const { data: assignments, isLoading, isError } = useTourAssignments(date);

  function shiftDate(days: number) {
    const d = new Date(date + "T00:00:00");
    d.setDate(d.getDate() + days);
    setDate(toDateStr(d));
  }

  if (isLoading) return <LoadingState />;
  if (isError || !assignments) return <ErrorState message="Tourenplanung konnte nicht geladen werden." />;

  const staffMap = new Map<string, { staff: TourAssignment["staff"]; blocks: TourAssignment[] }>();
  for (const a of assignments) {
    if (!staffMap.has(a.staffId)) staffMap.set(a.staffId, { staff: a.staff, blocks: [] });
    staffMap.get(a.staffId)!.blocks.push(a);
  }
  const rows = Array.from(staffMap.values());
  const distinctStaff = rows.length;
  const totalMinutes = assignments.reduce((sum, a) => sum + a.durationMinutes, 0);

  return (
    <PageContainer maxWidth={1400}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <div style={{ display: "flex", background: "#fff", border: "1px solid #E4E8E6", borderRadius: 9, padding: 3 }}>
          <span style={{ background: "var(--accent)", color: "#fff", padding: "6px 14px", borderRadius: 7, fontSize: 13, fontWeight: 600 }}>Tag</span>
          <span className="pbtn" style={{ color: "#4A574F", padding: "6px 14px", borderRadius: 7, fontSize: 13, fontWeight: 500 }}>
            Woche
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#fff", border: "1px solid #E4E8E6", borderRadius: 9, padding: "6px 12px" }}>
          <CaretLeft className="pbtn" size={15} color="#7C8983" onClick={() => shiftDate(-1)} />
          <span style={{ fontSize: 13.5, fontWeight: 600 }}>{formatWeekdayDate(date + "T00:00:00")}</span>
          <CaretRight className="pbtn" size={15} color="#7C8983" onClick={() => shiftDate(1)} />
        </div>
        <span style={{ fontSize: 12.5, color: "#8A958F" }}>
          {assignments.length} Einsätze · {distinctStaff} Mitarbeiter
        </span>
        <Button variant="primary" icon={<Plus size={16} />} style={{ marginLeft: "auto" }} onClick={() => setFormState({ mode: "create" })}>
          Einsatz planen
        </Button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16, alignItems: "start" }}>
        <div style={{ background: "#fff", border: "1px solid #E4E8E6", borderRadius: 13, overflow: "hidden" }}>
          <div style={{ display: "flex", borderBottom: "1px solid #EEF1EF" }}>
            <div style={{ width: 150, flex: "none", padding: "10px 16px", fontSize: 11.5, fontWeight: 600, color: "#8A958F", textTransform: "uppercase", letterSpacing: ".05em", borderRight: "1px solid #EEF1EF" }}>
              Mitarbeiter
            </div>
            <div style={{ flex: 1, display: "flex" }}>
              {HOURS.map((h) => (
                <div key={h} className="mono" style={{ flex: 1, padding: "10px 0 10px 6px", fontSize: 11, color: "#9AA5A0", borderLeft: "1px solid #F2F4F3" }}>
                  {h}
                </div>
              ))}
            </div>
          </div>
          {rows.length === 0 && (
            <div style={{ padding: "40px 0", textAlign: "center", color: "#9AA5A0", fontSize: 13.5 }}>Keine Einsätze für diesen Tag geplant.</div>
          )}
          {rows.map((row, i) => (
            <div key={row.staff.id} style={{ display: "flex", borderTop: i === 0 ? "none" : "1px solid #EEF1EF" }}>
              <div style={{ width: 150, flex: "none", padding: "12px 16px", borderRight: "1px solid #EEF1EF", display: "flex", alignItems: "center", gap: 9 }}>
                <Avatar initials={initials(row.staff.firstName, row.staff.lastName)} seed={i} size={28} fontSize={11} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {fullName(row.staff)}
                  </div>
                  <div style={{ fontSize: 11, color: "#9AA5A0" }}>{row.staff.area}</div>
                </div>
              </div>
              <div
                style={{
                  flex: 1,
                  position: "relative",
                  height: 70,
                  backgroundImage: `repeating-linear-gradient(to right, transparent, transparent calc(${100 / SPAN}% - 1px), #F2F4F3 calc(${100 / SPAN}% - 1px), #F2F4F3 ${100 / SPAN}%)`,
                }}
              >
                {row.blocks.map((b) => {
                  const startHour = b.startMinutes / 60;
                  const left = ((startHour - START_HOUR) / SPAN) * 100;
                  const width = (b.durationMinutes / 60 / SPAN) * 100 - 0.6;
                  return (
                    <div
                      key={b.id}
                      className="pbtn"
                      onClick={() => setFormState({ mode: "edit", assignment: b })}
                      style={{
                        position: "absolute",
                        left: `${left}%`,
                        width: `${width}%`,
                        top: 7,
                        bottom: 7,
                        boxSizing: "border-box",
                        background: "var(--accent-soft)",
                        border: "1px solid var(--accent-line)",
                        borderLeft: "3px solid var(--accent)",
                        borderRadius: 7,
                        padding: "5px 8px",
                        overflow: "hidden",
                      }}
                    >
                      <div style={{ fontSize: 11.5, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: "#1E3A2E" }}>
                        {fullName(b.customer)}
                      </div>
                      <div style={{ fontSize: 10.5, color: "#4F6A5C", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {b.serviceLabel}
                      </div>
                      <div className="mono" style={{ fontSize: 10, color: "#6E8478", marginTop: 1 }}>
                        {formatTimeRange(b.startMinutes, b.durationMinutes)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card padding="0" style={{ overflow: "hidden" }}>
            <div style={{ padding: "14px 16px 10px", fontSize: 13.5, fontWeight: 600, display: "flex", alignItems: "center", gap: 7 }}>
              <MapTrifold size={16} color="var(--accent)" /> Routenübersicht
            </div>
            <div
              style={{
                height: 230,
                margin: "0 12px 12px",
                borderRadius: 10,
                position: "relative",
                backgroundColor: "#EEF2F0",
                backgroundImage: "repeating-linear-gradient(45deg,#E6ECE9 0,#E6ECE9 1px,transparent 1px,transparent 11px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              <span className="mono" style={{ fontSize: 11, color: "#8A958F", background: "rgba(255,255,255,.85)", padding: "4px 9px", borderRadius: 6 }}>
                [ Kartenintegration ]
              </span>
            </div>
          </Card>
          <Card padding="16px 18px">
            <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 12 }}>Tageszusammenfassung</div>
            {[
              { k: "Geplante Einsätze", v: String(assignments.length) },
              { k: "Gesamtstunden", v: `${(totalMinutes / 60).toLocaleString("de-DE", { maximumFractionDigits: 1 })} h` },
              { k: "Mitarbeiter im Einsatz", v: String(distinctStaff) },
            ].map((s, i) => (
              <div key={s.k} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderTop: i === 0 ? "none" : "1px solid #EEF1EF" }}>
                <span style={{ fontSize: 13, color: "#4A574F" }}>{s.k}</span>
                <span className="mono" style={{ fontSize: 13, fontWeight: 600 }}>
                  {s.v}
                </span>
              </div>
            ))}
          </Card>
        </div>
      </div>

      {formState?.mode === "create" && <TourAssignmentFormModal date={date} onClose={() => setFormState(null)} />}
      {formState?.mode === "edit" && formState.assignment && (
        <TourAssignmentFormModal date={date} assignment={formState.assignment} onClose={() => setFormState(null)} />
      )}
    </PageContainer>
  );
}
