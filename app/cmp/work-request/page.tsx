"use client";

import {useState, useMemo} from "react";
import {Box, Tabs, TabsList, TabsTrigger, TabsContent, Badge, Avatar} from "@optiaxiom/react";
import {Text} from "@/app/components/Text";
import {Input} from "@/app/components/Input";
import {Button} from "@/app/components/Button";
import {Table, Tr, Th, Td} from "@/app/components/Table";
import {
	IconSearch,
	IconFilter,
	IconChevronDown,
	IconShare2,
	IconDownload,
	IconPlus,
	IconColumns3,
} from "@/app/lib/axiom-icons";

// Mock data types
interface WorkRequest {
	id: string;
	title: string;
	referenceId: string;
	relatedActivities: number;
	priority: "Low" | "Medium" | "High";
	status: "Accepted" | "Completed" | "Declined" | "Overdue" | "Submitted";
	requestedBy: string;
	requestedByAvatar?: string;
	submittedDate: Date;
	deliverableDueDate: Date;
}

interface PitchRequest {
	id: string;
	title: string;
	referenceId: string;
	relatedActivities: number;
	priority: "Low" | "Medium" | "High";
	status: "Accepted" | "Completed" | "Declined" | "Overdue" | "Submitted";
	requestedBy: string;
	requestedByAvatar?: string;
	submittedDate: Date;
	deliverableDueDate: Date;
}

// Mock data
const mockWorkRequests: WorkRequest[] = [
	{
		id: "1",
		title: "Design new landing page hero section",
		referenceId: "WR-2025-001",
		relatedActivities: 3,
		priority: "High",
		status: "Submitted",
		requestedBy: "Sarah Johnson",
		requestedByAvatar: "/avatars/sarah.jpg",
		submittedDate: new Date("2025-02-24"),
		deliverableDueDate: new Date("2025-03-10"),
	},
	{
		id: "2",
		title: "Create product comparison matrix",
		referenceId: "WR-2025-002",
		relatedActivities: 2,
		priority: "Medium",
		status: "Accepted",
		requestedBy: "Michael Chen",
		requestedByAvatar: "/avatars/michael.jpg",
		submittedDate: new Date("2025-02-23"),
		deliverableDueDate: new Date("2025-03-05"),
	},
	{
		id: "3",
		title: "Update brand guidelines documentation",
		referenceId: "WR-2025-003",
		relatedActivities: 5,
		priority: "Medium",
		status: "Completed",
		requestedBy: "Jennifer Lee",
		requestedByAvatar: "/avatars/jennifer.jpg",
		submittedDate: new Date("2025-02-20"),
		deliverableDueDate: new Date("2025-02-28"),
	},
	{
		id: "4",
		title: "Develop marketing email templates",
		referenceId: "WR-2025-004",
		relatedActivities: 4,
		priority: "High",
		status: "Overdue",
		requestedBy: "David Martinez",
		requestedByAvatar: "/avatars/david.jpg",
		submittedDate: new Date("2025-02-15"),
		deliverableDueDate: new Date("2025-02-26"),
	},
	{
		id: "5",
		title: "Create social media asset pack",
		referenceId: "WR-2025-005",
		relatedActivities: 1,
		priority: "Low",
		status: "Declined",
		requestedBy: "Emily Wilson",
		requestedByAvatar: "/avatars/emily.jpg",
		submittedDate: new Date("2025-02-18"),
		deliverableDueDate: new Date("2025-03-08"),
	},
	{
		id: "6",
		title: "Revise pitch deck for Q1 investor meeting",
		referenceId: "WR-2025-006",
		relatedActivities: 6,
		priority: "High",
		status: "Submitted",
		requestedBy: "Robert Taylor",
		requestedByAvatar: "/avatars/robert.jpg",
		submittedDate: new Date("2025-02-25"),
		deliverableDueDate: new Date("2025-03-03"),
	},
];

