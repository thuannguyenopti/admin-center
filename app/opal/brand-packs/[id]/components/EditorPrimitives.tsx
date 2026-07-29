"use client";

import { Badge, Box, Button, Text } from "@optiaxiom/react";
import { IconCheck } from "@optiaxiom/icons";
import type * as React from "react";
import styles from "./EditorPrimitives.module.css";

export function EditorPage({ children }: { children: React.ReactNode }) {
	return <div className={styles.editorPage}>{children}</div>;
}

export function EditorHeader({
	actions,
	description,
	eyebrow,
	title,
}: {
	actions?: React.ReactNode;
	description: string;
	eyebrow: string;
	title: string;
}) {
	return (
		<header className={styles.editorHeader}>
			<div className={styles.editorHeaderCopy}>
				<Text className={styles.eyebrow}>{eyebrow}</Text>
				<Text className={styles.title}>{title}</Text>
				<Text className={styles.description}>{description}</Text>
			</div>
			{actions && <div className={styles.headerActions}>{actions}</div>}
		</header>
	);
}

export function EditorGrid({
	aside,
	children,
	wide = false,
}: {
	aside?: React.ReactNode;
	children: React.ReactNode;
	wide?: boolean;
}) {
	if (wide) {
		return <div className={styles.editorGridWide}>{children}</div>;
	}

	return (
		<div className={styles.editorGrid}>
			<div>{children}</div>
			{aside && <aside>{aside}</aside>}
		</div>
	);
}

export function EditorPanel({
	actions,
	children,
	description,
	title,
}: {
	actions?: React.ReactNode;
	children: React.ReactNode;
	description?: string;
	title: string;
}) {
	return (
		<section className={styles.panel}>
			<div className={styles.panelHeader}>
				<div>
					<Text className={styles.panelTitle}>{title}</Text>
					{description && <Text className={styles.panelDescription}>{description}</Text>}
				</div>
				{actions && <div className={styles.headerActions}>{actions}</div>}
			</div>
			{children}
		</section>
	);
}

export function EditorField({
	children,
	help,
	label,
}: {
	children: React.ReactNode;
	help?: string;
	label: string;
}) {
	return (
		<div className={styles.fieldRow}>
			<div>
				<Text className={styles.fieldLabel}>{label}</Text>
				{help && <Text className={styles.fieldHelp}>{help}</Text>}
			</div>
			<div className={styles.fieldValue}>{children}</div>
		</div>
	);
}

export function EditorFieldStack({ children }: { children: React.ReactNode }) {
	return <div className={styles.fieldStack}>{children}</div>;
}

export function EditorTextValue({ children }: { children?: React.ReactNode }) {
	return (
		<Text className={styles.fieldText}>
			{children || "Not documented"}
		</Text>
	);
}

export function EditorStatGrid({ children }: { children: React.ReactNode }) {
	return <div className={styles.statGrid}>{children}</div>;
}

export function EditorStat({ label, value }: { label: string; value: React.ReactNode }) {
	return (
		<div className={styles.stat}>
			<Text className={styles.statLabel}>{label}</Text>
			<Text className={styles.statValue}>{value}</Text>
		</div>
	);
}

export function EditorPreview({ children }: { children: React.ReactNode }) {
	return <div className={styles.previewPanel}>{children}</div>;
}

export function EditorDivider() {
	return <div className={styles.divider} />;
}

export function EditorSaveRow({
	label = "Save changes",
	onSave,
	saved,
}: {
	label?: string;
	onSave: () => void;
	saved: boolean;
}) {
	return (
		<div className={styles.saveRow}>
			<Button appearance="primary" icon={saved ? <IconCheck /> : undefined} onClick={onSave} size="md">
				{saved ? "Saved" : label}
			</Button>
		</div>
	);
}

export function EditorPills({ items }: { items?: string[] | null }) {
	if (!items || items.length === 0) {
		return <EditorTextValue />;
	}

	return (
		<Box alignItems="center" display="flex" gap="6" style={{ flexWrap: "wrap" }}>
			{items.map((item) => (
				<Badge key={item} intent="neutral" variant="subtle" style={{ width: "fit-content" }}>
					{item}
				</Badge>
			))}
		</Box>
	);
}
