import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Check,
  ChevronRight,
  Clock3,
  Copy,
  Download,
  Expand,
  MessageCircle,
  MoveHorizontal,
  Smartphone,
  Leaf,
  Plus,
  Printer,
  QrCode,
  RotateCcw,
  ShieldCheck,
  X,
} from "lucide-react";
import QRCode from "qrcode";
import collection from "./data/poems.json";
import { BrandMark, HeroArt, VoiceArt } from "./Artwork";
import { AppNavigation, AppTopBar } from "./AppNavigation";
import { TouchFeedback } from "./TouchFeedback";
import { useInstallPrompt } from "./install";
import { changeScreen } from "./transitions";
import "./phone-app.css";
import {
  EncounterThread,
  ImmersionControls,
  MemoryField,
  MessageLines,
  useAtmosphereMotion,
} from "./Immersion";
import "./redesign.css";
import "./refinements.css";

type Voice = (typeof collection.voices)[number];
const voices = collection.voices;
const base = import.meta.env.BASE_URL;
const originalFile = `${base}materiales/poemas-originales.docx`;
const roman = ["I", "II", "III"];
const reflections: Record<
  string,
  { title: string; text: string; invitation: string }
> = {
  paciente: {
    title: "Cuidar también es dejar elegir.",
    text: "Al revelar la voz de Elena, su autonomía deja de quedar detrás del diagnóstico. El miedo de su hija y la orientación del médico siguen siendo importantes; ahora pueden dialogar con lo que ella quiere para su propia vida.",
    invitation: "¿Cómo acompañarías a Elena sin decidir por ella?",
  },
  cuidadora: {
    title: "Quien cuida también necesita cuidado.",
    text: "Al revelar la voz de su hija, el cansancio y el miedo dejan de confundirse con falta de amor. Escuchar esa carga permite pensar un cuidado compartido, que acompañe a Elena y también a quien está a su lado.",
    invitation: "¿Qué apoyo necesitaría su hija para cuidar sin quedarse sola?",
  },
  medico: {
    title: "Escuchar también forma parte de tratar.",
    text: "Al revelar la voz del médico, aparece la tensión entre orientar y reconocer lo que no puede prometer. La información clínica sigue siendo necesaria; escuchar a Elena y a su hija permite darle un sentido humano.",
    invitation:
      "¿Qué pregunta abriría una conversación más allá del diagnóstico?",
  },
};

