import { avatarColors } from "../../lib/tokens";

export function Avatar({
  initials,
  seed,
  size = 34,
  fontSize = 12.5,
}: {
  initials: string;
  seed: number;
  size?: number;
  fontSize?: number;
}) {
  const [bg, color] = avatarColors(seed);
  return (
    <div
      style={{
        width: size,
        height: size,
        flex: "none",
        borderRadius: 999,
        background: bg,
        color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize,
        fontWeight: 700,
      }}
    >
      {initials}
    </div>
  );
}
