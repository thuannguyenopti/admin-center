export type SavedPageRecord = {
	id: string;
	name: string;
	usedInExperiments: number;
};

export const MOCK_SAVED_PAGES: readonly SavedPageRecord[] = [
	{ id: "sp-home", name: "Homepage", usedInExperiments: 5 },
	{ id: "sp-events", name: "Events Page", usedInExperiments: 1 },
	{ id: "sp-contact", name: "Contact Us Page", usedInExperiments: 2 },
	{ id: "sp-pdp", name: "Product Detail Page", usedInExperiments: 4 },
	{ id: "sp-checkout", name: "Checkout Page", usedInExperiments: 3 },
	{ id: "sp-account", name: "Account Page", usedInExperiments: 2 },
] as const;
