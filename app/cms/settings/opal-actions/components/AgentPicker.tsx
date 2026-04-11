"use client";

import React, {useState, useMemo} from "react";
import {Box, Text, Popover, PopoverTrigger, PopoverContent, SearchInput} from "@optiaxiom/react";
import {availableAgents} from "../mockData";

interface AgentPickerProps {
	onAdd: (agentId: string) => void;
	excludeAgentIds: string[];
	children: React.ReactNode;
}

export const AgentPicker: React.FC<AgentPickerProps> = ({
	onAdd,
	excludeAgentIds,
	children,
}) => {
	const [searchQuery, setSearchQuery] = useState("");
	const [isOpen, setIsOpen] = useState(false);

	// Filter available agents
	const availableList = useMemo(() => {
		return availableAgents.filter(
			(agent) => !excludeAgentIds.includes(agent.id)
		);
	}, [excludeAgentIds]);

	// Filter by search query and group by category
	const filteredAgentsByCategory = useMemo(() => {
		const filtered = availableList.filter((agent) =>
			agent.name.toLowerCase().includes(searchQuery.toLowerCase())
		);

		const grouped: Record<string, typeof availableAgents> = {};
		filtered.forEach((agent) => {
			if (!grouped[agent.category]) {
				grouped[agent.category] = [];
			}
			grouped[agent.category].push(agent);
		});

		return grouped;
	}, [availableList, searchQuery]);

	const handleSelectAgent = (agentId: string) => {
		onAdd(agentId);
		setSearchQuery("");
		setIsOpen(false);
	};

	const hasAvailableAgents = availableList.length > 0;

	return (
		<Popover open={isOpen} onOpenChange={setIsOpen}>
			<PopoverTrigger asChild>{children}</PopoverTrigger>
			<PopoverContent
				align="start"
				style={{
					width: "320px",
					maxHeight: "400px",
					display: "flex",
					flexDirection: "column",
					padding: 0,
				}}
			>
				{/* Search */}
				<Box p="12" pb="8">
					<SearchInput
						placeholder="Search agents..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						autoFocus
					/>
				</Box>

				{/* Agent List */}
				<Box
					flex="1"
					overflow="auto"
					px="8"
					pb="8"
				>
					{!hasAvailableAgents ? (
						<Box p="16" display="flex" justifyContent="center">
							<Text fontSize="sm" color="fg.secondary">
								All agents added
							</Text>
						</Box>
					) : Object.keys(filteredAgentsByCategory).length === 0 ? (
						<Box p="16" display="flex" justifyContent="center">
							<Text fontSize="sm" color="fg.secondary">
								No agents found
							</Text>
						</Box>
					) : (
						<Box display="flex" flexDirection="column" gap="12">
							{Object.entries(filteredAgentsByCategory).map(([category, agents]) => (
								<Box key={category} display="flex" flexDirection="column" gap="4">
									<Text fontSize="xs" fontWeight="600" color="fg.tertiary" px="8" pt="4">
										{category}
									</Text>
									{agents.map((agent) => (
										<Box
											key={agent.id}
											px="8"
											py="6"
											rounded="md"
											style={{cursor: "pointer"}}
											onClick={() => handleSelectAgent(agent.id)}
										>
											<Text fontSize="sm">{agent.name}</Text>
										</Box>
									))}
								</Box>
							))}
						</Box>
					)}
				</Box>
			</PopoverContent>
		</Popover>
	);
};
