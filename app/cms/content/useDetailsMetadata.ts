import { ContentItem } from "./page";
import { initialContentTypes } from "@/app/db/initialData";

export interface PropertyField {
  label: string;
  value: string;
}

export interface DisclosureSection {
  title: string;
  properties?: PropertyField[];
  items?: Array<{
    label: string;
    checked?: boolean;
    icon?: React.ReactNode;
  }>;
}

export interface DetailsPaneMetadata {
  previewImage: string;
  sections: DisclosureSection[];
}

/**
 * Build a Variants section from the content type's variantDimensions.
 * Returns null if the content type has no variant dimensions defined.
 */
function buildVariantsSection(contentTypeId: string): DisclosureSection | null {
  const contentType = initialContentTypes.find(ct => ct.id === contentTypeId);

  if (!contentType?.variantDimensions || contentType.variantDimensions.length === 0) {
    return null;
  }

  // Build items from variant dimensions
  // Format: "Dimension: Value1, Value2, ..."
  const items = contentType.variantDimensions.map(dimension => ({
    label: `${dimension.name}: ${dimension.values.join(", ")}`,
  }));

  return {
    title: "Variants",
    items,
  };
}

export function useDetailsMetadata(content: ContentItem): DetailsPaneMetadata {
  const baseMetadata: DetailsPaneMetadata = {
    previewImage: "/images/product-preview.png", // Default preview
    sections: [],
  };

  // Get variants section if applicable for this content type
  const variantsSection = buildVariantsSection(content.contentTypeId);

  switch (content.baseType) {
    case "Media":
      return {
        previewImage: "/images/product-preview.png",
        sections: [
          {
            title: "Image Information",
            properties: [
              { label: "Last updated", value: content.lastModified },
              { label: "Alt text", value: "Product image" },
              { label: "Dimensions", value: "4000 x 3000" },
              { label: "File size", value: "4.32 MB" },
            ],
          },
          // Add variants section if defined for this content type
          ...(variantsSection ? [variantsSection] : []),
          {
            title: "Usage",
            items: [
              { label: "Header", checked: true },
              { label: "Footer", checked: false },
              { label: "Content Block", checked: false },
            ],
          },
        ],
      };

    case "Page":
    case "Experience":
      return {
        previewImage: "/images/product-preview.png",
        sections: [
          {
            title: "Page Information",
            properties: [
              { label: "Created by", value: content.modifiedBy },
              { label: "Last modified", value: content.lastModified },
              { label: "Status", value: content.status },
              { label: "Language", value: content.language },
            ],
          },
          // Add variants section if defined for this content type (e.g., A/B tests)
          ...(variantsSection ? [variantsSection] : []),
          {
            title: "Sections Used",
            items: [
              { label: "Hero Section" },
              { label: "Content Block" },
              { label: "Call to Action" },
            ],
          },
        ],
      };

    case "Product":
      return {
        previewImage: "/images/product-preview.png",
        sections: [
          {
            title: "Product Information",
            properties: [
              { label: "SKU", value: `PROD-${content.id}` },
              { label: "Price", value: "$99.99" },
              { label: "Status", value: content.status },
              { label: "Category", value: "Equipment" },
            ],
          },
          // Use dynamic variants from content type, or fallback
          ...(variantsSection ? [variantsSection] : [{
            title: "Variants",
            items: [
              { label: "Size: Small" },
              { label: "Size: Medium" },
              { label: "Size: Large" },
            ],
          }]),
        ],
      };

    case "Block":
      return {
        previewImage: "/images/product-preview.png",
        sections: [
          {
            title: "Block Information",
            properties: [
              { label: "Block Type", value: "Hero Section" },
              { label: "Last modified", value: content.lastModified },
              { label: "Status", value: content.status },
              { label: "Version", value: "1.2" },
            ],
          },
          {
            title: "Used In Pages",
            items: [
              { label: "Homepage" },
              { label: "Features" },
              { label: "Pricing" },
            ],
          },
        ],
      };

    default:
      return baseMetadata;
  }
}
