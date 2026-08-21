import { PageHeader } from "@/components/layout/page-header";
import { Inbox } from "@/components/conversations/inbox";
import { conversations } from "@/lib/data/conversations";

export default function ConversationsPage() {
  return (
    <div>
      <PageHeader
        title="Conversation Center"
        description="A unified inbox across players, clubs, sponsors and media. The Conversation Manager classifies every reply and recommends the next move."
      />
      <Inbox conversations={conversations} />
    </div>
  );
}
