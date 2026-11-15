import "./university.css";

/** Original UV lockup extracted from the seminar material, with its clear space. */
export function UniversityLogo({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`university-logo ${className}`}
      viewBox="132 20 250 145"
      width="250"
      height="145"
      role="img"
      aria-label="Universidad de Valparaíso · Escuela de Medicina"
    >
      <image
        href={`${import.meta.env.BASE_URL}logo-uv-medicina.png`}
        x="0"
        y="0"
        width="512"
        height="184"
      />
    </svg>
  );
}
