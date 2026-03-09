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
	Avatar,
} from "@optiaxiom/react";
import {
	IconChevronRight,
	IconChevronDown,
	IconChevronLeft,
	IconChevronUp,
	IconEye,
	IconDots,
	IconPlus,
	IconUsersGroup,
	IconUserPlus,
	IconRefresh,
	IconSquare,
	IconSquareCheck,
	IconList,
	IconListDetails,
	IconBrandFacebook,
	IconPencil,
	IconTrash,
	IconAlertTriangle,
	IconInfoCircle,
	IconGlobe,
	IconThumbUp,
	IconMessage,
	IconShare,
	IconUpload,
	IconX,
	IconBold,
	IconItalic,
	IconUnderline,
	IconAlignLeft,
	IconAlignCenter,
	IconAlignRight,
	IconAlignJustified,
	IconListNumbers,
	IconIndentIncrease,
	IconIndentDecrease,
	IconArrowBackUp,
	IconArrowForwardUp,
	IconPhoto,
	IconLink,
	IconQuote,
	IconMinus,
	IconPlayerPlay,
	IconTable,
	IconMaximize,
	IconHelp,
	IconCode,
} from "@tabler/icons-react";
import { useState } from "react";

// Opal gradient icon component
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

// Calendar icon with grey circular background
function CalendarIcon({ size = 16 }: { size?: number }) {
	return (
		<Box
			display="flex"
			alignItems="center"
			justifyContent="center"
			bg="bg.tertiary"
			rounded="full"
			style={{
				width: '24px',
				height: '24px',
			}}
		>
			<img
				src="/cmp/assets/calendar.svg"
				alt="Calendar"
				width={size}
				height={size}
				style={{ display: 'block' }}
			/>
		</Box>
	);
}

// Plain calendar icon without background
function CalendarIconPlain({ size = 12 }: { size?: number }) {
	return (
		<img
			src="/cmp/assets/calendar.svg"
			alt="Calendar"
			width={size}
			height={size}
			style={{ display: 'block' }}
		/>
	);
}

// Dotted circle wrapper for icons
function DottedCircleIcon({ children }: { children: React.ReactNode }) {
	return (
		<Box
			display="flex"
			alignItems="center"
			justifyContent="center"
			rounded="full"
			style={{
				width: '24px',
				height: '24px',
				padding: '6px 5px',
				border: '0.8px dashed var(--ax-colors-border-tertiary)',
			}}
		>
			{children}
		</Box>
	);
}

// Small avatar group for workflow steps
function SmallAvatarGroup() {
	return (
		<Box display="flex" alignItems="center" gap="4" style={{ minWidth: 'fit-content' }}>
			<Box
				display="flex"
				alignItems="center"
				justifyContent="center"
				rounded="full"
				style={{
					width: '20px',
					height: '20px',
					border: '0.8px dashed var(--ax-colors-border-tertiary)',
				}}
			>
				<IconUserPlus size={10} stroke={1.5} color="var(--ax-colors-fg-tertiary)" />
			</Box>
			<Box style={{ display: 'flex', position: 'relative', width: '32px', height: '20px' }}>
				<Avatar
					size="xs"
					initials="DS"
					style={{
						position: 'absolute',
						left: '0',
						zIndex: 2,
					}}
				/>
				<Avatar
					size="xs"
					initials="WM"
					style={{
						position: 'absolute',
						left: '10px',
						zIndex: 1,
					}}
				/>
			</Box>
		</Box>
	);
}

export default function TaskDetailPage() {
	const [activeTab, setActiveTab] = useState("brief");
	const [activeWorkflowTab, setActiveWorkflowTab] = useState("workflow");
	const [showSuggestedAssets, setShowSuggestedAssets] = useState(false);

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
						<Text fontSize="2xl" style={{ fontWeight: 600 }}>
							Ironman Miami triathlon 2026 Sponsor Package
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
								<TabsTrigger value="financials">Financials</TabsTrigger>
								<TabsTrigger value="history">History</TabsTrigger>
							</TabsList>
						</Tabs>
					</Box>
				</Box>

				{/* Main Content Area */}
				<Box flex="1" overflow="auto">
					{activeTab === "brief" && (
						<BriefTabContent
							showSuggestedAssets={showSuggestedAssets}
							onGenerateClick={() => setShowSuggestedAssets(true)}
						/>
					)}
					{activeTab === "content" && <ContentTabContent />}
					{activeTab === "fields" && <FieldsTabContent />}
					{activeTab === "publishing" && <PublishingTabContent />}
					{activeTab === "related" && <RelatedTabContent />}
					{activeTab === "financials" && <FinancialsTabContent />}
					{activeTab === "history" && <HistoryTabContent />}
				</Box>
			</Box>

			{/* Right Sidebar or Suggested Assets Panel */}
			{showSuggestedAssets ? (
				<SuggestedAssetsPanel onClose={() => setShowSuggestedAssets(false)} />
			) : (
				<RightSidebar
					activeTab={activeWorkflowTab}
					setActiveTab={setActiveWorkflowTab}
				/>
			)}
		</Box>
	);
}

// ─── Brief Tab Content ──────────────────────────────────────────────────────

interface BriefTabContentProps {
	showSuggestedAssets: boolean;
	onGenerateClick: () => void;
}

