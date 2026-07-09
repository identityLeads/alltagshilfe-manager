import { CircleNotch } from "@phosphor-icons/react";

export function LoadingState({ label = "Wird geladen…" }: { label?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "40px 0", justifyContent: "center", color: "#8A958F", fontSize: 13.5 }}>
      <CircleNotch size={18} className="spin" />
      {label}
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div
      style={{
        padding: "14px 16px",
        background: "#FBECEA",
        color: "#B24A3F",
        borderRadius: 10,
        fontSize: 13,
        margin: "20px 0",
      }}
    >
      {message}
    </div>
  );
}

export function EmptyState({ label }: { label: string }) {
  return (
    <div style={{ padding: "40px 0", textAlign: "center", color: "#9AA5A0", fontSize: 13.5 }}>{label}</div>
  );
}

export function ProgressBar({ pct, color, height = 10 }: { pct: number; color: string; height?: number }) {
  return (
    <div style={{ height, background: "#EEF2F0", borderRadius: 999, overflow: "hidden" }}>
      <div
        style={{
          width: `${Math.min(100, Math.max(0, pct))}%`,
          height: "100%",
          background: color,
          borderRadius: 999,
        }}
      />
    </div>
  );
}
