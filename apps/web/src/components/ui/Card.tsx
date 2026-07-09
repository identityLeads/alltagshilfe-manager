import type { CSSProperties, ReactNode } from "react";

export function Card({
  children,
  style,
  lift,
  padding = "18px 20px",
}: {
  children: ReactNode;
  style?: CSSProperties;
  lift?: boolean;
  padding?: string;
}) {
  return (
    <div
      className={lift ? "lift" : undefined}
      style={{
        background: "#fff",
        border: "1px solid #E4E8E6",
        borderRadius: 13,
        padding,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function PageContainer({ children, maxWidth = 1180 }: { children: ReactNode; maxWidth?: number }) {
  return <div style={{ maxWidth, margin: "0 auto" }}>{children}</div>;
}

export function FilterPill({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <span
      className="pbtn"
      onClick={onClick}
      style={{
        background: active ? "var(--accent)" : "#fff",
        color: active ? "#fff" : "#4A574F",
        padding: "7px 13px",
        borderRadius: 8,
        fontSize: 13,
        fontWeight: active ? 600 : 500,
        border: active ? "none" : "1px solid #E4E8E6",
      }}
    >
      {children}
    </span>
  );
}
