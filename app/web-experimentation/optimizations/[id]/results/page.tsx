"use client";

<<<<<<< HEAD
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useOpalPanelActions } from "@/app/context/OpalPanelActionsContext";
import { useExperimentResultsContext } from "@/app/context/ExperimentResultsContext";
=======
import {useState, useEffect} from "react";
import {useParams} from "next/navigation";
import Link from "next/link";
import {useOpalPanelActions} from "@/app/context/OpalPanelActionsContext";
import {useExperimentResultsContext} from "@/app/context/ExperimentResultsContext";
>>>>>>> origin/main
import {
	Box,
	Heading,
	Text as AxiomText,
	Tabs,
	TabsList,
	TabsTrigger,
	TabsContent,
	Menu,
	MenuTrigger,
	MenuContent,
	LabelMenuButton,
	Tooltip,
} from "@optiaxiom/react";
<<<<<<< HEAD
import { Button } from "@/app/components/Button";
=======
import {Button} from "@/app/components/Button";
>>>>>>> origin/main
import {
	IconEye,
	IconDownload,
	IconShareNodes,
	IconPen,
	IconEllipsisStroke,
	IconPlay,
	IconCircleQuestion,
	IconSparkles,
} from "@optimizely/axiom-icons";

export default function ExperimentResultsPage() {
	const params = useParams();
	const id = params?.id as string | undefined;
<<<<<<< HEAD
	const { openPanelAndSendMessage } = useOpalPanelActions();
	const { setExperimentContext } = useExperimentResultsContext();
=======
	const {openPanelAndSendMessage} = useOpalPanelActions();
	const {setExperimentContext} = useExperimentResultsContext();
>>>>>>> origin/main
	const [status, setStatus] = useState("Running");
	const [activeTab, setActiveTab] = useState("summary");

	useEffect(() => {
		if (id) setExperimentContext(id);
		return () => setExperimentContext(null);
	}, [id, setExperimentContext]);

	return (
<<<<<<< HEAD
		<Box display="flex" flexDirection="column" gap="0" w="full" style={{ minHeight: 0 }}>
=======
		<Box display="flex" flexDirection="column" gap="0" w="full" style={{minHeight: 0}}>
>>>>>>> origin/main
			{/* Top bar: context + back link (left) | Status dropdown + icon buttons + Run/Save (right) — no extra top padding; template py="24" aligns with where "Optimizations" was */}
			<Box
				display="flex"
				alignItems="center"
				justifyContent="space-between"
				flexWrap="wrap"
				gap="12"
				pb="16"
			>
				<Box display="flex" flexDirection="column" gap="4">
					<AxiomText fontSize="xs" color="fg.tertiary">
						Optimizely App - Web
					</AxiomText>
					<Link
						href="/web-experimentation/optimizations"
						style={{
<<<<<<< HEAD
							color: "var(--ax-colors-fg-accent)",
=======
							color: "var(--ax-colors-fg-default)",
>>>>>>> origin/main
							textDecoration: "none",
							fontSize: "14px",
							display: "inline-flex",
							alignItems: "center",
							gap: "4px",
						}}
					>
						← Overview
					</Link>
				</Box>
				<Box display="flex" alignItems="center" gap="8" flexWrap="wrap">
					<Menu
						options={[
<<<<<<< HEAD
							{ label: "Running", execute: () => setStatus("Running") },
							{ label: "Paused", execute: () => setStatus("Paused") },
							{ label: "Concluded", execute: () => setStatus("Concluded") },
							{ label: "Not Started", execute: () => setStatus("Not Started") },
=======
							{label: "Running", execute: () => setStatus("Running")},
							{label: "Paused", execute: () => setStatus("Paused")},
							{label: "Concluded", execute: () => setStatus("Concluded")},
							{label: "Not Started", execute: () => setStatus("Not Started")},
>>>>>>> origin/main
						]}
					>
						<MenuTrigger asChild>
							<LabelMenuButton label="Status">{status}</LabelMenuButton>
						</MenuTrigger>
						<MenuContent />
					</Menu>
					<Box display="flex" alignItems="center" gap="4">
						<Button
							appearance="subtle"
							size="lg"
							icon={<IconEye size={20} />}
							aria-label="View"
							style={{
								backgroundColor: "var(--ax-colors-bg-default)",
								border: "1px solid var(--ax-colors-border-secondary)",
								borderRadius: "8px",
								minWidth: "40px",
								minHeight: "40px",
								width: "40px",
								height: "40px",
								padding: 0,
							}}
						/>
						<Button
							appearance="subtle"
							size="lg"
<<<<<<< HEAD
							icon={<IconDownload size={20} style={{ opacity: 0.5 }} />}
=======
							icon={<IconDownload size={20} style={{opacity: 0.5}} />}
>>>>>>> origin/main
							aria-label="Download"
							disabled
							style={{
								backgroundColor: "var(--ax-colors-bg-default)",
								border: "1px solid var(--ax-colors-border-secondary)",
								borderRadius: "8px",
								minWidth: "40px",
								minHeight: "40px",
								width: "40px",
								height: "40px",
								padding: 0,
							}}
						/>
						<Button
							appearance="subtle"
							size="lg"
							icon={<IconShareNodes size={20} />}
							aria-label="Share"
							style={{
								backgroundColor: "var(--ax-colors-bg-default)",
								border: "1px solid var(--ax-colors-border-secondary)",
								borderRadius: "8px",
								minWidth: "40px",
								minHeight: "40px",
								width: "40px",
								height: "40px",
								padding: 0,
							}}
						/>
						<Button
							appearance="subtle"
							size="lg"
							icon={<IconPen size={20} />}
							aria-label="Edit"
							style={{
								backgroundColor: "var(--ax-colors-bg-default)",
								border: "1px solid var(--ax-colors-border-secondary)",
								borderRadius: "8px",
								minWidth: "40px",
								minHeight: "40px",
								width: "40px",
								height: "40px",
								padding: 0,
							}}
						/>
						<Button
							appearance="subtle"
							size="lg"
							icon={<IconEllipsisStroke size={20} />}
							aria-label="More options"
							style={{
								backgroundColor: "var(--ax-colors-bg-default)",
								border: "1px solid var(--ax-colors-border-secondary)",
								borderRadius: "8px",
								minWidth: "40px",
								minHeight: "40px",
								width: "40px",
								height: "40px",
								padding: 0,
							}}
						/>
					</Box>
					<Box display="flex" alignItems="center" gap="8">
						<Button
							appearance="default-opal"
							size="lg"
							icon={<IconSparkles size={18} />}
							iconPosition="start"
<<<<<<< HEAD
							onClick={() => openPanelAndSendMessage("Summarize the experiment results")}
=======
							onClick={() =>
								openPanelAndSendMessage("Summarize the experiment results")
							}
>>>>>>> origin/main
						>
							Summarize Results
						</Button>
						<Button
							appearance="subtle"
							size="lg"
							icon={<IconPlay size={16} />}
							iconPosition="start"
							style={{
								backgroundColor: "var(--ax-colors-bg-default)",
								border: "1px solid var(--ax-colors-border-secondary)",
							}}
						>
							Run
						</Button>
						<Button appearance="primary" size="lg">
							Save
						</Button>
					</Box>
				</Box>
			</Box>

			{/* Page title */}
			<Box pt="8" pb="16">
				<Heading level="3">Experiment Results</Heading>
			</Box>

			{/* Tabs: Summary | Explore results data + separator */}
			<Box display="flex" flexDirection="column">
				<Tabs value={activeTab} onValueChange={(v) => setActiveTab(v)}>
					<TabsList
						style={{
							gap: "24px",
							borderBottom: "1px solid var(--ax-colors-border-tertiary)",
							borderRadius: 0,
							paddingBottom: 0,
						}}
					>
						<TabsTrigger value="summary">Summary</TabsTrigger>
<<<<<<< HEAD
						<TabsTrigger value="explore" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
							Explore results data
							<Tooltip content="Explore and export raw results data for further analysis.">
								<Box display="inline-flex" alignItems="center" aria-label="Help">
									<IconCircleQuestion size={20} style={{ color: "var(--ax-colors-fg-tertiary)" }} />
=======
						<TabsTrigger
							value="explore"
							style={{display: "inline-flex", alignItems: "center", gap: "6px"}}
						>
							Explore results data
							<Tooltip content="Explore and export raw results data for further analysis.">
								<Box display="inline-flex" alignItems="center" aria-label="Help">
									<IconCircleQuestion
										size={20}
										style={{color: "var(--ax-colors-fg-tertiary)"}}
									/>
>>>>>>> origin/main
								</Box>
							</Tooltip>
						</TabsTrigger>
					</TabsList>
				</Tabs>
			</Box>

			{/* Main content area */}
<<<<<<< HEAD
			<Box flex="1" pt="24" style={{ minHeight: 0 }}>
=======
			<Box flex="1" pt="24" style={{minHeight: 0}}>
>>>>>>> origin/main
				<Tabs value={activeTab} onValueChange={(v) => setActiveTab(v)}>
					<TabsContent value="summary">
						<Box
							bg="bg.secondary"
							rounded="md"
							p="24"
							display="flex"
							flexDirection="column"
							gap="16"
<<<<<<< HEAD
							style={{ minHeight: "200px" }}
						>
							<AxiomText fontSize="sm" color="fg.secondary">
								Results content for this experiment will appear here (charts, metrics, variants, etc.).
=======
							style={{minHeight: "200px"}}
						>
							<AxiomText fontSize="sm" color="fg.secondary">
								Results content for this experiment will appear here (charts,
								metrics, variants, etc.).
>>>>>>> origin/main
							</AxiomText>
						</Box>
					</TabsContent>
					<TabsContent value="explore">
						<Box
							bg="bg.secondary"
							rounded="md"
							p="24"
							display="flex"
							flexDirection="column"
							gap="16"
<<<<<<< HEAD
							style={{ minHeight: "200px" }}
=======
							style={{minHeight: "200px"}}
>>>>>>> origin/main
						>
							<AxiomText fontSize="sm" color="fg.secondary">
								Explore results data content will appear here.
							</AxiomText>
						</Box>
					</TabsContent>
				</Tabs>
			</Box>
		</Box>
	);
}
