import { ReactNode } from "react";
import {
  IconFileText,
  IconClock,
  IconStar,
  IconChecklist,
  IconTrash,
  IconFileCheck,
  IconCloud,
} from "@tabler/icons-react";

export interface SubNavItem {
  label: string;
  icon: ReactNode;
  url?: string;
}

export interface SubNavSection {
  title?: string;
  items: SubNavItem[];
}

export const contentSubNavData: SubNavSection[] = [
  {
    items: [
      { label: "All", icon: <IconFileText size={16} />, url: "/cms/content" },
      { label: "Recent", icon: <IconClock size={16} />, url: "/cms/content/recent" },
      { label: "Favorites", icon: <IconStar size={16} />, url: "/cms/content/favorites" },
      { label: "Templates", icon: <IconChecklist size={16} />, url: "/cms/content/templates" },
      { label: "Trash", icon: <IconTrash size={16} />, url: "/cms/content/trash" },
    ],
  },
  {
    title: "Sources",
    items: [
      { label: "CMS", icon: <IconFileCheck size={16} />, url: "/cms/content/sources/cms" },
      { label: "DAM", icon: <IconFileCheck size={16} />, url: "/cms/content/sources/dam" },
      { label: "Bynder", icon: <IconCloud size={16} />, url: "/cms/content/sources/bynder" },
      { label: "Commercetools", icon: <IconCloud size={16} />, url: "/cms/content/sources/commercetools" },
    ],
  },
];