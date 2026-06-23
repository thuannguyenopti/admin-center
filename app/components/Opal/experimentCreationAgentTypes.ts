export type SavedPageCatalogItem = {
	id: string;
	name: string;
	usedInExperiments: number;
};

export type ExperimentCreationAgentPayload = {
	/** Short assistant copy shown above the adaptive card */
	intro: string;
	name: string;
	description: string;
	hypothesis: string;
	/** Human-readable target type: "URL" or "Saved Pages" */
	targetBy: string;
	/** URL mode: prefilled destination (newline-separated URLs or helper copy) */
	url: string;
	/** Catalog for Saved Pages picker (snapshot from draft context) */
	savedPagesCatalog?: SavedPageCatalogItem[];
	/** Saved Pages mode: search box initial value from draft */
	savedPagesSearchInitial?: string;
	/** Saved Pages mode: initially selected page ids from draft */
	savedPageIdsInitial?: string[];
};
