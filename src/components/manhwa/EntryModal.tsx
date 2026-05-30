import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { STATUS_OPTIONS, type StatusValue } from "@/lib/constants";
import type { ManhwaEntry, ManhwaInput } from "@/lib/types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: ManhwaEntry | null;
  onSubmit: (input: ManhwaInput) => Promise<void> | void;
}

const empty: ManhwaInput = {
  title: "",
  cover_image: "",
  author: "",
  genres: [],
  description: "",
  status: "reading",
  current_chapter: 0,
  total_chapters: 0,
  rating: null,
  favorite: false,
  notes: "",
};

export function EntryModal({ open, onOpenChange, initial, onSubmit }: Props) {
  const [form, setForm] = useState<ManhwaInput>(empty);
  const [genresInput, setGenresInput] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) {
      if (initial) {
        setForm({
          title: initial.title,
          cover_image: initial.cover_image ?? "",
          author: initial.author ?? "",
          genres: initial.genres,
          description: initial.description ?? "",
          status: initial.status,
          current_chapter: initial.current_chapter,
          total_chapters: initial.total_chapters,
          rating: initial.rating,
          favorite: initial.favorite,
          notes: initial.notes ?? "",
        });
        setGenresInput(initial.genres.join(", "));
      } else {
        setForm(empty);
        setGenresInput("");
      }
    }
  }, [open, initial]);

  const set = <K extends keyof ManhwaInput>(k: K, v: ManhwaInput[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setBusy(true);
    try {
      await onSubmit({
        ...form,
        title: form.title.trim(),
        cover_image: form.cover_image?.trim() || null,
        author: form.author?.trim() || null,
        description: form.description?.trim() || null,
        notes: form.notes?.trim() || null,
        genres: genresInput
          .split(",")
          .map((g) => g.trim())
          .filter(Boolean),
      });
      onOpenChange(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit Manhwa" : "Add Manhwa"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              required
              maxLength={200}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cover">Cover Image URL</Label>
              <Input
                id="cover"
                value={form.cover_image ?? ""}
                onChange={(e) => set("cover_image", e.target.value)}
                placeholder="https://..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="author">Author</Label>
              <Input
                id="author"
                value={form.author ?? ""}
                onChange={(e) => set("author", e.target.value)}
                maxLength={200}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="genres">Genres (comma-separated)</Label>
            <Input
              id="genres"
              value={genresInput}
              onChange={(e) => setGenresInput(e.target.value)}
              placeholder="Action, Fantasy, Romance"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={form.description ?? ""}
              onChange={(e) => set("description", e.target.value)}
              rows={3}
              maxLength={2000}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => set("status", v as StatusValue)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="current">Current Chapter</Label>
              <Input
                id="current"
                type="number"
                min={0}
                value={form.current_chapter}
                onChange={(e) =>
                  set("current_chapter", Math.max(0, parseInt(e.target.value || "0", 10)))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="total">Total Chapters</Label>
              <Input
                id="total"
                type="number"
                min={0}
                value={form.total_chapters}
                onChange={(e) =>
                  set("total_chapters", Math.max(0, parseInt(e.target.value || "0", 10)))
                }
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="rating">Rating (0–10)</Label>
              <Input
                id="rating"
                type="number"
                min={0}
                max={10}
                step={0.1}
                value={form.rating ?? ""}
                onChange={(e) =>
                  set(
                    "rating",
                    e.target.value === "" ? null : Math.min(10, Math.max(0, parseFloat(e.target.value))),
                  )
                }
              />
            </div>
            <div className="flex items-center gap-3 pb-2">
              <Switch
                id="fav"
                checked={form.favorite}
                onCheckedChange={(v) => set("favorite", v)}
              />
              <Label htmlFor="fav" className="cursor-pointer">
                Favorite
              </Label>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Personal Notes</Label>
            <Textarea
              id="notes"
              value={form.notes ?? ""}
              onChange={(e) => set("notes", e.target.value)}
              rows={4}
              placeholder="Reading impressions, thoughts, reminders..."
              maxLength={5000}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={busy}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={busy || !form.title.trim()}>
              {initial ? "Save Changes" : "Add to Library"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}