function BriefTabContent({ showSuggestedAssets, onGenerateClick }: BriefTabContentProps) {
	return (
		<Box display="flex" flexDirection="column" gap="16" py="24" px="32" style={{ maxWidth: '780px' }}>
			{/* Brief Actions Bar - changes when in edit mode */}
			{showSuggestedAssets ? (
				<Box display="flex" alignItems="center" justifyContent="space-between">
					<Text fontSize="sm" style={{ fontWeight: 500, color: 'var(--ax-colors-fg-default)' }}>
						Brief - Create Sponsor Package for Iron...
					</Text>
					<Box display="flex" alignItems="center" gap="8">
						<Button appearance="subtle" size="sm">Cancel Changes</Button>
						<Button appearance="primary" size="sm">Save</Button>
					</Box>
				</Box>
			) : (
				<Box display="flex" alignItems="center" justifyContent="space-between">
					<Text fontSize="sm" style={{ fontWeight: 500, color: 'var(--ax-colors-fg-default)' }}>
						Brief - Create Sponsor Package for Ironman / STRIDE event in March 2026
					</Text>
					<Button appearance="subtle" size="sm" icon={<IconDots size={20} />} aria-label="More options" />
				</Box>
			)}

			{/* Opal Suggestion Banner */}
			<OpalSuggestionBanner onGenerateClick={onGenerateClick} />

			{/* Rich Text Toolbar - only visible when in edit mode */}
			{showSuggestedAssets && <RichTextToolbar />}

			{/* Last Modified text */}
			<Text fontSize="xs" color="fg.tertiary">
				Last Modified by Sasha Thiel on Jan 25, 2026, 2:58 PM
			</Text>

			{/* Brief Content Card */}
			<Box
				display="flex"
				flexDirection="column"
				gap="16"
				rounded="lg"
				p="20"
				style={{
					backgroundColor: 'var(--ax-colors-bg-page)',
					border: showSuggestedAssets ? '2px solid var(--ax-colors-fg-accent)' : '1px solid var(--ax-colors-border-default)',
				}}
			>
				{/* Objective */}
				<Box display="flex" flexDirection="column" gap="8">
					<Text style={{ fontWeight: 600, color: 'var(--ax-colors-fg-default)' }}>
						Objective:
					</Text>
					<Text fontSize="sm" color="fg.default">
						Enhance sponsorship opportunities and visibility for the 2026 March IRONMAN/STRIDE triathlon.
					</Text>
				</Box>

				{/* Event Sponsor Package Strategy */}
				<Box display="flex" flexDirection="column" gap="8">
					<Text style={{ fontWeight: 600, color: 'var(--ax-colors-fg-default)' }}>
						Event Sponsor Package Strategy:
					</Text>
					<Text fontSize="sm" color="fg.default">
						This package will include key marketing materials designed to attract potential sponsors:
					</Text>
				</Box>

				{/* Content #1 */}
				<Box display="flex" flexDirection="column" gap="12">
					<Text style={{ fontWeight: 600, color: 'var(--ax-colors-fg-default)' }}>
						Content #1: Sponsorship Overview Document
					</Text>

					<Box display="flex" flexDirection="column" gap="8" pl="16" style={{ borderLeft: '1px solid var(--ax-colors-border-tertiary)' }}>
						<Box display="flex" flexDirection="column" gap="4">
							<Text fontSize="xs" color="fg.secondary">Title:</Text>
							<Text fontSize="sm" color="fg.default">
								Unlocking Opportunities: Sponsor the 2026 IRONMAN/STRIDE Triathlon
							</Text>
						</Box>

						<Box display="flex" flexDirection="column" gap="4">
							<Text fontSize="xs" color="fg.secondary">Asset Type:</Text>
							<Text fontSize="sm" color="fg.default">
								PDF Brochure
							</Text>
						</Box>

						<Box display="flex" flexDirection="column" gap="4">
							<Text fontSize="xs" color="fg.secondary">Brief:</Text>
							<Text fontSize="sm" color="fg.default">
								Create a comprehensive overview that outlines the benefits of sponsoring the event, including brand exposure, audience engagement, and community impact. Use an enthusiastic and engaging tone.
							</Text>
						</Box>

						<Box display="flex" flexDirection="column" gap="4">
							<Text fontSize="xs" color="fg.secondary">Target Audience:</Text>
							<Text fontSize="sm" color="fg.default">
								Brands looking to enhance their visibility and connect with active lifestyle consumers.
							</Text>
						</Box>

						<Box display="flex" flexDirection="column" gap="4">
							<Text fontSize="xs" color="fg.secondary">Distribution Channels:</Text>
							<Text fontSize="sm" color="fg.default">
								Direct outreach to potential sponsors, event website, and email campaigns.
							</Text>
						</Box>

						<Box display="flex" flexDirection="column" gap="4">
							<Text fontSize="xs" color="fg.secondary">Social Channels:</Text>
							<Text fontSize="sm" color="fg.default">
								Instagram, Facebook, and LinkedIn.
							</Text>
						</Box>
					</Box>
				</Box>
			</Box>
		</Box>
	);
}

// ─── Rich Text Toolbar ──────────────────────────────────────────────────────

function RichTextToolbar() {
	return (
		<Box
			display="flex"
			flexDirection="column"
			rounded="md"
			style={{
				border: '1px solid var(--ax-colors-border-default)',
				backgroundColor: 'var(--ax-colors-bg-default)',
			}}
		>
			{/* Row 1: Undo/Redo, Paragraph dropdown, Font size, Alignment, Lists, Indents, Fullscreen, Help */}
			<Box
				display="flex"
				alignItems="center"
				gap="2"
				px="8"
				py="4"
				style={{ borderBottom: '1px solid var(--ax-colors-border-default)' }}
			>
				<ToolbarButton icon={<IconArrowBackUp size={14} />} />
				<ToolbarButton icon={<IconArrowForwardUp size={14} />} />
				<ToolbarDivider />
				<Box
					display="flex"
					alignItems="center"
					gap="4"
					px="8"
					py="4"
					rounded="sm"
					style={{ cursor: 'pointer', fontSize: '12px', color: 'var(--ax-colors-fg-default)' }}
				>
					Paragraph
					<IconChevronDown size={12} />
				</Box>
				<ToolbarDivider />
				<Box
					display="flex"
					alignItems="center"
					gap="4"
					px="8"
					py="4"
					rounded="sm"
					style={{ cursor: 'pointer', fontSize: '12px', color: 'var(--ax-colors-fg-default)' }}
				>
					14px
					<IconChevronDown size={12} />
				</Box>
				<ToolbarDivider />
				<ToolbarButton icon={<IconAlignLeft size={14} />} />
				<ToolbarButton icon={<IconAlignCenter size={14} />} />
				<ToolbarButton icon={<IconAlignRight size={14} />} />
				<ToolbarButton icon={<IconAlignJustified size={14} />} />
				<ToolbarDivider />
				<ToolbarButton icon={<IconListNumbers size={14} />} />
				<ToolbarButton icon={<IconList size={14} />} />
				<ToolbarDivider />
				<ToolbarButton icon={<IconIndentDecrease size={14} />} />
				<ToolbarButton icon={<IconIndentIncrease size={14} />} />
				<Box style={{ flex: 1 }} />
				<ToolbarButton icon={<IconMaximize size={14} />} />
				<ToolbarButton icon={<IconHelp size={14} />} />
			</Box>

			{/* Row 2: B, I, U, more, image, link, blockquote, hr, media, table, special chars, code/paste */}
			<Box
				display="flex"
				alignItems="center"
				gap="2"
				px="8"
				py="4"
			>
				<ToolbarButton icon={<IconBold size={14} />} />
				<ToolbarButton icon={<IconItalic size={14} />} />
				<ToolbarButton icon={<IconUnderline size={14} />} />
				<ToolbarButton icon={<IconDots size={14} />} />
				<ToolbarDivider />
				<Box
					display="flex"
					alignItems="center"
					gap="2"
					px="6"
					py="4"
					rounded="sm"
					style={{ cursor: 'pointer' }}
				>
					<IconPhoto size={14} color="var(--ax-colors-fg-secondary)" />
					<IconChevronDown size={10} color="var(--ax-colors-fg-tertiary)" />
				</Box>
				<ToolbarButton icon={<IconLink size={14} />} />
				<ToolbarButton icon={<IconQuote size={14} />} />
				<ToolbarButton icon={<IconMinus size={14} />} />
				<ToolbarDivider />
				<ToolbarButton icon={<IconPlayerPlay size={14} />} />
				<Box
					display="flex"
					alignItems="center"
					gap="2"
					px="6"
					py="4"
					rounded="sm"
					style={{ cursor: 'pointer' }}
				>
					<IconTable size={14} color="var(--ax-colors-fg-secondary)" />
					<IconChevronDown size={10} color="var(--ax-colors-fg-tertiary)" />
				</Box>
				<ToolbarDivider />
				<ToolbarButton icon={<IconCode size={14} />} />
			</Box>
		</Box>
	);
}

