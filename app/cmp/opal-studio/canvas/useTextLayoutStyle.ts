import { useMemo } from "react";
import type { BrandPack, RatioOption, TextLayoutOption } from "./config";

type RatioKey = "16:9" | "4:5" | "1:1" | "9:16";

const ratioMap = {
	"Hero left": {
		"16:9":  { headlineSize: 56, maxWidth: "46%", subheadlineSize: 14, headlineLetterSpacing: -1.5, subheadlineLetterSpacing: 2.5, pad: 36 },
		"4:5":   { headlineSize: 72, maxWidth: "54%", subheadlineSize: 15, headlineLetterSpacing: -2,   subheadlineLetterSpacing: 3,   pad: 40 },
		"1:1":   { headlineSize: 64, maxWidth: "52%", subheadlineSize: 15, headlineLetterSpacing: -2,   subheadlineLetterSpacing: 3,   pad: 38 },
		"9:16":  { headlineSize: 60, maxWidth: "80%", subheadlineSize: 14, headlineLetterSpacing: -1.5, subheadlineLetterSpacing: 2.5, pad: 32 },
	},
	"Tall stack": {
		"16:9":  { headlineSize: 60, maxWidth: "42%", subheadlineSize: 14, headlineLetterSpacing: -2,   subheadlineLetterSpacing: 3,   pad: 36 },
		"4:5":   { headlineSize: 80, maxWidth: "50%", subheadlineSize: 16, headlineLetterSpacing: -2.5, subheadlineLetterSpacing: 3,   pad: 40 },
		"1:1":   { headlineSize: 72, maxWidth: "48%", subheadlineSize: 15, headlineLetterSpacing: -2.5, subheadlineLetterSpacing: 3,   pad: 38 },
		"9:16":  { headlineSize: 68, maxWidth: "82%", subheadlineSize: 14, headlineLetterSpacing: -2,   subheadlineLetterSpacing: 2.5, pad: 32 },
	},
	"Bottom left": {
		"16:9":  { headlineSize: 48, maxWidth: "48%", subheadlineSize: 13, headlineLetterSpacing: -1,   subheadlineLetterSpacing: 2.5, pad: 36 },
		"4:5":   { headlineSize: 64, maxWidth: "58%", subheadlineSize: 15, headlineLetterSpacing: -1.5, subheadlineLetterSpacing: 2.5, pad: 40 },
		"1:1":   { headlineSize: 56, maxWidth: "56%", subheadlineSize: 14, headlineLetterSpacing: -1.5, subheadlineLetterSpacing: 2.5, pad: 38 },
		"9:16":  { headlineSize: 52, maxWidth: "82%", subheadlineSize: 13, headlineLetterSpacing: -1,   subheadlineLetterSpacing: 2,   pad: 32 },
	},
	"Centered": {
		"16:9":  { headlineSize: 54, maxWidth: "60%", subheadlineSize: 14, headlineLetterSpacing: -1.5, subheadlineLetterSpacing: 4,   pad: 0 },
		"4:5":   { headlineSize: 72, maxWidth: "64%", subheadlineSize: 15, headlineLetterSpacing: -2,   subheadlineLetterSpacing: 4,   pad: 0 },
		"1:1":   { headlineSize: 64, maxWidth: "62%", subheadlineSize: 15, headlineLetterSpacing: -2,   subheadlineLetterSpacing: 4,   pad: 0 },
		"9:16":  { headlineSize: 60, maxWidth: "80%", subheadlineSize: 14, headlineLetterSpacing: -1.5, subheadlineLetterSpacing: 3.5, pad: 0 },
	},
	"Impact": {
		"16:9":  { headlineSize: 80,  maxWidth: "78%", subheadlineSize: 15, headlineLetterSpacing: -3,   subheadlineLetterSpacing: 6,   pad: 0 },
		"4:5":   { headlineSize: 100, maxWidth: "82%", subheadlineSize: 16, headlineLetterSpacing: -4,   subheadlineLetterSpacing: 6,   pad: 0 },
		"1:1":   { headlineSize: 88,  maxWidth: "80%", subheadlineSize: 16, headlineLetterSpacing: -3.5, subheadlineLetterSpacing: 6,   pad: 0 },
		"9:16":  { headlineSize: 76,  maxWidth: "92%", subheadlineSize: 14, headlineLetterSpacing: -3,   subheadlineLetterSpacing: 5,   pad: 0 },
	},
	"Editorial": {
		"16:9":  { headlineSize: 64, maxWidth: "50%", subheadlineSize: 13, headlineLetterSpacing: -2.5, subheadlineLetterSpacing: 5,   pad: 36 },
		"4:5":   { headlineSize: 84, maxWidth: "62%", subheadlineSize: 14, headlineLetterSpacing: -3,   subheadlineLetterSpacing: 5,   pad: 40 },
		"1:1":   { headlineSize: 72, maxWidth: "58%", subheadlineSize: 14, headlineLetterSpacing: -2.5, subheadlineLetterSpacing: 5,   pad: 38 },
		"9:16":  { headlineSize: 68, maxWidth: "80%", subheadlineSize: 13, headlineLetterSpacing: -2,   subheadlineLetterSpacing: 4,   pad: 32 },
	},
} as const;

