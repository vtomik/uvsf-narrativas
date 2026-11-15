import { test, expect, type Page } from "@playwright/test";
import collection from "../src/data/poems.json" with { type: "json" };

async function chooseVoice(page: Page, index: number) {
  await page.getByRole("button", { name: "Entrar a la consulta" }).click();
  for (const voice of collection.voices) {
    await page.getByRole("tab", { name: new RegExp(voice.role) }).click();
  }
  await page.getByRole("button", { name: "Hacer mi elección" }).click();
  await page.getByRole("radio").nth(index).check();
}

test("la pausa entre escenas anuncia el cambio y entrega una pregunta legible", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/#/experiencia");
  const passage = page.locator(".passage-screen");
  await page.getByRole("button", { name: "Entrar a la consulta" }).click();
  await expect(passage).toBeVisible();
  await expect(passage).toHaveAttribute("role", "status");
  await expect(page.locator(".experience-stage")).toHaveAttribute("inert", "");
  await expect(passage).toHaveCount(0);
  for (const voice of collection.voices) {
    await page.getByRole("tab", { name: new RegExp(voice.role) }).click();
  }
  await page.getByRole("button", { name: "Hacer mi elección" }).click();
  await page.getByRole("radio").first().check();
  await page.getByRole("button", { name: "Revelar y reflexionar" }).click();
  await expect(passage).toBeVisible();
  await expect(passage).toHaveCount(0);
  await expect(page.getByRole("heading", { level: 1 })).toBeFocused();
  const question = page.locator(".reflection-question");
  await expect(question.getByRole("heading", { level: 2 })).toHaveText(
    "¿Cómo acompañarías a Elena sin decidir por ella?",
  );
  await question.scrollIntoViewIfNeeded();
  await expect(question).toBeInViewport();
  await expect(question.getByRole("heading", { level: 2 })).toBeVisible();
});

