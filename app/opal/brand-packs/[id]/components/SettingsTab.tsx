"use client";

import { useState } from "react";
import { Box, Button, Switch, Text } from "@optiaxiom/react";
import { IconCheck } from "@optimizely/axiom-icons";
import type { BrandPack } from "../../types";

type SettingsTabProps = {
	pack: BrandPack;
};

export function SettingsTab({ pack }: SettingsTabProps) {
	const [isActive, setIsActive] = useState(pack.status === "active");
	const [name, setName] = useState(pack.name);
	const [nameSaved, setNameSaved] = useState(false);
	const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);

	const saveName = () => {
		setNameSaved(true);
		setTimeout(() => setNameSaved(false), 2000);
	};

	return (
		<Box display="flex" flexDirection="column" gap="16" style={{ maxWidth: 560 }}>
			{/* Active toggle */}
			<Box
				bg="bg.default"
				border="1"
				borderColor="border.tertiary"
				display="flex"
				flexDirection="column"
				gap="0"
				overflow="hidden"
				rounded="xl"
				shadow="sm"
			>
				<Box
					alignItems="center"
					display="flex"
					gap="16"
					justifyContent="space-between"
					p="20"
				>
					<Box display="flex" flexDirection="column" gap="4">
						<Text fontWeight="600" style={{ fontSize: 14 }}>Active</Text>
						<Text color="fg.secondary" fontSize="sm">
							When active, Opal uses this brand pack for all matching content generation
						</Text>
					</Box>
					<Switch
						checked={isActive}
						onCheckedChange={setIsActive}
					/>
				</Box>

				{isActive && (
					<Box
						alignItems="center"
						bg="bg.success.subtle"
						display="flex"
						gap="8"
						p="12"
						style={{
							borderTop: "1px solid var(--ax-colors-border-tertiary)",
							paddingLeft: 20,
							paddingRight: 20,
						}}
					>
						<IconCheck size={12} style={{ color: "var(--ax-colors-fg-success)", flexShrink: 0 }} />
						<Text color="fg.success" fontSize="xs" fontWeight="500">
							This pack is live — Opal is using it now
						</Text>
					</Box>
				)}
			</Box>

			{/* Pack name */}
			<Box
				bg="bg.default"
				border="1"
				borderColor="border.tertiary"
				display="flex"
				flexDirection="column"
				gap="12"
				p="20"
				rounded="xl"
				shadow="sm"
			>
				<Text fontWeight="600" style={{ fontSize: 14 }}>Pack name</Text>
				<input
					value={name}
					onChange={(e) => setName(e.target.value)}
					style={{
						background: "var(--ax-colors-bg-secondary)",
						border: "1px solid var(--ax-colors-border-default)",
						borderRadius: 8,
						color: "var(--ax-colors-fg-default)",
						fontFamily: "inherit",
						fontSize: 14,
						outline: "none",
						padding: "8px 12px",
						transition: "border-color 0.15s",
						width: "100%",
					}}
					onFocus={(e) => { e.currentTarget.style.borderColor = "var(--ax-colors-border-accent)"; }}
					onBlur={(e) => { e.currentTarget.style.borderColor = "var(--ax-colors-border-default)"; }}
				/>
				<Box display="flex" justifyContent="end">
					<Button
						appearance="primary"
						size="sm"
						icon={nameSaved ? <IconCheck /> : undefined}
						onClick={saveName}
					>
						{nameSaved ? "Saved" : "Save"}
					</Button>
				</Box>
			</Box>

			{/* Archive */}
			<Box
				alignItems="center"
				display="flex"
				gap="16"
				justifyContent="space-between"
				p="16"
				style={{ flexWrap: "wrap" }}
			>
				<Box display="flex" flexDirection="column" gap="2">
					<Text fontWeight="500" style={{ fontSize: 14 }}>Archive this pack</Text>
					<Text color="fg.tertiary" fontSize="xs">
						Retired packs are hidden from Opal but kept for reference
					</Text>
				</Box>
				{showArchiveConfirm ? (
					<Box alignItems="center" display="flex" gap="8">
						<Text color="fg.secondary" fontSize="xs">Are you sure?</Text>
						<Button
							appearance="subtle"
							size="sm"
							onClick={() => setShowArchiveConfirm(false)}
						>
							Cancel
						</Button>
						<Button
							appearance="default"
							size="sm"
							style={{ borderColor: "rgba(220, 38, 38, 0.35)", color: "#DC2626" }}
						>
							Archive
						</Button>
					</Box>
				) : (
					<Button
						appearance="subtle"
						size="sm"
						onClick={() => setShowArchiveConfirm(true)}
					>
						Archive
					</Button>
				)}
			</Box>
		</Box>
	);
}
