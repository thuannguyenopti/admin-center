"use client";

import { useState, useEffect, useRef } from "react";
import {
	Box,
	Breadcrumb,
	Heading,
	Tabs,
	TabsList,
	TabsTrigger,
	TabsContent,
	Field,
	Input,
	Textarea,
	Flex,
	Switch,
	Menu,
	MenuTrigger,
	MenuContent,
} from "@optiaxiom/react";
import { Button } from "@/app/components/Button";
import { Text } from "@/app/components/Text";
import { useRouter } from "next/navigation";
import usePersistentState from "@/app/usePersistentState";
import { IconPhoto, IconFile, IconLayoutGrid, IconBox, IconColumns, IconChevronDown, IconLink } from "@tabler/icons-react";
import { ContentType } from "@/app/db/initialData";

type CmpContentModel = {
	id: string;
	name: string;
	displayName: string;
	baseType: string;
	description?: string;
	properties: any[];
	modifiedAt: string;
	modifiedBy: string;
	isActive?: boolean;
	apiIdentifier?: string;
	version?: string;
	defaultLocale?: string;
	modelType?: "component" | "content";
	coverImage?: string;
};

type BaseType = ContentType["baseType"];

const BASE_TYPE_OPTIONS: { label: string; value: BaseType; icon: React.ReactNode }[] = [
	{ label: "Page Type", value: "Page", icon: <IconFile size={20} /> },
	{ label: "Block Type", value: "Block", icon: <IconLayoutGrid size={20} /> },
	{ label: "Media Type", value: "Media", icon: <IconPhoto size={20} /> },
	{ label: "Experience Type", value: "Experience", icon: <IconColumns size={20} /> },
	{ label: "Product Type", value: "Product", icon: <IconBox size={20} /> },
];

// Convert display name to a system-safe name (snake_case, no special chars)
const toSystemName = (displayName: string): string => {
	return displayName
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9\s]/g, "")
		.replace(/\s+/g, "_")
		.replace(/_+/g, "_")
		.replace(/^_|_$/g, "");
};

