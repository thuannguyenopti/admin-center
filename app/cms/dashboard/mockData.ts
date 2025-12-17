import { WorkflowItem, BrokenLink } from "./types";
import { getAllContentItems } from "@/app/db/initialData";

const allContentItems = getAllContentItems();

// Get avatar from pravatar based on user name
const getAvatar = (name: string, id: string) => {
  return `https://i.pravatar.cc/32?u=${id}`;
};

export const workflowItems: WorkflowItem[] = allContentItems.map(item => ({
  id: item.id,
  name: item.name,
  type: item.baseType === "Block" ? "block" : "page",
  lastModified: new Date(item.lastModified),
  modifiedBy: {
    name: item.modifiedBy,
    avatar: getAvatar(item.modifiedBy, item.id),
  },
  status: item.workflowStatus,
}));

export const brokenLinks: BrokenLink[] = [
  {
    id: "1",
    name: "Features Page",
    type: "page",
  },
  {
    id: "2",
    name: "Training Plans Page",
    type: "page",
  },
  {
    id: "5",
    name: "Pricing Block",
    type: "block",
  },
  {
    id: "10",
    name: "Help Center Page",
    type: "page",
  },
];
