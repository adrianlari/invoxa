import puppeteer from "puppeteer";

export const pdfService = {
  async generateInvoicePdf(invoice: any): Promise<Buffer> {
    const browser = await puppeteer.launch({ headless: true });
    try {
      const page = await browser.newPage();
      const html = `<html><body><h1>Invoice ${invoice.invoiceNumber}</h1><p>${invoice.customer?.name ?? ""}</p></body></html>`;
      await page.setContent(html, { waitUntil: "networkidle0" });
      const pdf = await page.pdf({ format: "A4", printBackground: true });
      return Buffer.from(pdf);
    } finally {
      await browser.close();
    }
  },

  async uploadPdf(_buffer: Buffer, invoiceId: string) {
    return `${process.env.R2_PUBLIC_URL ?? "https://files.example.com"}/${invoiceId}.pdf`;
  },
};
