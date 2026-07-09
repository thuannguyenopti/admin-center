"use client";

import React, {useState, useEffect} from "react";
import {
	Box,
	Text,
	Badge,
	Avatar,
	AvatarGroup,
	Button,
	Tooltip,
	ToggleButton,
} from "@optiaxiom/react";
import {
	IconSparkles,
	IconPlus,
	IconXmark,
	IconComment,
	IconEllipsisSolid,
	IconSearch,
	IconFileLines,
	IconAt,
	IconComments,
	IconThumbtack,
	IconBell,
	IconChevronLeft,
	IconChevronRight,
	IconPen,
	IconBold,
	IconItalic,
	IconUnderline,
	IconStrikethrough,
	IconLink,
	IconListOl,
	IconListUl,
	IconQuoteRight,
	IconCode,
	IconPaperclip,
} from "@optiaxiom/icons";

// ── Helpers ────────────────────────────────────────────────────────────────────

function DemoShell({children, label}: {children: React.ReactNode; label?: string}) {
	return (
		<Box
			rounded="lg"
			display="flex"
			flexDirection="column"
			style={{
				alignItems: "flex-start",
				background: "var(--ax-colors-bg-default)",
				padding: "16px",
				border: "1px solid var(--ax-colors-border-secondary)",
				position: "relative",
				overflow: "hidden",
			}}
		>
			{label && (
				<Text
					fontSize="sm"
					color="fg.tertiary"
					style={{marginBottom: 10, display: "block", fontStyle: "italic"}}
				>
					{label}
				</Text>
			)}
			{children}
		</Box>
	);
}

function FeatureCard({
	name,
	prd,
	description,
	trigger,
	notes,
	demo,
	link,
}: {
	name: string;
	prd?: string;
	description: string;
	trigger: string;
	notes?: string;
	demo?: React.ReactNode;
	link?: string;
}) {
	return (
		<Box
			display="flex"
			flexDirection="column"
			gap="12"
			rounded="xl"
			style={{
				border: "1.5px solid var(--ax-colors-border-default)",
				padding: "16px 20px",
				background: "var(--ax-colors-bg-default)",
			}}
		>
			<Box display="flex" alignItems="center" gap="8">
				<Text fontWeight="600" fontSize="md" color="fg.default">
					{name}
				</Text>
				{prd && <Badge intent="neutral">{prd}</Badge>}
				<Box style={{marginLeft: "auto"}}>
					<Badge intent="success">Built</Badge>
				</Box>
			</Box>
			{demo && demo}
			<Text fontSize="sm" color="fg.default" style={{lineHeight: 1.6}}>
				{description}
			</Text>
			<Box
				rounded="md"
				style={{background: "var(--ax-colors-bg-secondary)", padding: "8px 12px"}}
			>
				<Text fontSize="sm" color="fg.secondary">
					<strong>Trigger: </strong>
					{trigger}
				</Text>
			</Box>
			{notes && (
				<Text fontSize="sm" color="fg.tertiary" style={{fontStyle: "italic"}}>
					{notes}
				</Text>
			)}
			{link && (
				<Box>
					<a
						href={link}
						target="_blank"
						rel="noopener noreferrer"
						style={{
							fontSize: 13,
							color: "var(--ax-colors-fg-default)",
							fontWeight: 500,
							textDecoration: "none",
						}}
					>
						Try it in /opal/messages →
					</a>
				</Box>
			)}
		</Box>
	);
}

function CategorySection({title, children}: {title: string; children: React.ReactNode}) {
	return (
		<Box display="flex" flexDirection="column" gap="16">
			<Box
				style={{
					borderBottom: "2px solid var(--ax-colors-border-default)",
					paddingBottom: 8,
				}}
			>
				<Text fontWeight="600" fontSize="lg" color="fg.default">
					{title}
				</Text>
			</Box>
			<Box display="grid" style={{gridTemplateColumns: "repeat(2, 1fr)", gap: 12}}>
				{children}
			</Box>
		</Box>
	);
}

// ── Demos ──────────────────────────────────────────────────────────────────────

function NewConversationDemo() {
	const [query, setQuery] = useState("");
	const contacts = [
		{
			id: "js",
			name: "Jane Smith",
			avatar: "https://i.pravatar.cc/150?img=47",
			role: "Sr. Content Strategist",
		},
		{
			id: "ms",
			name: "Marcus Santos",
			avatar: "https://i.pravatar.cc/150?img=68",
			role: "Social Media Manager",
		},
		{
			id: "pr",
			name: "Priya Rajan",
			avatar: "https://i.pravatar.cc/150?img=44",
			role: "UX Researcher",
		},
		{id: "bubs", name: "Bubs", avatar: "/vau-bubs.svg", role: "Content Drafting", isVAU: true},
	].filter((c) => !query.trim() || c.name.toLowerCase().includes(query.toLowerCase()));
	return (
		<DemoShell label="Main chat area becomes a full-screen composer">
			<Box
				rounded="lg"
				style={{
					background: "var(--ax-colors-bg-default)",
					border: "1px solid var(--ax-colors-border-secondary)",
					overflow: "hidden",
					width: "100%",
				}}
			>
				<Box
					display="flex"
					alignItems="center"
					px="12"
					style={{
						height: 44,
						borderBottom: "1px solid var(--ax-colors-border-secondary)",
					}}
				>
					<Text fontWeight="600" fontSize="md" color="fg.default">
						New message
					</Text>
				</Box>
				<Box
					display="flex"
					alignItems="center"
					px="12"
					gap="6"
					style={{
						height: 36,
						borderBottom: "1px solid var(--ax-colors-border-secondary)",
					}}
				>
					<Text fontSize="sm" color="fg.tertiary" style={{fontWeight: 500}}>
						To:
					</Text>
					<input
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder="#channel or @name"
						style={{
							flex: 1,
							border: "none",
							outline: "none",
							background: "transparent",
							fontFamily: "inherit",
							fontSize: 13,
						}}
					/>
				</Box>
				<Box>
					<Box px="12" py="6">
						<Text
							fontSize="sm"
							color="fg.tertiary"
							style={{textTransform: "uppercase", letterSpacing: "0.05em"}}
						>
							Recent
						</Text>
					</Box>
					{contacts.map((c) => (
						<Box
							key={c.id}
							display="flex"
							alignItems="center"
							gap="10"
							px="12"
							py="6"
							style={{cursor: "pointer"}}
							onMouseEnter={(e) =>
								(e.currentTarget.style.background = "var(--ax-colors-bg-secondary)")
							}
							onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
						>
							<Avatar name={c.name} src={c.avatar} size="sm" />
							<Box>
								<Box display="flex" alignItems="center" gap="4">
									<Text fontSize="sm" fontWeight="500" color="fg.default">
										{c.name}
									</Text>
									{c.isVAU && (
										<IconSparkles
											size={12}
											style={{color: "var(--ax-colors-fg-information)"}}
										/>
									)}
								</Box>
								<Text fontSize="sm" color="fg.tertiary">
									{c.role}
								</Text>
							</Box>
						</Box>
					))}
				</Box>
			</Box>
		</DemoShell>
	);
}

function CollapsedSidebarDemo() {
	const [collapsed, setCollapsed] = useState(false);
	const dms = [
		{name: "Bubs", avatar: "/vau-bubs.svg", unread: 2, active: true},
		{name: "Priya Rajan", avatar: "https://i.pravatar.cc/150?img=44", unread: 0, active: false},
		{name: "Jane Smith", avatar: "https://i.pravatar.cc/150?img=47", unread: 1, active: true},
	];
	return (
		<DemoShell label="Toggle the sidebar">
			<Box display="flex" gap="8" style={{marginBottom: 10}}>
				<Button
					size="sm"
					appearance={!collapsed ? "default" : "subtle"}
					onClick={() => setCollapsed(false)}
				>
					Expanded
				</Button>
				<Button
					size="sm"
					appearance={collapsed ? "default" : "subtle"}
					onClick={() => setCollapsed(true)}
				>
					Collapsed
				</Button>
			</Box>
			<Box
				rounded="lg"
				style={{
					border: "1px solid var(--ax-colors-border-secondary)",
					overflow: "hidden",
					width: collapsed ? 56 : 240,
					transition: "width 0.2s",
					background: "var(--ax-colors-bg-default)",
				}}
			>
				{collapsed ? (
					<Box display="flex" flexDirection="column" alignItems="center" gap="8" py="12">
						<Button
							size="sm"
							appearance="subtle"
							aria-label="Expand sidebar"
							icon={<IconChevronRight size={14} />}
							style={{width: 32, height: 32, padding: 0}}
							onClick={() => setCollapsed(false)}
						/>
						{dms.map((dm) => (
							<Box
								key={dm.name}
								style={{position: "relative", display: "inline-flex"}}
							>
								<Avatar name={dm.name} src={dm.avatar} size="sm" />
								{dm.unread > 0 && (
									<Box
										rounded="full"
										style={{
											position: "absolute",
											top: -2,
											right: -2,
											width: 14,
											height: 14,
											background: "var(--ax-colors-fg-error)",
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
										}}
									>
										<Text
											style={{fontSize: 9, color: "white", fontWeight: 700}}
										>
											{dm.unread}
										</Text>
									</Box>
								)}
							</Box>
						))}
					</Box>
				) : (
					<Box>
						<Box
							display="flex"
							alignItems="center"
							px="12"
							gap="8"
							style={{
								height: 48,
								borderBottom: "1px solid var(--ax-colors-border-secondary)",
							}}
						>
							<Text
								fontWeight="600"
								fontSize="sm"
								color="fg.default"
								style={{flex: 1}}
							>
								Opal Workspace
							</Text>
							<Button
								size="sm"
								appearance="subtle"
								aria-label="Collapse sidebar"
								icon={<IconChevronLeft size={14} />}
								style={{width: 26, height: 26, padding: 0}}
								onClick={() => setCollapsed(true)}
							/>
						</Box>
						{dms.map((dm) => (
							<Box
								key={dm.name}
								display="flex"
								alignItems="center"
								gap="10"
								px="12"
								py="6"
								style={{cursor: "pointer"}}
								onMouseEnter={(e) =>
									(e.currentTarget.style.background =
										"var(--ax-colors-bg-secondary)")
								}
								onMouseLeave={(e) =>
									(e.currentTarget.style.background = "transparent")
								}
							>
								<Avatar name={dm.name} src={dm.avatar} size="sm" />
								<Text
									fontSize="sm"
									fontWeight={dm.unread ? "600" : "400"}
									color="fg.default"
									style={{flex: 1}}
								>
									{dm.name}
								</Text>
								{dm.active && (
									<Box
										rounded="full"
										style={{width: 8, height: 8, background: "#22c55e"}}
									/>
								)}
							</Box>
						))}
					</Box>
				)}
			</Box>
		</DemoShell>
	);
}

