import type {
	BrandAsset,
	BrandColor,
	BrandPack,
	BrandTemplate,
	BrandTypography,
	BrandTypographyRule,
	ToneOfVoice,
} from "./types";

export function getBrandColors(pack: BrandPack): BrandColor[] {
	return pack.colors;
}

export function getBrandTemplates(pack: BrandPack): BrandTemplate[] {
	return pack.template_metadata?.items ?? pack.templates;
}

export function getLogoAssets(pack: BrandPack): BrandAsset[] {
	return pack.asset_buckets?.logos ?? pack.assets.filter((asset) => asset.type === "logo");
}

export function getImageAssets(pack: BrandPack): BrandAsset[] {
	const bucketed = [
		...(pack.asset_buckets?.style_references ?? []),
		...(pack.asset_buckets?.approved_starting_points ?? []),
		...(pack.asset_buckets?.misc ?? []),
	].filter((asset) => asset.type !== "logo");

	return bucketed.length > 0
		? bucketed
		: pack.assets.filter((asset) => asset.type !== "logo");
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

export function getBrandInstructionText(pack: BrandPack): string {
	return pack.brand_instruction?.full_instruction_text ?? pack.brandBrief;
}

export function getBrandTypographySummary(pack: BrandPack): BrandTypography {
	if (pack.typography.heading && pack.typography.body) {
		return pack.typography;
	}

	const rules = getBrandTypographyRules(pack);
	const heading = rules.find((rule) => rule.usage === "heading")?.font_family ?? "Inter";
	const body = rules.find((rule) => rule.usage === "body")?.font_family ?? heading;
	const mono = rules.find((rule) => rule.usage === "mono")?.font_family;

	return { body, heading, mono };
}

export function getBrandTypographyRules(pack: BrandPack): BrandTypographyRule[] {
	if (pack.typographyRules && pack.typographyRules.length > 0) {
		return pack.typographyRules;
	}

	const rules: BrandTypographyRule[] = [
		{
			alignment: "left",
			case_rule: "sentence",
			colour_application: null,
			confidence: "medium",
			font_family: pack.typography.heading,
			notes: "Legacy heading role migrated from the summary typography field.",
			source: "custom",
			usage: "heading",
			weight: "Bold",
		},
		{
			alignment: "left",
			case_rule: "sentence",
			colour_application: null,
			confidence: "medium",
			font_family: pack.typography.body,
			notes: "Legacy body role migrated from the summary typography field.",
			source: "custom",
			usage: "body",
			weight: "Regular",
		},
	];

	if (pack.typography.mono) {
		rules.push({
			alignment: "left",
			case_rule: "as-written",
			colour_application: null,
			confidence: "medium",
			font_family: pack.typography.mono,
			notes: "Legacy mono role migrated from the summary typography field.",
			source: "custom",
			usage: "mono",
			weight: "Regular",
		});
	}

	return rules;
}

export function getPackConfidence(pack: BrandPack) {
	return pack.metadata?.overall_confidence ?? "medium";
}

export function getPackUpdatedAt(pack: BrandPack) {
	return pack.metadata?.created_date ?? pack.updatedAt;
}
