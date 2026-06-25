"use client";

import React, {useEffect} from "react";
import dynamic from "next/dynamic";
import {Box, Text} from "@optiaxiom/react";

const VBPrototype = dynamic(() => import("@/app/components/VBPrototype"), {ssr: false});
import {IconCodeBranch} from "@optimizely/axiom-icons";
import {type DSPhase} from "../useStrideDSState";
import Image from "next/image";
import {initialPages} from "@/app/db/initialData";
import {
	RegistryArtifactCanvas,
	type ArtifactViewerArtifact,
} from "@/app/opal/artifacts/components/ArtifactViewer";

export const STORYBOOK_BASE = "https://stide-mock.vercel.app/storybook";

function getStoryPathFromQuery(storybookPath: string): string {
	const query = storybookPath.split("?")[1] || "";
	const params = new URLSearchParams(query);
	return params.get("path") || "";
}

function toStoryContext(storybookPath: string) {
	const path = getStoryPathFromQuery(storybookPath);
	if (!path) {
		return {
			href: `${STORYBOOK_BASE}${storybookPath}`,
			path: "",
			id: "",
			viewMode: "",
			source: "parent-state",
		};
	}

	if (path.startsWith("/story/")) {
		return {
			href: `${STORYBOOK_BASE}${storybookPath}`,
			path,
			id: path.replace("/story/", ""),
			viewMode: "story",
			source: "parent-state",
		};
	}

	if (path.startsWith("/docs/")) {
		return {
			href: `${STORYBOOK_BASE}${storybookPath}`,
			path,
			id: path.replace("/docs/", ""),
			viewMode: "docs",
			source: "parent-state",
		};
	}

	return {
		href: `${STORYBOOK_BASE}${storybookPath}`,
		path,
		id: "",
		viewMode: "",
		source: "parent-state",
	};
}


type Props = {
	phase: DSPhase;
	storybookPath: string;
	hydrated?: boolean;
	onStoryContextDetected?: (context: {
		href: string;
		path: string;
		id: string;
		viewMode: string;
		source: string;
	}) => void;
	artifact?: ArtifactViewerArtifact | null;
	onUpdateArtifactPreviewText?: (text: string) => void;
	canvasTab?: "registry" | "page";
	onCanvasTabChange?: (tab: "registry" | "page") => void;
	pageArtifactReady?: boolean;
};

function EmptyState({phase}: {phase: DSPhase}) {
	if (phase === "idle" || phase === "thinking" || phase === "proposal") {
		return (
			<Box
				display="flex"
				flexDirection="column"
				alignItems="center"
				justifyContent="center"
				style={{height: "100%", gap: 12}}
				w="full"
			>
				<Box
					style={{
						width: 64,
						height: 64,
						borderRadius: "16px",
						background: "var(--ax-colors-bg-tertiary)",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					<IconCodeBranch size={28} color="var(--ax-colors-fg-quaternary)" />
				</Box>
				<Text
					fontSize="sm"
					fontWeight="500"
					color="fg.tertiary"
					style={{textAlign: "center", maxWidth: 240}}
				>
					Component preview will appear here once setup is complete
				</Text>
				<Box
					style={{
						padding: "6px 10px",
						background: "var(--ax-colors-bg-tertiary)",
						borderRadius: "6px",
						fontFamily: "monospace",
						fontSize: "12px",
						color: "var(--ax-colors-fg-tertiary)",
					}}
				>
					stride-sports/stride-web
				</Box>
			</Box>
		);
	}

	if (phase === "setup-pending" || phase === "setting-up") {
		return (
			<Box
				display="flex"
				flexDirection="column"
				alignItems="center"
				justifyContent="center"
				w="full"
				style={{height: "100%", gap: 16}}
			>
				<Box
					style={{
						width: 64,
						height: 64,
						borderRadius: "50%",
						background: "var(--ax-colors-bg-accent-subtle)",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					<Image
						src="/opal-orb.png"
						alt="Opal"
						width={36}
						height={36}
						style={{animation: "spin 3s linear infinite"}}
					/>
				</Box>
				<Text
					fontSize="sm"
					fontWeight="500"
					color="fg.default"
					style={{textAlign: "center"}}
				>
					Analyzing components!
				</Text>
				<Text fontSize="xs" color="fg.tertiary" style={{textAlign: "center"}}>
					This will only take a moment
				</Text>
			</Box>
		);
	}

	return null;
}

export function CanvasPanel({
	phase,
	storybookPath,
	hydrated = true,
	onStoryContextDetected,
	artifact,
	onUpdateArtifactPreviewText,
	canvasTab = "registry",
	onCanvasTabChange,
	pageArtifactReady = false,
}: Props) {
	const homePage = initialPages.find((p) => p.id === "page-site-home");

	useEffect(() => {
		if (!onStoryContextDetected) return;
		onStoryContextDetected(toStoryContext(storybookPath));
	}, [storybookPath, onStoryContextDetected]);


	const tabPillStyle = (active: boolean): React.CSSProperties => ({
		padding: "3px 10px",
		borderRadius: 4,
		border: "none",
		fontSize: 12,
		fontWeight: active ? 600 : 400,
		cursor: "pointer",
		background: active ? "var(--ax-colors-bg-default)" : "transparent",
		color: active ? "var(--ax-colors-fg-default)" : "var(--ax-colors-fg-secondary)",
		boxShadow: active ? "0 1px 2px rgba(0,0,0,0.08)" : "none",
		transition: "all 0.1s",
	});

	return (
		<Box
			display="flex"
			flexDirection="column"
			style={{height: "100%", background: "var(--ax-colors-bg-page)"}}
		>
			{/* Unified toolbar */}
			<Box
				display="flex"
				alignItems="center"
				gap="8"
				px="12"
				style={{
					height: 52,
					borderBottom: "1px solid var(--ax-colors-border-default)",
					flexShrink: 0,
				}}
			>
				{pageArtifactReady ? (
					<Box
						display="flex"
						alignItems="center"
						style={{
							padding: "2px",
							background: "var(--ax-colors-bg-tertiary)",
							borderRadius: 6,
						}}
					>
						<button style={tabPillStyle(canvasTab === "registry")} onClick={() => onCanvasTabChange?.("registry")}>
							Registry
						</button>
						<button style={tabPillStyle(canvasTab === "page")} onClick={() => onCanvasTabChange?.("page")}>
							Landing Page
						</button>
					</Box>
				) : (
					<Text fontSize="sm" fontWeight="500" color="fg.secondary">
						Preview
					</Text>
				)}
			</Box>

			{/* Content — page tab */}
			{canvasTab === "page" && (
				<Box style={{flex: 1, overflow: "hidden"}}>
					<VBPrototype
						initialData={homePage?.data}
						pageName={homePage?.name}
						pageId={homePage?.id}
						pageStatus={homePage?.status}
						variations={homePage?.variations}
					/>
				</Box>
			)}

			{/* Content — registry tab */}
			{canvasTab === "registry" && (
				<Box style={{flex: 1, display: "flex", overflow: "hidden", position: "relative"}}>
					{artifact ? (
						<Box
							style={{
								flex: 1,
								display: "flex",
								flexDirection: "column",
								overflow: "hidden",
								padding: 12,
							}}
						>
							<RegistryArtifactCanvas
								artifact={artifact}
								onUpdatePreviewText={onUpdateArtifactPreviewText}
							/>
						</Box>
					) : (
						<EmptyState phase={!hydrated ? "setting-up" : phase} />
					)}
				</Box>
			)}
		</Box>
	);
}
