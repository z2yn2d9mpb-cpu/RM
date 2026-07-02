"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  CSSProperties,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { galleryItems, messages, milestones, type Milestone } from "./data";

/* ------------------------------------------------------------------ tokens */

const STAMP_RED = "#b5462f";
const INK = "#2c2620";
const TEAL = "#3f7d78";
const BODY_TEXT = "#5c5343";
const PANEL = "#fffdf8";
const BORDER = "#e6dcc6";

const FONT_CAVEAT = "var(--font-caveat), cursive";
const FONT_SANS = "var(--font-dm-sans), sans-serif";
const FONT_MONO = "var(--font-jetbrains), monospace";
const FONT_PIXEL = "var(--font-press-start), monospace";

const EASE = "cubic-bezier(.2,.7,.2,1)";

// Diagonal-striped placeholder used wherever a real photo will go.
const stripe = (height: number): CSSProperties => ({
  height,
  backgroundColor: "#ece3d0",
  backgroundImage:
    "repeating-linear-gradient(135deg,#e0d4ba 0 9px,#ece3d0 9px 18px)",
});

// Deterministic, scrapbook-style tilt per card index.
const tilt = (i: number) => ((i * 53) % 7 - 3) * 0.55;

type OpenLightbox = (caption: string) => void;

/* ----------------------------------------------------------- reveal helper */

function useReveal<T extends HTMLElement = HTMLDivElement>(
  threshold = 0.16,
  onReveal?: () => void,
) {
  const ref = useRef<T>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            onReveal?.();
            io.unobserve(entry.target);
          }
        }
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold, onReveal]);

  return { ref, shown };
}

function revealStyle(shown: boolean, rest = ""): CSSProperties {
  return {
    opacity: shown ? 1 : 0,
    transform: shown ? rest || undefined : `${rest} translateY(26px)`.trim(),
    transition: `opacity .65s ${EASE}, transform .7s ${EASE}`,
  };
}

/* --------------------------------------------------------- globe: deps load */

// d3 + topojson-client + world-atlas are loaded once from a CDN at runtime,
// mirroring the design's own progressive-enhancement approach (a plain shaded
// circle renders while — or if — the deps fail to load).
let globeDeps: Promise<{ d3: any; topojson: any; topo: any }> | null = null;

function loadGlobeDeps() {
  if (globeDeps) return globeDeps;
  const loadScript = (src: string) =>
    new Promise<void>((res, rej) => {
      const s = document.createElement("script");
      s.src = src;
      s.onload = () => res();
      s.onerror = rej;
      document.head.appendChild(s);
    });
  globeDeps = (async () => {
    const w = window as any;
    if (!(w.d3 && w.d3.geoOrthographic)) {
      await loadScript("https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js");
    }
    if (!w.topojson) {
      await loadScript(
        "https://cdn.jsdelivr.net/npm/topojson-client@3/dist/topojson-client.min.js",
      );
    }
    // 110m atlas (not 50m): ~10x less geometry, so redrawing the whole globe
    // every scroll frame stays under the frame budget and the scroll is smooth.
    const r = await fetch(
      "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json",
    );
    const topo = await r.json();
    return { d3: w.d3, topojson: w.topojson, topo };
  })();
  return globeDeps;
}

/* --------------------------------------------------------------- fireworks */

// Canvas fireworks for the secret page. Returns a cleanup function.
function startFireworks(canvas: HTMLCanvasElement | null): (() => void) | void {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const resize = () => {
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
  };
  resize();
  window.addEventListener("resize", resize);
  const W = () => canvas.width;
  const H = () => canvas.height;
  const colors = ["#ffd76b", "#ff8a5b", "#ff5b7f", "#7fd8ff", "#b98bff", "#8affc1", "#ffffff"];
  let rockets: any[] = [];
  let sparks: any[] = [];
  let last = performance.now();
  let acc = 0;
  const gravity = 0.045 * dpr;

  const launch = () => {
    rockets.push({
      x: (0.2 + Math.random() * 0.6) * W(),
      y: H(),
      vx: (Math.random() - 0.5) * 1.6 * dpr,
      vy: -(7.5 + Math.random() * 3) * dpr,
      color: colors[(Math.random() * colors.length) | 0],
      target: (0.16 + Math.random() * 0.42) * H(),
    });
  };

  const burst = (x: number, y: number, color: string) => {
    const n = 42 + ((Math.random() * 26) | 0);
    for (let i = 0; i < n; i++) {
      const a = (Math.PI * 2 * i) / n + Math.random() * 0.2;
      const sp = (1.4 + Math.random() * 3.4) * dpr;
      sparks.push({
        x,
        y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        color: Math.random() < 0.22 ? "#ffffff" : color,
        life: 1,
        decay: 0.008 + Math.random() * 0.012,
        r: (1.3 + Math.random() * 1.6) * dpr,
      });
    }
  };

  let rafId = 0;
  const frame = (now: number) => {
    const dt = Math.min(40, now - last);
    last = now;
    acc += dt;
    if (acc > 620) {
      acc = 0;
      launch();
      if (Math.random() < 0.5) launch();
    }
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "rgba(12,10,24,.24)";
    ctx.fillRect(0, 0, W(), H());
    ctx.globalCompositeOperation = "lighter";

    rockets = rockets.filter((r) => {
      r.x += r.vx;
      r.y += r.vy;
      r.vy += gravity;
      ctx.fillStyle = r.color;
      ctx.beginPath();
      ctx.arc(r.x, r.y, 2.2 * dpr, 0, Math.PI * 2);
      ctx.fill();
      if (r.vy >= 0 || r.y <= r.target) {
        burst(r.x, r.y, r.color);
        return false;
      }
      return true;
    });

    sparks = sparks.filter((s) => {
      s.x += s.vx;
      s.y += s.vy;
      s.vy += gravity * 0.6;
      s.vx *= 0.985;
      s.vy *= 0.985;
      s.life -= s.decay;
      if (s.life <= 0) return false;
      ctx.globalAlpha = Math.max(0, s.life);
      ctx.fillStyle = s.color;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      return true;
    });

    rafId = requestAnimationFrame(frame);
  };
  launch();
  launch();
  rafId = requestAnimationFrame(frame);

  return () => {
    cancelAnimationFrame(rafId);
    window.removeEventListener("resize", resize);
  };
}

