import type { BrandAsset, BrandPack, BrandTemplate, ToneOfVoice } from "./types";

export function getBrandTemplates(pack: BrandPack): BrandTemplate[] {
	return pack.templates;
}

export function getLogoAssets(pack: BrandPack): BrandAsset[] {
	return pack.assets.filter((asset) => asset.type === "logo");
}

export function getToneOfVoice(pack: BrandPack): ToneOfVoice {
	return pack.tone_of_voice ?? {
		brand_name_rules: null,
		formality: "Professional but conversational",
		key_traits: pack.toneKeywords,
		person: "Second person where possible",
		preferred_terms: [],
		recurring_language: [],
		summary: pack.toneKeywords.length > 0
			? `${pack.name} sounds ${pack.toneKeywords.join(", ").toLowerCase()}.`
			: `${pack.name} uses a clear, consistent brand voice.`,
		what_to_avoid: [],
	};
}
