export const dataVizCategoricalColors = [
	{ name: "blue", value: "#3585F5" },
	{ name: "orange", value: "#FF812D" },
	{ name: "green", value: "#43A047" },
	{ name: "yellow", value: "#FFC934" },
	{ name: "red", value: "#D83734" },
	{ name: "purple", value: "#AB47BC" },
	{ name: "teal", value: "#4CD7CA" },
	{ name: "pink", value: "#FF4B82" },
	{ name: "slate", value: "#8491B4" },
	{ name: "tan", value: "#B98B6E" },
] as const;

export const dataVizCategoricalColorMap = Object.fromEntries(
	dataVizCategoricalColors.map((entry) => [entry.name, entry.value])
) as Record<(typeof dataVizCategoricalColors)[number]["name"], string>;

export const dataVizSequentialPalettes = {
	blue: ["#EDF5FF", "#D9EAFF", "#BEDBFF", "#9CC6FF", "#73ADFE", "#4E93FB", "#3585F5", "#2469CF", "#184CA5", "#0B2F77"],
	teal: ["#EBFBFA", "#CEF3F1", "#AEEBE7", "#83DFDA", "#59D1CA", "#35C0B8", "#1BA49E", "#12837D", "#0B625D", "#053F3C"],
	red: ["#FDECEC", "#FAD7D8", "#F6BCBD", "#F19999", "#EA7170", "#E2514F", "#D83734", "#B92724", "#921A18", "#6B0E0E"],
} as const;

export const dataVizCoreColorFamilies = {
	default: ["#EDF5FF", "#D9EAFF", "#BEDBFF", "#9CC6FF", "#73ADFE", "#4E93FB", "#3585F5", "#2469CF", "#184CA5", "#0B2F77"],
	positive: ["#F0F8F0", "#D9EDD9", "#B9DEB8", "#96CF94", "#72C06F", "#55AD53", "#43A047", "#2F7D32", "#1E5C23", "#0C3D14"],
	negative: ["#FDECEC", "#FAD7D8", "#F6BCBD", "#F19999", "#EA7170", "#E2514F", "#D83734", "#B92724", "#921A18", "#6B0E0E"],
	orange: ["#FCF4EA", "#F7DEC0", "#F5C087", "#F8A75B", "#FB8E38", "#FF812D", "#EF6C00", "#D95B00", "#B74900", "#8B3600"],
	yellow: ["#FBF6E6", "#F6E7B5", "#F4D976", "#F8CF4E", "#FBCB38", "#FFC934", "#E2B100", "#B88C00", "#876500", "#5F4600"],
	purple: ["#F5ECF8", "#E3CDEB", "#D0AEE1", "#BE86D5", "#B564CF", "#AB47BC", "#9031A0", "#73237F", "#58175F", "#3B0D41"],
	teal: ["#ECF8FA", "#C9EAF1", "#A0D8E2", "#72C8D6", "#47B9CC", "#1FA9C1", "#118DA7", "#0A7087", "#055568", "#023C4B"],
	pink: ["#FCEBF1", "#F8D0DD", "#F5AEC4", "#F282A9", "#F35C91", "#FF4B82", "#E0336C", "#BC1F57", "#931343", "#690930"],
	tan: ["#F7F2EE", "#EADDD3", "#DCC3AE", "#CAA785", "#B98B6E", "#A67458", "#885A42", "#6B4332", "#4E3024", "#352018"],
	neutral: ["#F7F7F8", "#ECECEE", "#D9D9DC", "#C3C4C8", "#ABACB1", "#8F9097", "#6F7077", "#505158", "#34353B", "#1E1F24"],
} as const;

export const dataVizDivergingPalettes = {
	orangeTeal: ["#B44D06", "#D36E1D", "#E98E43", "#F3B16E", "#F8D3AD", "#FBF6EE", "#D2EEEA", "#9DDFD7", "#66CAC0", "#2FADA2", "#0F7F77"],
	pinkBlue: ["#AE1F63", "#CB357C", "#E15897", "#EE84B4", "#F6B8D1", "#FCF5F8", "#D9E8FA", "#AACEF4", "#73ADEB", "#3E87E0", "#215DB7"],
	yellowGreen: ["#8C6C03", "#B18D11", "#CDAC23", "#E4C84C", "#F0DE84", "#FBF7EA", "#DCEFD7", "#B9DEA8", "#88C77C", "#56AB55", "#2E8138"],
	greenRed: ["#1F6F2B", "#388A3E", "#59A452", "#7FC06F", "#ACD9A0", "#FAF4F0", "#F2C7BF", "#E89A91", "#DC706A", "#CD4A46", "#AA2525"],
} as const;

export const dataVizSemanticColors = {
	good: {
		subtle: "#E6F4E8",
		default: "#43A047",
		strong: "#2F7D32",
	},
	moderate: {
		subtle: "#FFF3D7",
		default: "#E4A700",
		strong: "#A87400",
	},
	bad: {
		subtle: "#FBE1E0",
		default: "#D83734",
		strong: "#A52320",
	},
} as const;

export const dataVizNeutralScale = [
	"#F7F7F8",
	"#ECECEE",
	"#D9D9DC",
	"#C3C4C8",
	"#ABACB1",
	"#8F9097",
	"#6F7077",
	"#505158",
	"#34353B",
	"#1E1F24",
] as const;

export const dataVizSemanticIntents = {
	good: "success",
	moderate: "warning",
	bad: "danger",
} as const;

export type DataVizCategoricalColorName = keyof typeof dataVizCategoricalColorMap;
export type DataVizSequentialPaletteName = keyof typeof dataVizSequentialPalettes;
export type DataVizDivergingPaletteName = keyof typeof dataVizDivergingPalettes;
export type DataVizSemanticName = keyof typeof dataVizSemanticColors;
export type DataVizCoreColorFamilyName = keyof typeof dataVizCoreColorFamilies;

export function getDataVizCategoricalColor(index: number) {
	return dataVizCategoricalColors[index % dataVizCategoricalColors.length]?.value ?? dataVizCategoricalColors[0].value;
}

export function getDataVizSequentialColor(name: DataVizSequentialPaletteName, index: number) {
	const palette = dataVizSequentialPalettes[name];
	return palette[Math.max(0, Math.min(index, palette.length - 1))];
}

export function getDataVizCoreColor(name: DataVizCoreColorFamilyName, index: number) {
	const palette = dataVizCoreColorFamilies[name];
	return palette[Math.max(0, Math.min(index, palette.length - 1))];
}

export function getDataVizDivergingColor(name: DataVizDivergingPaletteName, index: number) {
	const palette = dataVizDivergingPalettes[name];
	return palette[Math.max(0, Math.min(index, palette.length - 1))];
}

export function getDataVizSemanticColor(name: DataVizSemanticName, tone: keyof (typeof dataVizSemanticColors)[DataVizSemanticName] = "default") {
	return dataVizSemanticColors[name][tone];
}