function ToolbarButton({ icon }: { icon: React.ReactNode }) {
	return (
		<Box
			display="flex"
			alignItems="center"
			justifyContent="center"
			rounded="sm"
			style={{
				width: '28px',
				height: '28px',
				cursor: 'pointer',
				color: 'var(--ax-colors-fg-secondary)',
			}}
		>
			{icon}
		</Box>
	);
}

function ToolbarDivider() {
	return (
		<Box
			style={{
				width: '1px',
				height: '16px',
				backgroundColor: 'var(--ax-colors-border-default)',
				margin: '0 2px',
			}}
		/>
	);
}

// ─── Opal Suggestion Banner ─────────────────────────────────────────────────

function OpalSuggestionBanner({ onGenerateClick }: { onGenerateClick: () => void }) {
	return (
		<Box
			display="flex"
			alignItems="center"
			justifyContent="space-between"
			rounded="lg"
			py="12"
			px="16"
			style={{
				background: 'linear-gradient(90deg, rgba(99, 102, 241, 0.08) 0%, rgba(168, 85, 247, 0.08) 100%)',
				width: '100%',
			}}
		>
			<Box display="flex" alignItems="center" gap="12">
				<OpalIcon size={20} />
				<Text fontSize="sm">
					Opal can suggest existing assets that meet the goals of your brief
				</Text>
			</Box>
			<Button
				appearance="primary"
				size="sm"
				onClick={onGenerateClick}
				style={{
					background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
					border: 'none',
				}}
			>
				<Box display="flex" alignItems="center" gap="6">
					<OpalIcon size={16} />
					Generate
				</Box>
			</Button>
		</Box>
	);
}

// ─── Suggested Assets Panel (replaces right sidebar) ────────────────────────

function SuggestedAssetsPanel({ onClose }: { onClose: () => void }) {
	const suggestedAssets = [
		{ image: 'Display.png', type: 'MP4', match: 92 },
		{ image: 'Display-1.png', type: 'Document', match: 92 },
		{ image: 'Display-2.png', type: 'MP4', match: 92 },
		{ image: 'Display-3.png', type: 'Document', match: 92 },
		{ image: 'Display-4.png', type: 'MP4', match: 92 },
		{ image: 'Display-5.png', type: 'Document', match: 92 },
	];

	return (
		<Box
			bg="bg.default"
			display="flex"
			flexDirection="column"
			overflow="hidden"
			rounded="lg"
			style={{
				width: '444px',
				flexShrink: 0,
				alignSelf: 'stretch',
			}}
		>
			{/* Header */}
			<Box
				display="flex"
				alignItems="center"
				justifyContent="space-between"
				px="20"
				py="16"
				style={{ borderBottom: '1px solid var(--ax-colors-border-default)' }}
			>
				<Box display="flex" flexDirection="column" gap="4">
					<Text fontSize="lg" style={{ fontWeight: 600 }}>Suggested Assets</Text>
					<Text fontSize="xs" color="fg.tertiary">Based on your brief</Text>
				</Box>
				<Button
					appearance="subtle"
					size="sm"
					icon={<IconX size={18} />}
					aria-label="Close"
					onClick={onClose}
				/>
			</Box>

			{/* Asset Grid */}
			<Box flex="1" overflow="auto" p="20" display="flex" flexDirection="column" gap="16">
				{/* 2-column grid */}
				<Box display="flex" gap="12">
					{suggestedAssets.slice(0, 2).map((asset, i) => (
						<SuggestedAssetOverlayCard key={i} {...asset} />
					))}
				</Box>
				<Box display="flex" gap="12">
					{suggestedAssets.slice(2, 4).map((asset, i) => (
						<SuggestedAssetOverlayCard key={i + 2} {...asset} />
					))}
				</Box>
				<Box display="flex" gap="12">
					{suggestedAssets.slice(4, 6).map((asset, i) => (
						<SuggestedAssetOverlayCard key={i + 4} {...asset} />
					))}
				</Box>

				{/* Edit Queries link */}
				<Box display="flex" justifyContent="center" py="8">
					<Text
						fontSize="sm"
						color="fg.accent"
						style={{ cursor: 'pointer', fontWeight: 500 }}
					>
						Edit Queries &gt;
					</Text>
				</Box>
			</Box>
		</Box>
	);
}

function SuggestedAssetOverlayCard({
	image,
	type,
	match,
}: {
	image: string;
	type: string;
	match: number;
}) {
	return (
		<Box
			display="flex"
			flexDirection="column"
			gap="8"
			style={{ flex: 1, minWidth: 0 }}
		>
			{/* Image with match badge and + button */}
			<Box
				rounded="lg"
				style={{
					width: '100%',
					aspectRatio: '1',
					position: 'relative',
					backgroundImage: `url(/cmp/assets/cards/${image})`,
					backgroundSize: 'cover',
					backgroundPosition: 'center',
					backgroundColor: 'var(--ax-colors-bg-secondary)',
				}}
			>
				{/* Match percentage badge - green */}
				<Box
					rounded="full"
					px="8"
					py="2"
					style={{
						position: 'absolute',
						top: '8px',
						left: '8px',
						backgroundColor: '#dcfce7',
					}}
				>
					<Text fontSize="xs" style={{ fontWeight: 600, color: '#16a34a' }}>
						{match}%
					</Text>
				</Box>

				{/* + add button */}
				<Box
					display="flex"
					alignItems="center"
					justifyContent="center"
					rounded="full"
					style={{
						position: 'absolute',
						bottom: '8px',
						right: '8px',
						width: '28px',
						height: '28px',
						backgroundColor: 'white',
						boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
						cursor: 'pointer',
					}}
				>
					<IconPlus size={16} stroke={2} color="#333" />
				</Box>
			</Box>

			{/* Type tag */}
			<Badge intent="information" style={{ width: 'fit-content' }}>
				{type}
			</Badge>
		</Box>
	);
}

