import { NavLink } from "react-router-dom";
import { UserButton, useUser } from "@clerk/clerk-react";
import {
  SquaresFour,
  Users,
  Buildings,
  ListChecks,
  Receipt,
  IdentificationBadge,
  Path,
  HandHeart,
  GearSix,
} from "@phosphor-icons/react";
import { useState } from "react";
import { SIDEBAR_PALETTES, useTheme } from "../../theme/ThemeContext";
import { useCustomers } from "../../api/customers";
import { useInvoices } from "../../api/invoices";
import { SettingsModal } from "./SettingsModal";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: SquaresFour, end: true },
  { to: "/kunden", label: "Kunden", icon: Users, badgeKey: "kunden" as const },
  { to: "/kostentraeger", label: "Kostenträger", icon: Buildings },
  { to: "/leistungskatalog", label: "Leistungskatalog", icon: ListChecks },
  { to: "/rechnungen", label: "Angebote & Rechnungen", icon: Receipt, badgeKey: "rechnungen" as const },
  { to: "/mitarbeiter", label: "Mitarbeiter", icon: IdentificationBadge },
  { to: "/touren", label: "Tourenplanung", icon: Path },
];

export function Sidebar() {
  const { sidebarTheme } = useTheme();
  const palette = SIDEBAR_PALETTES[sidebarTheme];
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { user } = useUser();
  const { data: customers } = useCustomers();
  const { data: openInvoices } = useInvoices("OFFEN");

  const badges = {
    kunden: customers?.length,
    rechnungen: openInvoices?.length,
  };

  return (
    <aside
      style={{
        width: 250,
        flex: "none",
        display: "flex",
        flexDirection: "column",
        background: palette.bg,
        borderRight: `1px solid ${palette.border}`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "20px 18px 18px 18px" }}>
        <div
          style={{
            width: 34,
            height: 34,
            flex: "none",
            borderRadius: 9,
            background: "var(--accent)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 6px rgba(46,125,99,.35)",
          }}
        >
          <HandHeart size={20} weight="fill" color="#fff" />
        </div>
        <div style={{ lineHeight: 1.15 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: palette.brand }}>Alltagshilfe</div>
          <div
            style={{
              fontSize: 11,
              letterSpacing: ".09em",
              textTransform: "uppercase",
              color: palette.muted,
              fontWeight: 600,
            }}
          >
            Manager
          </div>
        </div>
      </div>

      <nav style={{ flex: 1, overflowY: "auto", padding: "8px 12px 8px 0" }}>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className="navhov"
            style={({ isActive }) => ({
              display: "flex",
              alignItems: "center",
              gap: 11,
              padding: "9px 11px",
              marginBottom: 2,
              borderLeft: `3px solid ${isActive ? "var(--accent)" : "transparent"}`,
              borderRadius: "0 9px 9px 0",
              cursor: "pointer",
              fontSize: 13.5,
              fontWeight: isActive ? 600 : 500,
              color: isActive ? palette.activeText : palette.text,
              background: isActive ? palette.activeBg : "transparent",
              textDecoration: "none",
              ["--nav-hover" as string]: isActive ? palette.activeBg : palette.hover,
            })}
          >
            <item.icon size={19} style={{ width: 20, textAlign: "center", flex: "none" }} />
            <span>{item.label}</span>
            {item.badgeKey && !!badges[item.badgeKey] && (
              <span
                style={{
                  marginLeft: "auto",
                  background: "var(--accent)",
                  color: "#fff",
                  fontSize: 11,
                  fontWeight: 700,
                  minWidth: 19,
                  height: 19,
                  padding: "0 5px",
                  borderRadius: 999,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {badges[item.badgeKey]}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: 12, borderTop: `1px solid ${palette.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 9 }}>
          <UserButton afterSignOutUrl="/" />
          <div style={{ lineHeight: 1.2, minWidth: 0 }}>
            <div
              style={{
                fontWeight: 600,
                fontSize: 13,
                color: palette.brand,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {user?.fullName ?? "Büroleitung"}
            </div>
            <div style={{ fontSize: 11.5, color: palette.muted }}>Büroleitung</div>
          </div>
          <button
            className="pbtn"
            onClick={() => setSettingsOpen(true)}
            style={{ marginLeft: "auto", background: "none", border: "none", color: palette.muted, display: "flex" }}
            aria-label="Einstellungen"
          >
            <GearSix size={17} />
          </button>
        </div>
      </div>
      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
    </aside>
  );
}
