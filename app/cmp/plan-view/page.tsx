"use client";

import {
	Box,
	SearchInput,
	Button,
	Switch,
	Tabs,
	TabsList,
	TabsTrigger,
	Badge,
	Table,
	TableBody,
	TableCell,
	TableHeader,
	TableHeaderCell,
	TableRow,
	Checkbox,
	Avatar,
} from "@optiaxiom/react";
import {Text} from "@/app/components/Text";
import {
	IconFilter,
	IconChevronDown,
	IconChevronRight,
	IconDots,
	IconPlus,
} from "@tabler/icons-react";
import {useState} from "react";
import {useRouter} from "next/navigation";

// Random avatar images for visual variety
const avatarImages = [
	"https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face",
	"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
	"https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&h=80&fit=crop&crop=face",
	"https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face",
	"https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face",
	"https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=face",
];

// Mock data for the plan view
const planData = [
	{
		id: "1",
		title: "David Hours Tracking",
		type: "Task",
		reference: "TSK-2702",
		owner: {name: "David Steinberg", src: avatarImages[0]},
		creationDate: "Sep 15, 2025",
		startDate: "No start date",
		endDate: "No end date",
		dependsOn: null,
		status: "Not Started",
		parentCampaign: null,
		lastModified: "Nov 25, 2025",
		currentStep: "1 of 2",
		currentStepName: "Briefing",
	},
	{
		id: "2",
		title: "Content Rec",
		type: "Task",
		reference: "TSK-2695",
		owner: {name: "Hsiao-Pei Chien", src: avatarImages[1]},
		creationDate: "Mar 20, 2025",
		startDate: "No start date",
		endDate: "No end date",
		dependsOn: null,
		status: "In Progress",
		parentCampaign: null,
		lastModified: "Sep 15, 2025",
		currentStep: "1 of 1",
		currentStepName: "Review",
	},
	{
		id: "social",
		title: "Social",
		type: "Campaign",
		reference: "CPN-39",
		owner: {name: "Hsiao-Pei Chien", src: avatarImages[1]},
		creationDate: "Mar 20, 2025",
		startDate: "Mar 20, 2025",
		endDate: "No end date",
		dependsOn: null,
		status: "On Track",
		parentCampaign: null,
		lastModified: "Mar 20, 2025",
		currentStep: null,
		currentStepName: null,
		badge: 1,
		isGroup: true,
	},
	{
		id: "3",
		title: "Hotel Brochure",
		type: "Task",
		reference: "TSK-2691",
		owner: {name: "David Steinberg", src: avatarImages[0]},
		creationDate: "Feb 27, 2025",
		startDate: "No start date",
		endDate: "No end date",
		dependsOn: null,
		status: "At Risk",
		parentCampaign: null,
		lastModified: "May 5, 2025",
		currentStep: "0 of 0",
		currentStepName: null,
	},
	{
		id: "m",
		title: "m",
		type: "Campaign",
		reference: "CPN-38",
		owner: {name: "Md Nadim Sakib", src: avatarImages[2]},
		creationDate: "Feb 19, 2025",
		startDate: "Feb 19, 2025",
		endDate: "No end date",
		dependsOn: null,
		status: "Not Started",
		parentCampaign: null,
		lastModified: "Feb 19, 2025",
		currentStep: null,
		currentStepName: null,
		badge: 1,
		isGroup: true,
	},
	{
		id: "test-camp",
		title: "Test camp",
		type: "Campaign",
		reference: "CPN-37",
		owner: {name: "Md Nadim Sakib", src: avatarImages[2]},
		creationDate: "Feb 19, 2025",
		startDate: "Feb 19, 2025",
		endDate: "No end date",
		dependsOn: null,
		status: "Not Started",
		parentCampaign: null,
		lastModified: "Feb 19, 2025",
		currentStep: null,
		currentStepName: null,
	},
	{
		id: "4",
		title: "SC content testing",
		type: "Task",
		reference: "TSK-2689",
		owner: {name: "Kamrul Hasan", src: avatarImages[3]},
		creationDate: "Feb 18, 2025",
		startDate: "No start date",
		endDate: "No end date",
		dependsOn: null,
		status: "Overdue",
		parentCampaign: null,
		lastModified: "Feb 19, 2025",
		currentStep: "1 of 2",
		currentStepName: "Approval",
	},
	{
		id: "axiom",
		title: "Axiom",
		type: "Campaign",
		reference: "CPN-36",
		owner: {name: "Abu Jafar Safi", src: avatarImages[4]},
		creationDate: "Feb 17, 2025",
		startDate: "Feb 17, 2025",
		endDate: "No end date",
		dependsOn: null,
		status: "On Track",
		parentCampaign: null,
		lastModified: "Feb 17, 2025",
		currentStep: null,
		currentStepName: null,
		badge: 1,
		isGroup: true,
	},
	{
		id: "test",
		title: "Test",
		type: "Campaign",
		reference: "CPN-35",
		owner: {name: "Abu Jafar Safi", src: avatarImages[4]},
		creationDate: "Feb 13, 2025",
		startDate: "Feb 13, 2025",
		endDate: "No end date",
		dependsOn: null,
		status: "On Track",
		parentCampaign: null,
		lastModified: "Feb 18, 2025",
		currentStep: null,
		currentStepName: null,
		badge: 4,
		isGroup: true,
	},
];