// ─── Right Sidebar ──────────────────────────────────────────────────────────

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
			p="16"
			gap="16"
			rounded="lg"
			overflow="hidden"
			style={{
				width: '444px',
				flexShrink: 0,
				alignSelf: 'stretch',
			}}
		>
			{/* Top Row - Avatar group, eye icon + count, Mark Complete + ellipsis */}
			<Box display="flex" alignItems="center" gap="12" justifyContent="space-between">
				{/* Left: Dashed circle + 4 stacked avatars + counter */}
				<Box display="flex" alignItems="center" gap="4">
					{/* Dashed circle with plus */}
					<Box
						display="flex"
						alignItems="center"
						justifyContent="center"
						rounded="full"
						style={{
							width: '24px',
							height: '24px',
							border: '1.5px dashed var(--ax-colors-border-tertiary)',
						}}
					>
						<IconPlus size={12} stroke={2} color="var(--ax-colors-fg-tertiary)" />
					</Box>

					{/* Four stacked avatars */}
					<Box style={{ display: 'flex', position: 'relative', width: '66px', height: '24px', marginLeft: '-8px' }}>
						<Avatar
							size="sm"
							initials="JD"
							style={{ position: 'absolute', left: '0', zIndex: 4 }}
						/>
						<Avatar
							size="sm"
							initials="SA"
							style={{ position: 'absolute', left: '14px', zIndex: 3 }}
						/>
						<Avatar
							size="sm"
							initials="ML"
							style={{ position: 'absolute', left: '28px', zIndex: 2 }}
						/>
						<Avatar
							size="sm"
							initials="RK"
							style={{ position: 'absolute', left: '42px', zIndex: 1 }}
						/>
					</Box>

					{/* +3 counter */}
					<Text fontSize="xs" color="fg.secondary" style={{ marginLeft: '4px' }}>
						+3
					</Text>
				</Box>

				{/* Eye icon with count */}
				<Box display="flex" alignItems="center" gap="4">
					<IconEye size={16} color="var(--ax-colors-fg-secondary)" />
					<Text fontSize="xs" color="fg.secondary">8</Text>
				</Box>

				{/* Gap (flex spacer) */}
				<Box style={{ flex: 1 }} />

				{/* Right: Mark Complete + ellipsis */}
				<Box display="flex" alignItems="center" gap="8">
					<Button appearance="default" size="sm">Mark Complete</Button>
					<Button appearance="subtle" size="sm" icon={<IconDots size={16} />} aria-label="More options" />
				</Box>
			</Box>

			{/* Status badge - In Progress (BEFORE dates per user's design) */}
			<Box display="flex" alignItems="center" gap="8">
				<Badge intent="information">In Progress</Badge>
			</Box>

			{/* Date row with calendar icons */}
			<Box display="flex" alignItems="center" gap="16">
				<Box display="flex" alignItems="center" gap="6">
					<Box
						display="flex"
						alignItems="center"
						justifyContent="center"
						rounded="full"
						style={{
							width: '18px',
							height: '18px',
							backgroundColor: 'var(--ax-colors-bg-tertiary)',
						}}
					>
						<CalendarIconPlain size={10} />
					</Box>
					<Text fontSize="sm" color="fg.default">
						Started • May 11
					</Text>
				</Box>

				<Box display="flex" alignItems="center" gap="6">
					<Box
						display="flex"
						alignItems="center"
						justifyContent="center"
						rounded="full"
						style={{
							width: '18px',
							height: '18px',
							backgroundColor: 'var(--ax-colors-bg-tertiary)',
						}}
					>
						<CalendarIconPlain size={10} />
					</Box>
					<Text fontSize="sm" color="fg.default">
						Due • Jun 28
					</Text>
				</Box>
			</Box>

			{/* Progress bar - green, about 70% filled */}
			<Box
				style={{
					width: '100%',
					height: '4px',
					backgroundColor: 'var(--ax-colors-bg-tertiary)',
					borderRadius: '2px',
					overflow: 'hidden',
				}}
			>
				<Box
					style={{
						width: '70%',
						height: '100%',
						backgroundColor: '#16a34a',
						borderRadius: '2px',
					}}
				/>
			</Box>

			{/* Tabs - Workflow | Comments | Attachments with arrow icon */}
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
					icon={<IconChevronRight size={16} />}
					aria-label="Collapse sidebar"
				/>
			</Box>

			{/* Tab Content */}
			<Box flex="1" display="flex" flexDirection="column" style={{ overflow: 'auto' }}>
				{activeTab === "workflow" && <WorkflowContent />}
				{activeTab === "comments" && <CommentsContent />}
				{activeTab === "attachments" && <AttachmentsContent />}
			</Box>
		</Box>
	);
}

// ─── Workflow Content ───────────────────────────────────────────────────────

