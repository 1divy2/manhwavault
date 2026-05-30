import { useState, useEffect } from "react";
import type { ManhwaEntry, ManhwaInput } from "@/lib/types";
import { toast } from "sonner";
import { STATUS_OPTIONS, STATUS_LABEL } from "@/lib/constants";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Trash2, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UseMutationResult } from "@tanstack/react-query";

interface Props {
  entries: ManhwaEntry[];
  update: UseMutationResult<any, Error, { id: string; patch: Partial<ManhwaInput> }>;
  remove: UseMutationResult<any, Error, string>;
  create: UseMutationResult<any, Error, ManhwaInput>;
}

export function ManhwaList({ entries, update, remove, create }: Props) {
  const [lastDeleted, setLastDeleted] = useState<ManhwaEntry | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
        
        if (lastDeleted) {
          e.preventDefault();
          const { id, created_at, updated_at, ...rest } = lastDeleted;
          create.mutate(rest, {
            onSuccess: () => {
              toast.success(`Restored "${lastDeleted.title}"`);
              setLastDeleted(null);
            }
          });
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lastDeleted, create]);
  // Group entries by status, preserving their sorted order (which is chronological by default)
  const completed = entries.filter((e) => e.status === "completed");
  const hiatus = entries.filter((e) => e.status === "hiatus");
  const ongoing = entries.filter((e) => e.status === "reading");

  const groups = [
    { id: "completed", title: "END", data: completed },
    { id: "hiatus", title: "HIATUS", data: hiatus },
    { id: "reading", title: "ONGOING", data: ongoing },
  ];

  return (
    <Accordion
      type="multiple"
      defaultValue={["completed", "hiatus", "reading"]}
      className="w-full space-y-4"
    >
      {groups.map(
        (group) =>
          group.data.length > 0 && (
            <AccordionItem
              key={group.id}
              value={group.id}
              className="border rounded-xl bg-card overflow-hidden shadow-sm"
            >
              <AccordionTrigger className="px-4 py-3 hover:bg-muted/50 transition-colors font-bold text-lg bg-muted/20">
                {group.title} ({group.data.length})
              </AccordionTrigger>
              <AccordionContent className="p-0">
                <div className="overflow-x-auto">
                  <Table className="min-w-[800px]">
                    <TableHeader className="bg-muted/30">
                      <TableRow>
                        <TableHead className="w-[30%]">Manhwa Name</TableHead>
                        <TableHead className="w-[15%]">Chapters</TableHead>
                        <TableHead className="w-[15%]">Status</TableHead>
                        <TableHead className="w-[30%]">Link / Notes</TableHead>
                        <TableHead className="w-[10%] text-right"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {group.data.map((entry) => (
                        <EditableRow
                          key={entry.id}
                          entry={entry}
                          update={update}
                          remove={remove}
                          create={create}
                          setLastDeleted={setLastDeleted}
                        />
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </AccordionContent>
            </AccordionItem>
          ),
      )}
    </Accordion>
  );
}

function EditableRow({
  entry,
  update,
  remove,
  create,
  setLastDeleted,
}: {
  entry: ManhwaEntry;
  update: Props["update"];
  remove: Props["remove"];
  create: Props["create"];
  setLastDeleted: (e: ManhwaEntry | null) => void;
}) {
  const [title, setTitle] = useState(entry.title);
  const [chapters, setChapters] = useState(entry.current_chapter.toString());
  const [status, setStatus] = useState(entry.status);
  const [notes, setNotes] = useState(entry.notes ?? "");

  // Sync state if props change (e.g. from realtime)
  useEffect(() => {
    setTitle(entry.title);
    setChapters(entry.current_chapter.toString());
    setStatus(entry.status);
    setNotes(entry.notes ?? "");
  }, [entry]);

  const handleSaveTitle = () => {
    if (title.trim() && title.trim() !== entry.title) {
      update.mutate({ id: entry.id, patch: { title: title.trim() } });
    } else {
      setTitle(entry.title);
    }
  };

  const handleSaveChapters = () => {
    const num = parseInt(chapters, 10);
    if (!isNaN(num) && num !== entry.current_chapter) {
      update.mutate({ id: entry.id, patch: { current_chapter: num } });
    } else {
      setChapters(entry.current_chapter.toString());
    }
  };

  const handleSaveNotes = () => {
    if (notes !== (entry.notes ?? "")) {
      update.mutate({ id: entry.id, patch: { notes } });
    }
  };

  const handleChangeStatus = (newStatus: string) => {
    setStatus(newStatus as any);
    update.mutate({ id: entry.id, patch: { status: newStatus as any } });
  };

  // Helper to detect links in notes
  const renderLink = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const match = text.match(urlRegex);
    if (match) {
      return (
        <a
          href={match[0]}
          onClick={(e) => {
            e.preventDefault();
            window.open(match[0], "_blank");
          }}
          className="text-blue-500 hover:text-blue-400 flex items-center gap-1 bg-background/80 px-2 py-1 rounded shadow-sm border"
          title="Open Link"
        >
          <LinkIcon className="h-3 w-3" />
          Link
        </a>
      );
    }
    return null;
  };

  return (
    <TableRow className="hover:bg-muted/20">
      <TableCell className="p-0 border-r border-border/50">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleSaveTitle}
          onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
          className="w-full h-12 px-4 bg-transparent border-none outline-none focus:ring-2 focus:ring-inset focus:ring-primary focus:bg-background text-sm font-medium"
          placeholder="Untitled Manhwa"
        />
      </TableCell>
      <TableCell className="p-0 border-r border-border/50">
        <input
          type="number"
          value={chapters}
          onChange={(e) => setChapters(e.target.value)}
          onBlur={handleSaveChapters}
          onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
          className="w-full h-12 px-4 bg-transparent border-none outline-none focus:ring-2 focus:ring-inset focus:ring-primary focus:bg-background text-sm tabular-nums"
        />
      </TableCell>
      <TableCell className="p-0 border-r border-border/50">
        <select
          value={status}
          onChange={(e) => handleChangeStatus(e.target.value)}
          className="w-full h-12 px-3 bg-transparent border-none outline-none focus:ring-2 focus:ring-inset focus:ring-primary focus:bg-background text-sm appearance-none cursor-pointer"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-background text-foreground">
              {opt.label}
            </option>
          ))}
        </select>
      </TableCell>
      <TableCell className="p-0 border-r border-border/50 relative group/notes">
        <div className="absolute inset-y-0 right-2 flex items-center z-10 opacity-70 hover:opacity-100 transition-opacity">
          {renderLink(notes)}
        </div>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={handleSaveNotes}
          onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
          className="w-full h-12 px-4 pr-16 bg-transparent border-none outline-none focus:ring-2 focus:ring-inset focus:ring-primary focus:bg-background text-sm text-muted-foreground placeholder:text-muted-foreground/50"
          placeholder="Link or notes..."
        />
      </TableCell>
      <TableCell className="text-right p-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            const copy = { ...entry };
            setLastDeleted(copy);
            remove.mutate(entry.id, {
              onSuccess: () => {
                toast("Entry deleted", {
                  action: {
                    label: "Undo",
                    onClick: () => {
                      const { id, created_at, updated_at, ...rest } = copy;
                      create.mutate(rest);
                      setLastDeleted(null);
                    }
                  }
                });
              }
            });
          }}
          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          title="Delete entry"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
}
