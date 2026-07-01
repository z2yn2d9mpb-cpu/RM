import type { Metadata } from "next";
import { Caveat, DM_Sans, JetBrains_Mono, Press_Start_2P } from "next/font/google";
import "./globals.css";

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-caveat",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-dm-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-jetbrains",
});

const pressStart = Press_Start_2P({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-press-start",
});

export const metadata: Metadata = {
  title: "Hoera, Ryan is 20! · The Ryan Chronicles",
  description: "Een postkaart door twintig jaar — een verjaardagskaart voor Ryan.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl">
      <body
        className={`${caveat.variable} ${dmSans.variable} ${jetbrainsMono.variable} ${pressStart.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
