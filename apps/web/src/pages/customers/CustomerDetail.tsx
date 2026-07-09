import { useRef, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Phone,
  PencilSimple,
  Receipt,
  Info,
  Buildings,
  FilePdf,
  FileDoc,
  File,
  DownloadSimple,
  Trash,
  Plus,
} from "@phosphor-icons/react";
import { usePageHeader } from "../../components/layout/PageHeaderContext";
import { Card, PageContainer } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Avatar } from "../../components/ui/Avatar";
import { ProgressBar, LoadingState, ErrorState, EmptyState } from "../../components/ui/States";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import {
  useCustomer,
  useDeleteContact,
  useDeleteDocument,
  useDownloadDocument,
  useUploadDocument,
} from "../../api/customers";
import { eur, formatBytes, formatDate, fullName, initials } from "../../lib/format";
import { budgetColor, CARE_LEVEL_LABEL, CUSTOMER_STATUS_LABEL, CUSTOMER_STATUS_TONE } from "../../lib/tokens";
import { CustomerFormModal } from "./CustomerFormModal";
import { ContactFormModal } from "./ContactFormModal";

function documentIcon(mimeType: string) {
  if (mimeType === "application/pdf") return { Icon: FilePdf, bg: "#FBECEA", color: "#B24A3F" };
  if (mimeType.includes("word") || mimeType.includes("document")) return { Icon: FileDoc, bg: "#E9F1F5", color: "#2C6B8C" };
  return { Icon: File, bg: "#F0F2F1", color: "#63706A" };
}

