<<<<<<< HEAD
import {
	Box,
	Table,
	TableBody,
	TableCell,
	TableHeader,
	TableHeaderCell,
	TableRow,
	Checkbox,
	Badge,
	Avatar,
	Button,
} from "@optiaxiom/react";
import { Text } from "@/app/components/Text";
import { IconChevronDown, IconChevronRight, IconPlus } from "@tabler/icons-react";
import { StatusBadge, StepBadge } from "./StatusBadge";
import type { PlanItem } from "../types";

type ListViewProps = {
	data: PlanItem[];
	expandedGroups: string[];
	toggleGroup: (id: string) => void;
	onRowClick: (item: PlanItem) => void;
};

export function ListView({ data, expandedGroups, toggleGroup, onRowClick }: ListViewProps) {
	return (
		<Box style={{ position: "absolute", inset: 0, overflow: "auto" }}>
			<Box bg="bg.default">
				<Table className="[&_td]:!align-middle [&_th]:!align-middle [&_tr]:h-[52px]" style={{ minWidth: "max-content" }}>
					<TableHeader>
						<TableRow className="align-middle">
							<TableHeaderCell px="16" py="12" className="align-middle" style={{ width: "48px" }}>
								<Checkbox />
							</TableHeaderCell>
							<TableHeaderCell px="16" py="12" className="align-middle" style={{ width: "280px", minWidth: "280px" }}>
								<Box display="flex" alignItems="center" gap="4">
									Title
									<IconPlus size={12} />
								</Box>
							</TableHeaderCell>
							<TableHeaderCell px="16" py="12" className="align-middle" style={{ width: "120px", minWidth: "120px" }}>Type</TableHeaderCell>
							<TableHeaderCell px="16" py="12" className="align-middle" style={{ width: "120px", minWidth: "120px" }}>Reference</TableHeaderCell>
							<TableHeaderCell px="16" py="12" className="align-middle" style={{ width: "200px", minWidth: "200px" }}>Owner</TableHeaderCell>
							<TableHeaderCell px="16" py="12" className="align-middle" style={{ width: "140px", minWidth: "140px" }}>Creation Date</TableHeaderCell>
							<TableHeaderCell px="16" py="12" className="align-middle" style={{ width: "140px", minWidth: "140px" }}>Start Date</TableHeaderCell>
							<TableHeaderCell px="16" py="12" className="align-middle" style={{ width: "140px", minWidth: "140px" }}>End/Due Date</TableHeaderCell>
							<TableHeaderCell px="16" py="12" className="align-middle" style={{ width: "120px", minWidth: "120px" }}>Depends On</TableHeaderCell>
							<TableHeaderCell px="16" py="12" className="align-middle" style={{ width: "130px", minWidth: "130px" }}>Status</TableHeaderCell>
							<TableHeaderCell px="16" py="12" className="align-middle" style={{ width: "160px", minWidth: "160px" }}>Parent Campaign</TableHeaderCell>
							<TableHeaderCell px="16" py="12" className="align-middle" style={{ width: "140px", minWidth: "140px" }}>Last Modified</TableHeaderCell>
							<TableHeaderCell px="16" py="12" className="align-middle" style={{ width: "120px", minWidth: "120px" }}>Current Step</TableHeaderCell>
							<TableHeaderCell px="16" py="12" className="align-middle" style={{ width: "150px", minWidth: "150px" }}>Current Step Name</TableHeaderCell>
						</TableRow>
					</TableHeader>
					<TableBody>
						{data.map((item) => (
							<TableRow
								key={item.id}
								className="align-middle cursor-pointer hover:bg-[var(--ax-colors-bg-default-hovered)]"
								onClick={(e) => {
									const target = e.target as HTMLElement;
									if (target.closest("button") || target.closest('input[type="checkbox"]')) {
										return;
									}
									onRowClick(item);
								}}
							>
								<TableCell px="16" py="12" className="align-middle" style={{ width: "48px" }}>
									<Box display="flex" alignItems="center" h="full">
										<Checkbox onClick={(e) => e.stopPropagation()} />
									</Box>
								</TableCell>
								<TableCell px="16" py="12" className="align-middle" style={{ width: "280px", minWidth: "280px" }}>
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
										{item.badge && <Badge intent="neutral">{item.badge}</Badge>}
									</Box>
								</TableCell>
								<TableCell px="16" py="12" className="align-middle" style={{ width: "120px", minWidth: "120px" }}>
									<Box display="flex" alignItems="center" h="full">
										<Text color="fg.secondary">{item.type}</Text>
									</Box>
								</TableCell>
								<TableCell px="16" py="12" className="align-middle" style={{ width: "120px", minWidth: "120px" }}>
									<Box display="flex" alignItems="center" h="full">
										<Text color="fg.secondary">{item.reference}</Text>
									</Box>
								</TableCell>
								<TableCell px="16" py="12" className="align-middle" style={{ width: "200px", minWidth: "200px" }}>
									<Box display="flex" alignItems="center" gap="8">
										<Avatar name={item.owner.name} src={item.owner.src} />
										<Text fontSize="sm" className="whitespace-nowrap overflow-hidden text-ellipsis">{item.owner.name}</Text>
									</Box>
								</TableCell>
								<TableCell px="16" py="12" className="align-middle" style={{ width: "140px", minWidth: "140px" }}>
									<Box display="flex" alignItems="center" h="full">
										<Text color="fg.secondary" className="whitespace-nowrap">{item.creationDate}</Text>
									</Box>
								</TableCell>
								<TableCell px="16" py="12" className="align-middle" style={{ width: "140px", minWidth: "140px" }}>
									<Box display="flex" alignItems="center" h="full">
										<Text color="fg.secondary" className="whitespace-nowrap">{item.startDate}</Text>
									</Box>
								</TableCell>
								<TableCell px="16" py="12" className="align-middle" style={{ width: "140px", minWidth: "140px" }}>
									<Box display="flex" alignItems="center" h="full">
										<Text color="fg.secondary" className="whitespace-nowrap">{item.endDate}</Text>
									</Box>
								</TableCell>
								<TableCell px="16" py="12" className="align-middle" style={{ width: "120px", minWidth: "120px" }}>
									<Box display="flex" alignItems="center" h="full">
										<Text color="fg.tertiary">—</Text>
									</Box>
								</TableCell>
								<TableCell px="16" py="12" className="align-middle" style={{ width: "130px", minWidth: "130px" }}>
									<Box display="flex" alignItems="center" h="full">
										<StatusBadge status={item.status} />
									</Box>
								</TableCell>
								<TableCell px="16" py="12" className="align-middle" style={{ width: "160px", minWidth: "160px" }}>
									<Box display="flex" alignItems="center" h="full">
										<Text color="fg.tertiary">{item.parentCampaign || "—"}</Text>
									</Box>
								</TableCell>
								<TableCell px="16" py="12" className="align-middle" style={{ width: "140px", minWidth: "140px" }}>
									<Box display="flex" alignItems="center" h="full">
										<Text color="fg.secondary" className="whitespace-nowrap">{item.lastModified}</Text>
									</Box>
								</TableCell>
								<TableCell px="16" py="12" className="align-middle" style={{ width: "120px", minWidth: "120px" }}>
									<Box display="flex" alignItems="center" h="full">
										<StepBadge step={item.currentStep} />
									</Box>
								</TableCell>
								<TableCell px="16" py="12" className="align-middle" style={{ width: "150px", minWidth: "150px" }}>
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
		</Box>
	);
}
=======
import {
	Box,
	Table,
	TableBody,
	TableCell,
	TableHeader,
	TableHeaderCell,
	TableRow,
	Checkbox,
	Badge,
	Avatar,
	Button,
} from "@optiaxiom/react";
import { Text } from "@/app/components/Text";
import {IconChevronDown, IconChevronRight, IconPlus} from "@/app/lib/axiom-icons";
import { StatusBadge, StepBadge } from "./StatusBadge";
import type { PlanItem } from "../types";

type ListViewProps = {
	data: PlanItem[];
	expandedGroups: string[];
	toggleGroup: (id: string) => void;
	onRowClick: (item: PlanItem) => void;
};

export function ListView({ data, expandedGroups, toggleGroup, onRowClick }: ListViewProps) {
	return (
		<Box style={{ position: "absolute", inset: 0, overflow: "auto" }}>
			<Box bg="bg.default" border="1" borderColor="border.tertiary" rounded="md" style={{ overflow: "hidden", width: "fit-content" }}>
				<Table className="[&_td]:!align-middle [&_th]:!align-middle [&_tr]:h-[52px]" style={{ minWidth: "max-content" }}>
					<TableHeader>
						<TableRow className="align-middle">
							<TableHeaderCell px="16" py="12" className="align-middle" style={{ width: "48px" }}>
								<Checkbox />
							</TableHeaderCell>
							<TableHeaderCell px="16" py="12" className="align-middle" style={{ width: "280px", minWidth: "280px" }}>
								<Box display="flex" alignItems="center" gap="4">
									Title
									<IconPlus size={12} />
								</Box>
							</TableHeaderCell>
							<TableHeaderCell px="16" py="12" className="align-middle" style={{ width: "120px", minWidth: "120px" }}>Type</TableHeaderCell>
							<TableHeaderCell px="16" py="12" className="align-middle" style={{ width: "120px", minWidth: "120px" }}>Reference</TableHeaderCell>
							<TableHeaderCell px="16" py="12" className="align-middle" style={{ width: "200px", minWidth: "200px" }}>Owner</TableHeaderCell>
							<TableHeaderCell px="16" py="12" className="align-middle" style={{ width: "140px", minWidth: "140px" }}>Creation Date</TableHeaderCell>
							<TableHeaderCell px="16" py="12" className="align-middle" style={{ width: "140px", minWidth: "140px" }}>Start Date</TableHeaderCell>
							<TableHeaderCell px="16" py="12" className="align-middle" style={{ width: "140px", minWidth: "140px" }}>End/Due Date</TableHeaderCell>
							<TableHeaderCell px="16" py="12" className="align-middle" style={{ width: "120px", minWidth: "120px" }}>Depends On</TableHeaderCell>
							<TableHeaderCell px="16" py="12" className="align-middle" style={{ width: "130px", minWidth: "130px" }}>Status</TableHeaderCell>
							<TableHeaderCell px="16" py="12" className="align-middle" style={{ width: "160px", minWidth: "160px" }}>Parent Campaign</TableHeaderCell>
							<TableHeaderCell px="16" py="12" className="align-middle" style={{ width: "140px", minWidth: "140px" }}>Last Modified</TableHeaderCell>
							<TableHeaderCell px="16" py="12" className="align-middle" style={{ width: "120px", minWidth: "120px" }}>Current Step</TableHeaderCell>
							<TableHeaderCell px="16" py="12" className="align-middle" style={{ width: "150px", minWidth: "150px" }}>Current Step Name</TableHeaderCell>
						</TableRow>
					</TableHeader>
					<TableBody>
						{data.map((item) => (
							<TableRow
								key={item.id}
								className="align-middle cursor-pointer hover:bg-[var(--ax-colors-bg-default-hovered)]"
								onClick={(e) => {
									const target = e.target as HTMLElement;
									if (target.closest("button") || target.closest('input[type="checkbox"]')) {
										return;
									}
									onRowClick(item);
								}}
							>
								<TableCell px="16" py="12" className="align-middle" style={{ width: "48px" }}>
									<Box display="flex" alignItems="center" h="full">
										<Checkbox onClick={(e) => e.stopPropagation()} />
									</Box>
								</TableCell>
								<TableCell px="16" py="12" className="align-middle" style={{ width: "280px", minWidth: "280px" }}>
									<Box display="flex" alignItems="center" gap="8" style={item.parentCampaign ? {paddingLeft: 52} : undefined}>
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
										{item.badge && <Badge intent="neutral">{item.badge}</Badge>}
									</Box>
								</TableCell>
								<TableCell px="16" py="12" className="align-middle" style={{ width: "120px", minWidth: "120px" }}>
									<Box display="flex" alignItems="center" h="full">
										<Text color="fg.secondary">{item.type}</Text>
									</Box>
								</TableCell>
								<TableCell px="16" py="12" className="align-middle" style={{ width: "120px", minWidth: "120px" }}>
									<Box display="flex" alignItems="center" h="full">
										<Text color="fg.secondary">{item.reference}</Text>
									</Box>
								</TableCell>
								<TableCell px="16" py="12" className="align-middle" style={{ width: "200px", minWidth: "200px" }}>
									<Box display="flex" alignItems="center" gap="8">
										<Avatar name={item.owner.name} src={item.owner.src} />
										<Text fontSize="sm" className="whitespace-nowrap overflow-hidden text-ellipsis">{item.owner.name}</Text>
									</Box>
								</TableCell>
								<TableCell px="16" py="12" className="align-middle" style={{ width: "140px", minWidth: "140px" }}>
									<Box display="flex" alignItems="center" h="full">
										<Text color="fg.secondary" className="whitespace-nowrap">{item.creationDate}</Text>
									</Box>
								</TableCell>
								<TableCell px="16" py="12" className="align-middle" style={{ width: "140px", minWidth: "140px" }}>
									<Box display="flex" alignItems="center" h="full">
										<Text color="fg.secondary" className="whitespace-nowrap">{item.startDate}</Text>
									</Box>
								</TableCell>
								<TableCell px="16" py="12" className="align-middle" style={{ width: "140px", minWidth: "140px" }}>
									<Box display="flex" alignItems="center" h="full">
										<Text color="fg.secondary" className="whitespace-nowrap">{item.endDate}</Text>
									</Box>
								</TableCell>
								<TableCell px="16" py="12" className="align-middle" style={{ width: "120px", minWidth: "120px" }}>
									<Box display="flex" alignItems="center" h="full">
										<Text color="fg.tertiary">—</Text>
									</Box>
								</TableCell>
								<TableCell px="16" py="12" className="align-middle" style={{ width: "130px", minWidth: "130px" }}>
									<Box display="flex" alignItems="center" h="full">
										<StatusBadge status={item.status} />
									</Box>
								</TableCell>
								<TableCell px="16" py="12" className="align-middle" style={{ width: "160px", minWidth: "160px" }}>
									<Box display="flex" alignItems="center" h="full">
										<Text color="fg.tertiary">{item.parentCampaign || "—"}</Text>
									</Box>
								</TableCell>
								<TableCell px="16" py="12" className="align-middle" style={{ width: "140px", minWidth: "140px" }}>
									<Box display="flex" alignItems="center" h="full">
										<Text color="fg.secondary" className="whitespace-nowrap">{item.lastModified}</Text>
									</Box>
								</TableCell>
								<TableCell px="16" py="12" className="align-middle" style={{ width: "120px", minWidth: "120px" }}>
									<Box display="flex" alignItems="center" h="full">
										<StepBadge step={item.currentStep} />
									</Box>
								</TableCell>
								<TableCell px="16" py="12" className="align-middle" style={{ width: "150px", minWidth: "150px" }}>
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
		</Box>
	);
}
>>>>>>> origin/main