function useRoute() {
  const [route, setRoute] = useState(window.location.hash.slice(1) || "/");
  useEffect(() => {
    const onHash = () => {
      changeScreen(() => setRoute(window.location.hash.slice(1) || "/"));
      window.scrollTo({ top: 0, behavior: "instant" });
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  return route;
}

function Label({
  children,
  light = false,
}: {
  children: ReactNode;
  light?: boolean;
}) {
  return (
    <p className={`eyebrow ${light ? "light" : ""}`}>
      <span />
      {children}
    </p>
  );
}

function Modal({
  children,
  title,
  onClose,
  className = "",
}: {
  children: ReactNode;
  title: string;
  onClose: () => void;
  className?: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const alive = useRef(false);
  const exit = useRef<Animation | null>(null);
  const closing = useRef(false);
  useEffect(() => {
    alive.current = true;
    const el = dialog.current!;
    const previous = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    el.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      alive.current = false;
      exit.current?.cancel();
      el.close();
      document.body.style.overflow = previousOverflow;
      previous?.focus();
    };
  }, []);
  const close = async () => {
    if (closing.current) return;
    const el = dialog.current;
    if (
      !el ||
      !el.animate ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      onClose();
      return;
    }
    closing.current = true;
    exit.current = el.animate(
      [
        { opacity: 1, transform: "translateY(0) scale(1)" },
        { opacity: 0, transform: "translateY(16px) scale(.99)" },
      ],
      { duration: 160, easing: "cubic-bezier(.4,0,.8,.2)", fill: "forwards" },
    );
    try {
      await exit.current.finished;
    } catch {
      /* Navigation can unmount an open sheet. */
    }
    if (alive.current) onClose();
  };
  return (
    <dialog
      className={`modal ${className}`}
      ref={dialog}
      aria-label={title}
      onCancel={(e) => {
        e.preventDefault();
        void close();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) void close();
      }}
    >
      <button
        className="icon-button close-modal"
        onClick={close}
        aria-label="Cerrar ventana"
      >
        <X size={21} />
      </button>
      {children}
    </dialog>
  );
}

function PoemBody({ voice }: { voice: Voice }) {
  return (
    <div className="poem-body" data-testid={`poem-body-${voice.id}`}>
      {voice.body.split("\n\n").map((stanza, i) => (
        <p key={i}>{stanza}</p>
      ))}
    </div>
  );
}

function PoemReader({
  voice,
  onClose,
  onChange,
}: {
  voice: Voice;
  onClose: () => void;
  onChange: (v: Voice) => void;
}) {
  const [large, setLarge] = useState(false);
  const index = voices.indexOf(voice);
  const content = useRef<HTMLDivElement>(null);
  const change = (v: Voice) => {
    onChange(v);
    content.current?.scrollTo(0, 0);
  };
  return (
    <Modal
      title={`Poema ${roman[index]}: ${voice.title}`}
      onClose={onClose}
      className={`reader ${large ? "large-type" : ""}`}
    >
      <div
        className="reader-scroll"
        ref={content}
        onScroll={(event) => {
          const el = event.currentTarget;
          const progress =
            el.scrollTop / Math.max(1, el.scrollHeight - el.clientHeight);
          el.style.setProperty("--reading-progress", String(progress));
        }}
      >
        <div className="reader-progress" aria-hidden="true" />
        <div className={`reader-banner tone-${voice.id}`}>
          <VoiceArt voice={voice.id} />
          <div>
            <span className="small-caps">
              POEMA {roman[index]} · {voice.role}
            </span>
            <p>{voice.concern}</p>
          </div>
        </div>
        <div className="reader-content">
          <div className="reader-tools">
            <span className="small-caps">MIENTRAS TODAVÍA ME RECUERDES</span>
            <button
              className={`type-button ${large ? "selected" : ""}`}
              onClick={() => setLarge(!large)}
              aria-pressed={large}
              aria-label="Aumentar tamaño del texto"
            >
              Aa <Plus size={12} />
            </button>
          </div>
          <h2>{voice.title}</h2>
          <p className="reader-byline">Joel Jara · 2026</p>
          <PoemBody voice={voice} />
          <div className="reader-pagination">
            <button
              className="text-link"
              disabled={index === 0}
              onClick={() => change(voices[index - 1])}
            >
              <ArrowLeft size={16} /> Voz anterior
            </button>
            <span>{voice.number} / 03</span>
            <button
              className="text-link"
              disabled={index === 2}
              onClick={() => change(voices[index + 1])}
            >
              Siguiente voz <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function ShareModal({ onClose }: { onClose: () => void }) {
  const initial = new URL(window.location.href);
  initial.hash = "/";
  const [url, setUrl] = useState(initial.href);
  const [qr, setQr] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  useEffect(() => {
    let active = true;
    setQr("");
    setCopied(false);
    try {
      const parsed = new URL(url);
      if (!["https:", "http:"].includes(parsed.protocol))
        throw new Error("protocol");
      QRCode.toDataURL(url, {
        width: 800,
        margin: 3,
        errorCorrectionLevel: "M",
        color: { dark: "#233f36", light: "#ffffff" },
      })
        .then((result) => {
          if (active) {
            setQr(result);
            setError("");
          }
        })
        .catch(() => {
          if (active)
            setError("La dirección es demasiado larga para generar el QR.");
        });
    } catch {
      setError(
        "Escribe una dirección web válida que empiece con https:// o http://.",
      );
    }
    return () => {
      active = false;
    };
  }, [url]);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setCopyError(false);
    } catch {
      setCopyError(true);
    }
  };
  const local = /^(localhost|127\.0\.0\.1|0\.0\.0\.0)$/.test(
    new URL(initial.href).hostname,
  );
  return (
    <Modal
      title="Compartir la experiencia"
      onClose={onClose}
      className="share-modal"
    >
      <Label>PARA SEGUIR CONVERSANDO</Label>
      <h2>
        Las historias
        <br />
        <em>se comparten.</em>
      </h2>
      <p>
        Invita a alguien a escuchar. Descarga el QR para el stand o comparte el
        enlace.
      </p>
      <div className="qr-preview">
        {qr && !error ? (
          <img
            src={qr}
            width="200"
            height="200"
            alt="Código QR de la dirección indicada"
          />
        ) : (
          <QrCode size={100} />
        )}
      </div>
      <label className="input-label" htmlFor="share-url">
        Dirección de la web publicada
      </label>
      <input
        id="share-url"
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        aria-describedby="qr-help"
      />
      <p className="field-help" id="qr-help">
        {local
          ? "Estás en una vista local. Pega la URL pública antes de imprimir el QR."
          : "Puedes cambiar la dirección para generar el QR de tu sitio publicado."}
      </p>
      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
      <div className="share-actions">
        <button
          className="button secondary"
          onClick={copy}
          disabled={!!error || !qr}
        >
          {copied ? <Check size={17} /> : <Copy size={17} />}
          {copied ? "Enlace copiado" : "Copiar enlace"}
        </button>
        {qr && !error && (
          <a
            className="button primary"
            href={qr}
            download="polifonia-del-cuidado-QR.png"
          >
            <Download size={17} /> Descargar QR
          </a>
        )}
      </div>
      {copyError && (
        <p className="field-help" role="status">
          Selecciona y copia la dirección del campo de arriba.
        </p>
      )}
    </Modal>
  );
}

function VoiceCard({ voice, onRead }: { voice: Voice; onRead: () => void }) {
  const preview = voice.body
    .split("\n\n")[0]
    .split("\n")
    .slice(0, 2)
    .join("\n");
  return (
    <article className={`voice-card tone-${voice.id}`}>
      <div className="voice-card-top">
        <span>
          {voice.number} / {voice.role.toLocaleUpperCase("es")}
        </span>
        <ArrowUpRight size={20} />
      </div>
      <VoiceArt voice={voice.id} className="voice-card-art" />
      <p className="voice-theme">{voice.theme}</p>
      <h3>{voice.title}</h3>
      <p className="voice-preview">{preview}</p>
      <button className="voice-read" onClick={onRead}>
        Leer su poema{" "}
        <span>
          <ArrowRight size={18} />
        </span>
      </button>
    </article>
  );
}

function Home({
  onInstall,
  installed,
}: {
  onInstall: () => void;
  installed: boolean;
}) {
  return (
    <div className="app-home">
      <div className="app-greeting">
        <span className="app-kicker">TU PAUSA DE HOY</span>
        <span className="app-time">
          <Clock3 size={13} /> 4 min
        </span>
      </div>
      <h1>
        Lo que no cabe
        <br />
        en la <em>ficha clínica.</em>
      </h1>
      <p className="app-home-description">
        Una historia. Tres voces.
        <br />
        Un momento para mirar desde otro lugar.
      </p>
      <div className="app-story-card">
        <HeroArt />
        <div className="app-story-actions">
          <div className="app-story-meta">
            <span className="voice-dots">
              <i />
              <i />
              <i />
            </span>
            <span>3 perspectivas · A tu ritmo</span>
            <span className="story-badge">EXPERIENCIA</span>
          </div>
          <a href="#/experiencia" className="button primary app-start">
            Entrar en la experiencia <ArrowRight size={20} />
          </a>
        </div>
      </div>
      <div className="app-shortcuts">
        <a href="#/poemas">
          <span className="shortcut-icon">
            <BookOpen size={21} strokeWidth={1.4} />
          </span>
          <span>
            <strong>Los poemas</strong>
            <small>Lee a tu ritmo</small>
          </span>
          <ChevronRight size={17} />
        </a>
        <a href="#/proyecto">
          <span className="shortcut-icon">
            <Leaf size={21} strokeWidth={1.4} />
          </span>
          <span>
            <strong>El proyecto</strong>
            <small>Conoce su sentido</small>
          </span>
          <ChevronRight size={17} />
        </a>
      </div>
      {!installed && (
        <button className="app-install" onClick={onInstall}>
          <Smartphone size={16} /> Añadir a pantalla de inicio{" "}
          <Plus size={15} />
        </button>
      )}
      <p className="app-home-privacy">
        <ShieldCheck size={12} /> Sin registro. Solo tú y las historias.
      </p>
    </div>
  );
}

function Poems({ onRead }: { onRead: (voice: Voice) => void }) {
  const [continuous, setContinuous] = useState(false);
  return (
    <div className="page-width interior-page poems-page">
      <Label>LA COLECCIÓN / JOEL JARA · 2026</Label>
      <div className="page-heading">
        <h1>
          Mientras todavía
          <br />
          <em>me recuerdes.</em>
        </h1>
        <p>
          Una misma consulta. Tres voces que se cruzan
          <br />
          entre el miedo, el amor y la libertad.
        </p>
      </div>
      <div className="collection-toolbar">
        <span>
          <BookOpen size={17} /> TRES POEMAS · TRES PERSPECTIVAS
        </span>
        <div>
          <button
            className="text-link"
            onClick={() => setContinuous(!continuous)}
            aria-pressed={continuous}
          >
            <Expand size={16} />
            {continuous ? "Ver tarjetas" : "Lectura continua"}
          </button>
          <button className="text-link" onClick={() => window.print()}>
            <Printer size={16} />
            Imprimir fanzine
          </button>
          <a
            className="text-link"
            href={`${base}materiales/fanzine.pdf`}
            download
          >
            <Download size={16} />
            Fanzine PDF
          </a>
          <a className="text-link" href={originalFile} download>
            <Download size={16} />
            Descargar Word
          </a>
        </div>
      </div>
      {continuous ? (
        <div className="continuous-poems">
          {voices.map((v, i) => (
            <article className="continuous-poem" key={v.id}>
              <Label>
                POEMA {roman[i]} / {v.role}
              </Label>
              <h2>{v.title}</h2>
              <PoemBody voice={v} />
            </article>
          ))}
        </div>
      ) : (
        <div className="voice-grid">
          {voices.map((v) => (
            <VoiceCard key={v.id} voice={v} onRead={() => onRead(v)} />
          ))}
        </div>
      )}
      <div className="small-invitation">
        <p>¿Qué pasa cuando las tres voces se encuentran?</p>
        <a className="button primary" href="#/experiencia">
          Vivir la experiencia <ArrowUpRight size={18} />
        </a>
      </div>
    </div>
  );
}

function Experience({ onRead }: { onRead: (voice: Voice) => void }) {
  const [step, setStep] = useState(0);
  const [active, setActive] = useState(voices[0]);
  const [visited, setVisited] = useState<string[]>([voices[0].id]);
  const [chosen, setChosen] = useState<Voice | null>(null);
  const [question, setQuestion] = useState<number | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const motion = useAtmosphereMotion();
  const [visible, setVisible] = useState(!document.hidden);
  useEffect(() => {
    const update = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);
  const tone =
    step === 1
      ? active.id
      : (step === 2 || step === 3) && chosen
        ? chosen.id
        : "neutral";
  const names = ["La escena", "Las voces", "Tu elección", "La reflexión"];
  const go = (next: number) => {
    changeScreen(() => setStep(next), next < step ? "back" : "forward");
    window.scrollTo({ top: 0, behavior: "instant" });
  };
  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
  }, [step]);
  const listen = (v: Voice) => {
    setActive(v);
    setVisited((current) =>
      current.includes(v.id) ? current : [...current, v.id],
    );
  };
  const reset = () => {
    setActive(voices[0]);
    setVisited([voices[0].id]);
    setChosen(null);
    setQuestion(null);
    go(0);
  };
  const questions = [
    {
      title: "¿Qué voz te resultó más difícil escuchar?",
      text: "Piensa qué emoción o necesidad no habías considerado. Si estás en el stand, puedes compartir tu lectura con el equipo sin contar experiencias personales.",
    },
    {
      title: "¿Qué no aparece en una ficha clínica?",
      text: "Un diagnóstico puede orientar el tratamiento. Las palabras de estas tres personas también muestran deseos, cansancio e incertidumbre. ¿Qué aporta cada mirada al cuidado?",
    },
    {
      title: "¿Cambiarías tu elección después de escuchar?",
      text: "Volver a una voz puede abrir otro significado. No hay una respuesta correcta: tu elección señala una necesidad, sin quitar valor a las otras dos.",
    },
  ];
  return (
    <div
      className="experience-page page-width"
      ref={frame}
      data-tone={tone}
      data-step={step}
      data-motion={motion ? "playing" : "paused"}
      data-visibility={visible ? "visible" : "hidden"}
      onPointerMove={(e) => {
        if (!motion || e.pointerType !== "mouse") return;
        frame.current?.style.setProperty("--pointer-x", `${e.clientX}px`);
        frame.current?.style.setProperty("--pointer-y", `${e.clientY}px`);
      }}
    >
      <MemoryField tone={tone} />
      <div className="experience-top">
        <a className="text-link" href="#/">
          <ArrowLeft size={16} /> Volver al inicio
        </a>
        <span>
          <Clock3 size={15} /> UNA PAUSA DE 4 MINUTOS
        </span>
      </div>
      <ImmersionControls frame={frame} />
      <ol className="stepper" aria-label="Etapas de la experiencia">
        {names.map((name, i) => (
          <li
            key={name}
            className={i === step ? "current" : i < step ? "complete" : ""}
            aria-current={i === step ? "step" : undefined}
          >
            <span className="step-line" />
            <span>
              <b>{i < step ? <Check size={12} /> : `0${i + 1}`}</b>
              {name}
            </span>
          </li>
        ))}
      </ol>
      <div className="experience-stage" key={step}>
        {step === 0 && (
          <>
            <div className="experience-heading">
              <Label>01 / ANTES DE ESCUCHAR</Label>
              <h1 ref={heading} tabIndex={-1}>
                Un diagnóstico.
                <br />
                <em>Mucho por decir.</em>
              </h1>
              <p>Mientras todavía me recuerdes</p>
              <EncounterThread />
            </div>
            <div className="scene-layout">
              <div className="scene-note">
                <span className="small-caps">UNA ESCENA FICTICIA</span>
                <div className="scene-context">
                  {collection.context.map((line, i) =>
                    i === 3 ? (
                      <blockquote key={line}>«{line}»</blockquote>
                    ) : (
                      <p key={line}>{line}</p>
                    ),
                  )}
                </div>
              </div>
              <aside className="scene-aside">
                <BrandMark />
                <h2>
                  Una invitación
                  <br />a <em>cambiar de lugar.</em>
                </h2>
                <p>
                  Lee lo que cada persona siente y aún no ha dicho. Luego,
                  decide qué voz te gustaría poner sobre la mesa.
                </p>
                <p className="gentle-note">
                  Esta historia aborda el Alzheimer y el cuidado. Participar es
                  opcional; puedes hacer una pausa o salir cuando quieras.
                </p>
              </aside>
            </div>
            <div className="stage-actions">
              <span>
                <ShieldCheck size={16} /> Sin registro ni respuestas personales.
              </span>
              <button className="button primary" onClick={() => go(1)}>
                Entrar a la consulta <ArrowRight size={18} />
              </button>
            </div>
          </>
        )}
        {step === 1 && (
          <>
            <div className="experience-heading">
              <Label>02 / LOS MENSAJES NO ENVIADOS</Label>
              <h1 ref={heading} tabIndex={-1}>
                Escucha lo que
                <br />
                <em>todavía callan.</em>
              </h1>
              <p>
                Abre las tres voces antes de elegir. Cada una guarda algo
                distinto.
              </p>
              <EncounterThread active={active.id} />
            </div>
            <div className="listening-layout">
              <div
                className="voice-tabs"
                role="tablist"
                aria-label="Tres voces"
              >
                {voices.map((v) => (
                  <button
                    key={v.id}
                    id={`tab-${v.id}`}
                    role="tab"
                    aria-selected={active.id === v.id}
                    aria-controls="voice-panel"
                    className={`${active.id === v.id ? "active" : ""} tone-${v.id}`}
                    onClick={() => listen(v)}
                    onKeyDown={(e) => {
                      if (
                        [
                          "ArrowDown",
                          "ArrowUp",
                          "ArrowRight",
                          "ArrowLeft",
                          "Home",
                          "End",
                        ].includes(e.key)
                      ) {
                        e.preventDefault();
                        const i = voices.indexOf(v);
                        const next =
                          e.key === "Home"
                            ? 0
                            : e.key === "End"
                              ? 2
                              : (i +
                                  (e.key === "ArrowDown" ||
                                  e.key === "ArrowRight"
                                    ? 1
                                    : 2)) %
                                3;
                        listen(voices[next]);
                        document
                          .getElementById(`tab-${voices[next].id}`)
                          ?.focus();
                      }
                    }}
                    tabIndex={active.id === v.id ? 0 : -1}
                  >
                    <span className="tab-number">{v.number}</span>
                    <span>
                      <strong>{v.role}</strong>
                      <small>{v.name}</small>
                    </span>
                    {visited.includes(v.id) ? (
                      <Check size={17} aria-label="Voz abierta" />
                    ) : (
                      <ChevronRight size={17} />
                    )}
                  </button>
                ))}
                <p className="listening-tip">
                  Tres miradas de una misma historia.
                  <br />
                  Ninguna contiene toda la verdad.
                </p>
              </div>
              <p className="voice-swipe-hint">
                <MoveHorizontal size={14} /> Desliza para cambiar de voz
              </p>
              <div
                key={active.id}
                className={`message-panel tone-${active.id}`}
                id="voice-panel"
                role="tabpanel"
                aria-labelledby={`tab-${active.id}`}
                onPointerDown={(event) => {
                  if (
                    event.pointerType !== "touch" ||
                    (event.target as Element).closest("button, a")
                  )
                    return;
                  touch.current = { x: event.clientX, y: event.clientY };
                }}
                onPointerCancel={() => {
                  touch.current = null;
                }}
                onPointerUp={(event) => {
                  const start = touch.current;
                  touch.current = null;
                  if (!start || event.pointerType !== "touch") return;
                  const dx = event.clientX - start.x,
                    dy = event.clientY - start.y;
                  if (Math.abs(dx) > 65 && Math.abs(dx) > Math.abs(dy) * 1.4) {
                    listen(
                      voices[
                        (voices.indexOf(active) + (dx < 0 ? 1 : 2)) %
                          voices.length
                      ],
                    );
                  }
                }}
              >
                <div className="message-meta">
                  <span>
                    <span className="message-dot" /> BORRADOR · NO ENVIADO
                  </span>
                  <MessageCircle size={20} strokeWidth={1} />
                </div>
                <span className="message-recipient">De: {active.name}</span>
                <blockquote>
                  <MessageLines text={active.message} />
                </blockquote>
                <div className="message-bottom">
                  <button className="text-link" onClick={() => onRead(active)}>
                    Leer el poema completo <ArrowUpRight size={16} />
                  </button>
                </div>
              </div>
            </div>
            <div className="stage-actions">
              <button className="text-link" onClick={() => go(0)}>
                <ArrowLeft size={16} /> La escena
              </button>
              <div className="stage-next">
                <span role="status">
                  {visited.length === 3
                    ? "Has abierto las tres voces."
                    : `Te ${visited.length === 2 ? "queda 1 voz" : "quedan 2 voces"} por escuchar.`}
                </span>
                <button
                  className="button primary"
                  disabled={visited.length < 3}
                  onClick={() => go(2)}
                >
                  Hacer mi elección <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </>
        )}
        {step === 2 && (
          <>
            <div className="experience-heading">
              <Label>03 / TU MIRADA TAMBIÉN IMPORTA</Label>
              <h1 ref={heading} tabIndex={-1}>
                ¿Qué mensaje
                <br />
                <em>pondrías sobre la mesa?</em>
              </h1>
              <p>
                Elige la voz que quisieras revelar para abrir la conversación.
                <br />
                No hay una respuesta correcta. Las tres necesitan ser
                escuchadas.
              </p>
              <EncounterThread active={chosen?.id} />
            </div>
            <fieldset className="choice-fieldset">
              <legend className="sr-only">Elige un mensaje para revelar</legend>
              <div className="choice-grid">
                {voices.map((v) => (
                  <label
                    className={`choice-card tone-${v.id} ${chosen?.id === v.id ? "chosen" : ""}`}
                    key={v.id}
                  >
                    <input
                      type="radio"
                      name="reveal"
                      value={v.id}
                      checked={chosen?.id === v.id}
                      onChange={() => setChosen(v)}
                    />
                    <span className="choice-top">
                      <span>
                        {v.number} / {v.role.toLocaleUpperCase("es")}
                      </span>
                      <span className="radio-display">
                        {chosen?.id === v.id && <Check size={13} />}
                      </span>
                    </span>
                    <VoiceArt voice={v.id} />
                    <h2>{v.theme}</h2>
                    <p>{v.message}</p>
                    <span className="choice-label">
                      {chosen?.id === v.id
                        ? "Esta es mi elección"
                        : "Quiero revelar esta voz"}
                      <ArrowRight size={16} />
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="stage-actions">
              <button className="text-link" onClick={() => go(1)}>
                <ArrowLeft size={16} /> Volver a escuchar
              </button>
              <button
                className="button primary"
                disabled={!chosen}
                onClick={() => go(3)}
              >
                Revelar y reflexionar <ArrowUpRight size={18} />
              </button>
            </div>
          </>
        )}
        {step === 3 && chosen && (
          <>
            <div className="reflection-head">
              <Label>04 / LO QUE TU ELECCIÓN ILUMINA</Label>
              <div className="reflection-flower">
                <VoiceArt voice={chosen.id} />
                <span className="reflection-halo" />
              </div>
              <span className="small-caps">
                HAS DADO ESPACIO A {chosen.role.toLocaleUpperCase("es")}
              </span>
              <h1 ref={heading} tabIndex={-1}>
                {reflections[chosen.id].title}
              </h1>
              <p>{reflections[chosen.id].text}</p>
              <EncounterThread active={chosen.id} complete />
            </div>
            <div className="reflection-question">
              <span className="small-caps">
                UNA PREGUNTA PARA LLEVAR CONTIGO
              </span>
              <h2>{reflections[chosen.id].invitation}</h2>
              <p>
                Tu elección no borra las otras voces. Nos recuerda que escuchar
                una más puede cambiar lo que entendemos por cuidar.
              </p>
            </div>
            <div className="reflection-dialogue">
              <Label>SI QUIERES SEGUIR PENSANDO</Label>
              {questions.map((q, i) => (
                <div className="reflection-accordion" key={q.title}>
                  <button
                    aria-expanded={question === i}
                    onClick={() => setQuestion(question === i ? null : i)}
                  >
                    {q.title}
                    <Plus
                      size={18}
                      className={question === i ? "rotated" : ""}
                    />
                  </button>
                  {question === i && <p>{q.text}</p>}
                </div>
              ))}
              <p className="privacy-note">
                <ShieldCheck size={15} /> Tu elección solo vive en esta visita.
                No se guarda ni se envía.
              </p>
            </div>
            <div className="stage-actions final-actions">
              <button className="text-link" onClick={reset}>
                <RotateCcw size={16} /> Volver a recorrer
              </button>
              <a className="button primary" href="#/poemas">
                Llevarme los poemas <BookOpen size={18} />
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Project() {
  return (
    <div className="page-width interior-page project-page">
      <Label>EL PROYECTO / MEDICINA BASADA EN NARRATIVAS</Label>
      <div className="page-heading">
        <h1>
          El cuidado tiene
          <br />
          <em>más de una voz.</em>
        </h1>
        <p>
          Polifonía del cuidado: la vivencia clínica
          <br />a través de tres miradas poéticas.
        </p>
      </div>
      <div className="project-intro">
        <span className="project-big-number">
          03
          <span>
            VOCES.
            <br />
            UN ENCUENTRO.
          </span>
        </span>
        <div>
          <h2>
            Escuchar lo que la ficha
            <br />
            <em>no alcanza a contar.</em>
          </h2>
          <p>
            En una consulta se encuentran síntomas y diagnósticos, pero también
            miedos, deseos e incertidumbres. Esta propuesta invita a leer una
            misma situación desde la perspectiva de una paciente, su hija y un
            profesional de salud.
          </p>
          <p>
            Los poemas no reemplazan la información biomédica: abren un espacio
            para reconocer la experiencia subjetiva que también forma parte del
            cuidado.
          </p>
        </div>
      </div>
      <section className="project-section">
        <Label>LA PREGUNTA QUE NOS REÚNE</Label>
        <h2 className="project-question">
          ¿Qué cambia en nuestra comprensión del cuidado cuando escuchamos{" "}
          <em>las tres voces?</em>
        </h2>
        <p>
          Pensado para estudiantes de carreras de la salud y visitantes del
          seminario. Una lectura autónoma, accesible y voluntaria que puede
          continuar en conversación con el equipo del stand.
        </p>
      </section>
      <section className="project-section">
        <Label>DOS IDEAS PARA ABRIR LA LECTURA</Label>
        <div className="theory-grid">
          <article>
            <span className="small-caps">01 / PERSPECTIVA Y FOCALIZACIÓN</span>
            <h3>Luz Aurora Pimentel</h3>
            <cite>El relato en perspectiva</cite>
            <p>
              Lo que conocemos de una historia depende de quién la cuenta. Por
              eso las tres voces parten de la misma consulta, pero atienden a
              emociones y necesidades diferentes.
            </p>
          </article>
          <article>
            <span className="small-caps">02 / EXCEDENTE DE SENTIDO</span>
            <h3>Paul Ricoeur</h3>
            <cite>
              Teoría de la interpretación. Discurso y excedente de sentido
            </cite>
            <p>
              Un texto abre significados que van más allá de la intención
              inicial de quien lo escribe. Tu elección y tu lectura participan
              en esa interpretación; no buscamos una única respuesta.
            </p>
          </article>
        </div>
      </section>
      <section className="project-section ethics-section">
        <ShieldCheck size={36} strokeWidth={1} />
        <div>
          <h2>
            Un espacio para escuchar,
            <br />
            <em>con respeto.</em>
          </h2>
          <p>
            La escena es ficticia. Los poemas presentan un diagnóstico de
            Alzheimer y las tensiones del cuidado; no son testimonios de
            pacientes reales ni orientación médica. Puedes salir de la
            experiencia en cualquier momento.
          </p>
          <p>
            No pedimos nombres, datos de salud ni relatos personales. No usamos
            analítica, cookies ni almacenamiento de respuestas. Las elecciones
            se mantienen únicamente mientras navegas por la experiencia.
          </p>
        </div>
      </section>
      <section className="project-section">
        <Label>DE LA IDEA AL ENCUENTRO</Label>
        <div className="team-grid">
          <div>
            <span>DISEÑO Y DESARROLLO</span>
            <h3>Benjamín Corradi</h3>
          </div>
          <div>
            <span>POEMAS Y MATERIAL</span>
            <h3>Joel Jara</h3>
          </div>
          <div>
            <span>MEDIACIÓN Y MATERIAL IMPRESO</span>
            <h3>Benjamín Pinto</h3>
          </div>
        </div>
        <div className="event-note">
          <div>
            <span className="small-caps">SEMINARIO DE MEDICINA NARRATIVA</span>
            <p>
              Universidad de Valparaíso · Campus San Felipe
              <br />
              20 de noviembre de 2026
            </p>
          </div>
          <a
            className="text-link"
            href={`${base}materiales/seminario.pdf`}
            target="_blank"
            rel="noreferrer"
          >
            Ver documento del seminario <ArrowUpRight size={17} />
          </a>
        </div>
      </section>
      <div className="small-invitation">
        <p>La próxima mirada puede ser la tuya.</p>
        <a href="#/experiencia" className="button primary">
          Entrar en la experiencia <ArrowUpRight size={18} />
        </a>
      </div>
    </div>
  );
}

function PrintFanzine() {
  return (
    <div className="print-fanzine" aria-hidden="true">
      <header>
        <h1>Lo que no cabe en la ficha clínica</h1>
        <p>Polifonía del cuidado · Joel Jara · 2026</p>
        <h2>{collection.title}</h2>
        {collection.context.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </header>
      {voices.map((v) => (
        <article key={v.id}>
          <h2>{v.originalHeading}</h2>
          <PoemBody voice={v} />
        </article>
      ))}
      <footer>
        Escena ficticia. Una propuesta de Medicina Narrativa · Universidad de
        Valparaíso, Campus San Felipe · Benjamín Corradi, Joel Jara y Benjamín
        Pinto.
      </footer>
    </div>
  );
}

export default function App() {
  const route = useRoute();
  const [reader, setReader] = useState<Voice | null>(null);
  const [sharing, setSharing] = useState(false);
  const [installing, setInstalling] = useState(false);
  const { installed, isIOS, promptInstall } = useInstallPrompt();
  const install = async () => {
    const result = await promptInstall();
    if (result === "unavailable") setInstalling(true);
  };
  useEffect(() => {
    setReader(null);
    setSharing(false);
  }, [route]);
  const page =
    route === "/"
      ? "Inicio"
      : route === "/experiencia"
        ? "La experiencia"
        : route === "/poemas"
          ? "Los poemas"
          : route === "/proyecto"
            ? "El proyecto"
            : "Página no encontrada";
  useEffect(() => {
    document.title = `${page} · Polifonía del cuidado`;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute(
        "content",
        route === "/experiencia" ? "#141b36" : "#f7f8fc",
      );
  }, [page, route]);
  return (
    <>
      <a
        className="skip-link"
        href="#main"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById("main")?.focus();
        }}
      >
        Saltar al contenido
      </a>
      <div
        className={`app-shell mobile-app ${route === "/experiencia" ? "is-experience" : ""}`}
      >
        <AppTopBar onShare={() => setSharing(true)} />
        <main id="main" tabIndex={-1}>
          {route === "/" ? (
            <Home onInstall={install} installed={installed} />
          ) : route === "/experiencia" ? (
            <Experience onRead={setReader} />
          ) : route === "/poemas" ? (
            <Poems onRead={setReader} />
          ) : route === "/proyecto" ? (
            <Project />
          ) : (
            <div className="not-found page-width">
              <Label>ESTE CAMINO NO ESTÁ EN LA HISTORIA</Label>
              <h1>
                Volvamos a<br />
                <em>encontrarnos.</em>
              </h1>
              <a className="button primary" href="#/">
                Ir al inicio <ArrowRight size={17} />
              </a>
            </div>
          )}
        </main>
        <AppNavigation route={route} />
      </div>
      {reader && (
        <PoemReader
          voice={reader}
          onClose={() => setReader(null)}
          onChange={setReader}
        />
      )}{" "}
      {sharing && <ShareModal onClose={() => setSharing(false)} />}
      {installing && (
        <Modal
          title="Añadir a pantalla de inicio"
          onClose={() => setInstalling(false)}
          className="install-sheet"
        >
          <div className="sheet-handle" aria-hidden="true" />
          <Smartphone size={34} strokeWidth={1.2} />
          <Label>SIEMPRE A MANO</Label>
          <h2>
            Un lugar en
            <br />
            <em>tu teléfono.</em>
          </h2>
          <p>Abre la experiencia como una app desde tu pantalla de inicio.</p>
          <ol>
            {isIOS ? (
              <>
                <li>
                  Abre esta web en <strong>Safari</strong>.
                </li>
                <li>
                  Toca <strong>Compartir</strong> en la barra del navegador.
                </li>
                <li>
                  Elige <strong>Añadir a pantalla de inicio</strong>.
                </li>
              </>
            ) : (
              <>
                <li>
                  Abre esta web en <strong>Chrome</strong> o un navegador
                  compatible.
                </li>
                <li>
                  Toca el menú del navegador <strong>⋮</strong>.
                </li>
                <li>
                  Elige <strong>Instalar aplicación</strong> o{" "}
                  <strong>Añadir a pantalla de inicio</strong>.
                </li>
              </>
            )}
          </ol>
          <p className="install-hint">
            La instalación depende de tu navegador y de que la web esté
            publicada con HTTPS. La app necesita conexión para abrirse.
          </p>
          <button
            className="button primary"
            onClick={() => setInstalling(false)}
          >
            Entendido <Check size={17} />
          </button>
        </Modal>
      )}
      <TouchFeedback />
      <PrintFanzine />
    </>
  );
}
