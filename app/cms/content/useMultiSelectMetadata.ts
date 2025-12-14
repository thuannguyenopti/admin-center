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
  typeDistribution: {
    Page: number;
    Product: number;
    Block: number;
    Image: number;
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
      typeDistribution: { Page: 0, Product: 0, Block: 0, Image: 0 },
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
    Page: items.filter(i => i.type === "Page").length,
    Product: items.filter(i => i.type === "Product").length,
    Block: items.filter(i => i.type === "Block").length,
    Image: items.filter(i => i.type === "Image").length,
  };

  // Mock tags - in real implementation, these would come from data
  const mockTags = ["Sky", "Man", "Outdoor", "Photo", "Mountain", "Nature"];

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
    tags: mockTags,
    typeDistribution,
  };
}
