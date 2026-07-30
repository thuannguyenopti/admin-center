"use client";

import {
	Box,
	Menu,
	MenuContent,
	MenuTrigger,
	Heading,
	Text,
	Tooltip,
	Button,
	type MenuOption,
} from "@optiaxiom/react";
import {IconPen} from "@optiaxiom/icons";
import {useState} from "react";
import {
	mockUserPreferences,
	getNotificationTypeLabel,
	type UserPreferences,
} from "@/app/opal/notifications/mockData";

// ─── Constants ────────────────────────────────────────────────────────────────

const CHANNELS = ["in-app", "email", "slack", "teams", "browser"] as const;
type Channel = (typeof CHANNELS)[number];

const CHANNEL_LABELS: Record<Channel, string> = {
	"in-app": "In-App",
	email: "Email",
	slack: "Slack",
	teams: "Teams",
	browser: "Browser",
};

const CATEGORY_GROUPS: {label: string; keys: string[]}[] = [
	{
		label: "Agent Execution",
		keys: [
			"agent_execution_failed",
			"agent_execution_chat",
			"agent_execution_autonomous",
			"agent_execution_long_running",
			"approval_required",
		],
	},
	{
		label: "Guardrail & Quality",
		keys: [
			"guardrail_observer",
			"guardrail_enforcer",
			"guardrail_quality",
			"guardrail_support_ticket",
		],
	},
	{
		label: "Agent Directory",
		keys: ["directory_new_agent", "directory_update_available", "directory_install_request"],
	},
	{
		label: "Tools & Integrations",
		keys: [
			"tools_new_available",
			"tools_deprecated",
			"tools_auth_required",
			"tools_auth_expired",
		],
	},
	{
		label: "Collaboration",
		keys: [
			"collaboration_agent_modified",
			"collaboration_agent_activated",
			"collaboration_agent_deactivated",
		],
	},
	{
		label: "System",
		keys: ["system_announcement", "system_maintenance"],
	},
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NotificationPreferencesPage() {
	const [openKey, setOpenKey] = useState<string | null>(null);
	const [preferences, setPreferences] = useState<UserPreferences>(
		JSON.parse(JSON.stringify(mockUserPreferences))
	);

	const getChannelSummary = (key: string): string => {
		const channels = preferences.preferences[key]?.channels ?? [];
		return channels.map((c) => CHANNEL_LABELS[c as Channel] ?? c).join(", ");
	};

	const toggleChannel = (key: string, ch: Channel) => {
		setPreferences((prev) => {
			const current = prev.preferences[key].channels;
			const updated = current.includes(ch)
				? current.filter((c) => c !== ch)
				: [...current, ch];
			return {
				...prev,
				preferences: {
					...prev.preferences,
					[key]: {...prev.preferences[key], channels: updated},
				},
			};
		});
	};

	const setAllChannels = (key: string, all: boolean) => {
		setPreferences((prev) => ({
			...prev,
			preferences: {
				...prev.preferences,
				[key]: {
					...prev.preferences[key],
					channels: all ? [...CHANNELS] : [],
				},
			},
		}));
	};

	const buildChannelOptions = (key: string): MenuOption[] => {
		const channels = preferences.preferences[key]?.channels ?? [];
		const isAllSelected = channels.length === CHANNELS.length;
		return [
			{
				label: "Select all",
				multi: true,
				selected: () => isAllSelected,
				execute: () => setAllChannels(key, !isAllSelected),
			},
			...CHANNELS.map<MenuOption>((ch) => ({
				key: ch,
				label: CHANNEL_LABELS[ch],
				multi: true,
				selected: () => channels.includes(ch),
				execute: () => toggleChannel(key, ch),
				group: {label: "channels", hidden: true, separator: true},
			})),
		];
	};

	return (
		<Box py="24" px="32" display="flex" flexDirection="column" gap="24">
			{/* ── Page header ─────────────────────────────────────────── */}
			<Box>
				<Heading level="2">Notifications</Heading>
				<Text color="fg.tertiary" fontSize="sm" mt="4">
					Configure which notifications you receive and how they are delivered.
				</Text>
			</Box>

			{/* ── Notification rows ───────────────────────────────────── */}
			<Box border="1" borderColor="border.tertiary" rounded="md" overflow="hidden">
				{CATEGORY_GROUPS.map((group, gi) => {
					const visibleKeys = group.keys.filter((k) => preferences.preferences[k]);
					if (visibleKeys.length === 0) return null;

					const isLastGroup = gi === CATEGORY_GROUPS.length - 1;

					return (
						<Box key={group.label}>
							{/* Category header row — table-header treatment */}
							<Box
								px="16"
								py="6"
								bg="bg.secondary"
								style={{
									borderBottom: "1px solid var(--ax-colors-border-tertiary)",
								}}
							>
								<Text fontSize="sm" fontWeight="400" color="fg.tertiary">
									{group.label}
								</Text>
							</Box>

							{/* Notification type rows */}
							{visibleKeys.map((key, i) => {
								const isLastInGroup = i === visibleKeys.length - 1;
								const isVeryLast = isLastGroup && isLastInGroup;

								return (
									<Menu
										key={key}
										open={openKey === key}
										onOpenChange={(o) => setOpenKey(o ? key : null)}
										options={buildChannelOptions(key)}
									>
										<Box
											display="flex"
											alignItems="center"
											pl="16"
											pr="20"
											bg="bg.default"
											className="group"
											onClick={() => setOpenKey(openKey === key ? null : key)}
											style={{
												minHeight: 44,
												cursor: "pointer",
												borderBottom: isVeryLast
													? undefined
													: "1px solid var(--ax-colors-border-tertiary)",
											}}
										>
											{/* Type label */}
											<Box flex="1" py="8">
												<Text fontSize="md" color="fg.default">
													{getNotificationTypeLabel(key as any)}
												</Text>
											</Box>

											{/* Right side: channels + pencil + switch grouped tightly */}
											<Box display="flex" alignItems="center" gap="8">
												<Text fontSize="sm" color="fg.tertiary">
													{getChannelSummary(key)}
												</Text>

												{/* Pencil icon — hint, visible on hover */}
												<Tooltip content="Edit channels">
													<MenuTrigger asChild>
														<Button
															appearance="subtle"
															icon={<IconPen />}
															size="sm"
															className="opacity-0 group-hover:opacity-100 transition-opacity"
															aria-label="Edit channels"
															onClick={(e) => e.stopPropagation()}
														/>
													</MenuTrigger>
												</Tooltip>
											</Box>
										</Box>

										<MenuContent align="end" style={{minWidth: 200}} />
									</Menu>
								);
							})}
						</Box>
					);
				})}
			</Box>
		</Box>
	);
}
