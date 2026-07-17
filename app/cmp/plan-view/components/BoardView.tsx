import { Box, Badge, Avatar } from "@optiaxiom/react";
import { Text } from "@/app/components/Text";
import type { PlanItem } from "../types";

type BoardViewProps = {
	data: PlanItem[];
};

const statuses = ["Not Started", "In Progress", "On Track", "At Risk", "Overdue", "Completed"];

export function BoardView({ data }: BoardViewProps) {
	const itemsByStatus = statuses.reduce(
		(acc, status) => {
			acc[status] = data.filter((item) => !item.isGroup && item.status === status);
			return acc;
		},
		{} as Record<string, PlanItem[]>,
	);

	return (
		<Box
			display="flex"
			gap="12"
			overflow="auto"
			bg="bg.default"
			p="16"
			style={{ height: "100%", width: "100%" }}
		>
			{statuses.map((status) => (
				<Box
					key={status}
					style={{
						minWidth: "340px",
						maxWidth: "340px",
						display: "flex",
						flexDirection: "column",
						backgroundColor: "var(--ax-colors-bg-secondary)",
						borderRadius: "8px",
						border: "1px solid var(--ax-colors-border-tertiary)",
						overflow: "hidden",
					}}
				>
					<Box
						style={{
							padding: "12px 16px",
							borderBottom: "1px solid var(--ax-colors-border-tertiary)",
							display: "flex",
							alignItems: "center",
							justifyContent: "space-between",
						}}
					>
						<Text fontWeight="500" fontSize="sm">
							{status}
						</Text>
						<Badge intent="neutral">{itemsByStatus[status].length}</Badge>
					</Box>

					<Box
						style={{
							flex: 1,
							overflowY: "auto",
							padding: "12px",
							display: "flex",
							flexDirection: "column",
							gap: "12px",
						}}
					>
						{itemsByStatus[status].length === 0 ? (
							<Box
								style={{
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									minHeight: "200px",
								}}
							>
								<Text color="fg.tertiary">No items</Text>
							</Box>
						) : (
							itemsByStatus[status].map((item) => (
								<Box
									key={item.id}
									style={{
										backgroundColor: "var(--ax-colors-bg-default)",
										borderRadius: "6px",
										border: "1px solid var(--ax-colors-border-tertiary)",
										padding: "12px",
										cursor: "pointer",
										transition: "all 0.2s",
									}}
									onMouseEnter={(e) => {
										const el = e.currentTarget as HTMLElement;
										el.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
										el.style.transform = "translateY(-2px)";
									}}
									onMouseLeave={(e) => {
										const el = e.currentTarget as HTMLElement;
										el.style.boxShadow = "none";
										el.style.transform = "translateY(0)";
									}}
								>
									<Box
										style={{
											display: "flex",
											alignItems: "flex-start",
											gap: "8px",
											marginBottom: "8px",
										}}
									>
										<Box style={{ flex: 1 }}>
											<Text fontWeight="500" fontSize="sm" className="truncate">
												{item.title}
											</Text>
										</Box>
										<Badge intent="neutral" className="whitespace-nowrap">
											{item.type}
										</Badge>
									</Box>

									<Text fontSize="xs" color="fg.tertiary" className="mb-2">
										{item.reference}
									</Text>

									<Box
										style={{
											display: "flex",
											alignItems: "center",
											gap: "8px",
											marginTop: "8px",
										}}
									>
										<Avatar name={item.owner.name} src={item.owner.src} size="sm" />
										<Text fontSize="xs" color="fg.secondary" className="truncate">
											{item.owner.name}
										</Text>
									</Box>

									{(item.startDate !== "No start date" || item.endDate !== "No end date") && (
										<Box
											style={{
												marginTop: "8px",
												fontSize: "11px",
												color: "var(--ax-colors-fg-tertiary)",
											}}
										>
											{item.startDate !== "No start date" && (
												<Box style={{ marginBottom: "2px" }}>From: {item.startDate}</Box>
											)}
											{item.endDate !== "No end date" && <Box>To: {item.endDate}</Box>}
										</Box>
									)}
								</Box>
							))
						)}
					</Box>
				</Box>
			))}
		</Box>
	);
}