const mockPitchRequests: PitchRequest[] = [
	{
		id: "p1",
		title: "Enterprise software platform pitch",
		referenceId: "PR-2025-001",
		relatedActivities: 4,
		priority: "High",
		status: "Submitted",
		requestedBy: "Alex Kim",
		requestedByAvatar: "/avatars/alex.jpg",
		submittedDate: new Date("2025-02-22"),
		deliverableDueDate: new Date("2025-03-15"),
	},
	{
		id: "p2",
		title: "SaaS product positioning strategy",
		referenceId: "PR-2025-002",
		relatedActivities: 2,
		priority: "Medium",
		status: "Accepted",
		requestedBy: "Lisa Thompson",
		requestedByAvatar: "/avatars/lisa.jpg",
		submittedDate: new Date("2025-02-20"),
		deliverableDueDate: new Date("2025-03-12"),
	},
	{
		id: "p3",
		title: "Mobile app marketing strategy pitch",
		referenceId: "PR-2025-003",
		relatedActivities: 3,
		priority: "Low",
		status: "Completed",
		requestedBy: "James Brown",
		requestedByAvatar: "/avatars/james.jpg",
		submittedDate: new Date("2025-02-18"),
		deliverableDueDate: new Date("2025-03-01"),
	},
];

// Status color mapping
const getStatusColor = (status: WorkRequest["status"]): {bg: string; text: string; dot: string} => {
	switch (status) {
		case "Accepted":
			return {bg: "#F0F9FF", text: "#0369A1", dot: "#0369A1"};
		case "Completed":
			return {bg: "#F0FDF4", text: "#166534", dot: "#166534"};
		case "Declined":
			return {bg: "#FEF2F2", text: "#DC2626", dot: "#DC2626"};
		case "Overdue":
			return {bg: "#FEF3C7", text: "#92400E", dot: "#D97706"};
		case "Submitted":
			return {bg: "#F3F0FF", text: "#6D28D9", dot: "#6D28D9"};
		default:
			return {bg: "#F5F5F5", text: "#666666", dot: "#999999"};
	}
};

// Priority color mapping
const getPriorityColor = (priority: WorkRequest["priority"]): string => {
	switch (priority) {
		case "High":
			return "#DC2626";
		case "Medium":
			return "#D97706";
		case "Low":
			return "#16A34A";
		default:
			return "#999999";
	}
};

// Format relative time
const getRelativeTime = (date: Date): string => {
	const now = new Date();
	const diffTime = Math.abs(now.getTime() - date.getTime());
	const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

	if (diffDays === 0) return "today";
	if (diffDays === 1) return "1 day ago";
	if (diffDays < 7) return `${diffDays} days ago`;
	if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
	return `${Math.floor(diffDays / 30)} months ago`;
};

// Request row component
function RequestRow({item}: {item: WorkRequest | PitchRequest}) {
	const statusColors = getStatusColor(item.status);
	const priorityColor = getPriorityColor(item.priority);

	return (
		<Tr style={{cursor: "pointer"}} className="hover:bg-[var(--ax-colors-bg-default-hovered)]">
			<Td>
				<Box display="flex" flexDirection="column" gap="4">
					<Text fontSize="sm" color="fg.tertiary">
						{item.referenceId}
					</Text>
					<Text fontSize="md" fontWeight="500" color="fg.default">
						{item.title}
					</Text>
				</Box>
			</Td>
			<Td>
				<Text fontSize="md" color="fg.default">
					{item.relatedActivities}
				</Text>
			</Td>
			<Td>
				<Box display="flex" alignItems="center" gap="6">
					<Box
						style={{
							width: 8,
							height: 8,
							borderRadius: "50%",
							backgroundColor: priorityColor,
						}}
					/>
					<Text fontSize="sm" color="fg.default">
						{item.priority}
					</Text>
				</Box>
			</Td>
			<Td>
				<Box
					px="8"
					py="4"
					style={{
						backgroundColor: statusColors.bg,
						borderRadius: 4,
						display: "inline-block",
					}}
				>
					<Text fontSize="sm" fontWeight="500" style={{color: statusColors.text}}>
						{item.status}
					</Text>
				</Box>
			</Td>
			<Td>
				<Box display="flex" alignItems="center" gap="8">
					<Avatar src={item.requestedByAvatar} name={item.requestedBy} size="sm" />
					<Text fontSize="sm" color="fg.default">
						{item.requestedBy}
					</Text>
				</Box>
			</Td>
			<Td>
				<Box display="flex" flexDirection="column" gap="2">
					<Text fontSize="sm" color="fg.default">
						{item.submittedDate.toLocaleDateString("en-US", {
							month: "short",
							day: "numeric",
							year: "numeric",
						})}
					</Text>
					<Text fontSize="xs" color="fg.tertiary">
						{getRelativeTime(item.submittedDate)}
					</Text>
				</Box>
			</Td>
			<Td>
				<Text fontSize="sm" color="fg.default">
					{item.deliverableDueDate.toLocaleDateString("en-US", {
						month: "short",
						day: "numeric",
						year: "numeric",
					})}
				</Text>
			</Td>
		</Tr>
	);
}