test("cada elección ofrece reflexión, práctica y fundamentos sin esperar con movimiento reducido", async ({
  page,
}) => {
  for (const [index] of collection.voices.entries()) {
    await page.goto("/#/experiencia");
    await chooseVoice(page, index);
    await expect(page.locator(".passage-screen")).toHaveCount(0);
    await page.getByRole("button", { name: "Revelar y reflexionar" }).click();
    await expect(page.locator(".passage-screen")).toHaveCount(0);
    await expect(page.locator(".experience-page")).toHaveAttribute(
      "data-step",
      "3",
    );
    const reading = page.locator(".reflection-reading");
    await expect(reading).toBeVisible();
    expect((await reading.innerText()).length).toBeGreaterThan(350);
    const foundation = page.locator(".reflection-foundation");
    await expect(foundation).toContainText("Pimentel");
    await expect(foundation).toContainText("Ricoeur");
    await expect(page.locator(".reflection-question h2")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toBeFocused();
    await page.reload();
  }
});

test("el campo de partículas tiene profundidad y mantiene una densidad acotada en teléfono", async ({
  page,
  isMobile,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/#/experiencia");
  const motes = page.locator(".memory-mote");
  await expect(motes).toHaveCount(42);
  const visible = await motes.evaluateAll(
    (nodes) =>
      nodes.filter((node) => getComputedStyle(node).display !== "none").length,
  );
  expect(visible).toBeGreaterThan(isMobile ? 9 : 18);
  expect(visible).toBeLessThanOrEqual(isMobile ? 30 : 42);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(motes.first()).toHaveCSS("animation-name", "none");
});

test("las obras citadas explican la lectura y sus referencias se pueden abrir con teclado", async ({
  page,
}) => {
  for (const route of ["/proyecto", "/experiencia"]) {
    await page.goto(`/#${route}`);
    if (route === "/experiencia") {
      await chooseVoice(page, 0);
      await page.getByRole("button", { name: "Revelar y reflexionar" }).click();
    }
    const foundations = page.locator(".author-foundations");
    const pimentel = foundations.getByRole("article").filter({
      has: page.getByRole("heading", {
        name: "Luz Aurora Pimentel",
        exact: true,
      }),
    });
    const ricoeur = foundations.getByRole("article").filter({
      has: page.getByRole("heading", { name: "Paul Ricoeur", exact: true }),
    });
    await expect(pimentel.locator("cite")).toContainText(
      "El relato en perspectiva",
    );
    await expect(pimentel).toContainText("¿quién cuenta?");
    await expect(pimentel).toContainText("focalización");
    await expect(ricoeur.locator("cite")).toContainText(
      "Discurso y excedente de sentido",
    );
    await expect(ricoeur).toContainText("metáfora y el símbolo");
    await expect(ricoeur).toContainText("sostener su interpretación");
    const references = foundations.locator("details");
    await expect(references.getByRole("list")).not.toBeVisible();
    const summary = references.locator("summary");
    await expect(summary).toHaveText("Obras citadas y claves de lectura");
    await summary.focus();
    await page.keyboard.press("Enter");
    await expect(references.getByRole("list")).toBeVisible();
    await expect(references.getByRole("listitem")).toHaveCount(2);
    await expect(references.getByRole("listitem").first()).toContainText(
      "Pimentel",
    );
    await expect(references.getByRole("listitem").last()).toContainText(
      "Ricoeur",
    );
  }
});

test("la carga inicial muestra un estado útil hasta que la app puede responder", async ({
  page,
}) => {
  let releaseScripts!: () => void;
  const scriptsReady = new Promise<void>((resolve) => {
    releaseScripts = resolve;
  });
  await page.route("**/*.js", async (route) => {
    await scriptsReady;
    await route.continue();
  });
  try {
    await page.goto("/#/experiencia", { waitUntil: "commit" });
    const boot = page.locator(".boot-screen");
    await expect(boot).toBeVisible();
    await expect(boot).toHaveAttribute("role", "status");
    await expect(boot).toContainText("Preparando un espacio para escuchar");
    releaseScripts();
    await expect(boot).toHaveCount(0);
    await page.getByRole("button", { name: "Entrar a la consulta" }).click();
    await expect(page.getByRole("tab", { name: /La cuidadora/ })).toBeVisible();
  } finally {
    releaseScripts();
  }
});

test("activar movimiento reducido durante una pausa permite continuar de inmediato", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const start = new Date("2026-11-15T12:00:00Z");
  await page.goto("/#/experiencia");
  await page.clock.install({ time: start });
  await page.clock.pauseAt(new Date(start.getTime() + 1000));
  await page.getByRole("button", { name: "Entrar a la consulta" }).click();
  await expect(page.locator(".passage-screen")).toBeVisible();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".passage-screen")).toHaveCount(0);
  await expect(page.locator(".experience-page")).toHaveAttribute(
    "data-step",
    "1",
  );
  await expect(page.locator(".experience-stage")).not.toHaveAttribute("inert");
  await expect(page.getByRole("tab", { name: /La cuidadora/ })).toBeEnabled();
  await expect(page.getByRole("heading", { level: 1 })).toBeFocused();
});

test("salir durante una pausa cancela el cambio de escena pendiente", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const start = new Date("2026-11-15T12:00:00Z");
  await page.goto("/#/experiencia");
  await page.clock.install({ time: start });
  await page.clock.pauseAt(new Date(start.getTime() + 1000));
  await page.getByRole("button", { name: "Entrar a la consulta" }).click();
  await expect(page.locator(".passage-screen")).toBeVisible();
  await page
    .getByRole("navigation", { name: "Navegación de la app" })
    .getByRole("link", { name: "Poemas", exact: true })
    .click();
  // Advance past the pending scene deadline and the native screen transition.
  await page.clock.runFor(1200);
  await expect(page.locator(".experience-page")).toHaveCount(0);
  await expect(page.locator(".passage-screen")).toHaveCount(0);
  await expect(page).toHaveURL(/#\/poemas$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Mientras todavía",
  );
  await page.clock.resume();
  await page
    .getByRole("navigation", { name: "Navegación de la app" })
    .getByRole("link", { name: "Experiencia", exact: true })
    .click();
  await expect(page.locator(".experience-page")).toHaveAttribute(
    "data-step",
    "0",
  );
  await expect(page.locator(".passage-screen")).toHaveCount(0);
});
