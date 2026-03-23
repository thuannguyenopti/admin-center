"use client";

import { useState, useEffect } from "react";
import {
	Box,
	Heading,
	Tabs,
	TabsList,
	TabsTrigger,
	TabsContent,
	Field,
	Input,
	Textarea,
	Flex,
	Badge,
	Switch,
} from "@optiaxiom/react";
import { Button } from "@/app/components/Button";
import { Text } from "@/app/components/Text";
import { useRouter, useParams } from "next/navigation";
import usePersistentState from "@/app/usePersistentState";
import { IconPhoto, IconPlus, IconGripVertical, IconLink } from "@tabler/icons-react";

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

export default function ContentModelDetailPage() {
	const router = useRouter();
	const params = useParams();
	const contentModelId = params.id as string;

	const [cmpContentModels, setCmpContentModels] = usePersistentState("cmpContentModels", []) as [
		CmpContentModel[],
		(value: CmpContentModel[]) => void,
	];

	const contentModel = cmpContentModels.find((model: CmpContentModel) => model.id === contentModelId);

	const [activeTab, setActiveTab] = useState("details");
	const [apiIdentifier, setApiIdentifier] = useState("");
	const [version, setVersion] = useState("_v1");
	const [description, setDescription] = useState("");
	const [defaultLocale, setDefaultLocale] = useState("");
	const [modelType, setModelType] = useState<"component" | "content">("component");
	const [coverImage, setCoverImage] = useState("");

	useEffect(() => {
		if (contentModel) {
			setApiIdentifier(contentModel.apiIdentifier || contentModel.name);
			setVersion(contentModel.version || "_v1");
			setDescription(contentModel.description || "");
			setDefaultLocale(contentModel.defaultLocale || "");
			setModelType(contentModel.modelType || "component");
			setCoverImage(contentModel.coverImage || "");
		}
	}, [contentModel]);

	if (!contentModel) {
		return (
			<Box p="24">
				<Box
					display="flex"
					flexDirection="column"
					alignItems="center"
					justifyContent="center"
					gap="16"
					style={{ minHeight: "60vh" }}
				>
					<Text fontSize="md" color="fg.secondary">
						Content model not found
					</Text>
					<Button appearance="default" onClick={() => router.push("/cmp/settings/content-models")}>
						Back to Templates
					</Button>
				</Box>
			</Box>
		);
	}

	const handleSave = () => {
		const updatedModels = cmpContentModels.map((model: CmpContentModel) => {
			if (model.id === contentModelId) {
				return {
					...model,
					apiIdentifier,
					version,
					description,
					defaultLocale,
					modelType,
					coverImage,
					modifiedAt: new Date().toISOString(),
				};
			}
			return model;
		});
		setCmpContentModels(updatedModels);
	};

	const handleAddField = () => {
		// TODO: Implement field addition dialog
		console.log("Add field clicked");
	};

	return (
		<Box p="24">
			<Box mb="24">
				<Flex alignItems="center" gap="8" mb="8">
					<Text fontSize="sm" color="fg.secondary">
						Content Templates
					</Text>
					<Text fontSize="sm" color="fg.secondary">
						/
					</Text>
					<Text fontSize="sm" color="fg.secondary">
						{contentModel.displayName}
					</Text>
				</Flex>
				<Heading level="2" fontSize="xl" fontWeight="500" mb="16">
					{contentModel.displayName}
				</Heading>

				<Tabs value={activeTab} onValueChange={setActiveTab}>
					<TabsList>
						<TabsTrigger value="details">Details</TabsTrigger>
						<TabsTrigger value="fields">Fields</TabsTrigger>
					</TabsList>

					<TabsContent value="details">
						<Box mt="24" style={{ maxWidth: "600px" }}>
							<Flex flexDirection="column" gap="24">
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
											onChange={(e) => setApiIdentifier(e.target.value)}
											onBlur={handleSave}
											flex="1"
										/>
										<Flex alignItems="center" gap="8">
											<Text fontSize="sm" color="fg.secondary">
												Version:
											</Text>
											<Input
												value={version}
												onChange={(e) => setVersion(e.target.value)}
												onBlur={handleSave}
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
										onBlur={handleSave}
										placeholder="Add a description..."
										rows={4}
									/>
									<Text fontSize="xs" color="fg.tertiary" mt="4">
										{description.length}/250
									</Text>
								</Field>

								<Field label="Default Locale" info="Optional">
									<Input
										value={defaultLocale}
										onChange={(e) => setDefaultLocale(e.target.value)}
										onBlur={handleSave}
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
													handleSave();
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
								<Text fontSize="xs" color="fg.tertiary">
									Last updated {new Date(contentModel.modifiedAt).toLocaleString()}
								</Text>
								<Button appearance="primary" onClick={() => router.push("/cmp/settings/content-models")}>
									Done
								</Button>
							</Flex>
						</Box>
					</TabsContent>

					<TabsContent value="fields">
						<Box mt="24">
							<Flex justifyContent="flex-end" mb="16">
								<Button appearance="primary" onClick={handleAddField}>
									Add Field
								</Button>
							</Flex>

							{contentModel.properties && contentModel.properties.length > 0 ? (
								<Box>
									{contentModel.properties.map((property: any) => (
										<Box
											key={property.id}
											p="16"
											rounded="md"
											border="1"
											borderColor="border.tertiary"
											bg="bg.default"
											mb="8"
											display="flex"
											alignItems="center"
											gap="12"
											style={{ cursor: "pointer" }}
											className="hover:bg-bg-secondary"
										>
											<IconGripVertical size={20} color="var(--ax-colors-fg-tertiary)" />
											<IconLink size={20} color="var(--ax-colors-fg-secondary)" />
											<Text fontSize="md" fontWeight="500" flex="1">
												{property.displayName || property.name}
											</Text>
											<Text fontSize="sm" color="fg.secondary">
												{property.type}
											</Text>
										</Box>
									))}
								</Box>
							) : (
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
										No fields yet
									</Text>
									<Button appearance="primary" onClick={handleAddField}>
										Add Your First Field
									</Button>
								</Box>
							)}

							<Flex justifyContent="space-between" alignItems="center" mt="32" pt="24" borderT="1" borderColor="border.tertiary">
								<Text fontSize="xs" color="fg.tertiary">
									Last updated {new Date(contentModel.modifiedAt).toLocaleString()}
								</Text>
								<Button appearance="primary" onClick={() => router.push("/cmp/settings/content-models")}>
									Done
								</Button>
							</Flex>
						</Box>
					</TabsContent>
				</Tabs>
			</Box>
		</Box>
	);
}
