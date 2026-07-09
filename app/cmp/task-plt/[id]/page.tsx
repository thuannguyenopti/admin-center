"use client";

import {useParams} from "next/navigation";
import {Box, Tabs, TabsList, TabsTrigger, TabsContent, Badge} from "@optiaxiom/react";
import {Text} from "@/app/components/Text";
import {Button} from "@/app/components/Button";
import {
	IconFileLines,
	IconPaperPlaneTop,
	IconCheck,
	IconEllipsisSolid,
} from "@/app/lib/axiom-icons";
import {useState} from "react";

const ARTIFACTS = [
	{id: "1", name: "Summer Sale Email Draft.docx", updated: "May 11"},
	{id: "2", name: "Campaign Brief v2.pdf", updated: "May 10"},
	{id: "3", name: "Hero Banner 1200x628.png", updated: "May 10"},
	{id: "4", name: "Social Copy — Variants.docx", updated: "May 9"},
	{id: "5", name: "Audience Segment Export.csv", updated: "May 8"},
];

const HISTORY = [
	{id: "h1", actor: "Opal WF Agent", action: "Submitted for approval", time: "Today, 10:42 AM"},
	{
		id: "h2",
		actor: "Sarah Chen",
		action: "Added Campaign Brief v2.pdf",
		time: "Yesterday, 3:15 PM",
	},
	{
		id: "h3",
		actor: "Opal WF Agent",
		action: "Generated Hero Banner variants",
		time: "Yesterday, 2:01 PM",
	},
	{
		id: "h4",
		actor: "James Park",
		action: "Started workflow: Summer Campaign",
		time: "May 10, 9:00 AM",
	},
];

const STEPS = [
	{id: "s1", label: "Step 1 — Brief Ingestion", done: true, active: false},
	{id: "s2", label: "Step 2 — Content Generation", done: true, active: false},
	{id: "s3", label: "Step 3 — Approval", done: false, active: true},
];

const MOCK_COMMENTS = [
	{
		id: "c1",
		author: "Sarah Chen",
		body: "Please make sure the subject line is under 50 chars.",
		time: "10:38 AM",
	},
	{
		id: "c2",
		author: "James Park",
		body: "Looks good to me — just needs final approval.",
		time: "10:40 AM",
	},
];

function ArtifactRow({name, updated}: {name: string; updated: string}) {
	return (
		<Box
			display="flex"
			alignItems="center"
			gap="12"
			py="10"
			style={{borderBottom: "1px solid var(--ax-colors-border-tertiary)"}}
		>
			<IconFileLines size={16} color="var(--ax-colors-fg-tertiary)" style={{flexShrink: 0}} />
			<Box style={{flex: 1, minWidth: 0}}>
				<Text
					style={{
						fontSize: 14,
						overflow: "hidden",
						textOverflow: "ellipsis",
						whiteSpace: "nowrap",
					}}
				>
					{name}
				</Text>
			</Box>
			<Text color="fg.tertiary" style={{fontSize: 12, flexShrink: 0}}>
				{updated}
			</Text>
		</Box>
	);
}

function HistoryRow({actor, action, time}: {actor: string; action: string; time: string}) {
	return (
		<Box
			display="flex"
			flexDirection="column"
			gap="2"
			py="10"
			style={{borderBottom: "1px solid var(--ax-colors-border-tertiary)"}}
		>
			<Box display="flex" justifyContent="space-between" alignItems="center">
				<Text fontWeight="500" style={{fontSize: 13}}>
					{actor}
				</Text>
				<Text color="fg.tertiary" style={{fontSize: 12}}>
					{time}
				</Text>
			</Box>
			<Text color="fg.secondary" style={{fontSize: 13}}>
				{action}
			</Text>
		</Box>
	);
}