function QuickViewsDemo() {
	const [active, setActive] = useState<string | null>(null);
	const views = [
		{id: "unreads", icon: <IconBell size={14} />, label: "Unreads"},
		{id: "mentions", icon: <IconAt size={14} />, label: "Mentions"},
	];
	const content: Record<string, {name: string; text: string}[]> = {
		unreads: [
			{name: "Bubs", text: "Q3 Content Strategy draft is ready for your review."},
			{
				name: "Jane Smith",
				text: "Would love to hear them! @Erika can we jump on a quick call?",
			},
		],
		mentions: [{name: "Marcus Santos", text: "@Erika can you review the brief before EOD?"}],
	};
	return (
		<DemoShell label="Click a quick view">
			<Box display="flex" flexDirection="column" gap="4" style={{width: "100%"}}>
				{views.map((v) => (
					<Box
						key={v.id}
						display="flex"
						alignItems="center"
						gap="10"
						px="8"
						py="6"
						rounded="md"
						onClick={() => setActive(active === v.id ? null : v.id)}
						style={{
							cursor: "pointer",
							background:
								active === v.id
									? "var(--ax-colors-bg-default-pressed)"
									: "transparent",
						}}
					>
						<Box style={{color: "var(--ax-colors-fg-tertiary)"}}>{v.icon}</Box>
						<Text fontSize="sm" color="fg.default">
							{v.label}
						</Text>
					</Box>
				))}
				{active && (
					<Box
						rounded="md"
						style={{
							marginTop: 8,
							border: "1px solid var(--ax-colors-border-secondary)",
							overflow: "hidden",
						}}
					>
						<Box
							px="10"
							py="6"
							style={{
								borderBottom: "1px solid var(--ax-colors-border-secondary)",
								background: "var(--ax-colors-bg-secondary)",
							}}
						>
							<Text fontSize="sm" fontWeight="600" color="fg.default">
								{views.find((v) => v.id === active)?.label}
							</Text>
						</Box>
						{content[active].map((item, i) => (
							<Box
								key={i}
								px="10"
								py="8"
								display="flex"
								flexDirection="column"
								gap="2"
								style={{
									borderBottom:
										i < content[active].length - 1
											? "1px solid var(--ax-colors-border-tertiary)"
											: "none",
									cursor: "pointer",
								}}
							>
								<Text fontSize="sm" fontWeight="600" color="fg.default">
									{item.name}
								</Text>
								<Text
									fontSize="sm"
									color="fg.tertiary"
									style={{
										overflow: "hidden",
										textOverflow: "ellipsis",
										whiteSpace: "nowrap",
									}}
								>
									{item.text}
								</Text>
							</Box>
						))}
					</Box>
				)}
			</Box>
		</DemoShell>
	);
}

function ConversationHeaderDemo() {
	const [active, setActive] = useState<string>("pr");
	const contacts = [
		{
			id: "pr",
			name: "Priya Rajan",
			avatar: "https://i.pravatar.cc/150?img=44",
			status: "var(--ax-colors-bg-success-default)",
		},
		{
			id: "bubs",
			name: "Bubs",
			avatar: "/vau-bubs.svg",
			status: "var(--ax-colors-bg-success-default)",
			isVAU: true,
		},
		{
			id: "bf",
			name: "Black Friday Campaign",
			avatar: "",
			emoji: "🛍️",
			members: "Jason, Patrick +2",
		},
	];
	const c = contacts.find((x) => x.id === active)!;
	return (
		<DemoShell label="Click a contact to see the header change">
			<Box display="flex" gap="6" style={{marginBottom: 10}}>
				{contacts.map((x) => (
					<Button
						key={x.id}
						size="sm"
						appearance={active === x.id ? "default" : "subtle"}
						onClick={() => setActive(x.id)}
					>
						{x.emoji ?? x.name.split(" ")[0]}
					</Button>
				))}
			</Box>
			<Box
				display="flex"
				alignItems="center"
				gap="10"
				px="12"
				rounded="lg"
				style={{
					height: 52,
					border: "1px solid var(--ax-colors-border-secondary)",
					background: "var(--ax-colors-bg-default)",
					width: "100%",
				}}
			>
				{c.emoji ? (
					<div
						style={{
							width: 32,
							height: 32,
							borderRadius: "50%",
							background: "var(--ax-colors-bg-secondary)",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							fontSize: 17,
						}}
					>
						{c.emoji}
					</div>
				) : (
					<Box style={{position: "relative", display: "inline-flex"}}>
						<Avatar name={c.name} src={c.avatar} size="md" />
						{(c as any).status && (
							<Box
								rounded="full"
								style={{
									position: "absolute",
									bottom: 0,
									right: 0,
									width: 10,
									height: 10,
									background: (c as any).status,
									border: "2px solid white",
								}}
							/>
						)}
					</Box>
				)}
				<Box display="flex" alignItems="center" gap="6">
					<Text fontWeight="600" fontSize="lg" color="fg.default">
						{c.name}
					</Text>
					{(c as any).isVAU && (
						<Badge intent="information" style={{flexShrink: 0}}>
							Virtual
						</Badge>
					)}
					{(c as any).members && (
						<Text fontSize="sm" color="fg.tertiary">
							{(c as any).members}
						</Text>
					)}
				</Box>
			</Box>
		</DemoShell>
	);
}

const SECTION_NAMES = ["Announcements", "Design Team", "Q4 Planning", "Brand Reviews"];

function SectionManagementDemo() {
	const nameIdx = React.useRef(0);
	const [sections, setSections] = useState(["Direct Messages", "Group Chats", SECTION_NAMES[0]]);
	const [hovered, setHovered] = useState<string | null>(null);
	const [typing, setTyping] = useState("");
	const [phase, setPhase] = useState<"idle" | "hovering" | "deleting" | "typing">("idle");

	useEffect(() => {
		if (phase !== "idle") return;
		const custom = sections.find((s) => !["Direct Messages", "Group Chats"].includes(s));
		if (!custom) return;
		const timers: ReturnType<typeof setTimeout>[] = [];
		timers.push(
			setTimeout(() => {
				setHovered(custom);
				setPhase("hovering");
			}, 900)
		);
		timers.push(
			setTimeout(() => {
				setSections(["Direct Messages", "Group Chats"]);
				setHovered(null);
				setPhase("deleting");
			}, 1900)
		);
		timers.push(
			setTimeout(() => {
				nameIdx.current = (nameIdx.current + 1) % SECTION_NAMES.length;
				const next = SECTION_NAMES[nameIdx.current];
				setPhase("typing");
				setTyping("");
				let i = 0;
				const iv = setInterval(() => {
					i++;
					setTyping(next.slice(0, i));
					if (i >= next.length) {
						clearInterval(iv);
						setTimeout(() => {
							setSections(["Direct Messages", "Group Chats", next]);
							setTyping("");
							setPhase("idle");
						}, 500);
					}
				}, 75);
			}, 700)
		);
		return () => timers.forEach(clearTimeout);
	}, [sections, phase]);

	return (
		<DemoShell label="Watch sections get deleted and retyped in a loop">
			{sections.map((s) => (
				<Box
					key={s}
					display="flex"
					alignItems="center"
					gap="8"
					px="8"
					py="6"
					rounded="md"
					style={{
						background:
							hovered === s
								? "var(--ax-colors-bg-default-hovered)"
								: "var(--ax-colors-bg-default)",
						marginBottom: 4,
						transition: "background 0.2s",
						width: "100%",
					}}
				>
					<Text fontSize="sm" fontWeight="500" color="fg.default" style={{flex: 1}}>
						{s}
					</Text>
					{hovered === s && !["Direct Messages", "Group Chats"].includes(s) && (
						<IconXmark size={12} style={{color: "var(--ax-colors-fg-tertiary)"}} />
					)}
				</Box>
			))}
			{phase === "typing" && (
				<Box
					display="flex"
					alignItems="center"
					gap="8"
					px="8"
					py="6"
					rounded="md"
					style={{
						background: "var(--ax-colors-bg-default)",
						marginBottom: 4,
						border: "1px solid var(--ax-colors-border-default)",
					}}
				>
					<Text fontSize="sm" fontWeight="500" color="fg.default" style={{flex: 1}}>
						{typing}
						<span
							style={{
								borderRight: "2px solid var(--ax-colors-fg-default)",
								marginLeft: 1,
							}}
						>
							​
						</span>
					</Text>
				</Box>
			)}
		</DemoShell>
	);
}