// Dropdown menu component
function DropdownButton({
	label,
	icon: Icon,
	items,
}: {
	label: string;
	icon?: React.ReactNode;
	items: string[];
}) {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<Box style={{position: "relative"}}>
			<Button
				appearance="subtle"
				size="md"
				onClick={() => setIsOpen(!isOpen)}
				icon={Icon}
				addonAfter={<IconChevronDown size={20} />}
			>
				{label}
			</Button>
			{isOpen && (
				<Box
					style={{
						position: "absolute",
						top: "100%",
						left: 0,
						backgroundColor: "white",
						border: "1px solid var(--ax-colors-border-tertiary)",
						borderRadius: "6px",
						minWidth: "180px",
						marginTop: "4px",
						boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
						zIndex: 10,
					}}
				>
					{items.map((item, index) => (
						<Box
							key={index}
							px="12"
							py="8"
							style={{
								cursor: "pointer",
								borderBottom:
									index < items.length - 1
										? "1px solid var(--ax-colors-border-tertiary)"
										: "none",
							}}
							className="hover:bg-[var(--ax-colors-bg-default-hovered)]"
						>
							<Text fontSize="sm" color="fg.default">
								{item}
							</Text>
						</Box>
					))}
				</Box>
			)}
		</Box>
	);
}

