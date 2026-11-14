import { test, expect } from "@playwright/test";
import collection from "../src/data/poems.json" with { type: "json" };

test("la experiencia ofrece movimiento cuando el sistema lo permite", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/#/experiencia");
  const pause = page.getByRole("button", {
    name: "Pausar animaciones",
    exact: true,
  });
  await expect(pause).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".experience-page")).toHaveAttribute(
    "data-motion",
    "playing",
  );
  await pause.click();
  await expect(
    page.getByRole("button", { name: "Reanudar animaciones", exact: true }),
  ).toHaveAttribute("aria-pressed", "false");
  await expect(page.locator(".experience-page")).toHaveAttribute(
    "data-motion",
    "paused",
  );
});

test("el movimiento respeta la preferencia del sistema y se puede controlar", async ({
  page,
}) => {
  await page.goto("/#/experiencia");
  const resume = page.getByRole("button", {
    name: "Reanudar animaciones",
    exact: true,
  });
  await expect(resume).toBeVisible();
  await expect(resume).toHaveAttribute("aria-pressed", "false");
  await expect(page.locator(".experience-page")).toHaveAttribute(
    "data-motion",
    "paused",
  );
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await resume.click();
  const pause = page.getByRole("button", {
    name: "Pausar animaciones",
    exact: true,
  });
  await expect(pause).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".experience-page")).toHaveAttribute(
    "data-motion",
    "playing",
  );
  await pause.click();
  await expect(resume).toHaveAttribute("aria-pressed", "false");
  await page.reload();
  await expect(resume).toHaveAttribute("aria-pressed", "false");
  expect(
    await page.evaluate(() => ({
      local: localStorage.length,
      session: sessionStorage.length,
    })),
  ).toEqual({ local: 0, session: 0 });
});

test("el ambiente sonoro requiere un clic y se puede apagar", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => {
    const OriginalAudioContext = window.AudioContext;
    const contexts: AudioContext[] = [];
    Object.defineProperty(window, "__testAudioStates", {
      value: () => contexts.map((context) => context.state),
    });
    window.AudioContext = class extends OriginalAudioContext {
      constructor(options?: AudioContextOptions) {
        super(options);
        contexts.push(this);
      }
    };
  });
  const states = () =>
    page.evaluate(() =>
      (
        window as unknown as { __testAudioStates: () => string[] }
      ).__testAudioStates(),
    );
  await page.goto("/#/experiencia");
  const activate = page.getByRole("button", {
    name: "Activar ambiente sonoro",
    exact: true,
  });
  await expect(activate).toHaveAttribute("aria-pressed", "false");
  expect(await states()).toEqual([]);
  await activate.click();
  const deactivate = page.getByRole("button", {
    name: "Desactivar ambiente sonoro",
    exact: true,
  });
  await expect(deactivate).toHaveAttribute("aria-pressed", "true");
  await expect
    .poll(async () => (await states()).includes("running"))
    .toBe(true);
  await deactivate.click();
  await expect(activate).toHaveAttribute("aria-pressed", "false");
  await expect
    .poll(async () => (await states()).every((state) => state !== "running"))
    .toBe(true);
  await page.reload();
  await expect(activate).toHaveAttribute("aria-pressed", "false");
  expect(await states()).toEqual([]);
  expect(errors).toEqual([]);
});

test("las transiciones entre voces conservan los poemas completos", async ({
  page,
}) => {
  await page.goto("/#/experiencia");
  await page
    .getByRole("button", { name: "Reanudar animaciones", exact: true })
    .click();
  await page.getByRole("button", { name: "Entrar a la consulta" }).click();
  for (const voice of collection.voices) {
    await page.getByRole("tab", { name: new RegExp(voice.role) }).click();
    await expect(page.locator(".experience-page")).toHaveAttribute(
      "data-tone",
      voice.id,
    );
    await expect(page.getByRole("tabpanel")).toContainText(voice.message);
    await page.getByRole("button", { name: "Leer el poema completo" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByRole("heading", { level: 2 })).toHaveText(
      voice.title,
    );
    expect(
      (
        await dialog
          .getByTestId(`poem-body-${voice.id}`)
          .locator("p")
          .allTextContents()
      ).join("\n\n"),
    ).toBe(voice.body);
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
  }
  await expect(
    page.getByRole("button", { name: "Hacer mi elección" }),
  ).toBeEnabled();
});
