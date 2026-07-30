"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLayout } from "@/app/context/LayoutContext";
import { Badge, Box, Button, Heading, Input, Text } from "@optiaxiom/react";
import {
	IconArrowLeft,
	IconArrowsLeftRight,
	IconCheck,
	IconEllipsisStrokeVertical,
	IconLink,
	IconPen,
	IconSparkles,
	IconStar,
	IconTrashCan,
	IconUserGroup,
	IconUserSlash,
} from "@optimizely/axiom-icons";
import { FaceBoundingBox } from "../../components/people/FaceBoundingBox";
import { peopleItems } from "../../components/people/data";
import { RelatedMediaRail } from "../../components/people/RelatedMediaRail";
import { ReviewMatchesPanel } from "../../components/people/ReviewMatchesPanel";
import { AiBanner, AiBannerOrb } from "../../components/AiBanner";
import { AssetDetailsPanel } from "../../components/details/AssetDetailsPanel";
import { buildAssetDetection } from "../../components/details/buildAssetDetection";

// Mixed local sport photos used as the "12 assets featuring [person]" gallery.
// Cycled deterministically so each profile page renders a stable set.
const RELATED_ASSET_IMAGES = [
	"/people/action-peloton-1.jpg",
	"/people/action-tri-road-m.jpg",
	"/people/action-swim-m.jpg",
	"/people/action-fitness-f.jpg",
	"/people/action-yoga-f.jpg",
	"/people/portrait-m-gym.jpg",
	"/people/object-bike-fixie.jpg",
	"/people/object-bike-vintage.jpg",
	"/people/portrait-m-1.jpg",
	"/people/portrait-f-3.jpg",
	"/people/portrait-m-2.jpg",
	"/people/portrait-f-6.jpg",
];

const PEOPLE_LIBRARY_URL = "/cmp/library?tab=people";

