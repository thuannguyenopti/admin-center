export type UploadStatus = "Processing" | "Completed" | "Failed";

export type Upload = {
	id: string;
	fileName: string;
	uploadedBy: string;
	uploadedOn: string;
	status: UploadStatus;
	/** 0–100, only meaningful while Processing. */
	progress: number;
	/** Users successfully processed (null while still Processing). */
	usersProcessed: number | null;
	failedRecords: number;
};

export const UPLOADS: Upload[] = [
	{ id: "up-1", fileName: "Myadmin.csv", uploadedBy: "noah@outlook.com", uploadedOn: "Jul 21, 2022", status: "Processing", progress: 85, usersProcessed: null, failedRecords: 0 },
	{ id: "up-2", fileName: "Myadmin.csv", uploadedBy: "noah@outlook.com", uploadedOn: "Jul 21, 2022", status: "Completed", progress: 100, usersProcessed: 100, failedRecords: 0 },
	{ id: "up-3", fileName: "Myadmin.csv", uploadedBy: "olivia@outlook.com", uploadedOn: "Jul 21, 2022", status: "Completed", progress: 100, usersProcessed: 240, failedRecords: 3 },
	{ id: "up-4", fileName: "Myadmin.csv", uploadedBy: "liam@optimizely.com", uploadedOn: "Jul 21, 2022", status: "Completed", progress: 100, usersProcessed: 88, failedRecords: 0 },
	{ id: "up-5", fileName: "Myadmin.csv", uploadedBy: "emma@optimizely.com", uploadedOn: "Jul 21, 2022", status: "Completed", progress: 100, usersProcessed: 512, failedRecords: 12 },
	{ id: "up-6", fileName: "Myadmin.csv", uploadedBy: "noah@outlook.com", uploadedOn: "Jul 21, 2022", status: "Completed", progress: 100, usersProcessed: 64, failedRecords: 0 },
	{ id: "up-7", fileName: "Myadmin.csv", uploadedBy: "ava@optimizely.com", uploadedOn: "Jul 21, 2022", status: "Completed", progress: 100, usersProcessed: 320, failedRecords: 5 },
	{ id: "up-8", fileName: "Myadmin.csv", uploadedBy: "william@outlook.com", uploadedOn: "Jul 21, 2022", status: "Failed", progress: 0, usersProcessed: 0, failedRecords: 150 },
	{ id: "up-9", fileName: "Myadmin.csv", uploadedBy: "sophia@optimizely.com", uploadedOn: "Jul 21, 2022", status: "Failed", progress: 0, usersProcessed: 0, failedRecords: 42 },
	{ id: "up-10", fileName: "Myadmin.csv", uploadedBy: "james@outlook.com", uploadedOn: "Jul 21, 2022", status: "Failed", progress: 0, usersProcessed: 0, failedRecords: 1000 },
	{ id: "up-11", fileName: "Myadmin.csv", uploadedBy: "mia@optimizely.com", uploadedOn: "Jul 21, 2022", status: "Failed", progress: 0, usersProcessed: 0, failedRecords: 7 },
	{ id: "up-12", fileName: "Myadmin.csv", uploadedBy: "noah@outlook.com", uploadedOn: "Jul 21, 2022", status: "Failed", progress: 0, usersProcessed: 0, failedRecords: 89 },
];

export function statusColor(status: UploadStatus): "fg.warning" | "fg.success" | "fg.error" {
	if (status === "Processing") return "fg.warning";
	if (status === "Completed") return "fg.success";
	return "fg.error";
}
