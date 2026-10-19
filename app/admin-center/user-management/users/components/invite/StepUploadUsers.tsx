"use client";

import { useRef, useState } from "react";
import {
	Banner,
	Box,
	Button,
	Field,
	Input,
	Link,
	Text,
} from "@optiaxiom/react";
import { IconTrashCan, IconUpload } from "@optiaxiom/icons";
import { BULK_IMPORT_USERS } from "../../data";
import { CollapsibleUserList } from "./CollapsibleUserList";
import type { InvitedUser } from "./types";

const MAX_CSV_BYTES = 10 * 1024 * 1024;

function sanitizeFileName(name: string): string {
	return name.replace(/[^\w.\- ()[\]]+/g, "_").slice(0, 120);
}

export function StepUploadUsers({
	users,
	setUsers,
}: {
	users: InvitedUser[];
	setUsers: (u: InvitedUser[]) => void;
}) {
	const inputRef = useRef<HTMLInputElement>(null);
	const [fileName, setFileName] = useState("");
	const [bannerOpen, setBannerOpen] = useState(true);
	const [error, setError] = useState("");

	const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		e.target.value = "";
		if (!file) return;

		const safeName = sanitizeFileName(file.name);
		if (!safeName.toLowerCase().endsWith(".csv")) {
			setError("Only CSV files are supported.");
			return;
		}
		if (file.size > MAX_CSV_BYTES) {
			setError("File must be 10MB or smaller.");
			return;
		}

		setError("");
		setFileName(safeName);
		// Prototype: simulate parsing the uploaded spreadsheet into a list of users.
		setUsers(BULK_IMPORT_USERS.map((u) => ({ ...u })));
		setBannerOpen(true);
	};

	const clearFile = () => {
		setUsers([]);
		setFileName("");
		setError("");
		setBannerOpen(true);
	};

	return (
		<Box display="flex" flexDirection="column" gap="16">
			<Box display="flex" flexDirection="column" gap="4">
				<Text fontWeight="600">Upload users</Text>
				<Text fontSize="md" color="fg.secondary">
					Use{" "}
					<Link href="#" onClick={(e) => e.preventDefault()}>
						this template
					</Link>{" "}
					to format your CSV (max 10MB, 1,000 users). Next you&apos;ll assign
					users into batches and set product or group access for each.
				</Text>
			</Box>

			<input
				ref={inputRef}
				type="file"
				accept=".csv,text/csv"
				style={{ display: "none" }}
				onChange={handleFile}
			/>

			{users.length === 0 ? (
				<Field
					label={
						<Box display="inline-flex" alignItems="center" gap="4">
							<span>CSV file</span>
							<Text asChild color="fg.error">
								<span>*</span>
							</Text>
						</Box>
					}
				>
					<Box display="flex" alignItems="center" gap="12">
						<Box flex="1">
							<Input value={fileName} placeholder="No file chosen" readOnly />
						</Box>
						<Button
							appearance="primary"
							icon={<IconUpload size={16} />}
							iconPosition="start"
							onClick={() => inputRef.current?.click()}
						>
							Select file
						</Button>
					</Box>
				</Field>
			) : (
				<>
					<Box
						display="flex"
						alignItems="center"
						justifyContent="space-between"
						gap="12"
					>
						<Box display="flex" flexDirection="column" gap="2">
							<Text fontSize="sm" color="fg.secondary">
								File
							</Text>
							<Text fontWeight="500">{fileName || "users.csv"}</Text>
						</Box>
						<Button
							appearance="subtle"
							size="sm"
							icon={<IconTrashCan size={16} />}
							iconPosition="start"
							onClick={clearFile}
						>
							Replace file
						</Button>
					</Box>

					{bannerOpen && (
						<Banner intent="success" onDismiss={() => setBannerOpen(false)}>
							<Text fontSize="sm">
								{`${users.length} user${users.length === 1 ? "" : "s"} imported. Continue to select batches and assign access.`}
							</Text>
						</Banner>
					)}

					<Box display="flex" flexDirection="column" gap="8">
						<Text fontWeight="600">Imported users</Text>
						<CollapsibleUserList users={users} limit={8} />
					</Box>
				</>
			)}

			{error && (
				<Banner intent="danger">
					<Text fontSize="sm">{error}</Text>
				</Banner>
			)}
		</Box>
	);
}