export default function PersonProfilePage() {
	const params = useParams();
	const router = useRouter();
	const { setAsideContent, setHidePageHeader } = useLayout();
	const id = params.id as string;
	const person = peopleItems.find((p) => p.id === id);

	const [editingName, setEditingName] = useState(false);
	const [draftName, setDraftName] = useState(person?.name ?? "");
	const [savedName, setSavedName] = useState<string | null>(null);
	const [curationMode, setCurationMode] = useState(false);
	const [selectedAssetIds, setSelectedAssetIds] = useState<Set<string>>(() => new Set());
	const [removedAssetIds, setRemovedAssetIds] = useState<Set<string>>(() => new Set());
	const [curationStatus, setCurationStatus] = useState("Open any asset to edit face/object recognition.");
	const [batchName, setBatchName] = useState("");
	const [showMoreMenu, setShowMoreMenu] = useState(false);
	const moreMenuRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!showMoreMenu) return;
		const handleClick = (e: MouseEvent) => {
			if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
				setShowMoreMenu(false);
			}
		};
		document.addEventListener("mousedown", handleClick);
		return () => document.removeEventListener("mousedown", handleClick);
	}, [showMoreMenu]);

	useEffect(() => {
		setHidePageHeader?.(true);
		return () => {
			setAsideContent?.(null);
			setHidePageHeader?.(false);
		};
	}, [setAsideContent, setHidePageHeader]);

	const assetCount = person?.appearsInAssets ?? 0;

	const assets = useMemo(
		() =>
			Array.from({ length: assetCount }, (_, i) => ({
				id: `${id}-asset-${i}`,
				image: RELATED_ASSET_IMAGES[i % RELATED_ASSET_IMAGES.length],
				date: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"][i % 6] + " 2025",
				title: ["Studio session", "Outdoor run", "Race day", "Team photo", "Headshot", "Action shot"][i % 6],
			})),
		[assetCount, id],
	);
	const visibleAssets = useMemo(
		() => assets.filter((asset) => !removedAssetIds.has(asset.id)),
		[assets, removedAssetIds],
	);

	const coOccurring = useMemo(
		() => peopleItems.filter((p) => p.id !== id && p.status === "named").slice(0, 6),
		[id],
	);

	if (!person) {
		return (
			<Box display="flex" flexDirection="column" gap="16" py="48">
				<Text fontSize="md" color="fg.secondary">
					This person no longer exists.
				</Text>
				<Box>
					<Button
						appearance="default"
						size="md"
						icon={<IconArrowLeft size={14} />}
						iconPosition="start"
						onClick={() => router.push(PEOPLE_LIBRARY_URL)}
					>
						Back to Library
					</Button>
				</Box>
			</Box>
		);
	}

	const isUnnamed = person.status !== "named";
	const displayName = savedName ?? person.name;
	const faceBox = person.faceBoxes[0];

	const handleSaveName = () => {
		if (draftName.trim()) {
			setSavedName(draftName.trim());
			setEditingName(false);
		}
	};

	const toggleSelectedAsset = (assetId: string) => {
		setSelectedAssetIds((current) => {
			const next = new Set(current);
			if (next.has(assetId)) {
				next.delete(assetId);
			} else {
				next.add(assetId);
			}
			return next;
		});
	};

	const applyBatchAction = (action: "remove" | "move" | "confirm") => {
		const selected = Array.from(selectedAssetIds);
		if (selected.length === 0) return;

		if (action === "remove") {
			setRemovedAssetIds((current) => new Set([...current, ...selected]));
			setCurationStatus(`${selected.length} assets removed from ${displayName}'s person group.`);
		}
		if (action === "move") {
			setCurationStatus(`${selected.length} assets ready to move to another person or new profile.`);
		}
		if (action === "confirm") {
			setCurationStatus(`${selected.length} assets confirmed as ${displayName}.`);
		}
		setSelectedAssetIds(new Set());
	};

	const assignSelectedName = () => {
		const selected = Array.from(selectedAssetIds);
		if (selected.length === 0 || !batchName.trim()) return;
		setCurationStatus(`${selected.length} selected assets assigned to ${batchName.trim()}.`);
		setBatchName("");
		setSelectedAssetIds(new Set());
	};

	const openAssetInspector = (asset: (typeof assets)[number], index: number) => {
		setAsideContent?.(
			<AssetDetailsPanel
				asset={buildAssetDetection({
					assetId: asset.id,
					image: asset.image,
					title: asset.title,
					date: asset.date,
					person,
					index,
				})}
				onClose={() => setAsideContent?.(null)}
				onManageAllTags={() => setCurationStatus("Bulk tag manager opened for this asset.")}
			/>,
		);
	};

	const openMatchReview = () => {
		const matches = visibleAssets.slice(0, 3).map((asset, index) => ({
			id: asset.id,
			image: asset.image,
			title: asset.title,
			date: asset.date,
			confidencePct: [96, 91, 84][index] ?? 82,
		}));

		setAsideContent?.(
			<ReviewMatchesPanel
				personName={displayName}
				matches={matches}
				onClose={() => setAsideContent?.(null)}
				onApply={setCurationStatus}
			/>,
		);
	};

	return (
		<Box
			className="axiom-v3-recognition"
			display="flex"
			flexDirection="column"
			gap="24"
			pb="32"
		>
			{/* Breadcrumb + actions */}
			<Box alignItems="center" display="flex" gap="6" justifyContent="space-between">
				<Box alignItems="center" display="flex" gap="6">
					<Button
						appearance="subtle"
						size="sm"
						icon={<IconArrowLeft size={14} />}
						onClick={() => router.push(PEOPLE_LIBRARY_URL)}
					>
						Library
					</Button>
					<Text fontSize="xs" color="fg.tertiary">
						/
					</Text>
					<Text fontSize="xs" color="fg.secondary">
						People
					</Text>
					<Text fontSize="xs" color="fg.tertiary">
						/
					</Text>
					<Text fontSize="xs" color="fg.default" fontWeight="500">
						{displayName}
					</Text>
				</Box>
				<Box alignItems="center" display="flex" gap="6">
					<Box ref={moreMenuRef} style={{ position: "relative" }}>
						<Button
							appearance="subtle"
							size="sm"
							icon={<IconEllipsisStrokeVertical size={14} />}
							aria-label="More actions"
							aria-expanded={showMoreMenu}
							onClick={() => setShowMoreMenu((v) => !v)}
						/>
						{showMoreMenu && (
							<Box
								bg="bg.default"
								border="1"
								borderColor="border.tertiary"
								rounded="lg"
								shadow="lg"
								style={{
									position: "absolute",
									right: 0,
									top: "calc(100% + 4px)",
									width: 200,
									zIndex: 50,
								}}
							>
								<Box display="flex" flexDirection="column" py="6">
									{[
										{
											icon: <IconLink size={14} />,
											label: "Merge with another",
											onClick: () => {
												setCurationStatus("Select a person to merge with.");
												setShowMoreMenu(false);
											},
										},
										{
											icon: <IconUserSlash size={14} />,
											label: "Hide from library",
											danger: true,
											onClick: () => {
												setCurationMode(true);
												setCurationStatus("Select assets to hide, then confirm.");
												setShowMoreMenu(false);
											},
										},
									].map((item) => (
										<button
											key={item.label}
											type="button"
											style={{
												alignItems: "center",
												background: "transparent",
												border: 0,
												color: item.danger
													? "var(--ax-colors-fg-error)"
													: "var(--ax-colors-fg-default)",
												cursor: "pointer",
												display: "flex",
												fontSize: 14,
												gap: 10,
												height: 36,
												padding: "0 12px",
												textAlign: "left",
												width: "100%",
											}}
											onMouseEnter={(e) => {
												e.currentTarget.style.background = "var(--ax-colors-bg-secondary)";
											}}
											onMouseLeave={(e) => {
												e.currentTarget.style.background = "transparent";
											}}
											onClick={item.onClick}
										>
											{item.icon}
											{item.label}
										</button>
									))}
								</Box>
							</Box>
						)}
					</Box>
				</Box>
			</Box>

			{/* Hero — Apple Photos style face header */}
			<Box
				alignItems="center"
				display="grid"
				gap="24"
				style={{ gridTemplateColumns: "auto 1fr auto" }}
			>
				<FaceThumbnail
					image={person.image ?? ""}
					box={faceBox}
					size={144}
					highlight={isUnnamed}
				/>

				<Box display="flex" flexDirection="column" gap="8">
					{editingName ? (
						<Box alignItems="center" display="flex" gap="6" style={{ maxWidth: 480 }}>
							<Input
								autoFocus
								size="xl"
								placeholder="Type a name…"
								value={draftName}
								onChange={(e) => setDraftName(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === "Enter") handleSaveName();
									if (e.key === "Escape") setEditingName(false);
								}}
								style={{ flex: 1 }}
							/>
								<Button
									appearance="primary"
									size="md"
									onClick={handleSaveName}
								>
								Save
							</Button>
							<Button
								appearance="subtle"
								size="md"
								onClick={() => setEditingName(false)}
							>
								Cancel
							</Button>
						</Box>
					) : (
						<Box alignItems="center" display="flex" gap="10">
							<Heading level="1" fontSize="4xl" style={{ margin: 0 }}>
								{displayName}
							</Heading>
							<Button
								appearance="subtle"
								size="md"
								icon={<IconPen size={14} />}
								aria-label="Edit name"
								onClick={() => {
									setDraftName(displayName);
									setEditingName(true);
								}}
							>
								{isUnnamed && !savedName ? "Name this person" : "Edit"}
							</Button>
						</Box>
					)}

					<Box alignItems="center" display="flex" gap="12">
						<Badge intent={isUnnamed && !savedName ? "warning" : "success"}>
							{isUnnamed && !savedName ? "Unnamed" : "Named"}
						</Badge>
						<Text fontSize="sm" color="fg.secondary">
							Appears in <strong>{assetCount}</strong>{" "}
							{assetCount === 1 ? "asset" : "assets"}
						</Text>
						<Text fontSize="sm" color="fg.tertiary">
							·
						</Text>
						<Text fontSize="sm" color="fg.secondary">
							First seen{" "}
							<strong>
								{["Jan", "Mar", "Apr"][Math.floor((id.charCodeAt(0) + id.charCodeAt(id.length - 1)) % 3)]}{" "}
								2025
							</strong>
						</Text>
					</Box>

					{person.confidencePct && (
						<Text fontSize="xs" color="fg.tertiary">
							Detection confidence: {person.confidencePct}%
						</Text>
					)}
				</Box>

			</Box>

			{/* Opal suggestion banner */}
			<AiBanner>
				<AiBannerOrb />
				<Box display="flex" flexDirection="column" gap="2" style={{ minWidth: 0 }}>
					<Text
						fontSize="sm"
						fontWeight="600"
						color="fg.default"
					>
						Opal noticed 3 similar faces in unreviewed assets
					</Text>
						<Text fontSize="sm" color="fg.secondary">
							These could be {displayName}. Review to confirm or dismiss.
						</Text>
				</Box>
				<Box style={{ flex: 1 }} />
				<Button
						appearance="default-opal"
						size="sm"
						icon={<IconSparkles size={14} />}
						iconPosition="start"
						onClick={openMatchReview}
					>
					Review 3 matches
				</Button>
			</AiBanner>

			{/* Assets grid — the "face library" Apple Photos vibe */}
			<Box display="flex" flexDirection="column" gap="12">
				<Box alignItems="center" display="flex" gap="8" justifyContent="space-between">
					<Box alignItems="center" display="flex" gap="8">
						<IconStar size={14} style={{ color: "var(--ax-colors-fg-secondary)" }} />
						<Heading level="2" fontSize="lg" style={{ margin: 0 }}>
							{visibleAssets.length} {visibleAssets.length === 1 ? "asset" : "assets"} featuring {displayName}
						</Heading>
					</Box>
					<Box alignItems="center" display="flex" gap="6">
							<Text fontSize="sm" color="fg.secondary">
								{curationStatus}
							</Text>
						<Button
							appearance={curationMode ? "default" : "subtle"}
							size="sm"
							onClick={() => {
								setCurationMode((current) => !current);
								setSelectedAssetIds(new Set());
							}}
						>
							{curationMode ? "Done" : "Curate assets"}
						</Button>
					</Box>
				</Box>
					{curationMode && (
						<Box
							bg="bg.secondary"
							border="1"
							borderColor="border.tertiary"
							display="flex"
							flexDirection="column"
							gap="8"
							p="8"
							rounded="md"
						>
							<Box alignItems="center" display="flex" gap="8" style={{ width: "100%" }}>
								<Text fontSize="xs" fontWeight="600" style={{ flex: 1 }}>
									{selectedAssetIds.size} selected
								</Text>
								<Button
									appearance="default"
									size="sm"
									onClick={() =>
										setSelectedAssetIds(new Set(visibleAssets.map((asset) => asset.id)))
									}
								>
									Select all
								</Button>
								<Button
									appearance="subtle"
									size="sm"
									onClick={() => {
										setSelectedAssetIds(new Set());
										setBatchName("");
									}}
								>
									Clear
								</Button>
							</Box>
							<Box alignItems="center" display="flex" gap="8" style={{ width: "100%" }}>
								<Box style={{ flex: 1 }}>
									<Input
										placeholder="Move selected to existing person or type a new name…"
										size="md"
										value={batchName}
										onChange={(e) => setBatchName(e.target.value)}
										onKeyDown={(e) => {
											if (e.key === "Enter") assignSelectedName();
										}}
									/>
								</Box>
								<Button
									appearance="default"
									size="sm"
									icon={<IconArrowsLeftRight size={12} />}
									iconPosition="start"
									onClick={assignSelectedName}
									disabled={selectedAssetIds.size === 0 || !batchName.trim()}
								>
									Assign / move
								</Button>
								<Button
									appearance="default"
									size="sm"
									icon={<IconCheck size={12} />}
									iconPosition="start"
									onClick={() => applyBatchAction("confirm")}
									disabled={selectedAssetIds.size === 0}
								>
									Confirm as {displayName.split(" ")[0]}
								</Button>
								<Button
									appearance="default"
									size="sm"
									icon={<IconTrashCan size={12} />}
									iconPosition="start"
									onClick={() => applyBatchAction("remove")}
									disabled={selectedAssetIds.size === 0}
								>
									Not this person
								</Button>
								<Button
									appearance="default"
									size="sm"
									icon={<IconUserSlash size={12} />}
									iconPosition="start"
									onClick={() => applyBatchAction("remove")}
									disabled={selectedAssetIds.size === 0}
									style={{ color: "var(--ax-colors-fg-error)" }}
								>
									Hide from library
								</Button>
							</Box>
						</Box>
					)}
				<Box
					display="grid"
					gap="12"
					style={{
						gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
					}}
				>
					{visibleAssets.map((asset, index) => (
						<AssetTile
							key={asset.id}
							image={asset.image}
							date={asset.date}
							selectable={curationMode}
							selected={selectedAssetIds.has(asset.id)}
							onSelect={() => toggleSelectedAsset(asset.id)}
							onOpen={() => openAssetInspector(asset, index)}
						/>
					))}
				</Box>
				</Box>

				<RelatedMediaRail personName={displayName} />

				{/* Co-occurring people */}
				{coOccurring.length > 0 && (
				<Box display="flex" flexDirection="column" gap="12">
					<Box alignItems="center" display="flex" gap="8">
						<IconUserGroup
							size={14}
							style={{ color: "var(--ax-colors-fg-secondary)" }}
						/>
						<Heading level="3" fontSize="md" style={{ margin: 0 }}>
							Also appears with
						</Heading>
					</Box>
					<Box display="flex" gap="12" overflow="auto" pb="6">
						{coOccurring.map((other) => (
							<CoFaceChip
								key={other.id}
								image={other.image ?? ""}
								box={other.faceBoxes[0]}
								name={other.name}
								onClick={() => router.push(`/cmp/library/people/${other.id}`)}
							/>
						))}
					</Box>
				</Box>
			)}
		</Box>
	);
}

