import type { FaceBox } from "../people/types";

export type DetectedPerson = {
	id: string;
	displayName: string;
	thumbnail?: string;
	isNamed: boolean;
	confidencePct: number;
	linkedAssets: number;
	faceBox: FaceBox;
	suggestedName?: string;
};

export type DetectedObject = {
	id: string;
	label: string;
	confidencePct: number;
	box?: FaceBox;
};

export type AssetDetectionView = {
	assetId: string;
	assetName: string;
	assetType: "JPEG" | "PNG" | "WEBP" | "TIFF" | "MP4";
	dimensions: string;
	lastModified: string;
	heroImage: string;
	detectedPeople: DetectedPerson[];
	detectedObjects: DetectedObject[];
};
