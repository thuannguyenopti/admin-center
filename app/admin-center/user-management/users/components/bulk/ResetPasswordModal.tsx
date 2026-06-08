"use client";

import { Box, Button, Text, toaster } from "@optiaxiom/react";
import type { User } from "../../data";
import { BulkModalShell } from "./BulkModalShell";

export function ResetPasswordModal({
	users,
	onClose,
	onSuccess,
}: {
	users: User[];
	onClose: () => void;
	onSuccess: () => void;
}) {
	// Password reset is only available for local users.
	const hasNonLocal = users.some((u) => u.userType !== "Local");

	const handleReset = () => {
		toaster.create("Password reset email sent", { intent: "success" });
		onSuccess();
		onClose();
	};

	if (hasNonLocal) {
		return (
			<BulkModalShell
				title="Cannot reset password"
				onClose={onClose}
				height="auto"
				footer={
					<Button appearance="primary" onClick={onClose}>
						Got it
					</Button>
				}
			>
				<Box display="flex" flexDirection="column" gap="8">
					<Text>Some selected users don&rsquo;t support password reset.</Text>
					<Text>
						Password reset is only available for <strong>local users</strong>.
					</Text>
					<Text>
						Please filter users by <strong>User type</strong> = <strong>Local</strong>{" "}
						and try again.
					</Text>
				</Box>
			</BulkModalShell>
		);
	}

	return (
		<BulkModalShell
			title="Reset password for selected users"
			onClose={onClose}
			height="auto"
			footer={
				<>
					<Button appearance="subtle" onClick={onClose}>
						Cancel
					</Button>
					<Button appearance="primary" onClick={handleReset}>
						Reset password
					</Button>
				</>
			}
		>
			<Box display="flex" flexDirection="column" gap="8">
				<Text>
					You&rsquo;re about to reset the password for{" "}
					<strong>
						{users.length} user{users.length === 1 ? "" : "s"}
					</strong>
					.
				</Text>
				<Text color="fg.secondary">
					Each account will be moved to a password-reset state and the user will
					receive an email with a secure reset link. The link expires in 7 days.
				</Text>
			</Box>
		</BulkModalShell>
	);
}
