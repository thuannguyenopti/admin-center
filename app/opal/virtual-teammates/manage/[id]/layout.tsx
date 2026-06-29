"use client";

import { useParams, usePathname, useRouter } from "next/navigation";
import { Badge, Box, Button, Text } from "@optiaxiom/react";
import { IconArrowLeft } from "@optiaxiom/icons";
import Image from "next/image";
import { VAUS } from "@/app/opal/data/vaus";

const CAPTION: React.CSSProperties = {
	fontFamily: "Roboto Mono, monospace",
	fontSize: 10,
	fontWeight: 400,
	lineHeight: "1.25",
	letterSpacing: "0.36px",
	textTransform: "uppercase" as const,
};

function SectionLabel({ children }: { children: React.ReactNode }) {
	return (
		<span
			style={{
				...CAPTION,
				color: "var(--ax-colors-fg-tertiary)",
				padding: "8px 16px 2px",
				display: "block",
			}}
		>
			{children}
		</span>
	);
}

function NavItem({
	label,
	active,
	badge,
	onClick,
}: {
	label: string;
	active?: boolean;
	badge?: React.ReactNode;
	onClick?: () => void;
}) {
	return (
		<Box
			display="flex"
			alignItems="center"
			justifyContent="space-between"
			className="vat-nav-item"
			data-active={active || undefined}
			style={{
				height: 36,
				padding: "0 12px",
				borderRadius: 8,
				margin: "1px 4px",
				cursor: "pointer",
				background: active ? "var(--ax-colors-bg-secondary)" : undefined,
			}}
			onClick={onClick}
		>
			<Text
				fontSize="md"
				color={active ? "fg.default" : "fg.secondary"}
				style={{ fontWeight: active ? 500 : 400 }}
			>
				{label}
			</Text>
			{badge}
		</Box>
	);
}

export default function VATDetailLayout({ children }: { children: React.ReactNode }) {
	const params = useParams();
	const pathname = usePathname();
	const router = useRouter();
	const id = params?.id as string;
	const vau = VAUS.find((v) => v.id === id);

	const isActivity = pathname?.endsWith("/activity");
	const isPermissions = pathname?.endsWith("/permissions");
	const isConnectors = pathname?.endsWith("/connectors");
	const isResponsibilities = pathname?.endsWith("/responsibilities");
	const isInteractions = pathname?.endsWith("/interactions");
	const isSettings = pathname?.endsWith("/settings");
	const isOverview = !isActivity && !isPermissions && !isConnectors && !isSettings && !isResponsibilities && !isInteractions;

	return (
		<Box display="flex" style={{ height: "100%", overflow: "hidden" }}>
			{/* Secondary sidebar */}
			<Box
				style={{
					width: 272,
					minWidth: 272,
					flexShrink: 0,
					borderRight: "1px solid var(--ax-colors-border-secondary)",
					background: "var(--ax-colors-bg-default)",
					display: "flex",
					flexDirection: "column",
					overflowY: "auto",
					padding: "12px 0 16px",
				}}
			>
				{/* Back link */}
				<Box style={{ padding: "0 8px 4px" }}>
					<Button
						appearance="subtle"
						size="sm"
						addonBefore={<IconArrowLeft />}
						onClick={() => router.push("/opal/virtual-teammates/manage")}
					>
						Virtual teammates
					</Button>
				</Box>

				{/* VAU identity */}
				{vau && (
					<Box
						display="flex"
						alignItems="center"
						gap="12"
						style={{ padding: "12px 16px 16px" }}
					>
						{/* Circle avatar with online dot */}
						<Box style={{ position: "relative", width: 36, height: 36, flexShrink: 0 }}>
							<Box
								style={{
									width: 36,
									height: 36,
									borderRadius: "50%",
									overflow: "hidden",
									backgroundColor: vau.avatarBg,
								}}
							>
								<Image
									src={vau.avatar}
									alt={vau.characterName ?? vau.name}
									width={36}
									height={36}
									unoptimized
									style={{ width: "100%", height: "100%", objectFit: "cover" }}
								/>
							</Box>
							<Box
								style={{
									position: "absolute",
									bottom: 0,
									right: 0,
									width: 10,
									height: 10,
									borderRadius: "50%",
									background: "#3DAA6A",
									border: "2px solid var(--ax-colors-bg-default)",
								}}
							/>
						</Box>
						{/* Name + badge */}
						<Box display="flex" flexDirection="column" gap="4">
							<Text fontSize="md" color="fg.default" style={{ fontWeight: 600, lineHeight: "1.2" }}>
								{vau.characterName ?? vau.name}
							</Text>
							<Badge intent="neutral" variant="subtle">{vau.name}</Badge>
						</Box>
					</Box>
				)}

				<Box style={{ height: 1, background: "var(--ax-colors-border-secondary)", margin: "0 0 6px" }} />

				{/* SUPERVISE */}
				<SectionLabel>Supervise</SectionLabel>
				<NavItem
					label="Overview"
					active={isOverview}
					onClick={() => router.push(`/opal/virtual-teammates/manage/${id}`)}
					badge={<Badge intent="danger" variant="subtle" style={{ color: "#A95A77" }}>Needs review</Badge>}
				/>
				<NavItem
					label="Activity"
					active={isActivity}
					onClick={() => router.push(`/opal/virtual-teammates/manage/${id}/activity`)}
				/>

				<Box style={{ height: 1, background: "var(--ax-colors-border-secondary)", margin: "6px 0" }} />

				{/* CONFIGURE */}
				<SectionLabel>Configure</SectionLabel>
				<NavItem
					label="Permissions"
					active={isPermissions}
					onClick={() => router.push(`/opal/virtual-teammates/manage/${id}/permissions`)}
				/>
				<NavItem
					label="Tools"
					active={isConnectors}
					onClick={() => router.push(`/opal/virtual-teammates/manage/${id}/connectors`)}
					badge={
						<Box
							style={{
								width: 18,
								height: 18,
								borderRadius: "50%",
								background: "#A95A77",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								flexShrink: 0,
							}}
						>
							<span
								style={{
									color: "#fff",
									fontSize: 10,
									fontWeight: 700,
									fontFamily: "Roboto Mono, monospace",
									lineHeight: 1,
								}}
							>
								1
							</span>
						</Box>
					}
				/>
				<NavItem
					label="Responsibilities"
					active={isResponsibilities}
					onClick={() => router.push(`/opal/virtual-teammates/manage/${id}/responsibilities`)}
				/>
				<NavItem
					label="Interactions"
					active={isInteractions}
					onClick={() => router.push(`/opal/virtual-teammates/manage/${id}/interactions`)}
				/>
				<NavItem
					label="Settings"
					active={isSettings}
					onClick={() => router.push(`/opal/virtual-teammates/manage/${id}/settings`)}
				/>

			</Box>

			{/* Main content */}
			<Box style={{ flex: 1, overflowY: "auto", background: "#F9FCF8" }}>
				{children}
			</Box>
		</Box>
	);
}
