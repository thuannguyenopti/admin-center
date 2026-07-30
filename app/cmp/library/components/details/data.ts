import type { AssetDetectionView } from "./types";

export const mockAssetDetail: AssetDetectionView = {
	assetId: "a-turtles",
	assetName: "The_majestic_world_of_turtles.jpg",
	assetType: "JPEG",
	dimensions: "1920 × 1080",
	lastModified: "Oct 26, 2025",
	heroImage:
		"https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=1600&q=80",
	detectedPeople: [
		{
			id: "dp-1",
			displayName: "Swimmer #01",
			isNamed: false,
			suggestedName: "Marcus Okoro",
			confidencePct: 98,
			linkedAssets: 5,
			faceBox: { top: 22, left: 38, width: 26, height: 32 },
		},
		{
			id: "dp-2",
			displayName: "Spectator (Unidentified)",
			isNamed: false,
			confidencePct: 75,
			linkedAssets: 0,
			faceBox: { top: 12, left: 64, width: 14, height: 18 },
		},
	],
	detectedObjects: [
		{ id: "obj-1", label: "Swim cap", confidencePct: 94, box: { top: 38, left: 48, width: 8, height: 8 } },
		{ id: "obj-2", label: "Pool", confidencePct: 99 },
		{ id: "obj-3", label: "Goggles", confidencePct: 88, box: { top: 44, left: 49, width: 5, height: 4 } },
	],
};