export default function TaskDetailPagePLT() {
	const params = useParams();
	const _taskId = params.id as string;
	const [comment, setComment] = useState("");
	const [comments, setComments] = useState(MOCK_COMMENTS);

	const handleSendComment = () => {
		if (!comment.trim()) return;
		setComments((prev) => [
			...prev,
			{id: `c${Date.now()}`, author: "Pei Chien", body: comment, time: "Just now"},
		]);
		setComment("");
	};

	return (
		<Box display="flex" gap="24" style={{height: "100%", minHeight: 0}}>
			<Box style={{flex: 1, minWidth: 0}}>
				<Tabs defaultValue="content">
					<TabsList>
						<TabsTrigger value="content">Content</TabsTrigger>
						<TabsTrigger value="history">History</TabsTrigger>
					</TabsList>

					<TabsContent value="content">
						<Box pt="8">
							{ARTIFACTS.map((a) => (
								<ArtifactRow key={a.id} name={a.name} updated={a.updated} />
							))}
						</Box>
					</TabsContent>

					<TabsContent value="history">
						<Box pt="8">
							{HISTORY.map((h) => (
								<HistoryRow
									key={h.id}
									actor={h.actor}
									action={h.action}
									time={h.time}
								/>
							))}
						</Box>
					</TabsContent>
				</Tabs>
			</Box>

			<Box display="flex" flexDirection="column" gap="16" style={{width: 300, flexShrink: 0}}>
				<Box
					bg="bg.default"
					rounded="md"
					border="1"
					borderColor="border.default"
					p="16"
					display="flex"
					flexDirection="column"
					gap="12"
				>
					<Box display="flex" justifyContent="space-between" alignItems="center">
						<Text fontWeight="600" style={{fontSize: 14}}>
							Workflow
						</Text>
						<Badge
							intent="information"
							style={{fontSize: 11, height: 20, padding: "0 8px"}}
						>
							In Progress
						</Badge>
					</Box>

					<Box display="flex" flexDirection="column" gap="4">
						<Text
							color="fg.tertiary"
							style={{
								fontSize: 11,
								fontWeight: 600,
								textTransform: "uppercase",
								letterSpacing: "0.06em",
							}}
						>
							Steps
						</Text>
						{STEPS.map((s) => (
							<Box
								key={s.id}
								display="flex"
								alignItems="center"
								gap="8"
								py="6"
								style={{
									borderLeft: s.active
										? "2px solid var(--ax-colors-fg-default)"
										: "2px solid transparent",
									paddingLeft: 8,
								}}
							>
								<Box
									display="flex"
									alignItems="center"
									justifyContent="center"
									rounded="full"
									style={{
										width: 18,
										height: 18,
										flexShrink: 0,
										background: s.done
											? "var(--ax-colors-bg-success-strong)"
											: s.active
												? "var(--ax-colors-bg-default-pressed)"
												: "var(--ax-colors-bg-tertiary)",
										border:
											s.active && !s.done
												? "1.5px solid var(--ax-colors-border-default)"
												: "none",
									}}
								>
									{s.done && <IconCheck size={10} color="white" />}
								</Box>
								<Text
									style={{fontSize: 13}}
									color={
										s.active
											? "fg.default"
											: s.done
												? "fg.secondary"
												: "fg.tertiary"
									}
									fontWeight={s.active ? "500" : "400"}
								>
									{s.label}
								</Text>
							</Box>
						))}
					</Box>

					<Button appearance="default" size="sm" style={{width: "100%"}}>
						Mark Complete
					</Button>
				</Box>

				<Box
					bg="bg.default"
					rounded="md"
					border="1"
					borderColor="border.default"
					p="16"
					display="flex"
					flexDirection="column"
					gap="12"
				>
					<Box display="flex" justifyContent="space-between" alignItems="center">
						<Text fontWeight="600" style={{fontSize: 14}}>
							WF Comments
						</Text>
						<Button
							appearance="subtle"
							size="sm"
							icon={<IconEllipsisSolid size={14} />}
							aria-label="Options"
						/>
					</Box>

					<Box display="flex" flexDirection="column" gap="12">
						{comments.map((c) => (
							<Box key={c.id} display="flex" flexDirection="column" gap="2">
								<Box display="flex" alignItems="center" gap="6">
									<Box
										rounded="full"
										style={{
											width: 20,
											height: 20,
											flexShrink: 0,
											background: "var(--ax-colors-bg-secondary)",
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
										}}
									>
										<Text
											style={{
												fontSize: 10,
												fontWeight: 600,
												color: "var(--ax-colors-fg-default)",
											}}
										>
											{c.author.charAt(0)}
										</Text>
									</Box>
									<Text fontWeight="500" style={{fontSize: 12}}>
										{c.author}
									</Text>
									<Text color="fg.tertiary" style={{fontSize: 11}}>
										{c.time}
									</Text>
								</Box>
								<Text color="fg.secondary" style={{fontSize: 13, paddingLeft: 26}}>
									{c.body}
								</Text>
							</Box>
						))}
					</Box>

					<Box
						display="flex"
						alignItems="center"
						gap="8"
						rounded="md"
						border="1"
						borderColor="border.default"
						px="12"
						py="8"
					>
						<input
							value={comment}
							onChange={(e) => setComment(e.target.value)}
							onKeyDown={(e) => e.key === "Enter" && handleSendComment()}
							placeholder="Add a comment..."
							style={{
								flex: 1,
								border: "none",
								outline: "none",
								background: "transparent",
								fontSize: 13,
								color: "var(--ax-colors-fg-default)",
							}}
						/>
						<button
							onClick={handleSendComment}
							style={{
								background: "none",
								border: "none",
								cursor: "pointer",
								display: "flex",
								padding: 0,
							}}
							aria-label="Send"
						>
							<IconPaperPlaneTop size={14} color="var(--ax-colors-fg-tertiary)" />
						</button>
					</Box>
				</Box>
			</Box>
		</Box>
	);
}
