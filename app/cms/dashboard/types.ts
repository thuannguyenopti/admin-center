export type WorkflowStatus = "draft" | "in-review" | "approved" | "scheduled" | "rejected";

export type ContentType = "page" | "block";

export interface WorkflowItem {
  id: string;
  name: string;
  type: ContentType;
  lastModified: Date;
  modifiedBy: {
    name: string;
    avatar: string;
  };
  status: WorkflowStatus;
}

export interface BrokenLink {
  id: string;
  name: string;
  type: ContentType;
}

export interface TabConfig {
  value: WorkflowStatus;
  label: string;
  count: number;
}