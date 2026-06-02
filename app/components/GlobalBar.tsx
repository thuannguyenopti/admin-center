"use client";

import {Box, Menu, MenuContent, MenuTrigger, Button, Group} from "@optiaxiom/react";
import {Text} from "./Text";
import {useRouter, usePathname} from "next/navigation";
import {
	IconSearch,
	IconUser,
	IconUsers,
	IconSparkles,
	IconFolder,
	IconCircleDot,
	IconList,
	IconShieldCheck,
	IconCode,
	IconBolt,
	IconChevronDown,
	IconGrid,
} from "@/app/lib/axiom-icons";
import {
	IconActivity,
	IconApps,
	IconBuilding,
	IconCloud,
	IconDeviceDesktop,
	IconFileDownload,
	IconGitBranch,
	IconHelpCircle as IconHelp,
	IconLayout2,
	IconMail,
	IconMoon,
	IconShare,
	IconSunFilled,
	IconTarget,
	IconTemplate,
	IconTrash,
	IconWebhook,
} from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import {useTheme} from "@/app/hooks/useTheme";
import {useLayout} from "@/app/context/LayoutContext";
import NotificationDropdown from "./NotificationDropdown";
import { IconXmark } from "@optimizely/axiom-icons";
import { useState, useEffect, Suspense } from "react";
import { LayoutSwitcher } from "@/app/opal/im/components/LayoutSwitcher";
import { createPortal } from "react-dom";
import { VAUS, type VAU } from "@/app/opal/data/vaus";

type GlobalBarProps = {
	onOpalClick?: () => void;
};

