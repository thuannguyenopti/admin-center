"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toaster } from "@optiaxiom/react";
import type { StagingUser, Upload } from "./data";
import {
	formatUploadDate,
	parseImportCsvFile,
	parsedRowsToStaging,
	type ImportParseMode,
} from "./parseImportCsv";

function sanitizeDisplayName(name: string): string {
	return name.replace(/[^\w.\- ()[\]]+/g, "_").slice(0, 120);
}

export function useImportJob({
	systemEmails,
	onJobUpdate,
	onJobComplete,
	mode = "users",
}: {
	systemEmails: string[];
	onJobUpdate: (job: Upload) => void;
	onJobComplete: (job: Upload, staging: StagingUser[]) => void;
	mode?: ImportParseMode;
}) {
	const [fileName, setFileName] = useState("");
	const [error, setError] = useState("");
	const [busy, setBusy] = useState(false);
	const timersRef = useRef<number[]>([]);
	const busyRef = useRef(false);
	busyRef.current = busy;

	useEffect(() => {
		return () => {
			timersRef.current.forEach((id) => window.clearTimeout(id));
			timersRef.current = [];
		};
	}, []);

	const clearTimers = () => {
		timersRef.current.forEach((id) => window.clearTimeout(id));
		timersRef.current = [];
	};

	/** Clear form UI (filename + banner). Failed jobs stay in Recent uploads. */
	const resetForm = useCallback(() => {
		if (busyRef.current) return;
		setFileName("");
		setError("");
	}, []);

	const runProgressThenComplete = (
		base: Upload,
		staging: StagingUser[],
		failedRecords: number,
	) => {
		clearTimers();
		setBusy(true);
		const steps = [15, 35, 55, 75, 90, 100];
		steps.forEach((progress, i) => {
			const id = window.setTimeout(() => {
				const next: Upload = {
					...base,
					progress,
					status: progress < 100 ? "Processing" : "Completed",
					usersProcessed: progress < 100 ? null : staging.length,
					failedRecords,
				};
				onJobUpdate(next);
				if (progress === 100) {
					onJobComplete(next, staging);
					setBusy(false);
					toaster.create(
						`Imported ${staging.length} user${staging.length === 1 ? "" : "s"} into staging`,
						{ intent: "success" },
					);
				}
			}, 280 * (i + 1));
			timersRef.current.push(id);
		});
	};

	const handleFileChange = async (
		e: React.ChangeEvent<HTMLInputElement>,
	) => {
		const file = e.target.files?.[0];
		e.target.value = "";
		if (!file || busy) return;

		// New selection replaces previous file's form error immediately
		setFileName(sanitizeDisplayName(file.name));
		setError("");

		const result = await parseImportCsvFile(file, mode);
		setFileName(result.fileName);

		if (!result.ok) {
			// Banner is scoped to this filename; job history keeps the failure too
			setError(result.message);
			onJobUpdate({
				id: `up-${Date.now()}`,
				fileName: result.fileName,
				uploadedBy: "you@optimizely.com",
				uploadedOn: formatUploadDate(),
				status: "Failed",
				progress: 0,
				usersProcessed: 0,
				failedRecords: 0,
			});
			toaster.create(`${result.fileName}: ${result.message}`, {
				intent: "danger",
			});
			return;
		}

		const uploadId = `up-${Date.now()}`;
		const staging = parsedRowsToStaging(
			uploadId,
			result.fileName,
			result.rows,
			systemEmails,
			mode,
		);
		const job: Upload = {
			id: uploadId,
			fileName: result.fileName,
			uploadedBy: "you@optimizely.com",
			uploadedOn: formatUploadDate(),
			status: "Processing",
			progress: 0,
			usersProcessed: null,
			failedRecords: result.failedRecords,
		};
		onJobUpdate(job);
		// Success: clear form — progress lives on the job row
		setFileName("");
		setError("");
		runProgressThenComplete(job, staging, result.failedRecords);
	};

	return { fileName, error, busy, handleFileChange, resetForm };
}
