import { test, expect } from "@playwright/test";

test("la navegación inferior conecta las cuatro pantallas de la app", async ({
  page,
}) => {
  await page.goto("/");
  const navigation = page.getByRole("navigation", {
    name: "Navegación de la app",
  });
  await expect(navigation).toBeVisible();
  await expect(navigation.getByRole("link")).toHaveCount(4);
  const destinations = [
    { label: "Experiencia", route: "/experiencia", title: /Un diagnóstico/ },
    { label: "Poemas", route: "/poemas", title: /Mientras todavía/ },
    { label: "Proyecto", route: "/proyecto", title: /El cuidado tiene/ },
    { label: "Inicio", route: "/", title: /Lo que no cabe/ },
  ];
  for (const destination of destinations) {
    const link = navigation.getByRole("link", {
      name: destination.label,
      exact: true,
    });
    await link.click();
    await expect(page).toHaveURL(new RegExp(`#${destination.route}$`));
    await expect(link).toHaveAttribute("aria-current", "page");
    await expect(navigation.locator('[aria-current="page"]')).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      destination.title,
    );
  }
  await page
    .getByRole("link", { name: "Entrar en la experiencia", exact: true })
    .click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Un diagnóstico.",
  );
  await expect(
    navigation.getByRole("link", { name: "Experiencia", exact: true }),
  ).toHaveAttribute("aria-current", "page");
});

test("los controles de teléfono siguen accesibles sobre la barra inferior", async ({
  page,
}) => {
  for (const width of [320, 390, 430]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/#/");
    const navigation = page.getByRole("navigation", {
      name: "Navegación de la app",
    });
    for (const link of await navigation.getByRole("link").all()) {
      const bounds = await link.boundingBox();
      expect(bounds).not.toBeNull();
      expect(bounds!.height).toBeGreaterThanOrEqual(44);
      expect(bounds!.width).toBeGreaterThanOrEqual(44);
    }
    const start = page.getByRole("link", {
      name: "Entrar en la experiencia",
      exact: true,
    });
    await start.scrollIntoViewIfNeeded();
    const startBounds = await start.boundingBox();
    const navigationBounds = await navigation.boundingBox();
    expect(startBounds).not.toBeNull();
    expect(navigationBounds).not.toBeNull();
    expect(startBounds!.y + startBounds!.height).toBeLessThanOrEqual(
      navigationBounds!.y,
    );
    await start.click();
    const next = page.getByRole("button", {
      name: "Entrar a la consulta",
      exact: true,
    });
    await next.scrollIntoViewIfNeeded();
    const nextBounds = await next.boundingBox();
    const barBounds = await navigation.boundingBox();
    expect(nextBounds!.y + nextBounds!.height).toBeLessThanOrEqual(
      barBounds!.y,
    );
    await next.click();
    await expect(page.getByRole("tabpanel")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
});

test("las cuatro pantallas conservan la navegación y solo ofrecen el fanzine en la colección", async ({
  page,
}) => {
  await page.goto("/");
  const navigation = page.getByRole("navigation", {
    name: "Navegación de la app",
  });
  for (const label of ["Inicio", "Poemas", "Proyecto", "Experiencia"]) {
    const destination = navigation.getByRole("link", {
      name: label,
      exact: true,
    });
    await destination.click();
    await expect(destination).toHaveAttribute("aria-current", "page");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(
      page.getByRole("button", {
        name: /(?:añadir|agregar) a (?:la )?pantalla de inicio|instalar aplicación/i,
      }),
    ).toHaveCount(0);
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(
      page.getByRole("button", { name: /imprimir fanzine/i }),
    ).toHaveCount(0);
    const documentLinks = await page
      .getByRole("link")
      .evaluateAll((links) =>
        links
          .map((link) => link.getAttribute("href") || "")
          .filter((href) =>
            /\/materiales\/(?:seminario\.pdf|poemas-originales\.docx)(?:[?#]|$)/.test(
              href,
            ),
          ),
      );
    expect(documentLinks).toEqual([]);
    await expect(page.locator("main a[download]")).toHaveCount(
      label === "Poemas" ? 2 : 0,
    );
    if (label === "Poemas") {
      await expect(
        page.getByRole("link", {
          name: "Descargar fanzine PDF",
          exact: true,
        }),
      ).toBeVisible();
      await expect(
        page.getByRole("link", {
          name: "Imprimir y doblar en A4",
          exact: true,
        }),
      ).toBeVisible();
    }
  }
});

test("el manifiesto usa rutas relativas para instalar desde una subcarpeta", async ({
  page,
  request,
}) => {
  await page.goto("/");
  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute(
    "href",
    "./manifest.webmanifest",
  );
  const response = await request.get("/manifest.webmanifest");
  expect(response.ok()).toBe(true);
  const manifest = await response.json();
  expect(manifest.name).toBe("Polifonía del cuidado");
  expect(manifest.display).toBe("standalone");
  expect(manifest.start_url).toBe("./");
  expect(manifest.scope).toBe("./");
  expect(manifest.icons.map((icon: { sizes: string }) => icon.sizes)).toEqual(
    expect.arrayContaining(["192x192", "512x512"]),
  );
  for (const icon of manifest.icons) {
    expect(icon.src.startsWith("./")).toBe(true);
    expect((await request.get(icon.src)).ok()).toBe(true);
  }
});
