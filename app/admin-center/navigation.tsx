import {IconCircleQuestion, IconUser} from "@optiaxiom/icons";
import {AdminCenterIcons} from "./admin-center-icons";

export const adminCenterNav = [
	{
		label: "Dashboard",
		highlight: "admin-center/dashboard",
		url: "/admin-center/dashboard",
		icon: <AdminCenterIcons.Dashboard />,
		hidePageHeader: true,
	},
	{
		label: "User Management",
		highlight: "admin-center/user-management",
		url: "/admin-center/user-management/users",
		icon: <AdminCenterIcons.UserManagement />,
		hidePageHeader: true,
		children: [
			{label: "Users", url: "/admin-center/user-management/users", icon: <IconUser />},
			{
				label: "Virtual Teammates",
				url: "/admin-center/user-management/agents",
				icon: <AdminCenterIcons.VirtualTeammates />,
			},
			{
				label: "Teams",
				url: "/admin-center/user-management/teams",
				icon: <AdminCenterIcons.Teams />,
				hidePageHeader: true,
			},
			{
				label: "Groups",
				url: "/admin-center/user-management/groups",
				icon: <AdminCenterIcons.Groups />,
				hidePageHeader: true,
			},
		],
	},
	{
		label: "Access Setup",
		highlight: "admin-center/access-setup",
		url: "/admin-center/access-setup/product-access",
		icon: <AdminCenterIcons.AccessSetup />,
		hidePageHeader: true,
		children: [
			{
				label: "Product Access",
				url: "/admin-center/access-setup/product-access",
				icon: <AdminCenterIcons.ProductAccess />,
			},
			{
				label: "Roles",
				url: "/admin-center/access-setup/roles",
				icon: <AdminCenterIcons.Roles />,
			},
		],
	},
	{
		label: "Settings",
		highlight: "admin-center/settings",
		url: "/admin-center/settings/usage-billing",
		icon: <AdminCenterIcons.Settings />,
		hidePageHeader: true,
		children: [
			{
				label: "Usage & Billing",
				url: "/admin-center/settings/usage-billing",
				icon: <AdminCenterIcons.UsageBilling />,
			},
			{
				label: "Activity log",
				url: "/admin-center/settings/activity-log",
				icon: <AdminCenterIcons.ActivityLog />,
			},
			{
				label: "Organization",
				url: "/admin-center/settings/organization",
				icon: <AdminCenterIcons.Organization />,
			},
			{
				label: "Notifications",
				url: "/admin-center/settings/notification",
				icon: <AdminCenterIcons.Notifications />,
			},
			{
				label: "Authentication",
				url: "/admin-center/settings/authentication",
				icon: <AdminCenterIcons.Authentication />,
			},
			{
				label: "Opal AI",
				url: "/admin-center/settings/opal-ai",
				icon: <AdminCenterIcons.OpalAI />,
			},
			{label: "Account", url: "/admin-center/settings/account", icon: <IconUser />},
		],
	},
	{
		label: "Support",
		highlight: "admin-center/support",
		url: "/admin-center/support",
		icon: <IconCircleQuestion />,
	},
];
