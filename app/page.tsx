"use client";

import { useEffect, useState } from "react";

const EMOJIS = ["🌟", "✨", "🎉", "🌈", "💫", "🎊", "🦋", "🌸"];

function FloatingEmoji({ emoji, style }: { emoji: string; style: React.CSSProperties }) {
  return (
    <span
      className="pointer-events-none select-none absolute text-4xl animate-bounce"
      style={style}
    >
      {emoji}
    </span>
  );
}

export default function Home() {
  const [dots, setDots] = useState<{ id: number; emoji: string; x: number; y: number; delay: number }[]>([]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const generated = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      emoji: EMOJIS[i % EMOJIS.length],
      x: 5 + (i * 11) % 90,
      y: 5 + (i * 13) % 85,
      delay: i * 0.3,
    }));
    setDots(generated);
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-violet-100 via-pink-50 to-sky-100 flex items-center justify-center">
      {/* Soft blob background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-pink-200 opacity-30 blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-violet-300 opacity-30 blur-3xl" />
        <div className="absolute top-[30%] right-[10%] w-[30vw] h-[30vw] rounded-full bg-sky-200 opacity-20 blur-2xl" />
      </div>

      {/* Floating emojis */}
      {dots.map((d) => (
        <FloatingEmoji
          key={d.id}
          emoji={d.emoji}
          style={{
            left: `${d.x}%`,
            top: `${d.y}%`,
            animationDelay: `${d.delay}s`,
            animationDuration: `${2 + d.delay}s`,
            opacity: 0.6,
          }}
        />
      ))}

      {/* Main card */}
      <div
        className={`relative z-10 text-center px-8 py-14 transition-all duration-1000 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <div className="mb-6 text-7xl select-none">👋</div>

        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-violet-700 drop-shadow-sm mb-4">
          Hey there!
        </h1>

        <p className="text-lg sm:text-xl text-violet-500 font-medium max-w-sm mx-auto leading-relaxed">
          Something exciting is being built here.
          <br />
          <span className="text-pink-400">Stay tuned ✨</span>
        </p>

        <div className="mt-10 flex justify-center gap-3 flex-wrap">
          {["🌟 Coming Soon", "🚀 In Progress"].map((tag) => (
            <span
              key={tag}
              className="px-4 py-2 rounded-full bg-white/70 backdrop-blur text-violet-600 text-sm font-semibold shadow-sm border border-violet-100"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </main>
  );
}
