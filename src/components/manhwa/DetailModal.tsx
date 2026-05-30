import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { ManhwaEntry } from "@/lib/types";
import { STATUS_BADGE, STATUS_LABEL } from "@/lib/constants";
import { Star, Pencil, Trash2, ImageOff } from "lucide-react";
import { format } from "date-fns";

interface Props {
  entry: ManhwaEntry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function DetailModal({ entry, open, onOpenChange, onEdit, onDelete }: Props) {
  if (!entry) return null;
  const pct =
    entry.total_chapters > 0
      ? Math.min(100, Math.round((entry.current_chapter / entry.total_chapters) * 100))
      : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-6">
          <div className="aspect-[2/3] rounded-xl bg-muted overflow-hidden">
            {entry.cover_image ? (
              <img
                src={entry.cover_image}
                alt={entry.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <ImageOff className="h-10 w-10" />
              </div>
            )}
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <span
                  className={`text-[10px] font-medium uppercase tracking-wide px-2 py-1 rounded-md border ${STATUS_BADGE[entry.status]}`}
                >
                  {STATUS_LABEL[entry.status]}
                </span>
                {entry.favorite && (
                  <span className="text-[10px] font-medium uppercase tracking-wide px-2 py-1 rounded-md bg-amber-50 text-amber-700 border border-amber-200 inline-flex items-center gap-1">
                    <Star className="h-3 w-3 fill-current" /> Favorite
                  </span>
                )}
                {entry.rating != null && (
                  <span className="text-xs font-medium px-2 py-1 rounded-md bg-muted text-foreground inline-flex items-center gap-1">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    {entry.rating} / 10
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-semibold text-foreground">{entry.title}</h2>
              {entry.author && (
                <p className="text-sm text-muted-foreground mt-1">by {entry.author}</p>
              )}
            </div>

            {entry.genres.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {entry.genres.map((g) => (
                  <span
                    key={g}
                    className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground"
                  >
                    {g}
                  </span>
                ))}
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">
                  {entry.current_chapter}
                  {entry.total_chapters > 0 ? ` / ${entry.total_chapters}` : ""} chapters
                  {entry.total_chapters > 0 && ` (${pct}%)`}
                </span>
              </div>
              {entry.total_chapters > 0 && <Progress value={pct} />}
            </div>

            {entry.description && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                  Description
                </h3>
                <p className="text-sm text-foreground whitespace-pre-wrap">{entry.description}</p>
              </div>
            )}

            {entry.notes && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                  Personal Notes
                </h3>
                <p className="text-sm text-foreground whitespace-pre-wrap bg-muted rounded-lg p-3">
                  {entry.notes}
                </p>
              </div>
            )}

            <div className="text-xs text-muted-foreground border-t border-border pt-3 grid grid-cols-2 gap-2">
              <div>Added {format(new Date(entry.created_at), "PP")}</div>
              <div>Updated {format(new Date(entry.updated_at), "PP")}</div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button onClick={onEdit} variant="outline">
                <Pencil className="h-4 w-4 mr-2" /> Edit
              </Button>
              <Button onClick={onDelete} variant="outline" className="text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4 mr-2" /> Delete
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}