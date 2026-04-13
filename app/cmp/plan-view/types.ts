export type PlanItem = {
	id: string;
	title: string;
	type: "Task" | "Campaign";
	reference: string;
	owner: { name: string; src: string };
	creationDate: string;
	startDate: string;
	endDate: string;
	status: string;
	parentCampaign: string | null;
	lastModified: string;
	currentStep: string | null;
	currentStepName: string | null;
	badge?: number;
	isGroup?: boolean;
};