function FaceThumbnail({
	image,
	box,
	size,
	highlight,
}: {
	image: string;
	box: { top: number; left: number; width: number; height: number };
	size: number;
	highlight?: boolean;
}) {
	const faceCenterX = box.left + box.width / 2;
	const faceCenterY = box.top + box.height / 2;
	const cropSize = Math.min(100, Math.max(box.width, box.height) * 2.1);
	const cropLeft = clamp(faceCenterX - cropSize / 2, 0, 100 - cropSize);
	const cropTop = clamp(faceCenterY - cropSize / 2, 0, 100 - cropSize);
	const scale = 100 / cropSize;
	return (
		<Box
			bg="bg.secondary"
			rounded="full"
			style={{
				width: size,
				height: size,
				flexShrink: 0,
				overflow: "hidden",
				position: "relative",
				boxShadow: "0 0 0 3px var(--ax-colors-border-secondary)",
			}}
		>
			<img
				alt=""
				src={image}
				style={{
					position: "absolute",
					left: `${-cropLeft * scale}%`,
					top: `${-cropTop * scale}%`,
					width: `${100 * scale}%`,
					height: "auto",
					maxWidth: "none",
				}}
			/>
		</Box>
	);
}

function clamp(value: number, min: number, max: number) {
	return Math.min(max, Math.max(min, value));
}

