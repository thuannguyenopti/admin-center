import { ContentItem } from "./page";

export interface MultiSelectMetadata {
  count: number;
  previewImage: string;
  dateRange: {
    earliest: string;
    latest: string;
  };
  totalFileSize: string;
  tags: string[];
  categories: string[];
  typeDistribution: {
    Page: number;
    Product: number;
    Block: number;
    Media: number;
  };
}

export function useMultiSelectMetadata(items: ContentItem[]): MultiSelectMetadata {
  if (items.length === 0) {
    return {
      count: 0,
      previewImage: "",
      dateRange: { earliest: "", latest: "" },
      totalFileSize: "0 MB",
      tags: [],
      categories: [],
      typeDistribution: { Page: 0, Product: 0, Block: 0, Media: 0 },
    };
  }

  // Get date range
  const dates = items.map(item => new Date(item.lastModified).getTime());
  const earliestDate = new Date(Math.min(...dates));
  const latestDate = new Date(Math.max(...dates));

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  // Calculate type distribution
  const typeDistribution: MultiSelectMetadata["typeDistribution"] = {
    Page: items.filter(i => i.baseType === "Page").length,
    Product: items.filter(i => i.baseType === "Product").length,
    Block: items.filter(i => i.baseType === "Block").length,
    Media: items.filter(i => i.baseType === "Media").length,
  };

  // Intersection of all selected items' tags (only tags ALL items share)
  const tags = items.length > 0
    ? (items[0].tags ?? []).filter(tag =>
        items.every(item => (item.tags ?? []).includes(tag))
      )
    : [];
  // Intersection of all selected items' categories (only categories ALL items share)
  const categories = items.length > 0
    ? (items[0].categories ?? []).filter(category =>
        items.every(item => (item.categories ?? []).includes(category))
      )
    : [];

  // Calculate total file size (mock)
  const totalFileSize = (items.length * 11.42).toFixed(1); // Mock calculation

  return {
    count: items.length,
    previewImage: "/images/product-preview.png", // Use first image from selection
    dateRange: {
      earliest: formatDate(earliestDate),
      latest: formatDate(latestDate),
    },
    totalFileSize: `${totalFileSize} MB`,
    tags,
    categories,
    typeDistribution,
  };
}
