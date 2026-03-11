/**
 * Stock image URLs for content manager thumbnails.
 * Maps content by id, then by name, then fallback by baseType.
 * Uses Pexels and Pixabay (free to use with attribution).
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
  homepage: "https://images.pexels.com/photos/100582/pexels-photo-100582.jpeg?auto=compress&cs=tinysrgb&w=400",
  "about us": "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400",
  contact: "https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg?auto=compress&cs=tinysrgb&w=400",
  blog: "https://images.pexels.com/photos/34600/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=400",
  products: "https://images.pexels.com/photos/276517/pexels-photo-276517.jpeg?auto=compress&cs=tinysrgb&w=400",
  "product a": "https://images.pexels.com/photos/38296/cycling-bicycle-riding-sport-38296.jpeg?auto=compress&cs=tinysrgb&w=400",
  "default landing": "https://images.pexels.com/photos/111688/pexels-photo-111688.jpeg?auto=compress&cs=tinysrgb&w=400",
  "5 tips for your first marathon": "https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=400",
  "intervals for beginners": "https://images.pexels.com/photos/7247408/pexels-photo-7247408.jpeg?auto=compress&cs=tinysrgb&w=400",
  "race day checklist": "https://images.pexels.com/photos/2524739/pexels-photo-2524739.jpeg?auto=compress&cs=tinysrgb&w=400",
  "how to choose running shoes": "https://images.pexels.com/photos/1478442/pexels-photo-1478442.jpeg?auto=compress&cs=tinysrgb&w=400",
  activities: "https://images.pexels.com/photos/6253519/pexels-photo-6253519.jpeg?auto=compress&cs=tinysrgb&w=400",
  community: "https://images.pexels.com/photos/2294361/pexels-photo-2294361.jpeg?auto=compress&cs=tinysrgb&w=400",
  challenges: "https://images.pexels.com/photos/2402235/pexels-photo-2402235.jpeg?auto=compress&cs=tinysrgb&w=400",
  pricing: "https://images.pexels.com/photos/164501/pexels-photo-164501.jpeg?auto=compress&cs=tinysrgb&w=400",
  stories: "https://images.pexels.com/photos/6253476/pexels-photo-6253476.jpeg?auto=compress&cs=tinysrgb&w=400",
  "cycle computer pro": "https://images.pexels.com/photos/3846249/pexels-photo-3846249.jpeg?auto=compress&cs=tinysrgb&w=400",
  "hr monitor band": "https://images.pexels.com/photos/4498362/pexels-photo-4498362.jpeg?auto=compress&cs=tinysrgb&w=400",
  "smart bike trainer": "https://images.pexels.com/photos/6253511/pexels-photo-6253511.jpeg?auto=compress&cs=tinysrgb&w=400",
  "cadence sensor": "https://images.pexels.com/photos/5807903/pexels-photo-5807903.jpeg?auto=compress&cs=tinysrgb&w=400",
  "power meter": "https://images.pexels.com/photos/7247408/pexels-photo-7247408.jpeg?auto=compress&cs=tinysrgb&w=400",
  "speed sensor": "https://images.pexels.com/photos/38296/cycling-bicycle-riding-sport-38296.jpeg?auto=compress&cs=tinysrgb&w=400",
  "aero helmet": "https://images.pexels.com/photos/6253530/pexels-photo-6253530.jpeg?auto=compress&cs=tinysrgb&w=400",
  "bike lights": "https://images.pexels.com/photos/248547/pexels-photo-248547.jpeg?auto=compress&cs=tinysrgb&w=400",
  "water bottle holder": "https://images.pexels.com/photos/6253522/pexels-photo-6253522.jpeg?auto=compress&cs=tinysrgb&w=400",
  "repair tool kit": "https://images.pexels.com/photos/4481258/pexels-photo-4481258.jpeg?auto=compress&cs=tinysrgb&w=400",
  // Other content (Products, Blocks, Media)
  "heart rate monitor - product": "https://images.pexels.com/photos/4498362/pexels-photo-4498362.jpeg?auto=compress&cs=tinysrgb&w=400",
  "pricing block": "https://images.pexels.com/photos/164501/pexels-photo-164501.jpeg?auto=compress&cs=tinysrgb&w=400",
  "cycling hero - image": "https://images.pexels.com/photos/100582/pexels-photo-100582.jpeg?auto=compress&cs=tinysrgb&w=400",
  "route planning block": "https://images.pexels.com/photos/1647962/pexels-photo-1647962.jpeg?auto=compress&cs=tinysrgb&w=400",
  "leaderboards block": "https://images.pexels.com/photos/6253476/pexels-photo-6253476.jpeg?auto=compress&cs=tinysrgb&w=400",
  "cycle computer pro - product": "https://images.pexels.com/photos/3846249/pexels-photo-3846249.jpeg?auto=compress&cs=tinysrgb&w=400",
  "hr monitor band - product": "https://images.pexels.com/photos/4498362/pexels-photo-4498362.jpeg?auto=compress&cs=tinysrgb&w=400",
  "smart bike trainer - product": "https://images.pexels.com/photos/6253511/pexels-photo-6253511.jpeg?auto=compress&cs=tinysrgb&w=400",
  "cadence sensor - product": "https://images.pexels.com/photos/5807903/pexels-photo-5807903.jpeg?auto=compress&cs=tinysrgb&w=400",
  "power meter - product": "https://images.pexels.com/photos/7247408/pexels-photo-7247408.jpeg?auto=compress&cs=tinysrgb&w=400",
  "speed sensor - product": "https://images.pexels.com/photos/38296/cycling-bicycle-riding-sport-38296.jpeg?auto=compress&cs=tinysrgb&w=400",
  "aero helmet - product": "https://images.pexels.com/photos/6253530/pexels-photo-6253530.jpeg?auto=compress&cs=tinysrgb&w=400",
  "bike lights - product": "https://images.pexels.com/photos/248547/pexels-photo-248547.jpeg?auto=compress&cs=tinysrgb&w=400",
  "water bottle holder - product": "https://images.pexels.com/photos/6253522/pexels-photo-6253522.jpeg?auto=compress&cs=tinysrgb&w=400",
  "repair tool kit - product": "https://images.pexels.com/photos/4481258/pexels-photo-4481258.jpeg?auto=compress&cs=tinysrgb&w=400",
  "weekly challenge block": "https://images.pexels.com/photos/2402235/pexels-photo-2402235.jpeg?auto=compress&cs=tinysrgb&w=400",
  "achievement block": "https://images.pexels.com/photos/2434250/pexels-photo-2434250.jpeg?auto=compress&cs=tinysrgb&w=400",
  "social feed block": "https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg?auto=compress&cs=tinysrgb&w=400",
  "leaderboard widget block": "https://images.pexels.com/photos/270348/pexels-photo-270348.jpeg?auto=compress&cs=tinysrgb&w=400",
  "stats summary block": "https://images.pexels.com/photos/669610/pexels-photo-669610.jpeg?auto=compress&cs=tinysrgb&w=400",
  "upcoming events block": "https://images.pexels.com/photos/1020323/pexels-photo-1020323.jpeg?auto=compress&cs=tinysrgb&w=400",
  "testimonial carousel block": "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=400",
  "payment plans block": "https://images.pexels.com/photos/4968391/pexels-photo-4968391.jpeg?auto=compress&cs=tinysrgb&w=400",
  "mountain pass scenery - image": "https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=400",
  "pro cyclist in action - image": "https://images.pexels.com/photos/6253476/pexels-photo-6253476.jpeg?auto=compress&cs=tinysrgb&w=400",
};

/** Fallback thumbnails by baseType when no name match */
const THUMBNAILS_BY_TYPE: Record<ContentBaseType, string> = {
  Page: "https://images.pexels.com/photos/276514/pexels-photo-276514.jpeg?auto=compress&cs=tinysrgb&w=400",
  Experience: "https://images.pexels.com/photos/100582/pexels-photo-100582.jpeg?auto=compress&cs=tinysrgb&w=400",
  Media: "https://images.pexels.com/photos/1496192/pexels-photo-1496192.jpeg?auto=compress&cs=tinysrgb&w=400",
  Product: "https://images.pexels.com/photos/276517/pexels-photo-276517.jpeg?auto=compress&cs=tinysrgb&w=400",
  Block: "https://images.pexels.com/photos/270348/pexels-photo-270348.jpeg?auto=compress&cs=tinysrgb&w=400",
};

