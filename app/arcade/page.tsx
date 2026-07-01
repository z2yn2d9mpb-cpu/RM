import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Arcade · The Ryan Chronicles",
  description: "De arcade komt binnenkort.",
};

// Placeholder for the separate "Arcade.dc.html" design. Replace this route's
// contents when that design is imported; the "Verveeld?" button links here.
export default function ArcadePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 22,
        padding: "40px 24px",
        textAlign: "center",
        backgroundColor: "#ddd2bb",
        backgroundImage:
          "radial-gradient(rgba(120,100,70,.10) 1px, transparent 1px)",
        backgroundSize: "15px 15px",
        color: "#2c2620",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-press-start), monospace",
          fontSize: 20,
          lineHeight: 1.5,
          color: "#b5462f",
        }}
      >
        ARCADE
      </div>
      <p
        style={{
          maxWidth: 320,
          fontFamily: "var(--font-dm-sans), sans-serif",
          fontSize: 14.5,
          lineHeight: 1.6,
          color: "#5c5343",
        }}
      >
        De arcade komt binnenkort. Zodra{" "}
        <code>Arcade.dc.html</code> is toegevoegd, verschijnt hier het spel.
      </p>
      <Link
        href="/"
        style={{
          display: "inline-block",
          fontFamily: "var(--font-dm-sans), sans-serif",
          fontWeight: 600,
          fontSize: 14,
          color: "#f3ebdb",
          textDecoration: "none",
          padding: "13px 26px",
          background: "#2c2620",
          border: "2px solid #2c2620",
        }}
      >
        ← terug naar de kaart
      </Link>
    </main>
  );
}
