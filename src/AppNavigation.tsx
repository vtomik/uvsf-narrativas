import type { CSSProperties } from "react";
import { BookOpen, House, Leaf, Share2, Sparkles } from "lucide-react";
import { UniversityLogo } from "./UniversityLogo";
import "./app-navigation.css";

const destinations = [
  { route: "/", label: "Inicio", Icon: House },
  { route: "/experiencia", label: "Experiencia", Icon: Sparkles },
  { route: "/poemas", label: "Poemas", Icon: BookOpen },
  { route: "/proyecto", label: "Proyecto", Icon: Leaf },
];

export function AppNavigation({ route }: { route: string }) {
  const active = destinations.findIndex((item) => item.route === route);
  return (
    <nav className="app-tabbar" aria-label="Navegación de la app">
      <div
        className="app-tabbar-track"
        style={{ "--tab-index": Math.max(0, active) } as CSSProperties}
      >
        {active >= 0 && (
          <span className="app-tabbar-indicator" aria-hidden="true" />
        )}
        {destinations.map(({ route: path, label, Icon }) => (
          <a
            className={`app-tabbar-item ${route === path ? "is-current" : ""}`}
            href={`#${path}`}
            key={path}
            aria-current={route === path ? "page" : undefined}
          >
            <Icon
              size={21}
              strokeWidth={route === path ? 1.7 : 1.4}
              aria-hidden="true"
            />
            <span>{label}</span>
          </a>
        ))}
      </div>
    </nav>
  );
}

export function AppTopBar({ onShare }: { onShare: () => void }) {
  return (
    <header className="app-topbar">
      <div className="app-topbar-inner">
        <a
          href="#/"
          className="app-topbar-brand"
          aria-label="Universidad de Valparaíso · Polifonía del cuidado, inicio"
        >
          <UniversityLogo />
          <span>
            Polifonía<small>DEL CUIDADO</small>
          </span>
        </a>
        <button
          type="button"
          className="app-topbar-share"
          onClick={onShare}
          aria-label="Compartir"
          title="Compartir la experiencia"
        >
          <Share2 size={19} strokeWidth={1.5} aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}
