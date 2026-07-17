"use client";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogBody,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogHeader,
	Box,
} from "@optiaxiom/react";
import { Text } from "@/app/components/Text";

type WorkflowChangeModalProps = {
	onCancel: () => void;
	onConfirm: () => void;
	workflowName: string;
};

export function WorkflowChangeModal({ onCancel, onConfirm, workflowName }: WorkflowChangeModalProps) {
	return (
		<>
			<Box
				style={{
					backdropFilter: "blur(8px)",
					background: "rgba(231, 239, 255, 0.42)",
					inset: 0,
					position: "fixed",
					zIndex: 79,
				}}
			/>
			<AlertDialog
				onOpenChange={(open) => {
					if (!open) {
						onCancel();
					}
				}}
				open
			>
				<AlertDialogContent
					size="md"
					style={{
						borderRadius: 12,
						boxShadow:
							"0 4px 4px 1px rgba(9, 30, 66, 0.04), 0 6px 12px -3px rgba(9, 30, 66, 0.08), 0 6px 18px 0 rgba(9, 30, 66, 0.04)",
						maxWidth: 600,
						overflow: "hidden",
						width: "min(600px, calc(100vw - 48px))",
					}}
				>
					<AlertDialogHeader addonBefore={null} style={{ padding: "24px 24px 16px" }}>
						<Text
							color="fg.default"
							style={{
								fontSize: 24,
								fontWeight: 500,
								letterSpacing: "-0.6px",
								lineHeight: "32px",
								maxWidth: "none",
							}}
						>
							Change Workflow
						</Text>
					</AlertDialogHeader>
					<AlertDialogBody style={{ padding: "16px 24px" }}>
						<Box display="flex" flexDirection="column" style={{ gap: 24 }}>
							<Text
								color="fg.default"
								style={{
									fontSize: 14,
									fontWeight: 400,
									letterSpacing: "-0.1px",
									lineHeight: "20px",
									maxWidth: "none",
								}}
							>
								This action will remove all steps from this task and replace them with {workflowName}.
							</Text>
							<Text
								color="fg.default"
								style={{
									fontSize: 14,
									fontWeight: 400,
									letterSpacing: "-0.1px",
									lineHeight: "20px",
									maxWidth: "none",
								}}
							>
								Do you want to continue?
							</Text>
						</Box>
					</AlertDialogBody>
					<AlertDialogFooter
						alignItems="center"
						borderColor="border.tertiary"
						borderT="1"
						display="flex"
						justifyContent="flex-end"
						style={{ gap: 16, padding: "20px 24px" }}
					>
						<AlertDialogCancel appearance="subtle" onClick={onCancel} size="lg">
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction appearance="danger" onClick={onConfirm} size="lg">
							Yes, Change
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