function WorkflowContent() {
	const [expandedStep, setExpandedStep] = useState<number | null>(4);

	const toggleStep = (step: number) => {
		setExpandedStep(prev => prev === step ? null : step);
	};

	return (
		<Box display="flex" flexDirection="column" gap="16">
			{/* Workflow Selector - Newsletter Workflow dropdown + ellipsis */}
			<Box display="flex" alignItems="center" gap="8">
				<Button appearance="default" size="md" style={{ flex: 1 }}>
					<Box display="flex" alignItems="center" gap="8">
						Newsletter Workflow
						<IconChevronDown size={16} />
					</Box>
				</Button>
				<Button appearance="subtle" size="sm" icon={<IconDots size={16} />} aria-label="Workflow options" />
			</Box>

			{/* Divider */}
			<Box style={{ height: '1px', backgroundColor: 'var(--ax-colors-border-default)' }} />

			{/* Workflow Steps - NUMBERED with chevron toggles */}
			<Box display="flex" flexDirection="column" gap="8">

				{/* Step 1 - Review (completed) */}
				<WorkflowStep
					number={1}
					title="Review"
					date="Jun 7"
					completed={true}
					expanded={expandedStep === 1}
					onToggle={() => toggleStep(1)}
				/>

				{/* Step 2 - Competitive Analysis (completed) */}
				<WorkflowStep
					number={2}
					title="Competitive Analysis"
					date="Jun 10"
					completed={true}
					expanded={expandedStep === 2}
					onToggle={() => toggleStep(2)}
				/>

				{/* Step 3 - Concept (completed, overdue date) */}
				<WorkflowStep
					number={3}
					title="Concept"
					date="Jun 14"
					dateOverdue={true}
					completed={true}
					expanded={expandedStep === 3}
					onToggle={() => toggleStep(3)}
				/>

				{/* Step 4 - Hi-fi mockups (expanded, in progress) */}
				<Box
					display="flex"
					flexDirection="column"
					rounded="md"
					style={{
						backgroundColor: 'var(--ax-colors-bg-page)',
						border: '1px solid var(--ax-colors-border-default)',
					}}
				>
					{/* Header row */}
					<Box
						display="flex"
						alignItems="center"
						gap="8"
						p="12"
						style={{ cursor: 'pointer' }}
						onClick={() => toggleStep(4)}
					>
						{expandedStep === 4 ? (
							<IconChevronDown size={16} color="var(--ax-colors-fg-tertiary)" />
						) : (
							<IconChevronRight size={16} color="var(--ax-colors-fg-tertiary)" />
						)}
						<Box
							display="flex"
							alignItems="center"
							justifyContent="center"
							rounded="full"
							style={{
								width: '20px',
								height: '20px',
								border: '1.5px dashed var(--ax-colors-border-tertiary)',
							}}
						/>
						<Text fontSize="sm" style={{ fontWeight: 500 }} color="fg.default">
							4. Hi-fi mockups
						</Text>
						<Box style={{ flex: 1 }} />
						<Box display="flex" alignItems="center" gap="6">
							<Box
								display="flex"
								alignItems="center"
								justifyContent="center"
								rounded="full"
								style={{ width: '16px', height: '16px', backgroundColor: 'var(--ax-colors-bg-tertiary)' }}
							>
								<CalendarIconPlain size={9} />
							</Box>
							<SmallAvatarGroup />
						</Box>
					</Box>

					{/* Expanded content */}
					{expandedStep === 4 && (
						<Box
							display="flex"
							flexDirection="column"
							gap="10"
							px="12"
							pb="12"
							style={{ borderTop: '1px solid var(--ax-colors-border-tertiary)' }}
							pt="12"
						>
							{/* Assigned to */}
							<Box display="flex" alignItems="center" gap="8">
								<Text fontSize="xs" color="fg.tertiary">Assigned to:</Text>
								<Avatar size="xs" initials="MA" />
								<Text fontSize="sm" color="fg.default">Mary Anne</Text>
							</Box>

							{/* Description placeholder */}
							<Box
								as="textarea"
								placeholder="Write description"
								style={{
									width: '100%',
									padding: '8px',
									borderRadius: '4px',
									border: '1px solid var(--ax-colors-border-tertiary)',
									fontSize: '12px',
									fontFamily: 'inherit',
									color: 'var(--ax-colors-fg-tertiary)',
									backgroundColor: 'var(--ax-colors-bg-secondary)',
									resize: 'none',
									minHeight: '48px',
								}}
							/>

							{/* Checkboxes */}
							<Box display="flex" flexDirection="column" gap="6">
								<Box display="flex" alignItems="center" gap="8">
									<IconSquare size={16} stroke={1.5} color="var(--ax-colors-border-default)" />
									<Text fontSize="xs" color="fg.default">Write Content</Text>
								</Box>
								<Box display="flex" alignItems="center" gap="8">
									<IconSquare size={16} stroke={1.5} color="var(--ax-colors-border-default)" />
									<Text fontSize="xs" color="fg.default">Write Your Share</Text>
								</Box>
								<Box display="flex" alignItems="center" gap="8">
									<IconSquare size={16} stroke={1.5} color="var(--ax-colors-border-default)" />
									<Text fontSize="xs" color="fg.default">Select Interesting Images</Text>
								</Box>
							</Box>

							{/* Not Started badge */}
							<Badge intent="neutral" style={{ width: 'fit-content', fontSize: '10px' }}>
								Not Started
							</Badge>

							{/* Action icons row: upload, delete, more */}
							<Box display="flex" alignItems="center" gap="8" pt="4" style={{ borderTop: '1px solid var(--ax-colors-border-tertiary)' }}>
								<Button
									appearance="subtle"
									size="sm"
									icon={<IconUpload size={14} />}
									aria-label="Upload"
									style={{ padding: '4px' }}
								/>
								<Button
									appearance="subtle"
									size="sm"
									icon={<IconTrash size={14} />}
									aria-label="Delete"
									style={{ padding: '4px' }}
								/>
								<Button
									appearance="subtle"
									size="sm"
									icon={<IconDots size={14} />}
									aria-label="More"
									style={{ padding: '4px' }}
								/>
							</Box>
						</Box>
					)}
				</Box>

				{/* Step 5 - Publish to CC */}
				<WorkflowStep
					number={5}
					title="Publish to CC"
					date="Jun 30"
					completed={false}
					expanded={expandedStep === 5}
					onToggle={() => toggleStep(5)}
				/>

				{/* Add Step button */}
				<Button appearance="default" size="md" style={{ width: '100%' }}>
					<Box display="flex" alignItems="center" gap="6">
						<IconPlus size={16} />
						Add Step
					</Box>
				</Button>
			</Box>
		</Box>
	);
}

// ─── Workflow Step Component ────────────────────────────────────────────────

interface WorkflowStepProps {
	number: number;
	title: string;
	date?: string;
	dateOverdue?: boolean;
	completed: boolean;
	expanded: boolean;
	onToggle: () => void;
}

function WorkflowStep({ number, title, date, dateOverdue, completed, expanded, onToggle }: WorkflowStepProps) {
	return (
		<Box
			display="flex"
			alignItems="center"
			gap="8"
			py="8"
			px="4"
			style={{ cursor: 'pointer' }}
			onClick={onToggle}
		>
			{/* Chevron toggle */}
			{expanded ? (
				<IconChevronDown size={16} color="var(--ax-colors-fg-tertiary)" />
			) : (
				<IconChevronRight size={16} color="var(--ax-colors-fg-tertiary)" />
			)}

			{/* Status icon */}
			{completed ? (
				<IconSquareCheck size={20} stroke={1.5} color="var(--ax-colors-fg-success)" />
			) : (
				<Box
					display="flex"
					alignItems="center"
					justifyContent="center"
					rounded="full"
					style={{
						width: '20px',
						height: '20px',
						border: '1.5px dashed var(--ax-colors-border-tertiary)',
					}}
				/>
			)}

			{/* Numbered title */}
			<Text fontSize="sm" color="fg.default">
				{number}. {title}
			</Text>

			{/* Date */}
			{date && (
				<Text
					fontSize="xs"
					style={dateOverdue ? { color: '#cc1616' } : {}}
					color={dateOverdue ? undefined : "fg.tertiary"}
				>
					{date}
				</Text>
			)}

			<Box style={{ flex: 1 }} />

			{/* Avatar group */}
			<SmallAvatarGroup />
		</Box>
	);
}

// ─── Content Tab (unchanged) ────────────────────────────────────────────────