function AssetTile({
	image,
	date,
	selectable,
	selected,
	onSelect,
	onOpen,
}: {
	image: string;
	date: string;
	selectable?: boolean;
	selected?: boolean;
	onSelect?: () => void;
	onOpen?: () => void;
}) {
	return (
		<Box
			bg="bg.secondary"
			border={selected ? "1" : undefined}
			borderColor={selected ? "border.secondary" : undefined}
			overflow="hidden"
			rounded="md"
			role="button"
			tabIndex={0}
			style={{
				position: "relative",
				aspectRatio: "1 / 1",
				cursor: "pointer",
				transition: "transform 0.18s ease",
				boxShadow: selected ? "0 0 0 2px var(--ax-colors-border-secondary)" : undefined,
			}}
			onClick={() => {
				if (selectable) {
					onSelect?.();
					return;
				}
				onOpen?.();
			}}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					if (selectable) {
						onSelect?.();
						return;
					}
					onOpen?.();
				}
			}}
		>
			<img
				alt=""
				src={image}
				style={{
					display: "block",
					height: "100%",
					width: "100%",
					objectFit: "cover",
				}}
			/>
			{selectable && (
				<Box
					alignItems="center"
					bg="bg.default"
					border="1"
					borderColor="border.secondary"
					display="flex"
					justifyContent="center"
					rounded="sm"
					style={{
						position: "absolute",
						top: 8,
						left: 8,
						width: 20,
						height: 20,
						zIndex: 2,
					}}
				>
					{selected && (
						<IconCheck
							size={12}
							style={{ color: "var(--ax-colors-fg-default)" }}
						/>
					)}
				</Box>
			)}
			<Box
				style={{
					position: "absolute",
					left: 0,
					right: 0,
					bottom: 0,
					background:
						"linear-gradient(to top, var(--ax-colors-bg-overlay) 0%, transparent 100%)",
					padding: "20px 8px 6px",
				}}
			>
				<Text fontSize="xs" color="fg.white" fontWeight="500">
					{date}
				</Text>
			</Box>
		</Box>
	);
}

function CoFaceChip({
	image,
	box,
	name,
	onClick,
}: {
	image: string;
	box: { top: number; left: number; width: number; height: number };
	name: string;
	onClick?: () => void;
}) {
	return (
		<Box
			display="flex"
			flexDirection="column"
			gap="8"
			alignItems="center"
			role="button"
			tabIndex={0}
			style={{ cursor: "pointer", flexShrink: 0, width: 80 }}
			onClick={onClick}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					onClick?.();
				}
			}}
		>
			<FaceThumbnail image={image} box={box} size={64} />
			<Text
				fontSize="xs"
				color="fg.default"
				style={{
					textAlign: "center",
					overflow: "hidden",
					textOverflow: "ellipsis",
					whiteSpace: "nowrap",
					maxWidth: "100%",
				}}
			>
				{name.split(" ")[0]}
			</Text>
		</Box>
	);
}
