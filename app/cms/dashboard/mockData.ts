import { WorkflowItem, BrokenLink } from "./types";

export const workflowItems: WorkflowItem[] = [
  {
    id: "1",
    name: "Page A",
    type: "page",
    lastModified: new Date("2024-01-13T15:50:00"),
    modifiedBy: {
      name: "Aamr Fakhry",
      avatar: "/app/assets/avatars/aamr-fakhry.png",
    },
    status: "draft",
  },
  {
    id: "2",
    name: "Page B",
    type: "page",
    lastModified: new Date("2024-01-13T15:50:00"),
    modifiedBy: {
      name: "Benjamin Holme",
      avatar: "/app/assets/avatars/benjamin-holme.svg",
    },
    status: "draft",
  },
  {
    id: "3",
    name: "Block C",
    type: "block",
    lastModified: new Date("2024-01-13T15:50:00"),
    modifiedBy: {
      name: "Stefan Svebeck",
      avatar: "/app/assets/avatars/stefan-svebeck.svg",
    },
    status: "draft",
  },
  {
    id: "4",
    name: "Page D",
    type: "page",
    lastModified: new Date("2024-01-13T15:50:00"),
    modifiedBy: {
      name: "Aamr Fakhry",
      avatar: "/app/assets/avatars/aamr-fakhry-alt.svg",
    },
    status: "draft",
  },
];

export const brokenLinks: BrokenLink[] = [
  {
    id: "1",
    name: "Page A",
    type: "page",
  },
  {
    id: "2",
    name: "Page B",
    type: "page",
  },
  {
    id: "3",
    name: "Block C",
    type: "block",
  },
  {
    id: "4",
    name: "Page D",
    type: "page",
  },
];