export function useTextLayoutStyle(
	aspectRatio: RatioOption,
	brandPack: BrandPack,
	textLayoutPreset: TextLayoutOption,
) {
	const r = (aspectRatio === "Auto" ? "16:9" : aspectRatio) as RatioKey;
	const textOverlayColor = brandPack === "Tour de France" ? "var(--ax-colors-fg-default)" : "var(--ax-colors-fg-default-inverse)";
	const textShadow = brandPack === "Tour de France"
		? "0 2px 10px rgba(255,255,255,0.32)"
		: "0 6px 32px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3)";

	return useMemo(() => {
		const base = {
			position: "absolute" as const,
			color: textOverlayColor,
			textShadow,
			textTransform: "uppercase" as const,
		};

		const v = ratioMap[textLayoutPreset][r];

		switch (textLayoutPreset) {
			case "Tall stack":
				return {
					...base,
					left: v.pad, top: v.pad, maxWidth: v.maxWidth,
					headlineSize: v.headlineSize, headlineWeight: 900, headlineLetterSpacing: v.headlineLetterSpacing,
					subheadlineSize: v.subheadlineSize, subheadlineWeight: 600, subheadlineLetterSpacing: v.subheadlineLetterSpacing,
					headlineLineHeight: 0.88, subheadlineMarginTop: 20,
					alignItems: "flex-start" as const, textAlign: "left" as const,
				};
			case "Bottom left":
				return {
					...base,
					left: v.pad, bottom: v.pad, maxWidth: v.maxWidth,
					headlineSize: v.headlineSize, headlineWeight: 900, headlineLetterSpacing: v.headlineLetterSpacing,
					subheadlineSize: v.subheadlineSize, subheadlineWeight: 500, subheadlineLetterSpacing: v.subheadlineLetterSpacing,
					headlineLineHeight: 0.92, subheadlineMarginTop: 14,
					alignItems: "flex-start" as const, textAlign: "left" as const,
				};
			case "Centered":
				return {
					...base,
					left: "50%", top: "50%", transform: "translate(-50%, -50%)", maxWidth: v.maxWidth,
					headlineSize: v.headlineSize, headlineWeight: 900, headlineLetterSpacing: v.headlineLetterSpacing,
					subheadlineSize: v.subheadlineSize, subheadlineWeight: 500, subheadlineLetterSpacing: v.subheadlineLetterSpacing,
					headlineLineHeight: 0.90, subheadlineMarginTop: 18,
					alignItems: "center" as const, textAlign: "center" as const,
				};
			case "Impact":
				return {
					...base,
					left: "50%", top: "50%", transform: "translate(-50%, -50%)", maxWidth: v.maxWidth,
					headlineSize: v.headlineSize, headlineWeight: 900, headlineLetterSpacing: v.headlineLetterSpacing,
					subheadlineSize: v.subheadlineSize, subheadlineWeight: 600, subheadlineLetterSpacing: v.subheadlineLetterSpacing,
					headlineLineHeight: 0.85, subheadlineMarginTop: 24,
					alignItems: "center" as const, textAlign: "center" as const,
				};
			case "Editorial":
				return {
					...base,
					right: v.pad, bottom: v.pad + 8, left: undefined, maxWidth: v.maxWidth,
					headlineSize: v.headlineSize, headlineWeight: 900, headlineLetterSpacing: v.headlineLetterSpacing,
					subheadlineSize: v.subheadlineSize, subheadlineWeight: 400, subheadlineLetterSpacing: v.subheadlineLetterSpacing,
					headlineLineHeight: 0.86, subheadlineMarginTop: 20,
					alignItems: "flex-end" as const, textAlign: "right" as const,
				};
			case "Hero left":
			default:
				return {
					...base,
					left: v.pad, top: v.pad, maxWidth: v.maxWidth,
					headlineSize: v.headlineSize, headlineWeight: 900, headlineLetterSpacing: v.headlineLetterSpacing,
					subheadlineSize: v.subheadlineSize, subheadlineWeight: 500, subheadlineLetterSpacing: v.subheadlineLetterSpacing,
					headlineLineHeight: 0.90, subheadlineMarginTop: 16,
					alignItems: "flex-start" as const, textAlign: "left" as const,
				};
		}
	}, [r, textOverlayColor, textShadow, textLayoutPreset]);
}
