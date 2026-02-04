"use client";

import {
	Box,
	Button,
	Badge,
	Tabs,
	TabsList,
	TabsTrigger,
	TabsContent,
	Text,
} from "@optiaxiom/react";
import {
	IconChevronRight,
	IconChevronDown,
	IconEye,
	IconDots,
	IconCalendar,
	IconPlus,
	IconUsersGroup,
	IconUserPlus,
} from "@tabler/icons-react";
import { useState } from "react";

// Opal gradient icon component - 20x20 as per Figma (size-xs)
// Uses the official Opal icon asset from /cmp/assets/opal-icon.svg
function OpalIcon({ size = 20 }: { size?: number }) {
	return (
		<img
			src="/cmp/assets/opal-icon.svg"
			alt="Opal"
			width={size}
			height={size}
			style={{ display: 'block' }}
		/>
	);
}

// Dotted circle wrapper for icons - as per Figma design
// size-sm: 24x24, border: 0.8px dashed border-default
function DottedCircleIcon({ children }: { children: React.ReactNode }) {
	return (
		<Box
			display="flex"
			alignItems="center"
			justifyContent="center"
			style={{
				width: '24px',
				height: '24px',
				padding: '6px 5px',
				borderRadius: '999px',
				border: '0.8px dashed #CACFDC',
			}}
		>
			{children}
		</Box>
	);
}

export default function TaskDetailPage() {
	const [activeTab, setActiveTab] = useState("brief");
	const [activeWorkflowTab, setActiveWorkflowTab] = useState("workflow");

	return (
		<Box
			display="flex"
			style={{
				margin: '-24px',
				height: 'calc(100vh - 48px)',
				minHeight: 'calc(100vh - 48px)',
			}}
		>
			{/* Left Column - Header + Content */}
			<Box display="flex" flexDirection="column" flex="1" overflow="hidden">
				{/* Main Header - Breadcrumb + Title + Tabs */}
				<Box>
					{/* Breadcrumb */}
					<Box display="flex" alignItems="center" gap="8" px="24" pt="16" pb="8">
						<Text fontSize="sm" color="fg.tertiary">Label</Text>
						<Text fontSize="sm" color="fg.tertiary">/</Text>
						<Text fontSize="sm" color="fg.tertiary">Ca...</Text>
						<Text fontSize="sm" color="fg.tertiary">/</Text>
						<Text fontSize="sm" color="fg.tertiary">TSK...</Text>
					</Box>

					{/* Title */}
					<Box px="24" pb="16">
						<Text style={{ fontSize: '24px', fontWeight: 600, lineHeight: '32px' }}>
							US Marketing Launch 2026
						</Text>
					</Box>

					{/* Tabs Navigation */}
					<Box px="24">
						<Tabs value={activeTab} onValueChange={setActiveTab}>
							<TabsList>
								<TabsTrigger value="brief">Brief</TabsTrigger>
								<TabsTrigger value="content">Content</TabsTrigger>
								<TabsTrigger value="fields">Fields</TabsTrigger>
								<TabsTrigger value="publishing">Publishing</TabsTrigger>
								<TabsTrigger value="related">Related</TabsTrigger>
								<TabsTrigger value="financial">Financial</TabsTrigger>
								<TabsTrigger value="history">History</TabsTrigger>
							</TabsList>
						</Tabs>
					</Box>
				</Box>

				{/* Main Content Area */}
				<Box flex="1" overflow="auto">
					<Tabs value={activeTab}>
						<TabsContent value="brief">
							<BriefTabContent />
						</TabsContent>
						<TabsContent value="content">
							<ContentTabContent />
						</TabsContent>
						<TabsContent value="fields">
							<Text>Fields</Text>
						</TabsContent>
						<TabsContent value="publishing">
							<Text>Publishing</Text>
						</TabsContent>
						<TabsContent value="related">
							<Text>Related</Text>
						</TabsContent>
						<TabsContent value="financial">
							<Text>Financial</Text>
						</TabsContent>
						<TabsContent value="history">
							<Text>History</Text>
						</TabsContent>
					</Tabs>
				</Box>
			</Box>

			{/* Right Sidebar - starts at top, 16px padding top (same as breadcrumb) */}
			<RightSidebar
				activeTab={activeWorkflowTab}
				setActiveTab={setActiveWorkflowTab}
			/>
		</Box>
	);
}

