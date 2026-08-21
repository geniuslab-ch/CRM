import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlatformBadge } from "./platform-badge";
import { CONTENT_CALENDAR } from "@/lib/data/content";

export function ContentCalendar() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly content calendar</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-5">
          {CONTENT_CALENDAR.map((day) => (
            <div key={day.day} className="rounded-xl border border-border bg-surface-2 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{day.day}</p>
              <p className="mt-1.5 text-sm font-medium">{day.title}</p>
              <div className="mt-2">
                <PlatformBadge platform={day.platform} />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
