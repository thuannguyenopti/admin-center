"use client";

import { Box, Button, Text } from "@optiaxiom/react";
import { IconUpload } from "@optiaxiom/icons";
import { Table, Tr, Th, Td } from "@/app/components/Table";
import { statusColor, type Upload } from "./data";

export function UploadJobsSection({
	files,
	onViewDetails,
	onOpenImport,
}: {
	files: Upload[];
	onViewDetails: (u: Upload) => void;
	onOpenImport: () => void;
}) {
	return (
		<Box display="flex" flexDirection="column" gap="12">
			<Box
				display="flex"
				alignItems="center"
				justifyContent="space-between"
				gap="12"
			>
				<Box display="flex" flexDirection="column" gap="2">
					<Text fontWeight="600">Upload jobs</Text>
					<Text fontSize="sm" color="fg.secondary">
						Track file status. Completed files populate the staging list below.
					</Text>
				</Box>
				<Button
					appearance="default"
					size="sm"
					icon={<IconUpload size={16} />}
					iconPosition="start"
					onClick={onOpenImport}
				>
					Import file
				</Button>
			</Box>

			{files.length === 0 ? (
				<Box
					py="32"
					px="16"
					textAlign="center"
					rounded="md"
					border="1"
					borderColor="border.tertiary"
				>
					<Text color="fg.tertiary">
						No uploads yet. Click Import file to select a CSV.
					</Text>
				</Box>
			) : (
				<Table>
					<thead>
						<Tr>
							<Th>File name</Th>
							<Th>Uploaded by</Th>
							<Th>Upload date</Th>
							<Th>Status</Th>
							<Th>Records</Th>
						</Tr>
					</thead>
					<tbody>
						{files.map((f) => (
							<Tr key={f.id} onClick={() => onViewDetails(f)}>
								<Td>
									<Text fontWeight="500">{f.fileName}</Text>
								</Td>
								<Td>{f.uploadedBy}</Td>
								<Td>{f.uploadedOn}</Td>
								<Td>
									<Text
										asChild
										color={statusColor(f.status)}
										fontWeight="500"
									>
										<span>
											{f.status === "Processing"
												? `Processing ${f.progress}%`
												: f.status}
										</span>
									</Text>
								</Td>
								<Td>
									<Text fontSize="sm" color="fg.secondary">
										{f.status === "Processing"
											? "—"
											: `${f.usersProcessed ?? 0} ok · ${f.failedRecords} failed`}
									</Text>
								</Td>
							</Tr>
						))}
					</tbody>
				</Table>
			)}
		</Box>
	);
}
