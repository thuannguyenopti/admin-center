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
	Popover,
	PopoverTrigger,
	PopoverContent,
	Checkbox,
	toaster,
	Card,
	Tooltip,
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
import { IconFilter, IconDots, IconFileDescription, IconSpeakerphone, IconListDetails } from "@tabler/icons-react";


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
	const [primaryTab, setPrimaryTab] = useState("form");
	const [secondaryTab, setSecondaryTab] = useState("all");

	// Form tab filters
	const [formSearch, setFormSearch] = useState("");
	const [formBeingUsedIn, setFormBeingUsedIn] = useState<Set<string>>(new Set());
	const [formStatus, setFormStatus] = useState<Set<string>>(new Set());
	const [formFilterOpen, setFormFilterOpen] = useState(false);

	const FORM_USED_IN_OPTIONS = ["Campaign Brief", "Task Brief", "Work Request"];
	const FORM_STATUS_OPTIONS = ["Active", "Inactive"];
	const formAllSelected =
		formBeingUsedIn.size === FORM_USED_IN_OPTIONS.length &&
		formStatus.size === FORM_STATUS_OPTIONS.length;
	const formActiveFilterCount = formBeingUsedIn.size + formStatus.size;

	const toggleFormUsedIn = (val: string) =>
		setFormBeingUsedIn((prev) => { const s = new Set(prev); s.has(val) ? s.delete(val) : s.add(val); return s; });
	const toggleFormStatus = (val: string) =>
		setFormStatus((prev) => { const s = new Set(prev); s.has(val) ? s.delete(val) : s.add(val); return s; });
	const toggleFormSelectAll = () => {
		if (formAllSelected) {
			setFormBeingUsedIn(new Set());
			setFormStatus(new Set());
		} else {
			setFormBeingUsedIn(new Set(FORM_USED_IN_OPTIONS));
			setFormStatus(new Set(FORM_STATUS_OPTIONS));
		}
	};

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

	const filteredFormTemplates = useMemo(() => {
		return (formTemplates ?? []).filter((t) => {
			const q = formSearch.toLowerCase();
			if (q && !t.name.toLowerCase().includes(q) && !t.description?.toLowerCase().includes(q)) return false;
			if (formBeingUsedIn.size > 0) {
				const match = [...formBeingUsedIn].some((label) =>
					(t.applicableTo ?? []).some((a) => a.toLowerCase() === label.toLowerCase()),
				);
				if (!match) return false;
			}
			if (formStatus.size > 0) {
				if (formStatus.has("Active") && !formStatus.has("Inactive") && !t.isActive) return false;
				if (formStatus.has("Inactive") && !formStatus.has("Active") && t.isActive) return false;
			}
			return true;
		});
	}, [formTemplates, formSearch, formBeingUsedIn, formStatus]);

	const handleCreateClick = () => {
		router.push("/cmp/settings/templates/new");
	};

	const handleToggleFormActive = (id: string) => {
		setFormTemplates((formTemplates ?? []).map((t) => (t.id === id ? { ...t, isActive: !t.isActive, updatedAt: new Date().toISOString() } : t)));
	};

	const handleDeleteFormTemplate = (id: string) => {
		setFormTemplates((formTemplates ?? []).filter((t) => t.id !== id));
		toaster.create("Template deleted", { intent: "information" });
	};

	const handleDuplicateFormTemplate = (id: string) => {
		const source = (formTemplates ?? []).find((t) => t.id === id);
		if (!source) return;
		const copy = { ...source, id: `form-${Date.now()}`, name: `${source.name} (Copy)`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
		setFormTemplates([...(formTemplates ?? []), copy]);
		toaster.create("Template duplicated", { intent: "success" });
	};

	const handleCopyFormUrl = (id: string) => {
		navigator.clipboard.writeText(`${window.location.origin}/cmp/settings/templates/form?id=${id}`);
		toaster.create("URL copied to clipboard", { intent: "success" });
	};

	const sortOptions = [
		{ label: "Title", value: "title" },
		{ label: "Modified", value: "modified" },
	];

	const currentSortLabel = sortOptions.find((opt) => opt.value === sortBy)?.label || "Title";

	const APPLIED_OPTIONS = [
		{ key: "Campaign Brief", icon: <IconSpeakerphone size={16} />, label: "Campaign Brief" },
		{ key: "Task Brief", icon: <IconListDetails size={16} />, label: "Task Brief" },
		{ key: "Work Request", icon: <IconFileDescription size={16} />, label: "Work Request" },
	];

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
							<SearchInput
								size="lg"
								value={formSearch}
								onChange={(e) => setFormSearch(e.target.value)}
								placeholder="Search form templates..."
							/>
							<Box flex="1" />
							<Popover open={formFilterOpen} onOpenChange={setFormFilterOpen}>
								<PopoverTrigger asChild>
									<Button
										appearance="default"
										icon={<IconFilter size={16} />}
									>
										Filter{formActiveFilterCount > 0 ? ` (${formActiveFilterCount})` : ""}
									</Button>
								</PopoverTrigger>
								<PopoverContent align="start" style={{ width: 220, padding: 0 }}>
									{/* Select All */}
									<Box
										px="12"
										py="10"
										display="flex"
										alignItems="center"
										gap="8"
										style={{ cursor: "pointer", borderBottom: "1px solid var(--ax-colors-border-tertiary)" }}
										onClick={toggleFormSelectAll}
									>
										<Checkbox
											checked={formAllSelected}
											indeterminate={!formAllSelected && formActiveFilterCount > 0}
											onCheckedChange={toggleFormSelectAll}
											onClick={(e) => e.stopPropagation()}
										/>
										<Text fontSize="sm" fontWeight="500">Select All</Text>
									</Box>

									{/* Being Used In */}
									<Box px="12" pt="10" pb="4">
										<Text fontSize="xs" fontWeight="600" color="fg.tertiary" style={{ textTransform: "uppercase", letterSpacing: "0.06em" }}>
											Being Used In
										</Text>
									</Box>
									{FORM_USED_IN_OPTIONS.map((opt) => (
										<Box
											key={opt}
											px="12"
											py="8"
											display="flex"
											alignItems="center"
											gap="8"
											className="hover:bg-[var(--ax-colors-bg-default-hovered)]"
											style={{ cursor: "pointer" }}
											onClick={() => toggleFormUsedIn(opt)}
										>
											<Checkbox
												checked={formBeingUsedIn.has(opt)}
												onCheckedChange={() => toggleFormUsedIn(opt)}
												onClick={(e) => e.stopPropagation()}
											/>
											<Text fontSize="sm">{opt}</Text>
										</Box>
									))}

									{/* Template Status */}
									<Box px="12" pt="10" pb="4" style={{ borderTop: "1px solid var(--ax-colors-border-tertiary)", marginTop: 4 }}>
										<Text fontSize="xs" fontWeight="600" color="fg.tertiary" style={{ textTransform: "uppercase", letterSpacing: "0.06em" }}>
											Template Status
										</Text>
									</Box>
									{FORM_STATUS_OPTIONS.map((opt) => (
										<Box
											key={opt}
											px="12"
											py="8"
											display="flex"
											alignItems="center"
											gap="8"
											className="hover:bg-[var(--ax-colors-bg-default-hovered)]"
											style={{ cursor: "pointer" }}
											onClick={() => toggleFormStatus(opt)}
										>
											<Checkbox
												checked={formStatus.has(opt)}
												onCheckedChange={() => toggleFormStatus(opt)}
												onClick={(e) => e.stopPropagation()}
											/>
											<Text fontSize="sm">{opt}</Text>
										</Box>
									))}
									<Box pb="4" />
								</PopoverContent>
							</Popover>
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
						) : filteredFormTemplates.length === 0 ? (
							<Box py="40" textAlign="center">
								<Text fontSize="md" color="fg.secondary">
									No form templates match your filters
								</Text>
							</Box>
						) : (
							<div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
								{filteredFormTemplates.map((t) => {
									const appliedTo = t.applicableTo ?? [];
									return (
										<Card
											key={t.id}
											style={{ cursor: "pointer", display: "flex", flexDirection: "column", minHeight: 220 }}
											onClick={() => router.push(`/cmp/settings/templates/form?id=${t.id}`)}
										>
											{/* Body */}
											<div style={{ padding: 16, display: "flex", flexDirection: "column", flex: 1, alignSelf: "stretch" }}>
												{/* Title row: title + ellipsis in same flex row for guaranteed alignment */}
												<div style={{ display: "flex", alignItems: "flex-start" }}>
													<Text
														fontWeight="600"
														fontSize="md"
														color="fg.default"
														style={{
															flex: 1,
															minWidth: 0,
															display: "-webkit-box",
															WebkitLineClamp: 2,
															WebkitBoxOrient: "vertical",
															overflow: "hidden",
														}}
													>
														{t.name || "Untitled Form"}
													</Text>
													<div
														onClick={(e) => e.stopPropagation()}
														style={{ flexShrink: 0, marginRight: -8, marginTop: -6 }}
													>
														<Popover>
															<PopoverTrigger asChild>
																<Button appearance="subtle" icon={<IconDots size={16} />} aria-label="More options" />
															</PopoverTrigger>
															<PopoverContent align="end" p="0" style={{ width: 160, overflow: "hidden" }}>
																{/* Active toggle */}
																<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px" }}>
																	<span style={{ fontSize: "var(--ax-font-sizes-sm)", color: "var(--ax-colors-fg-default)" }}>Active</span>
																	<Switch checked={t.isActive} onCheckedChange={() => handleToggleFormActive(t.id)} />
																</div>
																<div style={{ height: 1, background: "var(--ax-colors-border-tertiary)", margin: "0 12px" }} />
																{/* Actions */}
																{[
																	{ label: "Duplicate", action: () => handleDuplicateFormTemplate(t.id) },
																	{ label: "Copy URL", action: () => handleCopyFormUrl(t.id) },
																].map(({ label, action }) => (
																	<button
																		key={label}
																		onClick={action}
																		style={{ display: "block", width: "100%", textAlign: "left", padding: "8px 12px", background: "none", border: "none", cursor: "pointer", fontSize: "var(--ax-font-sizes-sm)", color: "var(--ax-colors-fg-default)" }}
																		onMouseEnter={(e) => (e.currentTarget.style.background = "var(--ax-colors-bg-default-hovered)")}
																		onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
																	>
																		{label}
																	</button>
																))}
																<button
																	onClick={() => handleDeleteFormTemplate(t.id)}
																	style={{ display: "block", width: "100%", textAlign: "left", padding: "8px 12px", background: "none", border: "none", cursor: "pointer", fontSize: "var(--ax-font-sizes-sm)", color: "var(--ax-colors-fg-danger-strong)" }}
																	onMouseEnter={(e) => (e.currentTarget.style.background = "var(--ax-colors-bg-default-hovered)")}
																	onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
																>
																	Delete
																</button>
															</PopoverContent>
														</Popover>
													</div>
												</div>

												{/* Description */}
												{t.description && (
													<div style={{ marginTop: 6 }}>
														<Text fontSize="sm" color="fg.secondary">{t.description}</Text>
													</div>
												)}

												{/* Spacer with minimum height for breathing room */}
												<div style={{ flex: 1, minHeight: 48 }} />

												{/* Last modified */}
												<Text fontSize="sm" color="fg.secondary">
													Last modified on{" "}
													<span style={{ fontWeight: 600, color: "var(--ax-colors-fg-default)" }}>
														{new Date(t.updatedAt).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })}
													</span>
												</Text>
											</div>

											{/* Footer */}
											<div
												style={{ display: "flex", alignItems: "center", padding: "12px 16px", alignSelf: "stretch", flexShrink: 0 }}
												onClick={(e) => e.stopPropagation()}
											>
												<Badge intent={t.isActive ? "success" : "neutral"}>
													{t.isActive ? "Active" : "Inactive"}
												</Badge>
												<div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
													{APPLIED_OPTIONS.map(({ key, icon, label }) => (
														<Tooltip key={key} content={label}>
															<div style={{ color: appliedTo.includes(key) ? "var(--ax-colors-fg-default)" : "var(--ax-colors-fg-disabled)", display: "flex" }}>
																{icon}
															</div>
														</Tooltip>
													))}
												</div>
											</div>
										</Card>
									);
								})}
							</div>
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