const generateContentModelId = (): string => {
	return `cm-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
};

export default function NewContentModelPage() {
	const router = useRouter();

	const [cmpContentModels, setCmpContentModels] = usePersistentState("cmpContentModels", []) as [
		CmpContentModel[],
		(value: CmpContentModel[]) => void,
	];

	const [activeTab, setActiveTab] = useState("details");
	const [displayName, setDisplayName] = useState("");
	const [name, setName] = useState("");
	const [apiIdentifier, setApiIdentifier] = useState("");
	const [version, setVersion] = useState("_v1");
	const [description, setDescription] = useState("");
	const [defaultLocale, setDefaultLocale] = useState("");
	const [baseType, setBaseType] = useState<BaseType>("Page");
	const [modelType, setModelType] = useState<"component" | "content">("component");
	const [coverImage, setCoverImage] = useState("");
	const [nameManuallyEdited, setNameManuallyEdited] = useState(false);
	const [isEditingTitle, setIsEditingTitle] = useState(false);
	const titleInputRef = useRef<HTMLInputElement>(null);

	// Auto-generate name from display name
	useEffect(() => {
		if (!nameManuallyEdited && displayName) {
			const systemName = toSystemName(displayName);
			setName(systemName);
			setApiIdentifier(systemName);
		}
	}, [displayName, nameManuallyEdited]);

	const handleSave = () => {
		if (!displayName.trim()) {
			alert("Display name is required");
			return;
		}

		const newContentModel: CmpContentModel = {
			id: generateContentModelId(),
			name: name || toSystemName(displayName),
			displayName: displayName,
			baseType: baseType,
			description: description,
			properties: [],
			modifiedAt: new Date().toISOString(),
			modifiedBy: "Current User",
			isActive: true,
			apiIdentifier: apiIdentifier,
			version: version,
			defaultLocale: defaultLocale,
			modelType: modelType,
			coverImage: coverImage,
		};

		setCmpContentModels([...cmpContentModels, newContentModel]);
		router.push(`/cmp/settings/content-models/${newContentModel.id}`);
	};

	const handleCancel = () => {
		router.push("/cmp/settings/content-models");
	};

	const handleTitleClick = () => {
		setIsEditingTitle(true);
	};

	const handleTitleBlur = () => {
		setIsEditingTitle(false);
	};

	const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			setIsEditingTitle(false);
		}
	};

	// Focus input when editing starts
	useEffect(() => {
		if (isEditingTitle && titleInputRef.current) {
			titleInputRef.current.focus();
			titleInputRef.current.select();
		}
	}, [isEditingTitle]);

	return (
		<Box p="24">
			<Box mb="24">
				<Breadcrumb
					mb="16"
					items={[
						{ href: "/cmp/settings/content-models", label: "Templates" },
						{ label: "New Content Model" },
					]}
				/>

				{isEditingTitle ? (
					<Input
						ref={titleInputRef}
						value={displayName}
						onChange={(e) => setDisplayName(e.target.value)}
						onBlur={handleTitleBlur}
						onKeyDown={handleTitleKeyDown}
						fontSize="lg"
						fontWeight="500"
						mb="16"
						style={{
							border: "none",
							padding: 0,
							height: "auto",
						}}
					/>
				) : (
					<Heading
						level="3"
						mb="16"
						onClick={handleTitleClick}
						style={{ cursor: "pointer" }}
						className="hover:text-fg-secondary"
					>
						{displayName || "Untitled Content Model"}
					</Heading>
				)}

				<Tabs value={activeTab} onValueChange={setActiveTab}>
					<TabsList>
						<TabsTrigger value="details">Details</TabsTrigger>
						<TabsTrigger value="fields">Fields</TabsTrigger>
					</TabsList>

					<TabsContent value="details">
						<Box mt="24" style={{ maxWidth: "600px" }}>
							<Flex flexDirection="column" gap="24">
								<Field label="Display Name" required>
									<Input
										value={displayName}
										onChange={(e) => setDisplayName(e.target.value)}
										placeholder="e.g., Landing Page"
										autoFocus
									/>
								</Field>

								<Box>
									<Text fontSize="sm" fontWeight="500" mb="8" color="fg.secondary">
										Cover Image
									</Text>
									<Box
										display="flex"
										alignItems="center"
										justifyContent="center"
										flexDirection="column"
										gap="8"
										p="32"
										rounded="md"
										border="1"
										borderColor="border.tertiary"
										bg="bg.secondary"
										style={{ cursor: "pointer" }}
									>
										<IconPhoto size={32} color="var(--ax-colors-fg-tertiary)" />
										<Text fontSize="sm" fontWeight="500" color="fg.default">
											Add Cover Image
										</Text>
										<Text fontSize="xs" color="fg.tertiary">
											400 x 360 px
										</Text>
									</Box>
								</Box>

								<Field label="API Identifier">
									<Flex gap="8" alignItems="center">
										<Input
											value={apiIdentifier}
											onChange={(e) => {
												setApiIdentifier(e.target.value);
												setNameManuallyEdited(true);
											}}
											flex="1"
											placeholder="e.g., landing_page"
										/>
										<Flex alignItems="center" gap="8">
											<Text fontSize="sm" color="fg.secondary">
												Version:
											</Text>
											<Input
												value={version}
												onChange={(e) => setVersion(e.target.value)}
												style={{ width: "80px" }}
											/>
											<Button appearance="subtle" size="sm" icon={<IconLink size={16} />} />
										</Flex>
									</Flex>
								</Field>

								<Field label="Description" info="Optional">
									<Textarea
										value={description}
										onChange={(e) => setDescription(e.target.value)}
										placeholder="Add a description..."
										rows={4}
									/>
									<Text fontSize="xs" color="fg.tertiary" mt="4">
										{description.length}/250
									</Text>
								</Field>

								<Field label="Base Type" required>
									<Menu
										options={BASE_TYPE_OPTIONS.map((opt) => ({
											label: opt.label,
											addon: opt.icon,
											execute: () => setBaseType(opt.value),
											...(baseType === opt.value && { selected: true }),
										}))}
									>
										<MenuTrigger asChild>
											<Button appearance="default" w="full">
												<Flex alignItems="center" gap="8" w="full">
													{BASE_TYPE_OPTIONS.find((opt) => opt.value === baseType)?.icon}
													<Text fontSize="sm" fontWeight="500" flex="1" textAlign="start">
														{BASE_TYPE_OPTIONS.find((opt) => opt.value === baseType)?.label}
													</Text>
													<IconChevronDown size={16} />
												</Flex>
											</Button>
										</MenuTrigger>
										<MenuContent />
									</Menu>
								</Field>

								<Field label="Default Locale" info="Optional">
									<Input
										value={defaultLocale}
										onChange={(e) => setDefaultLocale(e.target.value)}
										placeholder="e.g., en-US"
									/>
								</Field>

								<Box>
									<Field label="What's the model type?" info="Optional">
										<Flex gap="16" alignItems="center">
											<Text fontSize="sm" color="fg.secondary">
												Component Type
											</Text>
											<Switch
												checked={modelType === "content"}
												onCheckedChange={(checked) => {
													setModelType(checked ? "content" : "component");
												}}
											/>
											<Text fontSize="sm" color="fg.secondary">
												Content Type
											</Text>
										</Flex>
									</Field>
								</Box>
							</Flex>

							<Flex justifyContent="space-between" alignItems="center" mt="32" pt="24" borderT="1" borderColor="border.tertiary">
								<Button appearance="subtle" onClick={handleCancel}>
									Cancel
								</Button>
								<Button appearance="primary" onClick={handleSave} disabled={!displayName.trim()}>
									Create
								</Button>
							</Flex>
						</Box>
					</TabsContent>

					<TabsContent value="fields">
						<Box mt="24">
							<Box
								display="flex"
								flexDirection="column"
								alignItems="center"
								justifyContent="center"
								gap="16"
								py="64"
								rounded="md"
								border="1"
								borderColor="border.tertiary"
								bg="bg.secondary"
							>
								<Text fontSize="md" color="fg.secondary">
									Save the content model to add fields
								</Text>
							</Box>

							<Flex justifyContent="space-between" alignItems="center" mt="32" pt="24" borderT="1" borderColor="border.tertiary">
								<Button appearance="subtle" onClick={handleCancel}>
									Cancel
								</Button>
								<Button appearance="primary" onClick={handleSave} disabled={!displayName.trim()}>
									Create
								</Button>
							</Flex>
						</Box>
					</TabsContent>
				</Tabs>
			</Box>
		</Box>
	);
}