/* --------------------------------------------------------------- sections */

function IntroHeader() {
  const eyebrow = useReveal();
  const title = useReveal<HTMLHeadingElement>();
  const blurb = useReveal<HTMLParagraphElement>();

  return (
    <header style={{ padding: "40px 8px 8px", textAlign: "center" }}>
      <div
        ref={eyebrow.ref}
        style={{
          ...revealStyle(eyebrow.shown),
          fontFamily: FONT_MONO,
          fontWeight: 500,
          fontSize: 12,
          letterSpacing: ".2em",
          textTransform: "uppercase",
          color: STAMP_RED,
        }}
      >
        — twintig jaar —
      </div>
      <h1
        ref={title.ref}
        style={{
          ...revealStyle(title.shown, "rotate(-1.5deg)"),
          fontFamily: FONT_CAVEAT,
          fontWeight: 700,
          fontSize: "clamp(38px, 13vw, 46px)",
          lineHeight: 0.92,
          margin: "8px 0 6px",
        }}
      >
        The Ryan Chronicles
      </h1>
      <p
        ref={blurb.ref}
        style={{
          ...revealStyle(blurb.shown),
          margin: "6px auto 0",
          maxWidth: 300,
          fontSize: 13.5,
          lineHeight: 1.55,
          color: BODY_TEXT,
          fontFamily: FONT_SANS,
        }}
      >
        {"Een postkaart door twintig jaar — scroll naar beneden en maak de reis mee. Tik op een foto om 'm te vergroten."}
      </p>
    </header>
  );
}

// Easter egg: hides behind the age-20 card and shyly peeks out from under
// its bottom edge — barely noticeable until you look for it.
function PeekButton({ onSecret }: { onSecret: () => void }) {
  const emojiRef = useRef<HTMLSpanElement>(null);

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onSecret();
      }}
      onMouseEnter={() => {
        const s = emojiRef.current;
        if (s) s.style.animation = "wiggle .4s ease";
      }}
      onAnimationEnd={() => {
        const s = emojiRef.current;
        if (s) s.style.animation = "";
      }}
      style={{
        position: "absolute",
        bottom: 0,
        left: "56%",
        zIndex: 0,
        display: "flex",
        alignItems: "center",
        gap: 7,
        padding: "9px 14px",
        background: STAMP_RED,
        color: "#fff",
        border: "none",
        borderRadius: 999,
        cursor: "pointer",
        boxShadow: "0 9px 20px -8px rgba(120,40,20,.65)",
        whiteSpace: "nowrap",
        transform: "translateX(-50%) translateY(10px) rotate(-2deg)",
        animation: "peekBottom 8s 1.5s ease-in-out infinite",
      }}
    >
      <span ref={emojiRef} style={{ fontSize: 19, lineHeight: 1 }}>
        🤫
      </span>
      <span
        style={{
          fontFamily: FONT_SANS,
          fontWeight: 700,
          fontSize: 12,
          letterSpacing: ".01em",
        }}
      >
        klik mij niet
      </span>
    </button>
  );
}

