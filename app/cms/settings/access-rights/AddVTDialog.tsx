"use client";

import {
	Dialog,
	DialogBody,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	Box,
} from "@optiaxiom/react";
import { Text } from "@/app/components/Text";
import { getCMSVirtualTeammates } from "@/app/cms/data/vt-activity";
import type { Role } from "./mockData";

export function AddVTDialog({
	open,
	onOpenChange,
	existingVTIds,
	onAdd,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	existingVTIds: string[];
	onAdd: (role: Role) => void;
}) {
	const availableVTs = getCMSVirtualTeammates().filter(
		(vt) => !existingVTIds.includes(vt.id)
	);

	const handleSelect = (vt: (typeof availableVTs)[number]) => {
		onAdd({
			id: `vt-${vt.id}`,
			name: vt.name,
			type: "vt",
			vtId: vt.id,
			templateName: vt.templateName,
			avatar: vt.avatar,
			avatarBg: vt.avatarBg,
			permissions: {
				read: true,
				create: false,
				change: false,
				delete: false,
				publish: false,
				administer: false,
			},
		});
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>Add Virtual Teammate</DialogHeader>
				<DialogBody>
					{availableVTs.length === 0 ? (
						<Text fontSize="md" color="fg.tertiary">
							All CMS-enabled Virtual Teammates have already been added.
						</Text>
					) : (
						<Box display="flex" flexDirection="column" gap="8">
							<Text fontSize="md" color="fg.tertiary">
								Select a Virtual Teammate to add to the access rights list.
							</Text>
							<Box display="flex" flexDirection="column" gap="4">
								{availableVTs.map((vt) => (
									<Box
										key={vt.id}
										display="flex"
										alignItems="center"
										gap="12"
										p="12"
										rounded="md"
										style={{
											cursor: "pointer",
											border: "1px solid var(--ax-colors-border-tertiary)",
										}}
										onClick={() => handleSelect(vt)}
									>
										<Box
											style={{
												width: 36,
												height: 36,
												borderRadius: "50%",
												overflow: "hidden",
												background: vt.avatarBg,
												flexShrink: 0,
											}}
										>
											<img
												src={vt.avatar}
												alt={vt.name}
												width={36}
												height={36}
												style={{ display: "block" }}
											/>
										</Box>
										<Box display="flex" flexDirection="column" gap="2">
											<Text fontSize="md" fontWeight="500" color="fg.default">
												{vt.name}
											</Text>
											<Text fontSize="sm" color="fg.tertiary">
												{vt.templateName}
											</Text>
										</Box>
									</Box>
								))}
							</Box>
						</Box>
					)}
				</DialogBody>
				<DialogFooter>
					<DialogClose>Cancel</DialogClose>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