export default function GlobalBar({onOpalClick}: GlobalBarProps) {
	const router = useRouter();
	const pathname = usePathname();
	const isCmpTaskDetail = pathname.startsWith("/cmp/task/");
	const isCmpRoute = pathname.startsWith("/cmp");
	const {theme, preference: themePreference, setPreference: setThemePreference} = useTheme();
	const light = theme === "light";
	const isOpalRoute = pathname.startsWith("/opal");
	const isImRoute = pathname.startsWith("/opal/im");
	const {codePanelControls} = useLayout();

	const handleCodeClick = () => {
		codePanelControls?.openPanel(pathname);
	};

	const vauGroup = { label: "Act as", separator: false, hidden: false };
	const vauFooterGroup = { label: "", separator: true, hidden: true };

	const [activeVAU, setActiveVAU] = useState<VAU | null>(null);
	const [switchingVAU, setSwitchingVAU] = useState<VAU | null>(null);
	const [switchVisible, setSwitchVisible] = useState(false);

	const handleSelectVAU = (vau: VAU) => {
		setSwitchingVAU(vau);
		setSwitchVisible(true);
		setTimeout(() => setSwitchVisible(false), 1400);
		setTimeout(() => {
			setSwitchingVAU(null);
			setActiveVAU(vau);
		}, 1700);
	};

	const settingsGroups = {
		userOrg: { label: "User", separator: false, hidden: true },
		ai: { label: "AI", separator: true, hidden: true },
		main: { label: "Main", separator: true, hidden: true },
		management: { label: "Management", separator: true, hidden: true },
		integrations: { label: "Integrations", separator: true, hidden: true },
		social: { label: "Social", separator: false, hidden: true },
	};

	const getCurrentProduct = () => {
		if (pathname.startsWith("/web-experimentation")) return "Web Experimentation";
		if (pathname.startsWith("/cms")) return "CMS";
		if (pathname.startsWith("/cmp")) return "CMP";
		if (pathname.startsWith("/graph")) return "Graph";
		if (pathname.startsWith("/fe-hosting")) return "Frontend Hosting";
		if (pathname.startsWith("/connect-platform")) return "Connect Platform";
		return "Opal";
	};

	if (isCmpRoute) {
		return (
			<Box
				w="full"
				h="48"
				bg="bg.default"
				style={{ gridColumn: "1 / -1", display: "flex", alignItems: "center" }}
				borderB="1"
				borderColor="border.tertiary"
				className="global-bar cmp-v3-global-bar"
			>
				<Box
					w="full"
					px="20"
					display="flex"
					alignItems="center"
					justifyContent="space-between"
					style={{ minHeight: 48 }}
				>
					<Box display="flex" alignItems="center" gap="16">
						<Link href="/cmp/library" style={{ display: "flex", alignItems: "center" }}>
							<Image
								src="/optimizely-wordmark.svg"
								alt="Optimizely"
								width={130}
								height={30}
								priority
								style={{ height: 30, width: "auto" }}
							/>
						</Link>
						<Button appearance="subtle" size="md" icon={<IconGrid size={18} />} aria-label="App switcher" />
						<Menu
							options={[
								{
									label: "Content Marketing Platform",
									execute: () => router.push("/cmp/library"),
								},
								{
									label: "Opal",
									execute: () => router.push("/opal"),
								},
								{
									label: "Content Management System",
									execute: () => router.push("/cms/dashboard"),
								},
								{
									label: "Web Experimentation",
									execute: () => router.push("/web-experimentation"),
								},
							]}
						>
							<MenuTrigger asChild>
								<Button
									appearance="subtle"
									size="md"
									icon={<IconChevronDown size={14} />}
									iconPosition="end"
									style={{ fontWeight: 500 }}
								>
									Content Marketing Platform
								</Button>
							</MenuTrigger>
							<MenuContent />
						</Menu>
					</Box>
					<Box display="flex" alignItems="center" gap="8">
						<Button
							appearance="default"
							size="md"
							icon={<IconBolt size={14} />}
							onClick={onOpalClick}
							style={{
								borderColor: "var(--ax-colors-border-accent)",
								boxShadow: "inset 0 0 0 1px var(--ax-colors-border-accent)",
								fontWeight: 600,
							}}
						>
							Ask Opal
						</Button>
						<Button appearance="subtle" size="md" icon={<IconSearch size={20} />} aria-label="Search" />
						<NotificationDropdown />
						<Button appearance="subtle" size="md" icon={<IconHelp size={20} />} aria-label="Help" />
						<Button appearance="subtle" size="md" aria-label="Account" style={{ minWidth: 32, padding: 0 }}>
							<Image
								src={activeVAU?.avatar ?? "/avatars/user.png"}
								alt={activeVAU?.name ?? "Account"}
								width={28}
								height={28}
								style={{ borderRadius: 999 }}
							/>
						</Button>
					</Box>
				</Box>
			</Box>
		);
	}

	return (
		<Box
			w="full"
			bg="bg.default"
			style={{gridColumn: "1 / -1"}}
			borderB="1"
			borderColor="border.tertiary"
			display="flex"
			flexDirection="column"
			className="global-bar"
		>
			{/* Managing-as banner */}
			{activeVAU && isOpalRoute && (
				<Box
					display="flex"
					alignItems="center"
					gap="8"
					px="16"
					py="8"
					style={{
						background: "var(--ax-colors-bg-information-subtle)",
						borderBottom: "1px solid var(--ax-colors-border-information)",
					}}
				>
					<Text fontSize="sm">
						You are acting as{" "}
					</Text>
					<Image src={activeVAU.avatar} alt="" width={18} height={18} style={{ borderRadius: 999, flexShrink: 0 }} />
					<Text fontSize="sm" fontWeight="600">{activeVAU.name}</Text>
					<Text fontSize="sm" color="fg.secondary">{activeVAU.templateName}</Text>
					<Box style={{ flex: 1 }} />
					<Button
						appearance="subtle"
						size="sm"
						icon={<IconXmark size={14} />}
						aria-label="Exit"
						onClick={() => setActiveVAU(null)}
					>
						Exit
					</Button>
				</Box>
			)}

			{/* Nav row */}
			<Box
				display="flex"
				alignItems="center"
				justifyContent="space-between"
				py="12"
				px="12"
			>
			<Box display="flex" alignItems="center" gap="12">
				<Link href={"/"}>
					{light ? (
					<svg
							width="131"
							height="32"
							viewBox="0 0 131 32"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
								d="M51.3301 1.31274H49.7497C48.6553 1.31274 47.7314 2.23668 47.7314 3.3548C47.7314 4.44871 48.6553 5.37237 49.7497 5.37237H51.3301C52.4242 5.37237 53.3481 4.44871 53.3481 3.3548C53.3481 2.23668 52.4242 1.31274 51.3301 1.31274Z"
								fill="#ABFF44"
						/>
						<path
								d="M70.4914 6.27209C69.0566 6.27209 67.6707 6.80695 66.5523 7.99801C66.0173 6.70964 64.9716 6.27209 63.4398 6.27209C62.127 6.27209 60.8624 6.87978 59.7926 7.99801V6.53949H54.6621V22.2193H60.06V10.6965C60.2302 10.4534 60.5463 10.3075 60.9353 10.3075C61.4704 10.3075 61.7136 10.5263 61.7136 11.0855V22.2193H67.1115V10.6965C67.2818 10.4534 67.5978 10.3075 67.9868 10.3075C68.5217 10.3075 68.7649 10.5263 68.7649 11.0855V22.2193H74.163V10.3075C74.163 7.60915 72.874 6.27209 70.4914 6.27209Z"
								fill="#ABFF44"
						/>
						<path
								d="M53.2514 6.53955H47.8535V22.2194H53.2514V6.53955Z"
								fill="#ABFF44"
						/>
						<path
								d="M80.97 6.53955H75.5721V22.2194H80.97V6.53955Z"
								fill="#ABFF44"
						/>
						<path
								d="M44.327 2.77148H38.9291V6.53945H37.0324V10.4533H38.9291V18.2081C38.9291 21.0522 40.1448 22.2193 42.9411 22.2193H46.4426V18.3054H44.9349C44.5216 18.3054 44.3271 18.1596 44.3271 17.7463V10.4534H46.4427V6.53951H44.3271L44.327 2.77148Z"
								fill="#ABFF44"
							/>
							<path
								d="M12.7418 2.40674C7.58704 2.40674 4.25586 6.27202 4.25586 12.3736C4.25586 18.5727 7.58704 22.4866 12.7418 22.4866C17.8725 22.4866 21.2035 18.5727 21.2035 12.3736C21.2035 6.27202 17.8725 2.40674 12.7418 2.40674ZM12.7175 17.9407C11.1857 17.9407 10.1645 15.8013 10.1645 12.3736C10.1645 9.04311 11.1857 6.9527 12.7175 6.9527C14.2252 6.9527 15.2707 9.04317 15.2707 12.3736C15.2707 15.8013 14.2252 17.9407 12.7175 17.9407Z"
								fill="#ABFF44"
							/>
							<path
								d="M31.0996 6.2478C29.738 6.2478 28.6437 6.83117 27.8414 7.99797C27.8414 7.53612 27.7927 7.02563 27.744 6.53946H22.4677C22.5163 7.75489 22.5407 8.946 22.5407 10.1616V27.1541H27.9385V21.1981C28.7409 22.0248 29.7623 22.4624 30.978 22.4624C34.4308 22.4624 36.3759 19.5208 36.3759 14.4401C36.3759 9.28634 34.4795 6.2478 31.0996 6.2478ZM29.3245 18.5971C28.3518 18.5728 27.817 17.0412 27.817 14.4888C27.817 11.9119 28.3519 10.2103 29.3245 10.2103C30.3215 10.186 30.8807 11.8876 30.8807 14.4888C30.8807 17.0168 30.3215 18.5728 29.3245 18.5971Z"
								fill="#ABFF44"
							/>
							<path
								d="M123.473 11.0368L122.913 15.4125L122.257 11.1098L121.284 6.53955H115.789L120.214 22.1707L120.068 22.8028C120.02 23.0702 119.825 23.1917 119.582 23.1917H116.591V27.1542H120.458C123.132 27.1542 124.47 25.9874 125.126 23.4591L129.527 6.53955H124.275L123.473 11.0368Z"
								fill="#ABFF44"
							/>
							<path
								d="M114.477 2.77148H109.079V22.2193H114.477V2.77148Z"
								fill="#ABFF44"
							/>
							<path
								d="M79.0498 1.31274H77.4694C76.375 1.31274 75.4512 2.23668 75.4512 3.3548C75.4512 4.44871 76.375 5.37237 77.4694 5.37237H79.0498C80.144 5.37237 81.0679 4.44871 81.0679 3.3548C81.0679 2.23668 80.144 1.31274 79.0498 1.31274Z"
								fill="#ABFF44"
							/>
							<path
								d="M100.959 6.2478C96.6063 6.2478 93.7129 9.45644 93.7129 14.3673C93.7129 19.375 96.5089 22.4867 100.934 22.4867C104.63 22.4867 107.256 20.0313 107.694 16.7495H102.345C102.15 17.9166 101.518 18.7187 100.788 18.7187C99.7915 18.7187 99.2324 17.4789 99.1351 15.4125H107.743C108.35 10.0401 105.53 6.2478 100.959 6.2478ZM99.1351 12.5196C99.4026 10.9881 100.035 10.0401 100.837 10.0401C101.639 10.0401 102.223 10.9639 102.466 12.5196H99.1351Z"
								fill="#ABFF44"
							/>
							<path
								d="M92.9091 10.3075V6.53955H82.3807V10.4534H86.9764L82.3807 18.6214V22.2193H93.0064V18.3055H88.4108L92.9091 10.3075Z"
								fill="#ABFF44"
							/>
							<path
								d="M29.3249 10.2103C28.3523 10.2103 27.8174 11.9119 27.8174 14.4888C27.8174 17.0412 28.3523 18.5728 29.3249 18.5971C30.3219 18.5728 30.8811 17.0168 30.8811 14.4888C30.8811 11.8876 30.3219 10.186 29.3249 10.2103Z"
								fill="#123810"
							/>
							<path
								d="M100.835 10.0399C100.033 10.0399 99.4011 10.9878 99.1338 12.519H102.464C102.221 10.9635 101.638 10.0399 100.835 10.0399Z"
								fill="#123810"
							/>
							<path
								d="M129.527 5.22654H124.275C123.838 5.22654 123.619 5.29948 123.327 5.61573L122.598 6.3693L122.573 6.2721C122.427 5.61573 121.99 5.22659 121.285 5.22659H115.789V2.77153C115.789 2.01796 115.157 1.43431 114.476 1.43431H109.078C108.689 1.43431 108.397 1.60467 108.154 1.84781L105.212 4.7891C104.993 5.00782 104.823 5.34816 104.823 5.71304V5.81024C103.753 5.22654 102.464 4.91056 100.957 4.91056C98.6228 4.91056 96.3613 5.51825 94.246 8.11947V6.53944C94.246 5.85887 93.6625 5.22654 92.9085 5.22654H81.7237C82.0641 4.69174 82.3072 4.01116 82.3072 3.33053C82.3072 1.36131 80.7023 0 78.7815 0H77.736C76.7389 0 75.8636 0.413284 75.2558 1.02097L71.4139 4.86199L71.2923 4.98351C71.0734 4.95914 70.7817 4.93493 70.49 4.93493C69.2254 4.93493 67.9368 5.27517 66.8184 6.1019C66.0159 5.29948 65.1161 4.93493 63.7303 4.93493C62.6361 4.93493 61.6393 5.25091 60.7394 5.88318C60.6178 5.44536 60.2775 5.22654 59.7183 5.22654H54.0043C54.3447 4.69174 54.5878 4.01116 54.5878 3.33053C54.5878 1.36131 52.9828 0 51.0621 0H50.0166C49.0195 0 48.1684 0.38897 47.5363 1.02097L45.6642 2.86868V2.77147C45.6642 2.06653 45.0803 1.45862 44.3267 1.45862H38.9287C38.5397 1.45862 38.2236 1.60462 37.9805 1.89639L35.0626 4.7891C34.9167 4.93499 34.6736 5.34816 34.6736 5.71304V6.17489C33.6281 5.29953 32.5338 4.91062 31.2694 4.91062C30.3942 4.91062 29.4457 5.15371 28.546 5.83455C28.4002 5.32385 28.0598 5.22659 27.6222 5.22659H22.4674C22.1027 5.22659 21.7866 5.37248 21.5432 5.61578L21.1055 6.05338C19.4523 2.89304 16.4615 1.06971 12.7411 1.06971C10.091 1.06971 7.61075 2.04232 5.32498 4.3273L3.50145 6.12632C1.04555 8.58138 3.05176e-05 11.6931 3.05176e-05 15.3153C3.05176e-05 22.1707 3.84182 26.7652 9.79918 26.7652C12.4494 26.7652 14.808 25.7686 16.4857 24.091L18.2851 22.2922V30.0713C18.2851 30.8249 18.8687 31.4082 19.6224 31.4082H24.996C25.4093 31.4082 25.75 31.2138 25.9445 31.0193L28.8621 28.0778C29.1053 27.8347 29.2754 27.4944 29.2754 27.1541V26.6193C30.54 26.3762 31.5612 25.8172 32.4122 24.9174L34.7709 22.5595C35.2815 25.1363 37.2265 26.4734 40.4119 26.4734H90.0638C90.5014 26.4734 90.8175 26.279 91.0121 26.0845L92.3493 24.7229C93.9056 26.1331 95.8264 26.7651 98.0149 26.7651C100.276 26.7651 102.343 25.89 103.778 24.4555L104.823 23.4103V25.1605C104.823 25.8899 105.407 26.4734 106.136 26.4734H113.017V30.0712C113.017 30.8248 113.601 31.4081 114.355 31.4081H117.54C119.339 31.4081 120.822 30.8733 121.844 29.8525L124.737 26.9596C125.467 26.206 126.075 25.1362 126.415 23.8235L130.816 6.87967C131.035 5.98027 130.549 5.22654 129.527 5.22654ZM12.7412 22.4867C7.58643 22.4867 4.25525 18.5728 4.25525 12.3737C4.25525 6.2721 7.58643 2.40682 12.7412 2.40682C17.8719 2.40682 21.2029 6.2721 21.2029 12.3737C21.2029 18.5728 17.8719 22.4867 12.7412 22.4867ZM30.9778 22.4624C29.7621 22.4624 28.7406 22.0248 27.9383 21.1981V27.1542H22.5404V10.1617C22.5404 8.94604 22.516 7.75493 22.4674 6.5395H27.7438C27.7924 7.02567 27.8411 7.53616 27.8411 7.99801C28.6434 6.83116 29.7377 6.24784 31.0993 6.24784C34.4792 6.24784 36.3756 9.28639 36.3756 14.4402C36.3756 19.5209 34.4305 22.4624 30.9778 22.4624ZM46.4423 10.4533H44.3267V17.7463C44.3267 18.1596 44.5213 18.3054 44.9345 18.3054H46.4422V22.2193H42.9408C40.1444 22.2193 38.9287 21.0523 38.9287 18.2081V10.4533H37.032V6.53944H38.9287V2.77147H44.3267V6.53944H46.4422L46.4423 10.4533ZM53.2504 22.2193H47.8525V6.53944H53.2504V22.2193ZM51.3296 5.37242H49.7492C48.6548 5.37242 47.731 4.44876 47.731 3.35485C47.731 2.23673 48.6548 1.31279 49.7492 1.31279H51.3296C52.4238 1.31279 53.3476 2.23673 53.3476 3.35485C53.3476 4.44876 52.4238 5.37242 51.3296 5.37242ZM74.1617 22.2193H68.7636V11.0854C68.7636 10.5263 68.5204 10.3075 67.9855 10.3075C67.5964 10.3075 67.2804 10.4533 67.1102 10.6964V22.2193H61.7123V11.0854C61.7123 10.5263 61.4692 10.3075 60.934 10.3075C60.545 10.3075 60.2289 10.4533 60.0587 10.6964V22.2193H54.6608V6.53944H59.7913V7.99796C60.8611 6.87979 62.1256 6.27204 63.4385 6.27204C64.9703 6.27204 66.016 6.70959 66.5509 7.99796C67.6693 6.8069 69.0552 6.27204 70.49 6.27204C72.8727 6.27204 74.1616 7.60904 74.1616 10.3074L74.1617 22.2193ZM80.9697 22.2193H75.5718V6.53944H80.9697V22.2193ZM79.049 5.37242H77.4686C76.3742 5.37242 75.4503 4.44876 75.4503 3.35485C75.4503 2.23673 76.3742 1.31279 77.4686 1.31279H79.049C80.1432 1.31279 81.067 2.23673 81.067 3.35485C81.067 4.44876 80.1432 5.37242 79.049 5.37242ZM93.0059 22.2193H82.3802V18.6214L86.9758 10.4533H82.3802V6.5395H92.9085V10.3075L88.4102 18.3054H93.0059V22.2193ZM107.741 15.4125H99.1334C99.2307 17.4789 99.7898 18.7187 100.787 18.7187C101.516 18.7187 102.149 17.9166 102.343 16.7494H107.692C107.255 20.0313 104.628 22.4867 100.933 22.4867C96.5072 22.4867 93.7112 19.375 93.7112 14.3673C93.7112 9.45642 96.6046 6.24778 100.957 6.24778C105.528 6.24778 108.349 10.0401 107.741 15.4125ZM114.476 22.2193H109.078V2.77147H114.476V22.2193ZM125.126 23.459C124.47 25.9873 123.133 27.1542 120.458 27.1542H116.592V23.1916H119.583C119.826 23.1916 120.02 23.0701 120.069 22.8027L120.215 22.1706L115.789 6.5395H121.285L122.257 11.1097L122.914 15.4125L123.473 11.0368L124.275 6.5395H129.528L125.126 23.459Z"
								fill="#123810"
							/>
							<path
								d="M12.717 6.95276C11.1853 6.95276 10.1641 9.04322 10.1641 12.3737C10.1641 15.8014 11.1853 17.9407 12.717 17.9407C14.2247 17.9407 15.2702 15.8014 15.2702 12.3737C15.2702 9.04317 14.2247 6.95276 12.717 6.95276Z"
								fill="#123810"
							/>
						</svg>
					) : (
						<svg
							width="131"
							height="32"
							viewBox="0 0 131 32"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								d="M29.3249 10.2103C28.3523 10.2103 27.8174 11.9119 27.8174 14.4888C27.8174 17.0412 28.3523 18.5728 29.3249 18.5971C30.3219 18.5728 30.8811 17.0168 30.8811 14.4888C30.8811 11.8876 30.3219 10.186 29.3249 10.2103Z"
								fill="#D2DEC2"
							/>
							<path
								d="M100.836 10.0399C100.033 10.0399 99.4012 10.9878 99.1338 12.5191H102.464C102.221 10.9635 101.638 10.0399 100.836 10.0399Z"
								fill="#D2DEC2"
							/>
							<path
								d="M129.527 5.22654H124.275C123.838 5.22654 123.619 5.29948 123.327 5.61573L122.598 6.3693L122.573 6.2721C122.427 5.61573 121.99 5.22659 121.285 5.22659H115.789V2.77153C115.789 2.01796 115.157 1.43431 114.476 1.43431H109.078C108.689 1.43431 108.397 1.60467 108.154 1.84781L105.212 4.7891C104.993 5.00782 104.823 5.34816 104.823 5.71304V5.81024C103.753 5.22654 102.464 4.91056 100.957 4.91056C98.6227 4.91056 96.3612 5.51825 94.246 8.11947V6.53944C94.246 5.85887 93.6625 5.22654 92.9085 5.22654H81.7236C82.064 4.69174 82.3071 4.01116 82.3071 3.33053C82.3071 1.36131 80.7023 0 78.7815 0H77.7359C76.7388 0 75.8635 0.413284 75.2557 1.02097L71.4138 4.86199L71.2923 4.98351C71.0734 4.95914 70.7817 4.93493 70.4899 4.93493C69.2254 4.93493 67.9367 5.27517 66.8184 6.1019C66.0159 5.29948 65.1161 4.93493 63.7303 4.93493C62.6361 4.93493 61.6393 5.25091 60.7394 5.88318C60.6178 5.44536 60.2774 5.22654 59.7182 5.22654H54.0042C54.3446 4.69174 54.5877 4.01116 54.5877 3.33053C54.5877 1.36131 52.9827 0 51.062 0H50.0165C49.0194 0 48.1684 0.38897 47.5363 1.02097L45.6641 2.86868V2.77147C45.6641 2.06653 45.0803 1.45862 44.3266 1.45862H38.9287C38.5397 1.45862 38.2236 1.60462 37.9805 1.89639L35.0626 4.7891C34.9167 4.93499 34.6735 5.34816 34.6735 5.71304V6.17489C33.628 5.29953 32.5338 4.91062 31.2694 4.91062C30.3941 4.91062 29.4457 5.15371 28.546 5.83455C28.4001 5.32385 28.0598 5.22659 27.6221 5.22659H22.4674C22.1026 5.22659 21.7866 5.37248 21.5432 5.61578L21.1055 6.05338C19.4522 2.89304 16.4615 1.06971 12.7411 1.06971C10.091 1.06971 7.61072 2.04232 5.32495 4.3273L3.50142 6.12632C1.04552 8.58138 0 11.6931 0 15.3153C0 22.1707 3.84178 26.7652 9.79915 26.7652C12.4493 26.7652 14.808 25.7686 16.4857 24.091L18.2851 22.2922V30.0713C18.2851 30.8249 18.8687 31.4082 19.6224 31.4082H24.9959C25.4093 31.4082 25.75 31.2138 25.9445 31.0193L28.8621 28.0778C29.1052 27.8347 29.2754 27.4944 29.2754 27.1541V26.6193C30.5399 26.3762 31.5611 25.8172 32.4122 24.9174L34.7708 22.5595C35.2814 25.1363 37.2265 26.4734 40.4119 26.4734H90.0638C90.5014 26.4734 90.8175 26.279 91.012 26.0845L92.3493 24.7229C93.9056 26.1331 95.8264 26.7651 98.0149 26.7651C100.276 26.7651 102.343 25.89 103.778 24.4555L104.823 23.4103V25.1605C104.823 25.8899 105.407 26.4734 106.136 26.4734H113.017V30.0712C113.017 30.8248 113.601 31.4081 114.355 31.4081H117.54C119.339 31.4081 120.822 30.8733 121.844 29.8525L124.737 26.9596C125.467 26.206 126.075 25.1362 126.415 23.8235L130.816 6.87967C131.035 5.98027 130.549 5.22654 129.527 5.22654ZM12.7412 22.4867C7.5864 22.4867 4.25522 18.5728 4.25522 12.3737C4.25522 6.2721 7.5864 2.40682 12.7412 2.40682C17.8719 2.40682 21.2029 6.2721 21.2029 12.3737C21.2029 18.5728 17.8719 22.4867 12.7412 22.4867ZM30.9777 22.4624C29.762 22.4624 28.7406 22.0248 27.9382 21.1981V27.1542H22.5404V10.1617C22.5404 8.94604 22.516 7.75493 22.4674 6.5395H27.7437C27.7924 7.02567 27.8411 7.53616 27.8411 7.99801C28.6434 6.83116 29.7377 6.24784 31.0993 6.24784C34.4792 6.24784 36.3756 9.28639 36.3756 14.4402C36.3756 19.5209 34.4305 22.4624 30.9777 22.4624ZM46.4423 10.4533H44.3267V17.7463C44.3267 18.1596 44.5212 18.3054 44.9345 18.3054H46.4422V22.2193H42.9407C40.1444 22.2193 38.9287 21.0523 38.9287 18.2081V10.4533H37.032V6.53944H38.9287V2.77147H44.3266V6.53944H46.4422L46.4423 10.4533ZM53.2503 22.2193H47.8525V6.53944H53.2503V22.2193ZM51.3296 5.37242H49.7492C48.6548 5.37242 47.7309 4.44876 47.7309 3.35485C47.7309 2.23673 48.6548 1.31279 49.7492 1.31279H51.3296C52.4237 1.31279 53.3476 2.23673 53.3476 3.35485C53.3476 4.44876 52.4237 5.37242 51.3296 5.37242ZM74.1617 22.2193H68.7635V11.0854C68.7635 10.5263 68.5203 10.3075 67.9854 10.3075C67.5964 10.3075 67.2804 10.4533 67.1101 10.6964V22.2193H61.7123V11.0854C61.7123 10.5263 61.4691 10.3075 60.9339 10.3075C60.5449 10.3075 60.2288 10.4533 60.0587 10.6964V22.2193H54.6607V6.53944H59.7912V7.99796C60.861 6.87979 62.1256 6.27204 63.4385 6.27204C64.9702 6.27204 66.016 6.70959 66.5509 7.99796C67.6693 6.8069 69.0552 6.27204 70.49 6.27204C72.8727 6.27204 74.1616 7.60904 74.1616 10.3074L74.1617 22.2193ZM80.9697 22.2193H75.5718V6.53944H80.9697V22.2193ZM79.049 5.37242H77.4686C76.3742 5.37242 75.4503 4.44876 75.4503 3.35485C75.4503 2.23673 76.3742 1.31279 77.4686 1.31279H79.049C80.1431 1.31279 81.067 2.23673 81.067 3.35485C81.067 4.44876 80.1431 5.37242 79.049 5.37242ZM93.0058 22.2193H82.3801V18.6214L86.9758 10.4533H82.3801V6.5395H92.9085V10.3075L88.4102 18.3054H93.0058V22.2193ZM107.741 15.4125H99.1333C99.2307 17.4789 99.7898 18.7187 100.787 18.7187C101.516 18.7187 102.148 17.9166 102.343 16.7494H107.692C107.255 20.0313 104.628 22.4867 100.933 22.4867C96.5072 22.4867 93.7112 19.375 93.7112 14.3673C93.7112 9.45642 96.6045 6.24778 100.957 6.24778C105.528 6.24778 108.349 10.0401 107.741 15.4125ZM114.476 22.2193H109.078V2.77147H114.476V22.2193ZM125.126 23.459C124.47 25.9873 123.133 27.1542 120.458 27.1542H116.592V23.1916H119.582C119.826 23.1916 120.02 23.0701 120.069 22.8027L120.215 22.1706L115.789 6.5395H121.285L122.257 11.1097L122.914 15.4125L123.473 11.0368L124.275 6.5395H129.528L125.126 23.459Z"
								fill="#D2DEC2"
							/>
							<path
								d="M12.718 6.95276C11.1862 6.95276 10.165 9.04322 10.165 12.3737C10.165 15.8014 11.1862 17.9407 12.718 17.9407C14.2257 17.9407 15.2712 15.8014 15.2712 12.3737C15.2712 9.04317 14.2257 6.95276 12.718 6.95276Z"
								fill="#D2DEC2"
						/>
					</svg>
					)}
				</Link>
				<Group gap="4">
					<Button
						appearance="subtle"
						addonAfter={<IconChevronDown size="20" />}
						size="md"
						icon={<IconBuilding />}
					>
						Stride
					</Button>
				<Menu
					options={[
						{
							label: "Opal",
							execute: () => router.push("/opal"),
						},
						{
							label: "Content Management System",
							execute: () => router.push("/cms/dashboard"),
						},
						{
							label: "Web Experimentation",
							execute: () => router.push("/web-experimentation"),
						},
						{
							label: "Content Marketing Platform",
							execute: () => router.push("/cmp/dashboard"),
						},
						{
							label: "Connect Platform",
							disabledReason: "TBD",
						},
						{
							label: "Data Platform",
							disabledReason: "TBD",
						},
						{
							label: "Analytics",
							disabledReason: "TBD",
						},
						{
							label: "Frontend Hosting",
							disabledReason: "TBD",
						},
					]}
				>
						<MenuTrigger
							addonAfter={<IconChevronDown size="20" />}
							appearance="subtle"
							iconPosition="start"
							icon={<IconLayout2 />}
							aria-label="Select product"
						>
								{getCurrentProduct()}
					</MenuTrigger>
					<MenuContent />
				</Menu>
				</Group>
			</Box>

			<Box display="flex" alignItems="center" gap="4">
				{isOpalRoute ? (
					<>
						<Suspense fallback={null}>
							<LayoutSwitcher />
						</Suspense>
						<Button appearance="subtle" size="md" icon={<IconSearch size={20} />} aria-label="Search" />
						<NotificationDropdown />
						<Button appearance="subtle" size="md" icon={<IconHelp size={20} />} aria-label="Help" />
						<Menu
							options={[
								{
									label: "Light",
									addon: <IconSunFilled size={16} />,
									...(themePreference === "light" && { selected: true }),
									execute: () => setThemePreference("light"),
								},
								{
									label: "Dark",
									addon: <IconMoon size={16} />,
									...(themePreference === "dark" && { selected: true }),
									execute: () => setThemePreference("dark"),
								},
								{
									label: "System",
									addon: <IconDeviceDesktop size={16} />,
									...(themePreference === "system" && { selected: true }),
									execute: () => setThemePreference("system"),
								},
							]}
						>
							<MenuTrigger asChild>
								<Button
									appearance="subtle"
									size="md"
									icon={{
										system: <IconDeviceDesktop />,
										light: <IconSunFilled />,
										dark: <IconMoon />,
									}[themePreference]}
									aria-label="Theme"
								/>
							</MenuTrigger>
							<MenuContent />
						</Menu>
						<Menu
							options={[
								...VAUS.map(vau => ({
									group: vauGroup,
									label: vau.name,
									description: vau.templateName,
									addon: <Image src={vau.avatar} alt="" width={20} height={20} style={{ borderRadius: 999, flexShrink: 0 }} />,
									execute: () => handleSelectVAU(vau),
								})),
								{
									group: vauFooterGroup,
									label: "Manage Virtual Teammates",
									addon: <IconUsers size={16} />,
									execute: () => {},
								},
							]}
						>
							<MenuTrigger asChild>
								<Button appearance="subtle" size="md" aria-label={activeVAU ? activeVAU.name : "Jamie Chen"}>
									{activeVAU ? (
										<Image src={activeVAU.avatar} alt={activeVAU.name} width={24} height={24} style={{ borderRadius: 999, flexShrink: 0 }} />
									) : (
										<Image src="/avatars/avatar-3.png" alt="Jamie Chen" width={24} height={24} style={{ borderRadius: 999, flexShrink: 0, objectFit: "cover" }} />
									)}
								</Button>
							</MenuTrigger>
							<MenuContent style={{ minWidth: "220px" }} />
						</Menu>
					</>
				) : (
				<>
				<Menu
					options={[
						{
							label: "Light",
							addon: <IconSunFilled size={16} />,
							...(themePreference === "light" && {selected: true}),
							execute: () => setThemePreference("light"),
						},
						{
							label: "Dark",
							addon: <IconMoon size={16} />,
							...(themePreference === "dark" && {selected: true}),
							execute: () => setThemePreference("dark"),
						},
						{
							label: "System",
							addon: <IconDeviceDesktop size={16} />,
							...(themePreference === "system" && {selected: true}),
							execute: () => setThemePreference("system"),
						},
					]}
				>
					<MenuTrigger asChild>
						<Button
							appearance="subtle"
							size="md"
							icon={{
								system: <IconDeviceDesktop />,
								light: <IconSunFilled />,
								dark: <IconMoon />,
							}[themePreference]}
							aria-label="Theme"
							className="capitalize"
						>
							{themePreference}
						</Button>
					</MenuTrigger>
					<MenuContent />
				</Menu>
				<Button appearance="subtle" size="md" aria-label="Opal AI Assistant" onClick={onOpalClick}>
					<Box display="flex" alignItems="center" gap="8">
						<Image src="/opal-orb.png" alt="Opal" width={20} height={20} />
						{isCmpTaskDetail && (
							<Text fontSize="md" fontWeight="500" color="fg.default">
								Ask Opal
							</Text>
						)}
					</Box>
				</Button>
				<Button appearance="subtle" size="md" icon={<IconSearch size={20} />} aria-label="Search" />
				<NotificationDropdown />
				<Button appearance="subtle" size="md" icon={<IconHelp size={20} />} aria-label="Help" />
				<Button
					appearance="subtle"
					size="md"
					icon={<IconCode size={20} />}
					aria-label="View source code"
					onClick={handleCodeClick}
				/>
				<Menu
					options={[
						...VAUS.map(vau => ({
							group: { label: "Act as", separator: false, hidden: false },
							label: vau.name,
							description: vau.templateName,
							addon: (
								<Image
									src={vau.avatar}
									alt={vau.name}
									width={20}
									height={20}
									style={{ borderRadius: 999, flexShrink: 0 }}
									unoptimized
								/>
							),
							execute: () => handleSelectVAU(vau),
						})),
						{
							group: { label: "Manage", separator: true, hidden: true },
							label: "Manage Virtual Teammates",
							addon: <IconUsers size={16} />,
							execute: () => router.push("/opal/virtual-teammates"),
						},
						...(isCmpRoute ? [
							{
								group: settingsGroups.userOrg,
								label: "Stefan Svebeck (Admin)",
								addon: <IconUser size={16} />,
							},
							{
								group: settingsGroups.userOrg,
								label: "Organization",
								addon: <IconBuilding size={16} />,
							},
							{
								group: settingsGroups.userOrg,
								label: "Users & Teams",
								addon: <IconUsers size={16} />,
							},
							{
								group: settingsGroups.ai,
								label: "AI",
								addon: <IconSparkles size={16} />,
							},
							{
								group: settingsGroups.main,
								label: "Assets",
								addon: <IconFolder size={16} />,
							},
							{
								group: settingsGroups.main,
								label: "Fields",
								addon: <IconCircleDot size={16} />,
							},
							{
								group: settingsGroups.main,
								label: "Integrations",
								addon: <IconApps size={16} />,
							},
							{
								group: settingsGroups.main,
								label: "Routing Rules",
								addon: <IconGitBranch size={16} />,
							},
							{
								group: settingsGroups.main,
								label: "Strategy",
								addon: <IconTarget size={16} />,
							},
							{
								group: settingsGroups.main,
								label: "Templates",
								addon: <IconTemplate size={16} />,
								execute: () => router.push("/cmp/settings/content-models"),
							},
							{
								group: settingsGroups.main,
								label: "Workflows",
								addon: <IconList size={16} />,
							},
							{
								group: settingsGroups.management,
								label: "Reports",
								addon: <IconFileDownload size={16} />,
							},
							{
								group: settingsGroups.management,
								label: "Activity Log",
								addon: <IconActivity size={16} />,
							},
							{
								group: settingsGroups.management,
								label: "Recycle Bin",
								addon: <IconTrash size={16} />,
							},
							{
								group: settingsGroups.integrations,
								label: "Marketo",
								addon: <IconMail size={16} />,
							},
							{
								group: settingsGroups.integrations,
								label: "Eloqua",
								addon: <IconMail size={16} />,
							},
							{
								group: settingsGroups.integrations,
								label: "Salesforce",
								addon: <IconCloud size={16} />,
							},
							{
								group: settingsGroups.integrations,
								label: "Apps & Webhooks",
								addon: <IconWebhook size={16} />,
							},
							{
								group: settingsGroups.integrations,
								label: "Brand Compliance",
								addon: <IconShieldCheck size={16} />,
							},
							{
								group: settingsGroups.social,
								label: "Social Accounts",
								addon: <IconShare size={16} />,
							},
						] : []),
					]}
				>
					<MenuTrigger icon={!isCmpTaskDetail && <IconUser />} appearance="subtle" size="sm" aria-label="User profile">
							{isCmpTaskDetail && (
								<Image
									src="/avatars/aamr-fakhry.png"
									alt="User profile"
									width={24}
									height={24}
									style={{borderRadius: 999}}
								/>
							)}
					</MenuTrigger>
					<MenuContent style={{ minWidth: "240px" }} />
				</Menu>
				</>
				)}
			</Box>
			</Box>

			{/* Switching overlay */}
			{switchingVAU && typeof window !== "undefined" && createPortal(
				<div style={{
					position: "fixed", inset: 0, zIndex: 9999,
					display: "flex", alignItems: "center", justifyContent: "center",
					background: "rgba(0,0,0,0.55)",
					opacity: switchVisible ? 1 : 0,
					transition: "opacity 0.3s ease",
					pointerEvents: switchVisible ? "auto" : "none",
				}}>
					<div style={{
						background: "var(--ax-colors-bg-default)",
						borderRadius: 16,
						padding: "32px 40px",
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						gap: 16,
						minWidth: 280,
						boxShadow: "0 24px 64px rgba(0,0,0,0.24)",
					}}>
						<div style={{
							width: 64, height: 64, borderRadius: 16,
							background: "var(--ax-colors-bg-secondary)",
							display: "flex", alignItems: "center", justifyContent: "center",
							overflow: "hidden",
						}}>
							<Image src={switchingVAU.avatar} alt="" width={44} height={44} unoptimized />
						</div>
						<div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 4 }}>
							<p style={{ margin: 0, fontSize: 11, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ax-colors-fg-tertiary)" }}>Acting as</p>
							<p style={{ margin: 0, fontSize: 18, fontWeight: 600, color: "var(--ax-colors-fg-default)" }}>{switchingVAU.name}</p>
						</div>
						<div style={{ display: "flex", gap: 5 }}>
							{[0, 1, 2].map(i => (
								<div key={i} style={{
									width: 6, height: 6, borderRadius: 999,
									background: "var(--ax-colors-fg-accent)",
									animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
								}} />
							))}
						</div>
					</div>
					<style>{`@keyframes pulse { 0%,100%{opacity:0.3;transform:scale(0.8)} 50%{opacity:1;transform:scale(1)} }`}</style>
				</div>,
				document.body
			)}
		</Box>
	);
}
