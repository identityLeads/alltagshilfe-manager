import { MagnifyingGlass, Bell } from "@phosphor-icons/react";
import { usePageHeaderState } from "./PageHeaderContext";

export function Topbar() {
  const { title, subtitle } = usePageHeaderState();
  return (
    <header
      style={{
        flex: "none",
        height: 66,
        display: "flex",
        alignItems: "center",
        gap: 18,
        padding: "0 28px",
        background: "#FBFCFB",
        borderBottom: "1px solid #E4E8E6",
      }}
    >
      <div style={{ minWidth: 0 }}>
        <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, letterSpacing: "-.01em" }}>{title}</h1>
        <div style={{ fontSize: 12.5, color: "#7C8983", marginTop: 1 }}>{subtitle}</div>
      </div>
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
          <MagnifyingGlass
            size={16}
            style={{ position: "absolute", left: 11, color: "#9AA5A0", pointerEvents: "none" }}
          />
          <input
            placeholder="Kunde, Rechnung, Mitarbeiter…"
            style={{
              width: 250,
              height: 38,
              padding: "0 12px 0 34px",
              border: "1px solid #E4E8E6",
              borderRadius: 9,
              background: "#fff",
              fontSize: 13,
              fontFamily: "inherit",
              color: "#17211C",
              outline: "none",
            }}
          />
        </div>
        <button
          className="pbtn"
          style={{
            position: "relative",
            width: 38,
            height: 38,
            flex: "none",
            border: "1px solid #E4E8E6",
            borderRadius: 9,
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Bell size={18} color="#4A574F" />
          <span
            style={{
              position: "absolute",
              top: 8,
              right: 9,
              width: 7,
              height: 7,
              borderRadius: 999,
              background: "#B24A3F",
              border: "1.5px solid #fff",
            }}
          />
        </button>
      </div>
    </header>
  );
}
