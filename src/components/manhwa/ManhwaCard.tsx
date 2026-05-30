import type { ManhwaEntry } from "@/lib/types";
import { STATUS_BADGE, STATUS_LABEL } from "@/lib/constants";
import { Star, BookOpen, ImageOff, MoreVertical, Pencil, Trash2, Plus, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { formatDistanceToNow } from "date-fns";

interface Props {
  entry: ManhwaEntry;
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
  onUpdateChapter: () => void;
  onMarkCompleted: () => void;
}

export function ManhwaCard({
  entry,
  onOpen,
  onEdit,
  onDelete,
  onToggleFavorite,
  onUpdateChapter,
  onMarkCompleted,
}: Props) {
  const pct =
    entry.total_chapters > 0
      ? Math.min(100, Math.round((entry.current_chapter / entry.total_chapters) * 100))
      : 0;

  return (
    <div className="group rounded-2xl border border-border bg-card overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all">
      <button
        onClick={onOpen}
        className="block w-full text-left relative aspect-[2/3] bg-muted overflow-hidden"
      >
        {entry.cover_image ? (
          <img
            src={entry.cover_image}
            alt={entry.title}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <ImageOff className="h-8 w-8" />
          </div>
        )}
        <div className="absolute top-2 left-2">
          <span
            className={`text-[10px] font-medium uppercase tracking-wide px-2 py-1 rounded-md border ${STATUS_BADGE[entry.status]}`}
          >
            {STATUS_LABEL[entry.status]}
          </span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          className="absolute top-2 right-2 h-7 w-7 rounded-full bg-background/80 backdrop-blur flex items-center justify-center hover:bg-background"
          aria-label="Favorite"
        >
          <Star
            className={`h-4 w-4 ${entry.favorite ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`}
          />
        </button>
      </button>

      <div className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-foreground truncate" title={entry.title}>
              {entry.title}
            </h3>
            {entry.author && (
              <p className="text-xs text-muted-foreground truncate">{entry.author}</p>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 -mr-1 -mt-1"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={onUpdateChapter}>
                <Plus className="h-4 w-4 mr-2" /> +1 Chapter
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onMarkCompleted}>
                <CheckCircle2 className="h-4 w-4 mr-2" /> Mark Completed
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onToggleFavorite}>
                <Star className="h-4 w-4 mr-2" />
                {entry.favorite ? "Unfavorite" : "Favorite"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onEdit}>
                <Pencil className="h-4 w-4 mr-2" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={onDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {entry.genres.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {entry.genres.slice(0, 3).map((g) => (
              <span
                key={g}
                className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
              >
                {g}
              </span>
            ))}
          </div>
        )}

        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              {entry.current_chapter}
              {entry.total_chapters > 0 ? ` / ${entry.total_chapters}` : ""}
            </span>
            {entry.rating != null && (
              <span className="flex items-center gap-0.5 text-foreground font-medium">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                {entry.rating}
              </span>
            )}
          </div>
          {entry.total_chapters > 0 && <Progress value={pct} className="h-1" />}
        </div>

        <div className="text-[10px] text-muted-foreground pt-1 border-t border-border">
          Updated {formatDistanceToNow(new Date(entry.updated_at), { addSuffix: true })}
        </div>
      </div>
    </div>
  );
}