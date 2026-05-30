import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { ManhwaEntry, ManhwaInput } from "./types";
import { useAuth } from "./auth-context";
import { toast } from "sonner";

const QK = ["manhwa_entries"] as const;

export function useManhwa() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: QK,
    enabled: !!user,
    queryFn: async (): Promise<ManhwaEntry[]> => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("manhwa_entries")
        .select("*")
        .eq("user_id", user.uid)
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as ManhwaEntry[];
    },
  });

  // realtime
  useEffect(() => {
    if (!user) return;
    const ch = supabase
      .channel("manhwa_entries_rt")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "manhwa_entries", filter: `user_id=eq.${user.uid}` },
        () => qc.invalidateQueries({ queryKey: QK }),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [user, qc]);

  const create = useMutation({
    mutationFn: async (input: ManhwaInput) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("manhwa_entries")
        .insert({ ...input, user_id: user.uid });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Added to library");
      qc.invalidateQueries({ queryKey: QK });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const update = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<ManhwaInput> }) => {
      const { error } = await supabase
        .from("manhwa_entries")
        .update(patch)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("manhwa_entries").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Removed");
      qc.invalidateQueries({ queryKey: QK });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return { ...query, create, update, remove };
}