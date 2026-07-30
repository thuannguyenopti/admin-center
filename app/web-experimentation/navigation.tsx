import {
	IconCodeBranch,
	IconHouse,
	IconFlask,
	IconUsers,
	IconCode,
	IconClock,
	IconGear,
	IconUserGroup,
	IconLightbulb,
} from "@optiaxiom/icons";

export const webExperimentationNav = [
	{
		label: "Projects",
		url: "/web-experimentation",
		highlight: "/web-experimentation/projects",
		icon: <IconCodeBranch />,
	},
	{
		label: "Home",
		url: "/web-experimentation/home",
		highlight: "/web-experimentation/home",
		icon: <IconHouse />,
	},
	{
		label: "Optimizations",
		url: "/web-experimentation/optimizations",
		highlight: "/web-experimentation/optimizations",
		icon: <IconFlask />,
		instantShell: true,
		children: [
			{
				label: "Optimization Details",
				url: "/web-experimentation/optimizations/",
				customLayout: true,
			},
		],
	},
	{
		label: "Audiences",
		url: "/web-experimentation",
		highlight: "/web-experimentation/audiences",
		icon: <IconUsers />,
	},
	{
		label: "Implementation",
		url: "/web-experimentation",
		highlight: "/web-experimentation/implementation",
		icon: <IconCode />,
	},
	{
		label: "History",
		url: "/web-experimentation",
		highlight: "/web-experimentation/history",
		icon: <IconClock />,
	},
	{
		label: "Settings",
		url: "/web-experimentation",
		highlight: "/web-experimentation/settings",
		icon: <IconGear />,
	},
	{
		label: "Collaborate",
		url: "/web-experimentation",
		highlight: "/web-experimentation/collaborate",
		icon: <IconUserGroup />,
	},
	{
		label: "Ideas",
		description: "Generate data-driven experiments powered by your content.",
		url: "/web-experimentation",
		highlight: "/web-experimentation",
		icon: <IconLightbulb />,
		exact: true,
	},
];
