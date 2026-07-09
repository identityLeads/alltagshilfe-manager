import { SignIn } from "@clerk/clerk-react";
import { HandHeart } from "@phosphor-icons/react";

export function SignInPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 28,
        background: "#EEF1EF",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: "#2E7D63",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 6px rgba(46,125,99,.35)",
          }}
        >
          <HandHeart size={24} weight="fill" color="#fff" />
        </div>
        <div style={{ lineHeight: 1.15 }}>
          <div style={{ fontWeight: 700, fontSize: 18, color: "#17211C" }}>Alltagshilfe</div>
          <div style={{ fontSize: 12, letterSpacing: ".09em", textTransform: "uppercase", color: "#8A958F", fontWeight: 600 }}>
            Manager
          </div>
        </div>
      </div>
      <SignIn
        appearance={{
          variables: { colorPrimary: "#2E7D63", fontFamily: "'Public Sans', system-ui, sans-serif" },
        }}
      />
    </div>
  );
}
