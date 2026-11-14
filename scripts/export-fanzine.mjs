import { chromium } from "playwright";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { preview } from "vite";

const systemChromium =
  process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ||
  (existsSync("/usr/bin/chromium") ? "/usr/bin/chromium" : undefined);
const server = await preview({
  preview: { host: "127.0.0.1", port: 4174, strictPort: true },
});
let browser;
try {
  browser = await chromium.launch({ executablePath: systemChromium });
  const page = await browser.newPage({ reducedMotion: "reduce" });
  await page.goto("http://127.0.0.1:4174/#/poemas");
  await page.evaluate(() => document.fonts.ready);
  await page.emulateMedia({ media: "print" });
  const path = resolve("public/materiales/fanzine.pdf");
  await page.pdf({
    path,
    format: "A4",
    preferCSSPageSize: true,
    printBackground: false,
  });
  console.log(`Fanzine generado: ${path}`);
} finally {
  await browser?.close();
  await new Promise((done, reject) =>
    server.httpServer.close((error) => (error ? reject(error) : done())),
  );
}
