export const STATUS_OPTIONS = [
  { value: "reading", label: "Ongoing" },
  { value: "completed", label: "Completed" },
  { value: "hiatus", label: "Hiatus" },
  { value: "dropped", label: "Dropped" },
] as const;

export type StatusValue = (typeof STATUS_OPTIONS)[number]["value"];

export const STATUS_LABEL: Record<StatusValue, string> = {
  reading: "Ongoing",
  completed: "Completed",
  hiatus: "Hiatus",
  dropped: "Dropped",
};

export const STATUS_BADGE: Record<StatusValue, string> = {
  reading: "bg-blue-100 text-blue-700 border-blue-200",
  completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
  hiatus: "bg-amber-100 text-amber-700 border-amber-200",
  dropped: "bg-rose-100 text-rose-700 border-rose-200",
};

export const SORT_OPTIONS = [
  { value: "updated_desc", label: "Recently Updated" },
  { value: "added_desc", label: "Recently Added" },
  { value: "title_asc", label: "Alphabetical A–Z" },
  { value: "title_desc", label: "Alphabetical Z–A" },
  { value: "rating_desc", label: "Highest Rating" },
  { value: "rating_asc", label: "Lowest Rating" },
  { value: "chapter_desc", label: "Highest Chapter" },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]["value"];