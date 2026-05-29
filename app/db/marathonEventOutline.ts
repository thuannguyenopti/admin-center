import type { Outline } from "@/app/db/initialData";

export const MARATHON_EVENT_OUTLINE: Outline = {
	id: "ol-marathon-main",
	title: "Main",
	tree: [
		{
			id: "sec-marathon-hero",
			name: "Hero",
			open: true,
			noPadding: true,
			children: [
				{
					id: "row-marathon-hero",
					open: true,
					children: [
						{
							id: "col-marathon-hero",
							open: true,
							elements: [{ id: "ele-marathon-hero" }],
						},
					],
				},
			],
		},
		{
			id: "sec-marathon-signup",
			name: "Sign-up",
			open: true,
			displayTemplateKey: "defaultSection",
			displaySettings: [{ key: "spacing", value: "default" }],
			children: [
				{
					id: "row-marathon-signup",
					open: true,
					children: [
						{
							id: "col-marathon-signup-copy",
							open: true,
							elements: [{ id: "ele-marathon-signup-header" }],
						},
						{
							id: "col-marathon-signup-form",
							open: true,
							elements: [
								{ id: "ele-marathon-form-heading" },
								{ id: "ele-marathon-form-name" },
								{ id: "ele-marathon-form-email" },
								{ id: "ele-marathon-form-time" },
								{ id: "ele-marathon-form-shirt" },
								{ id: "ele-marathon-form-button" },
							],
						},
					],
				},
			],
		},
		{
			id: "sec-marathon-community",
			name: "Community",
			open: true,
			displayTemplateKey: "defaultSection",
			displaySettings: [{ key: "spacing", value: "default" }],
			children: [
				{
					id: "row-marathon-community",
					open: true,
					children: [
						{
							id: "col-marathon-community-copy",
							open: true,
							elements: [
								{ id: "ele-marathon-community-header" },
								{ id: "ele-marathon-community-button" },
							],
						},
						{
							id: "col-marathon-community-image",
							open: true,
							elements: [{ id: "ele-marathon-community-image" }],
						},
					],
				},
			],
		},
		{
			id: "sec-marathon-features",
			name: "Features",
			open: true,
			displayTemplateKey: "defaultSection",
			displaySettings: [{ key: "spacing", value: "default" }],
			children: [
				{
					id: "row-marathon-features",
					open: true,
					children: [
						{ id: "col-marathon-feat-1", open: true, elements: [{ id: "ele-marathon-feat-1" }] },
						{ id: "col-marathon-feat-2", open: true, elements: [{ id: "ele-marathon-feat-2" }] },
						{ id: "col-marathon-feat-3", open: true, elements: [{ id: "ele-marathon-feat-3" }] },
						{ id: "col-marathon-feat-4", open: true, elements: [{ id: "ele-marathon-feat-4" }] },
					],
				},
			],
		},
	],
	elements: {
		"ele-marathon-hero": {
			type: "ct-hero",
			properties: {
				heading: "Set it. Sweat it.\nSign up now!",
				subheading: "Boston Marathon 2027.",
				primaryButton: "SIGN UP NOW",
				secondaryButton: "",
				backgroundImage: "/boston-marathon-hero.png",
				appMockupImage: "/boston-marathon-logo.svg",
				showAppMockup: "true",
				displayTemplateKey: "defaultHero",
				displaySettings: [{ key: "layout", value: "event" }],
			},
		},
		"ele-marathon-signup-header": {
			type: "ct-section-header",
			properties: {
				accent: "RUNNER REGISTRATION",
				heading: "Boston Marathon 2027 — Sign up today!",
				body: "Join Stride, your ultimate personal training app, and elevate your workout game. With all the essential tools at your fingertips, you can easily connect with your trainer anytime, anywhere. Plus, by becoming part of the Stride community, you'll tap into a supportive network that motivates you to crush your fitness goals.",
				number: "",
			},
		},
		"ele-marathon-form-heading": {
			type: "ct-heading",
			properties: {
				text: "Sign up for Boston Marathon 2027",
			},
		},
		"ele-marathon-form-name": {
			type: "ct-input",
			properties: {
				label: "Name",
				placeholder: "John Doe",
			},
		},
		"ele-marathon-form-email": {
			type: "ct-input",
			properties: {
				label: "Email address",
				placeholder: "john.doe@email.com",
			},
		},
		"ele-marathon-form-time": {
			type: "ct-input",
			properties: {
				label: "Estimated finish time",
				placeholder: "3.5 hours",
			},
		},
		"ele-marathon-form-shirt": {
			type: "ct-input",
			properties: {
				label: "T-shirt size",
				placeholder: "XL",
			},
		},
		"ele-marathon-form-button": {
			type: "ct-button",
			properties: {
				label: "Sign up",
				displayTemplateKey: "primaryButton",
			},
		},
		"ele-marathon-community-header": {
			type: "ct-section-header",
			properties: {
				accent: "",
				heading: "Brin Stride — Team up, keep track and celebrate",
				body: "Stride is your go-to personal training app that boosts your workout efficiency with all the essential tools you need. Whether you're at home or on the go, Stride makes communication with your trainer effortless and affordable. Plus, joining the Stride community gives you access to a network of support and collaboration to help you reach your fitness goals.",
				number: "",
			},
		},
		"ele-marathon-community-button": {
			type: "ct-button",
			properties: {
				label: "Read more",
				displayTemplateKey: "secondaryButton",
			},
		},
		"ele-marathon-community-image": {
			type: "ct-image",
			properties: {
				image: "/boston-marathon-community.png",
			},
		},
		"ele-marathon-feat-1": {
			type: "ct-feature-card",
			properties: {
				icon: "/stride-icons/sticky-note.svg",
				label: "Group up",
				description: "Train with your crew. Sync long runs, share routes, and stay accountable mile after mile.",
				style: "compact",
			},
		},
		"ele-marathon-feat-2": {
			type: "ct-feature-card",
			properties: {
				icon: "/stride-icons/globe.svg",
				label: "Set goals",
				description: "Track your pace, mileage, and PR progress with real-time analytics tailored to Boston.",
				style: "compact",
			},
		},
		"ele-marathon-feat-3": {
			type: "ct-feature-card",
			properties: {
				icon: "/stride-icons/sticky-note.svg",
				label: "Workout library",
				description: "Coach-designed track sessions, fartleks, and tempo runs — calibrated to marathon week.",
				style: "compact",
			},
		},
		"ele-marathon-feat-4": {
			type: "ct-feature-card",
			properties: {
				icon: "/stride-icons/globe.svg",
				label: "A motivated community",
				description: "Drop into challenges, share achievements, and keep the rest of your crew honest.",
				style: "compact",
			},
		},
	},
};