function ContentTabContent() {
	const [showSuggested, setShowSuggested] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);
	const [selectedAssets, setSelectedAssets] = useState<Set<number>>(new Set());

	const previewCards = [
		{ image: 'Display.png', label: 'Youtube', filename: 'rider_yt_1920×1080.jpg' },
		{ image: 'Display-1.png', label: 'Youtube Short', filename: 'rider_yt_1080×1920.jpg' },
		{ image: 'Display-2.png', label: 'Instagram Reel', filename: 'rider_ig_1080×1920.jpg' },
		{ image: 'Display-3.png', label: 'Youtube', filename: 'rider_yt_1920×1080.jpg' },
		{ image: 'Display-4.png', label: 'Youtube Short', filename: 'rider_yt_1080×1920.jpg' },
		{ image: 'Display-5.png', label: 'Instagram Reel', filename: 'rider_ig_1080×1920.jpg' },
	];

	const suggestedAssets = [
		{ image: 'Display.png', type: 'MOV', typeColor: 'bg.information.light', filename: 'demo.mov', match: 92 },
		{ image: 'Display-1.png', type: 'PNG', typeColor: 'bg.information.light', filename: 'rider_yt_1080×1920.jpg', match: 67 },
		{ image: 'Display-2.png', type: 'Structured Content', typeColor: 'bg.information.light', filename: 'Facebook Reel', match: 92 },
		{ image: 'Display-3.png', type: 'MP4', typeColor: 'bg.information.light', filename: 'movie.mp4', match: 66 },
		{ image: 'Display-4.png', type: 'JPG', typeColor: 'bg.information.light', filename: 'rider_yt_1080×1920.jpg', match: 87 },
		{ image: 'Display-5.png', type: 'JPG', typeColor: 'bg.information.light', filename: 'rider_ig_1080×1920.jpg', match: 69 },
	];

	const toggleAsset = (index: number) => {
		setSelectedAssets(prev => {
			const next = new Set(prev);
			if (next.has(index)) next.delete(index);
			else next.add(index);
			return next;
		});
	};

	const totalPages = 3;

	return (
		<Box
			display="flex"
			flexDirection="column"
			alignItems="center"
			py="64"
			px="32"
			gap="24"
		>
			{/* Header section */}
			<Box display="flex" flexDirection="column" alignItems="center" gap="12">
				<Text fontSize="xl" style={{ fontWeight: 500 }}>Add Content</Text>
				<Text color="fg.secondary" fontSize="sm" style={{ textAlign: 'center', maxWidth: '560px' }}>
					Use this workspace to add, revise, and optimize content. You can
					add assets by clicking the &quot;Add Content&quot; button.
				</Text>
				<Button appearance="primary" size="md" mt="8">
					<Box display="flex" alignItems="center" gap="8">
						<IconPlus size={16} />
						Add Content
					</Box>
				</Button>
			</Box>

			{!showSuggested ? (
				<Box
					mt="32"
					style={{
						width: '100%',
						maxWidth: '780px',
						position: 'relative',
						maxHeight: '340px',
						overflow: 'hidden',
					}}
				>
					<Box display="flex" flexDirection="column" gap="16" style={{ width: '100%' }}>
						<Box display="flex" gap="16">
							{previewCards.slice(0, 3).map((card, i) => (
								<ContentCard key={i} {...card} />
							))}
						</Box>
						<Box display="flex" gap="16">
							{previewCards.slice(3, 6).map((card, i) => (
								<ContentCard key={i + 3} {...card} />
							))}
						</Box>
					</Box>

					{/* Gradient fade overlay */}
					<Box
						style={{
							position: 'absolute',
							top: 0,
							left: 0,
							right: 0,
							bottom: 0,
							background: `linear-gradient(180deg,
								color-mix(in srgb, var(--ax-colors-bg-page) 55%, transparent) 0%,
								color-mix(in srgb, var(--ax-colors-bg-page) 70%, transparent) 25%,
								color-mix(in srgb, var(--ax-colors-bg-page) 85%, transparent) 50%,
								color-mix(in srgb, var(--ax-colors-bg-page) 97%, transparent) 75%,
								var(--ax-colors-bg-page) 100%
							)`,
							pointerEvents: 'none',
							zIndex: 1,
						}}
					/>

					{/* View Suggested Assets button */}
					<Box
						display="flex"
						justifyContent="center"
						style={{
							position: 'absolute',
							bottom: '12px',
							left: 0,
							right: 0,
							zIndex: 2,
						}}
					>
						<Button
							appearance="primary"
							size="md"
							onClick={() => setShowSuggested(true)}
							style={{
								background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
								border: 'none',
								borderRadius: '999px',
								boxShadow: '0 4px 16px rgba(99, 102, 241, 0.3)',
							}}
						>
							<Box display="flex" alignItems="center" gap="8">
								<OpalIcon size={20} />
								View Suggested Assets
							</Box>
						</Button>
					</Box>
				</Box>
			) : (
				<Box display="flex" flexDirection="column" gap="24" style={{ width: '100%', maxWidth: '780px' }}>
					{/* Opal refresh banner */}
					<Box
						display="flex"
						alignItems="center"
						justifyContent="space-between"
						rounded="lg"
						py="12"
						px="16"
						style={{
							background: 'linear-gradient(90deg, rgba(99, 102, 241, 0.08) 0%, rgba(168, 85, 247, 0.08) 100%)',
						}}
					>
						<Box display="flex" alignItems="center" gap="12">
							<OpalIcon size={20} />
							<Text fontSize="sm">
								Brief is newer than your suggestions. Refresh for the latest suggestion
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
							Refresh
						</Button>
					</Box>

					{/* Suggested Assets header */}
					<Box display="flex" flexDirection="column" gap="8">
						<Box display="flex" alignItems="center" justifyContent="space-between">
							<Text fontSize="xl" style={{ fontWeight: 600 }}>
								Suggested Assets
							</Text>
							<Box display="flex" alignItems="center" gap="12">
								<Button appearance="subtle" size="sm">
									<Box display="flex" alignItems="center" gap="6">
										<IconRefresh size={16} />
										Refresh
									</Box>
								</Button>
								<Button appearance="subtle" size="sm">
									<Box display="flex" alignItems="center" gap="6">
										<IconPlus size={16} />
										Add to Task
									</Box>
								</Button>
							</Box>
						</Box>
						<Text fontSize="xs" color="fg.tertiary">
							Last Modified by Amit Mojumder on Sep 25, 2024, 2:58 PM
						</Text>
					</Box>

					{/* Asset cards grid */}
					<Box display="flex" flexDirection="column" gap="16">
						<Box display="flex" gap="16">
							{suggestedAssets.slice(0, 3).map((asset, i) => (
								<SuggestedAssetCard
									key={i}
									{...asset}
									selected={selectedAssets.has(i)}
									onToggle={() => toggleAsset(i)}
								/>
							))}
						</Box>
						<Box display="flex" gap="16">
							{suggestedAssets.slice(3, 6).map((asset, i) => (
								<SuggestedAssetCard
									key={i + 3}
									{...asset}
									selected={selectedAssets.has(i + 3)}
									onToggle={() => toggleAsset(i + 3)}
								/>
							))}
						</Box>
					</Box>

					{/* Pagination */}
					<Box display="flex" alignItems="center" justifyContent="center" gap="4" py="16">
						<Button
							appearance="subtle"
							size="sm"
							icon={<IconChevronLeft size={16} />}
							aria-label="Previous page"
							onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
							disabled={currentPage === 1}
						/>
						{Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
							<Button
								key={page}
								appearance={page === currentPage ? "primary" : "subtle"}
								size="sm"
								onClick={() => setCurrentPage(page)}
								style={page === currentPage ? {
									minWidth: '32px',
									borderRadius: '6px',
								} : {
									minWidth: '32px',
								}}
							>
								{page}
							</Button>
						))}
						<Button
							appearance="subtle"
							size="sm"
							icon={<IconChevronRight size={16} />}
							aria-label="Next page"
							onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
							disabled={currentPage === totalPages}
						/>
					</Box>
				</Box>
			)}
		</Box>
	);
}

