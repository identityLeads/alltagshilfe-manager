import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "md" | "sm";

const base: CSSProperties = {
  border: "none",
  borderRadius: 9,
  fontWeight: 600,
  display: "inline-flex",
  alignItems: "center",
  gap: 7,
  fontFamily: "inherit",
  cursor: "pointer",
};

const variants: Record<Variant, CSSProperties> = {
  primary: {
    background: "var(--accent)",
    color: "#fff",
    boxShadow: "0 2px 6px rgba(46,125,99,.3)",
  },
  secondary: {
    background: "#fff",
    color: "#2A352F",
    border: "1px solid #E4E8E6",
    fontWeight: 500,
    boxShadow: "none",
  },
  ghost: {
    background: "transparent",
    color: "#4A574F",
    fontWeight: 500,
  },
  danger: {
    background: "#FBECEA",
    color: "#B24A3F",
    fontWeight: 600,
  },
};

const sizes: Record<Size, CSSProperties> = {
  md: { height: 38, padding: "0 15px", fontSize: 13.5 },
  sm: { height: 32, padding: "0 12px", fontSize: 12.5 },
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
}

export function Button({ variant = "secondary", size = "md", icon, children, style, ...rest }: Props) {
  return (
    <button className="pbtn" style={{ ...base, ...variants[variant], ...sizes[size], ...style }} {...rest}>
      {icon}
      {children}
    </button>
  );
}

export function IconButton({
  icon,
  style,
  ...rest
}: { icon: ReactNode } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className="pbtn"
      style={{
        width: 38,
        height: 38,
        flex: "none",
        border: "1px solid #E4E8E6",
        borderRadius: 9,
        background: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        ...style,
      }}
      {...rest}
    >
      {icon}
    </button>
  );
}
