// Social media publishing interface (future: Instagram / TikTok /
// YouTube / LinkedIn APIs). The Content Agent calls this to publish
// scheduled content.

import { ContentPlatform } from "@/types";

export interface SocialPublishResult {
  published: boolean;
  mock: boolean;
  url: string | null;
}

export interface SocialProvider {
  publish(platform: ContentPlatform, caption: string): Promise<SocialPublishResult>;
}

export class MockSocialProvider implements SocialProvider {
  async publish(_platform: ContentPlatform, _caption: string): Promise<SocialPublishResult> {
    return { published: true, mock: true, url: null };
  }
}
