import {
  Receipt,
  Path,
  TrayArrowDown,
  ChartDonut,
  TrendUp,
  WarningCircle,
  ArrowRight,
  Circle,
  CheckCircle,
  Check,
  X,
} from "@phosphor-icons/react";
import { Link } from "react-router-dom";
import { usePageHeader } from "../../components/layout/PageHeaderContext";
import { Card, PageContainer } from "../../components/ui/Card";
import { LoadingState, ErrorState } from "../../components/ui/States";
import { useDashboard } from "../../api/dashboard";
import { useTasks, useToggleTask } from "../../api/tasks";
import { useRequests, useSetRequestStatus } from "../../api/requests";
import { eur, formatWeekdayDate, formatTimeRange, fullName, initials } from "../../lib/format";
import { TASK_PRIORITY_COLOR } from "../../lib/tokens";
import { Avatar } from "../../components/ui/Avatar";

const WEEKDAY_LABELS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

export function Dashboard() {
  usePageHeader("Dashboard", `Überblick über Ihren Betrieb · ${formatWeekdayDate(new Date())}`);

  const dashboard = useDashboard();
  const tasks = useTasks();
  const requests = useRequests("NEU");
  const toggleTask = useToggleTask();
  const setRequestStatus = useSetRequestStatus();

  if (dashboard.isLoading || tasks.isLoading || requests.isLoading) return <LoadingState />;
  if (dashboard.isError || !dashboard.data) return <ErrorState message="Dashboard konnte nicht geladen werden." />;

  const d = dashboard.data;
  const weekMax = Math.max(...d.week, 1);
  const todayIdx = (new Date().getDay() + 6) % 7;

  const kpis = [
    {
      label: "Offene Rechnungen",
      value: String(d.openInvoicesCount),
      sub: `${eur(d.openInvoicesTotalCents)} ausstehend`,
      icon: Receipt,
      bg: "#FBF2DC",
      color: "#8A6D1E",
      trend: `${d.openInvoicesOverdueCount} überfällig`,
      up: d.openInvoicesOverdueCount === 0,
    },
    {
      label: "Touren heute",
      value: String(d.toursTodayCount),
      sub: `${d.staffTodayCount} Mitarbeiter im Einsatz`,
      icon: Path,
      bg: "var(--accent-soft)",
      color: "var(--accent)",
      trend: "heute",
      up: true,
    },
    {
      label: "Neue Anfragen",
      value: String(d.newRequestsCount),
      sub: "unbearbeitet",
      icon: TrayArrowDown,
      bg: "#E9F1F5",
      color: "#2C6B8C",
      trend: "heute",
      up: true,
    },
    {
      label: "Ø Budget genutzt",
      value: `${d.avgBudgetUsedPct} %`,
      sub: "des Entlastungsbetrags",
      icon: ChartDonut,
      bg: "#F0F2F1",
      color: "#63706A",
      trend: "Juli 2026",
      up: true,
    },
  ];

  const openTaskCount = tasks.data?.filter((t) => !t.done).length ?? 0;

  return (
    <PageContainer>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
        {kpis.map((k) => (
          <Card key={k.label} lift padding="16px">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 9,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: k.bg,
                  color: k.color,
                }}
              >
                <k.icon size={19} />
              </div>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 3,
                  fontSize: 11.5,
                  fontWeight: 600,
                  color: k.up ? "#2E7D63" : "#B5820E",
                }}
              >
                {k.up ? <TrendUp size={13} /> : <WarningCircle size={13} />}
                {k.trend}
              </span>
            </div>
            <div style={{ fontSize: 29, fontWeight: 700, letterSpacing: "-.02em", marginTop: 13, lineHeight: 1 }}>
              {k.value}
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#3B473F", marginTop: 6 }}>{k.label}</div>
            <div style={{ fontSize: 12, color: "#8A958F", marginTop: 2 }}>{k.sub}</div>
          </Card>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.55fr 1fr", gap: 16, marginTop: 16, alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card padding="18px 20px 20px">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 14.5, fontWeight: 600 }}>Wochenübersicht</div>
                <div style={{ fontSize: 12, color: "#8A958F", marginTop: 1 }}>Einsätze pro Tag</div>
              </div>
              <div style={{ display: "flex", gap: 14, fontSize: 11.5, color: "#7C8983" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 9, height: 9, borderRadius: 2, background: "var(--accent)" }} />
                  geplant
                </span>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 14, height: 150 }}>
              {d.week.map((count, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 9,
                    height: "100%",
                    justifyContent: "flex-end",
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#3B473F" }}>{count}</div>
                  <div
                    style={{
                      width: "100%",
                      maxWidth: 38,
                      background: "#EEF2F0",
                      borderRadius: 6,
                      height: "100%",
                      display: "flex",
                      alignItems: "flex-end",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: "100%",
                        height: `${Math.max(4, Math.round((count / weekMax) * 100))}%`,
                        background: i === todayIdx ? "var(--accent)" : "#B9D4C8",
                        borderRadius: "6px 6px 0 0",
                      }}
                    />
                  </div>
                  <div style={{ fontSize: 12, color: "#8A958F", fontWeight: 500 }}>{WEEKDAY_LABELS[i]}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card padding="18px 20px 8px">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <div style={{ fontSize: 14.5, fontWeight: 600 }}>Anstehende Touren heute</div>
              <Link to="/touren" style={{ fontSize: 12.5, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 3 }}>
                Alle Touren <ArrowRight size={13} />
              </Link>
            </div>
            {d.upcomingToday.length === 0 && (
              <div style={{ padding: "20px 0", color: "#9AA5A0", fontSize: 13 }}>Keine Touren für heute geplant.</div>
            )}
            {d.upcomingToday.map((t, i) => (
              <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 13, padding: "11px 0", borderTop: i === 0 ? "none" : "1px solid #EEF1EF" }}>
                <div className="mono" style={{ fontSize: 13, fontWeight: 500, color: "#3B473F", width: 46, flex: "none" }}>
                  {formatTimeRange(t.startMinutes, t.durationMinutes).split("–")[0]}
                </div>
                <Avatar initials={initials(t.staff.firstName, t.staff.lastName)} seed={i} size={30} fontSize={11} />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {fullName(t.customer)}
                  </div>
                  <div style={{ fontSize: 12, color: "#8A958F" }}>
                    {t.serviceLabel} · {t.staff.firstName[0]}. {t.staff.lastName}
                  </div>
                </div>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "3px 9px",
                    borderRadius: 999,
                    fontSize: 11.5,
                    fontWeight: 600,
                    background: "#F0F2F1",
                    color: "#63706A",
                  }}
                >
                  {(t.durationMinutes / 60).toLocaleString("de-DE", { maximumFractionDigits: 1 })} h
                </span>
              </div>
            ))}
          </Card>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card padding="18px 20px 12px">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <div style={{ fontSize: 14.5, fontWeight: 600 }}>Aufgaben</div>
              <span
                style={{
                  fontSize: 11.5,
                  fontWeight: 600,
                  color: "var(--accent)",
                  background: "var(--accent-soft)",
                  padding: "2px 8px",
                  borderRadius: 999,
                }}
              >
                {openTaskCount} offen
              </span>
            </div>
            {tasks.data?.map((t, i) => (
              <div
                key={t.id}
                className="pbtn"
                style={{ display: "flex", alignItems: "flex-start", gap: 11, padding: "11px 0", borderTop: i === 0 ? "none" : "1px solid #EEF1EF" }}
                onClick={() => toggleTask.mutate(t.id)}
              >
                {t.done ? (
                  <CheckCircle size={19} weight="fill" color="var(--accent)" style={{ flex: "none", marginTop: 1 }} />
                ) : (
                  <Circle size={19} color="#C7CFCB" style={{ flex: "none", marginTop: 1 }} />
                )}
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      fontSize: 13.5,
                      fontWeight: 500,
                      lineHeight: 1.35,
                      textDecoration: t.done ? "line-through" : "none",
                      color: t.done ? "#9AA5A0" : "#2A352F",
                    }}
                  >
                    {t.text}
                  </div>
                  {t.meta && <div style={{ fontSize: 12, color: "#9AA5A0", marginTop: 2 }}>{t.meta}</div>}
                </div>
                <span style={{ width: 8, height: 8, flex: "none", marginTop: 6, borderRadius: 999, background: TASK_PRIORITY_COLOR[t.priority] }} />
              </div>
            ))}
          </Card>

          <Card style={{ background: "var(--accent-soft)", border: "1px solid var(--accent-line)" }} padding="18px 20px">
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 12 }}>
              <TrayArrowDown size={20} weight="fill" color="var(--accent)" />
              <div style={{ fontSize: 14.5, fontWeight: 600, color: "#1E3A2E" }}>
                {requests.data?.length ?? 0} neue Anfragen
              </div>
            </div>
            {requests.data?.length === 0 && (
              <div style={{ fontSize: 13, color: "#4F6A5C", padding: "6px 0" }}>Keine offenen Anfragen.</div>
            )}
            {requests.data?.map((r, i) => (
              <div
                key={r.id}
                style={{ display: "flex", alignItems: "center", gap: 11, padding: "9px 0", borderTop: i === 0 ? "none" : "1px solid rgba(46,125,99,.14)" }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#1E3A2E" }}>{r.name}</div>
                  <div style={{ fontSize: 12, color: "#4F6A5C" }}>{r.info}</div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    className="pbtn"
                    onClick={() => setRequestStatus.mutate({ id: r.id, status: "ANGENOMMEN" })}
                    style={{ width: 30, height: 30, borderRadius: 8, border: "none", background: "var(--accent)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}
                  >
                    <Check size={15} />
                  </button>
                  <button
                    className="pbtn"
                    onClick={() => setRequestStatus.mutate({ id: r.id, status: "ABGELEHNT" })}
                    style={{ width: 30, height: 30, borderRadius: 8, border: "1px solid var(--accent-line)", background: "#fff", color: "#4F6A5C", display: "flex", alignItems: "center", justifyContent: "center" }}
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
