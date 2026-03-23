"use client";

import { useState } from "react";
import {
	Box,
	Badge,
	Checkbox,
	Field,
	Heading,
	Radio,
	RadioGroup,
	SearchInput,
	Select,
	SelectContent,
	SelectTrigger,
} from "@optiaxiom/react";
import { Text } from "@/app/components/Text";
import { Input } from "@/app/components/Input";
import { Button } from "@/app/components/Button";
import { IconChevronDown, IconDownload } from "@tabler/icons-react";

const countries = [
	{ label: "United States", value: "United States" },
	{ label: "Canada", value: "Canada" },
	{ label: "United Kingdom", value: "United Kingdom" },
	{ label: "Australia", value: "Australia" },
	{ label: "Germany", value: "Germany" },
	{ label: "France", value: "France" },
];

export default function IdeaLabPage() {
	const [selectedTab, setSelectedTab] = useState("domain");
	const [country, setCountry] = useState("United States");
	const [searchQuery, setSearchQuery] = useState("");
	const [showHidden, setShowHidden] = useState(false);
	const [domains, setDomains] = useState(["", "", "", "", ""]);

	const handleDomainChange = (index: number, value: string) => {
		const nextDomains = [...domains];
		nextDomains[index] = value;
		setDomains(nextDomains);
	};

	return (
		<Box bg="bg.page" style={{ minHeight: "calc(100vh - 48px)" }}>
			<Box
				bg="bg.default"
				borderB="1"
				borderColor="border.tertiary"
				px="24"
				py="24"
			>
				<Box
					alignItems="start"
					display="flex"
					justifyContent="space-between"
					style={{ gap: 16 }}
				>
					<Box display="flex" flexDirection="column" gap="8">
						<Heading level="2">Idea Lab</Heading>
						<Text color="fg.secondary" fontSize="md">
							Research topics and competitor keywords to help build your content
							strategy.
						</Text>
					</Box>
					<Button appearance="default" icon={<IconDownload size={16} />}>
						Download As
						<IconChevronDown size={16} />
					</Button>
				</Box>
			</Box>

			<Box
				display="flex"
				flexDirection="column"
				gap="24"
				mx="auto"
				px="24"
				py="24"
				style={{ maxWidth: 1200 }}
			>
				<Box
					bg="bg.default"
					border="1"
					borderColor="border.tertiary"
					display="flex"
					flexDirection="column"
					gap="24"
					p="24"
					rounded="lg"
				>
					<Field label="Explore by">
						<RadioGroup value={selectedTab} onValueChange={setSelectedTab}>
							<Box display="flex" gap="24" flexWrap="wrap">
								<Radio value="domain">Domain</Radio>
								<Radio value="topic">Topic</Radio>
							</Box>
						</RadioGroup>
					</Field>

					<Box style={{ maxWidth: 320 }}>
						<Field label="Country">
							<Select
								value={country}
								onValueChange={(value) => setCountry(value as string)}
								options={countries}
							>
								<SelectTrigger size="lg">{country}</SelectTrigger>
								<SelectContent />
							</Select>
						</Field>
					</Box>

					<SearchInput
						placeholder="Enter topic or domain to explore"
						size="lg"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
				</Box>

				<Box
					bg="bg.default"
					border="1"
					borderColor="border.tertiary"
					display="flex"
					flexDirection="column"
					gap="16"
					p="24"
					rounded="lg"
				>
					<Box
						alignItems="center"
						display="flex"
						flexWrap="wrap"
						gap="12"
						justifyContent="space-between"
					>
						<Box alignItems="center" display="flex" flexWrap="wrap" gap="12">
							<Badge intent="primary">Recommended for you</Badge>
							<Heading level="4">Keywords with the greatest opportunity</Heading>
						</Box>
					</Box>

					<Box alignItems="center" display="flex" flexWrap="wrap" gap="16">
						<Checkbox
							checked={showHidden}
							onCheckedChange={(checked) => setShowHidden(Boolean(checked))}
						>
							Show hidden
						</Checkbox>
						<Button appearance="subtle" size="sm">
							Enter your targeted keywords
						</Button>
					</Box>
				</Box>

				<Box
					bg="bg.default"
					border="1"
					borderColor="border.tertiary"
					display="flex"
					flexDirection="column"
					gap="20"
					p="24"
					rounded="lg"
				>
					<Box display="flex" flexDirection="column" gap="8">
						<Heading level="4">Keyword Rank Analysis</Heading>
						<Text color="fg.secondary" fontSize="md">
							Compare how your keywords rank across multiple domains. Enter up to
							five domains to analyze competitive opportunities.
						</Text>
					</Box>

					<Box
						alignItems="end"
						display="flex"
						flexWrap="wrap"
						gap="8"
					>
						{domains.map((domain, index) => (
							<Box
								key={index}
								alignItems="center"
								display="flex"
								gap="8"
							>
								<Input
									placeholder={`Domain ${index + 1}`}
									type="text"
									value={domain}
									onChange={(e) => handleDomainChange(index, e.target.value)}
									style={{ width: 160 }}
								/>
								{index < domains.length - 1 ? (
									<Text color="fg.tertiary" fontSize="sm">
										vs
									</Text>
								) : null}
							</Box>
						))}
					</Box>

					<Box>
						<Button appearance="primary">Analyze</Button>
					</Box>
				</Box>

				<Box
					bg="bg.default"
					border="1"
					borderColor="border.tertiary"
					display="flex"
					flexWrap="wrap"
					gap="16"
					justifyContent="space-between"
					p="24"
					rounded="lg"
				>
					<Heading level="4">Your program&apos;s targeted keywords</Heading>
					<Button appearance="subtle" size="sm">
						Manage Keywords
					</Button>
				</Box>
			</Box>
		</Box>
	);
}
