import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Eye, PencilSimple, PaperPlaneTilt, Plus, Receipt, FileText, Info } from "@phosphor-icons/react";
import { usePageHeader } from "../../components/layout/PageHeaderContext";
import { PageContainer, FilterPill } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { LoadingState, ErrorState, EmptyState } from "../../components/ui/States";
import { useInvoice, useInvoices, useUpdateInvoice } from "../../api/invoices";
import { eur, formatDate, fullName } from "../../lib/format";
import { INVOICE_STATUS_LABEL, INVOICE_STATUS_TONE } from "../../lib/tokens";
import type { InvoiceStatus } from "../../api/types";
import { InvoiceFormModal } from "./InvoiceFormModal";

const FILTERS: { key: InvoiceStatus | "ALLE"; label: string }[] = [
  { key: "ALLE", label: "Alle" },
  { key: "ENTWURF", label: "Entwurf" },
  { key: "OFFEN", label: "Offen" },
  { key: "BEZAHLT", label: "Bezahlt" },
];

const DOC_ICON: Record<string, { icon: typeof Receipt; bg: string; color: string }> = {
  RECHNUNG: { icon: Receipt, bg: "var(--accent-soft)", color: "var(--accent)" },
  ANGEBOT: { icon: FileText, bg: "#E9F1F5", color: "#2C6B8C" },
};

