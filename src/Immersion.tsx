import { useEffect, useState } from "react";
import type { CSSProperties, RefObject } from "react";
import { Maximize, Minimize, Pause, Play } from "lucide-react";
import { Ambience } from "./Ambience";
import { VoiceArt } from "./Artwork";
import "./immersion.css";

export function useAtmosphereMotion() {
  const [motion, setMotion] = useState(
    () => !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setMotion(!preference.matches);
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);
  return [motion, setMotion] as const;
}

export function ImmersionControls({
  tone,
  motion,
  onMotion,
  frame,
}: {
  tone: string;
  motion: boolean;
  onMotion: () => void;
  frame: RefObject<HTMLDivElement | null>;
}) {
  const [full, setFull] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    const update = () => setFull(document.fullscreenElement === frame.current);
    document.addEventListener("fullscreenchange", update);
    return () => document.removeEventListener("fullscreenchange", update);
  }, [frame]);
  const fullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await frame.current?.requestFullscreen();
      setError("");
    } catch {
      setError("La pantalla completa no está disponible en este navegador.");
    }
  };
  return (
    <div className="immersion-tools">
      <span className="immersion-caption">
        <span className="breathing-dot" /> UN ESPACIO PARA ESTAR PRESENTE
      </span>
      <div
        className="immersion-controls"
        role="group"
        aria-label="Controles de la atmósfera"
      >
        <Ambience tone={tone} />
        <button
          type="button"
          onClick={onMotion}
          aria-pressed={motion}
          aria-label={motion ? "Pausar animaciones" : "Reanudar animaciones"}
          title={motion ? "Pausar animaciones" : "Reanudar animaciones"}
        >
          {motion ? <Pause size={15} /> : <Play size={15} />}
          <span>{motion ? "Pausar movimiento" : "Activar movimiento"}</span>
        </button>
        {document.fullscreenEnabled && (
          <button
            type="button"
            onClick={fullscreen}
            aria-pressed={full}
            aria-label={
              full ? "Salir de pantalla completa" : "Activar pantalla completa"
            }
            title={
              full ? "Salir de pantalla completa" : "Activar pantalla completa"
            }
          >
            {full ? <Minimize size={15} /> : <Maximize size={15} />}
            <span>
              {full ? "Salir de pantalla completa" : "Pantalla completa"}
            </span>
          </button>
        )}
      </div>
      {error && (
        <p className="immersion-error" role="status">
          {error}
        </p>
      )}
    </div>
  );
}

export function MemoryField({ tone }: { tone: string }) {
  return (
    <div className="experience-atmosphere" aria-hidden="true">
      <div className="atmosphere-light light-one" />
      <div className="atmosphere-light light-two" />
      <div className="pointer-light" />
      <div className="memory-orbit orbit-one" />
      <div className="memory-orbit orbit-two" />
      <svg
        className="memory-threads"
        viewBox="0 0 1440 1000"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <path d="M-100 660C150 960 270 160 620 350S1020 920 1520 410" />
        <path d="M-100 690C160 990 290 180 640 370S1040 940 1540 430" />
        <path d="M-100 720C170 1020 310 200 660 390S1060 960 1560 450" />
      </svg>
      {Array.from({ length: 18 }, (_, i) => (
        <i
          className="memory-mote"
          key={i}
          style={
            {
              "--mote-x": `${(i * 37 + 9) % 100}%`,
              "--mote-y": `${(i * 23 + 13) % 100}%`,
              "--mote-delay": `${-i * 1.7}s`,
              "--mote-duration": `${17 + (i % 5) * 4}s`,
            } as CSSProperties
          }
        />
      ))}
      <div className="atmosphere-emblem" key={tone}>
        <VoiceArt voice={tone === "neutral" ? "paciente" : tone} />
      </div>
      <div className="atmosphere-grain" />
    </div>
  );
}

export function EncounterThread({
  active,
  complete = false,
}: {
  active?: string;
  complete?: boolean;
}) {
  return (
    <div
      className={`encounter-thread ${complete ? "thread-complete" : ""}`}
      aria-hidden="true"
    >
      <span className={active === "paciente" ? "is-lit" : ""}>
        <i />
        ELENA
      </span>
      <svg viewBox="0 0 160 32" fill="none">
        <path d="M0 16C40-10 40 42 80 16S120-10 160 16" />
      </svg>
      <span className={active === "cuidadora" ? "is-lit" : ""}>
        <i />
        SU HIJA
      </span>
      <svg viewBox="0 0 160 32" fill="none">
        <path d="M0 16C40-10 40 42 80 16S120-10 160 16" />
      </svg>
      <span className={active === "medico" ? "is-lit" : ""}>
        <i />
        EL MÉDICO
      </span>
    </div>
  );
}

export function MessageLines({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <>
      {lines.map((line, i) => (
        <span
          key={i}
          className="message-verse"
          style={{ "--verse-index": i } as CSSProperties}
        >
          {line}
          {i < lines.length - 1 ? "\n" : ""}
        </span>
      ))}
    </>
  );
}