function UnreadSortingDemo() {
	const [items, setItems] = useState([
		{name: "Bubs", avatar: "/vau-bubs.svg", unread: 2, manual: false},
		{name: "Jane Smith", avatar: "https://i.pravatar.cc/150?img=47", unread: 0, manual: false},
		{
			name: "Marcus Santos",
			avatar: "https://i.pravatar.cc/150?img=68",
			unread: 0,
			manual: false,
		},
	]);
	const toggle = (name: string) =>
		setItems((prev) => prev.map((i) => (i.name === name ? {...i, manual: !i.manual} : i)));
	const sorted = [...items].sort(
		(a, b) => (b.unread || (b.manual ? 1 : 0)) - (a.unread || (a.manual ? 1 : 0))
	);
	return (
		<DemoShell label="Click a name to manually mark unread — it bolds and sorts to top">
			{sorted.map((dm) => (
				<Box
					key={dm.name}
					display="flex"
					alignItems="center"
					gap="10"
					px="8"
					py="6"
					rounded="md"
					onClick={() => toggle(dm.name)}
					style={{
						background: "var(--ax-colors-bg-default)",
						marginBottom: 4,
						cursor: "pointer",
					}}
				>
					<Avatar name={dm.name} src={dm.avatar} size="sm" />
					<Text
						fontSize="sm"
						fontWeight={dm.unread > 0 || dm.manual ? "600" : "400"}
						color="fg.default"
						style={{flex: 1}}
					>
						{dm.name}
					</Text>
					{(dm.unread > 0 || dm.manual) && (
						<Box
							rounded="full"
							style={{width: 8, height: 8, background: "#22c55e", flexShrink: 0}}
						/>
					)}
				</Box>
			))}
		</DemoShell>
	);
}

function HoverActionBarDemo() {
	const [hovered, setHovered] = useState<"mine" | "theirs" | null>(null);
	const [pinned, setPinned] = useState(false);

	const ActionBar = ({isOwn}: {isOwn: boolean}) => (
		<Box
			rounded="lg"
			style={{
				position: "absolute",
				top: 4,
				[isOwn ? "right" : "left"]: 0,
				display: "flex",
				alignItems: "center",
				gap: 1,
				background: "var(--ax-colors-bg-default)",
				border: "1px solid var(--ax-colors-border-secondary)",
				padding: "5px 7px",
				zIndex: 10,
			}}
		>
			{["👍", "❤️", "😂"].map((e) => (
				<span key={e} style={{cursor: "pointer", fontSize: 18, padding: "2px 4px"}}>
					{e}
				</span>
			))}
			<span
				style={{
					fontSize: 18,
					padding: "2px 4px",
					cursor: "pointer",
					color: "var(--ax-colors-fg-tertiary)",
				}}
			>
				😊
			</span>
			<Box
				style={{
					width: 1,
					height: 20,
					background: "var(--ax-colors-border-secondary)",
					margin: "0 3px",
				}}
			/>
			<Tooltip content="Reply in thread" delayDuration={300}>
				<Button
					size="sm"
					appearance="subtle"
					aria-label="Reply in thread"
					style={{width: 30, height: 30, padding: 0}}
					icon={<IconComment size={15} />}
				/>
			</Tooltip>
			<Tooltip content={pinned ? "Unpin message" : "Pin message"} delayDuration={300}>
				<ToggleButton
					size="sm"
					appearance="subtle"
					pressed={pinned}
					onPressedChange={() => setPinned((v) => !v)}
					aria-label={pinned ? "Unpin message" : "Pin message"}
					style={{width: 30, height: 30, padding: 0}}
					icon={<IconThumbtack size={15} />}
				/>
			</Tooltip>
			<Button
				size="sm"
				appearance="subtle"
				aria-label="More options"
				style={{width: 30, height: 30, padding: 0}}
				icon={<IconEllipsisSolid size={15} />}
			/>
		</Box>
	);

	return (
		<DemoShell label="Hover each bubble — ⋯ menu and pin differ for yours vs teammate's">
			{/* Teammate message */}
			<Box
				style={{position: "relative", paddingTop: 50, marginBottom: 16}}
				onMouseEnter={() => setHovered("theirs")}
				onMouseLeave={() => setHovered(null)}
			>
				{hovered === "theirs" && <ActionBar isOwn={false} />}
				<Box display="flex" alignItems="start" gap="8">
					<Avatar name="Priya" src="https://i.pravatar.cc/150?img=44" size="sm" />
					<Box style={{fontSize: 14, lineHeight: 1.6}}>
						<Text fontSize="sm" fontWeight="500">
							Priya Rajan
						</Text>
						<div>Can you review this by EOD?</div>
						<Text fontSize="sm" color="fg.tertiary" style={{marginTop: 2}}>
							⋯ menu: Mark unread · Copy text
						</Text>
					</Box>
				</Box>
			</Box>
			{/* Own message */}
			<Box
				style={{
					position: "relative",
					paddingTop: 50,
					display: "flex",
					flexDirection: "column",
					alignItems: "flex-end",
				}}
				onMouseEnter={() => setHovered("mine")}
				onMouseLeave={() => setHovered(null)}
			>
				{hovered === "mine" && <ActionBar isOwn={true} />}
				<Box
					rounded="lg"
					style={{
						background: "var(--ax-colors-bg-success-subtle)",
						padding: "8px 14px",
						fontSize: 14,
						display: "inline-block",
					}}
				>
					Love it! Opening it up now.
				</Box>
				<Text fontSize="sm" color="fg.tertiary" style={{marginTop: 2}}>
					⋯ menu: Edit · Delete · Mark unread · Copy text
				</Text>
			</Box>
		</DemoShell>
	);
}

function EditDeleteDemo() {
	const [state, setState] = useState<"normal" | "editing" | "deleted">("normal");
	const [text, setText] = useState("Great idea, let's do it!");
	return (
		<DemoShell label="Try editing or deleting">
			<Box style={{marginBottom: 8}}>
				{state === "deleted" ? (
					<em style={{color: "var(--ax-colors-fg-tertiary)", fontSize: 14}}>
						This message was deleted.
					</em>
				) : state === "editing" ? (
					<Box display="flex" flexDirection="column" gap="8">
						<textarea
							value={text}
							onChange={(e) => setText(e.target.value)}
							style={{
								width: "100%",
								border: "1px solid var(--ax-colors-border-default)",
								borderRadius: 6,
								padding: "6px 8px",
								fontFamily: "inherit",
								fontSize: 14,
								resize: "none",
								outline: "none",
								background: "var(--ax-colors-bg-default)",
								minHeight: 48,
							}}
						/>
						<Box display="flex" gap="6">
							<Button
								size="sm"
								appearance="default"
								onClick={() => setState("normal")}
							>
								Cancel
							</Button>
							<Button
								size="sm"
								appearance="primary"
								onClick={() => setState("normal")}
							>
								Save
							</Button>
						</Box>
					</Box>
				) : (
					<Box
						rounded="lg"
						style={{
							background: "var(--ax-colors-bg-success-subtle)",
							padding: "8px 14px",
							fontSize: 14,
							display: "inline-block",
						}}
					>
						{text}
					</Box>
				)}
			</Box>
			{state === "normal" && (
				<Box display="flex" gap="8">
					<Button size="sm" appearance="subtle" onClick={() => setState("editing")}>
						Edit
					</Button>
					<Button size="sm" appearance="subtle" onClick={() => setState("deleted")}>
						Delete
					</Button>
				</Box>
			)}
			{state === "deleted" && (
				<Button
					size="sm"
					appearance="subtle"
					onClick={() => {
						setState("normal");
						setText("Great idea, let's do it!");
					}}
				>
					Reset
				</Button>
			)}
		</DemoShell>
	);
}

function ReactionsDemo() {
	const [reactions, setReactions] = useState([
		{emoji: "👍", count: 4, mine: false},
		{emoji: "❤️", count: 2, mine: true},
	]);
	return (
		<DemoShell label="Click a reaction to toggle it; 😊 in the action bar opens the full emoji keyboard">
			<Box
				rounded="lg"
				style={{
					background: "var(--ax-colors-bg-success-subtle)",
					padding: "8px 14px",
					fontSize: 14,
					marginBottom: 12,
					display: "inline-block",
				}}
			>
				This looks amazing!
			</Box>
			<Box display="flex" gap="4" style={{flexWrap: "wrap"}}>
				{reactions.map((r) => (
					<Box
						key={r.emoji}
						onClick={() =>
							setReactions((p) =>
								p.map((x) =>
									x.emoji === r.emoji
										? {
												...x,
												count: x.mine ? x.count - 1 : x.count + 1,
												mine: !x.mine,
											}
										: x
								)
							)
						}
						rounded="full"
						style={{
							display: "inline-flex",
							alignItems: "center",
							gap: 4,
							padding: "3px 10px",
							cursor: "pointer",
							fontSize: 13,
							border: r.mine
								? "1.5px solid var(--ax-colors-border-default)"
								: "1px solid var(--ax-colors-border-secondary)",
							background: r.mine
								? "var(--ax-colors-bg-default-pressed)"
								: "var(--ax-colors-bg-default)",
						}}
					>
						<span>{r.emoji}</span>
						<span style={{fontSize: 11}}>{r.count}</span>
					</Box>
				))}
				<Box
					rounded="full"
					style={{
						display: "inline-flex",
						alignItems: "center",
						justifyContent: "center",
						width: 30,
						height: 26,
						cursor: "pointer",
						border: "1px solid var(--ax-colors-border-secondary)",
						background: "var(--ax-colors-bg-default)",
					}}
				>
					<span style={{fontSize: 14}}>😊</span>
				</Box>
			</Box>
		</DemoShell>
	);
}

