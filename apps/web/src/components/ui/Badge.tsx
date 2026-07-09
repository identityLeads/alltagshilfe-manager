import type { CSSProperties, ReactNode } from "react";
import { TONE_COLORS, type Tone } from "../../lib/tokens";

export function Badge({ tone, children, icon }: { tone: Tone; children: ReactNode; icon?: ReactNode }) {
  const [bg, color] = TONE_COLORS[tone];
  const style: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    padding: "3px 9px",
    borderRadius: 999,
    fontSize: 11.5,
    fontWeight: 600,
    whiteSpace: "nowrap",
    background: bg,
    color,
  };
  return (
    <span style={style}>
      {icon}
      {children}
    </span>
  );
}
