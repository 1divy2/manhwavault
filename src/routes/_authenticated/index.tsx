import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  BookMarked,
  LogOut,
  Plus,
  Search,
  Upload,
  Download,
  Loader2,
  Moon,
  Sun,
  ListPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth-context";
import { useManhwa } from "@/lib/use-manhwa";
import {
  SORT_OPTIONS,
  STATUS_OPTIONS,
  type SortValue,
  type StatusValue,
} from "@/lib/constants";
import type { ManhwaEntry, ManhwaInput } from "@/lib/types";
import { StatsBar } from "@/components/manhwa/StatsBar";
import { ManhwaList } from "@/components/manhwa/ManhwaList";
import { EntryModal } from "@/components/manhwa/EntryModal";
import { DetailModal } from "@/components/manhwa/DetailModal";
import { toast } from "sonner";
import { useTheme } from "@/components/theme-provider";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [{ title: "ManhwaVault — Your Library" }],
  }),
  component: LibraryPage,
});

type StatusFilter = "all" | StatusValue;

function LibraryPage() {
  const { user, signOut } = useAuth();
  const { data: entries = [], isLoading, create, update, remove } = useManhwa();

  const { theme, setTheme } = useTheme();

  const isDark = theme === "dark" || (theme === "system" && typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [genre, setGenre] = useState<string>("all");
  const [favOnly, setFavOnly] = useState(false);
  const [minRating, setMinRating] = useState<string>("any");
  const [sort, setSort] = useState<SortValue>("added_asc" as any);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ManhwaEntry | null>(null);
  const [detail, setDetail] = useState<ManhwaEntry | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<ManhwaEntry | null>(null);
  const [confirmImport, setConfirmImport] = useState<ManhwaInput[] | null>(null);

  const searchRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      const typing = tag === "INPUT" || tag === "TEXTAREA";
      if (e.key === "/" && !typing) {
        e.preventDefault();
        searchRef.current?.focus();
      } else if ((e.key === "n" || e.key === "N") && !typing) {
        e.preventDefault();
        setEditing(null);
        setModalOpen(true);
      } else if (e.key === "Escape") {
        setModalOpen(false);
        setDetail(null);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const allGenres = useMemo(() => {
    const s = new Set<string>();
    entries.forEach((e) => e.genres.forEach((g) => s.add(g)));
    return Array.from(s).sort();
  }, [entries]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let arr = entries.filter((e) => {
      if (status !== "all" && e.status !== status) return false;
      if (favOnly && !e.favorite) return false;
      if (genre !== "all" && !e.genres.includes(genre)) return false;
      if (minRating !== "any" && (e.rating ?? 0) < parseFloat(minRating)) return false;
      if (q) {
        const hay = [
          e.title,
          e.author ?? "",
          e.notes ?? "",
          e.genres.join(" "),
        ]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    const cmp = (a: ManhwaEntry, b: ManhwaEntry) => {
      switch (sort) {
        case "updated_desc":
          return b.updated_at.localeCompare(a.updated_at);
        case "added_desc":
          return b.created_at.localeCompare(a.created_at);
        case "added_asc":
          return a.created_at.localeCompare(b.created_at);
        case "title_asc":
          return a.title.localeCompare(b.title);
        case "title_desc":
          return b.title.localeCompare(a.title);
        case "rating_desc":
          return (b.rating ?? -1) - (a.rating ?? -1);
        case "rating_asc":
          return (a.rating ?? 11) - (b.rating ?? 11);
        case "chapter_desc":
          return b.current_chapter - a.current_chapter;
      }
    };
    return [...arr].sort(cmp);
  }, [entries, search, status, favOnly, genre, minRating, sort]);

  const handleSubmit = async (input: ManhwaInput) => {
    if (editing) {
      await update.mutateAsync({ id: editing.id, patch: input });
      toast.success("Saved");
    } else {
      await create.mutateAsync(input);
    }
    setEditing(null);
  };

  const exportLibrary = () => {
    const blob = new Blob([JSON.stringify(entries, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `manhwavault-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported library");
  };

  const onImportFile = async (file: File) => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed)) throw new Error("Invalid file");
      const inputs: ManhwaInput[] = parsed.map((p) => ({
        title: String(p.title ?? "Untitled"),
        cover_image: p.cover_image ?? null,
        author: p.author ?? null,
        genres: Array.isArray(p.genres) ? p.genres.map(String) : [],
        description: p.description ?? null,
        status: (STATUS_OPTIONS.some((s) => s.value === p.status) ? p.status : "reading") as StatusValue,
        current_chapter: Number(p.current_chapter ?? 0),
        total_chapters: Number(p.total_chapters ?? 0),
        rating: p.rating == null ? null : Number(p.rating),
        favorite: Boolean(p.favorite),
        notes: p.notes ?? null,
      }));
      setConfirmImport(inputs);
    } catch {
      toast.error("Could not parse file");
    }
  };

  const doImport = async () => {
    if (!confirmImport) return;
    for (const inp of confirmImport) {
      await create.mutateAsync(inp);
    }
    toast.success(`Imported ${confirmImport.length} entries`);
    setConfirmImport(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/60 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-9 w-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0">
              <BookMarked className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-semibold text-foreground leading-tight truncate">
                ManhwaVault
              </h1>
              <p className="text-xs text-muted-foreground truncate">
                Your Personal Manhwa Library
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full h-8 w-8">
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onImportFile(f);
                e.target.value = "";
              }}
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="rounded-full">
                  <span className="h-7 w-7 rounded-full bg-muted text-foreground flex items-center justify-center text-xs font-medium">
                    {(user?.email ?? "?").slice(0, 1).toUpperCase()}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 text-xs text-muted-foreground truncate">
                  {user?.email}
                </div>
                <DropdownMenuItem onClick={exportLibrary}>
                  <Download className="h-4 w-4 mr-2" /> Export Library
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => fileRef.current?.click()}>
                  <Upload className="h-4 w-4 mr-2" /> Import JSON
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOut className="h-4 w-4 mr-2" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <StatsBar entries={entries} />

        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={searchRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, author, genre, notes…  (press /)"
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={status} onValueChange={(v) => setStatus(v as StatusFilter)}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {STATUS_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={genre} onValueChange={setGenre}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Genre" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genres</SelectItem>
                {allGenres.map((g) => (
                  <SelectItem key={g} value={g}>{g}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={minRating} onValueChange={setMinRating}>
              <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any Rating</SelectItem>
                <SelectItem value="9">9+</SelectItem>
                <SelectItem value="8">8+</SelectItem>
                <SelectItem value="7">7+</SelectItem>
                <SelectItem value="5">5+</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant={favOnly ? "default" : "outline"}
              onClick={() => setFavOnly((v) => !v)}
            >
              ★ Favorites
            </Button>
            <Select value={sort} onValueChange={(v) => setSort(v as SortValue)}>
              <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : entries.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card py-20 text-center">
            <div className="h-12 w-12 rounded-xl bg-muted text-muted-foreground mx-auto flex items-center justify-center mb-4">
              <BookMarked className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Your library is empty.</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Start building your personal collection.
            </p>
            <Button className="mt-6" onClick={() => { setEditing(null); setModalOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" /> Add your first manhwa
            </Button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-sm text-muted-foreground">
            No entries match your filters.
          </div>
        ) : (
          <div className="bg-card rounded-xl border border-border shadow-sm p-4">
            <ManhwaList entries={filtered} update={update} remove={remove} create={create} />
          </div>
        )}
      </main>

      {/* Quick Add Row FAB */}
      <Button
        onClick={() => {
          create.mutate({ title: "", current_chapter: 0, status: "reading", genres: [], favorite: false });
        }}
        className="fixed bottom-[104px] right-6 h-12 w-12 rounded-full shadow-lg p-0 bg-secondary text-secondary-foreground hover:bg-secondary/80"
        size="icon"
        aria-label="Add empty row"
        title="Add an empty row"
      >
        <ListPlus className="h-5 w-5" />
      </Button>

      {/* Main Add FAB */}
      <Button
        onClick={() => { setEditing(null); setModalOpen(true); }}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg p-0"
        size="lg"
        aria-label="Add manhwa (N)"
      >
        <Plus className="h-6 w-6" />
      </Button>

      <EntryModal
        open={modalOpen}
        onOpenChange={(o) => { setModalOpen(o); if (!o) setEditing(null); }}
        initial={editing}
        onSubmit={handleSubmit}
      />

      <DetailModal
        entry={detail}
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        onEdit={() => {
          if (detail) {
            setEditing(detail);
            setDetail(null);
            setModalOpen(true);
          }
        }}
        onDelete={() => {
          if (detail) {
            setConfirmDelete(detail);
            setDetail(null);
          }
        }}
      />

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this entry?</AlertDialogTitle>
            <AlertDialogDescription>
              "{confirmDelete?.title}" will be permanently removed from your library.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmDelete) remove.mutate(confirmDelete.id);
                setConfirmDelete(null);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!confirmImport} onOpenChange={(o) => !o && setConfirmImport(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Import {confirmImport?.length ?? 0} entries?</AlertDialogTitle>
            <AlertDialogDescription>
              These will be added to your library alongside existing entries.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={doImport}>Import</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}