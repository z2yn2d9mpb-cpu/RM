import type { Metadata } from "next";
import Arcade from "./Arcade";

export const metadata: Metadata = {
  title: "Ryan Arcade · The Ryan Chronicles",
  description: "Drie mini-games voor Ryan's verjaardag: Invaders, Flappy en Pou Ryan.",
};

export default function ArcadePage() {
  return <Arcade />;
}
