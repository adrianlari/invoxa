import { SCENARIOS, type MockScenarioData } from './scenarios';

const scenarioKey = process.env.NEXT_PUBLIC_MOCK_SCENARIO ?? 'default';
const scenario = SCENARIOS[scenarioKey] ?? SCENARIOS.default;

export const activeMockScenario = SCENARIOS[scenarioKey] ? scenarioKey : 'default';

export const mockDb: MockScenarioData = structuredClone(scenario);

export function nextInvoiceNumber() {
  const last = mockDb.invoices
    .map((invoice) => Number(invoice.invoiceNumber.split('-').at(-1) ?? '0'))
    .sort((a, b) => b - a)[0] ?? 0;

  const year = new Date().getFullYear();
  return `${mockDb.organization.invoicePrefix}-${year}-${String(last + 1).padStart(4, '0')}`;
}
