/** Rebuild the distributed text and PDF from the canonical instruction text.
 * Uses the installed Playwright browser (or PLAYWRIGHT_CHROMIUM_PATH). */
import { readFile, writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';
const text = await readFile('Studio-Instruction-Manual.txt', 'utf8');
await writeFile('public/Studio-Instruction-Manual.txt', text);
const escape = s => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const browser = await chromium.launch({
  ...(process.env.PLAYWRIGHT_CHROMIUM_PATH ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH } : {}), args: ['--no-sandbox'],
});
try {
  const page = await browser.newPage();
  await page.setContent(`<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Scarlet Reel — Studio Instruction Manual</title><style>
    body { margin: 0; color: #191b20; } pre { font: 10.5px/1.5 "DejaVu Sans Mono", monospace; white-space: pre-wrap; overflow-wrap: anywhere; }
    @page { size: A4; }
  </style></head><body><pre>${escape(text)}</pre></body></html>`);
  await page.pdf({ path: 'Studio-Instruction-Manual.pdf', format: 'A4', printBackground: true,
    margin: { top: '17mm', right: '14mm', bottom: '17mm', left: '14mm' }, displayHeaderFooter: true,
    headerTemplate: '<div style="font:8px sans-serif;color:#777;width:100%;text-align:center">SCARLET REEL · STUDIO INSTRUCTION MANUAL · 10 SEPTEMBER 2026</div>',
    footerTemplate: '<div style="font:8px sans-serif;color:#777;width:100%;text-align:center"><span class="pageNumber"></span> / <span class="totalPages"></span></div>',
  });
  console.log('Updated public manual text and Studio-Instruction-Manual.pdf');
} finally { await browser.close(); }