function SuggestedAssetCard({
	image,
	type,
	filename,
	match,
	selected,
	onToggle,
}: {
	image: string;
	type: string;
	typeColor: string;
	filename: string;
	match: number;
	selected: boolean;
	onToggle: () => void;
}) {
	return (
		<Box
			display="flex"
			flexDirection="column"
			gap="8"
			style={{ flex: 1, minWidth: 0 }}
		>
			<Box
				rounded="lg"
				style={{
					width: '100%',
					aspectRatio: '1',
					position: 'relative',
					backgroundImage: `url(/cmp/assets/cards/${image})`,
					backgroundSize: 'cover',
					backgroundPosition: 'center',
					backgroundColor: 'var(--ax-colors-bg-secondary)',
				}}
			>
				<Box
					rounded="md"
					px="6"
					py="2"
					style={{
						position: 'absolute',
						top: '8px',
						left: '8px',
						background: match >= 80 ? 'var(--ax-colors-bg-success-light)' : 'var(--ax-colors-bg-warning-light)',
					}}
				>
					<Text fontSize="xs" style={{ fontWeight: 600 }} color={match >= 80 ? "fg.success.strong" : "fg.warning.strong"}>
						{match}%
					</Text>
				</Box>

				<Box
					style={{
						position: 'absolute',
						top: '8px',
						right: '8px',
						cursor: 'pointer',
					}}
					onClick={onToggle}
				>
					{selected ? (
						<IconSquareCheck size={20} stroke={1.5} color="var(--ax-colors-fg-accent)" />
					) : (
						<IconSquare size={20} stroke={1.5} color="var(--ax-colors-fg-tertiary)" />
					)}
				</Box>
			</Box>

			<Badge intent="information" style={{ width: 'fit-content' }}>
				{type}
			</Badge>

			<Text fontSize="xs" color="fg.default">
				{filename}
			</Text>
		</Box>
	);
}

function ContentCard({ image, label, filename }: { image: string; label: string; filename: string }) {
	return (
		<Box
			display="flex"
			flexDirection="column"
			gap="8"
			style={{ flex: 1, minWidth: 0 }}
		>
			<Box
				bg="bg.secondary"
				rounded="lg"
				style={{
					width: '100%',
					aspectRatio: '1',
					backgroundImage: `url(/cmp/assets/cards/${image})`,
					backgroundSize: 'cover',
					backgroundPosition: 'center',
				}}
			/>
			<Box
				display="inline-flex"
				alignItems="center"
				bg="bg.tertiary"
				rounded="md"
				py="2"
				px="8"
				style={{ width: 'fit-content' }}
			>
				<Text fontSize="xs" color="fg.accent" style={{ fontWeight: 500 }}>
					{label}
				</Text>
			</Box>
			<Text fontSize="xs" color="fg.tertiary">
				{filename}
			</Text>
		</Box>
	);
}

// ─── Other Tab Content Components (unchanged) ──────────────────────────────

function FieldsTabContent() {
	return (
		<Box
			display="flex"
			flexDirection="column"
			alignItems="center"
			justifyContent="center"
			py="64"
			px="32"
			gap="24"
			style={{ minHeight: '500px' }}
		>
			<Box display="flex" flexDirection="column" alignItems="center" gap="12">
				<Text fontSize="xl" style={{ fontWeight: 500, textAlign: 'center' }}>
					Add Field
				</Text>
				<Text color="fg.secondary" fontSize="sm" style={{ textAlign: 'center', maxWidth: '560px' }}>
					Use fields to organize your work with a strategic structure for classification. They allow for the filtering, customization, and analysis of content by strategic priorities.
				</Text>
			</Box>

			<Button appearance="primary" size="md">
				<Box display="flex" alignItems="center" gap="8">
					<IconPlus size={16} />
					Add Field
					<IconChevronDown size={16} />
				</Box>
			</Button>

			<Box
				display="flex"
				flexDirection="column"
				alignItems="center"
				justifyContent="center"
				mt="24"
				style={{ minHeight: '200px' }}
			>
				<Text color="fg.tertiary" fontSize="sm">
					No fields added yet
				</Text>
			</Box>
		</Box>
	);
}

function PublishingTabContent() {
	return (
		<Box display="flex" flexDirection="column" gap="24" py="24" px="32" style={{ maxWidth: '780px' }}>
			<Box display="flex" alignItems="center" gap="12">
				<Button appearance="subtle" size="sm" icon={<IconList size={16} />} aria-label="List view" />
				<Button appearance="subtle" size="sm" icon={<IconListDetails size={16} />} aria-label="Details view" />
				<Box style={{ flex: 1 }} />
				<Button appearance="primary" size="md">
					<Box display="flex" alignItems="center" gap="8">
						Add Channel
						<IconChevronDown size={16} />
					</Box>
				</Button>
			</Box>

			<Box
				display="flex"
				flexDirection="column"
				gap="12"
				rounded="lg"
				p="16"
				style={{ border: '1px solid var(--ax-colors-border-default)', backgroundColor: 'var(--ax-colors-bg-secondary)' }}
			>
				<Box display="flex" alignItems="center" justifyContent="space-between">
					<Box display="flex" alignItems="center" gap="8">
						<IconBrandFacebook size={20} stroke={1.5} style={{ color: '#1877F2' }} />
						<Text fontSize="sm">Posting to</Text>
						<Text fontSize="sm" style={{ fontWeight: 600, color: '#1877F2', cursor: 'pointer' }}>
							50 published page
						</Text>
					</Box>
					<Box display="flex" alignItems="center" gap="12">
						<Button appearance="subtle" size="sm" icon={<IconPencil size={16} />} aria-label="Edit" />
						<Button appearance="subtle" size="sm" icon={<IconTrash size={16} />} aria-label="Delete" />
					</Box>
				</Box>

				<Box
					display="flex"
					gap="8"
					rounded="md"
					p="12"
					style={{ alignItems: 'flex-start', backgroundColor: 'var(--ax-colors-bg-warning-light)' }}
				>
					<IconAlertTriangle size={16} stroke={2} style={{ color: 'var(--ax-colors-fg-warning-strong)', marginTop: '2px', flexShrink: 0 }} />
					<Text fontSize="xs" color="fg.default" style={{ lineHeight: '1.5' }}>
						This channel is not connected. Please contact your admin to reconnect and avoid publish failure.
					</Text>
				</Box>

				<Box
					display="flex"
					flexDirection="column"
					gap="12"
					rounded="md"
					p="12"
					style={{ border: '1px solid var(--ax-colors-border-tertiary)', backgroundColor: 'var(--ax-colors-bg-page)' }}
				>
					<Box display="flex" alignItems="center" gap="8">
						<Avatar size="sm" initials="FP" style={{ flexShrink: 0 }} />
						<Box display="flex" flexDirection="column" gap="2">
							<Text fontSize="sm" style={{ fontWeight: 600 }}>50 published page</Text>
							<Text fontSize="xs" color="fg.secondary">Just Now</Text>
						</Box>
						<Box style={{ flex: 1 }} />
						<IconGlobe size={14} color="var(--ax-colors-fg-tertiary)" />
					</Box>

					<Text fontSize="sm" color="fg.default">
						I want this to be published
					</Text>

					<Box
						display="flex"
						flexDirection="column"
						gap="6"
						rounded="md"
						p="10"
						style={{ border: '1px solid var(--ax-colors-border-tertiary)', backgroundColor: 'var(--ax-colors-bg-secondary)' }}
					>
						<Text fontSize="xs" color="fg.tertiary">CMP.OPTIMIZELY.COM</Text>
						<Text fontSize="sm" style={{ fontWeight: 600 }}>I want this to be published</Text>
						<Text fontSize="xs" color="fg.secondary">This is the one!</Text>
					</Box>

					<Box display="flex" alignItems="center" gap="16" pt="8" style={{ borderTop: '1px solid var(--ax-colors-border-tertiary)' }}>
						<Button appearance="subtle" size="sm">
							<Box display="flex" alignItems="center" gap="4">
								<IconThumbUp size={14} />
								<Text fontSize="xs">Like</Text>
							</Box>
						</Button>
						<Button appearance="subtle" size="sm">
							<Box display="flex" alignItems="center" gap="4">
								<IconMessage size={14} />
								<Text fontSize="xs">Comment</Text>
							</Box>
						</Button>
						<Button appearance="subtle" size="sm">
							<Box display="flex" alignItems="center" gap="4">
								<IconShare size={14} />
								<Text fontSize="xs">Share</Text>
							</Box>
						</Button>
					</Box>
				</Box>
			</Box>
		</Box>
	);
}

