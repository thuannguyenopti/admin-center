"use client";

import type { User } from "../../data";
import { EditUserInfoModal, type UserInfoUpdate } from "./EditUserInfoModal";
import { EditUserTypeModal, type UserTypeUpdate } from "./EditUserTypeModal";
import { ResetPasswordModal } from "./ResetPasswordModal";
import { AddAccessModal } from "./AddAccessModal";
import { RemoveAccessModal } from "./RemoveAccessModal";
import { DeleteUsersModal } from "./DeleteUsersModal";

export type BulkModal =
	| "editInfo"
	| "editType"
	| "resetPw"
	| "addAccess"
	| "removeAccess"
	| "delete"
	| null;

export function BulkActionModals({
	modal,
	users,
	onClose,
	onUpdateInfo,
	onUpdateType,
	onDeleteUsers,
	onClearSelection,
}: {
	modal: BulkModal;
	users: User[];
	onClose: () => void;
	onUpdateInfo: (updates: UserInfoUpdate[]) => void;
	onUpdateType: (updates: UserTypeUpdate[]) => void;
	onDeleteUsers: (ids: string[]) => void;
	onClearSelection: () => void;
}) {
	if (!modal || users.length === 0) return null;

	switch (modal) {
		case "editInfo":
			return (
				<EditUserInfoModal users={users} onClose={onClose} onApply={onUpdateInfo} />
			);
		case "editType":
			return (
				<EditUserTypeModal users={users} onClose={onClose} onApply={onUpdateType} />
			);
		case "resetPw":
			return (
				<ResetPasswordModal users={users} onClose={onClose} onSuccess={onClearSelection} />
			);
		case "addAccess":
			return (
				<AddAccessModal users={users} onClose={onClose} onSuccess={onClearSelection} />
			);
		case "removeAccess":
			return (
				<RemoveAccessModal users={users} onClose={onClose} onSuccess={onClearSelection} />
			);
		case "delete":
			return (
				<DeleteUsersModal users={users} onClose={onClose} onApply={onDeleteUsers} />
			);
		default:
			return null;
	}
}
