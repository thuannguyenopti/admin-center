"use client";

import {useState} from "react";
import {Box, Button, Spinner, Text, Textarea} from "@optiaxiom/react";
import {IconChevronDown, IconPlay, IconXmark} from "@optiaxiom/icons";

const PROGRESS_MESSAGES = [
	"Researching brand website…",
	"Reading style guide…",
	"Extracting brand signals…",
	"Building brand…",
];

type OpalOnboardingPanelProps = {
	open: boolean;
	onClose: () => void;
	onComplete: () => void;
};

function FieldLabel({children}: {children: React.ReactNode}) {
	return (
		<Text fontWeight="600" style={{display: "block", fontSize: 14, marginBottom: 6}}>
			{children}
		</Text>
	);
}

function FieldHelp({children}: {children: React.ReactNode}) {
	return (
		<Text color="fg.tertiary" style={{fontSize: 12, lineHeight: 1.45, marginTop: 4}}>
			{children}
		</Text>
	);
}

export function OpalOnboardingPanel({open, onClose, onComplete}: OpalOnboardingPanelProps) {
	const [running, setRunning] = useState(false);
	const [progressMessages, setProgressMessages] = useState<string[]>([]);

	if (!open) {
		return null;
	}

	const handleRun = async () => {
		setRunning(true);
		setProgressMessages([]);
		for (const message of PROGRESS_MESSAGES) {
			setProgressMessages((current) => [...current, message]);
			await new Promise((resolve) => {
				window.setTimeout(resolve, 1000);
			});
		}
		setRunning(false);
		setProgressMessages([]);
		onComplete();
	};

	return (
		<Box
			bg="bg.default"
			borderL="1"
			borderColor="border.tertiary"
			display="flex"
			flexDirection="column"
			shadow="lg"
			style={{
				bottom: 0,
				height: "100vh",
				maxWidth: "92vw",
				overflowY: "auto",
				position: "fixed",
				right: 0,
				top: 0,
				width: 480,
				zIndex: 50,
			}}
		>
			<Box
				alignItems="center"
				borderB="1"
				borderColor="border.tertiary"
				display="flex"
				justifyContent="space-between"
				p="16"
			>
				<Text fontWeight="600" fontSize="md">
					Test Run: Brand Onboarding with Schema
				</Text>
				<Button
					appearance="subtle"
					aria-label="Close panel"
					icon={<IconXmark />}
					onClick={onClose}
					size="sm"
				/>
			</Box>

			<Box
				alignItems="center"
				borderB="1"
				borderColor="border.tertiary"
				display="flex"
				gap="8"
				px="16"
				py="12"
			>
				<Text color="fg.secondary" fontSize="sm">
					Select Product Instance
				</Text>
				<Text fontSize="sm" fontWeight="500">
					MullarkeySandbox ▾
				</Text>
			</Box>

			<Box m="16" p="16" rounded="md" style={{backgroundColor: "#f0f7f0"}}>
				<Box alignItems="center" display="flex" gap="8" mb="16">
					<IconChevronDown size={16} />
					<Text fontWeight="600" fontSize="sm">
						Input Variables
					</Text>
				</Box>

				<Box mb="16">
					<FieldLabel>Website URL</FieldLabel>
					<Textarea defaultValue="https://www.yourbrand.com" rows={2} />
					<FieldHelp>
						The brand&apos;s primary website address. Used to research the brand and verify
						or supplement PDF style guide content.
					</FieldHelp>
				</Box>

				<Box mb="16">
					<Box alignItems="center" display="flex" gap="8" mb="6">
						<Text fontWeight="600" fontSize="sm">
							Style Guide PDFs
						</Text>
						<Text color="fg.tertiary" style={{fontSize: 12}}>
							1–10 items
						</Text>
					</Box>
					<Box
						alignItems="center"
						bg="bg.default"
						border="1"
						borderColor="border.tertiary"
						display="flex"
						gap="8"
						p="8"
						rounded="sm"
					>
						<Text fontSize="sm">brand-guidelines.pdf</Text>
						<IconXmark
							size={12}
							style={{color: "var(--ax-colors-fg-tertiary)", marginLeft: "auto"}}
						/>
					</Box>
					<FieldHelp>
						Optional. Upload one or more brand style guide PDFs. The agent will read each
						file and extract all available brand signals.
					</FieldHelp>
				</Box>

				<Box mb="16">
					<FieldLabel>Brand Guidelines URL</FieldLabel>
					<Textarea
						placeholder="Optional. The URL of a web-hosted brand guidelines portal — for example a Bynder, Frontify, or Brandfolder page."
						rows={2}
					/>
					<FieldHelp>
						Optional. Only works with publicly accessible portals — authentication-gated
						pages cannot be read.
					</FieldHelp>
				</Box>

				<Box mb="16">
					<FieldLabel>Figma File URL</FieldLabel>
					<Textarea
						defaultValue="https://www.figma.com/design/your-brand-library?node-id=0-1"
						rows={2}
					/>
					<FieldHelp>
						Optional. The Figma file share URL for the brand&apos;s design template
						library. If provided, templates will be imported and added to the brand.
					</FieldHelp>
				</Box>

				<Box mb="8">
					<FieldLabel>Pages to Import</FieldLabel>
					<Textarea defaultValue="Social templates, Email templates" rows={2} />
					<FieldHelp>
						Optional. Only relevant if a Figma File URL is provided. Comma-separated page
						names to import from the Figma file. If left blank, the agent automatically
						selects the first 2 template pages found in the file.
					</FieldHelp>
				</Box>
			</Box>

			{running && (
				<Box px="16" pb="8">
					{progressMessages.map((message) => (
						<Box key={message} alignItems="center" display="flex" gap="8" mb="8">
							<Spinner size="sm" />
							<Text color="fg.secondary" fontSize="sm">
								{message}
							</Text>
						</Box>
					))}
				</Box>
			)}

			<Box px="16" pb="24">
				<Button
					appearance="primary"
					icon={running ? undefined : <IconPlay size={14} />}
					loading={running}
					onClick={handleRun}
					style={{backgroundColor: "#22c55e", justifyContent: "center", width: "100%"}}
				>
					{running ? "Running…" : "Run"}
				</Button>
			</Box>
		</Box>
	);
}
