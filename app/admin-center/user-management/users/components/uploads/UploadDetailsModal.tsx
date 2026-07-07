"use client";

import { Banner, Box, Button, Text, toaster } from "@optiaxiom/react";
import { BulkModalShell } from "../bulk/BulkModalShell";
import { UploadProgressBar } from "./UploadProgressBar";
import { statusColor, type Upload } from "./data";

function DetailField({ label, value }: { label: string; value: React.ReactNode }) {
	return (
		<Box display="flex" flexDirection="column" gap="4">
			<Text color="fg.secondary">{label}</Text>
			<Text fontWeight="600" color="fg.default">
				{value}
			</Text>
		</Box>
	);
}

export function UploadDetailsModal({
	upload,
	onClose,
}: {
	upload: Upload;
	onClose: () => void;
}) {
	const isProcessing = upload.status === "Processing";
	const isCompleted = upload.status === "Completed";

	return (
		<BulkModalShell
			title="Upload details"
			onClose={onClose}
			height="auto"
			footer={
				<Button appearance="primary" onClick={onClose}>
					Close
				</Button>
			}
		>
			<Box display="flex" flexDirection="column" gap="20" pt="8">
				{isProcessing && (
					<Box display="flex" flexDirection="column" gap="8">
						<UploadProgressBar value={upload.progress} />
						<Text color="fg.secondary">
							{upload.progress}% In progress to import user
						</Text>
					</Box>
				)}

				{isCompleted && (
					<Banner intent="success">
						<Text>
							Upload completed - {upload.usersProcessed} users processed successfully
						</Text>
					</Banner>
				)}

				<DetailField label="File name" value={upload.fileName} />
				<DetailField label="Upload by" value={upload.uploadedBy} />
				<DetailField label="Upload on" value={upload.uploadedOn} />
				<Box display="flex" flexDirection="column" gap="4">
					<Text color="fg.secondary">Status</Text>
					<Text fontWeight="600" color={statusColor(upload.status)}>
						{upload.status}
					</Text>
				</Box>
				<DetailField
					label="Users processed"
					value={
						upload.usersProcessed === null
							? "N/A"
							: `${upload.usersProcessed} users`
					}
				/>
				<DetailField label="Failed Records" value={upload.failedRecords} />

				{isCompleted && (
					<Box display="flex" flexDirection="column" gap="8">
						<Text color="fg.secondary">
							Download the original CSV file used for this upload
						</Text>
						<Box>
							<Button
								appearance="default"
								onClick={() =>
									toaster.create("Downloading uploaded file…", {
										intent: "information",
									})
								}
							>
								Download uploaded file
							</Button>
						</Box>
					</Box>
				)}
			</Box>
		</BulkModalShell>
	);
}
