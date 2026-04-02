"use client";

import {Dialog, DialogContent, DialogHeader, DialogBody, DialogFooter} from "@optiaxiom/react";
import {Button} from "@/app/components/Button";
import {Text} from "@/app/components/Text";
import {Table, Tr, Th, Td} from "@/app/components/Table";
import type {ContentType, ContentTypeMapping} from "@/app/db/initialData";

interface TargetContentTypeDialogProps {
	open: boolean;
	onClose: () => void;
	availableTargets: Array<{mapping: ContentTypeMapping; targetType: ContentType}>;
	onSelect: (targetContentTypeId: string) => void;
}

export default function TargetContentTypeDialog({
	open,
	onClose,
	availableTargets,
	onSelect,
}: TargetContentTypeDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent style={{maxWidth: "600px"}}>
				<DialogHeader>Select Content Type</DialogHeader>
				<DialogBody>
					<Text color="fg.secondary" mb="16">
						This content can be transformed into multiple CMS content types. Choose which type to create:
					</Text>

					<Table>
						<thead>
							<Tr>
								<Th>Content Type</Th>
								<Th>Properties Mapped</Th>
								<Th style={{width: "100px"}}>Action</Th>
							</Tr>
						</thead>
						<tbody>
							{availableTargets.map(({mapping, targetType}) => (
								<Tr key={targetType.id}>
									<Td type="header">
										{targetType.displayName || targetType.name}
										{targetType.description && (
											<div>
												<Text fontSize="sm" color="fg.secondary">
													{targetType.description}
												</Text>
											</div>
										)}
									</Td>
									<Td>
										<Text color="fg.secondary">
											{mapping.propertyMappings.length} properties
										</Text>
									</Td>
									<Td>
										<Button
											appearance="primary"
											size="sm"
											onClick={() => onSelect(targetType.id)}
										>
											Create
										</Button>
									</Td>
								</Tr>
							))}
						</tbody>
					</Table>
				</DialogBody>
				<DialogFooter>
					<Button appearance="subtle" onClick={onClose}>
						Cancel
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
