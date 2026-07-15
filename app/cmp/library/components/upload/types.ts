import type { OpalFlag, OpalRecommendation } from "@/app/shared/types/opal";

export type UploadStatus = "duplicate" | "similar" | "recognized" | "new";

export type UploadFace = {
	id: string;
	name: string;
	confidencePct: number;
	status: "known" | "unknown";
	image: string;
};

export type UploadObject = {
	id: string;
	label: string;
	confidencePct: number;
};

export type UploadAsset = {
	id: string;
	title: string;
	image: string;
	status: UploadStatus;
	statusLabel: string;
	statusIntent: "warning" | "success" | "primary" | "neutral";
	summary: string;
	tags: string[];
	duplicateOf?: string;
	similarTo?: string;
	faces: UploadFace[];
	objects: UploadObject[];
	/** OPAL brand compliance check — colour palette, logo usage, typography, prohibited elements. */
	brandScore: number;
	brandFlags: OpalFlag[];
	/** OPAL's overall recommendation for this asset before it enters the library. */
	recommendation: OpalRecommendation;
};
