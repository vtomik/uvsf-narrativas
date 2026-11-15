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
  const failures = [];
  page.on("requestfailed", (request) => failures.push(request.url()));
  await page.goto("http://127.0.0.1:4174/#/poemas");
  await page.emulateMedia({ media: "print" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForLoadState("networkidle");
  const layout = await page.evaluate(() => {
    document.title = "Mientras todavía me recuerdes · Poemas de Joel Jara";
    const pages = [...document.querySelectorAll(".fanzine-page")];
    return {
      count: pages.length,
      overflow: pages.flatMap((sheet, index) => {
        const pageRect = sheet.getBoundingClientRect();
        const footer = sheet.querySelector(".fanzine-folio");
        const lastStanza = sheet.querySelector(".poem-body p:last-child");
        const invalid =
          sheet.scrollHeight > sheet.clientHeight + 1 ||
          (lastStanza &&
            footer &&
            lastStanza.getBoundingClientRect().bottom >
              footer.getBoundingClientRect().top - 8);
        return invalid
          ? [
              {
                page: index + 1,
                height: pageRect.height,
                scrollHeight: sheet.scrollHeight,
              },
            ]
          : [];
      }),
    };
  });
  if (layout.count !== 4 || layout.overflow.length || failures.length) {
    throw new Error(
      `El fanzine no está listo para imprimir: ${JSON.stringify({ layout, failures })}`,
    );
  }
  const options = {
    preferCSSPageSize: true,
    printBackground: true,
    tagged: true,
    displayHeaderFooter: false,
  };
  const readingPath = resolve("public/materiales/fanzine.pdf");
  await page.pdf({ ...options, path: readingPath });

  // Two A4 faces in booklet order: outside 4|1, inside 2|3. Fold once.
  await page.evaluate(() => {
    const root = document.querySelector(".print-fanzine");
    const pages = [...root.querySelectorAll(".fanzine-page")];
    for (const indices of [
      [3, 0],
      [1, 2],
    ]) {
      const sheet = document.createElement("div");
      sheet.className = "fanzine-sheet";
      for (const index of indices) sheet.append(pages[index]);
      root.append(sheet);
    }
  });
  await page.addStyleTag({
    content: `
    @media print {
      @page { size: A4 landscape; margin: 0; }
      .print-fanzine { width: 297mm; }
      .fanzine-sheet {
        width: 297mm; height: 210mm; display: grid;
        grid-template-columns: repeat(2, 1fr); justify-items: center;
        break-after: page; page-break-after: always;
      }
      .fanzine-sheet:last-child { break-after: auto; page-break-after: auto; }
      .print-fanzine .fanzine-sheet .fanzine-page {
        break-after: auto; page-break-after: auto;
      }
    }
  `,
  });
  const printPath = resolve("public/materiales/fanzine-imprimir-a4.pdf");
  await page.pdf({ ...options, path: printPath });
  console.log(`Fanzine A5 (4 páginas): ${readingPath}`);
  console.log(
    `Fanzine A4 para doblar (2 caras, orden 4|1 y 2|3): ${printPath}`,
  );
} finally {
  await browser?.close();
  await new Promise((done, reject) =>
    server.httpServer.close((error) => (error ? reject(error) : done())),
  );
}
