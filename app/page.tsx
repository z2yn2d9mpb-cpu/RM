"use client";

import {
  CSSProperties,
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

/* ----------------------------------------------------------- map animation */

function animateRoute(
  path: SVGPathElement | null,
  plane: SVGGElement | null,
) {
  if (!path) return;
  const len = path.getTotalLength();
  path.style.opacity = "1";
  path.style.strokeDasharray = String(len);
  path.style.strokeDashoffset = String(len);
  path.getBoundingClientRect(); // force reflow before animating
  if (plane) {
    plane.style.opacity = "1";
    const p0 = path.getPointAtLength(0);
    plane.setAttribute("transform", `translate(${p0.x},${p0.y})`);
  }
  const dur = 2300;
  const start = performance.now();
  const step = (now: number) => {
    const t = Math.min(1, (now - start) / dur);
    const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    path.style.strokeDashoffset = String(len * (1 - e));
    if (plane) {
      const pt = path.getPointAtLength(len * e);
      plane.setAttribute("transform", `translate(${pt.x},${pt.y})`);
    }
    if (t < 1) requestAnimationFrame(step);
    else {
      path.style.strokeDasharray = "6 8";
      path.style.strokeDashoffset = "0";
    }
  };
  requestAnimationFrame(step);
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
          fontSize: 46,
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

function MilestoneCard({
  item,
  index,
  openLightbox,
}: {
  item: Milestone;
  index: number;
  openLightbox: OpenLightbox;
}) {
  const { ref, shown } = useReveal();

  return (
    <div
      ref={ref}
      style={{
        ...revealStyle(shown, `rotate(${tilt(index)}deg)`),
        position: "relative",
        background: PANEL,
        padding: "13px 14px 17px",
        marginBottom: 22,
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
  );
}

function Timeline({ openLightbox }: { openLightbox: OpenLightbox }) {
  return (
    <section style={{ padding: "24px 0 10px" }}>
      {milestones.map((m, i) => (
        <MilestoneCard key={m.age} item={m} index={i} openLightbox={openLightbox} />
      ))}
    </section>
  );
}

function MapSection() {
  const band = useReveal<HTMLElement>();
  const pathRef = useRef<SVGPathElement>(null);
  const planeRef = useRef<SVGGElement>(null);
  const hasRun = useRef(false);

  const onReveal = useCallback(() => {
    if (hasRun.current) return;
    hasRun.current = true;
    animateRoute(pathRef.current, planeRef.current);
  }, []);

  const frame = useReveal<HTMLDivElement>(0.16, onReveal);

  return (
    <section
      ref={band.ref}
      style={{
        ...revealStyle(band.shown),
        margin: "8px -18px",
        background: "#ece2cd",
        padding: "30px 24px 32px",
        borderTop: "1px dashed #cbbd9c",
        borderBottom: "1px dashed #cbbd9c",
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
          margin: "4px 0 16px",
          transform: "rotate(-1deg)",
        }}
      >
        Helemaal naar Corfu
      </h2>
      <div
        ref={frame.ref}
        style={{
          ...revealStyle(frame.shown),
          position: "relative",
          height: 360,
          background: PANEL,
          padding: 9,
          border: `1px solid ${BORDER}`,
          boxShadow: "0 14px 30px -18px rgba(60,45,25,.5)",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            backgroundColor: "#e3d8bf",
            backgroundImage:
              "repeating-linear-gradient(135deg,#d8cba9 0 11px,#e3d8bf 11px 22px)",
            overflow: "hidden",
          }}
        >
          <span
            style={{
              position: "absolute",
              left: 9,
              bottom: 8,
              fontFamily: FONT_MONO,
              fontWeight: 500,
              fontSize: 10,
              color: "#7a6b4a",
              background: "rgba(255,253,248,.8)",
              padding: "3px 7px",
            }}
          >
            europe map · drop image
          </span>
          <svg
            viewBox="0 0 300 360"
            preserveAspectRatio="none"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
          >
            <path
              ref={pathRef}
              d="M62,62 C 130,140 270,140 236,288"
              fill="none"
              stroke={STAMP_RED}
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeDasharray="6 8"
              style={{ opacity: 0 }}
            />
            <g ref={planeRef} fill={STAMP_RED} style={{ opacity: 0 }}>
              <circle r={5} />
            </g>
          </svg>
          {/* home pin */}
          <div
            style={{
              position: "absolute",
              left: "20.6%",
              top: "17.2%",
              transform: "translate(-50%,-50%)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: "50%",
                background: PANEL,
                border: `3px solid ${TEAL}`,
                margin: "0 auto",
              }}
            />
            <div
              style={{
                fontFamily: FONT_CAVEAT,
                fontWeight: 600,
                fontSize: 16,
                color: INK,
                marginTop: 2,
                transform: "rotate(-3deg)",
                whiteSpace: "nowrap",
              }}
            >
              thuis
            </div>
          </div>
          {/* Corfu pin */}
          <div
            style={{
              position: "absolute",
              left: "78.6%",
              top: "80%",
              transform: "translate(-50%,-50%)",
              textAlign: "center",
            }}
          >
            <div style={{ position: "relative", width: 16, height: 16, margin: "0 auto" }}>
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  background: STAMP_RED,
                  border: "3px solid #fffdf8",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  border: `2px solid ${STAMP_RED}`,
                  animation: "pulseRing 1.8s ease-out infinite",
                }}
              />
            </div>
            <div
              style={{
                fontFamily: FONT_CAVEAT,
                fontWeight: 600,
                fontSize: 17,
                color: INK,
                marginTop: 2,
                transform: "rotate(3deg)",
                whiteSpace: "nowrap",
              }}
            >
              Corfu!
            </div>
          </div>
        </div>
      </div>
      <p
        style={{
          margin: "15px 0 0",
          fontSize: 13.5,
          color: BODY_TEXT,
          lineHeight: 1.5,
          fontFamily: FONT_SANS,
        }}
      >
        Van <strong style={{ color: STAMP_RED }}>Ikos Dassia</strong> over het hele
        eiland — en de lange weg terug naar huis.
      </p>
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
        {galleryItems.map((g, i) => (
          <div
            key={g.label}
            onClick={() => openLightbox(g.caption)}
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
              {g.label}
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

function PageFooter() {
  const { ref, shown } = useReveal<HTMLElement>();
  return (
    <footer
      ref={ref}
      style={{
        ...revealStyle(shown),
        textAlign: "center",
        padding: "10px 0 60px",
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
          fontSize: 92,
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

/* ------------------------------------------------------------------- page */

export default function Page() {
  const [opened, setOpened] = useState(false);
  const [coverGone, setCoverGone] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);

  const openLightbox = useCallback((caption: string) => setLightbox(caption), []);

  const handleOpen = () => {
    setOpened(true);
    setTimeout(() => setCoverGone(true), 1050);
  };

  // Lock body scroll until the postcard is opened.
  useEffect(() => {
    document.body.style.overflow = opened ? "" : "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [opened]);

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
          <Timeline openLightbox={openLightbox} />
          <MapSection />
          <Gallery openLightbox={openLightbox} />
          <MessagesSection />
          <PageFooter />
        </div>
      </main>

      {!coverGone && <Cover opened={opened} onOpen={handleOpen} />}
      {lightbox && <Lightbox caption={lightbox} onClose={() => setLightbox(null)} />}
    </>
  );
}
