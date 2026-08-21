// CRM sync interface (future: HubSpot / Pipedrive-compatible).

import { SponsorStage } from "@/types";

export interface CrmProvider {
  syncStage(entityId: string, stage: SponsorStage): Promise<{ synced: boolean }>;
}

export class MockCrmProvider implements CrmProvider {
  async syncStage(_entityId: string, _stage: SponsorStage): Promise<{ synced: boolean }> {
    return { synced: true };
  }
}
