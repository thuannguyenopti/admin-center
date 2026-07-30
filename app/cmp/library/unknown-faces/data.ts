export type UnknownFace = {
	id: string;
	label: string;
	heroImage: string;
	faceBox: { top: number; left: number; width: number; height: number };
	suggestedName?: string;
	suggestionConfidencePct?: number;
	detectedIn: number;
	firstSeen: string;
	otherAppearances?: string[];
};

export const unknownFaces: UnknownFace[] = [
	{
		id: "u-1",
		label: "Swimmer #01",
		heroImage: "/people/action-swim-m.jpg",
		faceBox: { top: 38, left: 44, width: 12, height: 14 },
		suggestedName: "Kenji Tanaka",
		suggestionConfidencePct: 89,
		detectedIn: 5,
		firstSeen: "Mar 14, 2025",
		otherAppearances: [
			"/people/action-tri-road-m.jpg",
			"/people/portrait-m-2.jpg",
			"/people/portrait-m-4.jpg",
		],
	},
	{
		id: "u-2",
		label: "Cyclist #04",
		heroImage: "/people/action-peloton-1.jpg",
		faceBox: { top: 16, left: 36, width: 18, height: 20 },
		suggestedName: "David Jones",
		suggestionConfidencePct: 82,
		detectedIn: 3,
		firstSeen: "Apr 02, 2025",
		otherAppearances: [
			"/people/portrait-m-3.jpg",
			"/people/portrait-m-5.jpg",
		],
	},
	{
		id: "u-3",
		label: "Runner #11",
		heroImage: "/people/action-fitness-f.jpg",
		faceBox: { top: 24, left: 62, width: 14, height: 18 },
		suggestedName: "Priya Sharma",
		suggestionConfidencePct: 78,
		detectedIn: 4,
		firstSeen: "Apr 09, 2025",
		otherAppearances: [
			"/people/portrait-f-4.jpg",
		],
	},
	{
		id: "u-4",
		label: "Spectator (Unidentified)",
		heroImage: "/people/portrait-f-meeting.jpg",
		faceBox: { top: 22, left: 65, width: 18, height: 30 },
		detectedIn: 1,
		firstSeen: "Apr 12, 2025",
	},
	{
		id: "u-5",
		label: "Cyclist #11",
		heroImage: "/people/action-tri-road-m.jpg",
		faceBox: { top: 22, left: 18, width: 12, height: 18 },
		suggestedName: "Ben Oakman",
		suggestionConfidencePct: 92,
		detectedIn: 7,
		firstSeen: "Apr 18, 2025",
		otherAppearances: [
			"/people/portrait-m-gym.jpg",
		],
	},
	{
		id: "u-6",
		label: "Triathlete #02",
		heroImage: "/people/action-yoga-f.jpg",
		faceBox: { top: 22, left: 12, width: 12, height: 18 },
		detectedIn: 2,
		firstSeen: "May 01, 2025",
	},
];
