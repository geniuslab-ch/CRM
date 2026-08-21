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
        description="A real log of outreach actually sent through the platform. Replies aren't captured automatically yet — no inbox integration is connected, so nothing here is simulated."
        action={<DataSourceBadge source={source} />}
      />
      <Inbox conversations={conversations} />
    </div>
  );
}