function PinMessageDemo() {
	const [pinned, setPinned] = useState(false);
	return (
		<DemoShell label="Click the pin button to toggle">
			<Box style={{position: "relative", display: "inline-block"}}>
				<Box
					rounded="lg"
					style={{
						background: "var(--ax-colors-bg-success-subtle)",
						padding: "8px 14px",
						fontSize: 14,
						display: "inline-block",
						position: "relative",
					}}
				>
					This is the final approved copy.
					{pinned && (
						<Box
							rounded="sm"
							style={{
								position: "absolute",
								top: 4,
								right: 4,
								background: "rgba(0,0,0,0.08)",
								padding: "2px 4px",
								display: "flex",
								alignItems: "center",
								gap: 3,
							}}
						>
							<IconThumbtack
								size={11}
								style={{color: "var(--ax-colors-fg-secondary)"}}
							/>
						</Box>
					)}
				</Box>
			</Box>
			<Box display="flex" alignItems="center" gap="8" style={{marginTop: 10}}>
				<ToggleButton
					size="sm"
					appearance="subtle"
					pressed={pinned}
					onPressedChange={() => setPinned((v) => !v)}
					icon={<IconThumbtack size={14} />}
				>
					{pinned ? "Unpin" : "Pin"}
				</ToggleButton>
				{pinned && (
					<Text fontSize="sm" color="fg.tertiary">
						Appears in the Pins tab
					</Text>
				)}
			</Box>
		</DemoShell>
	);
}

function MarkUnreadDemo() {
	const [unread, setUnread] = useState(false);
	return (
		<DemoShell label="Mark a message unread — the conversation bolds in the sidebar">
			<Box
				display="flex"
				alignItems="center"
				gap="10"
				px="8"
				py="6"
				rounded="md"
				style={{
					border: "1px solid var(--ax-colors-border-secondary)",
					marginBottom: 12,
					width: "100%",
				}}
			>
				<Avatar name="Jane Smith" src="https://i.pravatar.cc/150?img=47" size="sm" />
				<Text
					fontSize="sm"
					fontWeight={unread ? "600" : "400"}
					color="fg.default"
					style={{flex: 1}}
				>
					Jane Smith
				</Text>
				{unread && (
					<Box
						rounded="full"
						style={{
							width: 8,
							height: 8,
							background: "var(--ax-colors-fg-error)",
							flexShrink: 0,
						}}
					/>
				)}
			</Box>
			<Button
				size="sm"
				appearance={unread ? "default" : "subtle"}
				onClick={() => setUnread((v) => !v)}
			>
				{unread ? "Mark read" : "Mark unread"}
			</Button>
			{unread && (
				<Text fontSize="sm" color="fg.tertiary" style={{marginTop: 8, display: "block"}}>
					Also appears in the Unreads quick view
				</Text>
			)}
		</DemoShell>
	);
}

function TypingIndicatorDemo() {
	const [dot, setDot] = useState(0);
	useEffect(() => {
		const id = setInterval(() => setDot((d) => (d + 1) % 4), 400);
		return () => clearInterval(id);
	}, []);
	const dots = "•••".split("").map((d, i) => (
		<span
			key={i}
			style={{opacity: dot === i ? 1 : 0.3, transition: "opacity 0.2s", fontSize: 16}}
		>
			{d}
		</span>
	));
	return (
		<DemoShell>
			<Box display="flex" alignItems="start" gap="8">
				<Avatar name="Priya Rajan" src="https://i.pravatar.cc/150?img=44" size="sm" />
				<Box>
					<Text fontSize="sm" fontWeight="500" color="fg.default">
						Priya Rajan
					</Text>
					<Box
						rounded="lg"
						style={{
							background: "var(--ax-colors-bg-secondary)",
							padding: "8px 14px",
							display: "inline-flex",
							alignItems: "center",
							gap: 2,
							marginTop: 4,
						}}
					>
						{dots}
					</Box>
					<Text
						fontSize="sm"
						color="fg.tertiary"
						style={{display: "block", marginTop: 4}}
					>
						Priya Rajan is typing…
					</Text>
				</Box>
			</Box>
		</DemoShell>
	);
}

function ThreadDemo() {
	const [open, setOpen] = useState(false);
	const [reply, setReply] = useState("");
	const [replies, setReplies] = useState<string[]>([]);
	return (
		<DemoShell label="Click 💬 to open the thread panel">
			<Box style={{position: "relative"}}>
				<Box
					rounded="lg"
					style={{
						background: "var(--ax-colors-bg-secondary)",
						padding: "8px 14px",
						fontSize: 14,
						marginBottom: 4,
					}}
				>
					<Box display="flex" alignItems="center" gap="8" style={{marginBottom: 4}}>
						<Avatar
							name="Priya Rajan"
							src="https://i.pravatar.cc/150?img=44"
							size="sm"
						/>
						<Text fontSize="sm" fontWeight="500">
							Priya Rajan
						</Text>
					</Box>
					Can we get this reviewed by EOD?
				</Box>
				<Box display="flex" alignItems="center" gap="6">
					<Button
						size="sm"
						appearance="subtle"
						icon={<IconComment size={13} />}
						onClick={() => setOpen(true)}
					>
						{replies.length > 0
							? `${replies.length} ${replies.length === 1 ? "reply" : "replies"}`
							: "Reply in thread"}
					</Button>
				</Box>
			</Box>
			{open && (
				<Box
					rounded="lg"
					style={{
						position: "absolute",
						top: 0,
						right: -320,
						width: 300,
						background: "var(--ax-colors-bg-default)",
						border: "1px solid var(--ax-colors-border-secondary)",
						padding: 12,
						zIndex: 20,
					}}
				>
					<Box display="flex" alignItems="center" style={{marginBottom: 10}}>
						<Text fontWeight="500" fontSize="sm">
							Thread
						</Text>
						<Button
							size="sm"
							appearance="subtle"
							aria-label="Close thread"
							icon={<IconXmark size={12} />}
							onClick={() => setOpen(false)}
							style={{marginLeft: "auto", width: 22, height: 22, padding: 0}}
						/>
					</Box>
					<Box
						rounded="md"
						style={{
							fontSize: 13,
							background: "var(--ax-colors-bg-secondary)",
							padding: "8px 10px",
							marginBottom: 8,
						}}
					>
						Can we get this reviewed by EOD?
					</Box>
					{replies.map((r, i) => (
						<Box
							key={i}
							rounded="md"
							style={{
								fontSize: 13,
								background: "var(--ax-colors-bg-success-subtle)",
								padding: "6px 10px",
								marginBottom: 6,
								marginLeft: 16,
							}}
						>
							{r}
						</Box>
					))}
					<textarea
						value={reply}
						onChange={(e) => setReply(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter" && !e.shiftKey) {
								e.preventDefault();
								if (reply.trim()) {
									setReplies((p) => [...p, reply.trim()]);
									setReply("");
								}
							}
						}}
						placeholder="Reply in thread… (Enter to send)"
						rows={2}
						style={{
							width: "100%",
							border: "1px solid var(--ax-colors-border-default)",
							borderRadius: 6,
							padding: "6px 8px",
							fontFamily: "inherit",
							fontSize: 13,
							resize: "none",
							outline: "none",
							background: "var(--ax-colors-bg-default)",
						}}
					/>
				</Box>
			)}
		</DemoShell>
	);
}

function TabsDemo() {
	const [tab, setTab] = useState("messages");
	const tabs = [
		{id: "messages", label: "Messages", badge: 2},
		{id: "artifacts", label: "Artifacts"},
		{id: "activities", label: "Activities", note: "VAU only"},
		{id: "pins", label: "Pins"},
	];
	return (
		<DemoShell label="Tab bar in the conversation header">
			<Box
				display="flex"
				gap="2"
				style={{
					borderBottom: "1px solid var(--ax-colors-border-secondary)",
					width: "100%",
					marginBottom: 12,
				}}
			>
				{tabs.map((t) => (
					<Box
						key={t.id}
						onClick={() => setTab(t.id)}
						display="flex"
						alignItems="center"
						gap="4"
						px="10"
						py="6"
						style={{
							cursor: "pointer",
							borderBottom:
								tab === t.id
									? "2px solid var(--ax-colors-fg-default)"
									: "2px solid transparent",
							marginBottom: -1,
						}}
					>
						<Text
							fontSize="sm"
							fontWeight={tab === t.id ? "500" : "400"}
							color={tab === t.id ? "fg.default" : "fg.tertiary"}
						>
							{t.label}
						</Text>
						{t.badge && <Badge intent="neutral">{t.badge}</Badge>}
						{t.note && (
							<Text
								fontSize="sm"
								color="fg.tertiary"
								style={{fontStyle: "italic", fontSize: 10}}
							>
								{t.note}
							</Text>
						)}
					</Box>
				))}
			</Box>
			<Text fontSize="sm" color="fg.tertiary">
				{tab === "messages" &&
					"Chat thread with message bubbles, reactions, and thread links."}
				{tab === "artifacts" &&
					"2-col thumbnail grid of all artifacts shared in this conversation."}
				{tab === "activities" &&
					"VAU activity feed: status icons, labels, timestamps, trigger + status badges."}
				{tab === "pins" &&
					"List of pinned messages — sender, time, message text. No hover action bar."}
			</Text>
		</DemoShell>
	);
}

