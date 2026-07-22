import { Box } from "@optiaxiom/react";
import {
	IconPlus,
	IconHouse,
	IconList,
	IconChartMixed,
	IconBookOpen,
	IconStore,
	IconSparkles,
	IconFileLines,
	IconGear,
} from "@optiaxiom/icons";
import IconResourceManagement from "@/app/cmp/assets/resource-management.svg";

// Figma's Sidenav "Add" item is a plus glyph on a circular accent-green badge
// (node 19270:7115, fill var(--colors/fg/accent/base, #abff44)) — there's no
// matching semantic token in the currently-installed @optiaxiom/react theme
// (grepped the compiled CSS for both the token name and this literal hex —
// neither exists), so the exact Figma value is hardcoded here rather than
// guessing at a token that might resolve to a different color.
function CreateIcon() {
	return (
		<Box
			alignItems="center"
			display="flex"
			justifyContent="center"
			style={{ background: "#abff44", borderRadius: "999px", flexShrink: 0, height: 32, width: 32 }}
		>
			<IconPlus />
		</Box>
	);
}

// Order and icon set match Figma "Plan View (Master)" node 6507:17285 and the
// Axiom Design System "Sidenav Products/CMP_LIVE" component (node 19270:7209):
// +, Home, Plan, Dashboard, Resource management, Library, Store, Work Request.
// Icon-to-Figma-glyph mapping (Optiaxiom icon names mirror Material Symbol names,
// so these were verified by matching the package's internal aliases 1:1 against
// each Figma layer's glyph name): IconHouse=home, IconList=format_list_bulleted,
// IconChartMixed=monitoring, IconBookOpen=menu_book, IconStore=storefront,
// IconFileLines=article/"docs". "Resource management" has no Material Symbol
// equivalent in the package — it's a bespoke Optimizely icon, vendored as
// app/cmp/assets/resource-management.svg (SVGR import, fill="currentColor" so
// it themes like every other nav icon).
//
// Real CMP has no auto-generated page-title headings — every visible entry below sets
// hidePageHeader: true (or customLayout: true, which bypasses the whole template wrapper
// including the heading) so app/components/template.tsx doesn't render one. New entries
// should follow the same rule.
export const cmpNav = [
	{
		label: "Create",
		icon: <CreateIcon />,
		isMenuTrigger: true,
		menuOptions: [
			{label: "Campaign", url: "/cmp/create/campaign"},
			{label: "Task", url: "/cmp/create/task"},
			{label: "Hypothesis", url: "/cmp/create/hypothesis"},
			{label: "Event", url: "/cmp/create/event"},
			{label: "Milestone", url: "/cmp/create/milestone"},
			{label: "Work Request", url: "/cmp/create/work-request"},
			{label: "Pitch Request", url: "/cmp/create/pitch-request"},
		],
	},
	{
		label: "Home",
		url: "/cmp/dashboard",
		highlight: "/cmp/dashboard",
		icon: <IconHouse />,
		hidePageHeader: true,
	},
	{
		label: "Plan",
		url: "/cmp/plan-view",
		// Task detail pages highlight Plan in the sidebar
		highlight: ["/cmp/plan-view", "/cmp/task/"],
		icon: <IconList />,
		// PlanViewPage is a self-contained full-bleed page (own tabs/toolbar/table/footer,
		// own padding throughout) — it was built to bypass the standard page wrapper, but
		// this flag was never set, so it was rendering nested inside the generated "Plan"
		// heading + p="32" bg="bg.page" card, which produced both the oversized title and
		// the mismatched background (the page's own white sections floating inside that
		// wrapper's tinted padding instead of matching the live product's flush layout).
		customLayout: true,
	},
	{
		label: "Dashboard",
		url: "/cmp/reports",
		highlight: "/cmp/reports",
		icon: <IconChartMixed />,
		hidePageHeader: true,
	},
	{
		label: "Resource Management",
		url: "/cmp/resource-management",
		highlight: "/cmp/resource-management",
		// NavItem wraps every icon in its own <Icon> component, which applies a CSS
		// class forcing `height: var(--ax-size-2xs)` (16px) + `width: auto`. For
		// @optiaxiom/icons components that's overridden by the icon's own (more
		// specific-order) 20px class, but a raw SVGR-imported file has no such
		// class to compete with it — so plain width/height HTML attributes (which
		// CSS always outranks) were silently overridden and had no visible effect.
		// An inline `style` wins over any external stylesheet class, which is why
		// this is set via style, not width/height props.
		icon: <IconResourceManagement style={{ width: 20, height: 20 }} />,
		hidePageHeader: true,
	},
	{
		label: "Library",
		url: "/cmp/library",
		highlight: "/cmp/library",
		icon: <IconBookOpen />,
		hidePageHeader: true,
	},
	{
		label: "Store",
		url: "/cmp/stock-images",
		highlight: "/cmp/stock-images",
		icon: <IconStore />,
		hidePageHeader: true,
	},
	{
		label: "Work Request",
		url: "/cmp/work-request",
		highlight: "/cmp/work-request",
		icon: <IconFileLines />,
		hidePageHeader: true,
	},
	// Not in the Figma sidenav — kept reachable (deep links, settings sub-nav) but hidden from the rail.
	{
		label: "Idea Lab",
		url: "/cmp/idea-lab",
		highlight: "/cmp/idea-lab",
		icon: <IconSparkles />,
		hidden: true,
		hidePageHeader: true,
	},
	// Not in the Figma sidenav — reachable only through the avatar menu (Global Bar),
	// matching real CMP: there is no gear icon in the primary rail.
	{
		label: "Settings",
		highlight: "cmp/settings",
		url: "/cmp/settings",
		icon: <IconGear />,
		hidePageHeader: true,
		hidden: true,
		children: [
			{label: "Profile (Stefan Svebeck)", url: "/cmp/settings/profile"},
			{label: "Organization", url: "/cmp/settings/organization"},
			{label: "Users & Teams", url: "/cmp/settings/users-teams", separator: true},
			{label: "AI", url: "/cmp/settings/ai", separator: true},
			{label: "Assets", url: "/cmp/settings/assets"},
			{label: "Fields", url: "/cmp/settings/fields"},
			{label: "Integrations", url: "/cmp/settings/integrations"},
			{label: "Routing Rules", url: "/cmp/settings/routing-rules"},
			{label: "Strategy", url: "/cmp/settings/strategy"},
			{label: "Templates", url: "/cmp/settings/content-models"},
			{label: "Workflows", url: "/cmp/settings/workflows", separator: true},
			{label: "Reports", url: "/cmp/settings/reports"},
			{label: "Activity Log", url: "/cmp/settings/activity-log"},
			{label: "Recycle Bin", url: "/cmp/settings/recycle-bin", separator: true},
			{label: "Pitch Fields", url: "/cmp/settings/pitch-fields"},
			{label: "Social Accounts", url: "/cmp/settings/social-accounts"},
			{label: "Marketo", url: "/cmp/settings/marketo"},
			{label: "Eloqua", url: "/cmp/settings/eloqua"},
			{label: "Salesforce", url: "/cmp/settings/salesforce"},
			{label: "Apps & Webhooks", url: "/cmp/settings/apps-webhooks"},
			{
				label: "Brand Compliance",
				url: "/cmp/settings/brand-compliance",
				separator: true,
			},
		],
	},
	// Hidden entries — no sidebar item, they only carry layout flags for their route
	{
		label: "Task Detail",
		url: "/cmp/task/",
		highlight: "/cmp/task/",
		customLayout: true,
		hidden: true,
	},
	{
		label: "Opal Studio",
		url: "/cmp/opal-studio",
		highlight: "/cmp/opal-studio",
		customLayout: true,
		hideSidebar: true,
		opalCloseReturnTo: "/cmp/library",
		hidden: true,
	},
];