function BriefTabContent() {
	return (
		<Box
			display="flex"
			flexDirection="column"
			alignItems="center"
			justifyContent="center"
			style={{
				minHeight: '500px',
				padding: '64px 32px',
				gap: '32px', // Figma: spacing-32
			}}
		>
			{/* Title - Figma: Header/Level 4/Medium = 20px, weight 500 */}
			<Text style={{ fontSize: '20px', fontWeight: 500, lineHeight: '28px', textAlign: 'center' }}>
				Add a Creative Brief
			</Text>

			{/* Subtitle - Figma: Body/Medium */}
			<Text color="fg.secondary" style={{ fontSize: '14px', lineHeight: '20px', textAlign: 'center' }}>
				Build your task strategy here, i.e. Key objectives, Audiences, Pillars
			</Text>

			{/* Brief Actions - Figma: spacing-32 gap from title, spacing-12 between buttons */}
			<Box display="flex" alignItems="center" gap="12">
				<Button appearance="default" size="md">
					<Box display="flex" alignItems="center" gap="8">
						Select Brief
						<IconChevronDown size={16} />
					</Box>
				</Button>
				<Text color="fg.tertiary" fontSize="sm">or</Text>
				<Button appearance="default" size="md">
					Write Brief
				</Button>
			</Box>

			{/* Opal AI Suggestion Banner */}
			<OpalSuggestionBanner />
		</Box>
	);
}

function OpalSuggestionBanner() {
	return (
		<Box
			display="flex"
			alignItems="center"
			justifyContent="space-between"
			rounded="md"
			style={{
				background: 'linear-gradient(90deg, rgba(99, 102, 241, 0.08) 0%, rgba(168, 85, 247, 0.08) 100%)',
				width: '100%',
				maxWidth: '520px',
				padding: '12px 16px',
			}}
		>
			<Box display="flex" alignItems="center" gap="12">
				<OpalIcon size={20} />
				<Text fontSize="sm">
					Opal can help create a brief for this campaign.
				</Text>
			</Box>
			<Button
				appearance="primary"
				size="sm"
				style={{
					background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
					border: 'none',
				}}
			>
				Create
			</Button>
		</Box>
	);
}

function ContentTabContent() {
	return (
		<Box
			display="flex"
			flexDirection="column"
			alignItems="center"
			py="64"
			px="32"
			gap="24"
		>
			<Box display="flex" flexDirection="column" alignItems="center" gap="12">
				<Text style={{ fontSize: '20px', fontWeight: 500, lineHeight: '28px' }}>Add Content</Text>
				<Text color="fg.secondary" fontSize="sm" style={{ textAlign: 'center', maxWidth: '560px' }}>
					Use this workspace to add, revise, and optimize content. You can add assets by clicking the "Add Content" button.
				</Text>
				<Button appearance="primary" size="md" mt="8">
					<Box display="flex" alignItems="center" gap="8">
						<IconPlus size={16} />
						Add Content
					</Box>
				</Button>
			</Box>

			<Box display="flex" gap="16" mt="32" style={{ width: '100%', maxWidth: '1200px' }}>
				{[1, 2, 3].map((i) => (
					<Box
						key={i}
						style={{
							flex: 1,
							height: '200px',
							borderRadius: '8px',
							backgroundColor: '#E5E7EB',
							backgroundImage: 'linear-gradient(45deg, #f3f4f6 25%, transparent 25%), linear-gradient(-45deg, #f3f4f6 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f3f4f6 75%), linear-gradient(-45deg, transparent 75%, #f3f4f6 75%)',
							backgroundSize: '20px 20px',
							backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
						}}
					/>
				))}
			</Box>

			<Button
				appearance="primary"
				size="md"
				style={{
					background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
					border: 'none',
				}}
			>
				<Box display="flex" alignItems="center" gap="8">
					<OpalIcon size={20} />
					View Suggested Assets
				</Box>
			</Button>
		</Box>
	);
}

interface RightSidebarProps {
	activeTab: string;
	setActiveTab: (tab: string) => void;
}

