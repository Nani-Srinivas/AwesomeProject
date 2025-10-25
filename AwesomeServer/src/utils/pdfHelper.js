// utils/pdfHelper.js
import puppeteer from 'puppeteer';

export async function renderHtmlToPdfBuffer(html, options = {}) {
  // options could include format, margin, etc.
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({
      format: options.format || 'A4',
      printBackground: true,
      margin: options.margin || { top: '12mm', right: '12mm', bottom: '12mm', left: '12mm' },
    });
    return pdfBuffer;
  } finally {
    await browser.close();
  }
}
