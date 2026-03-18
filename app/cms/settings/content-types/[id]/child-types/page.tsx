"use client";

import { use, useState, useCallback, useMemo } from "react";
import {
	Box,
	Heading,
	Checkbox,
	Flex,
} from "@optiaxiom/react";
import { Text } from "@/app/components/Text";
import { Button } from "@/app/components/Button";
import { Table, Tr, Th, Td } from "@/app/components/Table";
import { initialContentTypes, ContentType } from "@/app/db/initialData";
import { useParams } from "next/navigation";
import usePersistentState from "@/app/usePersistentState";

type SelectionMode = "all" | "none" | "selected";

export default function ChildContentTypesPage() {
	const params = useParams();
	const resolvedParams = params instanceof Promise ? use(params) : params;
	const id = (resolvedParams?.id ?? "") as string;

	// Persistent content types
	const [savedContentTypes, setContentTypes] = usePersistentState(
		"contentTypes",
		initialContentTypes
	) as [ContentType[], (value: ContentType[]) => void];

	const contentTypes = useMemo(() => {
		if (!savedContentTypes) return initialContentTypes;
		const savedMap = new Map(savedContentTypes.map((ct) => [ct.id, ct]));
		initialContentTypes.forEach((ct) => {
			if (!savedMap.has(ct.id)) {
				savedMap.set(ct.id, ct);
			}
		});
		return Array.from(savedMap.values());
	}, [savedContentTypes]);

	const contentType = contentTypes?.find((ct) => ct.id === id);

	// Local form state - track selected content types
	const [availableContentTypes, setAvailableContentTypes] = useState<string[]>(() => {
		if (!contentType?.availableContentTypes) {
			return [];
		}
		return contentType.availableContentTypes.filter(id => id !== "__none__");
	});

	// Get all eligible content types (Page and Experience, excluding self)
	const eligibleContentTypes = useMemo(() => {
		return contentTypes
			.filter(ct => ct.baseType === "Page" || ct.baseType === "Experience")
			.filter(ct => ct.id !== id);
	}, [contentTypes, id]);

	// Determine checkbox states
	const allSelected = availableContentTypes.length === eligibleContentTypes.length;
	const noneSelected = availableContentTypes.length === 0;
	const someSelected = !allSelected && !noneSelected;

	// Handle "select all" checkbox toggle
	const handleSelectAll = useCallback(() => {
		if (allSelected) {
			// If all are selected, deselect all
			setAvailableContentTypes([]);
		} else {
			// Otherwise, select all
			setAvailableContentTypes(eligibleContentTypes.map(ct => ct.id));
		}
	}, [allSelected, eligibleContentTypes]);

	// Toggle individual content type
	const toggleAvailableContentType = useCallback(
		(contentTypeId: string) => {
			setAvailableContentTypes((prev) =>
				prev.includes(contentTypeId)
					? prev.filter((id) => id !== contentTypeId)
					: [...prev, contentTypeId]
			);
		},
		[]
	);

	// Save handler
	const handleSave = useCallback(() => {
		if (!contentTypes || !contentType) return;

		let typesToSave: string[] | undefined;

		if (availableContentTypes.length === eligibleContentTypes.length) {
			// All types selected - don't set availableContentTypes (undefined means no restrictions)
			typesToSave = undefined;
		} else if (availableContentTypes.length === 0) {
			// No types allowed - use special marker
			typesToSave = ["__none__"];
		} else {
			// Selected types only
			typesToSave = availableContentTypes;
		}

		const updatedContentTypes = contentTypes.map((ct: ContentType) => {
			if (ct.id === id) {
				const updated = {
					...ct,
					modifiedAt: new Date().toISOString(),
				};

				if (typesToSave === undefined) {
					// Remove the field for "all"
					delete (updated as any).availableContentTypes;
				} else {
					updated.availableContentTypes = typesToSave;
				}

				return updated;
			}
			return ct;
		});

		setContentTypes(updatedContentTypes);
	}, [
		contentTypes,
		contentType,
		id,
		availableContentTypes,
		eligibleContentTypes,
		setContentTypes,
	]);

	if (!contentType) {
		return (
			<Box flex="1">
				<Text color="fg.error">Content type not found</Text>
			</Box>
		);
	}

	return (
		<Box display="flex" flexDirection="column" style={{ height: "calc(100vh - 130px)", marginLeft: "-32px", marginRight: "-32px", marginTop: "-16px", marginBottom: "-24px" }}>
			<Box flex="1" overflow="auto" px="32" py="16">
				<Box style={{ maxWidth: "900px" }}>
					<Text color="fg.secondary" mb="24">
						Choose what content types you should be able to add as children.
					</Text>

					{/* Child Content Types Table */}
					<Box mb="16">
						<Table>
							<thead>
								<Tr>
									<Th style={{ width: "50px" }}>
										<Checkbox
											checked={allSelected}
											indeterminate={someSelected}
											onCheckedChange={handleSelectAll}
										/>
									</Th>
									<Th>Name</Th>
									<Th>Description</Th>
								</Tr>
							</thead>
							<tbody>
								{eligibleContentTypes.map(ct => (
									<Tr key={ct.id}>
										<Td>
											<Checkbox
												checked={availableContentTypes.includes(ct.id)}
												onCheckedChange={() => toggleAvailableContentType(ct.id)}
											/>
										</Td>
										<Td type="header">{ct.displayName || ct.name}</Td>
										<Td>{ct.description || ""}</Td>
									</Tr>
								))}
							</tbody>
						</Table>
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
