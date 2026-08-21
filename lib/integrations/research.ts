// Web / company research provider interface (future: research API or
// LinkedIn-compatible data provider / Apollo-style prospect database).

export interface CompanyResearchResult {
  description: string;
  recentActivity: string;
  contactSuggestion: { name: string; role: string } | null;
}

export interface ResearchProvider {
  researchCompany(companyName: string): Promise<CompanyResearchResult>;
}

export class MockResearchProvider implements ResearchProvider {
  async researchCompany(companyName: string): Promise<CompanyResearchResult> {
    return {
      description: `${companyName} is a Swiss-market company (mock research result).`,
      recentActivity: "No live research connected — using mock data.",
      contactSuggestion: null,
    };
  }
}