export default function CMPWorkRequestPage() {
	const [activeTab, setActiveTab] = useState("work-requests");
	const [searchQuery, setSearchQuery] = useState("");
	const [pageSize, setPageSize] = useState(20);
	const [filterCount] = useState(5);

	// Get items for active tab
	const items = activeTab === "work-requests" ? mockWorkRequests : mockPitchRequests;

	// Filter items based on search
	const filteredItems = useMemo(() => {
		return items.filter(
			(item) =>
				item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
				item.referenceId.toLowerCase().includes(searchQuery.toLowerCase())
		);
	}, [items, searchQuery]);

	// Pagination
	const totalCount = filteredItems.length;
	const startIndex = 1;
	const endIndex = Math.min(pageSize, totalCount);

	return (
		<Box display="flex" flexDirection="column" gap="16" w="full">
			{/* Tabs */}
			<Tabs value={activeTab} onValueChange={setActiveTab}>
				<TabsList>
					<TabsTrigger value="pitch-requests">
						<Box display="flex" gap="8" alignItems="center">
							<Text fontSize="md" fontWeight="500">
								Pitch Requests
							</Text>
							<Badge intent={activeTab === "pitch-requests" ? "primary" : "neutral"}>
								{mockPitchRequests.length}
							</Badge>
						</Box>
					</TabsTrigger>
					<TabsTrigger value="work-requests">
						<Box display="flex" gap="8" alignItems="center">
							<Text fontSize="md" fontWeight="500">
								Work Requests
							</Text>
							<Badge intent={activeTab === "work-requests" ? "primary" : "neutral"}>
								{mockWorkRequests.length}
							</Badge>
						</Box>
					</TabsTrigger>
				</TabsList>

				<TabsContent value={activeTab}>
					{/* Toolbar */}
					<Box display="flex" gap="8" mb="16" alignItems="center" flexWrap="wrap">
						{/* Filter Button */}
						<Button appearance="subtle" size="md" style={{position: "relative"}} icon={<IconFilter />}>
							{filterCount > 0 && (
								<Box
									style={{
										position: "absolute",
										top: -4,
										right: -4,
										width: 18,
										height: 18,
										borderRadius: "50%",
										backgroundColor: "var(--ax-colors-fg-default)",
										color: "white",
										fontSize: "11px",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										fontWeight: "bold",
									}}
								>
									{filterCount}
								</Box>
							)}
						</Button>

						{/* Search Input */}
						<Box flex="1" style={{maxWidth: "350px", position: "relative"}}>
							<Input
								placeholder={`Search ${activeTab === "work-requests" ? "work requests" : "pitch requests"}`}
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								style={{paddingLeft: "40px"}}
							/>
							<Box
								style={{
									position: "absolute",
									left: "12px",
									top: "50%",
									transform: "translateY(-50%)",
								}}
							>
								<IconSearch size={16} color="#66708C" />
							</Box>
						</Box>

						{/* Share Request URL Dropdown */}
						<DropdownButton
							label="Share Request URL"
							icon={<IconShare2 size={16} />}
							items={["Copy Link", "Email Link", "Slack Message"]}
						/>

						{/* Export Dropdown */}
						<DropdownButton
							label="Export"
							icon={<IconDownload size={16} />}
							items={["Export as CSV", "Export as Excel", "Export as PDF"]}
						/>

						{/* Add Request Button */}
						<Button appearance="primary" size="md" icon={<IconPlus />}>
							Add Request
						</Button>

						{/* Spacer */}
						<Box flex="1" />

						{/* Columns Dropdown */}
						<DropdownButton
							label="Columns"
							icon={<IconColumns3 size={16} />}
							items={[
								"Request",
								"Related Activities",
								"Priority",
								"Status",
								"Requested By",
								"Submitted Date",
								"Deliverable Due Date",
							]}
						/>
					</Box>

					{/* Table */}
					<Box
						style={{
							border: "1px solid var(--ax-colors-border-tertiary)",
							borderRadius: "6px",
							overflow: "hidden",
						}}
					>
						<Table>
							<thead>
								<Tr style={{backgroundColor: "var(--ax-colors-bg-default)"}}>
									<Th>
										<Box display="flex" alignItems="center" gap="4">
											<Text
												fontSize="sm"
												fontWeight="500"
												color="fg.secondary"
											>
												Request
											</Text>
											<IconChevronDown size={14} />
										</Box>
									</Th>
									<Th>
										<Box display="flex" alignItems="center" gap="4">
											<Text
												fontSize="sm"
												fontWeight="500"
												color="fg.secondary"
											>
												Related Activities
											</Text>
											<IconChevronDown size={14} />
										</Box>
									</Th>
									<Th>
										<Box display="flex" alignItems="center" gap="4">
											<Text
												fontSize="sm"
												fontWeight="500"
												color="fg.secondary"
											>
												Priority
											</Text>
											<IconChevronDown size={14} />
										</Box>
									</Th>
									<Th>
										<Box display="flex" alignItems="center" gap="4">
											<Text
												fontSize="sm"
												fontWeight="500"
												color="fg.secondary"
											>
												Status
											</Text>
											<IconChevronDown size={14} />
										</Box>
									</Th>
									<Th>
										<Box display="flex" alignItems="center" gap="4">
											<Text
												fontSize="sm"
												fontWeight="500"
												color="fg.secondary"
											>
												Requested By
											</Text>
											<IconChevronDown size={14} />
										</Box>
									</Th>
									<Th>
										<Box display="flex" alignItems="center" gap="4">
											<Text
												fontSize="sm"
												fontWeight="500"
												color="fg.secondary"
											>
												Submitted Date
											</Text>
											<IconChevronDown size={14} />
										</Box>
									</Th>
									<Th>
										<Box display="flex" alignItems="center" gap="4">
											<Text
												fontSize="sm"
												fontWeight="500"
												color="fg.secondary"
											>
												Deliverable Due Date
											</Text>
											<IconChevronDown size={14} />
										</Box>
									</Th>
								</Tr>
							</thead>
							<tbody>
								{filteredItems.slice(0, pageSize).map((item) => (
									<RequestRow key={item.id} item={item} />
								))}
							</tbody>
						</Table>
					</Box>

					{/* Pagination Footer */}
					<Box display="flex" alignItems="center" justifyContent="space-between" mt="16">
						<Box display="flex" alignItems="center" gap="8">
							<Text fontSize="sm" color="fg.secondary">
								Page Size
							</Text>
							<DropdownButton
								label={pageSize.toString()}
								items={["10", "20", "50", "100"]}
							/>
						</Box>

						<Text fontSize="sm" color="fg.secondary">
							{startIndex}-{endIndex} of {totalCount} requests
						</Text>
					</Box>
				</TabsContent>
			</Tabs>
		</Box>
	);
}
