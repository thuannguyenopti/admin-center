"use client";

import { useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import {
	AlertDialog, AlertDialogAction, AlertDialogBody, AlertDialogCancel,
	AlertDialogContent, AlertDialogFooter, AlertDialogHeader,
	Badge, Box, Button, Menu, MenuContent, MenuTrigger, Text,
} from "@optiaxiom/react";
import { IconArrowLeft, IconArrowsRotate, IconCircleXmark, IconComments, IconEllipsisSolid, IconPause, IconUserSlash } from "@optiaxiom/icons";
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
	const [showDeactivate, setShowDeactivate] = useState(false);

	const isActivity = pathname?.endsWith("/activity");
	const isPermissions = pathname?.endsWith("/permissions");
	const isResponsibilities = pathname?.endsWith("/responsibilities");
	const isIdentity = pathname?.endsWith("/identity");
	const isWork = !isActivity && !isPermissions && !isResponsibilities && !isIdentity;

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
					padding: "12px 0 0",
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
									background: "#ABFF44",
									border: "2px solid var(--ax-colors-bg-default)",
								}}
							/>
						</Box>
						<Box display="flex" flexDirection="column" gap="2" style={{ flex: 1, minWidth: 0 }}>
							<Text fontSize="md" color="fg.default" style={{ fontWeight: 600, lineHeight: "1.2" }}>
								{vau.characterName ?? vau.name}
							</Text>
							<Text fontSize="sm" color="fg.tertiary" style={{ fontWeight: 400, lineHeight: "1.2" }}>
								{vau.name}
							</Text>
						</Box>
						<Menu
							options={[
								{ label: "Chat", addon: <IconComments />, execute: () => router.push("/opal/messages?conversation=bubs") },
								{ label: "Pause", addon: <IconPause /> },
								{ label: "Deactivate", addon: <IconCircleXmark />, intent: "danger" as const, execute: () => setShowDeactivate(true) },
							]}
						>
							<MenuTrigger asChild>
								<Button appearance="subtle" size="sm" icon={<IconEllipsisSolid />} aria-label="Options" style={{ flexShrink: 0 }} />
							</MenuTrigger>
							<MenuContent />
						</Menu>
					</Box>
				)}

				<Box style={{ height: 1, background: "var(--ax-colors-border-secondary)", margin: "0 0 6px" }} />

				{/* SUPERVISE */}
				<SectionLabel>Supervise</SectionLabel>
				<NavItem
					label="Activity"
					active={isActivity}
					onClick={() => router.push(`/opal/virtual-teammates/manage/${id}/activity`)}
				/>
				<NavItem
					label="Work"
					active={isWork}
					onClick={() => router.push(`/opal/virtual-teammates/manage/${id}`)}
				/>

				<Box style={{ height: 1, background: "var(--ax-colors-border-secondary)", margin: "6px 0" }} />

				{/* SETTINGS */}
				<SectionLabel>Settings</SectionLabel>
				<NavItem
					label="Identity"
					active={isIdentity}
					onClick={() => router.push(`/opal/virtual-teammates/manage/${id}/identity`)}
				/>
				<NavItem
					label="Tools"
					active={isPermissions}
					onClick={() => router.push(`/opal/virtual-teammates/manage/${id}/permissions`)}
					badge={
						<svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
							<circle cx="7" cy="7" r="7" fill="#8F4764" />
							<rect x="6.25" y="3.5" width="1.5" height="5" rx="0.75" fill="white" />
							<circle cx="7" cy="10.5" r="0.75" fill="white" />
						</svg>
					}
				/>
				<NavItem
					label="Responsibilities"
					active={isResponsibilities}
					onClick={() => router.push(`/opal/virtual-teammates/manage/${id}/responsibilities`)}
				/>

			</Box>

			{/* Main content */}
			<Box style={{ flex: 1, overflowY: "auto", background: "#F9FCF8" }}>
				{children}
			</Box>

			{vau && (
				<AlertDialog open={showDeactivate} onOpenChange={setShowDeactivate}>
					<AlertDialogContent size="sm" style={{ width: 520, borderRadius: 24 }}>
						<AlertDialogHeader>{"Are you sure you want to deactivate " + vau.name + "?"}</AlertDialogHeader>
						<AlertDialogBody>
							<Text fontSize="md" color="fg.default" style={{ lineHeight: "1.6" }}>
								{"This can't be undone. Everything " + vau.name + " has learned — context, memory, conversation history, and all personal instructions — will be permanently deleted. All workflows will stop immediately."}
							</Text>
						</AlertDialogBody>
						<AlertDialogFooter>
							<AlertDialogCancel appearance="subtle" size="md" onClick={() => setShowDeactivate(false)}>
								{"Keep " + vau.name + " active"}
							</AlertDialogCancel>
							<AlertDialogAction
								appearance="primary"
								size="md"
								addonBefore={<IconUserSlash />}
								style={{ background: "#7C3B5A", border: "none", color: "white" }}
								onClick={() => setShowDeactivate(false)}
							>
								{"Deactivate " + vau.name}
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			)}
		</Box>
	);
}