export function InvoiceList() {
  usePageHeader("Angebote & Rechnungen", "Dokumente erstellen und abrechnen");
  const navigate = useNavigate();
  const { id: routeId } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filter, setFilter] = useState<InvoiceStatus | "ALLE">("ALLE");
  const [formOpen, setFormOpen] = useState<"create" | "edit" | null>(null);

  const { data: invoices, isLoading, isError } = useInvoices(filter);
  const selectedId = routeId ?? invoices?.[0]?.id;
  const { data: selected } = useInvoice(selectedId);
  const updateInvoice = useUpdateInvoice();

  const preselectCustomerId = searchParams.get("kunde") ?? undefined;

  useEffect(() => {
    if (searchParams.get("neu") === "1") {
      setFormOpen("create");
    }
  }, [searchParams]);

  function closeForm() {
    setFormOpen(null);
    if (searchParams.get("neu")) {
      searchParams.delete("neu");
      searchParams.delete("kunde");
      setSearchParams(searchParams, { replace: true });
    }
  }

  if (isLoading) return <LoadingState />;
  if (isError || !invoices) return <ErrorState message="Dokumente konnten nicht geladen werden." />;

  return (
    <PageContainer maxWidth={1180}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, alignItems: "start" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {FILTERS.map((f) => (
                <FilterPill key={f.key} active={filter === f.key} onClick={() => setFilter(f.key)}>
                  {f.label}
                </FilterPill>
              ))}
            </div>
            <Button
              variant="primary"
              size="sm"
              icon={<Plus size={15} />}
              style={{ marginLeft: "auto", flex: "none" }}
              onClick={() => setFormOpen("create")}
            >
              Neu
            </Button>
          </div>
          <div style={{ background: "#fff", border: "1px solid #E4E8E6", borderRadius: 13, overflow: "hidden" }}>
            {invoices.length === 0 ? (
              <EmptyState label="Keine Dokumente in dieser Ansicht." />
            ) : (
              invoices.map((r, i) => {
                const { icon: Icon, bg, color } = DOC_ICON[r.documentType];
                const active = r.id === selectedId;
                return (
                  <div
                    key={r.id}
                    className="rowhov"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 13,
                      padding: "13px 16px",
                      borderTop: i === 0 ? "none" : "1px solid #EEF1EF",
                      background: active ? "#F7F9F8" : undefined,
                      boxShadow: active ? "inset 3px 0 0 var(--accent)" : undefined,
                    }}
                    onClick={() => navigate(`/rechnungen/${r.id}`)}
                  >
                    <div style={{ width: 34, height: 34, flex: "none", borderRadius: 8, background: bg, color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon size={17} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span className="mono" style={{ fontWeight: 600, fontSize: 12.5 }}>
                          {r.number}
                        </span>
                        <Badge tone={INVOICE_STATUS_TONE[r.status]}>{INVOICE_STATUS_LABEL[r.status]}</Badge>
                      </div>
                      <div style={{ fontSize: 12.5, color: "#8A958F", marginTop: 2 }}>
                        {fullName(r.customer)} · {formatDate(r.issueDate)}
                      </div>
                    </div>
                    <div className="mono" style={{ fontWeight: 700, fontSize: 13.5 }}>
                      {eur(r.totalCents)}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div style={{ position: "sticky", top: 0 }}>
          {!selected ? (
            <EmptyState label="Kein Dokument ausgewählt." />
          ) : (
            <>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, height: 34 }}>
                <div style={{ fontSize: 13, color: "#7C8983", display: "flex", alignItems: "center", gap: 7 }}>
                  <Eye size={16} /> Dokumentvorschau
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <Button variant="secondary" size="sm" icon={<PencilSimple size={14} />} onClick={() => setFormOpen("edit")}>
                    Bearbeiten
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<PaperPlaneTilt size={14} />}
                    disabled={selected.status !== "ENTWURF"}
                    onClick={() => updateInvoice.mutate({ id: selected.id, data: { status: "VERSENDET" } })}
                  >
                    Versenden
                  </Button>
                </div>
              </div>
              <div
                style={{
                  background: "#fff",
                  border: "1px solid #E4E8E6",
                  borderRadius: 13,
                  boxShadow: "0 6px 24px rgba(23,33,28,.06)",
                  padding: "34px 36px",
                  fontSize: 12.5,
                  lineHeight: 1.5,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 26 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Receipt size={18} color="#fff" weight="fill" />
                    </div>
                    <div style={{ lineHeight: 1.2 }}>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>Alltagshilfe München</div>
                      <div style={{ color: "#8A958F", fontSize: 11 }}>Betreuung & Haushaltsnahe Dienste</div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right", color: "#8A958F", fontSize: 11 }}>
                    Rosenheimer Str. 12
                    <br />
                    81667 München
                    <br />
                    IK 460101234
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 22 }}>
                  <div>
                    <div style={{ color: "#8A958F", fontSize: 10.5, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 4 }}>
                      {selected.documentType === "ANGEBOT" ? "Angebot an" : "Rechnung an"}
                    </div>
                    <div style={{ fontWeight: 600 }}>{fullName(selected.customer)}</div>
                    <div style={{ color: "#4A574F" }}>
                      {selected.customer.street}
                      <br />
                      {selected.customer.postalCode} {selected.customer.city}
                    </div>
                  </div>
                  <div className="mono" style={{ textAlign: "right", color: "#4A574F" }}>
                    <div>
                      <span style={{ color: "#8A958F" }}>{selected.documentType === "ANGEBOT" ? "Angebot" : "Rechnung"}&nbsp;</span>
                      {selected.number}
                    </div>
                    <div>
                      <span style={{ color: "#8A958F" }}>Datum&nbsp;</span>
                      {formatDate(selected.issueDate)}
                    </div>
                    <div>
                      <span style={{ color: "#8A958F" }}>Zeitraum&nbsp;</span>
                      {selected.period}
                    </div>
                  </div>
                </div>
                <h3 style={{ margin: "0 0 12px", fontSize: 18, fontWeight: 700 }}>
                  {selected.documentType === "ANGEBOT" ? "Angebot" : "Rechnung"}
                </h3>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead>
                    <tr style={{ color: "#8A958F", textAlign: "left", borderBottom: "1.5px solid #E4E8E6" }}>
                      <th style={{ padding: "7px 0", fontWeight: 600 }}>Leistung</th>
                      <th style={{ padding: "7px 0", fontWeight: 600, textAlign: "right" }}>Menge</th>
                      <th style={{ padding: "7px 0", fontWeight: 600, textAlign: "right" }}>Einzel</th>
                      <th style={{ padding: "7px 0", fontWeight: 600, textAlign: "right" }}>Gesamt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selected.lineItems.map((li) => (
                      <tr key={li.id} style={{ borderBottom: "1px solid #EEF1EF" }}>
                        <td style={{ padding: "9px 0" }}>{li.description}</td>
                        <td className="mono" style={{ padding: "9px 0", textAlign: "right" }}>
                          {Number(li.quantity).toLocaleString("de-DE", { minimumFractionDigits: 2 })} {li.unit}
                        </td>
                        <td className="mono" style={{ padding: "9px 0", textAlign: "right" }}>
                          {eur(li.unitPriceCents)}
                        </td>
                        <td className="mono" style={{ padding: "9px 0", textAlign: "right" }}>
                          {eur(Math.round(Number(li.quantity) * li.unitPriceCents))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
                  <div style={{ width: 210 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", color: "#4A574F" }}>
                      <span>Zwischensumme</span>
                      <span className="mono">{eur(selected.subtotalCents)}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", color: "#8A958F", fontSize: 11 }}>
                      <span>Umsatzsteuerfrei · §4 Nr.16 UStG</span>
                      <span className="mono">0,00 €</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", marginTop: 4, borderTop: "1.5px solid #17211C", fontWeight: 700, fontSize: 14 }}>
                      <span>Gesamtbetrag</span>
                      <span className="mono">{eur(selected.totalCents)}</span>
                    </div>
                  </div>
                </div>
                {selected.assignedToReliefBudget && (
                  <div style={{ marginTop: 20, padding: "11px 13px", background: "var(--accent-soft)", borderRadius: 9, color: "#1E3A2E", fontSize: 11.5, display: "flex", gap: 8 }}>
                    <Info size={15} style={{ flex: "none" }} />
                    <span>
                      Abtretung an den Entlastungsbetrag nach § 45b SGB XI.
                      {selected.customer.insurer && ` Direktabrechnung mit der ${selected.customer.insurer.name}.`}
                    </span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {formOpen === "create" && <InvoiceFormModal defaultCustomerId={preselectCustomerId} onClose={closeForm} />}
      {formOpen === "edit" && selected && <InvoiceFormModal invoice={selected} onClose={closeForm} />}
    </PageContainer>
  );
}
