"use client";

import {
	Box,
	Button,
	Badge,
	Tabs,
	TabsList,
	TabsTrigger,
	TabsContent,
} from "@optiaxiom/react";
import {Text} from "@/app/components/Text";
import {
	IconChevronRight,
	IconEye,
	IconUsers,
	IconDots,
	IconChevronDown,
	IconLock,
	IconUserPlus,
	IconCalendar,
	IconCircle,
	IconCircleCheck,
} from "@tabler/icons-react";
import {useState} from "react";

export default function TaskDetailPage() {
	const [activeTab, setActiveTab] = useState("brief");
	const [activeWorkflowTab, setActiveWorkflowTab] = useState("workflow");

	return (
		<Box className="h-full flex flex-col">
			{/* Header */}
			<Box
				borderB="1"
				borderColor="border.tertiary"
				bg="bg.default"
				px="24"
				py="16"
			>
				{/* Breadcrumb */}
				<Box display="flex" alignItems="center" gap="8" mb="12">
					<Text fontSize="sm" color="fg.secondary">Label</Text>
					<Text fontSize="sm" color="fg.tertiary">/</Text>
					<Text fontSize="sm" color="fg.secondary">Ca...</Text>
					<Text fontSize="sm" color="fg.tertiary">/</Text>
					<Text fontSize="sm" color="fg.secondary">TSK...</Text>
				</Box>

				{/* Title Row */}
				<Box display="flex" alignItems="center" justifyContent="space-between">
					<Text fontSize="2xl" fontWeight="600" color="fg.default">
						US Marketing Launch 2026
					</Text>
					<Box display="flex" alignItems="center" gap="12">
						<Box display="flex" alignItems="center" gap="6">
							<IconUsers size={18} color="#66708C" />
							<Text fontSize="sm" color="fg.tertiary">8</Text>
						</Box>
						<Box display="flex" alignItems="center" gap="6">
							<IconEye size={18} color="#66708C" />
							<Text fontSize="sm" color="fg.tertiary">8</Text>
						</Box>
						<Button appearance="default">Mark Complete</Button>
						<Button appearance="subtle" icon={<IconDots size={20} />} aria-label="More options" />
					</Box>
				</Box>
			</Box>

			{/* Tabs Navigation */}
			<Box
				borderB="1"
				borderColor="border.tertiary"
				bg="bg.default"
				px="24"
			>
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

			{/* Main Content */}
			<Box flex="1" overflow="hidden" bg="bg.page" display="flex">
				{/* Left Content Area */}
				<Box flex="1" p="32" overflow="auto">
					<Tabs value={activeTab}>
						<TabsContent value="brief">
							<Box
								bg="bg.default"
								display="flex"
								flexDirection="column"
								alignItems="center"
								justifyContent="center"
								p="48"
								style={{minHeight: '500px', borderRadius: '6px'}}
							>
								<Text fontSize="xl" fontWeight="600" color="fg.default" mb="8">
									Add a Creative Brief
								</Text>
								<Text fontSize="sm" color="fg.tertiary" mb="24" style={{textAlign: 'center'}}>
									Build your task strategy here, i.e. Key objectives, Audiences, Pillars
								</Text>
								<Box display="flex" alignItems="center" gap="12" mb="24">
									<Button
										appearance="default"
										size="lg"
										style={{
											borderRadius: '6px',
											height: '52px',
											paddingLeft: '20px',
											paddingRight: '20px',
											display: 'flex',
											alignItems: 'center',
											gap: '8px',
											whiteSpace: 'nowrap',
										}}
									>
										Select Brief
										<IconChevronDown size={16} />
									</Button>
									<Text color="fg.tertiary" fontSize="md">or</Text>
									<Button
										appearance="default"
										size="lg"
										style={{
											borderRadius: '6px',
											height: '52px',
											paddingLeft: '20px',
											paddingRight: '20px',
										}}
									>
										Write Brief
									</Button>
								</Box>
								<Box
									display="flex"
									alignItems="center"
									justifyContent="space-between"
									w="full"
									style={{
										maxWidth: '544px',
										height: '52px',
										borderRadius: '6px',
										padding: '12px 16px',
										background: 'linear-gradient(90deg, rgba(99, 102, 241, 0.08) 0%, rgba(168, 85, 247, 0.08) 100%)',
									}}
								>
									<Box display="flex" alignItems="center" gap="12">
										<Box
											style={{
												width: 24,
												height: 24,
												borderRadius: '50%',
												background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
												flexShrink: 0,
											}}
										/>
										<Text fontSize="sm" color="fg.default">
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
							</Box>
						</TabsContent>
						<TabsContent value="content">
							<Text>Content</Text>
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

				{/* Right Sidebar - Workflow */}
				<Box
					style={{width: '400px', flexShrink: 0}}
					bg="bg.default"
					borderL="1"
					borderColor="border.tertiary"
					display="flex"
					flexDirection="column"
				>
					{/* Sidebar Tabs */}
					<Box px="20" py="16" borderB="1" borderColor="border.tertiary">
						<Box display="flex" alignItems="center" justifyContent="space-between">
							<Tabs value={activeWorkflowTab} onValueChange={setActiveWorkflowTab}>
								<TabsList>
									<TabsTrigger value="workflow">Workflow</TabsTrigger>
									<TabsTrigger value="comments">Comments</TabsTrigger>
									<TabsTrigger value="attachments">Attachments</TabsTrigger>
								</TabsList>
							</Tabs>
							<Button appearance="subtle" icon={<IconChevronRight size={16} />} aria-label="Collapse sidebar" />
						</Box>
					</Box>

					{/* Sidebar Content */}
					<Box flex="1" overflow="auto" p="20">
						<Tabs value={activeWorkflowTab}>
							<TabsContent value="workflow">
								{/* Status and Dates */}
								<Box display="flex" flexWrap="wrap" gap="8" mb="20" pb="20" borderB="1" borderColor="border.tertiary">
									<Badge intent="information">In Progress</Badge>
									<Box display="flex" alignItems="center" gap="6" px="10" py="4" bg="bg.secondary" style={{borderRadius: '6px', border: '1px solid var(--ax-colors-border-secondary)'}}>
										<IconCalendar size={14} color="#66708C" />
										<Text fontSize="sm" color="fg.default">Started • May 11</Text>
									</Box>
									<Box display="flex" alignItems="center" gap="6" px="10" py="4" bg="bg.secondary" style={{borderRadius: '6px', border: '1px solid var(--ax-colors-border-secondary)'}}>
										<IconCalendar size={14} color="#66708C" />
										<Text fontSize="sm" color="fg.default">Due • Jun 28</Text>
									</Box>
								</Box>

								<Box mb="20">
									<Button
										appearance="default"
										style={{
											width: '100%',
											justifyContent: 'space-between',
											display: 'flex',
											alignItems: 'center',
											whiteSpace: 'nowrap',
										}}
									>
										<Text fontSize="sm" color="fg.default">Select Workflow</Text>
										<IconChevronDown size={16} />
									</Button>
									<Box display="flex" justifyContent="flex-end" mt="12">
										<Button appearance="subtle" icon={<IconDots size={18} />} aria-label="Workflow options" />
									</Box>
								</Box>

								{/* Workflow Steps */}
								<Box display="flex" flexDirection="column">
									<Box
										display="flex"
										alignItems="center"
										gap="8"
										py="8"
										px="8"
										style={{cursor: 'pointer'}}
										className="hover:bg-[var(--ax-colors-bg-default-hovered)] rounded-md"
									>
										<IconCircle size={16} color="#66708C" style={{flexShrink: 0}} />
										<Button
											appearance="subtle"
											size="sm"
											icon={<IconChevronRight size={14} />}
											aria-label="Expand step"
											style={{padding: '4px', minWidth: 'auto', width: '24px', height: '24px'}}
										/>
										<Text fontSize="sm" color="fg.default" flex="1">
											1. Enter a step name - E.g. Rough draft
										</Text>
										<Button appearance="subtle" size="sm" icon={<IconLock size={14} />} aria-label="Lock step" style={{padding: '4px', minWidth: 'auto', width: '24px', height: '24px'}} />
										<Button appearance="subtle" size="sm" icon={<IconUserPlus size={14} />} aria-label="Add user to step" style={{padding: '4px', minWidth: 'auto', width: '24px', height: '24px'}} />
									</Box>

									<Box borderB="1" borderColor="border.tertiary" mx="8" />

									<Box
										display="flex"
										alignItems="center"
										gap="8"
										py="8"
										px="8"
										style={{cursor: 'pointer'}}
										className="hover:bg-[var(--ax-colors-bg-default-hovered)] rounded-md"
									>
										<IconCircle size={16} color="#66708C" style={{flexShrink: 0}} />
										<Button
											appearance="subtle"
											size="sm"
											icon={<IconChevronRight size={14} />}
											aria-label="Expand step"
											style={{padding: '4px', minWidth: 'auto', width: '24px', height: '24px'}}
										/>
										<Text fontSize="sm" color="fg.default" flex="1">
											2. Enter a step name - E.g. Rough design
										</Text>
										<Button appearance="subtle" size="sm" icon={<IconLock size={14} />} aria-label="Lock step" style={{padding: '4px', minWidth: 'auto', width: '24px', height: '24px'}} />
										<Button appearance="subtle" size="sm" icon={<IconUserPlus size={14} />} aria-label="Add user to step" style={{padding: '4px', minWidth: 'auto', width: '24px', height: '24px'}} />
									</Box>

									<Button appearance="subtle" size="sm" style={{justifyContent: 'flex-start'}} mt="12" mx="8">
										+ Add Step
									</Button>
								</Box>
							</TabsContent>
							<TabsContent value="comments">
								<Text>Comments</Text>
							</TabsContent>
							<TabsContent value="attachments">
								<Text>Attachments</Text>
							</TabsContent>
						</Tabs>
					</Box>
				</Box>
			</Box>
		</Box>
	);
}
