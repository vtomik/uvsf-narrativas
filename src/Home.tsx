import { useEffect, useRef, useState } from "react";
import type { CSSProperties, MouseEvent } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import "./home-experience.css";

function ListeningRoom() {
  return (
    <div className="threshold-room" aria-hidden="true">
      <div className="threshold-aura" />
      <div className="threshold-architecture">
        <svg
          className="threshold-perspective"
          viewBox="0 0 600 600"
          fill="none"
        >
          <defs>
            <linearGradient
              id="threshold-thread"
              x1="80"
              y1="500"
              x2="500"
              y2="150"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#9fbcff" stopOpacity=".1" />
              <stop offset=".5" stopColor="#d7c1ef" stopOpacity=".65" />
              <stop offset="1" stopColor="#e7d9bb" stopOpacity=".15" />
            </linearGradient>
            <linearGradient
              id="threshold-floor"
              x1="300"
              y1="380"
              x2="300"
              y2="590"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#e2d1ab" stopOpacity=".24" />
              <stop offset="1" stopColor="#9aa7dd" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            className="threshold-wall"
            d="M80 535V80H520V535M135 500V115H465V500M185 470V150H415V470"
          />
          <path
            className="threshold-wall"
            d="M80 80L238 175M520 80L362 175M80 535L238 430M520 535L362 430"
          />
          <path
            className="threshold-floor"
            d="M238 425L45 600M267 425L190 600M333 425L410 600M362 425L555 600M45 535H555M100 495H500M151 461H449"
          />
          <path
            className="threshold-thread thread-patient"
            d="M20 397C115 450 220 318 289 304S452 260 575 330"
          />
          <path
            className="threshold-thread thread-daughter"
            d="M0 445C105 335 190 470 300 345S470 400 600 257"
          />
          <path
            className="threshold-thread thread-doctor"
            d="M38 230C160 163 195 365 301 353S457 199 583 202"
          />
        </svg>
        <div className="threshold-door-light" />
        <div className="threshold-doorway">
          <div className="threshold-door-panel">
            <span />
          </div>
          <span className="threshold-door-seam" />
        </div>
        <div className="threshold-light-path" />
      </div>
      <span className="threshold-voice voice-patient">
        <i />
        <small>01 / LA PACIENTE</small>
        <span>Una vida propia.</span>
      </span>
      <span className="threshold-voice voice-daughter">
        <i />
        <small>02 / SU HIJA</small>
        <span>Un amor que cuida.</span>
      </span>
      <span className="threshold-voice voice-doctor">
        <i />
        <small>03 / EL MÉDICO</small>
        <span>Una respuesta abierta.</span>
      </span>
      {Array.from({ length: 16 }, (_, i) => (
        <i
          className="threshold-dust"
          key={i}
          style={
            {
              "--dust-x": `${(i * 37 + 11) % 100}%`,
              "--dust-y": `${(i * 23 + 7) % 100}%`,
              "--dust-delay": `${-i * 1.3}s`,
              "--dust-duration": `${12 + (i % 5) * 3}s`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

export default function Home() {
  const frame = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [entering, setEntering] = useState(false);
  const [reduced, setReduced] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [visible, setVisible] = useState(!document.hidden);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => {
      setReduced(preference.matches);
      if (preference.matches && timer.current !== null) {
        clearTimeout(timer.current);
        timer.current = null;
        if ((window.location.hash.slice(1) || "/") === "/") {
          window.location.hash = "/experiencia";
        } else setEntering(false);
      }
    };
    const updateVisibility = () => setVisible(!document.hidden);
    const cancelEntry = () => {
      if (timer.current !== null) {
        clearTimeout(timer.current);
        timer.current = null;
        setEntering(false);
      }
    };
    preference.addEventListener("change", updateMotion);
    document.addEventListener("visibilitychange", updateVisibility);
    window.addEventListener("hashchange", cancelEntry);
    return () => {
      if (timer.current !== null) clearTimeout(timer.current);
      preference.removeEventListener("change", updateMotion);
      document.removeEventListener("visibilitychange", updateVisibility);
      window.removeEventListener("hashchange", cancelEntry);
    };
  }, []);

  const enter = (event: MouseEvent<HTMLAnchorElement>) => {
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    event.preventDefault();
    if (timer.current !== null) return;
    setEntering(true);
    timer.current = setTimeout(() => {
      timer.current = null;
      if ((window.location.hash.slice(1) || "/") === "/") {
        window.location.hash = "/experiencia";
      }
    }, 650);
  };

  return (
    <div
      className="app-home threshold-home"
      ref={frame}
      data-entering={entering ? "true" : "false"}
      data-motion={reduced ? "reduced" : "full"}
      data-visibility={visible ? "visible" : "hidden"}
      onPointerMove={(event) => {
        if (reduced || entering || event.pointerType !== "mouse") return;
        const rect = event.currentTarget.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        frame.current?.style.setProperty("--threshold-x", `${x * 10}px`);
        frame.current?.style.setProperty("--threshold-y", `${y * 8}px`);
      }}
      onPointerLeave={() => {
        frame.current?.style.setProperty("--threshold-x", "0px");
        frame.current?.style.setProperty("--threshold-y", "0px");
      }}
    >
      <div className="threshold-prelude">
        <span>POLIFONÍA DEL CUIDADO</span>
        <span>01 / EL UMBRAL</span>
      </div>
      <div className="threshold-visual">
        <ListeningRoom />
      </div>
      <div className="threshold-copy">
        <p className="threshold-overline">
          Antes de un diagnóstico, hay una vida.
        </p>
        <h1>
          Lo que no cabe
          <br />
          en la <em>ficha clínica.</em>
        </h1>
        <p className="app-home-description threshold-description">
          Al otro lado de esta puerta, tres personas viven la misma consulta.
          Ninguna la vive de la misma manera.
        </p>
        <a
          className="threshold-enter"
          href="#/experiencia"
          onClick={enter}
          aria-disabled={entering || undefined}
        >
          <span>Entrar en la experiencia</span>
          <ArrowRight size={20} strokeWidth={1.5} aria-hidden="true" />
        </a>
        <p className="threshold-invitation">
          Una escena ficticia. Escucha a la paciente, a su hija y al médico
          antes de elegir qué voz revelar.
        </p>
        <div className="threshold-other-paths">
          <a href="#/poemas">
            Los poemas <ArrowUpRight size={13} aria-hidden="true" />
          </a>
          <span aria-hidden="true" />
          <a href="#/proyecto">
            El proyecto <ArrowUpRight size={13} aria-hidden="true" />
          </a>
        </div>
      </div>
      <p className="threshold-bottom-note">
        <span aria-hidden="true" />
        Puedes entrar a tu ritmo. También puedes volver.
      </p>
      {entering && (
        <p className="sr-only" role="status">
          Entrando en la consulta…
        </p>
      )}
    </div>
  );
}
