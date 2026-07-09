import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus, CaretRight } from "@phosphor-icons/react";
import { usePageHeader } from "../../components/layout/PageHeaderContext";
import { PageContainer, FilterPill } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Avatar } from "../../components/ui/Avatar";
import { ProgressBar, LoadingState, ErrorState, EmptyState } from "../../components/ui/States";
import { useCustomers } from "../../api/customers";
import { eur, fullName, initials } from "../../lib/format";
import { budgetColor, CARE_LEVEL_LABEL, CUSTOMER_STATUS_LABEL, CUSTOMER_STATUS_TONE } from "../../lib/tokens";
import type { CustomerStatus } from "../../api/types";
import { CustomerFormModal } from "./CustomerFormModal";

const FILTERS: { key: CustomerStatus | "ALLE"; label: string }[] = [
  { key: "ALLE", label: "Alle" },
  { key: "AKTIV", label: "Aktiv" },
  { key: "NEU", label: "Neu" },
  { key: "PAUSIERT", label: "Pausiert" },
];

export function CustomerList() {
  usePageHeader("Kunden", "Stammdaten, Pflegegrade und Entlastungsbudgets verwalten");
  const navigate = useNavigate();
  const [filter, setFilter] = useState<CustomerStatus | "ALLE">("ALLE");
  const [createOpen, setCreateOpen] = useState(false);
  const { data: allCustomers } = useCustomers();
  const { data: customers, isLoading, isError } = useCustomers(filter);

  const counts = {
    ALLE: allCustomers?.length ?? 0,
    AKTIV: allCustomers?.filter((c) => c.status === "AKTIV").length ?? 0,
    NEU: allCustomers?.filter((c) => c.status === "NEU").length ?? 0,
    PAUSIERT: allCustomers?.filter((c) => c.status === "PAUSIERT").length ?? 0,
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
        <Button variant="primary" icon={<UserPlus size={16} />} style={{ marginLeft: "auto" }} onClick={() => setCreateOpen(true)}>
          Kunde anlegen
        </Button>
      </div>

      {isLoading && <LoadingState />}
      {isError && <ErrorState message="Kunden konnten nicht geladen werden." />}

      {customers && (
        <div style={{ background: "#fff", border: "1px solid #E4E8E6", borderRadius: 13, overflow: "hidden" }}>
          {customers.length === 0 ? (
            <EmptyState label="Keine Kunden in dieser Ansicht." />
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
              <thead>
                <tr style={{ background: "#FAFBFA", color: "#7C8983", textAlign: "left", fontSize: 11.5, textTransform: "uppercase", letterSpacing: ".05em" }}>
                  <th style={{ padding: "12px 16px", fontWeight: 600 }}>Kunde</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600 }}>Pflegegrad</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600 }}>Pflegekasse</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600, width: 210 }}>Entlastungsbudget</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600 }}>Status</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600, width: 40 }} />
                </tr>
              </thead>
              <tbody>
                {customers.map((k, i) => {
                  const pct = (k.reliefBudgetUsedCents / k.reliefBudgetMonthlyCents) * 100;
                  const color = budgetColor(k.reliefBudgetUsedCents, k.reliefBudgetMonthlyCents);
                  return (
                    <tr
                      key={k.id}
                      className="rowhov"
                      style={{ borderTop: "1px solid #EEF1EF" }}
                      onClick={() => navigate(`/kunden/${k.id}`)}
                    >
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <Avatar initials={initials(k.firstName, k.lastName)} seed={i} />
                          <div>
                            <div style={{ fontWeight: 600, color: "#17211C" }}>{fullName(k)}</div>
                            <div style={{ fontSize: 12, color: "#8A958F" }}>{k.district ? `${k.city}-${k.district}` : k.city}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <Badge tone="success">{CARE_LEVEL_LABEL(k.careLevel)}</Badge>
                      </td>
                      <td style={{ padding: "12px 16px", color: "#4A574F" }}>{k.insurer?.name ?? "—"}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                          <div style={{ flex: 1 }}>
                            <ProgressBar pct={pct} color={color} height={7} />
                          </div>
                          <span className="mono" style={{ fontSize: 11.5, color: "#7C8983", whiteSpace: "nowrap" }}>
                            {eur(k.reliefBudgetUsedCents)} / {eur(k.reliefBudgetMonthlyCents)}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <Badge tone={CUSTOMER_STATUS_TONE[k.status]}>{CUSTOMER_STATUS_LABEL[k.status]}</Badge>
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "center" }}>
                        <CaretRight color="#B5BEB9" size={15} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {createOpen && <CustomerFormModal onClose={() => setCreateOpen(false)} />}
    </PageContainer>
  );
}
