"use client";

import { useState } from "react";
import { Box, Field, Select, SelectContent, SelectTrigger, Tabs, TabsContent, TabsList, TabsTrigger } from "@optiaxiom/react";
import { Input } from "@/app/components/Input";
import { Text } from "@/app/components/Text";

const TIMEZONES = [
	{ label: "(GMT-08:00) Pacific Time (US & Canada)", value: "pacific" },
	{ label: "(GMT-07:00) Mountain Time (US & Canada)", value: "mountain" },
	{ label: "(GMT-06:00) Central Time (US & Canada)", value: "central" },
	{ label: "(GMT-05:00) Eastern Time (US & Canada), Bogota, Lima, New York, Indiana(East)", value: "eastern" },
	{ label: "(GMT+00:00) London, Dublin, Lisbon", value: "london" },
];

const TABS = [
	{ label: "Profile", value: "profile" },
	{ label: "Availability", value: "availability" },
	{ label: "Notification", value: "notification" },
	{ label: "Reports", value: "reports" },
	{ label: "Misc", value: "misc" },
];

/** Settings/Profile/Profile — Figma "Settings — Master" node 5994:35052. Only the Profile
 * tab has real content; the rest are stubbed ("coming soon") until those settings areas
 * are built out. */
export default function CmpSettingsProfilePage() {
	const [firstName, setFirstName] = useState("John");
	const [lastName, setLastName] = useState("Doe");
	const [jobTitle, setJobTitle] = useState("Principal Product Manager");
	const [department, setDepartment] = useState("Bang & Olufsen");
	const [timezone, setTimezone] = useState("eastern");

	const timezoneLabel = TIMEZONES.find((t) => t.value === timezone)?.label ?? "";

	return (
		<Box display="flex" flexDirection="column" gap="32" py="32" style={{ maxWidth: 888 }}>
			<Box display="flex" flexDirection="column" gap="16">
				<Box display="flex" flexDirection="column" gap="8">
					<Text color="fg.default" fontSize="2xl" fontWeight="500">
						{firstName} {lastName}{" "}
						<span style={{ color: "var(--ax-colors-fg-secondary)", fontSize: 14, fontWeight: 400 }}>
							(Admin)
						</span>
					</Text>
				</Box>

				<Tabs defaultValue="profile">
					<TabsList>
						{TABS.map((tab) => (
							<TabsTrigger key={tab.value} value={tab.value}>{tab.label}</TabsTrigger>
						))}
					</TabsList>

					<TabsContent value="profile">
						<Box display="flex" flexDirection="column" gap="24" pt="24">
							<Box display="flex" gap="32">
								<Box style={{ flex: 1 }}>
									<Field label="First Name">
										<Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
									</Field>
								</Box>
								<Box style={{ flex: 1 }}>
									<Field label="Last Name">
										<Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
									</Field>
								</Box>
							</Box>
							<Field label="Job Title">
								<Input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
							</Field>
							<Field label="Department">
								<Input value={department} onChange={(e) => setDepartment(e.target.value)} />
							</Field>
							<Field info="Used to schedule reports and notifications in your local time." label="Timezone">
								<Select options={TIMEZONES} value={timezone} onValueChange={(value) => setTimezone(value as string)}>
									<SelectTrigger size="lg">{timezoneLabel}</SelectTrigger>
									<SelectContent />
								</Select>
							</Field>
						</Box>
					</TabsContent>

					{TABS.filter((tab) => tab.value !== "profile").map((tab) => (
						<TabsContent key={tab.value} value={tab.value}>
							<Box pt="24">
								<Text color="fg.secondary" fontSize="sm">{tab.label} content coming soon.</Text>
							</Box>
						</TabsContent>
					))}
				</Tabs>
			</Box>
		</Box>
	);
}
