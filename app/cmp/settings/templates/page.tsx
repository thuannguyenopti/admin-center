"use client";

import { useState, useMemo } from "react";
import {
	Box,
	SearchInput,
	Menu,
	MenuTrigger,
	MenuContent,
	LabelMenuButton,
	Flex,
	Badge,
	Link,
	Tabs,
	TabsList,
	TabsTrigger,
	TabsContent,
	Switch,
	Heading,
} from "@optiaxiom/react";
import { Button } from "@/app/components/Button";
import { Text } from "@/app/components/Text";
import { Table, Tr, Th, Td } from "@/app/components/Table";
import { ContentType, initialContentTypes } from "@/app/db/initialData";
import type { FormTemplate } from "@/app/cmp/settings/templates/form/types";
import { useRouter, useSearchParams } from "next/navigation";
import usePersistentState from "@/app/usePersistentState";
import { performMigration, isCmpType } from "@/app/lib/contentTypeMigration";
import { useEffect } from "react";


function EmptyState({ onCreateClick }: { onCreateClick: () => void }) {
	return (
		<Box
			display="flex"
			flexDirection="column"
			alignItems="center"
			justifyContent="center"
			gap="16"
			py="40"
		>
			<Text fontSize="md" color="fg.secondary" mb="8">
				No content models yet
			</Text>
			<Button appearance="primary" onClick={onCreateClick}>
				Create Your First Content Model
			</Button>
		</Box>
	);
}

