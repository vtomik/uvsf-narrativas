import { test, expect } from "@playwright/test";

test("en PC la aplicación aprovecha el espacio con navegación lateral", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  const shell = await page.locator(".mobile-app").boundingBox();
  const navigation = page.getByRole("navigation", {
    name: "Navegación de la app",
  });
  const rail = await navigation.boundingBox();
  const content = await page.locator("main").boundingBox();
  expect(shell!.width).toBeGreaterThan(1000);
  expect(rail!.height).toBeGreaterThan(rail!.width);
  expect(rail!.x + rail!.width).toBeLessThanOrEqual(content!.x + 1);
  await expect(navigation.getByRole("link")).toHaveCount(4);
  for (const name of ["Poemas", "Proyecto", "Experiencia", "Inicio"]) {
    await navigation.getByRole("link", { name, exact: true }).click();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
});

test("en teléfonos las acciones, las voces y el lector siguen accesibles", async ({
  page,
}) => {
  for (const width of [320, 390, 430]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/#/");
    const navigation = page.getByRole("navigation", {
      name: "Navegación de la app",
    });
    await expect(navigation).toBeVisible();
    const navBounds = await navigation.boundingBox();
    expect(navBounds!.width).toBeLessThanOrEqual(width);
    expect(navBounds!.y + navBounds!.height).toBeLessThanOrEqual(845);
    const start = page.getByRole("link", {
      name: "Entrar en la experiencia",
      exact: true,
    });
    await start.scrollIntoViewIfNeeded();
    const startBounds = await start.boundingBox();
    expect(startBounds!.y + startBounds!.height).toBeLessThanOrEqual(
      navBounds!.y,
    );
    await start.click();
    await page.getByRole("button", { name: "Entrar a la consulta" }).click();
    await page.getByRole("tab", { name: /La cuidadora/ }).click();
    await page.getByRole("button", { name: "Leer el poema completo" }).click();
    const reader = page.getByRole("dialog");
    await expect(reader).toBeVisible();
    const readerBounds = await reader.boundingBox();
    expect(readerBounds!.width).toBeLessThanOrEqual(width);
    await reader.getByRole("button", { name: "Cerrar ventana" }).click();
    await expect(reader).toHaveCount(0);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
});

test("deslizar las voces cambia de perspectiva sin capturar el desplazamiento vertical", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/#/experiencia");
  await page.getByRole("button", { name: "Entrar a la consulta" }).click();
  const panel = page.getByRole("tabpanel");
  const gesture = async (
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
  ) => {
    await panel.dispatchEvent("pointerdown", {
      pointerType: "touch",
      clientX: fromX,
      clientY: fromY,
      pointerId: 1,
      isPrimary: true,
    });
    await panel.dispatchEvent("pointerup", {
      pointerType: "touch",
      clientX: toX,
      clientY: toY,
      pointerId: 1,
      isPrimary: true,
    });
  };
  await gesture(300, 400, 100, 410);
  await expect(page.getByRole("tab", { name: /La cuidadora/ })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await gesture(120, 410, 290, 400);
  await expect(page.getByRole("tab", { name: /La paciente/ })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await gesture(200, 400, 180, 600);
  await expect(page.getByRole("tab", { name: /La paciente/ })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(page.locator(".experience-page")).toHaveAttribute(
    "data-tone",
    "paciente",
  );
});
