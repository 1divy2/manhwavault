import type { ManhwaEntry } from "@/lib/types";
import { Library, BookOpen, CheckCircle2, Star, Bookmark } from "lucide-react";

interface Props {
  entries: ManhwaEntry[];
}

export function StatsBar({ entries }: Props) {
  const stats = [
    { label: "Total", value: entries.length, icon: Library },
    {
      label: "Ongoing",
      value: entries.filter((e) => e.status === "reading").length,
      icon: BookOpen,
    },
    {
      label: "Completed",
      value: entries.filter((e) => e.status === "completed").length,
      icon: CheckCircle2,
    },
    {
      label: "Favorites",
      value: entries.filter((e) => e.favorite).length,
      icon: Star,
    },
    {
      label: "Hiatus",
      value: entries.filter((e) => e.status === "hiatus").length,
      icon: Bookmark,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
      {stats.map((s) => (
        <div
          key={s.label}
          className="rounded-xl border border-border bg-card px-4 py-3 flex items-center gap-3"
        >
          <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
            <s.icon className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
            <div className="text-lg font-semibold leading-tight text-foreground">
              {s.value}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}