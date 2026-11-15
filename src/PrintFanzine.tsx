import collection from "./data/poems.json";
import { VoiceArt } from "./Artwork";
import { UniversityLogo } from "./UniversityLogo";

function CoverThreshold() {
  return (
    <svg
      className="fanzine-threshold"
      viewBox="0 0 240 290"
      fill="none"
      aria-hidden="true"
    >
      <path d="M25 260V25H215V260M52 240V52H188V240M78 220V78H162V220" />
      <path d="M25 25L78 78M215 25L162 78M25 260L78 220M215 260L162 220" />
      <path className="fanzine-door" d="M82 220V83L151 70V231L82 220Z" />
      <path className="fanzine-door-seam" d="M162 78V220M145 150V160" />
      <path
        className="fanzine-cover-thread"
        d="M0 187C60 240 85 125 123 153S188 228 240 145M0 207C66 147 81 228 122 172S187 176 240 101"
      />
      <circle cx="28" cy="180" r="2" />
      <circle cx="205" cy="133" r="2" />
      <circle cx="170" cy="241" r="2" />
    </svg>
  );
}

/** A four-page A5 edition. Poem text is read directly from the shared source. */
export default function PrintFanzine() {
  return (
    <div className="print-fanzine">
      <header className="fanzine-page fanzine-cover">
        <div className="fanzine-cover-top">
          <span className="fanzine-kicker">UNA HISTORIA · TRES VOCES</span>
          <UniversityLogo />
        </div>
        <div className="fanzine-cover-title">
          <p className="fanzine-kicker">MEDICINA NARRATIVA</p>
          <h1>
            Polifonía
            <br />
            <em>del cuidado</em>
          </h1>
          <h2>{collection.title}</h2>
          <p className="fanzine-cover-author">
            Poemas de <strong>Joel Jara</strong>
          </p>
        </div>
        <CoverThreshold />
        <div className="fanzine-context">
          <span className="fanzine-kicker">
            ANTES DE ESCUCHAR / UNA ESCENA FICTICIA
          </span>
          {collection.context.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
        <div className="fanzine-cover-bottom">
          <span>
            Narrativas de la Enfermedad
            <br />
            Profesor Cristopher Jegó
          </span>
          <span>
            Universidad de Valparaíso
            <br />
            Campus San Felipe · 2026
          </span>
        </div>
      </header>
      {collection.voices.map((voice, index) => (
        <article
          className={`fanzine-page fanzine-poem fanzine-${voice.id}`}
          key={voice.id}
        >
          <div className="fanzine-running-head">
            <span>POLIFONÍA DEL CUIDADO</span>
            <span>TRES MIRADAS / {voice.number}</span>
          </div>
          <div className="fanzine-poem-heading">
            <h2>{voice.originalHeading}</h2>
            <VoiceArt voice={voice.id} />
          </div>
          <p className="fanzine-byline">Joel Jara</p>
          <div className="poem-body" data-testid={`poem-body-${voice.id}`}>
            {voice.body.split("\n\n").map((stanza, stanzaIndex) => (
              <p key={stanzaIndex}>{stanza}</p>
            ))}
          </div>
          <footer className="fanzine-folio">
            <span>MIENTRAS TODAVÍA ME RECUERDES</span>
            <span>
              Joel Jara <b>{String(index + 2).padStart(2, "0")}</b>
            </span>
          </footer>
        </article>
      ))}
    </div>
  );
}
