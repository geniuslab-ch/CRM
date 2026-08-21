import { Database, AlertTriangle } from "lucide-react";
import { Badge } from "./badge";
import { DataStatus } from "@/lib/supabase/repository";

export function DataSourceBadge({ source }: { source: DataStatus }) {
  if (source === "live") {
    return (
      <Badge variant="success">
        <Database className="h-3 w-3" aria-hidden="true" />
        Live database
      </Badge>
    );
  }
  return (
    <Badge variant="warning">
      <AlertTriangle className="h-3 w-3" aria-hidden="true" />
      Database unavailable
    </Badge>
  );
}
