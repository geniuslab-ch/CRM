import { PageHeader } from "@/components/layout/page-header";
import { Inbox } from "@/components/conversations/inbox";
import { DataSourceBadge } from "@/components/ui/data-source-badge";
import { getConversations } from "@/lib/supabase/repository";

export const dynamic = "force-dynamic";

export default async function ConversationsPage() {
  const { data: conversations, source } = await getConversations();

  return (
    <div>
      <PageHeader
        title="Conversation Center"
        description="A real log of outreach sent through the platform, plus real replies pulled in automatically from sponsor and club contacts (polled every 15 minutes) and classified by Claude."
        action={<DataSourceBadge source={source} />}
      />
      <Inbox conversations={conversations} />
    </div>
  );
}
