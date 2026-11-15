import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { createPortal } from "react-dom";
import "./touch-feedback.css";

type Ripple = {
  id: number;
  x: number;
  y: number;
  host: Element;
  light: boolean;
};

const actionSelector =
  "button, a[href], [role='button'], .choice-card, input[type='radio']";

/** Local touch feedback; never changes an action, focus, or navigation. */
export function TouchFeedback() {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const nextId = useRef(0);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const timers = new Set<ReturnType<typeof setTimeout>>();
    const pressed = new Map<HTMLElement, ReturnType<typeof setTimeout>>();
    const lastPointer = new WeakMap<HTMLElement, number>();
    let mounted = true;

    const schedule = (callback: () => void, delay: number) => {
      const timer = setTimeout(() => {
        timers.delete(timer);
        if (mounted) callback();
      }, delay);
      timers.add(timer);
      return timer;
    };

    const actionFrom = (target: EventTarget | null) => {
      if (!(target instanceof Element)) return null;
      const element = target.closest(actionSelector);
      if (!(element instanceof HTMLElement)) return null;
      const action = element.closest<HTMLElement>(".choice-card") ?? element;
      if (
        element.matches(":disabled, [aria-disabled='true']") ||
        action.matches("[aria-disabled='true']") ||
        action.querySelector("input:disabled") ||
        preference.matches ||
        action.closest(".experience-page[data-motion='paused']")
      )
        return null;
      return action;
    };

    const respond = (action: HTMLElement, x: number, y: number) => {
      const id = nextId.current++;
      const host =
        action.closest("dialog[open]") ??
        document.fullscreenElement ??
        document.body;
      setRipples((current) => [
        ...current.slice(-5),
        {
          id,
          x,
          y,
          host,
          light: !!action.closest(".is-experience, .button.primary"),
        },
      ]);
      schedule(() => {
        setRipples((current) => current.filter((ripple) => ripple.id !== id));
      }, 420);

      const previous = pressed.get(action);
      if (previous) {
        clearTimeout(previous);
        timers.delete(previous);
      }
      action.classList.add("tap-responding");
      pressed.set(
        action,
        schedule(() => {
          action.classList.remove("tap-responding");
          pressed.delete(action);
        }, 190),
      );
    };

    const onPointer = (event: PointerEvent) => {
      if (!event.isPrimary || event.button !== 0) return;
      const action = actionFrom(event.target);
      if (!action) return;
      lastPointer.set(action, performance.now());
      respond(action, event.clientX, event.clientY);
    };

    const onClick = (event: MouseEvent) => {
      const action = actionFrom(event.target);
      if (!action) return;
      // Pointer interaction already responded immediately on contact.
      if (
        event.detail > 0 &&
        performance.now() - (lastPointer.get(action) ?? -Infinity) < 900
      )
        return;
      const bounds = action.getBoundingClientRect();
      respond(
        action,
        bounds.left + bounds.width / 2,
        bounds.top + bounds.height / 2,
      );
    };

    const reset = () => {
      for (const timer of timers) clearTimeout(timer);
      timers.clear();
      for (const action of pressed.keys())
        action.classList.remove("tap-responding");
      pressed.clear();
      if (mounted) setRipples([]);
    };
    const onVisibility = () => {
      if (document.hidden) reset();
    };

    document.addEventListener("pointerdown", onPointer, {
      capture: true,
      passive: true,
    });
    document.addEventListener("click", onClick, true);
    document.addEventListener("visibilitychange", onVisibility);
    preference.addEventListener("change", reset);
    return () => {
      mounted = false;
      reset();
      document.removeEventListener("pointerdown", onPointer, true);
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("visibilitychange", onVisibility);
      preference.removeEventListener("change", reset);
    };
  }, []);

  return (
    <>
      {ripples.map((ripple) =>
        createPortal(
          <div
            className={`tap-feedback${ripple.light ? " tap-feedback-light" : ""}`}
            aria-hidden="true"
          >
            <span
              className="tap-ripple"
              style={
                {
                  "--tap-x": `${ripple.x}px`,
                  "--tap-y": `${ripple.y}px`,
                } as CSSProperties
              }
            />
          </div>,
          ripple.host,
          ripple.id,
        ),
      )}
    </>
  );
}