/** Legacy id-based map (for backward compatibility with existing content ids) */
const THUMBNAILS_BY_ID: Record<string, string> = {
  "1": "https://images.pexels.com/photos/100582/pexels-photo-100582.jpeg?auto=compress&cs=tinysrgb&w=400",
  "2": "https://images.pexels.com/photos/7247408/pexels-photo-7247408.jpeg?auto=compress&cs=tinysrgb&w=400",
  "3": "https://images.pexels.com/photos/4498362/pexels-photo-4498362.jpeg?auto=compress&cs=tinysrgb&w=400",
  "4": "https://images.pexels.com/photos/4531875/pexels-photo-4531875.jpeg?auto=compress&cs=tinysrgb&w=400",
  "5": "https://images.pexels.com/photos/164501/pexels-photo-164501.jpeg?auto=compress&cs=tinysrgb&w=400",
  "6": "https://images.pexels.com/photos/4968391/pexels-photo-4968391.jpeg?auto=compress&cs=tinysrgb&w=400",
  "7": "https://images.pexels.com/photos/13870890/pexels-photo-13870890.jpeg?auto=compress&cs=tinysrgb&w=400",
  "8": "https://images.pexels.com/photos/2402235/pexels-photo-2402235.jpeg?auto=compress&cs=tinysrgb&w=400",
  "9": "https://images.pexels.com/photos/100582/pexels-photo-100582.jpeg?auto=compress&cs=tinysrgb&w=400",
  "10": "https://images.pexels.com/photos/8867207/pexels-photo-8867207.jpeg?auto=compress&cs=tinysrgb&w=400",
  "11": "https://images.pexels.com/photos/1647962/pexels-photo-1647962.jpeg?auto=compress&cs=tinysrgb&w=400",
  "12": "https://images.pexels.com/photos/7247408/pexels-photo-7247408.jpeg?auto=compress&cs=tinysrgb&w=400",
  "13": "https://images.pexels.com/photos/1647962/pexels-photo-1647962.jpeg?auto=compress&cs=tinysrgb&w=400",
  "14": "https://images.pexels.com/photos/270348/pexels-photo-270348.jpeg?auto=compress&cs=tinysrgb&w=400",
  "15": "https://images.pexels.com/photos/5807903/pexels-photo-5807903.jpeg?auto=compress&cs=tinysrgb&w=400",
  "16": "https://images.pexels.com/photos/111688/pexels-photo-111688.jpeg?auto=compress&cs=tinysrgb&w=400",
  "17": "https://images.pexels.com/photos/4498478/pexels-photo-4498478.jpeg?auto=compress&cs=tinysrgb&w=400",
  "18": "https://images.pexels.com/photos/5383605/pexels-photo-5383605.jpeg?auto=compress&cs=tinysrgb&w=400",
  "19": "https://images.pexels.com/photos/100582/pexels-photo-100582.jpeg?auto=compress&cs=tinysrgb&w=400",
  "20": "https://images.pexels.com/photos/164501/pexels-photo-164501.jpeg?auto=compress&cs=tinysrgb&w=400",
  "26": "https://images.pexels.com/photos/6253476/pexels-photo-6253476.jpeg?auto=compress&cs=tinysrgb&w=400",
  "31": "https://images.pexels.com/photos/3846249/pexels-photo-3846249.jpeg?auto=compress&cs=tinysrgb&w=400",
  "32": "https://images.pexels.com/photos/4498362/pexels-photo-4498362.jpeg?auto=compress&cs=tinysrgb&w=400",
  "33": "https://images.pexels.com/photos/6253511/pexels-photo-6253511.jpeg?auto=compress&cs=tinysrgb&w=400",
  "34": "https://images.pexels.com/photos/5807903/pexels-photo-5807903.jpeg?auto=compress&cs=tinysrgb&w=400",
  "35": "https://images.pexels.com/photos/7247408/pexels-photo-7247408.jpeg?auto=compress&cs=tinysrgb&w=400",
  "36": "https://images.pexels.com/photos/38296/cycling-bicycle-riding-sport-38296.jpeg?auto=compress&cs=tinysrgb&w=400",
  "37": "https://images.pexels.com/photos/6253530/pexels-photo-6253530.jpeg?auto=compress&cs=tinysrgb&w=400",
  "38": "https://images.pexels.com/photos/248547/pexels-photo-248547.jpeg?auto=compress&cs=tinysrgb&w=400",
  "39": "https://images.pexels.com/photos/6253522/pexels-photo-6253522.jpeg?auto=compress&cs=tinysrgb&w=400",
  "40": "https://images.pexels.com/photos/4481258/pexels-photo-4481258.jpeg?auto=compress&cs=tinysrgb&w=400",
  "41": "https://images.pexels.com/photos/2402235/pexels-photo-2402235.jpeg?auto=compress&cs=tinysrgb&w=400",
  "42": "https://images.pexels.com/photos/2434250/pexels-photo-2434250.jpeg?auto=compress&cs=tinysrgb&w=400",
  "43": "https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg?auto=compress&cs=tinysrgb&w=400",
  "44": "https://images.pexels.com/photos/270348/pexels-photo-270348.jpeg?auto=compress&cs=tinysrgb&w=400",
  "45": "https://images.pexels.com/photos/669610/pexels-photo-669610.jpeg?auto=compress&cs=tinysrgb&w=400",
  "46": "https://images.pexels.com/photos/1020323/pexels-photo-1020323.jpeg?auto=compress&cs=tinysrgb&w=400",
  "47": "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=400",
  "48": "https://images.pexels.com/photos/4968391/pexels-photo-4968391.jpeg?auto=compress&cs=tinysrgb&w=400",
  "49": "https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=400",
  "50": "https://images.pexels.com/photos/6253476/pexels-photo-6253476.jpeg?auto=compress&cs=tinysrgb&w=400",
};