function SearchDemo() {
	const [searchOpen, setSearchOpen] = useState(false);
	return (
		<DemoShell label="Click Search to replace the toolbar row">
			{searchOpen ? (
				<Box
					display="flex"
					alignItems="center"
					gap="8"
					rounded="md"
					style={{
						height: 36,
						background: "var(--ax-colors-bg-default)",
						padding: "0 12px",
						border: "1px solid var(--ax-colors-border-default)",
						width: "100%",
					}}
				>
					<IconSearch
						size={14}
						style={{color: "var(--ax-colors-fg-tertiary)", flexShrink: 0}}
					/>
					<input
						autoFocus
						placeholder="Search messages…"
						onKeyDown={(e) => {
							if (e.key === "Escape") setSearchOpen(false);
						}}
						style={{
							flex: 1,
							border: "none",
							outline: "none",
							background: "transparent",
							fontFamily: "inherit",
							fontSize: 14,
						}}
					/>
					<Button size="sm" appearance="subtle" onClick={() => setSearchOpen(false)}>
						Cancel
					</Button>
				</Box>
			) : (
				<Box display="flex" alignItems="center" gap="8" style={{width: "100%"}}>
					<Text fontSize="sm" color="fg.tertiary">
						Normal toolbar row
					</Text>
					<Box style={{marginLeft: "auto"}}>
						<Button
							size="sm"
							appearance="subtle"
							icon={<IconSearch size={13} />}
							onClick={() => setSearchOpen(true)}
						>
							Search
						</Button>
					</Box>
				</Box>
			)}
		</DemoShell>
	);
}

function ComposerDemo() {
	const [msg, setMsg] = useState("");
	const [showMention, setShowMention] = useState(false);
	const candidates = ["Jane Smith", "Marcus Santos", "Priya Rajan", "@here", "@channel"];
	const toolbarBtns = [
		{icon: <IconBold size={13} />, label: "Bold"},
		{icon: <IconItalic size={13} />, label: "Italic"},
		{icon: <IconUnderline size={13} />, label: "Underline"},
		{icon: <IconStrikethrough size={13} />, label: "Strikethrough"},
		null,
		{icon: <IconLink size={13} />, label: "Link"},
		{icon: <IconListOl size={13} />, label: "Ordered list"},
		{icon: <IconListUl size={13} />, label: "Bullet list"},
		{icon: <IconQuoteRight size={13} />, label: "Block quote"},
		null,
		{icon: <IconCode size={13} />, label: "Code"},
		{icon: <IconPaperclip size={13} />, label: "Attach file"},
	];
	return (
		<DemoShell label="Type @ to trigger mention dropdown; Enter to send">
			<Box
				rounded="lg"
				style={{
					border: "1px solid var(--ax-colors-border-default)",
					width: "100%",
					overflow: "visible",
					position: "relative",
				}}
			>
				<Box
					display="flex"
					alignItems="center"
					gap="2"
					px="8"
					style={{
						height: 37,
						background: "var(--ax-colors-bg-tertiary, #eff5eb)",
						borderRadius: "4px 4px 0 0",
					}}
				>
					{toolbarBtns.map((t, i) =>
						t === null ? (
							<Box
								key={i}
								style={{
									width: 1,
									height: 18,
									background: "var(--ax-colors-border-secondary)",
									margin: "0 4px",
									flexShrink: 0,
								}}
							/>
						) : (
							<Box
								key={t.label}
								px="4"
								py="4"
								rounded="sm"
								style={{
									cursor: "pointer",
									color: "var(--ax-colors-fg-secondary)",
									display: "flex",
									alignItems: "center",
								}}
								onMouseEnter={(e) =>
									(e.currentTarget.style.background =
										"var(--ax-colors-bg-secondary)")
								}
								onMouseLeave={(e) =>
									(e.currentTarget.style.background = "transparent")
								}
							>
								{t.icon}
							</Box>
						)
					)}
				</Box>
				<textarea
					value={msg}
					onChange={(e) => {
						setMsg(e.target.value);
						setShowMention(e.target.value.endsWith("@"));
					}}
					onKeyDown={(e) => {
						if (e.key === "Escape") setShowMention(false);
					}}
					placeholder="Type a message…"
					rows={2}
					style={{
						width: "100%",
						border: "none",
						outline: "none",
						padding: "8px 12px",
						fontFamily: "inherit",
						fontSize: 14,
						background: "transparent",
						resize: "none",
						boxSizing: "border-box",
					}}
				/>
				{showMention && (
					<Box
						rounded="lg"
						style={{
							position: "absolute",
							bottom: "100%",
							left: 0,
							width: "100%",
							background: "var(--ax-colors-bg-default)",
							border: "1px solid var(--ax-colors-border-secondary)",
							zIndex: 20,
							overflow: "hidden",
						}}
					>
						{candidates.map((c) => (
							<Box
								key={c}
								px="12"
								py="6"
								style={{cursor: "pointer", fontSize: 13}}
								onMouseEnter={(e) =>
									(e.currentTarget.style.background =
										"var(--ax-colors-bg-secondary)")
								}
								onMouseLeave={(e) =>
									(e.currentTarget.style.background = "transparent")
								}
								onClick={() => {
									setMsg(msg.slice(0, -1) + `@${c} `);
									setShowMention(false);
								}}
							>
								{c}
							</Box>
						))}
					</Box>
				)}
				<Box
					display="flex"
					alignItems="center"
					px="8"
					py="4"
					gap="4"
					style={{borderTop: "1px solid var(--ax-colors-border-tertiary)"}}
				>
					<Button
						size="sm"
						appearance="subtle"
						aria-label="Add attachment"
						icon={<IconPlus size={13} />}
						style={{width: 26, height: 26, padding: 0}}
					/>
					<Box style={{flex: 1}} />
					<Button
						size="sm"
						appearance={msg.trim() ? "primary" : "subtle"}
						disabled={!msg.trim()}
					>
						Send
					</Button>
				</Box>
			</Box>
		</DemoShell>
	);
}

function MentionRenderingDemo() {
	return (
		<DemoShell>
			<Box style={{fontSize: 14, lineHeight: 1.6}}>
				Hey{" "}
				<span style={{color: "var(--ax-colors-fg-link-default)", fontWeight: 500}}>
					@Jane
				</span>{" "}
				can you review this before{" "}
				<span style={{color: "var(--ax-colors-fg-link-default)", fontWeight: 500}}>
					@channel
				</span>{" "}
				gets notified?
			</Box>
		</DemoShell>
	);
}

function LinkPreviewDemo() {
	return (
		<DemoShell>
			<Box style={{fontSize: 14, lineHeight: 1.6, marginBottom: 8}}>
				Check out{" "}
				<a
					href="#"
					style={{color: "var(--ax-colors-fg-default)", textDecoration: "underline"}}
				>
					https://figma.com/design/abc123
				</a>
			</Box>
			<Box
				style={{borderLeft: "3px solid var(--ax-colors-border-secondary)", paddingLeft: 10}}
			>
				<Text fontSize="sm" fontWeight="500" color="fg.default">
					Figma
				</Text>
				<Text fontSize="sm" color="fg.secondary">
					The collaborative interface design tool
				</Text>
				<img
					src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=300&q=70"
					alt=""
					style={{
						marginTop: 6,
						borderRadius: 4,
						maxWidth: 200,
						height: 80,
						objectFit: "cover",
						display: "block",
					}}
				/>
			</Box>
		</DemoShell>
	);
}

function FormattingDemo() {
	return (
		<DemoShell>
			<Box style={{fontSize: 14, lineHeight: 1.8}}>
				<strong style={{fontSize: 17, display: "block"}}>Q3 Goals</strong>
				<strong style={{fontSize: 15, display: "block"}}>Content Strategy</strong>
				<span>
					• Publish <strong>12 blog posts</strong> per month
				</span>
				<br />
				<span>
					• Increase <em>organic traffic</em> by 40%
				</span>
				<br />
				<span>
					• Launch new <strong>AI content</strong> series
				</span>
			</Box>
		</DemoShell>
	);
}

const MOCK_VIEWED = ["Just now", "2h ago", "Yesterday", "3 days ago"];

