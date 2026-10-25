"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
	Banner,
	Box,
	Button,
	Field,
	Heading,
	Input,
	Link,
	Text,
} from "@optiaxiom/react";
import { IconUpload, IconXmark } from "@optiaxiom/icons";
import { RecentUploadRow } from "./RecentUploadRow";
import type { StagingUser, Upload } from "./data";
import {
	downloadGroupAccessTemplate,
	downloadImportTemplate,
	type ImportParseMode,
} from "./parseImportCsv";
import { useImportJob } from "./useImportJob";

const PANEL_WIDTH = 700;

export function ImportUsersPanel({
	open,
	onClose,
	onViewDetails,
	recentUploads,
	systemEmails,
	onJobUpdate,
	onJobComplete,
	onGoToUploadTab,
	mode = "users",
}: {
	open: boolean;
	onClose: () => void;
	onViewDetails: (u: Upload) => void;
	recentUploads: Upload[];
	systemEmails: string[];
	onJobUpdate: (job: Upload) => void;
	onJobComplete: (job: Upload, staging: StagingUser[]) => void;
	onGoToUploadTab: () => void;
	mode?: ImportParseMode;
}) {
	const inputRef = useRef<HTMLInputElement>(null);
	const isGroupAccess = mode === "groupAccess";
	const { fileName, error, busy, handleFileChange, resetForm } = useImportJob({
		systemEmails,
		onJobUpdate,
		onJobComplete,
		mode,
	});

	// Clear form when panel closes so the next open starts empty.
	// Parse failures stay on that file's Failed row in Recent uploads.
	useEffect(() => {
		if (open) return;
		resetForm();
		if (inputRef.current) inputRef.current.value = "";
	}, [open, resetForm]);

	useEffect(() => {
		if (!open) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape" && !busy) onClose();
		};
		document.addEventListener("keydown", onKey);
		return () => document.removeEventListener("keydown", onKey);
	}, [open, onClose, busy]);

	if (!open || typeof document === "undefined") return null;

	const recent = recentUploads.slice(0, 8);
	const title = isGroupAccess
		? "Import by group access"
		: "Import users";
	const templateLabel = isGroupAccess
		? "columns: email, first_name, last_name, group_name — group_name must match an existing group"
		: "columns: email, first_name, last_name in any order — CSV or Excel, max 10MB, 1,000 users";

	return createPortal(
		<>
			<Box
				onClick={() => !busy && onClose()}
				style={{
					position: "fixed",
					inset: 0,
					zIndex: 1000,
					background: "var(--ax-colors-bg-overlay)",
				}}
			/>
			<Box
				role="dialog"
				aria-modal="true"
				aria-label={title}
				bg="bg.default"
				display="flex"
				flexDirection="column"
				style={{
					position: "fixed",
					top: 0,
					right: 0,
					bottom: 0,
					width: PANEL_WIDTH,
					maxWidth: "100vw",
					zIndex: 1001,
					boxShadow: "var(--ax-shadows-xl)",
				}}
			>
				<Box
					display="flex"
					alignItems="center"
					justifyContent="space-between"
					px="24"
					py="20"
					borderB="1"
					borderColor="border.tertiary"
				>
					<Heading level="2">{title}</Heading>
					<Button
						appearance="subtle"
						size="md"
						icon={<IconXmark size={20} />}
						aria-label="Close"
						disabled={busy}
						onClick={onClose}
					/>
				</Box>

				<Box flex="1" overflow="auto" px="24" py="24">
					<Text color="fg.secondary" mb="16">
						Use{" "}
						<Link
							href="#"
							onClick={(e) => {
								e.preventDefault();
								if (isGroupAccess) downloadGroupAccessTemplate();
								else downloadImportTemplate();
							}}
						>
							this template
						</Link>{" "}
						({templateLabel}).
						{isGroupAccess
							? " Matched groups apply product, instance, and role in staging."
							: " Imported users go to the Upload tab staging list."}
					</Text>

					<input
						ref={inputRef}
						type="file"
						accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
						style={{ display: "none" }}
						onChange={handleFileChange}
					/>

					<Field
						label={
							<Box display="inline-flex" alignItems="center" gap="4">
								<span>Spreadsheet file</span>
								<Text asChild color="fg.error">
									<span>*</span>
								</Text>
							</Box>
						}
					>
						<Box display="flex" alignItems="center" gap="12">
							<Box flex="1">
								<Input
									readOnly
									value={fileName}
									placeholder="No file chosen"
								/>
							</Box>
							<Button
								appearance="primary"
								icon={<IconUpload size={16} />}
								iconPosition="start"
								disabled={busy}
								onClick={() => inputRef.current?.click()}
							>
								Select file
							</Button>
						</Box>
					</Field>

					{error && fileName && (
						<Box mt="12">
							<Banner intent="danger">
								<Text fontSize="sm">
									{fileName}: {error}
								</Text>
							</Banner>
						</Box>
					)}

					<Box
						my="24"
						style={{
							height: 1,
							background: "var(--ax-colors-border-tertiary)",
						}}
					/>

					<Box
						display="flex"
						alignItems="center"
						justifyContent="space-between"
						gap="12"
						mb="12"
					>
						<Heading level="3">Recent uploads</Heading>
						{recent.length > 0 && (
							<Button
								appearance="subtle"
								size="sm"
								onClick={() => {
									onGoToUploadTab();
									onClose();
								}}
							>
								Open Upload tab
							</Button>
						)}
					</Box>

					{recent.length === 0 ? (
						<Box py="40" textAlign="center">
							<Text color="fg.secondary">
								You haven&rsquo;t uploaded any files yet.
							</Text>
							<Text color="fg.secondary">
								{isGroupAccess
									? "Select a CSV with group_name to import users into staging."
									: "Select a CSV to import users into staging."}
							</Text>
						</Box>
					) : (
						<Box display="flex" flexDirection="column" gap="24" mt="8">
							<Banner intent="information">
								<Text fontSize="sm">
									{isGroupAccess
										? "You can close this panel and track progress in the Upload tab. Users with a matched group can import with that group’s access."
										: "You can close this panel and track progress in the Upload tab. After import completes, assign access from staging."}
								</Text>
							</Banner>
							{recent.map((u) => (
								<RecentUploadRow
									key={u.id}
									upload={u}
									onViewDetails={onViewDetails}
								/>
							))}
						</Box>
					)}
				</Box>

				<Box
					display="flex"
					justifyContent="end"
					gap="12"
					px="24"
					py="16"
					borderT="1"
					borderColor="border.tertiary"
					bg="bg.page"
				>
					<Button appearance="primary" disabled={busy} onClick={onClose}>
						Close
					</Button>
				</Box>
			</Box>
		</>,
		document.body,
	);
}
