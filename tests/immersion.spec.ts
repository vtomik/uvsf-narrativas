import { test, expect } from "@playwright/test";
import collection from "../src/data/poems.json" with { type: "json" };

test("las animaciones comienzan activas y mueven la atmósfera", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/#/experiencia");
  await expect(page.locator(".experience-page")).toHaveAttribute(
    "data-motion",
    "playing",
  );
  const mote = page.locator(".memory-mote").first();
  expect(
    await mote.evaluate((node) => getComputedStyle(node).animationName),
  ).not.toBe("none");
  const initial = await mote.evaluate(
    (node) => getComputedStyle(node).transform,
  );
  await expect
    .poll(() => mote.evaluate((node) => getComputedStyle(node).transform))
    .not.toBe(initial);
  await expect(
    page.getByRole("button", {
      name: /(?:Pausar|Reanudar|Activar) animaciones/,
    }),
  ).toHaveCount(0);
});

test("el movimiento sigue la preferencia del dispositivo sin controles manuales", async ({
  page,
}) => {
  await page.goto("/#/experiencia");
  const frame = page.locator(".experience-page");
  const mote = page.locator(".memory-mote").first();
  await expect(frame).toHaveAttribute("data-motion", "paused");
  await expect(mote).toHaveCSS("animation-name", "none");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(frame).toHaveAttribute("data-motion", "playing");
  expect(
    await mote.evaluate((node) => getComputedStyle(node).animationName),
  ).not.toBe("none");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(frame).toHaveAttribute("data-motion", "paused");
  await expect(mote).toHaveCSS("animation-name", "none");
  await expect(
    page.getByRole("button", {
      name: /(?:Pausar|Reanudar|Activar) (?:animaciones|movimiento)/,
    }),
  ).toHaveCount(0);
});

test("el recorrido no crea audio ni ofrece controles sonoros", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => {
    const OriginalAudioContext = window.AudioContext;
    let created = 0;
    Object.defineProperty(window, "__testAudioCount", { value: () => created });
    window.AudioContext = class extends OriginalAudioContext {
      constructor(options?: AudioContextOptions) {
        super(options);
        created += 1;
      }
    };
  });
  await page.goto("/#/experiencia");
  await expect(
    page.getByRole("button", { name: /ambiente sonoro|música|sonido/i }),
  ).toHaveCount(0);
  await expect(page.locator("audio, video")).toHaveCount(0);
  await page.getByRole("button", { name: "Entrar a la consulta" }).click();
  for (const voice of collection.voices)
    await page.getByRole("tab", { name: new RegExp(voice.role) }).click();
  await page.getByRole("button", { name: "Hacer mi elección" }).click();
  await page.getByRole("radio").first().check();
  await page.getByRole("button", { name: "Revelar y reflexionar" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Cuidar");
  expect(
    await page.evaluate(() =>
      (
        window as unknown as { __testAudioCount: () => number }
      ).__testAudioCount(),
    ),
  ).toBe(0);
  expect(errors).toEqual([]);
});

test("las transiciones entre voces conservan los poemas completos", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/#/experiencia");
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