/** Page/experience ids → thumbnail (for page-site-home, page-exp-landing-default, etc.) */
const THUMBNAILS_BY_PAGE_ID: Record<string, string> = {
  "page-site-home": "https://images.pexels.com/photos/100582/pexels-photo-100582.jpeg?auto=compress&cs=tinysrgb&w=400",
  "page-site-about": "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400",
  "page-site-contact": "https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg?auto=compress&cs=tinysrgb&w=400",
  "page-site-blog": "https://images.pexels.com/photos/34600/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=400",
  "page-site-products": "https://images.pexels.com/photos/276517/pexels-photo-276517.jpeg?auto=compress&cs=tinysrgb&w=400",
  "page-site-product-a": "https://images.pexels.com/photos/38296/cycling-bicycle-riding-sport-38296.jpeg?auto=compress&cs=tinysrgb&w=400",
  "page-exp-landing-default": "https://images.pexels.com/photos/111688/pexels-photo-111688.jpeg?auto=compress&cs=tinysrgb&w=400",
  "page-site-blog-post-1": "https://images.pexels.com/photos/2803158/pexels-photo-2803158.jpeg?auto=compress&cs=tinysrgb&w=400",
  "page-site-blog-post-2": "https://images.pexels.com/photos/7247408/pexels-photo-7247408.jpeg?auto=compress&cs=tinysrgb&w=400",
  "page-site-blog-post-3": "https://images.pexels.com/photos/2524739/pexels-photo-2524739.jpeg?auto=compress&cs=tinysrgb&w=400",
  "page-site-blog-post-4": "https://images.pexels.com/photos/1478442/pexels-photo-1478442.jpeg?auto=compress&cs=tinysrgb&w=400",
  "page-activities": "https://images.pexels.com/photos/6253519/pexels-photo-6253519.jpeg?auto=compress&cs=tinysrgb&w=400",
  "page-community": "https://images.pexels.com/photos/2294361/pexels-photo-2294361.jpeg?auto=compress&cs=tinysrgb&w=400",
  "page-challenges": "https://images.pexels.com/photos/2402235/pexels-photo-2402235.jpeg?auto=compress&cs=tinysrgb&w=400",
  "page-pricing": "https://images.pexels.com/photos/164501/pexels-photo-164501.jpeg?auto=compress&cs=tinysrgb&w=400",
  "page-stories": "https://images.pexels.com/photos/6253476/pexels-photo-6253476.jpeg?auto=compress&cs=tinysrgb&w=400",
  "page-product-31": "https://images.pexels.com/photos/3846249/pexels-photo-3846249.jpeg?auto=compress&cs=tinysrgb&w=400",
  "page-product-32": "https://images.pexels.com/photos/4498362/pexels-photo-4498362.jpeg?auto=compress&cs=tinysrgb&w=400",
  "page-product-33": "https://images.pexels.com/photos/6253511/pexels-photo-6253511.jpeg?auto=compress&cs=tinysrgb&w=400",
  "page-product-34": "https://images.pexels.com/photos/5807903/pexels-photo-5807903.jpeg?auto=compress&cs=tinysrgb&w=400",
  "page-product-35": "https://images.pexels.com/photos/7247408/pexels-photo-7247408.jpeg?auto=compress&cs=tinysrgb&w=400",
  "page-product-36": "https://images.pexels.com/photos/38296/cycling-bicycle-riding-sport-38296.jpeg?auto=compress&cs=tinysrgb&w=400",
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
