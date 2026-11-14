import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import "./ambience.css";

type AudioEngine = {
  context: AudioContext;
  master: GainNode;
  voices: OscillatorNode[];
  modulation: OscillatorNode;
};

const chords: Record<string, number[]> = {
  paciente: [130.81, 196, 261.63],
  cuidadora: [146.83, 220, 293.66],
  medico: [164.81, 246.94, 329.63],
};
const defaultChord = [130.81, 196, 261.63];

function audioConstructor() {
  return (
    window.AudioContext ||
    (window as Window & { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext
  );
}

function makeEngine(tone?: string): AudioEngine {
  const AudioContextClass = audioConstructor();
  if (!AudioContextClass) throw new Error("Web Audio no disponible");
  const context = new AudioContextClass();
  try {
    const master = context.createGain();
    master.gain.value = 0;
    master.connect(context.destination);
    const frequencies = chords[tone ?? ""] ?? defaultChord;
    const modulation = context.createOscillator();
    const modulationDepth = context.createGain();
    modulation.frequency.value = 0.08;
    modulationDepth.gain.value = 2;
    modulation.connect(modulationDepth);
    const voices = frequencies.map((frequency, i) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      oscillator.detune.value = i % 2 ? 2 : -2;
      gain.gain.value = i === 0 ? 0.13 : 0.07;
      oscillator.connect(gain);
      gain.connect(master);
      modulationDepth.connect(oscillator.detune);
      oscillator.start();
      return oscillator;
    });
    modulation.start();
    return { context, master, voices, modulation };
  } catch (error) {
    void context.close().catch(() => {});
    throw error;
  }
}

function fade(engine: AudioEngine, volume: number, duration = 1) {
  const now = engine.context.currentTime;
  const gain = engine.master.gain;
  gain.cancelScheduledValues(now);
  gain.setValueAtTime(gain.value, now);
  gain.linearRampToValueAtTime(volume, now + duration);
}

/** A quiet, locally synthesized soundscape. Audio starts only after a click. */
export function Ambience({ tone }: { tone?: string }) {
  const engine = useRef<AudioEngine | null>(null);
  const mounted = useRef(false);
  const enabled = useRef(false);
  const suspension = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [playing, setPlaying] = useState(false);
  const [busy, setBusy] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const [message, setMessage] = useState("");

  const clearSuspension = () => {
    if (suspension.current !== null) clearTimeout(suspension.current);
    suspension.current = null;
  };

  useEffect(() => {
    mounted.current = true;
    setUnavailable(!audioConstructor());
    const onVisibility = () => {
      const current = engine.current;
      if (!current) return;
      clearSuspension();
      if (document.hidden) {
        // Suspend immediately so switching tabs cannot leave sound behind.
        fade(current, 0, 0.05);
        void current.context.suspend().catch(() => {});
      } else if (enabled.current) {
        void current.context
          .resume()
          .then(() => {
            if (
              engine.current === current &&
              enabled.current &&
              !document.hidden
            )
              fade(current, 0.1, 1.4);
          })
          .catch(() => {
            if (mounted.current) {
              enabled.current = false;
              setPlaying(false);
              setMessage("Pulsa para volver a activar el ambiente sonoro.");
            }
          });
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      mounted.current = false;
      enabled.current = false;
      clearSuspension();
      document.removeEventListener("visibilitychange", onVisibility);
      const current = engine.current;
      engine.current = null;
      if (current) {
        current.master.gain.cancelScheduledValues(current.context.currentTime);
        current.master.gain.value = 0;
        current.voices.forEach((voice) => voice.stop());
        current.modulation.stop();
        void current.context.close().catch(() => {});
      }
    };
  }, []);

  useEffect(() => {
    const current = engine.current;
    if (!current || current.context.state === "closed") return;
    const frequencies = chords[tone ?? ""] ?? defaultChord;
    current.voices.forEach((voice, index) => {
      voice.frequency.cancelScheduledValues(current.context.currentTime);
      voice.frequency.setTargetAtTime(
        frequencies[index],
        current.context.currentTime,
        0.7,
      );
    });
  }, [tone]);

  const toggle = async () => {
    if (busy || unavailable) return;
    clearSuspension();
    setMessage("");
    const current = engine.current;
    if (enabled.current && current) {
      enabled.current = false;
      setPlaying(false);
      fade(current, 0, 0.6);
      suspension.current = setTimeout(() => {
        if (engine.current === current && !enabled.current)
          void current.context.suspend().catch(() => {});
        suspension.current = null;
      }, 650);
      return;
    }
    setBusy(true);
    let next: AudioEngine | null = null;
    try {
      next = current ?? makeEngine(tone);
      engine.current = next;
      await next.context.resume();
      if (!mounted.current || engine.current !== next) return;
      enabled.current = true;
      setPlaying(true);
      if (!document.hidden) fade(next, 0.1, 1.5);
      else await next.context.suspend();
    } catch {
      if (!mounted.current || (next && engine.current !== next)) return;
      enabled.current = false;
      setPlaying(false);
      setMessage(
        "No se pudo iniciar el sonido. Puedes seguir leyendo en silencio.",
      );
    } finally {
      if (mounted.current) setBusy(false);
    }
  };

  return (
    <div className={`ambience-control ${playing ? "is-playing" : ""}`}>
      <button
        type="button"
        className="ambience-button"
        onClick={toggle}
        aria-pressed={playing}
        aria-label={
          playing ? "Desactivar ambiente sonoro" : "Activar ambiente sonoro"
        }
        disabled={unavailable || busy}
        title={
          unavailable
            ? "Tu navegador no admite ambiente sonoro"
            : "Sonido suave y opcional; usa un volumen cómodo"
        }
      >
        {playing ? (
          <Volume2 size={16} strokeWidth={1.5} />
        ) : (
          <VolumeX size={16} strokeWidth={1.5} />
        )}
        <span>{unavailable ? "Sonido no disponible" : "Ambiente sonoro"}</span>
        <span className="ambience-indicator" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      </button>
      <span className="sr-only" role="status" aria-live="polite">
        {message}
      </span>
    </div>
  );
}
