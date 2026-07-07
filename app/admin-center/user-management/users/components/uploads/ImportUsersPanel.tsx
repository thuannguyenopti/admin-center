"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Box, Button, Field, Heading, Input, Link, Text } from "@optiaxiom/react";
import { IconXmark, IconUpload } from "@optiaxiom/icons";
import { UploadProgressBar } from "./UploadProgressBar";
import { statusColor, type Upload } from "./data";

const PANEL_WIDTH = 700;

/** Sample uploads shown in "Recent uploads" once a file is selected. */
const SAMPLE_RECENT: Upload[] = [
	{ id: "rec-1", fileName: "File1.csv", uploadedBy: "noah@outlook.com", uploadedOn: "Feb 2, 2026", status: "Processing", progress: 85, usersProcessed: null, failedRecords: 0 },
	{ id: "rec-2", fileName: "File1.csv", uploadedBy: "noah@outlook.com", uploadedOn: "Feb 2, 2026", status: "Completed", progress: 100, usersProcessed: 100, failedRecords: 0 },
	{ id: "rec-3", fileName: "File1.csv", uploadedBy: "noah@outlook.com", uploadedOn: "Feb 2, 2026", status: "Failed", progress: 0, usersProcessed: 0, failedRecords: 89 },
];

function RecentUploadRow({
	upload,
	onViewDetails,
}: {
	upload: Upload;
	onViewDetails: (u: Upload) => void;
}) {
	return (
		<Box display="flex" alignItems="center" justifyContent="space-between" gap="16">
			<Box flex="1" display="flex" flexDirection="column" gap="8">
				<Text fontSize="sm" color="fg.tertiary">
					{upload.uploadedOn}
				</Text>
				<Text fontWeight="600" color="fg.default">
					{upload.fileName}
				</Text>
				{upload.status === "Processing" ? (
					<Box display="flex" flexDirection="column" gap="8">
						<UploadProgressBar value={upload.progress} />
						<Text fontSize="sm" color="fg.secondary">
							{upload.progress}% In progress to import user
						</Text>
					</Box>
				) : (
					<Text fontSize="sm" color={statusColor(upload.status)} fontWeight="500">
						{upload.status === "Completed"
							? `${upload.progress}% Completed`
							: "Failed"}
					</Text>
				)}
			</Box>
			{upload.status !== "Processing" && (
				<Button
					appearance="default"
					size="sm"
					onClick={() => onViewDetails(upload)}
				>
					View details
				</Button>
			)}
		</Box>
	);
}

export function ImportUsersPanel({
	open,
	onClose,
	onViewDetails,
}: {
	open: boolean;
	onClose: () => void;
	onViewDetails: (u: Upload) => void;
}) {
	const [fileName, setFileName] = useState<string | null>(null);
	const [recent, setRecent] = useState<Upload[]>([]);

	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		if (open) document.addEventListener("keydown", onKey);
		return () => document.removeEventListener("keydown", onKey);
	}, [open, onClose]);

	if (!open || typeof document === "undefined") return null;

	const selectFile = () => {
		// Prototype: simulate a chosen file + populate recent uploads.
		setFileName("File1.csv");
		setRecent(SAMPLE_RECENT);
	};

	return createPortal(
		<>
			<Box
				onClick={onClose}
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
				aria-label="Import users"
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
					<Heading level="2">Import users</Heading>
					<Button
						appearance="subtle"
						size="md"
						icon={<IconXmark size={20} />}
						aria-label="Close"
						onClick={onClose}
					/>
				</Box>

				<Box flex="1" overflow="auto" px="24" py="24">
					<Text color="fg.secondary" mb="16">
						Please use{" "}
						<Link href="#" onClick={(e) => e.preventDefault()}>
							this template
						</Link>{" "}
						to format your CSV file (max 10MB and 1,000 users).
					</Text>

					<Field label="Upload your CSV file" required>
						<Box display="flex" alignItems="center" gap="12">
							<Box flex="1">
								<Input
									readOnly
									value={fileName ?? ""}
									placeholder="No file chosen"
								/>
							</Box>
							<Button
								appearance="primary"
								addonBefore={<IconUpload size={16} />}
								onClick={selectFile}
							>
								Select file
							</Button>
						</Box>
					</Field>

					<Box
						my="24"
						style={{ height: 1, background: "var(--ax-colors-border-tertiary)" }}
					/>

					<Heading level="3">Recent uploads</Heading>

					{recent.length === 0 ? (
						<Box py="40" textAlign="center">
							<Text color="fg.secondary">You haven&rsquo;t uploaded any files yet.</Text>
							<Text color="fg.secondary">Upload a CSV file to add users in bulk.</Text>
						</Box>
					) : (
						<Box display="flex" flexDirection="column" gap="24" mt="16">
							<Box
								bg="bg.information.subtle"
								border="1"
								borderColor="border.tertiary"
								rounded="md"
								p="16"
							>
								<Text>
									You can safely close this modal and track the upload progress later
									in the Uploads tab.
								</Text>
							</Box>
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
					<Button appearance="primary" onClick={onClose}>
						Close
					</Button>
				</Box>
			</Box>
		</>,
		document.body,
	);
}
