import {Alert, Box, Button, Text} from "@optiaxiom/react";
import Flow from "@/app/components/Flow";

type RetrievalStatus = "idle" | "loading" | "ready" | "error";

type DevStateInspectorProps = {
	status: RetrievalStatus;
	startedAt: number | null;
	onSetSuccess: () => void;
	onSetFailure: () => void;
};

export default function DevStateInspector({
	status,
	startedAt,
	onSetSuccess,
	onSetFailure,
}: DevStateInspectorProps) {
	const statusIntent =
		status === "ready" ? "success" : status === "error" ? "danger" : "information";

	return (
		<Box
			bg="bg.default"
			borderColor="border.default"
			p="12"
			style={{
				position: "fixed",
				right: 20,
				top: 120,
				width: 320,
				zIndex: 20,
				border: "1px solid var(--ax-border-default)",
				borderRadius: 12,
				boxShadow: "0 10px 25px rgba(0, 0, 0, 0.12)",
			}}
		>
			<Flow gap="8">
				<Text fontWeight="500">Developer State Inspector</Text>

				<Alert intent={statusIntent}>
					Current status: {status}
					{startedAt ? ` (started ${new Date(startedAt).toLocaleTimeString()})` : ""}
				</Alert>

				<Box display="flex" gap="8">
					<Button size="sm" appearance="primary" onClick={onSetSuccess}>
						Set successful retrieval
					</Button>
					<Button size="sm" appearance="danger" onClick={onSetFailure}>
						Set failed retrieval
					</Button>
				</Box>
			</Flow>
		</Box>
	);
}
