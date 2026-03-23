"use client";

import { Box, Heading, Badge } from "@optiaxiom/react";
import { Button } from "@/app/components/Button";
import { Text } from "@/app/components/Text";
import { useRouter, useParams } from "next/navigation";
import usePersistentState from "@/app/usePersistentState";
import { IconArrowLeft, IconSettings } from "@tabler/icons-react";

type CmpContentModel = {
	id: string;
	name: string;
	displayName: string;
	baseType: string;
	description?: string;
	properties: any[];
	modifiedAt: string;
	modifiedBy: string;
};

export default function ContentModelPropertiesPage() {
	const router = useRouter();
	const params = useParams();
	const contentModelId = params.id as string;

	const [cmpContentModels] = usePersistentState("cmpContentModels", []) as [
		CmpContentModel[],
		(value: CmpContentModel[]) => void,
	];

	const contentModel = cmpContentModels.find((model: CmpContentModel) => model.id === contentModelId);

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
						Back to Content Models
					</Button>
				</Box>
			</Box>
		);
	}

	return (
		<Box p="24">
			<Box mb="24">
				<Button
					appearance="subtle"
					icon={<IconArrowLeft size={20} />}
					onClick={() => router.push("/cmp/settings/content-models")}
					mb="16"
				>
					Back to Content Models
				</Button>

				<Box display="flex" alignItems="center" gap="12" mb="8">
					<Heading level="2" fontSize="xl" fontWeight="500">
						{contentModel.displayName}
					</Heading>
					<Badge intent="neutral">{contentModel.baseType}</Badge>
				</Box>

				{contentModel.description && (
					<Text fontSize="md" color="fg.secondary" mb="16">
						{contentModel.description}
					</Text>
				)}
			</Box>

			<Box
				display="flex"
				flexDirection="column"
				alignItems="center"
				justifyContent="center"
				gap="16"
				py="40"
				rounded="md"
				border="1"
				borderColor="border.tertiary"
				bg="bg.secondary"
			>
				<Box
					display="flex"
					alignItems="center"
					justifyContent="center"
					bg="bg.accent.subtle"
					color="fg.secondary"
					style={{
						width: "64px",
						height: "64px",
						borderRadius: "50%",
					}}
				>
					<IconSettings size={32} stroke={1.5} />
				</Box>

				<Box textAlign="center" style={{ maxWidth: "400px" }}>
					<Heading level="3" fontSize="lg" fontWeight="500" mb="8">
						Properties Editor Coming Soon
					</Heading>
					<Text fontSize="md" color="fg.secondary" mb="16">
						The properties editor for managing content model fields will be available in a future
						update.
					</Text>
				</Box>

				{contentModel.properties.length > 0 && (
					<Box>
						<Text fontSize="sm" fontWeight="500" mb="8" textAlign="center">
							Template Properties ({contentModel.properties.length})
						</Text>
						<Box
							p="12"
							rounded="md"
							border="1"
							borderColor="border.tertiary"
							bg="bg.default"
							style={{ minWidth: "300px" }}
						>
							{contentModel.properties.slice(0, 8).map((prop: any) => (
								<Box key={prop.id} py="4">
									<Text fontSize="sm" color="fg.default">
										{prop.displayName || prop.name} ({prop.type})
									</Text>
								</Box>
							))}
							{contentModel.properties.length > 8 && (
								<Text fontSize="sm" color="fg.tertiary" pt="4">
									+{contentModel.properties.length - 8} more properties...
								</Text>
							)}
						</Box>
					</Box>
				)}
			</Box>
		</Box>
	);
}
