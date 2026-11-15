import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import collection from "../src/data/poems.json" with { type: "json" };
import jsQR from "jsqr";
import { PNG } from "pngjs";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { resolve, extname } from "node:path";

const titles = [
  "Cuidar también es dejar elegir.",
  "Quien cuida también necesita cuidado.",
  "Escuchar también forma parte de tratar.",
];

for (const [index, voice] of collection.voices.entries()) {
  test(`recorrido completo al revelar ${voice.role}`, async ({ page }) => {
    const errors: string[] = [];
    const outgoing: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("request", (r) => {
      if (
        !r.url().startsWith("http://127.0.0.1:4173") &&
        !r.url().startsWith("data:")
      )
        outgoing.push(r.url());
    });
    await page.goto("/#/experiencia");
    await expect(
      page.getByRole("main").getByText(collection.context[0], { exact: true }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Entrar a la consulta" }).click();
    await expect(
      page.getByRole("button", { name: "Hacer mi elección" }),
    ).toBeDisabled();
    await page.getByRole("tab", { name: /La cuidadora/ }).click();
    await expect(page.getByRole("tabpanel")).toContainText(
      collection.voices[1].message,
    );
    await expect(
      page.getByRole("button", { name: "Hacer mi elección" }),
    ).toBeDisabled();
    await page.getByRole("tab", { name: /El médico/ }).click();
    await expect(page.getByRole("tabpanel")).toContainText(
      collection.voices[2].message,
    );
    if (index === 0) {
      const result = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      expect(result.violations).toEqual([]);
    }
    await page.getByRole("button", { name: "Leer el poema completo" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(
      page.getByRole("dialog").getByRole("heading", { level: 2 }),
    ).toHaveText(collection.voices[2].title);
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await page.getByRole("button", { name: "Hacer mi elección" }).click();
    await expect(
      page.getByRole("button", { name: "Revelar y reflexionar" }),
    ).toBeDisabled();
    await page.getByRole("radio").nth(index).check();
    if (index === 0) {
      const result = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      expect(result.violations).toEqual([]);
    }
    await page.getByRole("button", { name: "Revelar y reflexionar" }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      titles[index],
    );
    const prompt = page.getByRole("button", {
      name: "¿Qué voz te resultó más difícil escuchar?",
    });
    await prompt.click();
    await expect(prompt).toHaveAttribute("aria-expanded", "true");
    await expect(
      page.getByText(/Piensa qué emoción o necesidad/),
    ).toBeVisible();
    const accessibility = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(accessibility.violations).toEqual([]);
    await page.getByRole("button", { name: "Volver a recorrer" }).click();
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Un diagnóstico.",
    );
    await page.reload();
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Un diagnóstico.",
    );
    expect(
      await page.evaluate(() => ({
        local: localStorage.length,
        session: sessionStorage.length,
        cookies: document.cookie,
      })),
    ).toEqual({ local: 0, session: 0, cookies: "" });
    expect(errors).toEqual([]);
    expect(outgoing).toEqual([]);
  });
}

test("lector: versos íntegros, tamaño de texto, navegación y foco", async ({
  page,
}) => {
  await page.goto("/#/poemas");
  const opener = page.getByRole("button", { name: "Leer su poema" }).first();
  await opener.click();
  const dialog = page.getByRole("dialog");
  for (const [i, voice] of collection.voices.entries()) {
    await expect(dialog.getByRole("heading", { level: 2 })).toHaveText(
      voice.title,
    );
    const stanzas = await dialog
      .getByTestId(`poem-body-${voice.id}`)
      .locator("p")
      .allTextContents();
    expect(stanzas.join("\n\n")).toBe(voice.body);
    if (i < 2)
      await dialog.getByRole("button", { name: "Siguiente voz" }).click();
  }
  await dialog
    .getByRole("button", { name: "Aumentar tamaño del texto" })
    .click();
  await expect(
    dialog.getByRole("button", { name: "Aumentar tamaño del texto" }),
  ).toHaveAttribute("aria-pressed", "true");
  const accessibility = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(accessibility.violations).toEqual([]);
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(opener).toBeFocused();
  await page.getByRole("button", { name: "Lectura continua" }).click();
  await expect(page.locator(".continuous-poem")).toHaveCount(3);
  for (const voice of collection.voices) {
    expect(
      (
        await page
          .locator(".continuous-poem")
          .getByTestId(`poem-body-${voice.id}`)
          .locator("p")
          .allTextContents()
      ).join("\n\n"),
    ).toBe(voice.body);
  }
  await expect(page.locator("main a[download]")).toHaveCount(2);
  await expect(
    page.getByRole("link", { name: "Descargar fanzine PDF", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Imprimir fanzine", exact: true }),
  ).toHaveCount(0);
});

test("el fanzine se descarga como PDF listo para conservar e imprimir", async ({
  page,
  request,
}) => {
  await page.goto("/#/poemas");
  for (const variant of [
    {
      label: "Descargar fanzine PDF",
      filename: "polifonia-del-cuidado-fanzine.pdf",
    },
    {
      label: "Imprimir y doblar en A4",
      filename: "polifonia-del-cuidado-fanzine-a4.pdf",
    },
  ]) {
    const link = page.getByRole("link", {
      name: variant.label,
      exact: true,
    });
    const href = await link.evaluate((node: HTMLAnchorElement) => node.href);
    const response = await request.get(href);
    expect(response.ok()).toBe(true);
    expect(response.headers()["content-type"]).toContain("application/pdf");
    expect((await response.body()).subarray(0, 5).toString()).toBe("%PDF-");
    const downloadPromise = page.waitForEvent("download");
    await link.click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe(variant.filename);
    expect(await download.failure()).toBeNull();
  }
});

test("QR con enlace público, validación y descarga", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Compartir", exact: true }).click();
  const dialog = page.getByRole("dialog");
  const field = dialog.getByLabel("Dirección de la web publicada");
  await field.fill("no-es-url");
  await expect(dialog.getByRole("alert")).toContainText(
    "Escribe una dirección web válida",
  );
  await expect(
    dialog.getByRole("button", { name: "Copiar enlace" }),
  ).toBeDisabled();
  await expect(dialog.getByRole("link", { name: "Descargar QR" })).toHaveCount(
    0,
  );
  await field.fill("https://ejemplo.cl/polifonia/#/experiencia");
  const downloadLink = dialog.getByRole("link", { name: "Descargar QR" });
  await expect(downloadLink).toBeVisible();
  await expect(downloadLink).toHaveAttribute(
    "href",
    /^data:image\/png;base64,/,
  );
  const dataUrl = (await downloadLink.getAttribute("href"))!;
  const png = PNG.sync.read(Buffer.from(dataUrl.split(",")[1], "base64"));
  const decoded = jsQR(new Uint8ClampedArray(png.data), png.width, png.height);
  expect(decoded?.data).toBe("https://ejemplo.cl/polifonia/#/experiencia");
  const downloadPromise = page.waitForEvent("download");
  await downloadLink.click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("polifonia-del-cuidado-QR.png");
  expect(await download.failure()).toBeNull();
  await field.fill("javascript:alert(1)");
  await expect(dialog.getByRole("alert")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
});

test("páginas accesibles, sin desbordamientos y con recursos locales", async ({
  page,
  request,
  isMobile,
}) => {
  for (const route of ["/", "/poemas", "/proyecto", "/experiencia"]) {
    await page.goto(`/#${route}`);
    await page.evaluate(() => document.fonts.ready);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  }
  if (isMobile) {
    await page
      .getByRole("navigation", { name: "Navegación de la app" })
      .getByRole("link", { name: "Poemas", exact: true })
      .click();
    await expect(page).toHaveURL(/#\/poemas$/);
    await expect(
      page
        .getByRole("navigation", { name: "Navegación de la app" })
        .getByRole("link", { name: "Poemas", exact: true }),
    ).toHaveAttribute("aria-current", "page");
  }
  for (const path of [
    "/materiales/seminario.pdf",
    "/materiales/poemas-originales.docx",
    "/materiales/fanzine.pdf",
    "/favicon.svg",
  ]) {
    expect((await request.get(path)).ok()).toBe(true);
  }
  await page.goto("/#/ruta-inexistente");
  await page.getByRole("link", { name: "Ir al inicio" }).click();
  await expect(page).toHaveURL(/#\/$/);
});

test("el paquete estático funciona al publicarse en una subcarpeta", async ({
  page,
}) => {
  const types: Record<string, string> = {
    ".html": "text/html",
    ".js": "text/javascript",
    ".css": "text/css",
    ".svg": "image/svg+xml",
    ".woff2": "font/woff2",
    ".woff": "font/woff",
    ".pdf": "application/pdf",
    ".png": "image/png",
  };
  const root = resolve("dist");
  const server = createServer(async (req, res) => {
    const url = new URL(req.url!, "http://localhost");
    if (!url.pathname.startsWith("/muestra/")) {
      res.writeHead(404);
      res.end();
      return;
    }
    const path = resolve(
      root,
      url.pathname.slice("/muestra/".length) || "index.html",
    );
    if (!path.startsWith(root + "/")) {
      res.writeHead(403);
      res.end();
      return;
    }
    try {
      const data = await readFile(path);
      res.setHeader(
        "Content-Type",
        types[extname(path)] || "application/octet-stream",
      );
      res.end(data);
    } catch {
      res.writeHead(404);
      res.end();
    }
  });
  await new Promise<void>((done) => server.listen(0, "127.0.0.1", done));
  const address = server.address();
  if (!address || typeof address === "string")
    throw new Error("No se pudo iniciar el servidor de prueba");
  const failures: string[] = [];
  page.on("response", (response) => {
    if (response.status() >= 400) failures.push(response.url());
  });
  try {
    const logoResponse = page.waitForResponse((response) =>
      response.url().endsWith("/muestra/logo-uv-medicina.png"),
    );
    await page.goto(`http://127.0.0.1:${address.port}/muestra/#/poemas`);
    expect((await logoResponse).ok()).toBe(true);
    await expect(
      page.getByRole("img", {
        name: "Universidad de Valparaíso · Escuela de Medicina",
      }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Mientras todavía",
    );
    const fanzine = page.getByRole("link", {
      name: "Descargar fanzine PDF",
      exact: true,
    });
    const fanzineHref = await fanzine.evaluate(
      (node: HTMLAnchorElement) => node.href,
    );
    expect(new URL(fanzineHref).pathname).toBe(
      "/muestra/materiales/fanzine.pdf",
    );
    const pdf = await page.request.get(fanzineHref);
    expect(pdf.ok()).toBe(true);
    expect(pdf.headers()["content-type"]).toContain("application/pdf");
    expect((await pdf.body()).subarray(0, 5).toString()).toBe("%PDF-");
    const bookletHref = await page
      .getByRole("link", { name: "Imprimir y doblar en A4", exact: true })
      .evaluate((node: HTMLAnchorElement) => node.href);
    expect(new URL(bookletHref).pathname).toBe(
      "/muestra/materiales/fanzine-imprimir-a4.pdf",
    );
    const booklet = await page.request.get(bookletHref);
    expect(booklet.ok()).toBe(true);
    expect((await booklet.body()).subarray(0, 5).toString()).toBe("%PDF-");
    await page.reload();
    await page.getByRole("button", { name: "Leer su poema" }).first().click();
    await expect(page.getByRole("dialog")).toBeVisible();
    expect(failures).toEqual([]);
  } finally {
    await new Promise<void>((done, reject) =>
      server.close((error) => (error ? reject(error) : done())),
    );
  }
});

test("versiones pequeñas y medianas conservan las tres opciones", async ({
  page,
}) => {
  for (const width of [320, 375, 768, 1024]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/#/experiencia");
    await page.reload();
    await page.getByRole("button", { name: "Entrar a la consulta" }).click();
    await page.getByRole("tab", { name: /La cuidadora/ }).click();
    await page.getByRole("tab", { name: /El médico/ }).click();
    await page.getByRole("button", { name: "Hacer mi elección" }).click();
    await expect(page.getByRole("radio")).toHaveCount(3);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
});

test("el fanzine impreso tiene portada con autor y los tres poemas completos", async ({
  page,
}) => {
  await page.goto("/#/poemas");
  await page.emulateMedia({ media: "print" });
  await expect(page.locator(".app-shell")).not.toBeVisible();
  await expect(page.locator(".print-fanzine")).toBeVisible();
  const pages = page.locator(".print-fanzine .fanzine-page");
  await expect(pages).toHaveCount(4);
  await expect(pages.first()).toContainText("Joel Jara");
  for (const voice of collection.voices) {
    expect(
      (
        await page
          .locator(".print-fanzine")
          .getByTestId(`poem-body-${voice.id}`)
          .locator("p")
          .allTextContents()
      ).join("\n\n"),
    ).toBe(voice.body);
    await expect(
      page.locator(".print-fanzine").getByRole("heading", {
        name: voice.originalHeading,
        includeHidden: true,
      }),
    ).toBeVisible();
  }
});
