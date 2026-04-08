"use client";

import {useState, useEffect, Dispatch, SetStateAction} from "react";
import {
	Box,
	SearchInput,
	Menu,
	MenuTrigger,
	MenuContent,
	LabelMenuButton,
	Tabs,
	TabsList,
	TabsTrigger,
	TabsContent,
	Switch,
	Text,
} from "@optiaxiom/react";
import {Button} from "@/app/components/Button";
import {Table, Th, Tr, Td} from "@/app/components/Table";
import {defaultOpalConfiguration} from "./mockData";
import {OpalConfiguration, LocationMenu} from "./types";
import {performMigrationIfNeeded} from "./migration";
import usePersistentState from "@/app/usePersistentState";
import {LocationMenuEditor} from "./components/LocationMenuEditor";
import {Aside} from "@/app/context/LayoutContext";

export default function OpalActionsPage() {
	// Run migration on component mount
	useEffect(() => {
		performMigrationIfNeeded();
	}, []);

	const [opalConfig, setOpalConfig] = usePersistentState("opal-config", defaultOpalConfiguration) as [
		OpalConfiguration,
		Dispatch<SetStateAction<OpalConfiguration>>
	];

	// Clean up invalid locations from old localStorage data
	useEffect(() => {
		const validLocations = ["toolbar-improve", "toolbar-context", "asset-panel", "property-editor"];
		const hasInvalidLocations = opalConfig.locations.some(loc => !validLocations.includes(loc.id));

		if (hasInvalidLocations) {
			setOpalConfig((prev) => ({
				...prev,
				locations: prev.locations.filter(loc => validLocations.includes(loc.id)),
				modified: new Date().toISOString(),
			}));
		}
	}, []); // Only run once on mount

	const [activeTab, setActiveTab] = useState("menus");
	const [typeFilter, setTypeFilter] = useState("All");
	const [searchQuery, setSearchQuery] = useState("");
	const [editingLocation, setEditingLocation] = useState<LocationMenu | null>(null);

	// Valid location IDs for the Menus tab (excludes system agents)
	const validMenuLocations = ["toolbar-improve", "toolbar-context", "asset-panel", "property-editor"];

	// Filter locations for Menus tab
	const filteredLocations = opalConfig.locations.filter((location) => {
		// Exclude invalid/system locations (defensive against old localStorage data)
		if (!validMenuLocations.includes(location.id)) {
			return false;
		}

		// Search filter
		if (searchQuery && !location.name.toLowerCase().includes(searchQuery.toLowerCase())) {
			return false;
		}

		// Status filter
		if (typeFilter === "Enabled" && !location.enabled) return false;
		if (typeFilter === "Disabled" && location.enabled) return false;

		return true;
	});


	// Get stats for a location
	const getLocationStats = (location: typeof opalConfig.locations[0]) => {
		const groupCount = location.groups.length;
		const uniqueAgents = new Set<string>();
		location.groups.forEach((group) => {
			group.agents.forEach((agentId) => uniqueAgents.add(agentId));
		});
		return {
			groupCount,
			agentCount: uniqueAgents.size,
		};
	};

	const handleSaveLocation = (updatedLocation: LocationMenu) => {
		setOpalConfig((prev) => ({
			...prev,
			locations: prev.locations.map((loc) =>
				loc.id === updatedLocation.id ? updatedLocation : loc
			),
			modified: new Date().toISOString(),
		}));
	};

	const handleCloseEditor = () => {
		setEditingLocation(null);
	};

	return (
		<>
			<Tabs value={activeTab} onValueChange={setActiveTab}>
				<TabsList mb="24">
					<TabsTrigger value="menus">Menus</TabsTrigger>
					<TabsTrigger value="system-agents">System Agents</TabsTrigger>
					<TabsTrigger value="app-companion">Automated Features</TabsTrigger>
				</TabsList>

			{/* Menus Tab */}
			<TabsContent value="menus">
				<Box display="flex" justifyContent="space-between" pb="12">
					<Box display="flex" gap="8">
						<Box style={{width: "300px"}}>
							<SearchInput
								size="lg"
								placeholder="Filter by location name"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
							/>
						</Box>
						<Menu
							options={[
								{label: "All", execute: () => setTypeFilter("All")},
								{label: "Enabled", execute: () => setTypeFilter("Enabled")},
								{label: "Disabled", execute: () => setTypeFilter("Disabled")},
							]}
						>
							<MenuTrigger asChild>
								<LabelMenuButton label="Status">{typeFilter}</LabelMenuButton>
							</MenuTrigger>
							<MenuContent />
						</Menu>
					</Box>
				</Box>
			<Table>
				<thead>
					<Tr>
						<Th>Location</Th>
						<Th>Groups</Th>
						<Th>Agents</Th>
						<Th>Status</Th>
					</Tr>
				</thead>
				<tbody>
					{filteredLocations.map((location) => {
						const stats = getLocationStats(location);
						return (
							<Tr key={location.id} onClick={() => setEditingLocation(location)}>
								<Td type="header" description={location.description}>
									{location.name}
								</Td>
								<Td>
									<Box fontSize="sm">
										{stats.groupCount} {stats.groupCount === 1 ? "group" : "groups"}
									</Box>
								</Td>
								<Td>
									<Box fontSize="sm">
										{stats.agentCount} {stats.agentCount === 1 ? "agent" : "agents"}
									</Box>
								</Td>
								<Td>
									<Box display="flex" alignItems="center" gap="8">
										<Switch
											checked={location.enabled}
											onChange={(e) => {
												const isChecked = e.currentTarget.checked;
												e.stopPropagation();
												setOpalConfig((prev) => ({
													...prev,
													locations: prev.locations.map((loc) =>
														loc.id === location.id ? {...loc, enabled: isChecked} : loc
													),
													modified: new Date().toISOString(),
												}));
											}}
										/>
										<Text fontSize="sm" color="fg.secondary">
											{location.enabled ? "Enabled" : "Disabled"}
										</Text>
									</Box>
								</Td>
							</Tr>
						);
					})}
				</tbody>
			</Table>
			</TabsContent>

			{/* System Agents Tab */}
			<TabsContent value="system-agents">
				<Box pb="24">
					<Box fontSize="md" color="fg.secondary" mb="16">
						Enable or disable system agents that power Opal features.
					</Box>
				</Box>
				<Table>
					<thead>
						<Tr>
							<Th>Agent</Th>
							<Th>Status</Th>
						</Tr>
					</thead>
					<tbody>
						{opalConfig.systemAgents?.map((agent) => (
							<Tr key={agent.id}>
								<Td type="header" description={agent.description}>
									{agent.name}
								</Td>
								<Td>
									<Box display="flex" alignItems="center" gap="8">
										<Switch
											checked={agent.enabled}
											onChange={(e) => {
												setOpalConfig((prev) => ({
													...prev,
													systemAgents: prev.systemAgents.map((a) =>
														a.id === agent.id ? {...a, enabled: e.currentTarget.checked} : a
													),
													modified: new Date().toISOString(),
												}));
											}}
										/>
										<Text fontSize="sm" color="fg.secondary">
											{agent.enabled ? "Enabled" : "Disabled"}
										</Text>
									</Box>
								</Td>
							</Tr>
						))}
					</tbody>
				</Table>
			</TabsContent>

			{/* Automated Features Tab */}
			<TabsContent value="app-companion">
				<Box pb="24">
					<Box fontSize="md" color="fg.secondary" mb="16">
						Enable or disable AI-powered editor features.
					</Box>
				</Box>
				<Table>
					<thead>
						<Tr>
							<Th>Feature</Th>
							<Th>Status</Th>
						</Tr>
					</thead>
					<tbody>
						{opalConfig.appCompanion?.map((feature) => (
							<Tr key={feature.id}>
								<Td type="header" description={feature.description}>
									{feature.name}
								</Td>
								<Td>
									<Box display="flex" alignItems="center" gap="8">
										<Switch
											checked={feature.enabled}
											onChange={(e) => {
												setOpalConfig((prev) => ({
													...prev,
													appCompanion: prev.appCompanion.map((f) =>
														f.id === feature.id ? {...f, enabled: e.currentTarget.checked} : f
													),
													modified: new Date().toISOString(),
												}));
											}}
										/>
										<Text fontSize="sm" color="fg.secondary">
											{feature.enabled ? "Enabled" : "Disabled"}
										</Text>
									</Box>
								</Td>
							</Tr>
						))}
					</tbody>
				</Table>
			</TabsContent>
			</Tabs>

			{/* LocationMenuEditor Sidepanel */}
			{editingLocation && (
				<Aside>
					<LocationMenuEditor
						location={editingLocation}
						onClose={handleCloseEditor}
						onSave={handleSaveLocation}
					/>
				</Aside>
			)}
		</>
	);
}
