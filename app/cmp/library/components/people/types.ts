export type FaceBox = {
	top: number;
	left: number;
	width: number;
	height: number;
};

export type DetectionConfidence = "high" | "medium" | "low";

export type RecognitionStatus =
	| "named"
	| "unnamed"
	| "folder"
	| "raw"
	| "group";

export type PersonItem = {
	id: string;
	name: string;
	image?: string;
	faceBoxes: FaceBox[];
	appearsInAssets: number;
	primaryAssetTitle: string;
	status: RecognitionStatus;
	confidence?: DetectionConfidence;
	confidencePct?: number;
	tags: string[];
};