export function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: cust, isLoading, isError } = useCustomer(id);

  const [editOpen, setEditOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [deleteContactId, setDeleteContactId] = useState<string | null>(null);
  const [deleteDocId, setDeleteDocId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const deleteContact = useDeleteContact(id ?? "");
  const uploadDocument = useUploadDocument(id ?? "");
  const deleteDocument = useDeleteDocument(id ?? "");
  const downloadDocument = useDownloadDocument(id ?? "");

  usePageHeader("Kundendetails", "Stammdaten, Pflegegrade und Entlastungsbudgets verwalten");

  if (isLoading) return <LoadingState />;
  if (isError || !cust) return <ErrorState message="Kunde konnte nicht geladen werden." />;

  const pct = (cust.reliefBudgetUsedCents / cust.reliefBudgetMonthlyCents) * 100;
  const color = budgetColor(cust.reliefBudgetUsedCents, cust.reliefBudgetMonthlyCents);

  return (
    <PageContainer>
      <Link
        to="/kunden"
        style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "#7C8983", marginBottom: 14 }}
      >
        <ArrowLeft size={15} /> Zurück zur Kundenliste
      </Link>

      <Card style={{ display: "flex", alignItems: "center", gap: 18 }} padding="20px 22px">
        <Avatar initials={initials(cust.firstName, cust.lastName)} seed={0} size={56} fontSize={19} />
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <h2 style={{ margin: 0, fontSize: 21, fontWeight: 700, letterSpacing: "-.01em" }}>{fullName(cust)}</h2>
            <Badge tone={CUSTOMER_STATUS_TONE[cust.status]}>{CUSTOMER_STATUS_LABEL[cust.status]}</Badge>
          </div>
          <div style={{ fontSize: 13, color: "#7C8983", marginTop: 3, display: "flex", gap: 16 }}>
            <span>
              <MapPin size={14} style={{ verticalAlign: -1, marginRight: 3 }} />
              {cust.district ? `${cust.city}-${cust.district}` : cust.city}
            </span>
            <span>
              <Phone size={14} style={{ verticalAlign: -1, marginRight: 3 }} />
              {cust.phone}
            </span>
            <span>Kunde seit {formatDate(cust.customerSince)}</span>
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <Button variant="secondary" icon={<PencilSimple size={15} />} onClick={() => setEditOpen(true)}>
            Bearbeiten
          </Button>
          <Button
            variant="primary"
            icon={<Receipt size={15} />}
            onClick={() => navigate(`/rechnungen?neu=1&kunde=${cust.id}`)}
          >
            Rechnung erstellen
          </Button>
        </div>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 16, marginTop: 16, alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#3B473F", marginBottom: 3 }}>
              Entlastungsbudget · § 45b
            </div>
            <div style={{ fontSize: 12, color: "#8A958F", marginBottom: 14 }}>{formatDate(new Date())}</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span className="mono" style={{ fontSize: 30, fontWeight: 700, letterSpacing: "-.02em", color }}>
                {eur(cust.reliefBudgetUsedCents)}
              </span>
              <span style={{ fontSize: 14, color: "#8A958F" }}>/ {eur(cust.reliefBudgetMonthlyCents)} genutzt</span>
            </div>
            <div style={{ margin: "13px 0 8px" }}>
              <ProgressBar pct={pct} color={color} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5 }}>
              <span style={{ color: "#8A958F" }}>Verbleibend</span>
              <span className="mono" style={{ fontWeight: 600 }}>
                {eur(Math.max(0, cust.reliefBudgetMonthlyCents - cust.reliefBudgetUsedCents))}
              </span>
            </div>
            <div
              style={{
                marginTop: 12,
                padding: "9px 11px",
                background: "#FBF2DC",
                borderRadius: 8,
                fontSize: 12,
                color: "#8A6D1E",
                display: "flex",
                gap: 8,
                alignItems: "center",
              }}
            >
              <Info size={15} /> Nicht genutztes Budget verfällt zum Jahresende.
            </div>
          </Card>

          <Card>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 13 }}>Stammdaten</div>
            {[
              { k: "Geburtsdatum", v: cust.birthDate ? formatDate(cust.birthDate) : "—" },
              { k: "Pflegegrad", v: CARE_LEVEL_LABEL(cust.careLevel) },
              { k: "Adresse", v: `${cust.street}, ${cust.postalCode} ${cust.city}` },
              { k: "Telefon", v: cust.phone },
              { k: "Kunde seit", v: formatDate(cust.customerSince) },
            ].map((row, i) => (
              <div
                key={row.k}
                style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderTop: i === 0 ? "none" : "1px solid #EEF1EF", fontSize: 13 }}
              >
                <span style={{ color: "#8A958F" }}>{row.k}</span>
                <span style={{ fontWeight: 500, textAlign: "right" }}>{row.v}</span>
              </div>
            ))}
          </Card>

          <Card>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Zugeordnete Pflegekasse</div>
            {cust.insurer ? (
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    flex: "none",
                    borderRadius: 9,
                    background: "#EEF1F5",
                    color: "#2C6B8C",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Buildings size={19} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13.5 }}>{cust.insurer.name}</div>
                  <div className="mono" style={{ fontSize: 12, color: "#8A958F" }}>
                    IK {cust.insurer.ik}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ fontSize: 13, color: "#9AA5A0" }}>Keine Pflegekasse zugeordnet.</div>
            )}
          </Card>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Angehörige & Kontakte</div>
              <a onClick={() => setContactOpen(true)} style={{ fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}>
                + Hinzufügen
              </a>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11, marginTop: 6 }}>
              {(cust.contacts ?? []).map((c) => (
                <div key={c.id} style={{ border: "1px solid #EEF1EF", borderRadius: 10, padding: "12px 13px", position: "relative" }}>
                  <button
                    className="pbtn"
                    onClick={() => setDeleteContactId(c.id)}
                    style={{ position: "absolute", top: 8, right: 8, border: "none", background: "none", color: "#B5BEB9" }}
                    aria-label="Kontakt löschen"
                  >
                    <Trash size={14} />
                  </button>
                  <div style={{ fontWeight: 600, fontSize: 13.5 }}>{c.name}</div>
                  <div style={{ fontSize: 12, color: "#8A958F", marginBottom: 6 }}>{c.role}</div>
                  <div className="mono" style={{ fontSize: 12.5, color: "#4A574F" }}>
                    {c.phone}
                  </div>
                </div>
              ))}
              {(cust.contacts ?? []).length === 0 && <EmptyState label="Keine Kontakte hinterlegt." />}
            </div>
          </Card>

          <Card padding="0" style={{ overflow: "hidden" }}>
            <div style={{ padding: "16px 20px 4px", fontSize: 14, fontWeight: 600 }}>Leistungshistorie</div>
            {(cust.serviceRecords ?? []).length === 0 ? (
              <EmptyState label="Keine Leistungen erfasst." />
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ color: "#8A958F", textAlign: "left", fontSize: 11, textTransform: "uppercase", letterSpacing: ".05em" }}>
                    <th style={{ padding: "9px 20px", fontWeight: 600 }}>Datum</th>
                    <th style={{ padding: "9px 16px", fontWeight: 600 }}>Leistung</th>
                    <th style={{ padding: "9px 16px", fontWeight: 600 }}>Mitarbeiter</th>
                    <th style={{ padding: "9px 20px", fontWeight: 600, textAlign: "right" }}>Betrag</th>
                  </tr>
                </thead>
                <tbody>
                  {(cust.serviceRecords ?? []).map((h) => (
                    <tr key={h.id} style={{ borderTop: "1px solid #EEF1EF" }}>
                      <td className="mono" style={{ padding: "10px 20px", color: "#7C8983" }}>
                        {formatDate(h.date)}
                      </td>
                      <td style={{ padding: "10px 16px", fontWeight: 500 }}>{h.service?.name ?? "—"}</td>
                      <td style={{ padding: "10px 16px", color: "#4A574F" }}>
                        {h.staff ? `${h.staff.firstName[0]}. ${h.staff.lastName}` : "—"}
                      </td>
                      <td className="mono" style={{ padding: "10px 20px", textAlign: "right" }}>
                        {eur(h.amountCents)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>

          <Card padding="18px 20px 14px">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Dokumente</div>
              <a onClick={() => fileInputRef.current?.click()} style={{ fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}>
                <Plus size={12} style={{ verticalAlign: -1 }} /> Hochladen
              </a>
              <input
                ref={fileInputRef}
                type="file"
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadDocument.mutate(file);
                  e.target.value = "";
                }}
              />
            </div>
            {(cust.documents ?? []).length === 0 && <EmptyState label="Keine Dokumente hinterlegt." />}
            {(cust.documents ?? []).map((d, i) => {
              const { Icon, bg, color: iconColor } = documentIcon(d.mimeType);
              return (
                <div
                  key={d.id}
                  style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderTop: i === 0 ? "none" : "1px solid #EEF1EF" }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      flex: "none",
                      borderRadius: 8,
                      background: bg,
                      color: iconColor,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon size={17} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{d.name}</div>
                    <div style={{ fontSize: 11.5, color: "#9AA5A0" }}>
                      {formatBytes(d.sizeBytes)} · {formatDate(d.uploadedAt)}
                    </div>
                  </div>
                  <button
                    className="pbtn"
                    onClick={() => downloadDocument(d)}
                    style={{ border: "none", background: "none", color: "#B5BEB9" }}
                    aria-label="Herunterladen"
                  >
                    <DownloadSimple size={17} />
                  </button>
                  <button
                    className="pbtn"
                    onClick={() => setDeleteDocId(d.id)}
                    style={{ border: "none", background: "none", color: "#B5BEB9" }}
                    aria-label="Löschen"
                  >
                    <Trash size={17} />
                  </button>
                </div>
              );
            })}
          </Card>
        </div>
      </div>

      {editOpen && <CustomerFormModal customer={cust} onClose={() => setEditOpen(false)} />}
      {contactOpen && <ContactFormModal customerId={cust.id} onClose={() => setContactOpen(false)} />}
      {deleteContactId && (
        <ConfirmDialog
          title="Kontakt löschen"
          message="Möchten Sie diesen Kontakt wirklich entfernen?"
          onCancel={() => setDeleteContactId(null)}
          onConfirm={() => {
            deleteContact.mutate(deleteContactId);
            setDeleteContactId(null);
          }}
        />
      )}
      {deleteDocId && (
        <ConfirmDialog
          title="Dokument löschen"
          message="Möchten Sie dieses Dokument wirklich löschen?"
          onCancel={() => setDeleteDocId(null)}
          onConfirm={() => {
            deleteDocument.mutate(deleteDocId);
            setDeleteDocId(null);
          }}
        />
      )}
    </PageContainer>
  );
}
