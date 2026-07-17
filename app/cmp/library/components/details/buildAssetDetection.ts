import type { AssetDetectionView } from "./types";
import type { FaceBox, PersonItem } from "../people/types";

const objectSets = [
	[
		{ id: "obj-bike", label: "Road bike", confidencePct: 98, box: { top: 58, left: 14, width: 60, height: 28 } },
		{ id: "obj-helmet", label: "Helmet", confidencePct: 94, box: { top: 18, left: 37, width: 10, height: 10 } },
		{ id: "obj-kit", label: "Team kit", confidencePct: 89 },
	],
	[
		{ id: "obj-lane", label: "Pool lane", confidencePct: 99 },
		{ id: "obj-goggles", label: "Goggles", confidencePct: 91, box: { top: 43, left: 47, width: 8, height: 5 } },
		{ id: "obj-swim", label: "Open water", confidencePct: 84 },
	],
	[
		{ id: "obj-medal", label: "Medal", confidencePct: 88, box: { top: 42, left: 45, width: 8, height: 12 } },
		{ id: "obj-finish", label: "Finish line", confidencePct: 92 },
		{ id: "obj-sponsor", label: "Sponsor board", confidencePct: 80 },
	],
];

const fallbackBoxes: FaceBox[] = [
	{ top: 24, left: 42, width: 14, height: 18 },
	{ top: 18, left: 55, width: 10, height: 13 },
	{ top: 31, left: 24, width: 12, height: 16 },
];

type BuildAssetDetectionOptions = {
	assetId: string;
	image: string;
	title: string;
	date: string;
	person: PersonItem;
	index: number;
};

export function buildAssetDetection({
	assetId,
	image,
	title,
	date,
	person,
	index,
}: BuildAssetDetectionOptions): AssetDetectionView {
	const primaryBox = person.faceBoxes[0] ?? fallbackBoxes[index % fallbackBoxes.length];
	const secondaryBox = fallbackBoxes[(index + 1) % fallbackBoxes.length];
	const isConfident = index % 4 !== 1;
	const hasSecondaryFace = index % 6 === 0 || index % 6 === 4;
	const detectedPeople: AssetDetectionView["detectedPeople"] = [
		{
			id: `${assetId}-primary`,
			displayName: person.name,
			isNamed: isConfident,
			suggestedName: isConfident ? undefined : person.name,
			confidencePct: isConfident ? Math.max(person.confidencePct ?? 92, 91) : 78,
			linkedAssets: person.appearsInAssets,
			faceBox: primaryBox,
		},
	];

	if (hasSecondaryFace) {
		detectedPeople.push({
			id: `${assetId}-unknown`,
			displayName: "Unidentified spectator",
			isNamed: false,
			suggestedName: index % 2 === 0 ? "Marcus Okoro" : undefined,
			confidencePct: index % 2 === 0 ? 87 : 63,
			linkedAssets: index % 2 === 0 ? 4 : 0,
			faceBox: secondaryBox,
		});
	}

	return {
		assetId,
		assetName: title,
		assetType: "JPEG",
		dimensions: index % 3 === 0 ? "1920 × 1080" : "2400 × 1600",
		lastModified: date,
		heroImage: image,
		detectedPeople,
		detectedObjects: objectSets[index % objectSets.length],
	};
}