export default function ContentModelsPage() {
	const router = useRouter();
	const searchParams = useSearchParams();

	const [search, setSearch] = useState("");
	const [sortBy, setSortBy] = useState<string>("title");
	const [showInactive, setShowInactive] = useState(false);
	const [primaryTab, setPrimaryTab] = useState("content-model");
	const [secondaryTab, setSecondaryTab] = useState("all");

	// Persistent content types (unified CMP and CMS repository)
	const [contentTypes, setContentTypes] = usePersistentState("contentTypes", initialContentTypes) as [
		ContentType[],
		(value: ContentType[]) => void,
	];

	// Persistent saved form templates (built via the form builder)
	const [formTemplates, setFormTemplates] = usePersistentState("formTemplates", [] as FormTemplate[]) as [
		FormTemplate[] | undefined,
		(value: FormTemplate[]) => void,
	];

	// Run migration on first load
	useEffect(() => {
		const migratedTypes = performMigration(contentTypes);
		if (migratedTypes) {
			setContentTypes(migratedTypes);
		}
	}, []); // Only run once on mount

	// Filter to CMP content models only
	const cmpContentModels = useMemo(() => {
		return contentTypes.filter((ct) => isCmpType(ct));
	}, [contentTypes]);

	const filteredContentModels = useMemo(() => {
		let models = cmpContentModels.filter((model: ContentType) => {
			const searchLower = search.toLowerCase();
			const matchesSearch =
				!search ||
				(model.displayName?.toLowerCase().includes(searchLower) ?? false) ||
				model.name.toLowerCase().includes(searchLower);

			const matchesActive = showInactive || model.isActive !== false;

			// Filter by secondary tab
			let matchesType = true;
			if (secondaryTab === "component-types") {
				matchesType = model.baseType === "Block";
			} else if (secondaryTab === "content-types") {
				matchesType = model.baseType === "Page";
			} else if (secondaryTab === "remote-fields") {
				matchesType = false; // No remote fields yet
			}

			return matchesSearch && matchesActive && matchesType;
		});

		// Sort models
		if (sortBy === "title") {
			models.sort((a, b) => (a.displayName || a.name).localeCompare(b.displayName || b.name));
		} else if (sortBy === "modified") {
			models.sort((a, b) => new Date(b.modifiedAt || 0).getTime() - new Date(a.modifiedAt || 0).getTime());
		}

		return models;
	}, [cmpContentModels, search, showInactive, secondaryTab, sortBy]);

	const handleCreateClick = () => {
		router.push("/cmp/settings/templates/new");
	};


	const sortOptions = [
		{ label: "Title", value: "title" },
		{ label: "Modified", value: "modified" },
	];

	const currentSortLabel = sortOptions.find((opt) => opt.value === sortBy)?.label || "Title";

	return (
		<Box p="24">
			<Box mb="24">
				<Heading level="3" mb="16">
					Templates
				</Heading>
				<Text fontSize="md" color="fg.secondary" mb="16">
					Create and customize templates to better structure how work is collaboratively planned.
					Templates can be applied as Campaign Briefs, Task Briefs, or Request Forms.{" "}
					<Link href="#" style={{ color: "var(--ax-colors-fg-accent)" }}>
						Learn more
					</Link>
				</Text>
			</Box>

			<Tabs value={primaryTab} onValueChange={setPrimaryTab}>
				<TabsList>
					<TabsTrigger value="form">Form</TabsTrigger>
					<TabsTrigger value="task">Task</TabsTrigger>
					<TabsTrigger value="campaign">Campaign</TabsTrigger>
					<TabsTrigger value="content-model">Content Model</TabsTrigger>
				</TabsList>

				<TabsContent value="form">
					<Box mt="16">
						<Box display="flex" alignItems="center" gap="8" mb="16">
							<Box flex="1" />
							<Button appearance="primary" onClick={() => router.push("/cmp/settings/templates/form")}>
								Add New
							</Button>
						</Box>
						{(formTemplates ?? []).length === 0 ? (
							<Box py="40" textAlign="center">
								<Text fontSize="md" color="fg.secondary">
									No form templates yet
								</Text>
							</Box>
						) : (
							<Table>
								<thead>
									<Tr>
										<Th>Name</Th>
										<Th>Description</Th>
										<Th>Fields</Th>
										<Th>Status</Th>
										<Th>Last modified</Th>
									</Tr>
								</thead>
								<tbody>
									{(formTemplates ?? []).map((t) => {
										const fieldCount = t.nodes.filter(
											(n: any) => n.type === "formField" && !(n.data as any)?.isStartingNode,
										).length;
										return (
											<Tr key={t.id}>
												<Td>
													<Link
														href={`/cmp/settings/templates/form?id=${t.id}`}
														style={{ color: "var(--ax-colors-fg-accent)" }}
													>
														{t.name || "Untitled Form"}
													</Link>
												</Td>
												<Td>
													<Text fontSize="sm" color="fg.secondary">
														{t.description || "—"}
													</Text>
												</Td>
												<Td>
													<Text fontSize="sm">{fieldCount}</Text>
												</Td>
												<Td>
													<Badge intent={t.isActive ? "success" : "neutral"}>
														{t.isActive ? "Active" : "Inactive"}
													</Badge>
												</Td>
												<Td>
													<Text fontSize="sm" color="fg.secondary">
														{new Date(t.updatedAt).toLocaleDateString()}
													</Text>
												</Td>
											</Tr>
										);
									})}
								</tbody>
							</Table>
						)}
					</Box>
				</TabsContent>

				<TabsContent value="task">
					<Box py="40" textAlign="center">
						<Text fontSize="md" color="fg.secondary">
							Task templates coming soon
						</Text>
					</Box>
				</TabsContent>

				<TabsContent value="campaign">
					<Box py="40" textAlign="center">
						<Text fontSize="md" color="fg.secondary">
							Campaign templates coming soon
						</Text>
					</Box>
				</TabsContent>

				<TabsContent value="content-model">
					<Tabs value={secondaryTab} onValueChange={setSecondaryTab}>
						<TabsList>
							<TabsTrigger value="all">All</TabsTrigger>
							<TabsTrigger value="component-types">Component Types</TabsTrigger>
							<TabsTrigger value="content-types">Content Types</TabsTrigger>
							<TabsTrigger value="remote-fields">Remote Fields</TabsTrigger>
						</TabsList>

						<TabsContent value="all">
							<Box mt="16">
								<Box display="flex" alignItems="center" gap="8" mb="16">
									<SearchInput
										size="lg"
										value={search}
										onChange={(e) => setSearch(e.target.value)}
										placeholder="Search content models..."
									/>

									<Menu
										options={sortOptions.map((opt) => ({
											label: opt.label,
											execute: () => setSortBy(opt.value),
											...(sortBy === opt.value && { selected: true }),
										}))}
									>
										<MenuTrigger asChild>
											<LabelMenuButton label="Sort">{currentSortLabel}</LabelMenuButton>
										</MenuTrigger>
										<MenuContent />
									</Menu>

									<Flex alignItems="center" gap="8">
										<Switch checked={showInactive} onCheckedChange={setShowInactive} />
										<Text fontSize="sm">Show Inactive</Text>
									</Flex>

									<Box flex="1" />

									<Button appearance="primary" onClick={handleCreateClick}>
										Add New
									</Button>
								</Box>

								{filteredContentModels.length === 0 && !search && !showInactive ? (
									<EmptyState onCreateClick={handleCreateClick} />
								) : (
									<>
										<Table>
											<thead>
												<tr>
													<Th>Title</Th>
													<Th>Type</Th>
													<Th>Modified</Th>
													<Th>Modified By</Th>
													<Th>Status</Th>
												</tr>
											</thead>
											<tbody>
												{filteredContentModels.map((model: ContentType) => (
													<Tr
														key={model.id}
														url={`/cmp/settings/templates/${model.id}`}
													>
														<Td type="header">{model.displayName}</Td>
														<Td>
															<Badge intent="neutral">{model.baseType}</Badge>
														</Td>
														<Td>{new Date(model.modifiedAt || 0).toLocaleDateString()}</Td>
														<Td>{model.modifiedBy}</Td>
														<Td>
															<Badge intent={model.isActive !== false ? "success" : "neutral"}>
																{model.isActive !== false ? "Active" : "Inactive"}
															</Badge>
														</Td>
													</Tr>
												))}
											</tbody>
										</Table>

										{filteredContentModels.length === 0 && (search || showInactive) && (
											<Box py="40" textAlign="center">
												<Text fontSize="md" color="fg.secondary">
													No content models match your filters
												</Text>
											</Box>
										)}
									</>
								)}
							</Box>
						</TabsContent>

						<TabsContent value="component-types">
							<Box mt="16">
								<Box display="flex" alignItems="center" gap="8" mb="16">
									<SearchInput
										size="lg"
										value={search}
										onChange={(e) => setSearch(e.target.value)}
										placeholder="Search component types..."
									/>

									<Menu
										options={sortOptions.map((opt) => ({
											label: opt.label,
											execute: () => setSortBy(opt.value),
											...(sortBy === opt.value && { selected: true }),
										}))}
									>
										<MenuTrigger asChild>
											<LabelMenuButton label="Sort">{currentSortLabel}</LabelMenuButton>
										</MenuTrigger>
										<MenuContent />
									</Menu>

									<Flex alignItems="center" gap="8">
										<Switch checked={showInactive} onCheckedChange={setShowInactive} />
										<Text fontSize="sm">Show Inactive</Text>
									</Flex>

									<Box flex="1" />

									<Button appearance="primary" onClick={handleCreateClick}>
										Add New
									</Button>
								</Box>

								{filteredContentModels.length === 0 ? (
									<Box py="40" textAlign="center">
										<Text fontSize="md" color="fg.secondary">
											No component types found
										</Text>
									</Box>
								) : (
									<Table>
										<thead>
											<tr>
												<Th>Title</Th>
												<Th>Type</Th>
												<Th>Modified</Th>
												<Th>Modified By</Th>
												<Th>Status</Th>
											</tr>
										</thead>
										<tbody>
											{filteredContentModels.map((model: ContentType) => (
												<Tr
													key={model.id}
													url={`/cmp/settings/templates/${model.id}`}
												>
													<Td type="header">{model.displayName}</Td>
													<Td>
														<Badge intent="neutral">{model.baseType}</Badge>
													</Td>
													<Td>{new Date(model.modifiedAt || 0).toLocaleDateString()}</Td>
													<Td>{model.modifiedBy}</Td>
													<Td>
														<Badge intent={model.isActive !== false ? "success" : "neutral"}>
															{model.isActive !== false ? "Active" : "Inactive"}
														</Badge>
													</Td>
												</Tr>
											))}
										</tbody>
									</Table>
								)}
							</Box>
						</TabsContent>

						<TabsContent value="content-types">
							<Box mt="16">
								<Box display="flex" alignItems="center" gap="8" mb="16">
									<SearchInput
										size="lg"
										value={search}
										onChange={(e) => setSearch(e.target.value)}
										placeholder="Search content types..."
									/>

									<Menu
										options={sortOptions.map((opt) => ({
											label: opt.label,
											execute: () => setSortBy(opt.value),
											...(sortBy === opt.value && { selected: true }),
										}))}
									>
										<MenuTrigger asChild>
											<LabelMenuButton label="Sort">{currentSortLabel}</LabelMenuButton>
										</MenuTrigger>
										<MenuContent />
									</Menu>

									<Flex alignItems="center" gap="8">
										<Switch checked={showInactive} onCheckedChange={setShowInactive} />
										<Text fontSize="sm">Show Inactive</Text>
									</Flex>

									<Box flex="1" />

									<Button appearance="primary" onClick={handleCreateClick}>
										Add New
									</Button>
								</Box>

								{filteredContentModels.length === 0 ? (
									<Box py="40" textAlign="center">
										<Text fontSize="md" color="fg.secondary">
											No content types found
										</Text>
									</Box>
								) : (
									<Table>
										<thead>
											<tr>
												<Th>Title</Th>
												<Th>Type</Th>
												<Th>Modified</Th>
												<Th>Modified By</Th>
												<Th>Status</Th>
											</tr>
										</thead>
										<tbody>
											{filteredContentModels.map((model: ContentType) => (
												<Tr
													key={model.id}
													url={`/cmp/settings/templates/${model.id}`}
												>
													<Td type="header">{model.displayName}</Td>
													<Td>
														<Badge intent="neutral">{model.baseType}</Badge>
													</Td>
													<Td>{new Date(model.modifiedAt || 0).toLocaleDateString()}</Td>
													<Td>{model.modifiedBy}</Td>
													<Td>
														<Badge intent={model.isActive !== false ? "success" : "neutral"}>
															{model.isActive !== false ? "Active" : "Inactive"}
														</Badge>
													</Td>
												</Tr>
											))}
										</tbody>
									</Table>
								)}
							</Box>
						</TabsContent>

						<TabsContent value="remote-fields">
							<Box mt="16" py="40" textAlign="center">
								<Text fontSize="md" color="fg.secondary">
									No remote fields configured
								</Text>
							</Box>
						</TabsContent>
					</Tabs>
				</TabsContent>
			</Tabs>
		</Box>
	);
}
