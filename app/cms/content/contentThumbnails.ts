/**
 * Stock image URLs for content manager thumbnails.
 * Maps content by id, then by name, then fallback by baseType.
 * Uses Unsplash and Pexels (free to use with attribution).
 */

export type ContentBaseType = "Page" | "Experience" | "Media" | "Product" | "Block";

export interface ContentThumbnailInput {
  id: string;
  name: string;
  baseType: ContentBaseType;
}

/** Normalize name for lookup (lowercase, collapse spaces) */
function normalizeName(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, " ");
}

/** Stock images by content name (normalized) for accurate representation */
const THUMBNAILS_BY_NAME: Record<string, string> = {
  // Pages
  homepage: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&q=80",
  "about us": "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&q=80",
  contact: "https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=400&q=80",
  blog: "https://images.unsplash.com/photo-1499750310107-5fef28a19043?w=400&q=80",
  products: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&q=80",
  "product a": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80",
  "default landing": "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=400&q=80",
  "5 tips for your first marathon": "https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=400&q=80",
  "intervals for beginners": "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80",
  "race day checklist": "https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=400&q=80",
  "how to choose running shoes": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80",
  activities: "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=400&q=80",
  community: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&q=80",
  challenges: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&q=80",
  pricing: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&q=80",
  stories: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&q=80",
  "cycle computer pro": "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=400&q=80",
  "hr monitor band": "https://images.unsplash.com/photo-1576243345690-4e4b79b63288?w=400&q=80",
  "smart bike trainer": "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400&q=80",
  "cadence sensor": "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400&q=80",
  "power meter": "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400&q=80",
  "speed sensor": "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400&q=80",
  "aero helmet": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80",
  "bike lights": "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400&q=80",
  "water bottle holder": "https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=400&q=80",
  "repair tool kit": "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400&q=80",
  // Other content (Products, Blocks, Media)
  "heart rate monitor - product": "https://images.unsplash.com/photo-1576243345690-4e4b79b63288?w=400&q=80",
  "pricing block": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&q=80",
  "cycling hero - image": "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=400&q=80",
  "route planning block": "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=400&q=80",
  "leaderboards block": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&q=80",
  "cycle computer pro - product": "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=400&q=80",
  "hr monitor band - product": "https://images.unsplash.com/photo-1576243345690-4e4b79b63288?w=400&q=80",
  "smart bike trainer - product": "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400&q=80",
  "cadence sensor - product": "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400&q=80",
  "power meter - product": "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400&q=80",
  "speed sensor - product": "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400&q=80",
  "aero helmet - product": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80",
  "bike lights - product": "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400&q=80",
  "water bottle holder - product": "https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=400&q=80",
  "repair tool kit - product": "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400&q=80",
  "weekly challenge block": "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&q=80",
  "achievement block": "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400&q=80",
  "social feed block": "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&q=80",
  "leaderboard widget block": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&q=80",
  "stats summary block": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&q=80",
  "upcoming events block": "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=400&q=80",
  "testimonial carousel block": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
  "payment plans block": "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&q=80",
  "mountain pass scenery - image": "https://images.unsplash.com/photo-1536240478700-b869070f9279?w=400&q=80",
  "pro cyclist in action - image": "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=400&q=80",
};

/** Fallback thumbnails by baseType when no name match */
const THUMBNAILS_BY_TYPE: Record<ContentBaseType, string> = {
  Page: "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=400&q=80",
  Experience: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&q=80",
  Media: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80",
  Product: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&q=80",
  Block: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&q=80",
};

/** Legacy id-based map (for backward compatibility with existing content ids) */
const THUMBNAILS_BY_ID: Record<string, string> = {
  "1": "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&q=80",
  "2": "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80",
  "3": "https://images.unsplash.com/photo-1576243345690-4e4b79b63288?w=400&q=80",
  "4": "https://images.pexels.com/photos/4531875/pexels-photo-4531875.jpeg",
  "5": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&q=80",
  "6": "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&q=80",
  "7": "https://images.pexels.com/photos/13870890/pexels-photo-13870890.jpeg",
  "8": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&q=80",
  "9": "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=400&q=80",
  "10": "https://images.pexels.com/photos/8867207/pexels-photo-8867207.jpeg",
  "11": "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=400&q=80",
  "12": "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80",
  "13": "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=400&q=80",
  "14": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&q=80",
  "15": "https://images.pexels.com/photos/4531875/pexels-photo-4531875.jpeg",
  "16": "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=400&q=80",
  "17": "https://images.pexels.com/photos/4498478/pexels-photo-4498478.jpeg",
  "18": "https://images.pexels.com/photos/8867207/pexels-photo-8867207.jpeg",
  "19": "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=400&q=80",
  "20": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&q=80",
  "26": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&q=80",
  "31": "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=400&q=80",
  "32": "https://images.unsplash.com/photo-1576243345690-4e4b79b63288?w=400&q=80",
  "33": "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400&q=80",
  "34": "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400&q=80",
  "35": "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400&q=80",
  "36": "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400&q=80",
  "37": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80",
  "38": "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400&q=80",
  "39": "https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=400&q=80",
  "40": "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400&q=80",
  "41": "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&q=80",
  "42": "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400&q=80",
  "43": "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&q=80",
  "44": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&q=80",
  "45": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&q=80",
  "46": "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=400&q=80",
  "47": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
  "48": "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&q=80",
  "49": "https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=400&q=80",
  "50": "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=400&q=80",
};

/** Page/experience ids → thumbnail (for page-site-home, page-exp-landing-default, etc.) */
const THUMBNAILS_BY_PAGE_ID: Record<string, string> = {
  "page-site-home": "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&q=80",
  "page-site-about": "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&q=80",
  "page-site-contact": "https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=400&q=80",
  "page-site-blog": "https://images.unsplash.com/photo-1499750310107-5fef28a19043?w=400&q=80",
  "page-site-products": "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&q=80",
  "page-site-product-a": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80",
  "page-exp-landing-default": "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=400&q=80",
  "page-site-blog-post-1": "https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=400&q=80",
  "page-site-blog-post-2": "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80",
  "page-site-blog-post-3": "https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=400&q=80",
  "page-site-blog-post-4": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80",
  "page-activities": "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=400&q=80",
  "page-community": "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&q=80",
  "page-challenges": "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&q=80",
  "page-pricing": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&q=80",
  "page-stories": "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&q=80",
  "page-product-31": "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=400&q=80",
  "page-product-32": "https://images.unsplash.com/photo-1576243345690-4e4b79b63288?w=400&q=80",
  "page-product-33": "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400&q=80",
  "page-product-34": "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400&q=80",
  "page-product-35": "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400&q=80",
  "page-product-36": "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400&q=80",
};

/**
 * Returns a stock image URL for the given content, or null to show type icon instead.
 * Resolution order: id (page id or numeric id) → name (normalized) → baseType fallback.
 * Always returns a URL so every content type has an accurate representation.
 */
export function getThumbnailForContent(content: ContentThumbnailInput): string {
  const byPageId = content.id.startsWith("page-") ? THUMBNAILS_BY_PAGE_ID[content.id] : undefined;
  if (byPageId) return byPageId;

  const byId = THUMBNAILS_BY_ID[content.id];
  if (byId) return byId;

  const key = normalizeName(content.name);
  const byName = THUMBNAILS_BY_NAME[key];
  if (byName) return byName;

  return THUMBNAILS_BY_TYPE[content.baseType];
}
