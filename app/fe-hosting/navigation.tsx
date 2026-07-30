import {IconList} from "@optiaxiom/icons";

export const feHostingNav = [
	{
		label: "Applications",
		url: "/fe-hosting/applications/apps",
		highlight: "/fe-hosting/applications",
		icon: <IconList />,
		children: [
			{
				label: "Applications",
				url: "/fe-hosting/applications/apps",
				children: {
					title: "Stride",
					children: [
						{
							label: "Application Overview",
							url: "/fe-hosting/applications/apps/mosey-bank/overview",
							children: {
								title: "Deployment 5",
								children: [
									{
										label: "Deployment Overview",
										url: "/fe-hosting/applications/apps/mosey-bank/overview/deploy-5",
									},
								],
							},
						},
						{
							label: "Settings",
							url: "/fe-hosting/applications/apps/mosey-bank/settings",
						},
					],
				},
			},
		],
	},
];
