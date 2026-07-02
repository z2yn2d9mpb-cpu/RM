"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

// Port of the "Arcade" Claude Design export (Invaders / Flappy / Pou Ryan).
// The screen markup is injected verbatim and the game loops — canvas-based,
// no external deps — are ported straight from the design's DCLogic class,
// scoped to this component's root instead of the whole document. Font family
// names are rewritten to the app's next/font CSS variables, and the back-link
// points at the card route ("/").

import { useEffect, useRef } from "react";

const RAW_ARCADE_HTML = `
<div style="position: relative; min-height: 100vh; min-height: 100svh; background: radial-gradient(120% 80% at 50% 0%, #2a1543 0%, #160c28 55%, #0e0720 100%); color: #fff; font-family: 'DM Sans', sans-serif; overflow: hidden; -webkit-tap-highlight-color: transparent;">

  <div style="position: fixed; inset: 0; z-index: 40; pointer-events: none; background: repeating-linear-gradient(rgba(255,255,255,.03) 0 1px, transparent 1px 3px);"></div>

  <a href="Ryan Birthday Card.html" data-back-link="" style="position: fixed; top: calc(14px + env(safe-area-inset-top, 0px)); left: 14px; z-index: 30; display: inline-flex; align-items: center; gap: 7px; padding: 9px 14px; background: rgba(255,255,255,.08); color: #fff; border: 1.5px solid rgba(255,255,255,.3); border-radius: 999px; font: 600 12px 'DM Sans', sans-serif; text-decoration: none; backdrop-filter: blur(4px);">← terug naar de kaart</a>

  <!-- ================= MENU ================= -->
  <section data-screen="menu" data-screen-label="Arcade menu" style="position: relative; z-index: 10; min-height: 100vh; min-height: 100svh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: calc(76px + env(safe-area-inset-top, 0px)) 20px calc(40px + env(safe-area-inset-bottom, 0px)); text-align: center;">
    <div style="font: 400 10px 'Press Start 2P', monospace; color: #6de0ff; letter-spacing: 2px; animation: blinkCoin 1.4s steps(1) infinite;">▶ INSERT COIN</div>
    <h1 style="font: 400 42px/1.1 'Press Start 2P', monospace; margin: 20px 0 10px; color: #ff5bb0; animation: neonPulse 2.2s ease-in-out infinite;">ARCADE</h1>
    <div style="font: 700 21px Caveat, cursive; color: #ffd76b; margin-bottom: 28px;">Ryan's verjaardag · kies je game</div>

    <div style="display: flex; flex-direction: column; gap: 16px; width: 100%; max-width: 380px;">
      <button data-game="invaders" style="text-align: left; cursor: pointer; touch-action: manipulation; display: flex; gap: 14px; align-items: center; padding: 16px; background: linear-gradient(135deg, rgba(109,224,255,.16), rgba(255,255,255,.03)); border: 2px solid #6de0ff; border-radius: 14px; color: #fff; box-shadow: 0 0 20px -7px #6de0ff;">
        <div style="flex: 0 0 56px; height: 56px; border-radius: 10px; background: #0e0720; border: 2px solid #6de0ff; display: flex; align-items: center; justify-content: center; font: 400 11px 'Press Start 2P', monospace; color: #6de0ff;">01</div>
        <div style="flex: 1;">
          <div style="font: 400 13px 'Press Start 2P', monospace; color: #6de0ff; margin-bottom: 7px;">INVADERS</div>
          <div style="font-size: 13px; color: rgba(255,255,255,.72); line-height: 1.4;">Schiet de Ryan-aliens uit de lucht.</div>
        </div>
        <div style="font: 400 9px 'Press Start 2P', monospace; color: #ffd76b; white-space: nowrap;">PLAY ▶</div>
      </button>

      <button data-game="flappy" style="text-align: left; cursor: pointer; touch-action: manipulation; display: flex; gap: 14px; align-items: center; padding: 16px; background: linear-gradient(135deg, rgba(255,215,107,.16), rgba(255,255,255,.03)); border: 2px solid #ffd76b; border-radius: 14px; color: #fff; box-shadow: 0 0 20px -7px #ffd76b;">
        <div style="flex: 0 0 56px; height: 56px; border-radius: 10px; background: #0e0720; border: 2px solid #ffd76b; display: flex; align-items: center; justify-content: center; font: 400 11px 'Press Start 2P', monospace; color: #ffd76b;">02</div>
        <div style="flex: 1;">
          <div style="font: 400 13px 'Press Start 2P', monospace; color: #ffd76b; margin-bottom: 7px;">FLAPPY</div>
          <div style="font-size: 13px; color: rgba(255,255,255,.72); line-height: 1.4;">Laat Ryan door de buizen vliegen.</div>
        </div>
        <div style="font: 400 9px 'Press Start 2P', monospace; color: #6de0ff; white-space: nowrap;">PLAY ▶</div>
      </button>

      <button data-game="pou" style="text-align: left; cursor: pointer; touch-action: manipulation; display: flex; gap: 14px; align-items: center; padding: 16px; background: linear-gradient(135deg, rgba(125,255,176,.16), rgba(255,255,255,.03)); border: 2px solid #7dffb0; border-radius: 14px; color: #fff; box-shadow: 0 0 20px -7px #7dffb0;">
        <div style="flex: 0 0 56px; height: 56px; border-radius: 10px; background: #0e0720; border: 2px solid #7dffb0; display: flex; align-items: center; justify-content: center; font: 400 11px 'Press Start 2P', monospace; color: #7dffb0;">03</div>
        <div style="flex: 1;">
          <div style="font: 400 13px 'Press Start 2P', monospace; color: #7dffb0; margin-bottom: 7px;">POU RYAN</div>
          <div style="font-size: 13px; color: rgba(255,255,255,.72); line-height: 1.4;">Voed, was en kietel de kleine Ryan.</div>
        </div>
        <div style="font: 400 9px 'Press Start 2P', monospace; color: #ff5bb0; white-space: nowrap;">PLAY ▶</div>
      </button>
    </div>

    <div style="margin-top: 30px; font: 400 8px 'Press Start 2P', monospace; color: rgba(255,255,255,.35); line-height: 1.8;">© RYAN ARCADE · HAPPY 20</div>
  </section>

  <!-- ================= INVADERS ================= -->
  <section data-screen="invaders" data-screen-label="Invaders" style="display: none; position: relative; z-index: 10; height: 100vh; height: 100svh; flex-direction: column;">
    <div style="flex: 0 0 auto; display: flex; align-items: center; justify-content: space-between; padding: calc(12px + env(safe-area-inset-top, 0px)) 16px 12px; border-bottom: 1px solid rgba(109,224,255,.25);">
      <button data-menu="" style="cursor: pointer; touch-action: manipulation; padding: 10px 14px; background: rgba(255,255,255,.08); color: #fff; border: 1.5px solid rgba(255,255,255,.3); border-radius: 8px; font: 400 8px 'Press Start 2P', monospace;">◀ MENU</button>
      <div style="font: 400 11px 'Press Start 2P', monospace; color: #6de0ff;">INVADERS</div>
      <div data-inv-score="" style="font: 400 9px 'Press Start 2P', monospace; color: #ffd76b;">SCORE 0</div>
    </div>
    <div style="position: relative; flex: 1 1 auto; min-height: 0;">
      <canvas data-inv-canvas="" style="position: absolute; inset: 0; width: 100%; height: 100%;"></canvas>
      <div data-inv-overlay="" style="position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; background: rgba(14,7,32,.72); cursor: pointer;">
        <div data-inv-msg="" style="font: 400 20px 'Press Start 2P', monospace; color: #ff5bb0;">READY?</div>
        <div style="font: 400 9px 'Press Start 2P', monospace; color: #fff;">tik om te spelen</div>
      </div>
    </div>
    <div style="flex: 0 0 auto; display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 12px 14px calc(14px + env(safe-area-inset-bottom, 8px));">
      <div style="display: flex; gap: 10px; flex: 1 1 auto; min-width: 0;">
        <button data-inv-left="" style="flex: 1 1 0; max-width: 76px; min-width: 52px; height: 56px; border-radius: 12px; background: rgba(255,255,255,.1); border: 2px solid #6de0ff; color: #6de0ff; font-size: 22px; cursor: pointer; touch-action: none; user-select: none; -webkit-user-select: none;">◀</button>
        <button data-inv-right="" style="flex: 1 1 0; max-width: 76px; min-width: 52px; height: 56px; border-radius: 12px; background: rgba(255,255,255,.1); border: 2px solid #6de0ff; color: #6de0ff; font-size: 22px; cursor: pointer; touch-action: none; user-select: none; -webkit-user-select: none;">▶</button>
      </div>
      <button data-inv-fire="" style="flex: 1 1 0; max-width: 150px; min-width: 92px; height: 56px; border-radius: 12px; background: linear-gradient(#ff5bb0,#c23bd6); border: 2px solid #fff; color: #fff; font: 400 11px 'Press Start 2P', monospace; cursor: pointer; touch-action: none; user-select: none; -webkit-user-select: none;">FIRE</button>
    </div>
  </section>

  <!-- ================= FLAPPY ================= -->
  <section data-screen="flappy" data-screen-label="Flappy" style="display: none; position: relative; z-index: 10; height: 100vh; height: 100svh; flex-direction: column;">
    <div style="flex: 0 0 auto; display: flex; align-items: center; justify-content: space-between; padding: calc(12px + env(safe-area-inset-top, 0px)) 16px 12px; border-bottom: 1px solid rgba(255,215,107,.25);">
      <button data-menu="" style="cursor: pointer; touch-action: manipulation; padding: 10px 14px; background: rgba(255,255,255,.08); color: #fff; border: 1.5px solid rgba(255,255,255,.3); border-radius: 8px; font: 400 8px 'Press Start 2P', monospace;">◀ MENU</button>
      <div style="font: 400 11px 'Press Start 2P', monospace; color: #ffd76b;">FLAPPY</div>
      <div data-flap-score="" style="font: 400 9px 'Press Start 2P', monospace; color: #6de0ff;">0</div>
    </div>
    <div data-flap-area="" style="position: relative; flex: 1 1 auto; min-height: 0; cursor: pointer;">
      <canvas data-flap-canvas="" style="position: absolute; inset: 0; width: 100%; height: 100%;"></canvas>
      <div data-flap-overlay="" style="position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; background: rgba(14,7,32,.55); pointer-events: none;">
        <div data-flap-msg="" style="font: 400 16px 'Press Start 2P', monospace; color: #ffd76b; text-align: center; line-height: 1.6;">TIK OM TE<br>STARTEN</div>
        <div style="font: 400 9px 'Press Start 2P', monospace; color: #fff;">tik / spatie = flap</div>
      </div>
    </div>
  </section>

  <!-- ================= POU ================= -->
  <section data-screen="pou" data-screen-label="Pou" style="display: none; position: relative; z-index: 10; height: 100vh; height: 100svh; flex-direction: column; overflow: hidden; padding: calc(12px + env(safe-area-inset-top, 0px)) 18px calc(16px + env(safe-area-inset-bottom, 8px));">
    <div style="flex: 0 0 auto; display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
      <button data-menu="" style="cursor: pointer; touch-action: manipulation; padding: 10px 14px; background: rgba(255,255,255,.08); color: #fff; border: 1.5px solid rgba(255,255,255,.3); border-radius: 8px; font: 400 8px 'Press Start 2P', monospace;">◀ MENU</button>
      <div style="font: 400 11px 'Press Start 2P', monospace; color: #7dffb0;">POU RYAN</div>
      <div data-pou-mood="" style="font: 700 18px Caveat, cursive; color: #ffd76b;">Blij!</div>
    </div>

    <div style="display: flex; flex-direction: column; gap: 9px; width: 100%; max-width: 380px; margin: 8px auto 0;">
      <div style="display: flex; align-items: center; gap: 10px;"><span style="font: 400 8px 'Press Start 2P', monospace; color: #7dffb0; width: 62px;">VOEDING</span><div style="flex: 1; height: 14px; background: rgba(255,255,255,.1); border-radius: 999px; overflow: hidden;"><div data-bar-voeding="" style="height: 100%; width: 70%; background: #7dffb0; transition: width .3s ease;"></div></div></div>
      <div style="display: flex; align-items: center; gap: 10px;"><span style="font: 400 8px 'Press Start 2P', monospace; color: #6de0ff; width: 62px;">SCHOON</span><div style="flex: 1; height: 14px; background: rgba(255,255,255,.1); border-radius: 999px; overflow: hidden;"><div data-bar-schoon="" style="height: 100%; width: 70%; background: #6de0ff; transition: width .3s ease;"></div></div></div>
      <div style="display: flex; align-items: center; gap: 10px;"><span style="font: 400 8px 'Press Start 2P', monospace; color: #ff5bb0; width: 62px;">BLIJ</span><div style="flex: 1; height: 14px; background: rgba(255,255,255,.1); border-radius: 999px; overflow: hidden;"><div data-bar-blij="" style="height: 100%; width: 70%; background: #ff5bb0; transition: width .3s ease;"></div></div></div>
    </div>

    <div data-pou-stage="" style="position: relative; flex: 1 1 auto; min-height: 0; display: flex; align-items: center; justify-content: center; overflow: hidden;">
      <div data-pou="" style="position: relative; height: min(200px, 88%); aspect-ratio: 9 / 10; animation: bob 3s ease-in-out infinite;">
        <div style="position: absolute; inset: 0; border-radius: 48% 48% 44% 44% / 58% 58% 42% 42%; background: radial-gradient(120% 120% at 40% 30%, #a06a44, #7a4a2c 70%); border: 3px solid #5a3720; box-shadow: inset 0 -18px 30px -10px rgba(0,0,0,.4), 0 18px 30px -14px rgba(0,0,0,.6);"></div>
        <div style="position: absolute; left: 19%; bottom: -3%; width: 19%; height: 10%; border-radius: 0 0 40% 40%; background: #6b3f26; border: 3px solid #5a3720;"></div>
        <div style="position: absolute; right: 19%; bottom: -3%; width: 19%; height: 10%; border-radius: 0 0 40% 40%; background: #6b3f26; border: 3px solid #5a3720;"></div>
        <div data-pou-face="" style="position: absolute; left: 50%; top: 42%; transform: translate(-50%,-50%); width: 58%; aspect-ratio: 1 / 1; border-radius: 21%; background-color: #ffd3b0; background-size: cover; background-position: center; border: 3px solid #5a3720; box-shadow: inset 0 0 0 2px rgba(255,255,255,.3);"></div>
      </div>
    </div>

    <div style="flex: 0 0 auto; display: flex; gap: 10px; width: 100%; max-width: 380px; margin: 12px auto 0;">
      <button data-pou-feed="" style="flex: 1; min-height: 48px; padding: 14px 4px; border-radius: 12px; background: rgba(125,255,176,.14); border: 2px solid #7dffb0; color: #7dffb0; font: 400 9px 'Press Start 2P', monospace; cursor: pointer; touch-action: manipulation; user-select: none; -webkit-user-select: none;">VOEDEN</button>
      <button data-pou-clean="" style="flex: 1; min-height: 48px; padding: 14px 4px; border-radius: 12px; background: rgba(109,224,255,.14); border: 2px solid #6de0ff; color: #6de0ff; font: 400 9px 'Press Start 2P', monospace; cursor: pointer; touch-action: manipulation; user-select: none; -webkit-user-select: none;">WASSEN</button>
      <button data-pou-tickle="" style="flex: 1; min-height: 48px; padding: 14px 4px; border-radius: 12px; background: rgba(255,91,176,.14); border: 2px solid #ff5bb0; color: #ff5bb0; font: 400 9px 'Press Start 2P', monospace; cursor: pointer; touch-action: manipulation; user-select: none; -webkit-user-select: none;">KIETELEN</button>
    </div>
  </section>
</div>
`;

