"use client";

import { Box, Button, Text } from "@optiaxiom/react";
import { UploadProgressBar } from "./UploadProgressBar";
import { statusColor, type Upload } from "./data";

export function RecentUploadRow({
	upload,
	onViewDetails,
}: {
	upload: Upload;
	onViewDetails: (u: Upload) => void;
}) {
	return (
		<Box
			display="flex"
			alignItems="center"
			justifyContent="space-between"
			gap="16"
		>
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
							{upload.progress}% importing users…
						</Text>
					</Box>
				) : (
					<Text
						fontSize="sm"
						color={statusColor(upload.status)}
						fontWeight="500"
					>
						{upload.status === "Completed"
							? `Completed · ${upload.usersProcessed ?? 0} users`
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