function RightSidebar({ activeTab, setActiveTab }: RightSidebarProps) {
	return (
		<Box
			bg="bg.default"
			display="flex"
			flexDirection="column"
			style={{
				width: '444px',
				flexShrink: 0,
				padding: '16px',
				gap: '24px',
				alignSelf: 'stretch',
				borderRadius: '8px',
			}}
		>
			{/* Sidebar Header - Status Icons & Mark Complete */}
			<Box
				display="flex"
				alignItems="center"
				justifyContent="space-between"
			>
				<Box display="flex" alignItems="center" gap="16">
					<IconUsersGroup size={20} stroke={1.5} color="var(--ax-colors-fg-tertiary)" />
					<Box display="flex" alignItems="center" gap="6">
						<IconEye size={20} stroke={1.5} color="var(--ax-colors-fg-tertiary)" />
						<Text fontSize="sm" color="fg.tertiary">8</Text>
					</Box>
				</Box>
				<Box display="flex" alignItems="center" gap="8">
					<Button appearance="default" size="sm">Mark Complete</Button>
					<Button appearance="subtle" size="sm" icon={<IconDots size={20} />} aria-label="More options" />
				</Box>
			</Box>

			{/* Status Badge & Dates */}
			<Box display="flex" alignItems="center" flexWrap="wrap" gap="8">
				<Badge intent="information">In Progress</Badge>
				<Box display="flex" alignItems="center" gap="6">
					<IconCalendar size={16} stroke={1.5} color="var(--ax-colors-fg-tertiary)" />
					<Text fontSize="sm" color="fg.default">Started • May 11</Text>
				</Box>
				<Box display="flex" alignItems="center" gap="6">
					<IconCalendar size={16} stroke={1.5} color="var(--ax-colors-fg-tertiary)" />
					<Text fontSize="sm" color="fg.default">Due • Jun 28</Text>
				</Box>
			</Box>

			{/* Workflow/Comments/Attachments Tabs */}
			<Box display="flex" alignItems="center" justifyContent="space-between">
				<Tabs value={activeTab} onValueChange={setActiveTab}>
					<TabsList>
						<TabsTrigger value="workflow">Workflow</TabsTrigger>
						<TabsTrigger value="comments">Comments</TabsTrigger>
						<TabsTrigger value="attachments">Attachments</TabsTrigger>
					</TabsList>
				</Tabs>
				<Button
					appearance="subtle"
					size="sm"
					icon={<IconChevronRight size={18} />}
					aria-label="Collapse sidebar"
				/>
			</Box>

			{/* Tab Content */}
			<Box flex="1" overflow="auto">
				<Tabs value={activeTab}>
					<TabsContent value="workflow">
						<WorkflowContent />
					</TabsContent>
					<TabsContent value="comments">
						<Text color="fg.secondary">No comments yet</Text>
					</TabsContent>
					<TabsContent value="attachments">
						<Text color="fg.secondary">No attachments</Text>
					</TabsContent>
				</Tabs>
			</Box>
		</Box>
	);
}

function WorkflowContent() {
	return (
		<Box display="flex" flexDirection="column" gap="24">
			{/* Workflow Selector - size-lg: 40px height, icon at end */}
			<Box display="flex" alignItems="center" justifyContent="space-between">
				<Button
					appearance="subtle"
					size="lg"
					icon={<IconChevronDown size={16} />}
					iconPosition="end"
				>
					Select Workflow
				</Button>
				<Button
					appearance="subtle"
					size="sm"
					icon={<IconDots size={20} />}
					aria-label="Workflow options"
				/>
			</Box>

			{/* Workflow Steps */}
			<Box display="flex" flexDirection="column" gap="4">
				<WorkflowStep
					number={1}
					label="Enter a step name - E.g. Rough draft"
				/>
				<WorkflowStep
					number={2}
					label="Enter a step name - E.g. Rough design"
				/>

				{/* Add Step Button - size-lg: 40px height */}
				<Button
					appearance="subtle"
					size="lg"
					icon={<IconPlus size={16} />}
				>
					Add Step
				</Button>
			</Box>
		</Box>
	);
}

interface WorkflowStepProps {
	number: number;
	label: string;
}

function WorkflowStep({ number, label }: WorkflowStepProps) {
	return (
		<Box
			display="flex"
			alignItems="center"
			gap="8"
			py="10"
			rounded="md"
			className="hover:bg-[var(--ax-colors-bg-default-hovered)]"
			style={{ cursor: 'pointer' }}
		>
			<IconChevronRight size={16} stroke={1.5} color="var(--ax-colors-fg-tertiary)" />
			{/* Figma: Body/Large/Medium = 16px, weight 500, color fg.placeholder for placeholder text */}
			<Text style={{ fontSize: '16px', fontWeight: 500, lineHeight: '24px', flex: 1 }} color="fg.tertiary">
				{number}. {label}
			</Text>
			{/* Figma: spacing-20 gap, 24px circles, 12px icons, fg-secondary color */}
			<Box display="flex" alignItems="center" gap="20">
				<DottedCircleIcon>
					<IconCalendar size={12} stroke={1.5} color="#4F576E" />
				</DottedCircleIcon>
				<DottedCircleIcon>
					<IconUserPlus size={12} stroke={1.5} color="#4F576E" />
				</DottedCircleIcon>
			</Box>
		</Box>
	);
}