const ARCADE_HTML = RAW_ARCADE_HTML.replace(/'Press Start 2P', monospace/g, "var(--font-press-start), monospace")
  .replace(/'DM Sans', sans-serif/g, "var(--font-dm-sans), sans-serif")
  .replace(/Caveat, cursive/g, "var(--font-caveat), cursive")
  .replace(/href="Ryan Birthday Card\.html"/g, 'href="/"');

export default function Arcade() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const q = (s: string): any => root.querySelector(s);
    let stop: (() => void) | null = null;

    const sprite = new Image();

    function makeSprite(size: number, label: string) {
      const c = document.createElement("canvas");
      c.width = size;
      c.height = size;
      const x = c.getContext("2d")!;
      const rr = (px: number, py: number, w: number, h: number, r: number) => {
        x.beginPath();
        x.moveTo(px + r, py);
        x.arcTo(px + w, py, px + w, py + h, r);
        x.arcTo(px + w, py + h, px, py + h, r);
        x.arcTo(px, py + h, px, py, r);
        x.arcTo(px, py, px + w, py, r);
        x.closePath();
      };
      const m = 4;
      const s = size - 8;
      const rad = size * 0.18;
      x.fillStyle = "#ffd3b0";
      rr(m, m, s, s, rad);
      x.fill();
      x.save();
      rr(m, m, s, s, rad);
      x.clip();
      x.strokeStyle = "rgba(181,70,47,.16)";
      x.lineWidth = 5;
      for (let i = -size; i < size * 2; i += 13) {
        x.beginPath();
        x.moveTo(i, 0);
        x.lineTo(i + size, size);
        x.stroke();
      }
      x.restore();
      x.strokeStyle = "#b5462f";
      x.lineWidth = 3;
      rr(m, m, s, s, rad);
      x.stroke();
      const ey = size * 0.42;
      const er = size * 0.055;
      x.fillStyle = "#2c2620";
      x.beginPath();
      x.arc(size * 0.37, ey, er, 0, 7);
      x.arc(size * 0.63, ey, er, 0, 7);
      x.fill();
      x.fillStyle = "rgba(217,106,74,.5)";
      x.beginPath();
      x.arc(size * 0.3, ey + size * 0.12, er * 1.15, 0, 7);
      x.arc(size * 0.7, ey + size * 0.12, er * 1.15, 0, 7);
      x.fill();
      x.strokeStyle = "#2c2620";
      x.lineWidth = size * 0.035;
      x.lineCap = "round";
      x.beginPath();
      x.arc(size * 0.5, size * 0.5, size * 0.16, 0.15 * Math.PI, 0.85 * Math.PI);
      x.stroke();
      x.fillStyle = "#b5462f";
      x.font = "bold " + Math.round(size * 0.13) + 'px "DM Sans", sans-serif';
      x.textAlign = "center";
      x.fillText(label, size * 0.5, size * 0.87);
      return c.toDataURL();
    }

    function fit(canvas: any) {
      const ctx = canvas.getContext("2d");
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const W = canvas.clientWidth || canvas.parentElement.clientWidth;
      const H = canvas.clientHeight || canvas.parentElement.clientHeight;
      canvas.width = Math.max(1, Math.round(W * dpr));
      canvas.height = Math.max(1, Math.round(H * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return { ctx, W, H };
    }

    // ---------------- INVADERS ----------------
    function startInvaders() {
      const canvas = q("[data-inv-canvas]");
      let { ctx, W, H } = fit(canvas);
      const scoreEl = q("[data-inv-score]");
      const overlay = q("[data-inv-overlay]");
      let st: any;
      const reset = () => {
        const cols = 4;
        const rows = 3;
        const aw = Math.min(46, (W - 40) / cols - 12);
        const gap = (W - 40 - cols * aw) / (cols - 1);
        const aliens: any[] = [];
        for (let r = 0; r < rows; r++)
          for (let c = 0; c < cols; c++)
            aliens.push({ x: 20 + c * (aw + gap), y: 58 + r * (aw + 16), w: aw, alive: true });
        const bunkers: any[] = [];
        const bn = 3;
        const bw = 6;
        const bh = 4;
        const cs = Math.max(7, Math.min(11, W / 42));
        const by = H - 162;
        for (let i = 0; i < bn; i++) {
          const bx = (W / (bn + 1)) * (i + 1) - (bw * cs) / 2;
          for (let r = 0; r < bh; r++)
            for (let c = 0; c < bw; c++) {
              if (r >= bh - 1 && c >= 2 && c <= 3) continue;
              bunkers.push({ x: bx + c * cs, y: by + r * cs, s: cs, alive: true });
            }
        }
        st = { player: { x: W / 2 }, bullets: [], bombs: [], aliens, bunkers, dir: 1, score: 0, lives: 3, over: false, win: false, started: false, fireCd: 0, bombCd: 1100 };
      };
      reset();
      const keys: any = {};
      const kd = (e: KeyboardEvent) => {
        if (e.key === "ArrowLeft") keys.l = 1;
        if (e.key === "ArrowRight") keys.r = 1;
        if (e.key === " ") {
          keys.f = 1;
          e.preventDefault();
        }
      };
      const ku = (e: KeyboardEvent) => {
        if (e.key === "ArrowLeft") keys.l = 0;
        if (e.key === "ArrowRight") keys.r = 0;
        if (e.key === " ") keys.f = 0;
      };
      window.addEventListener("keydown", kd);
      window.addEventListener("keyup", ku);
      const binds: Array<() => void> = [];
      const hold = (sel: string, key: string) => {
        const el = q(sel);
        if (!el) return;
        const on = (e: Event) => {
          e.preventDefault();
          keys[key] = 1;
        };
        const off = (e: Event) => {
          e.preventDefault();
          keys[key] = 0;
        };
        el.addEventListener("touchstart", on, { passive: false });
        el.addEventListener("touchend", off);
        el.addEventListener("mousedown", on);
        el.addEventListener("mouseup", off);
        el.addEventListener("mouseleave", off);
        binds.push(() => {
          el.removeEventListener("touchstart", on);
          el.removeEventListener("touchend", off);
          el.removeEventListener("mousedown", on);
          el.removeEventListener("mouseup", off);
          el.removeEventListener("mouseleave", off);
        });
      };
      hold("[data-inv-left]", "l");
      hold("[data-inv-right]", "r");
      hold("[data-inv-fire]", "f");
      const start = () => {
        if (st.over) reset();
        st.started = true;
        overlay.style.display = "none";
      };
      overlay.addEventListener("click", start);

      let raf: number;
      let last = performance.now();
      const loop = (now: number) => {
        const dt = Math.min(40, now - last);
        last = now;
        const k = dt / 16;
        if (st.started && !st.over) {
          st.player.x += ((keys.r ? 1 : 0) - (keys.l ? 1 : 0)) * 5 * k;
          st.player.x = Math.max(26, Math.min(W - 26, st.player.x));
          st.fireCd -= dt;
          if (keys.f && st.fireCd <= 0) {
            st.bullets.push({ x: st.player.x, y: H - 74 });
            st.fireCd = 340;
          }
          st.bullets.forEach((b: any) => (b.y -= 9 * k));
          st.bullets = st.bullets.filter((b: any) => b.y > -12);
          const alive = st.aliens.filter((a: any) => a.alive);
          const step = (0.3 + (12 - alive.length) * 0.06) * k;
          let minX = 1e9;
          let maxX = -1e9;
          alive.forEach((a: any) => {
            minX = Math.min(minX, a.x);
            maxX = Math.max(maxX, a.x + a.w);
          });
          if (maxX + st.dir * step > W - 14 || minX + st.dir * step < 14) {
            st.dir *= -1;
            st.aliens.forEach((a: any) => {
              if (a.alive) a.y += 9;
            });
          } else
            st.aliens.forEach((a: any) => {
              if (a.alive) a.x += st.dir * step;
            });
          st.bombCd -= dt;
          if (st.bombCd <= 0 && alive.length) {
            const a = alive[(Math.random() * alive.length) | 0];
            st.bombs.push({ x: a.x + a.w / 2, y: a.y + a.w });
            st.bombCd = 850 + Math.random() * 850;
          }
          st.bombs.forEach((b: any) => (b.y += 4.4 * k));
          st.bombs = st.bombs.filter((b: any) => b.y < H + 12);
          st.bullets.forEach((bl: any) => {
            st.aliens.forEach((a: any) => {
              if (a.alive && bl.x > a.x && bl.x < a.x + a.w && bl.y > a.y && bl.y < a.y + a.w) {
                a.alive = false;
                bl.y = -200;
                st.score += 10;
              }
            });
          });
          st.bombs.forEach((b: any) => {
            if (b.y > H - 66 && Math.abs(b.x - st.player.x) < 26) {
              b.y = H + 200;
              st.lives--;
              if (st.lives <= 0) st.over = true;
            }
          });
          st.bullets.forEach((bl: any) => {
            st.bunkers.forEach((c: any) => {
              if (c.alive && bl.x > c.x && bl.x < c.x + c.s && bl.y > c.y && bl.y < c.y + c.s) {
                c.alive = false;
                bl.y = -300;
              }
            });
          });
          st.bombs.forEach((b: any) => {
            st.bunkers.forEach((c: any) => {
              if (c.alive && b.x > c.x && b.x < c.x + c.s && b.y > c.y && b.y < c.y + c.s) {
                c.alive = false;
                b.y = H + 300;
              }
            });
          });
          if (alive.some((a: any) => a.y + a.w > H - 74)) st.over = true;
          if (alive.length === 0) {
            st.over = true;
            st.win = true;
          }
          scoreEl.textContent = "SCORE " + st.score;
          if (st.over) {
            overlay.querySelector("[data-inv-msg]").textContent = st.win ? "YOU WIN!" : "GAME OVER";
            overlay.querySelector("[data-inv-msg]").style.color = st.win ? "#7dffb0" : "#ff5bb0";
            overlay.style.display = "flex";
          }
        }
        ctx.clearRect(0, 0, W, H);
        st.aliens.forEach((a: any) => {
          if (a.alive && sprite.complete) ctx.drawImage(sprite, a.x, a.y, a.w, a.w);
        });
        ctx.fillStyle = "#7dffb0";
        st.bunkers.forEach((c: any) => {
          if (c.alive) ctx.fillRect(c.x, c.y, c.s - 1, c.s - 1);
        });
        const px = st.player.x;
        const py = H - 58;
        ctx.fillStyle = "#6de0ff";
        ctx.beginPath();
        ctx.moveTo(px, py - 16);
        ctx.lineTo(px - 22, py + 14);
        ctx.lineTo(px + 22, py + 14);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.fillRect(px - 3, py - 8, 6, 10);
        ctx.fillStyle = "#ffd76b";
        st.bullets.forEach((b: any) => ctx.fillRect(b.x - 2, b.y - 10, 4, 12));
        ctx.fillStyle = "#ff5bb0";
        st.bombs.forEach((b: any) => ctx.fillRect(b.x - 2, b.y, 4, 11));
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
      const onResize = () => {
        const r = fit(canvas);
        ctx = r.ctx;
        W = r.W;
        H = r.H;
      };
      window.addEventListener("resize", onResize);
      return () => {
        cancelAnimationFrame(raf);
        window.removeEventListener("keydown", kd);
        window.removeEventListener("keyup", ku);
        window.removeEventListener("resize", onResize);
        binds.forEach((f) => f());
        overlay.removeEventListener("click", start);
      };
    }

    // ---------------- FLAPPY ----------------
    function startFlappy() {
      const canvas = q("[data-flap-canvas]");
      let { ctx, W, H } = fit(canvas);
      const scoreEl = q("[data-flap-score]");
      const overlay = q("[data-flap-overlay]");
      const area = q("[data-flap-area]");
      const GAP = 168;
      const PW = 64;
      const BR = 22;
      let bird: any;
      let pipes: any[];
      let score: number;
      let over: boolean;
      let started: boolean;
      let spawn: number;
      const reset = () => {
        bird = { x: W * 0.3, y: H * 0.45, vy: 0 };
        pipes = [];
        score = 0;
        over = false;
        started = false;
        spawn = 0;
        scoreEl.textContent = "0";
        overlay.querySelector("[data-flap-msg]").innerHTML = "TIK OM TE<br>STARTEN";
        overlay.style.display = "flex";
      };
      reset();
      const flap = () => {
        if (over) {
          reset();
          return;
        }
        started = true;
        bird.vy = -7.2;
        overlay.style.display = "none";
      };
      const onTap = (e: Event) => {
        e.preventDefault();
        flap();
      };
      area.addEventListener("mousedown", onTap);
      area.addEventListener("touchstart", onTap, { passive: false });
      const kd = (e: KeyboardEvent) => {
        if (e.key === " ") {
          e.preventDefault();
          flap();
        }
      };
      window.addEventListener("keydown", kd);

      let raf: number;
      let last = performance.now();
      const loop = (now: number) => {
        const dt = Math.min(40, now - last);
        last = now;
        const k = dt / 16;
        if (started && !over) {
          bird.vy += 0.46 * k;
          bird.y += bird.vy * k;
          spawn -= dt;
          if (spawn <= 0) {
            const gy = 54 + Math.random() * Math.max(40, H - GAP - 150);
            pipes.push({ x: W + 30, gy, passed: false });
            spawn = 1450;
          }
          pipes.forEach((p) => (p.x -= 2.7 * k));
          pipes = pipes.filter((p) => p.x > -PW - 10);
          pipes.forEach((p) => {
            if (!p.passed && p.x + PW < bird.x) {
              p.passed = true;
              score++;
              scoreEl.textContent = String(score);
            }
            if (bird.x + BR > p.x && bird.x - BR < p.x + PW && (bird.y - BR < p.gy || bird.y + BR > p.gy + GAP)) over = true;
          });
          if (bird.y + BR > H - 4 || bird.y - BR < 0) over = true;
          if (over) {
            overlay.querySelector("[data-flap-msg]").innerHTML = "GAME OVER<br>score " + score;
            overlay.style.display = "flex";
          }
        }
        // draw
        const bg = ctx.createLinearGradient(0, 0, 0, H);
        bg.addColorStop(0, "#241247");
        bg.addColorStop(1, "#3a1f5c");
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = "#7dffb0";
        ctx.strokeStyle = "#0e0720";
        ctx.lineWidth = 3;
        pipes.forEach((p) => {
          ctx.fillRect(p.x, 0, PW, p.gy);
          ctx.strokeRect(p.x, 0, PW, p.gy);
          ctx.fillRect(p.x, p.gy + GAP, PW, H - p.gy - GAP);
          ctx.strokeRect(p.x, p.gy + GAP, PW, H - p.gy - GAP);
          ctx.fillRect(p.x - 4, p.gy - 16, PW + 8, 16);
          ctx.strokeRect(p.x - 4, p.gy - 16, PW + 8, 16);
          ctx.fillRect(p.x - 4, p.gy + GAP, PW + 8, 16);
          ctx.strokeRect(p.x - 4, p.gy + GAP, PW + 8, 16);
        });
        if (sprite.complete) {
          ctx.save();
          ctx.translate(bird.x, bird.y);
          ctx.rotate(Math.max(-0.5, Math.min(0.9, bird.vy * 0.05)));
          ctx.drawImage(sprite, -BR - 4, -BR - 4, (BR + 4) * 2, (BR + 4) * 2);
          ctx.restore();
        }
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
      const onResize = () => {
        const r = fit(canvas);
        ctx = r.ctx;
        W = r.W;
        H = r.H;
      };
      window.addEventListener("resize", onResize);
      return () => {
        cancelAnimationFrame(raf);
        area.removeEventListener("mousedown", onTap);
        area.removeEventListener("touchstart", onTap);
        window.removeEventListener("keydown", kd);
        window.removeEventListener("resize", onResize);
      };
    }

    // ---------------- POU ----------------
    function startPou() {
      const face = q("[data-pou-face]");
      if (sprite) face.style.backgroundImage = "url(" + sprite.src + ")";
      const stats: any = { voeding: 72, schoon: 72, blij: 72 };
      const bars: any = { voeding: q("[data-bar-voeding]"), schoon: q("[data-bar-schoon]"), blij: q("[data-bar-blij]") };
      const pou = q("[data-pou]");
      const stage = q("[data-pou-stage]");
      const mood = q("[data-pou-mood]");
      let speechT: any = null;

      const render = () => {
        for (const key in stats) {
          stats[key] = Math.max(0, Math.min(100, stats[key]));
          if (bars[key]) bars[key].style.width = stats[key] + "%";
        }
        const avg = (stats.voeding + stats.schoon + stats.blij) / 3;
        pou.style.filter = avg < 28 ? "grayscale(.45) brightness(.9)" : "none";
        mood.textContent = avg > 66 ? "Blij!" : avg > 33 ? "Zo-zo…" : "Verzorg me!";
        mood.style.color = avg > 66 ? "#7dffb0" : avg > 33 ? "#ffd76b" : "#ff5bb0";
      };
      render();
      const decay = setInterval(() => {
        stats.voeding -= 2;
        stats.schoon -= 1.4;
        stats.blij -= 1.7;
        render();
      }, 1600);

      const wiggle = () => {
        pou.style.animation = "none";
        void pou.offsetWidth;
        pou.style.animation = "wiggle .5s ease, bob 3s ease-in-out infinite .5s";
      };
      const squish = () => {
        pou.style.animation = "none";
        void pou.offsetWidth;
        pou.style.animation = "squish .38s ease, bob 3s ease-in-out infinite .38s";
      };

      const floatText = (txt: string, color: string, big?: boolean) => {
        const el = document.createElement("div");
        el.textContent = txt;
        el.style.cssText =
          "position:absolute;left:" +
          (40 + Math.random() * 44) +
          "%;top:42%;font:700 " +
          (big ? 26 : 20) +
          "px var(--font-caveat),cursive;color:" +
          color +
          ";pointer-events:none;z-index:6;text-shadow:0 1px 3px rgba(0,0,0,.4);animation:floatUp " +
          (1 + Math.random() * 0.5) +
          "s ease-out forwards;";
        stage.appendChild(el);
        setTimeout(() => el.remove(), 1600);
      };
      const hearts = (n: number, color: string) => {
        for (let i = 0; i < n; i++) setTimeout(() => floatText("♥", color), i * 90);
      };
      const bubbles = () => {
        for (let i = 0; i < 12; i++) {
          const b = document.createElement("div");
          const sz = 12 + Math.random() * 20;
          b.style.cssText =
            "position:absolute;left:" +
            (32 + Math.random() * 66) +
            "%;bottom:38%;width:" +
            sz +
            "px;height:" +
            sz +
            "px;border-radius:50%;background:rgba(180,230,255,.6);border:1px solid rgba(255,255,255,.85);pointer-events:none;animation:bubbleUp " +
            (1 + Math.random() * 0.9) +
            "s ease-out forwards;";
          stage.appendChild(b);
          setTimeout(() => b.remove(), 2000);
        }
      };
      const swipe = () => {
        const s = document.createElement("div");
        s.style.cssText =
          "position:absolute;left:50%;top:38%;width:48px;height:32px;margin-left:-24px;border-radius:9px;background:linear-gradient(#eafff5,#bfeadd);border:2px solid #7dffb0;pointer-events:none;z-index:6;animation:swipe .75s ease forwards;";
        stage.appendChild(s);
        setTimeout(() => s.remove(), 780);
      };
      const food = () => {
        const f = document.createElement("div");
        f.style.cssText =
          "position:absolute;left:50%;top:36%;width:32px;height:32px;border-radius:50%;background:radial-gradient(120% 120% at 35% 30%,#ff8a5b,#d43f2f);border:2px solid #7a1f14;transform:translate(-50%,-170px);pointer-events:none;animation:foodDrop 1s ease-in forwards;";
        const stem = document.createElement("div");
        stem.style.cssText = "position:absolute;top:-6px;left:50%;width:3px;height:8px;background:#4a7a2c;transform:translateX(-50%) rotate(12deg);";
        f.appendChild(stem);
        stage.appendChild(f);
        setTimeout(() => f.remove(), 1050);
      };

      const phrases = ["mmm", "raak me nog eens aan", "oeh, daar ja", "ben jij het, Ryan?", "ik heb honger…", "niet zo hard kietelen!", "ik droomde over taart", "nog een keertje", "mmm knus", "wie ben jij eigenlijk?", "ik voel me raar vandaag", "gefeliciteerd hè", "aai aai aai", "doe dat nog eens", "jij ruikt lekker", "boehoe ik wil snoep"];
      let lastPhrase = -1;
      const speak = (txt: string) => {
        const ex = stage.querySelector("[data-speech]");
        if (ex) ex.remove();
        const b = document.createElement("div");
        b.setAttribute("data-speech", "");
        b.textContent = txt;
        b.style.cssText =
          "position:absolute;left:50%;top:14%;transform:translateX(-50%);background:#fffdf8;color:#2c2620;font:600 18px var(--font-caveat),cursive;padding:8px 15px;border-radius:14px;border:2px solid #2c2620;white-space:nowrap;pointer-events:none;z-index:7;box-shadow:0 6px 14px -6px rgba(0,0,0,.5);animation:pop .32s ease;";
        const tail = document.createElement("div");
        tail.style.cssText = "position:absolute;left:50%;bottom:-9px;transform:translateX(-50%);width:0;height:0;border-left:8px solid transparent;border-right:8px solid transparent;border-top:9px solid #2c2620;";
        b.appendChild(tail);
        stage.appendChild(b);
        clearTimeout(speechT);
        speechT = setTimeout(() => b.remove(), 1800);
      };

      const onPou = (e: Event) => {
        e.preventDefault();
        let idx: number;
        do {
          idx = (Math.random() * phrases.length) | 0;
        } while (idx === lastPhrase && phrases.length > 1);
        lastPhrase = idx;
        speak(phrases[idx]);
        stats.blij = Math.min(100, stats.blij + 3);
        squish();
        render();
      };
      pou.style.cursor = "pointer";
      pou.addEventListener("click", onPou);
      pou.addEventListener("touchstart", onPou, { passive: false });

      const feed = q("[data-pou-feed]");
      const clean = q("[data-pou-clean]");
      const tickle = q("[data-pou-tickle]");
      const onFeed = () => {
        stats.voeding += 20;
        stats.blij += 4;
        food();
        setTimeout(food, 180);
        floatText("nom!", "#ffd76b", true);
        hearts(2, "#ff5bb0");
        wiggle();
        render();
      };
      const onClean = () => {
        stats.schoon += 26;
        stats.blij += 3;
        bubbles();
        swipe();
        floatText("✦", "#6de0ff");
        setTimeout(() => floatText("✦", "#eafff5"), 160);
        render();
      };
      const onTickle = () => {
        stats.blij += 22;
        floatText("haha!", "#ff5bb0", true);
        hearts(3, "#ff5bb0");
        setTimeout(() => floatText("★", "#ffd76b"), 120);
        wiggle();
        render();
      };
      feed.addEventListener("click", onFeed);
      clean.addEventListener("click", onClean);
      tickle.addEventListener("click", onTickle);

      return () => {
        clearInterval(decay);
        clearTimeout(speechT);
        pou.removeEventListener("click", onPou);
        pou.removeEventListener("touchstart", onPou);
        feed.removeEventListener("click", onFeed);
        clean.removeEventListener("click", onClean);
        tickle.removeEventListener("click", onTickle);
      };
    }

    function showScreen(name: string) {
      if (stop) {
        stop();
        stop = null;
      }
      root!.querySelectorAll<HTMLElement>("[data-screen]").forEach((s) => {
        s.style.display = s.getAttribute("data-screen") === name ? "flex" : "none";
      });
      // The fixed "terug naar de kaart" pill would overlap each game's own
      // ◀ MENU button, so it only shows on the menu screen.
      const back = root!.querySelector<HTMLElement>("[data-back-link]");
      if (back) back.style.display = name === "menu" ? "inline-flex" : "none";
      window.scrollTo(0, 0);
      // let layout settle so canvas has size
      requestAnimationFrame(() => {
        if (name === "invaders") stop = startInvaders();
        else if (name === "flappy") stop = startFlappy();
        else if (name === "pou") stop = startPou();
      });
    }

    sprite.src = makeSprite(112, "RYAN");

    const menuHandlers: Array<[Element, () => void]> = [];
    root.querySelectorAll("[data-game]").forEach((b) => {
      const h = () => showScreen(b.getAttribute("data-game") || "menu");
      b.addEventListener("click", h);
      menuHandlers.push([b, h]);
    });
    root.querySelectorAll("[data-menu]").forEach((b) => {
      const h = () => showScreen("menu");
      b.addEventListener("click", h);
      menuHandlers.push([b, h]);
    });
    showScreen("menu");

    return () => {
      if (stop) stop();
      menuHandlers.forEach(([el, h]) => el.removeEventListener("click", h));
    };
  }, []);

  return <div ref={rootRef} dangerouslySetInnerHTML={{ __html: ARCADE_HTML }} />;
}
