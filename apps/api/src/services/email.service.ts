export const emailService = {
  async sendInvoiceEmail(params: { to: string; invoiceNumber: string; pdfUrl: string }) {
    console.log(`[email] to=${params.to} invoice=${params.invoiceNumber} pdf=${params.pdfUrl}`);
  },
};
