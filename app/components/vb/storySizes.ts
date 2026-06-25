/**
 * Natural (unscaled) pixel dimensions for each content type's Storybook story.
 * Used to compute the correct scale factor for iframe thumbnails in tiles.
 * Add or adjust entries here as stories change.
 *
 * Variant keys (e.g. "ct-hero-centered") take precedence over base keys ("ct-hero").
 * `getStorySize` handles the fallback automatically — prefer it over direct lookup.
 */
export const STORY_SIZES: Record<string, {w: number; h: number}> = {
	"ct-button":       {w: 145 + 43, h: 48 + 32},
	"ct-heading":      {w: 286+40, h: 80+78},
	"ct-text":         {w: 480, h: 120},
	"ct-rich-text":    {w: 480, h: 160},
	"ct-image":        {w: 400, h: 300},
	"ct-image-block":  {w: 400, h: 300},
	"ct-hero":         {w: 1200, h: 600},
	"ct-card":         {w: 360, h: 360},
	"ct-nav-item":     {w: 320, h: 48},
	"ct-input":        {w: 320, h: 64},
	"ct-section-header": {w: 480, h: 120},
	"ct-news-item": {w: 880, h: 260},
};

/**
 * Look up a story size, walking up the dash-separated key until a match is found.
 * "ct-hero-centered" → "ct-hero" → undefined
 */
export function getStorySize(key: string | null | undefined): {w: number; h: number} | undefined {
	if (!key) return undefined;
	if (STORY_SIZES[key]) return STORY_SIZES[key];
	const parts = key.split("-");
	for (let i = parts.length - 1; i >= 2; i--) {
		const prefix = parts.slice(0, i).join("-");
		if (STORY_SIZES[prefix]) return STORY_SIZES[prefix];
	}
	return undefined;
}
