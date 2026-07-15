export type FilterSection = {
	id: string;
	title: string;
	type?: "checks" | "date" | "people" | "quick";
	searchable?: boolean;
	showAll?: boolean;
	items?: string[];
	defaultOpen?: boolean;
};

export const FILTER_SECTIONS: FilterSection[] = [
	{
		id: "quick",
		title: "Quick Filters",
		type: "quick",
		defaultOpen: true,
		items: ["Starred"],
	},
	{
		id: "people",
		title: "Detected People",
		type: "people",
		searchable: true,
		showAll: true,
		defaultOpen: true,
	},
	{
		id: "formats",
		title: "File Formats",
		type: "checks",
		searchable: true,
		showAll: true,
		defaultOpen: true,
		items: ["Articles", "Audio", "Design Files", "Document", "File", "Folders", "Images", "PDF"],
	},
	{
		id: "content-model",
		title: "Content Model Name",
		type: "checks",
		searchable: true,
		showAll: true,
		defaultOpen: true,
		items: [
			"ASSET Field Scenarios",
			"Boolean Field Scenarios",
			"Choice-Checkbox Field Scenarios",
			"Choice-Dropdown Field Scenarios",
			"Choice-Radio Field Scenarios",
		],
	},
	{
		id: "content-types",
		title: "Content Types",
		type: "checks",
		defaultOpen: false,
		items: ["Original", "Licensed"],
	},
	{
		id: "created",
		title: "Created Date",
		type: "date",
		defaultOpen: false,
	},
	{
		id: "expiry",
		title: "Expiry Date",
		type: "date",
		defaultOpen: true,
	},
	{
		id: "languages",
		title: "Languages",
		type: "checks",
		searchable: true,
		showAll: true,
		defaultOpen: true,
		items: [
			"Afrikaans",
			"Albanian",
			"Arabic - العربية",
			"Bahasa - Bahasa Indonesia",
			"Bangla - বাংলা",
			"Catalan",
			"Czech - Čeština",
			"Danish - Dansk",
		],
	},
	{
		id: "modified",
		title: "Modified Date",
		type: "date",
		defaultOpen: false,
	},
	{
		id: "owner",
		title: "Owner",
		type: "checks",
		searchable: true,
		showAll: true,
		defaultOpen: false,
		items: [
			"6th Floor Living Room",
			"@WelcomeSoftware",
			"Ahmed Saquif Alam Anough",
			"A Debnath",
			"A M Saif Mahmud",
			"A.K.M. Zahiduzzaman",
			"Aaa Bb",
			"Aaron Fong",
			"Aaron Shaw",
		],
	},
	{
		id: "shared",
		title: "Shared By",
		type: "checks",
		showAll: true,
		defaultOpen: true,
		items: ["MTG4", "Martin's US Group", "Martin's France Group", "CMP Indexing Pipeline"],
	},
	{
		id: "starred",
		title: "Starred",
		type: "quick",
		defaultOpen: false,
		items: ["Starred"],
	},
	{
		id: "status",
		title: "Status",
		type: "checks",
		defaultOpen: true,
		// "Needs Review"/"Flagged" removed: those assets can never appear in Assets
		// Approved (the only consumer of this filter besides PeopleTab's incidental
		// reuse) — they live exclusively in the Assets Review queue now.
		items: ["Active", "Archived", "Expired"],
	},
	{
		id: "campaigns",
		title: "Campaigns",
		defaultOpen: true,
	},
];
