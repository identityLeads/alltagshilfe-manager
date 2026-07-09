import { Check } from "@phosphor-icons/react";
import { Modal } from "../ui/Modal";
import { useTheme } from "../../theme/ThemeContext";
import { ACCENT_OPTIONS } from "../../lib/tokens";

export function SettingsModal({ onClose }: { onClose: () => void }) {
  const { accent, setAccent, sidebarTheme, setSidebarTheme } = useTheme();

  return (
    <Modal title="Erscheinungsbild" subtitle="Passe Akzentfarbe und Seitenleiste an" onClose={onClose} width={440}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12.5, fontWeight: 600, color: "#3B473F", marginBottom: 10 }}>Akzentfarbe</div>
        <div style={{ display: "flex", gap: 10 }}>
          {ACCENT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className="pbtn"
              onClick={() => setAccent(opt.value)}
              title={opt.label}
              aria-label={opt.label}
              style={{
                width: 34,
                height: 34,
                borderRadius: 999,
                background: opt.value,
                border: accent === opt.value ? "3px solid #17211C" : "1px solid rgba(0,0,0,.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {accent === opt.value && <Check size={15} weight="bold" color="#fff" />}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div style={{ fontSize: 12.5, fontWeight: 600, color: "#3B473F", marginBottom: 10 }}>Sidebar-Thema</div>
        <div style={{ display: "flex", background: "#F2F5F3", borderRadius: 9, padding: 3, width: "fit-content" }}>
          {(["hell", "dunkel"] as const).map((t) => (
            <button
              key={t}
              className="pbtn"
              onClick={() => setSidebarTheme(t)}
              style={{
                border: "none",
                padding: "7px 16px",
                borderRadius: 7,
                fontSize: 13,
                fontWeight: 600,
                background: sidebarTheme === t ? "#fff" : "transparent",
                color: sidebarTheme === t ? "#17211C" : "#7C8983",
                boxShadow: sidebarTheme === t ? "0 1px 3px rgba(23,33,28,.12)" : "none",
              }}
            >
              {t === "hell" ? "Hell" : "Dunkel"}
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
}
