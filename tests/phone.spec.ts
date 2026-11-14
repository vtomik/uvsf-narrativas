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

test("se puede consultar cómo añadir la app al teléfono sin un aviso nativo", async ({
  page,
}) => {
  await page.addInitScript(() => {
    window.addEventListener(
      "beforeinstallprompt",
      (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();
      },
      true,
    );
  });
  await page.goto("/");
  const install = page.getByRole("button", {
    name: "Añadir a pantalla de inicio",
    exact: true,
  });
  await install.click();
  const dialog = page.getByRole("dialog", {
    name: "Añadir a pantalla de inicio",
    exact: true,
  });
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText("HTTPS");
  await dialog.getByRole("button", { name: "Entendido", exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await expect(install).toBeFocused();
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
