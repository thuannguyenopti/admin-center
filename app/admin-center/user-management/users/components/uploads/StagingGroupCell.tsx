"use client";

import {
	Box,
	LabelMenuButton,
	Menu,
	MenuContent,
	MenuTrigger,
	Text,
} from "@optiaxiom/react";
import { GROUPS_DATA } from "../../../groups/data";
import { resolveGroupByName } from "./resolveGroupAccess";
import type { StagingUser } from "./data";

export type GroupAccessPatch = Pick<
	StagingUser,
	"groupName" | "groupId" | "groupMatch" | "product" | "instance" | "role"
>;

export function patchFromGroupName(groupName: string): GroupAccessPatch {
	const matched = resolveGroupByName(groupName);
	if (!matched) {
		return {
			groupName,
			groupId: undefined,
			groupMatch: "unknown",
			product: undefined,
			instance: undefined,
			role: undefined,
		};
	}
	return {
		groupName: matched.groupName,
		groupId: matched.groupId,
		groupMatch: "matched",
		product: matched.product,
		instance: matched.instance,
		role: matched.role,
	};
}

export function StagingGroupCell({
	user,
	editable,
	onChangeGroup,
}: {
	user: StagingUser;
	editable: boolean;
	onChangeGroup: (patch: GroupAccessPatch) => void;
}) {
	if (!user.groupName && user.importMode !== "groupAccess") {
		return (
			<Text fontSize="sm" color="fg.tertiary">
				—
			</Text>
		);
	}

	const options = GROUPS_DATA.map((g) => ({
		label: g.name,
		execute: () => onChangeGroup(patchFromGroupName(g.name)),
	}));

	return (
		<Box
			display="flex"
			flexDirection="column"
			gap="2"
			onClick={(e) => e.stopPropagation()}
			style={{ minWidth: 180, maxWidth: 280 }}
		>
			{editable ? (
				<Menu options={options}>
					<MenuTrigger asChild>
						<LabelMenuButton label="Group">
							{user.groupName || "Select group"}
						</LabelMenuButton>
					</MenuTrigger>
					<MenuContent
						style={{
							maxHeight: 280,
							overflow: "auto",
							minWidth: 240,
						}}
					/>
				</Menu>
			) : (
				<Text fontSize="sm">{user.groupName || "—"}</Text>
			)}
			{user.groupMatch === "matched" && (
				<Text fontSize="sm" color="fg.secondary">
					{user.product} · {user.instance} · {user.role}
				</Text>
			)}
			{user.groupMatch === "unknown" && (
				<Text fontSize="sm" color="fg.error">
					Unknown group — pick a valid group
				</Text>
			)}
		</Box>
	);
}
