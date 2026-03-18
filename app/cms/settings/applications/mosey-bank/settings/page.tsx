"use client";

import { useState, useMemo, useCallback } from "react";
import { Box, Field } from "@optiaxiom/react";
import { Input } from "@/app/components/Input";
import { Button } from "@/app/components/Button";
import { Text } from "@/app/components/Text";
import { SelectStartPageDialog } from "../../SelectStartPageDialog";
import usePersistentState from "@/app/usePersistentState";
import {
	initialApplications,
	Application,
	initialPages,
	Page,
} from "@/app/db/initialData";

export default function ApplicationSettingsPage() {
	// Persistent state for applications and pages
	const [savedApplications, setApplications] = usePersistentState(
		"applications",
		initialApplications
	) as [Application[], (value: Application[]) => void];

	const [pages] = usePersistentState("pages_v5", initialPages) as [
		Page[],
		(pages: Page[]) => void,
		boolean
	];

	const applications = useMemo(() => {
		if (!savedApplications) return initialApplications;
		const savedMap = new Map(savedApplications.map((app) => [app.id, app]));
		initialApplications.forEach((app) => {
			if (!savedMap.has(app.id)) {
				savedMap.set(app.id, app);
			}
		});
		return Array.from(savedMap.values());
	}, [savedApplications]);

	// Get the Stride application (hardcoded for now)
	const application = applications.find((app) => app.id === "app-stride");

	// Local form state
	const [name, setName] = useState(application?.name || "");
	const [appId, setAppId] = useState(application?.appId || "");
	const [url, setUrl] = useState(application?.url || "");
	const [startPageId, setStartPageId] = useState(application?.startPageId || "");

	// Get the selected start page name
	const startPageName = useMemo(() => {
		if (!startPageId) return "";
		const page = pages.find((p) => p.id === startPageId);
		return page?.name || "";
	}, [startPageId, pages]);

	// Save handler
	const handleSave = useCallback(() => {
		if (!applications || !application) return;

		const updatedApplications = applications.map((app: Application) =>
			app.id === application.id
				? {
						...app,
						name: name.trim() || app.name,
						appId: appId.trim() || app.appId,
						url: url.trim() || app.url,
						startPageId: startPageId || app.startPageId,
						modifiedAt: new Date().toISOString(),
				  }
				: app
		);

		setApplications(updatedApplications);
	}, [applications, application, name, appId, url, startPageId, setApplications]);

	if (!application) {
		return (
			<Box flex="1">
				<Text color="fg.error">Application not found</Text>
			</Box>
		);
	}

	return (
		<Box
			display="flex"
			flexDirection="column"
			style={{
				height: "calc(100vh - 130px)",
				marginLeft: "-32px",
				marginRight: "-32px",
				marginTop: "-16px",
				marginBottom: "-24px",
			}}
		>
			<Box flex="1" overflow="auto" px="32" py="16">
				<Box style={{ maxWidth: "640px" }}>
					<Box gap="16" display="flex" flexDirection="column">
						<Field label="Application Name" required>
							<Input
								value={name}
								onChange={(e) => setName(e.target.value)}
							/>
						</Field>
						<Field label="APP ID" required>
							<Input
								value={appId}
								onChange={(e) => setAppId(e.target.value)}
							/>
						</Field>
						<Field label="URL">
							<Input value={url} onChange={(e) => setUrl(e.target.value)} />
						</Field>
						<Field label="Start Page" required>
							<Box display="flex" gap="8" alignItems="center">
								<Input
									value={startPageName}
									placeholder="No start page selected"
									disabled
									style={{ flex: 1 }}
								/>
								<SelectStartPageDialog
									pages={pages}
									currentStartPageId={startPageId}
									onSelect={setStartPageId}
								>
									<Button>Select Page</Button>
								</SelectStartPageDialog>
							</Box>
						</Field>
					</Box>
				</Box>
			</Box>

			{/* Fixed Save Footer */}
			<Box
				borderT="1"
				borderColor="border.secondary"
				bg="bg.default"
				px="32"
				py="16"
				display="flex"
				justifyContent="end"
				z="10"
			>
				<Button appearance="primary" onClick={handleSave}>
					Save
				</Button>
			</Box>
		</Box>
	);
}