function ArtifactsDemo() {
	const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
	const items = [
		{
			title: "Q3 Blog Post",
			type: "Blog Post",
			img: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=200&q=60",
		},
		{
			title: "Black Friday Email",
			type: "Email Draft",
			img: "https://images.unsplash.com/photo-1596526131083-e8c633064982?w=200&q=60",
		},
		{
			title: "LinkedIn Series",
			type: "Social Copy",
			img: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=200&q=60",
		},
		{
			title: "Homepage CTA Test",
			type: "A/B Test",
			img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=200&q=60",
		},
	];
	return (
		<DemoShell>
			<Box display="grid" style={{gridTemplateColumns: "1fr 1fr", gap: 8, width: "100%"}}>
				{items.map((a, idx) => (
					<Box
						key={a.title}
						rounded="lg"
						shadow={hoveredIdx === idx ? "sm" : undefined}
						onMouseEnter={() => setHoveredIdx(idx)}
						onMouseLeave={() => setHoveredIdx(null)}
						style={{
							border: "1px solid var(--ax-colors-border-default)",
							overflow: "hidden",
							background: "var(--ax-colors-bg-default)",
							cursor: "pointer",
							transition: "box-shadow 0.15s ease",
						}}
					>
						<Box
							style={{
								position: "relative",
								height: 72,
								overflow: "hidden",
								background: "var(--ax-colors-bg-secondary)",
							}}
						>
							<img
								src={a.img}
								alt=""
								style={{
									width: "100%",
									height: "100%",
									objectFit: "cover",
									display: "block",
								}}
							/>
							<Box
								rounded="sm"
								style={{
									position: "absolute",
									top: 5,
									left: 5,
									width: 18,
									height: 18,
									background: "var(--ax-colors-bg-default)",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
								}}
							>
								<IconFileLines
									size={10}
									style={{color: "var(--ax-colors-fg-secondary)"}}
								/>
							</Box>
						</Box>
						<Box
							style={{
								borderTop: "1px solid var(--ax-colors-border-tertiary)",
								padding: "7px 9px",
							}}
						>
							<Text
								fontSize="sm"
								fontWeight="500"
								color="fg.default"
								style={{
									overflow: "hidden",
									textOverflow: "ellipsis",
									whiteSpace: "nowrap",
									display: "block",
									marginBottom: 4,
								}}
							>
								{a.title}
							</Text>
							<Box display="flex" justifyContent="space-between" alignItems="center">
								<Badge intent="neutral">{a.type}</Badge>
								<Text fontSize="sm" color="fg.tertiary">
									{MOCK_VIEWED[idx % MOCK_VIEWED.length]}
								</Text>
							</Box>
						</Box>
					</Box>
				))}
			</Box>
		</DemoShell>
	);
}

function AgentCardDemo() {
	return (
		<DemoShell label="Agent card sent inline in the chat thread">
			<Box
				rounded="lg"
				style={{
					border: "1px solid var(--ax-colors-border-default)",
					background: "var(--ax-colors-bg-default)",
					width: 272,
					overflow: "hidden",
				}}
			>
				<Box display="flex" alignItems="start" gap="10" px="16" pt="16" pb="8">
					<Box
						rounded="lg"
						style={{
							width: 44,
							height: 44,
							background: "var(--ax-colors-bg-secondary)",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							fontSize: 22,
							flexShrink: 0,
						}}
					>
						🐆
					</Box>
					<Box display="flex" flexDirection="column" gap="4">
						<Text fontWeight="600" color="fg.default" style={{fontSize: 15}}>
							Bubs
						</Text>
						<Box display="flex" alignItems="center" gap="6">
							<Text
								color="fg.tertiary"
								style={{
									textTransform: "uppercase",
									letterSpacing: "0.04em",
									fontSize: 10,
									fontWeight: 500,
								}}
							>
								Working with
							</Text>
							<AvatarGroup>
								{["47", "68", "44"].map((n, i) => (
									<Avatar
										key={i}
										name={`User ${i}`}
										src={`https://i.pravatar.cc/150?img=${n}`}
										size="2xs"
									/>
								))}
							</AvatarGroup>
						</Box>
					</Box>
				</Box>
				<Box px="16" pb="8">
					<Text fontSize="sm" color="fg.secondary" style={{lineHeight: 1.5}}>
						Drafts blog posts, emails, and social copy.
					</Text>
				</Box>
				<Box display="flex" px="16" pb="10" gap="6">
					{["Blog Posts", "Email", "Social"].map((t) => (
						<Badge key={t} intent="neutral">
							{t}
						</Badge>
					))}
				</Box>
				<Box
					display="flex"
					alignItems="center"
					justifyContent="space-between"
					px="16"
					py="8"
					style={{borderTop: "1px solid var(--ax-colors-border-secondary)"}}
				>
					<Box display="flex" gap="6">
						{["🎨", "💬"].map((c, i) => (
							<Box
								key={i}
								rounded="lg"
								style={{
									width: 26,
									height: 26,
									border: "1px solid var(--ax-colors-border-secondary)",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									fontSize: 12,
								}}
							>
								{c}
							</Box>
						))}
					</Box>
					<Button appearance="primary" size="sm">
						Start chat
					</Button>
				</Box>
			</Box>
		</DemoShell>
	);
}

