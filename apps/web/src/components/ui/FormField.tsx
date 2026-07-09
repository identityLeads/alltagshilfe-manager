import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

const labelStyle = { fontSize: 12.5, fontWeight: 600, color: "#3B473F", marginBottom: 6, display: "block" };
const controlStyle = {
  width: "100%",
  height: 38,
  padding: "0 12px",
  border: "1px solid #E4E8E6",
  borderRadius: 9,
  background: "#fff",
  fontSize: 13.5,
  fontFamily: "inherit",
  color: "#17211C",
  outline: "none",
};

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={labelStyle}>{label}</label>
      {children}
      {hint && <div style={{ fontSize: 11.5, color: "#9AA5A0", marginTop: 4 }}>{hint}</div>}
    </div>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} style={{ ...controlStyle, ...props.style }} />;
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      style={{ ...controlStyle, height: "auto", minHeight: 76, padding: "10px 12px", resize: "vertical", ...props.style }}
    />
  );
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} style={{ ...controlStyle, ...props.style }}>
      {props.children}
    </select>
  );
}

export function FieldRow({ children }: { children: ReactNode }) {
  return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>{children}</div>;
}
