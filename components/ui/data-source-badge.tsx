import { Database, FlaskConical } from "lucide-react";
import { Badge } from "./badge";

export function DataSourceBadge({ source }: { source: "live" | "demo" }) {
  if (source === "live") {
    return (
      <Badge variant="success">
        <Database className="h-3 w-3" aria-hidden="true" />
        Live database
      </Badge>
    );
  }
  return (
    <Badge variant="outline">
      <FlaskConical className="h-3 w-3" aria-hidden="true" />
      Demo data
    </Badge>
  );
}