const StatusBadge = ({status}: {status: string}) => {
	const getIntent = () => {
		switch (status) {
			case "On Track":
				return "success";
			case "Not Started":
				return "neutral";
			case "Overdue":
				return "danger";
			case "Completed":
				return "primary";
			case "In Progress":
				return "information";
			case "At Risk":
				return "warning";
			default:
				return "neutral";
		}
	};

	return <Badge intent={getIntent() as any}>{status}</Badge>;
};

const StepBadge = ({step}: {step: string | null}) => {
	if (!step) return <Text color="fg.tertiary">—</Text>;
	return (
		<Badge intent="neutral" className="font-normal">
			{step}
		</Badge>
	);
};

export default function PlanViewPage() {
	const router = useRouter();
	const [showHierarchy, setShowHierarchy] = useState(true);
	const [expandedGroups, setExpandedGroups] = useState<string[]>(["social", "axiom", "test"]);

	const toggleGroup = (id: string) => {
		setExpandedGroups((prev) =>
			prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
		);
	};

	return (
		<Box className="h-full flex flex-col -m-6 -mt-[72px]">
			{/* Top Navigation Tabs */}
			<Box
				borderB="1"
				borderColor="border.tertiary"
				bg="bg.default"
				px="16"
				display="flex"
				alignItems="center"
				justifyContent="space-between"
			>
				<Box display="flex" alignItems="center" gap="24">
					<Tabs defaultValue="list">
						<TabsList>
							<TabsTrigger value="list">List</TabsTrigger>
							<TabsTrigger value="calendar">Calendar</TabsTrigger>
							<TabsTrigger value="timeline">Timeline</TabsTrigger>
							<TabsTrigger value="board">Board</TabsTrigger>
						</TabsList>
					</Tabs>
					<Box display="flex" alignItems="center" gap="8" style={{cursor: "pointer"}}>
						<Text fontSize="sm" color="fg.tertiary">Saved Views</Text>
						<IconChevronDown size={14} />
					</Box>
				</Box>
				<Box display="flex" alignItems="center" gap="8">
					<Button appearance="subtle">Save View</Button>
					<Button appearance="subtle">Add</Button>
					<Button appearance="subtle">Columns</Button>
					<Button appearance="subtle" icon={<IconDots size={20} />} aria-label="More options" />
				</Box>
			</Box>

			{/* Filter Bar */}
			<Box
				px="16"
				py="16"
				display="flex"
				flexDirection="column"
				gap="16"
				borderB="1"
				borderColor="border.tertiary"
				bg="bg.default"
			>
				<Box display="flex" alignItems="center" gap="12">
					<Box display="inline-flex" className="relative">
						<Button icon={<IconFilter size={16} />} size="md" appearance="subtle" aria-label="Filter" />
						<Box
							style={{
								position: 'absolute',
								top: '-4px',
								left: '-4px',
								minWidth: '18px',
								height: '18px',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								fontSize: '11px',
								borderRadius: '50%',
								backgroundColor: '#0037FF',
								color: 'white',
								fontWeight: 600,
								padding: '0 5px',
								zIndex: 1,
							}}
						>
							5
						</Box>
					</Box>
					<SearchInput placeholder="Search..." size="md" style={{width: '280px'}} />
				</Box>
				<Switch checked={showHierarchy} onCheckedChange={setShowHierarchy}>
					Show campaign hierarchy
				</Switch>
			</Box>

			{/* Table */}
			<Box flex="1" overflow="auto" bg="bg.default">
				<Table className="[&_td]:!align-middle [&_th]:!align-middle [&_tr]:h-[52px]" style={{minWidth: 'max-content'}}>
					<TableHeader>
						<TableRow className="align-middle">
							<TableHeaderCell px="16" py="12" className="align-middle" style={{width: '48px'}}>
								<Checkbox />
							</TableHeaderCell>
							<TableHeaderCell px="16" py="12" className="align-middle" style={{width: '280px', minWidth: '280px'}}>
								<Box display="flex" alignItems="center" gap="4">
									Title
									<IconPlus size={12} />
								</Box>
							</TableHeaderCell>
							<TableHeaderCell px="16" py="12" className="align-middle" style={{width: '120px', minWidth: '120px'}}>Type</TableHeaderCell>
							<TableHeaderCell px="16" py="12" className="align-middle" style={{width: '120px', minWidth: '120px'}}>Reference</TableHeaderCell>
							<TableHeaderCell px="16" py="12" className="align-middle" style={{width: '200px', minWidth: '200px'}}>Owner</TableHeaderCell>
							<TableHeaderCell px="16" py="12" className="align-middle" style={{width: '140px', minWidth: '140px'}}>Creation Date</TableHeaderCell>
							<TableHeaderCell px="16" py="12" className="align-middle" style={{width: '140px', minWidth: '140px'}}>Start Date</TableHeaderCell>
							<TableHeaderCell px="16" py="12" className="align-middle" style={{width: '140px', minWidth: '140px'}}>End/Due Date</TableHeaderCell>
							<TableHeaderCell px="16" py="12" className="align-middle" style={{width: '120px', minWidth: '120px'}}>Depends On</TableHeaderCell>
							<TableHeaderCell px="16" py="12" className="align-middle" style={{width: '130px', minWidth: '130px'}}>Status</TableHeaderCell>
							<TableHeaderCell px="16" py="12" className="align-middle" style={{width: '160px', minWidth: '160px'}}>Parent Campaign</TableHeaderCell>
							<TableHeaderCell px="16" py="12" className="align-middle" style={{width: '140px', minWidth: '140px'}}>Last Modified</TableHeaderCell>
							<TableHeaderCell px="16" py="12" className="align-middle" style={{width: '120px', minWidth: '120px'}}>Current Step</TableHeaderCell>
							<TableHeaderCell px="16" py="12" className="align-middle" style={{width: '150px', minWidth: '150px'}}>Current Step Name</TableHeaderCell>
						</TableRow>
					</TableHeader>
					<TableBody>
						{planData.map((item) => (
							<TableRow
								key={item.id}
								className="align-middle cursor-pointer hover:bg-[var(--ax-colors-bg-default-hovered)]"
								onClick={(e) => {
									// Don't navigate if clicking on checkbox or expand button
									const target = e.target as HTMLElement;
									if (target.closest('button') || target.closest('input[type="checkbox"]')) {
										return;
									}
									// Only navigate for Task items, not Campaigns
									if (item.type === 'Task') {
										router.push(`/cmp/task/${item.id}`);
									}
								}}
							>
								<TableCell px="16" py="12" className="align-middle" style={{width: '48px'}}>
									<Box display="flex" alignItems="center" h="full">
										<Checkbox onClick={(e) => e.stopPropagation()} />
									</Box>
								</TableCell>
								<TableCell px="16" py="12" className="align-middle" style={{width: '280px', minWidth: '280px'}}>
									<Box display="flex" alignItems="center" gap="8">
										{item.isGroup && (
											<Button
												appearance="subtle"
												size="sm"
												icon={
													expandedGroups.includes(item.id) ? (
														<IconChevronDown size={16} />
													) : (
														<IconChevronRight size={16} />
													)
												}
												onClick={() => toggleGroup(item.id)}
												aria-label={expandedGroups.includes(item.id) ? "Collapse" : "Expand"}
											/>
										)}
										<Text fontWeight="500">{item.title}</Text>
										{item.badge && (
											<Badge intent="neutral">{item.badge}</Badge>
										)}
									</Box>
								</TableCell>
								<TableCell px="16" py="12" className="align-middle" style={{width: '120px', minWidth: '120px'}}>
									<Box display="flex" alignItems="center" h="full">
										<Text color="fg.secondary">{item.type}</Text>
									</Box>
								</TableCell>
								<TableCell px="16" py="12" className="align-middle" style={{width: '120px', minWidth: '120px'}}>
									<Box display="flex" alignItems="center" h="full">
										<Text color="fg.secondary">{item.reference}</Text>
									</Box>
								</TableCell>
								<TableCell px="16" py="12" className="align-middle" style={{width: '200px', minWidth: '200px'}}>
									<Box display="flex" alignItems="center" gap="8">
										<Avatar name={item.owner.name} src={item.owner.src} />
										<Text fontSize="sm" className="whitespace-nowrap overflow-hidden text-ellipsis">{item.owner.name}</Text>
									</Box>
								</TableCell>
								<TableCell px="16" py="12" className="align-middle" style={{width: '140px', minWidth: '140px'}}>
									<Box display="flex" alignItems="center" h="full">
										<Text color="fg.secondary" className="whitespace-nowrap">{item.creationDate}</Text>
									</Box>
								</TableCell>
								<TableCell px="16" py="12" className="align-middle" style={{width: '140px', minWidth: '140px'}}>
									<Box display="flex" alignItems="center" h="full">
										<Text color="fg.secondary" className="whitespace-nowrap">{item.startDate}</Text>
									</Box>
								</TableCell>
								<TableCell px="16" py="12" className="align-middle" style={{width: '140px', minWidth: '140px'}}>
									<Box display="flex" alignItems="center" h="full">
										<Text color="fg.secondary" className="whitespace-nowrap">{item.endDate}</Text>
									</Box>
								</TableCell>
								<TableCell px="16" py="12" className="align-middle" style={{width: '120px', minWidth: '120px'}}>
									<Box display="flex" alignItems="center" h="full">
										<Text color="fg.tertiary">—</Text>
									</Box>
								</TableCell>
								<TableCell px="16" py="12" className="align-middle" style={{width: '130px', minWidth: '130px'}}>
									<Box display="flex" alignItems="center" h="full">
										<StatusBadge status={item.status} />
									</Box>
								</TableCell>
								<TableCell px="16" py="12" className="align-middle" style={{width: '160px', minWidth: '160px'}}>
									<Box display="flex" alignItems="center" h="full">
										<Text color="fg.tertiary">{item.parentCampaign || "—"}</Text>
									</Box>
								</TableCell>
								<TableCell px="16" py="12" className="align-middle" style={{width: '140px', minWidth: '140px'}}>
									<Box display="flex" alignItems="center" h="full">
										<Text color="fg.secondary" className="whitespace-nowrap">{item.lastModified}</Text>
									</Box>
								</TableCell>
								<TableCell px="16" py="12" className="align-middle" style={{width: '120px', minWidth: '120px'}}>
									<Box display="flex" alignItems="center" h="full">
										<StepBadge step={item.currentStep} />
									</Box>
								</TableCell>
								<TableCell px="16" py="12" className="align-middle" style={{width: '150px', minWidth: '150px'}}>
									<Box display="flex" alignItems="center" h="full">
										{item.currentStepName ? (
											<Badge intent="information" className="font-normal">
												{item.currentStepName}
											</Badge>
										) : (
											<Text color="fg.tertiary">—</Text>
										)}
									</Box>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</Box>

			{/* Footer */}
			<Box
				px="16"
				py="8"
				borderT="1"
				borderColor="border.tertiary"
				bg="bg.default"
				display="flex"
				alignItems="center"
				justifyContent="space-between"
			>
				<Box display="flex" alignItems="center" gap="8">
					<Text fontSize="sm" color="fg.tertiary">Page Size</Text>
					<Button appearance="subtle" size="sm">
						20 <IconChevronDown size={14} />
					</Button>
				</Box>
				<Box display="flex" alignItems="center" gap="4">
					<Button appearance="subtle" size="sm" disabled>
						&lt;
					</Button>
					<Button appearance="primary" size="sm">1</Button>
					<Button appearance="subtle" size="sm">2</Button>
					<Button appearance="subtle" size="sm">&gt;</Button>
				</Box>
			</Box>
		</Box>
	);
}