function RelatedTabContent() {
	return (
		<Box
			display="flex"
			flexDirection="column"
			alignItems="center"
			justifyContent="center"
			py="64"
			px="32"
			gap="24"
			style={{ minHeight: '500px' }}
		>
			<Box display="flex" flexDirection="column" alignItems="center" gap="12">
				<Text fontSize="xl" style={{ fontWeight: 500, textAlign: 'center' }}>
					Add Related
				</Text>
				<Text color="fg.secondary" fontSize="sm" style={{ textAlign: 'center', maxWidth: '560px' }}>
					Add tasks that support this task or link any related activities.
				</Text>
			</Box>

			<Button appearance="primary" size="md">
				<Box display="flex" alignItems="center" gap="8">
					<IconPlus size={16} />
					Add Related
				</Box>
			</Button>

			<Box
				display="flex"
				flexDirection="column"
				alignItems="center"
				justifyContent="center"
				mt="24"
				style={{ minHeight: '200px' }}
			>
				<Text color="fg.tertiary" fontSize="sm">
					No related tasks yet
				</Text>
			</Box>
		</Box>
	);
}

function FinancialsTabContent() {
	return (
		<Box
			display="flex"
			flexDirection="column"
			py="32"
			px="32"
			gap="24"
		>
			<Box
				display="flex"
				gap="12"
				rounded="md"
				p="16"
				style={{ alignItems: 'flex-start', backgroundColor: 'var(--ax-colors-bg-information-light)' }}
			>
				<IconInfoCircle size={20} stroke={1.5} style={{ color: 'var(--ax-colors-fg-information-strong)', marginTop: '2px', flexShrink: 0 }} />
				<Text fontSize="sm" color="fg.default">
					Financial data is only available for Tasks with a Campaign
				</Text>
			</Box>
		</Box>
	);
}

function HistoryTabContent() {
	const historyEntries = [
		{ time: '04:28 PM', user: 'Hsiao-Pei Chien', action: 'updated the article AI conten' },
		{ time: '04:22 PM', user: 'Hsiao-Pei Chien', action: 'added publishing channel [fb] 50 published page' },
		{ time: '04:22 PM', user: 'Hsiao-Pei Chien', action: 'set article as primary I want this to be published' },
		{ time: '04:22 PM', user: 'Hsiao-Pei Chien', action: 'removed publishing channel [fb] NC CMS', strikethrough: true },
		{ time: '04:21 PM', user: 'Hsiao-Pei Chien', action: 'added publishing channel [fb] NC CMS' },
		{ time: '04:21 PM', user: 'Hsiao-Pei Chien', action: 'added a featured image to the article AI content' },
		{ time: '04:21 PM', user: 'Hsiao-Pei Chien', action: 'added an image [thumbnail] Image' },
		{ time: '04:19 PM', user: 'Hsiao-Pei Chien', action: 'added an article I want this' },
		{ time: '04:13 PM', user: 'Hsiao-Pei Chien', action: 'added an article A' },
		{ time: '04:10 PM', user: 'Hsiao-Pei Chien', action: 'created the task Article post' },
	];

	return (
		<Box display="flex" flexDirection="column" gap="24" py="24" px="32" style={{ maxWidth: '780px' }}>
			<Text fontSize="sm" style={{ fontWeight: 600 }}>
				22 May, 2023
			</Text>

			<Box display="flex" flexDirection="column" gap="16">
				{historyEntries.map((entry, idx) => (
					<Box key={idx} display="flex" style={{ alignItems: 'flex-start' }} gap="16">
						<Text fontSize="xs" color="fg.secondary" style={{ minWidth: '80px', flexShrink: 0 }}>
							{entry.time}
						</Text>
						<Avatar size="sm" initials="HC" style={{ flexShrink: 0 }} />
						<Text
							fontSize="sm"
							color="fg.default"
							style={{
								textDecoration: entry.strikethrough ? 'line-through' : 'none',
								opacity: entry.strikethrough ? 0.6 : 1,
							}}
						>
							<span style={{ fontWeight: 600 }}>{entry.user}</span> {entry.action}
						</Text>
					</Box>
				))}
			</Box>
		</Box>
	);
}

function CommentsContent() {
	return (
		<Box display="flex" flexDirection="column" gap="16" style={{ minHeight: '100%' }}>
			<Box
				as="textarea"
				placeholder="Use @ to mention your teammates or post an update ..."
				style={{
					width: '100%',
					padding: '12px',
					borderRadius: '6px',
					border: '1px solid var(--ax-colors-border-default)',
					fontSize: '14px',
					fontFamily: 'inherit',
					color: 'var(--ax-colors-fg-default)',
					backgroundColor: 'var(--ax-colors-bg-page)',
					resize: 'none',
					minHeight: '100px',
				}}
			/>
			<Box
				display="flex"
				flexDirection="column"
				alignItems="center"
				justifyContent="center"
				style={{ flex: 1, minHeight: '150px' }}
			>
				<Text color="fg.secondary" fontSize="sm">
					No comment found.
				</Text>
			</Box>
		</Box>
	);
}

function AttachmentsContent() {
	return (
		<Box display="flex" flexDirection="column" gap="16" alignItems="center" justifyContent="center" style={{ minHeight: '200px' }}>
			<Box
				display="flex"
				alignItems="center"
				justifyContent="center"
				rounded="full"
				style={{
					width: '64px',
					height: '64px',
					border: '2px dashed var(--ax-colors-border-default)',
					cursor: 'pointer',
					backgroundColor: 'var(--ax-colors-bg-secondary)',
				}}
			>
				<IconPlus size={24} color="var(--ax-colors-fg-tertiary)" />
			</Box>
			<Text color="fg.secondary" fontSize="sm">
				No attachments
			</Text>
		</Box>
	);
}
