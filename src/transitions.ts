import { flushSync } from "react-dom";

let active: ViewTransition | undefined;

/** Short native screen transitions; every action still works without this API. */
export function changeScreen(
  update: () => void,
  direction: "forward" | "back" = "forward",
) {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const paused = !!document.querySelector(
    '.experience-page[data-motion="paused"]',
  );
  if (!document.startViewTransition || reduced || paused) {
    update();
    return;
  }
  active?.skipTransition();
  document.documentElement.dataset.screenDirection = direction;
  const transition = document.startViewTransition(() => flushSync(update));
  active = transition;
  void transition.finished
    .catch(() => {})
    .finally(() => {
      if (active === transition) {
        active = undefined;
        delete document.documentElement.dataset.screenDirection;
      }
    });
}
