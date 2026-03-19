"use client";

import { use, useState, useCallback, useMemo, useEffect } from "react";
import {
	Box,
	Heading,
	Checkbox,
	Flex,
	toaster,
} from "@optiaxiom/react";
import { Text } from "@/app/components/Text";
import { Button } from "@/app/components/Button";
import { Table, Tr, Th, Td } from "@/app/components/Table";
import { initialContentTypes, ContentType } from "@/app/db/initialData";
import { useParams } from "next/navigation";
import usePersistentState from "@/app/usePersistentState";
import { Footer } from "@/app/context/LayoutContext";

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

	// Local form state - track selected child content types (parent-side)
	const [availableContentTypes, setAvailableContentTypes] = useState<string[]>(() => {
		if (!contentType?.availableContentTypes) {
			return [];
		}
		// Handle new object structure
		if (typeof contentType.availableContentTypes === 'object') {
			// If availability is "None", return empty array
			if (contentType.availableContentTypes.availability === "None") {
				return [];
			}
			// If include is set, use that
			if (contentType.availableContentTypes.include) {
				return contentType.availableContentTypes.include;
			}
			// If exclude is set, calculate the inverse
			if (contentType.availableContentTypes.exclude) {
				const allTypes = contentTypes
					.filter(ct => ct.baseType === "Page" || ct.baseType === "Experience")
					.filter(ct => ct.id !== id)
					.map(ct => ct.id);
				return allTypes.filter(ctId => !contentType.availableContentTypes?.exclude?.includes(ctId));
			}
		}
		return [];
	});

	// Local form state - track selected parent content types (child-side)
	const [availableParentTypes, setAvailableParentTypes] = useState<string[]>(() => {
		if (!contentType?.includeOn) {
			return [];
		}
		return contentType.includeOn;
	});

	// Track initial values to detect changes
	const [initialChildTypes, setInitialChildTypes] = useState<string[]>(availableContentTypes);
	const [initialParentTypes, setInitialParentTypes] = useState<string[]>(availableParentTypes);

	// Get all eligible content types (Page and Experience, excluding self)
	const eligibleContentTypes = useMemo(() => {
		return contentTypes
			.filter(ct => ct.baseType === "Page" || ct.baseType === "Experience")
			.filter(ct => ct.id !== id);
	}, [contentTypes, id]);

	// Check if there are unsaved changes
	const hasUnsavedChanges = useMemo(() => {
		const childTypesChanged = JSON.stringify([...availableContentTypes].sort()) !== JSON.stringify([...initialChildTypes].sort());
		const parentTypesChanged = JSON.stringify([...availableParentTypes].sort()) !== JSON.stringify([...initialParentTypes].sort());
		return childTypesChanged || parentTypesChanged;
	}, [availableContentTypes, availableParentTypes, initialChildTypes, initialParentTypes]);

	// Determine checkbox states for child types
	const allChildrenSelected = availableContentTypes.length === eligibleContentTypes.length;
	const noChildrenSelected = availableContentTypes.length === 0;
	const someChildrenSelected = !allChildrenSelected && !noChildrenSelected;

	// Determine checkbox states for parent types
	const allParentsSelected = availableParentTypes.length === eligibleContentTypes.length;
	const noParentsSelected = availableParentTypes.length === 0;
	const someParentsSelected = !allParentsSelected && !noParentsSelected;

	// Handle "select all" checkbox toggle for children
	const handleSelectAllChildren = useCallback(() => {
		if (allChildrenSelected) {
			setAvailableContentTypes([]);
		} else {
			setAvailableContentTypes(eligibleContentTypes.map(ct => ct.id));
		}
	}, [allChildrenSelected, eligibleContentTypes]);

	// Handle "select all" checkbox toggle for parents
	const handleSelectAllParents = useCallback(() => {
		if (allParentsSelected) {
			setAvailableParentTypes([]);
		} else {
			setAvailableParentTypes(eligibleContentTypes.map(ct => ct.id));
		}
	}, [allParentsSelected, eligibleContentTypes]);

	// Toggle individual child content type
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

	// Toggle individual parent content type
	const toggleAvailableParentType = useCallback(
		(contentTypeId: string) => {
			setAvailableParentTypes((prev) =>
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

		const updatedContentTypes = contentTypes.map((ct: ContentType) => {
			if (ct.id === id) {
				const updated = {
					...ct,
					modifiedAt: new Date().toISOString(),
				};

				// Handle child content types (parent-side restrictions)
				if (availableContentTypes.length === eligibleContentTypes.length) {
					// All types selected - don't set availableContentTypes (undefined means no restrictions)
					delete (updated as any).availableContentTypes;
				} else if (availableContentTypes.length === 0) {
					// No types allowed - use availability: "None"
					updated.availableContentTypes = { availability: "None" };
				} else {
					// Selected types only - use include
					updated.availableContentTypes = { include: availableContentTypes };
				}

				// Handle parent content types (child-side restrictions)
				if (availableParentTypes.length === eligibleContentTypes.length) {
					// All types selected - don't set includeOn (undefined means no restrictions)
					delete (updated as any).includeOn;
				} else if (availableParentTypes.length === 0) {
					// No types allowed - don't set includeOn (undefined)
					delete (updated as any).includeOn;
				} else {
					// Selected types only - use includeOn
					updated.includeOn = availableParentTypes;
				}

				return updated;
			}
			return ct;
		});

		setContentTypes(updatedContentTypes);

		// Update initial values to current values
		setInitialChildTypes(availableContentTypes);
		setInitialParentTypes(availableParentTypes);

		// Show success toast
		toaster.create("Content type restrictions saved successfully", { intent: "success" });
	}, [
		contentTypes,
		contentType,
		id,
		availableContentTypes,
		availableParentTypes,
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
		<>
			<Box style={{ maxWidth: "900px" }}>
				{/* Available Child Content Types Section */}
				<Box mb="48">
					<Text fontSize="lg" fontWeight="600" mb="8">Available Child Content Types</Text>
					<Text color="fg.secondary" mb="16">
						Choose which content types can be created as children under this content type.
					</Text>

					<Table>
						<thead>
							<Tr>
								<Th style={{ width: "50px" }}>
									<Checkbox
										checked={allChildrenSelected}
										indeterminate={someChildrenSelected}
										onCheckedChange={handleSelectAllChildren}
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

				{/* Available Parent Content Types Section */}
				<Box mb="48">
					<Text fontSize="lg" fontWeight="600" mb="8">Available Parent Content Types</Text>
					<Text color="fg.secondary" mb="16">
						Choose which content types this content type can be created under. Leave all unchecked to allow this type under any parent.
					</Text>

					<Table>
						<thead>
							<Tr>
								<Th style={{ width: "50px" }}>
									<Checkbox
										checked={allParentsSelected}
										indeterminate={someParentsSelected}
										onCheckedChange={handleSelectAllParents}
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
											checked={availableParentTypes.includes(ct.id)}
											onCheckedChange={() => toggleAvailableParentType(ct.id)}
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

			{/* Fixed Save Footer */}
			<Footer>
				<Button appearance="primary" onClick={handleSave} disabled={!hasUnsavedChanges}>
					Save
				</Button>
			</Footer>
		</>
	);
}
