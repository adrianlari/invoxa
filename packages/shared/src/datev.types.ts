export type DatevExportRow = {
  amountGross: string;
  debitCredit: "S" | "H";
  currency: string;
  exchangeRate: string;
  account: string;
  counterAccount: string;
  documentDate: string;
  documentField1: string;
  postingText: string;
};
