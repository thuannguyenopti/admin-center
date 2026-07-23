"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";
import {
	Box,
	Button,
	Menu,
	MenuContent,
	MenuTrigger,
	Text,
} from "@optiaxiom/react";
import {IconEllipsisStroke as IconEllipsis, IconPaintRoller, IconStar} from "@optiaxiom/icons";
import {StatusBadge} from "./StatusBadge";
import type {BrandPack} from "../types";

type BrandPackCardProps = {
	isDefault?: boolean;
	onSetDefault?: () => void;
	pack: BrandPack;
};

export function BrandPackCard({isDefault = false, onSetDefault, pack}: BrandPackCardProps) {
	const router = useRouter();
	const [hovered, setHovered] = useState(false);

	const isArchived = pack.status === "archived";
	const heroThumb = pack.templates[0];
	const updatedLabel = new Date(pack.updatedAt).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
	});

	return (
		<Box
			bg="bg.default"
			border="1"
			borderColor={isDefault ? "border.accent" : "border.tertiary"}
			display="flex"
			flexDirection="column"
			overflow="hidden"
			rounded="xl"
			shadow={hovered && !isArchived ? "md" : "sm"}
			style={{
				cursor: "pointer",
				opacity: isArchived ? 0.65 : 1,
				transform: hovered && !isArchived ? "translateY(-2px)" : "none",
				transition: "box-shadow 0.18s ease, transform 0.18s ease, opacity 0.15s ease",
			}}
			onClick={() => router.push(`/opal/brand-packs/${pack.id}`)}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
		>
			{/* Image — single, clean, fixed height */}
			{heroThumb ? (
				<Box overflow="hidden" style={{height: 160, flexShrink: 0, position: "relative"}}>
					<img
						alt={heroThumb.name}
						src={heroThumb.thumb}
						style={{
							display: "block",
							width: "100%",
							height: "100%",
							objectFit: "cover",
							objectPosition: "center",
						}}
					/>
					{isDefault && (
						<Box
							alignItems="center"
							display="flex"
							gap="4"
							style={{
								position: "absolute",
								top: 8,
								left: 8,
								background: "var(--ax-colors-fg-default)",
								color: "var(--ax-colors-bg-default)",
								borderRadius: 999,
								padding: "3px 8px",
								fontSize: 12,
								fontWeight: 600,
								letterSpacing: 0,
							}}
						>
							<IconStar size={10} />
							Default
						</Box>
					)}
				</Box>
			) : (
				<Box
					alignItems="center"
					bg="bg.secondary"
					display="flex"
					justifyContent="center"
					style={{height: 160, flexShrink: 0, position: "relative"}}
				>
					<IconPaintRoller style={{color: "var(--ax-colors-fg-tertiary)"}} />
					{isDefault && (
						<Box
							alignItems="center"
							display="flex"
							gap="4"
							style={{
								position: "absolute",
								top: 8,
								left: 8,
								background: "var(--ax-colors-fg-default)",
								color: "var(--ax-colors-bg-default)",
								borderRadius: 999,
								padding: "3px 8px",
								fontSize: 12,
								fontWeight: 600,
								letterSpacing: 0,
							}}
						>
							<IconStar size={10} />
							Default
						</Box>
					)}
				</Box>
			)}

			{/* Card body */}
			<Box display="flex" flexDirection="column" gap="12" p="16">
				{/* Name + badge + 3-dot */}
				<Box alignItems="center" display="flex" gap="8">
					<Text
						fontWeight="500"
						style={{
							flex: 1,
							fontSize: 14,
							overflow: "hidden",
							textOverflow: "ellipsis",
							whiteSpace: "nowrap",
							color: "var(--ax-colors-fg-default)",
						}}
					>
						{pack.name}
					</Text>
					<StatusBadge status={pack.status} />
					<Menu
						options={[
							{
								label: isDefault ? "Remove as default" : "Set as default",
								execute: () => onSetDefault?.(),
							},
							{
								label: "Duplicate",
								group: { label: "", hidden: true, separator: true },
							},
							{
								label: isArchived ? "Restore" : "Archive",
							},
						]}
					>
						<MenuTrigger asChild>
							<Button
								appearance="subtle"
								aria-label={`More actions for ${pack.name}`}
								icon={<IconEllipsis />}
								onClick={(e) => e.stopPropagation()}
								size="sm"
								style={{flexShrink: 0}}
							/>
						</MenuTrigger>
						<MenuContent align="end" onClick={(e) => e.stopPropagation()} />
					</Menu>
				</Box>

				{/* Template count + date — light, not bold */}
				<Box display="flex" flexDirection="column" gap="4">
					<Text color="fg.tertiary" style={{fontSize: 12}}>
						{pack.templateCount} templates
					</Text>
					<Text color="fg.tertiary" style={{fontSize: 12}}>
						Updated {updatedLabel}
					</Text>
				</Box>

				{/* Channel tags */}
				<Box display="flex" gap="4" style={{flexWrap: "wrap"}}>
					{pack.channels.map((ch) => (
						<Box
							key={ch}
							bg="bg.secondary"
							rounded="full"
							style={{padding: "3px 10px"}}
						>
							<Text color="fg.secondary" style={{fontSize: 12}}>
								{ch}
							</Text>
						</Box>
					))}
				</Box>
			</Box>
		</Box>
	);
}

export function NewBrandPackCard({onClick}: {onClick: () => void}) {
	const [hovered, setHovered] = useState(false);

	return (
		<Box
			alignItems="center"
			border="1"
			borderColor="border.tertiary"
			display="flex"
			flexDirection="column"
			gap="12"
			justifyContent="center"
			rounded="xl"
			shadow={hovered ? "sm" : undefined}
			style={{
				borderStyle: "dashed",
				cursor: "pointer",
				minHeight: 240,
				padding: "32px 24px",
				transform: hovered ? "translateY(-2px)" : "none",
				transition: "box-shadow 0.18s ease, transform 0.18s ease",
			}}
			onClick={onClick}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
		>
			<Box
				alignItems="center"
				bg={hovered ? "bg.accent.subtle" : "bg.secondary"}
				display="flex"
				justifyContent="center"
				rounded="xl"
				style={{
					height: 44,
					width: 44,
					transition: "background 0.18s ease",
				}}
			>
				<IconPaintRoller
					style={{
						color: hovered
							? "var(--ax-colors-fg-accent)"
							: "var(--ax-colors-fg-secondary)",
					}}
				/>
			</Box>
			<Box display="flex" flexDirection="column" gap="4" style={{textAlign: "center"}}>
				<Text fontWeight="600" style={{fontSize: 14}}>
					New Brand
				</Text>
				<Text color="fg.secondary" fontSize="xs">
					Opal · Figma · Manual
				</Text>
			</Box>
		</Box>
	);
}
