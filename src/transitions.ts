import { flushSync } from "react-dom";

let active: ViewTransition | undefined;

/** Short native screen transitions; every action still works without this API. */
export function changeScreen(
  update: () => void,
  direction: "forward" | "back" = "forward",
) {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) {
    update();
    return;
  }
  if (!document.startViewTransition) {
    flushSync(update);
    document
      .getElementById("main")
      ?.animate?.(
        [{ transform: "translateY(8px)" }, { transform: "translateY(0)" }],
        { duration: 260, easing: "cubic-bezier(.16,.8,.24,1)" },
      );
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
