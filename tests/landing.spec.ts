import { test, expect, type Page } from "@playwright/test";

const enter = { name: "Entrar en la experiencia", exact: true };

async function freezeTime(page: Page) {
  const start = new Date("2026-11-15T12:00:00Z");
  await page.clock.install({ time: start });
  await page.clock.pauseAt(new Date(start.getTime() + 1000));
}

test("el umbral conduce a la consulta sin sonido ni guardar la visita", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => {
    const OriginalAudioContext = window.AudioContext;
    let created = 0;
    Object.defineProperty(window, "__landingAudioCount", {
      get: () => created,
    });
    window.AudioContext = class extends OriginalAudioContext {
      constructor(options?: AudioContextOptions) {
        super(options);
        created += 1;
      }
    };
  });
  await page.goto("/");
  const home = page.locator(".threshold-home");
  await expect(home).toHaveAttribute("data-entering", "false");
  const start = page.getByRole("link", enter);
  await start.scrollIntoViewIfNeeded();
  await freezeTime(page);
  await start.click();
  await expect(home).toHaveAttribute("data-entering", "true");
  await expect(start).toHaveAttribute("aria-disabled", "true");
  await expect(home.getByRole("status")).toContainText(
    "Entrando en la consulta",
  );
  expect(new URL(page.url()).hash).not.toBe("#/experiencia");
  await page.clock.runFor(1200);
  await expect(page).toHaveURL(/#\/experiencia$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Un diagnóstico.",
  );
  await expect(page.getByRole("heading", { level: 1 })).toBeFocused();
  await expect(page.locator("audio, video")).toHaveCount(0);
  expect(
    await page.evaluate(() => ({
      audio: (window as unknown as { __landingAudioCount: number })
        .__landingAudioCount,
      local: localStorage.length,
      session: sessionStorage.length,
      cookies: document.cookie,
    })),
  ).toEqual({ audio: 0, local: 0, session: 0, cookies: "" });
  expect(errors).toEqual([]);
});

test("el regreso desde el crédito académico permite entrar sin demora con movimiento reducido", async ({
  page,
}) => {
  await page.goto("/#/proyecto");
  const context = page.locator(".academic-context");
  await expect(
    context.getByRole("heading", { name: "Narrativas de la Enfermedad" }),
  ).toBeVisible();
  await expect(context).toContainText("Profesor: Cristopher Jegó");
  await page
    .getByRole("link", {
      name: "Universidad de Valparaíso · Polifonía del cuidado, inicio",
      exact: true,
    })
    .click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Lo que no cabe",
  );
  await expect(page.locator(".threshold-home")).toHaveAttribute(
    "data-motion",
    "reduced",
  );
  await freezeTime(page);
  await page.getByRole("link", enter).click();
  await expect(page.locator(".threshold-home")).toHaveCount(0);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Un diagnóstico.",
  );
});

test("elegir otra pantalla durante la entrada cancela el recorrido pendiente", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await page.getByRole("link", enter).scrollIntoViewIfNeeded();
  await freezeTime(page);
  await page.getByRole("link", enter).click();
  await expect(page.locator(".threshold-home")).toHaveAttribute(
    "data-entering",
    "true",
  );
  const navigation = page.getByRole("navigation", {
    name: "Navegación de la app",
  });
  await navigation.getByRole("link", { name: "Poemas", exact: true }).click();
  await page.clock.runFor(1500);
  await expect(page).toHaveURL(/#\/poemas$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Mientras todavía",
  );
  await expect(page.locator(".threshold-home")).toHaveCount(0);
  await page.clock.resume();
  await navigation.getByRole("link", { name: "Inicio", exact: true }).click();
  await expect(page.locator(".threshold-home")).toHaveAttribute(
    "data-entering",
    "false",
  );
});

test("reducir el movimiento durante la entrada abre la consulta sin esperar el temporizador", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await page.getByRole("link", enter).scrollIntoViewIfNeeded();
  await freezeTime(page);
  await page.getByRole("link", enter).click();
  await expect(page.locator(".threshold-home")).toHaveAttribute(
    "data-entering",
    "true",
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page).toHaveURL(/#\/experiencia$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Un diagnóstico.",
  );
});