function UserProfileDemo() {
	const [tab, setTab] = useState<"human" | "vau">("human");
	return (
		<DemoShell label="Click a tab to see human vs VAU profile">
			<Box display="flex" gap="8" style={{marginBottom: 12}}>
				<Button
					size="sm"
					appearance={tab === "human" ? "default" : "subtle"}
					onClick={() => setTab("human")}
				>
					Human
				</Button>
				<Button
					size="sm"
					appearance={tab === "vau" ? "default" : "subtle"}
					onClick={() => setTab("vau")}
				>
					VAU
				</Button>
			</Box>
			{tab === "human" ? (
				<Box display="flex" flexDirection="column" gap="12" style={{width: "100%"}}>
					<Box display="flex" alignItems="center" gap="12">
						<Box style={{position: "relative", flexShrink: 0}}>
							<Avatar
								name="Priya Rajan"
								src="https://i.pravatar.cc/150?img=44"
								size="xl"
							/>
							<Box
								rounded="full"
								style={{
									position: "absolute",
									bottom: 2,
									right: 2,
									width: 12,
									height: 12,
									background: "var(--ax-colors-bg-warning-default)",
									border: "2px solid white",
								}}
							/>
						</Box>
						<Box>
							<Text fontWeight="600" fontSize="lg" color="fg.default">
								Priya Rajan
							</Text>
							<Text fontSize="sm" color="fg.secondary">
								UX Researcher
							</Text>
						</Box>
					</Box>
					<Box display="flex" gap="8">
						<Button appearance="default" size="sm">
							Message
						</Button>
						<Button appearance="default" size="sm">
							Share contact
						</Button>
					</Box>
					<Box style={{height: 1, background: "var(--ax-colors-border-secondary)"}} />
					{[
						{label: "Email", value: "priya.rajan@optimizely.com"},
						{label: "Title", value: "UX Researcher"},
						{label: "Local time", value: "10:51 AM local time"},
					].map((r) => (
						<Box key={r.label} display="flex" alignItems="center" gap="10">
							<Box
								rounded="lg"
								style={{
									width: 32,
									height: 32,
									background: "var(--ax-colors-bg-secondary)",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									flexShrink: 0,
								}}
							>
								<IconFileLines
									size={14}
									style={{color: "var(--ax-colors-fg-secondary)"}}
								/>
							</Box>
							<Box>
								<Text fontSize="sm" color="fg.tertiary">
									{r.label}
								</Text>
								<Text fontSize="sm" color="fg.default">
									{r.value}
								</Text>
							</Box>
						</Box>
					))}
				</Box>
			) : (
				<Box display="flex" flexDirection="column" gap="12" style={{width: "100%"}}>
					<Box display="flex" flexDirection="column" alignItems="center" gap="8">
						<Avatar name="Bubs" src="/vau-bubs.svg" size="xl" />
						<Box display="flex" alignItems="center" gap="6">
							<Text fontWeight="600" fontSize="lg" color="fg.default">
								Bubs
							</Text>
							<IconSparkles
								size={15}
								style={{color: "var(--ax-colors-fg-information)"}}
							/>
						</Box>
						<Badge intent="neutral">Virtual Teammate</Badge>
					</Box>
					<Box display="flex" gap="8">
						<Button appearance="default" size="sm">
							Message
						</Button>
						<Button appearance="default" size="sm">
							Share contact
						</Button>
					</Box>
					<Box style={{height: 1, background: "var(--ax-colors-border-secondary)"}} />
					<Text fontSize="sm" color="fg.secondary" style={{lineHeight: 1.6}}>
						Drafts blog posts, emails, and social copy. Trained on Optimizely brand
						voice.
					</Text>
					<Box display="flex" gap="6" style={{flexWrap: "wrap"}}>
						{["Blog Posts", "Email", "Social"].map((t) => (
							<Badge key={t} intent="neutral">
								{t}
							</Badge>
						))}
					</Box>
					<Text fontWeight="600" fontSize="sm" color="fg.default">
						Recent deliverables
					</Text>
					{[
						"Q3 Content Strategy: How AI Is Reshaping Marketing",
						"Black Friday Campaign Email Series",
					].map((title) => (
						<Box
							key={title}
							display="flex"
							alignItems="center"
							gap="10"
							px="10"
							py="8"
							rounded="lg"
							style={{border: "1px solid var(--ax-colors-border-secondary)"}}
						>
							<IconFileLines
								size={13}
								style={{color: "var(--ax-colors-fg-secondary)", flexShrink: 0}}
							/>
							<Text
								fontSize="sm"
								fontWeight="500"
								color="fg.default"
								style={{
									overflow: "hidden",
									textOverflow: "ellipsis",
									whiteSpace: "nowrap",
									flex: 1,
								}}
							>
								{title}
							</Text>
						</Box>
					))}
				</Box>
			)}
		</DemoShell>
	);
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function IMCatalogPage() {
	return (
		<Box display="flex" flexDirection="column" gap="40">
			<Text fontSize="md" color="fg.secondary" style={{maxWidth: 640, lineHeight: 1.6}}>
				A reference for engineers documenting every interaction built in the Opal IM
				prototype. Navigate to{" "}
				<a
					href="/opal/messages"
					style={{color: "var(--ax-colors-fg-default)", textDecoration: "underline"}}
				>
					/opal/messages
				</a>{" "}
				to interact with the full prototype.
			</Text>

			<CategorySection title="Sidebar">
				<FeatureCard
					name="New conversation"
					link="/opal/messages"
					description="Clicking + in the header takes over the main chat area as a blank composer. Shows a 'To:' field and a scrollable recent contacts list with avatars, roles, and sparkle for VAUs. Clicking a contact opens that DM."
					trigger="Click + in the Opal Workspace header"
					demo={<NewConversationDemo />}
				/>
				<FeatureCard
					name="Sidebar collapse / icon rail"
					link="/opal/messages"
					description="The sidebar collapses to a 56px icon rail showing DM avatars with unread badge overlays. Clicking the expand chevron restores the full sidebar. Auto-collapses on narrow viewports (< 768px)."
					trigger="Click the ← collapse button in the sidebar header, or resize the window below 768px"
					demo={<CollapsedSidebarDemo />}
				/>
				<FeatureCard
					name="Quick views"
					link="/opal/messages"
					description="Two quick-filter views at the top of the sidebar — Unreads and Mentions. Clicking one replaces the conversation list with a filtered panel showing the relevant messages. Clicking the same view or pressing Escape dismisses."
					trigger="Click Unreads or Mentions in the sidebar"
					demo={<QuickViewsDemo />}
				/>
				<FeatureCard
					name="Section management"
					link="/opal/messages"
					description="Create custom sections with 'Add a section' at the bottom. Double-click a custom section name to rename inline. Hover a custom section to reveal the × delete button. Built-in sections (Direct Messages, Group Chats, Channels) cannot be deleted. Items can be dragged into custom sections."
					trigger="'Add a section' at bottom of sidebar; double-click to rename; hover custom section for ×"
					demo={<SectionManagementDemo />}
				/>
				<FeatureCard
					name="Conversation header"
					link="/opal/messages?conversation=pr"
					description="Shows avatar with presence dot (DMs), group emoji (groups), or # (channels) + conversation name. VAU chats show a Virtual badge. Groups show member count and a member avatar stack. Clicking the name opens the profile panel."
					trigger="Click any DM, group, or channel in the sidebar"
					demo={<ConversationHeaderDemo />}
				/>
				<FeatureCard
					name="Unread sorting + bolding"
					link="/opal/messages"
					description="Conversations with unread messages (static unread count, VAU deliverables, or manually marked unread) float to the top and render bold. Clicking the same conversation in the sidebar re-sorts. The manual Mark Unread state also contributes to this."
					trigger="Any conversation with unread > 0, pending VAU deliverables, or manually marked unread"
					demo={<UnreadSortingDemo />}
				/>
			</CategorySection>

			<CategorySection title="Chat Messages">
				<FeatureCard
					name="Hover action bar"
					link="/opal/messages?conversation=pr"
					description="A floating pill appears on hover with: 3 quick-react emojis (👍 ❤️ 😂), a 😊 button that opens the full emoji keyboard, a separator, Reply in thread (💬), Pin (📌 toggle), and a ⋯ more menu. Disappears when the emoji picker opens. The ⋯ menu differs — own messages show Edit / Delete / Mark unread / Copy text; others' messages show Mark unread / Copy text only."
					trigger="Hover any message bubble"
					demo={<HoverActionBarDemo />}
				/>
				<FeatureCard
					name="Edit + Delete message"
					link="/opal/messages?conversation=pr"
					description="Edit: bubble becomes a textarea with Save/Cancel. '(edited)' label appears after saving. Delete: soft-replaces content with 'This message was deleted.' in muted italic."
					trigger="Hover own message → ⋯ → Edit message or Delete message"
					demo={<EditDeleteDemo />}
				/>
				<FeatureCard
					name="Emoji reactions"
					link="/opal/messages?conversation=bubs"
					description="Click quick emojis to react; click again to unreact. Reaction pills appear below the bubble showing the emoji + count. Your own reactions have an accent border and background. The full emoji-mart keyboard (with search, categories, skin tone) opens from the 😊 button."
					trigger="Hover → quick emoji, or hover → 😊 → pick from full keyboard"
					demo={<ReactionsDemo />}
				/>
				<FeatureCard
					name="Pin message"
					link="/opal/messages?conversation=pr"
					description="Pinning a message adds a small pin overlay in the top-right corner of the bubble and saves it to the Pins tab for that conversation. Clicking the ToggleButton again unpins it."
					trigger="Hover → 📌 toggle button in the action bar"
					demo={<PinMessageDemo />}
				/>
				<FeatureCard
					name="Mark unread"
					link="/opal/messages?conversation=pr"
					description="Marking a message unread flags the conversation as manually unread: its name bolds in the sidebar, an unread dot appears, it floats to the top of the list, and it appears in the Unreads quick view. Mark read reverses all of this."
					trigger="Hover → ⋯ → Mark unread (for both own and others' messages)"
					demo={<MarkUnreadDemo />}
				/>
				<FeatureCard
					name="Typing indicator"
					link="/opal/messages?conversation=pr"
					description="When a participant is composing, an animated three-dot bubble appears followed by 'Name is typing…'. Multiple typers are concatenated (e.g. 'Name1, Name2 are typing…')."
					trigger="Any participant is actively typing in the composer"
					demo={<TypingIndicatorDemo />}
				/>
				<FeatureCard
					name="Thread / Reply"
					link="/opal/messages?conversation=pr"
					description="Clicking the 💬 button opens a slide-in thread panel showing the original message, reply list, and a composer. Reply count appears inline below the original. Enter sends; Shift+Enter adds a line break."
					trigger="Hover → 💬 → type reply → Enter"
					demo={<ThreadDemo />}
				/>
				<FeatureCard
					name="@mention rendering"
					link="/opal/messages?conversation=pr"
					description="@Name text renders in accent color with medium weight. In the composer, typing @ opens a dropdown of contacts plus @here and @channel. Arrow keys navigate; Enter/Tab selects; Escape dismisses."
					trigger="Send a message with @Name"
					demo={<MentionRenderingDemo />}
				/>
				<FeatureCard
					name="Mixed formatting"
					link="/opal/messages?conversation=pr"
					description="Messages support **bold**, _italic_, ~~strikethrough~~, # H1, ## H2, - bullets, inline code. Processed inline with no external library."
					trigger="Send a message with markdown syntax"
					demo={<FormattingDemo />}
				/>
				<FeatureCard
					name="Link previews"
					link="/opal/messages?conversation=pr"
					description="Known domains (optimizely.com, figma.com, github.com, notion.so, luma.com) show a rich preview card below the message with a left border, title, description, and image."
					trigger="Send a URL from a supported domain"
					demo={<LinkPreviewDemo />}
				/>
			</CategorySection>

			<CategorySection title="Tabs & Panels">
				<FeatureCard
					name="Tab bar"
					link="/opal/messages?conversation=bubs"
					description="Each conversation has tabs: Messages (with unread badge), Artifacts, Activities (VAU/VAU-group only), Pins. Clicking a tab switches the content area. The Artifacts and Activities tabs slide in from the right without layout shift."
					trigger="Click any tab in the conversation header"
					demo={<TabsDemo />}
				/>
				<FeatureCard
					name="Needs Review panel"
					link="/opal/messages?conversation=bubs"
					description="A slide-in panel showing ApprovalActionCard items for any pending VAU deliverables. Available in VAU DMs and group chats that contain a VAU. Approve / Request Changes per item."
					trigger="Click Needs Review button (VAU chats and groups with VAUs only)"
					demo={
						<DemoShell>
							<Box
								rounded="lg"
								style={{
									border: "1px solid var(--ax-colors-border-default)",
									padding: "12px 16px",
									background: "var(--ax-colors-bg-default)",
								}}
							>
								<Box
									display="flex"
									alignItems="start"
									gap="10"
									style={{marginBottom: 10}}
								>
									<Box
										rounded="md"
										style={{
											width: 32,
											height: 32,
											background: "var(--ax-colors-bg-secondary)",
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											flexShrink: 0,
										}}
									>
										📄
									</Box>
									<Box>
										<Text fontSize="sm" fontWeight="500" color="fg.default">
											Q3 Content Strategy Blog Post
										</Text>
										<Box style={{marginTop: 4}}>
											<Badge intent="neutral">Blog Post</Badge>
										</Box>
									</Box>
								</Box>
								<Box display="flex" gap="8" justifyContent="flex-end">
									<Button size="sm" appearance="default">
										Request Changes
									</Button>
									<Button size="sm" appearance="primary">
										Approve
									</Button>
								</Box>
							</Box>
						</DemoShell>
					}
				/>
				<FeatureCard
					name="Conversation search"
					link="/opal/messages?conversation=pr"
					description="Clicking the Search button replaces the tab bar with a full-width search input scoped to the current conversation. Escape or Cancel dismisses and restores the tab bar."
					trigger="Click Search in the conversation toolbar"
					demo={<SearchDemo />}
				/>
				<FeatureCard
					name="Artifacts tab"
					link="/opal/messages?conversation=pr"
					description="2-col grid of MiniArtifactCard thumbnails for every artifact shared in the conversation. Each card shows thumbnail, title, type badge, and last-viewed timestamp. Hovering adds a shadow."
					trigger="Click Artifacts tab"
					demo={<ArtifactsDemo />}
				/>
			</CategorySection>

			<CategorySection title="Message Composer">
				<FeatureCard
					name="Formatting toolbar + @mentions"
					link="/opal/messages?conversation=pr"
					description="A sticky formatting toolbar sits above the textarea with Bold, Italic, Underline, Strikethrough, Link, Lists, Quote, Code, and Attach. Typing @ in the textarea opens a mention dropdown. Enter sends; Shift+Enter adds a line break. Send button is disabled until the message has content."
					trigger="Click in the composer; type @ for mentions"
					demo={<ComposerDemo />}
				/>
				<FeatureCard
					name="+ attachment menu"
					link="/opal/messages?conversation=pr"
					description="The + button opens a 3-item menu: File (tabbed modal with Documents/Images/Spreadsheets/Opal Artifacts), Artifact (2-col card grid picker), and Virtual teammate (agent list picker). Selecting any item queues a thumbnail in the composer before sending."
					trigger="Click + in the composer"
					demo={
						<DemoShell label="+ menu options">
							<Box
								display="flex"
								flexDirection="column"
								gap="4"
								rounded="lg"
								style={{
									border: "1px solid var(--ax-colors-border-secondary)",
									overflow: "hidden",
									width: 160,
								}}
							>
								{["File", "Artifact", "Virtual teammate"].map((opt) => (
									<Box
										key={opt}
										px="12"
										py="8"
										style={{cursor: "pointer", fontSize: 14}}
										onMouseEnter={(e) =>
											(e.currentTarget.style.background =
												"var(--ax-colors-bg-secondary)")
										}
										onMouseLeave={(e) =>
											(e.currentTarget.style.background = "transparent")
										}
									>
										{opt}
									</Box>
								))}
							</Box>
						</DemoShell>
					}
				/>
			</CategorySection>

			<CategorySection title="Attachments & Sharing">
				<FeatureCard
					name="Share artifact"
					link="/opal/messages?conversation=ms"
					description="Selecting Artifact from the + menu shows a 2-col MiniArtifactCard grid. Clicking an artifact queues it as a thumbnail in the composer. On send, it appears as a rich card in the thread."
					trigger="Click + → Artifact → select → Send"
					demo={<ArtifactsDemo />}
				/>
				<FeatureCard
					name="Share agent card"
					link="/opal/messages?conversation=bubs"
					description="Selecting Virtual teammate from the + menu shows an agent list. Selecting one sends a rich card inline in the thread: emoji icon, name, 'working with' avatars, description, capability badges, connector icons, and a Start chat CTA."
					trigger="Click + → Virtual teammate → select agent"
					demo={<AgentCardDemo />}
				/>
			</CategorySection>

			<CategorySection title="User Profiles">
				<FeatureCard
					name="Human + VAU profile"
					link="/opal/messages?conversation=pr"
					description="Clicking the name in the conversation header opens a profile panel. Human: large avatar with presence dot, name, title, email, local time, Message and Share contact buttons. VAU: centered avatar, sparkle, Virtual Teammate badge, about text, capability badges, recent deliverables list."
					trigger="Click the name in the conversation header"
					demo={<UserProfileDemo />}
				/>
				<FeatureCard
					name="VAU Virtual badge"
					link="/opal/messages?conversation=bubs"
					description="Virtual teammates show a 'Virtual' badge next to their name in the sidebar, conversation header, and quick views panel, distinguishing them from human DMs."
					trigger="Visual — always shown for isVAU entries"
					demo={
						<DemoShell>
							{[
								{name: "Bubs", avatar: "/vau-bubs.svg"},
								{name: "Kara", avatar: "/vau-kara.svg"},
							].map((vau) => (
								<Box
									key={vau.name}
									display="flex"
									alignItems="center"
									gap="10"
									px="8"
									py="6"
									rounded="md"
									style={{
										background: "var(--ax-colors-bg-default)",
										marginBottom: 4,
									}}
								>
									<Avatar name={vau.name} src={vau.avatar} size="sm" />
									<Text fontSize="md" color="fg.default">
										{vau.name}
									</Text>
									<Badge intent="information" style={{flexShrink: 0}}>
										Virtual
									</Badge>
								</Box>
							))}
						</DemoShell>
					}
				/>
			</CategorySection>

			<CategorySection title="Notifications">
				<FeatureCard
					name="New message notification"
					prd="PRD 5.1"
					link="/opal/notifications"
					description="In-app notification when someone sends you a DM. Gray message icon, message text as subtitle, unread red dot top-right next to the timestamp. Reply button with no icon."
					trigger="Receive a DM — appears in the bell dropdown and /opal/notifications"
					demo={
						<DemoShell>
							<Box
								display="flex"
								gap="12"
								p="16"
								style={{
									background: "var(--ax-colors-bg-default)",
									borderRadius: 6,
									border: "1px solid var(--ax-colors-border-tertiary)",
								}}
							>
								<Box pt="2" style={{flexShrink: 0}}>
									<IconComment
										size={16}
										style={{color: "var(--ax-colors-fg-tertiary)"}}
									/>
								</Box>
								<Box
									display="flex"
									flexDirection="column"
									gap="4"
									style={{flex: 1, minWidth: 0}}
								>
									<Box
										display="flex"
										alignItems="start"
										justifyContent="space-between"
										gap="8"
									>
										<Text
											fontSize="md"
											fontWeight="700"
											color="fg.default"
											style={{flex: 1}}
										>
											Priya Rajan sent you a message
										</Text>
										<Box
											display="flex"
											alignItems="center"
											gap="4"
											style={{flexShrink: 0}}
										>
											<Text fontSize="sm" color="fg.tertiary">
												1:58 PM
											</Text>
											<Box
												rounded="full"
												style={{
													width: 8,
													height: 8,
													background: "var(--ax-colors-fg-error)",
													flexShrink: 0,
												}}
											/>
										</Box>
									</Box>
									<Text fontSize="sm" color="fg.tertiary">
										"Can we add a section on personalization? It's super
										relevant to our ICP right now."
									</Text>
									<Box pt="4">
										<Button size="sm" appearance="inverse">
											Reply
										</Button>
									</Box>
								</Box>
							</Box>
						</DemoShell>
					}
				/>
				<FeatureCard
					name="@mention notification"
					prd="PRD 5.1"
					link="/opal/notifications"
					description="Triggered when someone @mentions you in any chat or group. Gray @ icon, Action Required badge top-right next to the timestamp, message text as subtitle, Reply button."
					trigger="Someone @mentions you in a DM, group, or VAU chat"
					demo={
						<DemoShell>
							<Box
								display="flex"
								gap="12"
								p="16"
								style={{
									background: "var(--ax-colors-bg-default)",
									borderRadius: 6,
									border: "1px solid var(--ax-colors-border-tertiary)",
								}}
							>
								<Box pt="2" style={{flexShrink: 0}}>
									<IconAt
										size={16}
										style={{color: "var(--ax-colors-fg-tertiary)"}}
									/>
								</Box>
								<Box
									display="flex"
									flexDirection="column"
									gap="4"
									style={{flex: 1, minWidth: 0}}
								>
									<Box
										display="flex"
										alignItems="start"
										justifyContent="space-between"
										gap="8"
									>
										<Text
											fontSize="md"
											fontWeight="700"
											color="fg.default"
											style={{flex: 1}}
										>
											Marcus Santos mentioned you in Black Friday Campaign
										</Text>
										<Box
											display="flex"
											alignItems="center"
											gap="4"
											style={{flexShrink: 0}}
										>
											<Badge intent="warning" variant="subtle">
												Action Required
											</Badge>
											<Text fontSize="sm" color="fg.tertiary">
												1:52 PM
											</Text>
											<Box
												rounded="full"
												style={{
													width: 8,
													height: 8,
													background: "var(--ax-colors-fg-error)",
													flexShrink: 0,
												}}
											/>
										</Box>
									</Box>
									<Text fontSize="sm" color="fg.tertiary">
										"@erika can you review the brief before EOD? Need your
										sign-off."
									</Text>
									<Box pt="4">
										<Button size="sm" appearance="inverse">
											Reply
										</Button>
									</Box>
								</Box>
							</Box>
						</DemoShell>
					}
				/>
				<FeatureCard
					name="Thread reply notification"
					prd="PRD 5.1"
					link="/opal/notifications"
					description="Triggered when someone replies in a thread you started or follow. Gray chat-bubbles icon, thread context as subtitle, Reply button."
					trigger="Someone replies in a thread you're part of"
					demo={
						<DemoShell>
							<Box
								display="flex"
								gap="12"
								p="16"
								style={{
									background: "var(--ax-colors-bg-default)",
									borderRadius: 6,
									border: "1px solid var(--ax-colors-border-tertiary)",
								}}
							>
								<Box pt="2" style={{flexShrink: 0}}>
									<IconComments
										size={16}
										style={{color: "var(--ax-colors-fg-tertiary)"}}
									/>
								</Box>
								<Box
									display="flex"
									flexDirection="column"
									gap="4"
									style={{flex: 1, minWidth: 0}}
								>
									<Box
										display="flex"
										alignItems="start"
										justifyContent="space-between"
										gap="8"
									>
										<Text
											fontSize="md"
											fontWeight="700"
											color="fg.default"
											style={{flex: 1}}
										>
											Priya Rajan replied in your thread
										</Text>
										<Box
											display="flex"
											alignItems="center"
											gap="4"
											style={{flexShrink: 0}}
										>
											<Text fontSize="sm" color="fg.tertiary">
												1:45 PM
											</Text>
											<Box
												rounded="full"
												style={{
													width: 8,
													height: 8,
													background: "var(--ax-colors-fg-error)",
													flexShrink: 0,
												}}
											/>
										</Box>
									</Box>
									<Text fontSize="sm" color="fg.tertiary">
										Thread on "Can we review the Q3 blog?" — 2 new replies since
										your last visit.
									</Text>
									<Box pt="4">
										<Button size="sm" appearance="inverse">
											Reply
										</Button>
									</Box>
								</Box>
							</Box>
						</DemoShell>
					}
				/>
			</CategorySection>
		</Box>
	);
}