function MilestoneCard({
  item,
  index,
  openLightbox,
  onSecret,
}: {
  item: Milestone;
  index: number;
  openLightbox: OpenLightbox;
  onSecret: () => void;
}) {
  const { ref, shown } = useReveal();

  return (
    <div style={{ position: "relative", marginBottom: item.peek ? 36 : 22 }}>
      {item.peek && <PeekButton onSecret={onSecret} />}
      <div
        ref={ref}
        style={{
          ...revealStyle(shown, `rotate(${tilt(index)}deg)`),
          position: "relative",
          zIndex: 1,
          background: PANEL,
          padding: "13px 14px 17px",
          boxShadow: "0 14px 28px -16px rgba(60,45,25,.5)",
          border: `1px solid ${BORDER}`,
        }}
      >
        {/* tape strip */}
        <div
          style={{
            position: "absolute",
            top: -11,
            left: "50%",
            transform: "translateX(-50%) rotate(-2deg)",
            width: 64,
            height: 20,
            background: "rgba(180,150,90,.32)",
            border: "1px dashed rgba(120,95,50,.4)",
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 8,
            marginBottom: 4,
          }}
        >
          <span
            style={{
              fontFamily: FONT_MONO,
              fontWeight: 700,
              fontSize: 14,
              color: STAMP_RED,
            }}
          >
            AGE {item.age}
          </span>
          <span style={{ flex: 1, height: 1, background: "#e0d5bd" }} />
        </div>
        <div
          style={{
            fontFamily: FONT_CAVEAT,
            fontWeight: 700,
            fontSize: 24,
            lineHeight: 1.05,
            marginBottom: 3,
          }}
        >
          {item.title}
        </div>
        <div
          style={{
            fontSize: 13.5,
            lineHeight: 1.5,
            color: BODY_TEXT,
            fontFamily: FONT_SANS,
          }}
        >
          {item.text}
        </div>
        {item.photo && (
          <div
            onClick={() => openLightbox(`Age ${item.age} — ${item.title}`)}
            style={{
              marginTop: 12,
              padding: "8px 8px 26px",
              background: "#fff",
              border: `1px solid ${BORDER}`,
              boxShadow: "0 5px 12px -7px rgba(60,45,25,.4)",
              cursor: "zoom-in",
            }}
          >
            <div style={stripe(150)} />
            <div
              style={{
                fontFamily: FONT_CAVEAT,
                fontWeight: 600,
                fontSize: 16,
                color: "#7a6e54",
                textAlign: "center",
                marginTop: 6,
              }}
            >
              age {item.age}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Timeline({
  openLightbox,
  onSecret,
}: {
  openLightbox: OpenLightbox;
  onSecret: () => void;
}) {
  return (
    <section style={{ padding: "24px 0 10px" }}>
      {milestones.map((m, i) => (
        <MilestoneCard
          key={m.age}
          item={m}
          index={i}
          openLightbox={openLightbox}
          onSecret={onSecret}
        />
      ))}
    </section>
  );
}

/* --------------------------------------------------------------- the globe */

function GlobeSection() {
  const trackRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const track = trackRef.current;
    if (!canvas || !track) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const clamp = (v: number, a: number, b: number) =>
      Math.max(a, Math.min(b, v));
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const easeInOut = (t: number) =>
      t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    const CORFU: [number, number] = [19.92, 39.62];
    const GOES: [number, number] = [3.89, 51.5];

    const g: any = { W: 0, H: 0, ready: false };
    let lastP = -1;
    let lastReady = false;

    const resize = () => {
      // Cap DPR at 1.5: full-globe redraws are fill-bound, so fewer device
      // pixels directly cuts per-frame cost on hi-dpi screens.
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const W = canvas.clientWidth;
      const H = canvas.clientHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.W = W;
      g.H = H;
      if (g.projection) g.projection.translate([W / 2, H / 2]);
    };

    const draw = () => {
      const W = g.W;
      const H = g.H;
      const cx = W / 2;
      const cy = H / 2;
      const rect = track.getBoundingClientRect();
      const total = Math.max(1, track.offsetHeight - window.innerHeight);
      const p = clamp(-rect.top / total, 0, 1);
      if (hintRef.current)
        hintRef.current.style.opacity = String(clamp(1 - p * 4, 0, 1));

      // Skip redundant redraws: scroll fires far more often than the globe
      // meaningfully moves, and each redraw is expensive.
      if (Math.abs(p - lastP) < 0.0004 && g.ready === lastReady) return;
      lastP = p;
      lastReady = g.ready;

      const baseR = 0.46 * Math.min(W, H);
      const camT = easeInOut(clamp((p - 0.04) / 0.6, 0, 1));
      const lon0 = lerp(-95, 11.8, camT);
      const lat0 = lerp(8, 46, camT);
      const R = baseR * lerp(1.0, 3.2, camT);
      const routeFrac = clamp((p - 0.72) / 0.26, 0, 1);
      const labelA = clamp((p - 0.52) / 0.18, 0, 1);

      ctx.clearRect(0, 0, W, H);

      if (!g.ready) {
        ctx.beginPath();
        ctx.arc(cx, cy, baseR, 0, Math.PI * 2);
        const lg = ctx.createRadialGradient(
          cx - baseR * 0.3,
          cy - baseR * 0.35,
          baseR * 0.1,
          cx,
          cy,
          baseR,
        );
        lg.addColorStop(0, "#e9dfc7");
        lg.addColorStop(1, "#d6c8a4");
        ctx.fillStyle = lg;
        ctx.fill();
        ctx.fillStyle = "#9c8e6f";
        ctx.font = "600 16px 'Caveat', cursive";
        ctx.textAlign = "center";
        ctx.fillText("de wereld laden…", cx, cy);
        return;
      }

      const proj = g.projection.rotate([-lon0, -lat0]).scale(R);
      const path = g.path;

      // ocean
      ctx.beginPath();
      path({ type: "Sphere" });
      const grad = ctx.createRadialGradient(
        cx - R * 0.3,
        cy - R * 0.35,
        R * 0.1,
        cx,
        cy,
        R,
      );
      grad.addColorStop(0, "#eadfc6");
      grad.addColorStop(1, "#d3c39d");
      ctx.fillStyle = grad;
      ctx.fill();

      // graticule
      ctx.beginPath();
      path(g.graticule);
      ctx.strokeStyle = "rgba(120,95,50,.13)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // land
      ctx.beginPath();
      path(g.land);
      ctx.fillStyle = "#c9b78d";
      ctx.fill();

      // country borders
      ctx.beginPath();
      path(g.borders);
      ctx.strokeStyle = "rgba(110,88,46,.55)";
      ctx.lineWidth = 0.7;
      ctx.stroke();

      // coastline / land outline
      ctx.beginPath();
      path(g.land);
      ctx.strokeStyle = "rgba(90,70,40,.5)";
      ctx.lineWidth = 0.9;
      ctx.stroke();

      // sphere rim
      ctx.beginPath();
      path({ type: "Sphere" });
      ctx.strokeStyle = "rgba(90,70,40,.35)";
      ctx.lineWidth = 1.4;
      ctx.stroke();

      // route Corfu -> Goes
      const geoDistance = g.geoDistance;
      const center: [number, number] = [lon0, lat0];
      const visible = (lon: number, lat: number) =>
        geoDistance([lon, lat], center) < Math.PI / 2;
      const N = 120;
      const pts: { x: number; y: number; vis: boolean }[] = [];
      for (let i = 0; i <= N; i++) {
        const t = i / N;
        const lon = lerp(CORFU[0], GOES[0], t);
        const lat = lerp(CORFU[1], GOES[1], t) + Math.sin(t * Math.PI) * 3.2;
        const xy = proj([lon, lat]);
        pts.push({
          x: xy ? xy[0] : 0,
          y: xy ? xy[1] : 0,
          vis: !!xy && visible(lon, lat),
        });
      }
      const upto = Math.floor(routeFrac * N);
      if (upto > 0) {
        ctx.setLineDash([6, 7]);
        ctx.lineWidth = 2.6;
        ctx.strokeStyle = "#b5462f";
        ctx.lineCap = "round";
        ctx.beginPath();
        let pen = false;
        for (let i = 0; i <= upto; i++) {
          const q = pts[i];
          if (q.vis) {
            if (!pen) {
              ctx.moveTo(q.x, q.y);
              pen = true;
            } else ctx.lineTo(q.x, q.y);
          } else pen = false;
        }
        ctx.stroke();
        ctx.setLineDash([]);
        const head = pts[Math.min(upto, N)];
        if (head && head.vis) {
          ctx.fillStyle = "#b5462f";
          ctx.beginPath();
          ctx.arc(head.x, head.y, 4.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // markers
      const marker = (
        lon: number,
        lat: number,
        ring: string,
        label: string,
        labelColor: string,
        dy: number,
      ) => {
        if (!visible(lon, lat)) return;
        const xy = proj([lon, lat]);
        if (!xy) return;
        ctx.beginPath();
        ctx.arc(xy[0], xy[1], 6, 0, Math.PI * 2);
        ctx.fillStyle = "#fffdf8";
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = ring;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(xy[0], xy[1], 2.8, 0, Math.PI * 2);
        ctx.fillStyle = ring;
        ctx.fill();
        if (labelA > 0 && label) {
          ctx.globalAlpha = labelA;
          ctx.font = "600 20px 'Caveat', cursive";
          ctx.textAlign = "center";
          ctx.lineWidth = 3.5;
          ctx.strokeStyle = "rgba(255,253,248,.92)";
          ctx.strokeText(label, xy[0], xy[1] + dy);
          ctx.fillStyle = labelColor;
          ctx.fillText(label, xy[0], xy[1] + dy);
          ctx.globalAlpha = 1;
        }
      };
      marker(CORFU[0], CORFU[1], "#b5462f", "Corfu", "#b5462f", 24);
      marker(GOES[0], GOES[1], "#3f7d78", "Goes", "#2c6e69", -14);
    };

    resize();
    let raf: number | null = null;
    const compute = () => {
      raf = null;
      draw();
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(compute);
    };
    const onResize = () => {
      resize();
      compute();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    compute();

    let cancelled = false;
    loadGlobeDeps()
      .then(({ d3, topojson, topo }) => {
        if (cancelled) return;
        g.land = topojson.feature(topo, topo.objects.countries);
        g.borders = topojson.mesh(
          topo,
          topo.objects.countries,
          (a: any, b: any) => a !== b,
        );
        g.projection = d3
          .geoOrthographic()
          .translate([g.W / 2, g.H / 2])
          .clipAngle(90);
        g.path = d3.geoPath(g.projection, ctx);
        g.geoDistance = d3.geoDistance;
        g.graticule = d3.geoGraticule10();
        g.ready = true;
        compute();
        setTimeout(compute, 200);
      })
      .catch((e) => console.warn("globe deps failed to load", e));

    return () => {
      cancelled = true;
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section
      ref={trackRef}
      style={{
        position: "relative",
        margin: "8px -18px",
        background: "#ece2cd",
        borderTop: "1px dashed #cbbd9c",
        borderBottom: "1px dashed #cbbd9c",
      }}
    >
      <div className="globe-track" style={{ position: "relative" }}>
        <div
          className="globe-sticky"
          style={{
            position: "sticky",
            top: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "22px 24px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              fontFamily: FONT_MONO,
              fontWeight: 500,
              fontSize: 13,
              letterSpacing: ".16em",
              textTransform: "uppercase",
              color: STAMP_RED,
            }}
          >
            par avion
          </div>
          <h2
            style={{
              fontFamily: FONT_CAVEAT,
              fontWeight: 700,
              fontSize: 32,
              margin: "4px 0 14px",
              transform: "rotate(-1deg)",
            }}
          >
            De lange weg naar huis
          </h2>
          <div
            style={{
              position: "relative",
              flex: "1 1 auto",
              minHeight: 0,
              background: PANEL,
              padding: 9,
              border: `1px solid ${BORDER}`,
              boxShadow: "0 14px 30px -18px rgba(60,45,25,.5)",
            }}
          >
            <canvas
              ref={canvasRef}
              style={{ display: "block", width: "100%", height: "100%" }}
            />
            <span
              style={{
                position: "absolute",
                left: 15,
                bottom: 12,
                fontFamily: FONT_MONO,
                fontWeight: 500,
                fontSize: 10,
                color: "#7a6b4a",
                background: "rgba(255,253,248,.8)",
                padding: "3px 7px",
              }}
            >
              getekende globe
            </span>
            <div
              ref={hintRef}
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 16,
                textAlign: "center",
                fontFamily: FONT_CAVEAT,
                fontWeight: 600,
                fontSize: 16,
                color: "#9c8e6f",
                transition: "opacity .4s ease",
              }}
            >
              scroll om de reis te volgen ▼
            </div>
          </div>
          <p
            style={{
              margin: "13px 0 0",
              fontSize: 13.5,
              color: BODY_TEXT,
              lineHeight: 1.5,
              fontFamily: FONT_SANS,
            }}
          >
            Van <strong style={{ color: STAMP_RED }}>Corfu</strong> helemaal terug
            naar <strong style={{ color: TEAL }}>Goes, Zeeland</strong> — de lange
            weg naar huis.
          </p>
        </div>
      </div>
    </section>
  );
}

function Gallery({ openLightbox }: { openLightbox: OpenLightbox }) {
  const heading = useReveal<HTMLHeadingElement>();
  const row = useReveal<HTMLDivElement>();

  return (
    <section style={{ padding: "30px 0 28px" }}>
      <h2
        ref={heading.ref}
        style={{
          ...revealStyle(heading.shown, "rotate(-1deg)"),
          fontFamily: FONT_CAVEAT,
          fontWeight: 700,
          fontSize: 30,
          margin: "0 0 16px",
        }}
      >
        Snapshots
      </h2>
      <div
        ref={row.ref}
        style={{
          ...revealStyle(row.shown),
          display: "flex",
          gap: 16,
          overflowX: "auto",
          paddingBottom: 12,
        }}
      >
        {galleryItems.map((gitem, i) => (
          <div
            key={gitem.label}
            onClick={() => openLightbox(gitem.caption)}
            style={{
              flex: "0 0 168px",
              padding: "9px 9px 30px",
              background: "#fff",
              border: `1px solid ${BORDER}`,
              boxShadow: "0 10px 22px -12px rgba(60,45,25,.45)",
              cursor: "zoom-in",
              transform: `rotate(${tilt(i)}deg)`,
            }}
          >
            <div style={stripe(196)} />
            <div
              style={{
                fontFamily: FONT_CAVEAT,
                fontWeight: 600,
                fontSize: 17,
                color: "#7a6e54",
                textAlign: "center",
                marginTop: 6,
              }}
            >
              {gitem.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function MessageCard({ text, name, index }: { text: string; name: string; index: number }) {
  const { ref, shown } = useReveal();
  return (
    <div
      ref={ref}
      style={{
        ...revealStyle(shown, `rotate(${tilt(index)}deg)`),
        background: PANEL,
        border: `1px solid ${BORDER}`,
        padding: "15px 16px",
        marginBottom: 14,
        boxShadow: "0 12px 22px -14px rgba(60,45,25,.45)",
      }}
    >
      <div
        style={{
          fontFamily: FONT_CAVEAT,
          fontWeight: 600,
          fontSize: 19,
          lineHeight: 1.25,
          color: "#3a3326",
        }}
      >
        “{text}”
      </div>
      <div
        style={{
          marginTop: 8,
          fontFamily: FONT_MONO,
          fontWeight: 500,
          fontSize: 11,
          color: STAMP_RED,
        }}
      >
        — {name}
      </div>
    </div>
  );
}

function AddNoteButton() {
  const original = "＋ Plak een briefje";
  const [label, setLabel] = useState(original);
  return (
    <button
      onClick={() => {
        setLabel("Binnenkort — voor nu voeg ik de briefjes voor je toe");
        setTimeout(() => setLabel(original), 2400);
      }}
      style={{
        width: "100%",
        marginTop: 4,
        padding: 14,
        border: `1.5px dashed ${STAMP_RED}`,
        background: "transparent",
        color: STAMP_RED,
        fontFamily: FONT_SANS,
        fontWeight: 600,
        fontSize: 14,
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}

function MessagesSection() {
  const heading = useReveal<HTMLHeadingElement>();
  const subtitle = useReveal<HTMLParagraphElement>();

  return (
    <section style={{ padding: "4px 0 30px" }}>
      <h2
        ref={heading.ref}
        style={{
          ...revealStyle(heading.shown, "rotate(-1deg)"),
          fontFamily: FONT_CAVEAT,
          fontWeight: 700,
          fontSize: 30,
          margin: "0 0 6px",
        }}
      >
        Briefjes voor de jarige
      </h2>
      <p
        ref={subtitle.ref}
        style={{
          ...revealStyle(subtitle.shown),
          margin: "0 0 16px",
          fontSize: 13,
          color: "#7a6e54",
          fontFamily: FONT_SANS,
        }}
      >
        Familie en vrienden — laat hieronder een berichtje achter.
      </p>
      {messages.map((m, i) => (
        <MessageCard key={i} text={m.text} name={m.name} index={i} />
      ))}
      <AddNoteButton />
    </section>
  );
}

function ArcadeCTA() {
  const { ref, shown } = useReveal<HTMLDivElement>();
  const [pressed, setPressed] = useState(false);

  return (
    <div
      ref={ref}
      style={{
        ...revealStyle(shown),
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
        padding: "30px 0 10px",
      }}
    >
      <div
        style={{
          fontFamily: FONT_MONO,
          fontWeight: 500,
          fontSize: 11,
          letterSpacing: ".18em",
          textTransform: "uppercase",
          color: "#9c8e6f",
        }}
      >
        nog even tijd over?
      </div>
      <a
        href="/arcade"
        onMouseDown={() => setPressed(true)}
        onMouseUp={() => setPressed(false)}
        onMouseLeave={() => setPressed(false)}
        onTouchStart={() => setPressed(true)}
        onTouchEnd={() => setPressed(false)}
        style={{
          display: "inline-block",
          fontFamily: FONT_PIXEL,
          fontSize: 15,
          color: "#fff",
          textDecoration: "none",
          padding: "18px 30px",
          background: "linear-gradient(#ff5bb0, #c23bd6)",
          border: "3px solid #2c2620",
          borderRadius: 8,
          letterSpacing: 1,
          transform: pressed ? "translateY(5px)" : "none",
          boxShadow: pressed
            ? "0 2px 0 #7a1f8f, 0 4px 12px -6px rgba(0,0,0,.4)"
            : "0 7px 0 #7a1f8f, 0 10px 22px -6px rgba(0,0,0,.4)",
          transition: "transform .08s ease, box-shadow .08s ease",
        }}
      >
        Verveeld?
      </a>
    </div>
  );
}

function PageFooter() {
  const { ref, shown } = useReveal<HTMLElement>();
  return (
    <footer
      ref={ref}
      style={{
        ...revealStyle(shown),
        textAlign: "center",
        padding: "18px 0 60px",
        color: "#9c8e6f",
        fontFamily: FONT_CAVEAT,
        fontWeight: 600,
        fontSize: 18,
      }}
    >
      gemaakt met liefde · deel met iedereen
    </footer>
  );
}

/* -------------------------------------------------------------- overlays */

function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      if (ref.current) {
        ref.current.style.width = `${h > 0 ? (window.scrollY / h) * 100 : 0}%`;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div
      ref={ref}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        height: 3,
        width: "0%",
        background: STAMP_RED,
        zIndex: 30,
      }}
    />
  );
}

function ShareButton() {
  const idle = "↗ Deel deze kaart";
  const [label, setLabel] = useState(idle);

  const onClick = async () => {
    const url = window.location.href;
    const data = {
      title: "Hoera, Ryan is 20!",
      text: "Een verjaardagskaart voor Ryan",
      url,
    };
    try {
      if (navigator.share) {
        await navigator.share(data);
        return;
      }
      await navigator.clipboard.writeText(url);
      setLabel("✓ Link gekopieerd");
      setTimeout(() => setLabel(idle), 2000);
    } catch {
      /* user cancelled */
    }
  };

  return (
    <button
      onClick={onClick}
      style={{
        position: "fixed",
        top: 14,
        right: 14,
        zIndex: 30,
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "9px 14px",
        border: `1.5px solid ${INK}`,
        background: "rgba(243,235,219,.92)",
        color: INK,
        fontFamily: FONT_SANS,
        fontWeight: 600,
        fontSize: 12.5,
        borderRadius: 999,
        cursor: "pointer",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
        boxShadow: "0 6px 16px -8px rgba(60,45,25,.5)",
      }}
    >
      {label}
    </button>
  );
}

function Cover({ opened, onOpen }: { opened: boolean; onOpen: () => void }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        backgroundColor: "#ddd2bb",
        backgroundImage: "radial-gradient(rgba(120,100,70,.10) 1px, transparent 1px)",
        backgroundSize: "15px 15px",
        color: INK,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "34px 28px",
        textAlign: "center",
        transform: opened ? "translateY(-106%)" : "translateY(0)",
        opacity: opened ? 0 : 1,
        transition: opened ? `transform 1s ${EASE}, opacity .6s ease` : "none",
      }}
    >
      {/* postage stamp */}
      <div
        style={{
          position: "absolute",
          top: 22,
          right: 22,
          width: 64,
          height: 78,
          border: `2px solid ${STAMP_RED}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f1e3c8",
          backgroundImage:
            "repeating-linear-gradient(135deg,#e8d6b2 0 7px,#f1e3c8 7px 14px)",
          animation: "floaty 5s ease-in-out infinite",
        }}
      >
        <span
          style={{
            fontFamily: FONT_MONO,
            fontWeight: 500,
            fontSize: 9,
            color: STAMP_RED,
            transform: "rotate(-4deg)",
          }}
        >
          {"CORFU '25"}
        </span>
      </div>
      <div
        style={{
          fontFamily: FONT_MONO,
          fontWeight: 500,
          fontSize: 12,
          letterSpacing: ".22em",
          textTransform: "uppercase",
          color: STAMP_RED,
        }}
      >
        par avion · voor ryan
      </div>
      <div
        style={{
          fontFamily: FONT_CAVEAT,
          fontWeight: 700,
          fontSize: "clamp(64px, 25vw, 92px)",
          lineHeight: 0.9,
          margin: "16px 0 2px",
          transform: "rotate(-2deg)",
        }}
      >
        Hoera, 20!
      </div>
      <div
        style={{
          fontFamily: FONT_CAVEAT,
          fontWeight: 700,
          fontSize: 56,
          color: STAMP_RED,
          transform: "rotate(1deg)",
        }}
      >
        Ryan
      </div>
      <div
        style={{
          marginTop: 18,
          fontFamily: FONT_SANS,
          fontSize: 14,
          color: BODY_TEXT,
          maxWidth: 250,
          lineHeight: 1.55,
        }}
      >
        {"Een postkaart door twintig jaar — open 'm en maak de reis mee."}
      </div>
      <button
        onClick={onOpen}
        style={{
          marginTop: 30,
          padding: "14px 30px",
          border: `2px solid ${INK}`,
          background: INK,
          color: "#f3ebdb",
          fontFamily: FONT_SANS,
          fontWeight: 600,
          fontSize: 15,
          cursor: "pointer",
        }}
      >
        Open de postkaart
      </button>
      <div
        style={{
          marginTop: 22,
          fontFamily: FONT_CAVEAT,
          fontWeight: 600,
          fontSize: 19,
          color: "#9c8e6f",
          animation: "nudge 1.6s ease-in-out infinite",
        }}
      >
        naar beneden ▼
      </div>
    </div>
  );
}

function Lightbox({ caption, onClose }: { caption: string; onClose: () => void }) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const close = () => {
    setShown(false);
    setTimeout(onClose, 320);
  };

  return (
    <div
      onClick={close}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        background: "rgba(18,16,12,.88)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 30,
        opacity: shown ? 1 : 0,
        transition: "opacity .3s ease",
        cursor: "zoom-out",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 300,
          aspectRatio: "3 / 4",
          borderRadius: 4,
          background: "#fff",
          padding: "12px 12px 36px",
          boxShadow: "0 24px 50px -16px rgba(0,0,0,.6)",
          transform: shown
            ? "scale(1) rotate(-1.5deg)"
            : "scale(.92) rotate(-1.5deg)",
          transition: `transform .35s ${EASE}`,
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            backgroundColor: "#ece3d0",
            backgroundImage:
              "repeating-linear-gradient(135deg,#e0d4ba 0 12px,#ece3d0 12px 24px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontFamily: FONT_MONO,
              fontWeight: 500,
              fontSize: 11,
              color: "#7a6b4a",
              background: "rgba(255,253,248,.85)",
              padding: "4px 9px",
            }}
          >
            foto plaatshouder
          </span>
        </div>
      </div>
      <div
        style={{
          marginTop: 18,
          color: "#f3ece0",
          fontFamily: FONT_CAVEAT,
          fontWeight: 600,
          fontSize: 20,
          textAlign: "center",
        }}
      >
        {caption}
      </div>
      <div
        style={{
          marginTop: 6,
          color: "rgba(243,236,224,.5)",
          fontFamily: FONT_MONO,
          fontWeight: 500,
          fontSize: 11,
        }}
      >
        tik om te sluiten
      </div>
    </div>
  );
}

/* ---------------------------------------------------------- secret page */

function SecretPhoto({
  caption,
  style,
  openLightbox,
  children,
}: {
  caption: string;
  style: CSSProperties;
  openLightbox: OpenLightbox;
  children?: ReactNode;
}) {
  return (
    <div
      onClick={() => openLightbox(caption)}
      style={{
        borderRadius: 6,
        cursor: "zoom-in",
        backgroundColor: "rgba(253,246,230,.08)",
        backgroundImage:
          "repeating-linear-gradient(135deg,rgba(255,215,107,.14) 0 12px,transparent 12px 24px)",
        border: "1.5px dashed rgba(255,215,107,.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function SecretPage({
  onClose,
  openLightbox,
}: {
  onClose: () => void;
  openLightbox: OpenLightbox;
}) {
  const [shown, setShown] = useState(false);
  const fwRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const raf = requestAnimationFrame(() => setShown(true));
    const cleanup = startFireworks(fwRef.current);
    return () => {
      cancelAnimationFrame(raf);
      cleanup?.();
      document.body.style.overflow = "";
    };
  }, []);

  const close = () => {
    setShown(false);
    setTimeout(onClose, 500);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 80,
        overflowY: "auto",
        WebkitOverflowScrolling: "touch",
        background:
          "radial-gradient(120% 90% at 50% 0%, #1e2a44 0%, #141326 55%, #0c0a18 100%)",
        opacity: shown ? 1 : 0,
        transition: "opacity .5s ease",
      }}
    >
      <canvas
        ref={fwRef}
        style={{
          position: "fixed",
          inset: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 460,
          margin: "0 auto",
          padding: "22px 18px 70px",
          color: "#fdf6e6",
        }}
      >
        <button
          onClick={close}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            padding: "9px 15px",
            background: "rgba(253,246,230,.1)",
            color: "#fdf6e6",
            border: "1.5px solid rgba(253,246,230,.35)",
            borderRadius: 999,
            fontFamily: FONT_SANS,
            fontWeight: 600,
            fontSize: 13,
            cursor: "pointer",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
          }}
        >
          ← terug naar de kaart
        </button>

        <div style={{ textAlign: "center", marginTop: 40 }}>
          <div
            style={{
              fontFamily: FONT_MONO,
              fontWeight: 500,
              fontSize: 12,
              letterSpacing: ".24em",
              textTransform: "uppercase",
              color: "#ffd76b",
            }}
          >
            je hebt toch geklikt 🤫
          </div>
          <div style={{ fontSize: 60, lineHeight: 1, margin: "16px 0 6px" }}>
            🎉🎆🥳
          </div>
          <h2
            style={{
              fontFamily: FONT_CAVEAT,
              fontWeight: 700,
              fontSize: 58,
              lineHeight: 0.9,
              margin: "8px 0 4px",
              color: "#fff",
              transform: "rotate(-2deg)",
            }}
          >
            Verrassing!
          </h2>
          <p
            style={{
              maxWidth: 300,
              margin: "12px auto 0",
              fontSize: 14,
              lineHeight: 1.55,
              color: "rgba(253,246,230,.82)",
              fontFamily: FONT_SANS,
            }}
          >
            Welkom op de geheime pagina, Ryan. Hier komt straks al het feestbeeld
            — foto&apos;s, filmpjes en de mooiste momenten. Voor nu: vuurwerk. 🎆
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 14,
            marginTop: 34,
          }}
        >
          <SecretPhoto
            caption="Groot feestbeeld"
            openLightbox={openLightbox}
            style={{ gridColumn: "1 / -1", aspectRatio: "16 / 10" }}
          >
            <span
              style={{
                fontFamily: FONT_MONO,
                fontWeight: 600,
                fontSize: 13,
                color: "rgba(255,215,107,.8)",
              }}
            >
              groot beeld · drop hier
            </span>
          </SecretPhoto>
          <SecretPhoto
            caption="Feestmoment"
            openLightbox={openLightbox}
            style={{ aspectRatio: "3 / 4" }}
          />
          <SecretPhoto
            caption="Feestmoment"
            openLightbox={openLightbox}
            style={{ aspectRatio: "3 / 4" }}
          />
          <SecretPhoto
            caption="Feestmoment"
            openLightbox={openLightbox}
            style={{ gridColumn: "1 / -1", aspectRatio: "16 / 9" }}
          />
        </div>

        <div
          style={{
            textAlign: "center",
            marginTop: 30,
            fontFamily: FONT_CAVEAT,
            fontWeight: 600,
            fontSize: 20,
            color: "rgba(255,215,107,.9)",
          }}
        >
          fijne verjaardag, ontdekkingsreiziger ✨
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------- page */

export default function Page() {
  const [opened, setOpened] = useState(false);
  const [coverGone, setCoverGone] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [secretOpen, setSecretOpen] = useState(false);

  const openLightbox = useCallback((caption: string) => setLightbox(caption), []);
  const openSecret = useCallback(() => setSecretOpen(true), []);

  const handleOpen = () => {
    setOpened(true);
    setTimeout(() => setCoverGone(true), 1050);
  };

  // Lock body scroll until the postcard is opened (secret page manages its own).
  useEffect(() => {
    if (secretOpen) return;
    document.body.style.overflow = opened ? "" : "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [opened, secretOpen]);

  return (
    <>
      <ScrollProgress />
      {opened && <ShareButton />}

      <main
        style={{
          position: "relative",
          minHeight: "100vh",
          backgroundColor: "#ddd2bb",
          backgroundImage:
            "radial-gradient(rgba(120,100,70,.10) 1px, transparent 1px)",
          backgroundSize: "15px 15px",
        }}
      >
        <div style={{ maxWidth: 460, margin: "0 auto", padding: "0 18px" }}>
          <IntroHeader />
          <Timeline openLightbox={openLightbox} onSecret={openSecret} />
          <GlobeSection />
          <Gallery openLightbox={openLightbox} />
          <MessagesSection />
          <ArcadeCTA />
          <PageFooter />
        </div>
      </main>

      {!coverGone && <Cover opened={opened} onOpen={handleOpen} />}
      {secretOpen && (
        <SecretPage
          onClose={() => setSecretOpen(false)}
          openLightbox={openLightbox}
        />
      )}
      {lightbox && <Lightbox caption={lightbox} onClose={() => setLightbox(null)} />}
    </>
  );
}
