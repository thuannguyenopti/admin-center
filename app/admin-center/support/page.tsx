"use client";

import {
	Box,
	Button,
	Heading,
	Link,
	Text,
} from "@optiaxiom/react";
import {
	IconUsers,
	IconCircleQuestion,
	IconBook,
	IconComments,
	IconCircleCheck,
	IconArrowRight,
} from "@optiaxiom/icons";

type ContactCard = {
	role: string;
	name: string;
	phone: string;
	email: string;
};

const CONTACTS: ContactCard[] = [
	{
		role: "Account Executive",
		name: "Test",
		phone: "(850) 000-0022",
		email: "ae@optimizely.com",
	},
	{
		role: "Customer Support Manager",
		name: "Customer Support",
		phone: "035 885 8990",
		email: "csm@optimizely.com",
	},
];

type ResourceCard = {
	title: string;
	description: string;
	icon: React.ReactNode;
	href: string;
};

const RESOURCES: ResourceCard[] = [
	{
		title: "Documentation",
		description: "Guides, references, and API documentation for all products.",
		icon: <IconBook size={18} />,
		href: "#",
	},
	{
		title: "Community Forum",
		description: "Ask questions and share knowledge with other Optimizely users.",
		icon: <IconComments size={18} />,
		href: "#",
	},
	{
		title: "Status Page",
		description: "Live status and incident history across Optimizely services.",
		icon: <IconCircleCheck size={18} />,
		href: "#",
	},
	{
		title: "Submit a Ticket",
		description: "Open a support request with our customer support team.",
		icon: <IconCircleQuestion size={18} />,
		href: "#",
	},
];

export default function SupportPage() {
	return (
		<Box>
			<Text color="fg.secondary" fontSize="md" mb="24">
				Need help? Contact your account team or browse resources below.
			</Text>

			<Box mb="32">
				<Heading level="4">Your account team</Heading>
				<Text fontSize="sm" color="fg.secondary" mb="16">
					Reach out directly to the people supporting your organization.
				</Text>
				<Box display="grid" gap="16" style={{ gridTemplateColumns: "1fr 1fr" }}>
					{CONTACTS.map((c) => (
						<Box
							key={c.role}
							bg="bg.default"
							rounded="md"
							border="1"
							borderColor="border.tertiary"
							p="20"
							display="flex"
							flexDirection="column"
							gap="12"
						>
							<Box display="flex" alignItems="center" gap="12">
								<Box
									display="inline-flex"
									alignItems="center"
									justifyContent="center"
									rounded="full"
									bg="bg.accent.subtle"
									color="fg.accent"
									style={{ width: 36, height: 36 }}
								>
									<IconUsers size={18} />
								</Box>
								<Box display="flex" flexDirection="column" gap="2">
									<Text fontSize="sm" color="fg.tertiary">
										{c.role}
									</Text>
									<Text fontWeight="600" color="fg.default">
										{c.name}
									</Text>
								</Box>
							</Box>
							<Box display="flex" flexDirection="column" gap="4">
								<Text fontWeight="500" color="fg.default">
									{c.phone}
								</Text>
								<Link href={`mailto:${c.email}`} fontSize="md">
									{c.email}
								</Link>
							</Box>
						</Box>
					))}
				</Box>
			</Box>

			<Box mb="32">
				<Heading level="4">Resources</Heading>
				<Text fontSize="sm" color="fg.secondary" mb="16">
					Self-service documentation and community resources.
				</Text>
				<Box display="grid" gap="16" style={{ gridTemplateColumns: "1fr 1fr" }}>
					{RESOURCES.map((r) => (
						<Box
							key={r.title}
							bg="bg.default"
							rounded="md"
							border="1"
							borderColor="border.tertiary"
							p="20"
							display="flex"
							flexDirection="column"
							gap="12"
						>
							<Box display="flex" alignItems="center" gap="12">
								<Box
									display="inline-flex"
									alignItems="center"
									justifyContent="center"
									rounded="full"
									bg="bg.accent.subtle"
									color="fg.accent"
									style={{ width: 36, height: 36 }}
								>
									{r.icon}
								</Box>
								<Text fontWeight="600" fontSize="lg" color="fg.default">
									{r.title}
								</Text>
							</Box>
							<Text fontSize="sm" color="fg.secondary">
								{r.description}
							</Text>
							<Box>
								<Link href={r.href} style={{ textDecoration: "none" }}>
									<Button
										appearance="subtle"
										size="sm"
										addonAfter={<IconArrowRight size={14} />}
									>
										Open
									</Button>
								</Link>
							</Box>
						</Box>
					))}
				</Box>
			</Box>
		</Box>
	);
}
