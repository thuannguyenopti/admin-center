export interface ReportItem {
  id: string;
  pageName: string;
  published?: {
    date: string;
    time: string;
  };
  unpublished?: {
    date: string;
    time: string;
  };
  lastChanged: {
    date: string;
    time: string;
  };
  changedBy: string;
  language: string;
  pageType: string;
}

export type ReportType = "published" | "unpublished" | "scheduled" | "archived";
export type PublishStatus = "ready-to-publish" | "draft" | "published" | "archived";
export type DateFilter = "any" | "today" | "this-week" | "this-month";
export type ChangedByFilter = "anyone" | "me";
export type LanguageFilter = "any" | "english" | "spanish" | "french";