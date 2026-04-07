"use client";

import {Box, Heading, Menu, MenuContent, MenuTrigger, Button, Indicator} from "@optiaxiom/react";
import {Text} from "./Text";
import {ReactNode} from "react";
import {useRouter, usePathname} from "next/navigation";
import {
	IconSearch,
	IconBell,
	IconHelp,
	IconUser,
	IconSunFilled,
	IconWashMachine,
	IconMoon,
	IconDeviceDesktop,
} from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import {useTheme} from "@/app/hooks/useTheme";

type GlobalBarProps = {
	onOpalClick?: () => void;
};

export default function GlobalBar({onOpalClick}: GlobalBarProps) {
	const router = useRouter();
	const pathname = usePathname();
	const {preference: themePreference, setPreference: setThemePreference} = useTheme();

	const getCurrentProduct = () => {
		if (pathname.startsWith("/web-experimentation")) return "Web Experimentation";
		if (pathname.startsWith("/cms")) return "CMS";
		if (pathname.startsWith("/graph")) return "Graph";
		if (pathname.startsWith("/fe-hosting")) return "Frontend Hosting";
		if (pathname.startsWith("/connect-platform")) return "Connect Platform";
		return "Opal";
	};

	return (
		<Box
			w="full"
			py="12"
			px="20"
			bg="bg.default"
			gridColumn="2"
			borderB="1"
			borderColor="border.tertiary"
			display="flex"
			alignItems="center"
			justifyContent="space-between"
		>
			<Box display="flex" alignItems="center">
				<Link href={"/"}>
					<svg
						width="24"
						viewBox="0 0 24 24"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M7.9917 13.1716V16.0595C10.1226 16.0569 12.1654 15.2073 13.6722 13.6969C15.1789 12.1866 16.0266 10.1389 16.0292 8.00293H13.148C13.1463 9.3732 12.6025 10.6869 11.6359 11.6558C10.6693 12.6247 9.35872 13.1698 7.9917 13.1716Z"
							fill="#3BE081"
						/>
						<path
							d="M7.99186 21.1269C6.63468 21.1269 5.33308 20.5864 4.37341 19.6245C3.41374 18.6625 2.8746 17.3578 2.8746 15.9974C2.8746 14.637 3.41374 13.3323 4.37341 12.3704C5.33308 11.4084 6.63468 10.868 7.99186 10.868V8.00123C6.94385 7.99973 5.90581 8.20515 4.93701 8.60578C3.9682 9.0064 3.0876 9.59438 2.34549 10.3361C1.60338 11.0779 1.01429 11.9589 0.611847 12.9289C0.209408 13.8988 0.0015053 14.9388 8.14404e-06 15.9893C-0.00148901 17.0398 0.203449 18.0803 0.603121 19.0514C1.00279 20.0225 1.58937 20.9052 2.32937 21.6491C3.06936 22.393 3.94828 22.9834 4.91594 23.3868C5.8836 23.7902 6.92105 23.9986 7.96906 24.0001H7.99186V21.1269Z"
							fill="#0037FF"
						/>
						<path
							d="M7.9917 21.1269V23.9936C10.1082 23.9936 12.1381 23.1508 13.6347 21.6506C15.1314 20.1504 15.9722 18.1157 15.9722 15.9941H13.109C13.1081 17.3546 12.5688 18.6591 11.6094 19.6214C10.65 20.5837 9.34892 21.1251 7.9917 21.1269Z"
							fill="#00CCFF"
						/>
						<path
							d="M7.9917 5.13271V7.99945C10.1082 7.99945 12.1381 7.15666 13.6347 5.65647C15.1314 4.15628 15.9722 2.12159 15.9722 0H13.109C13.1081 1.36045 12.5688 2.66498 11.6094 3.62727C10.65 4.58956 9.34892 5.13098 7.9917 5.13271Z"
							fill="#861DFF"
						/>
						<path
							d="M16.0195 5.13271V7.99945C18.1361 7.99945 20.1659 7.15666 21.6626 5.65647C23.1592 4.15628 24 2.12159 24 0H21.1384C21.1376 1.36073 20.598 2.66551 19.6383 3.62784C18.6785 4.59018 17.377 5.13141 16.0195 5.13271Z"
							fill="#FC7F10"
						/>
					</svg>
				</Link>
				<Box ml="32" display="flex" alignItems={"center"} gap="8">
					<Text fontSize="md" fontWeight="500" color="fg.default">
						Stride
					</Text>
					<svg
						width="14"
						height="12"
						viewBox="0 0 14 12"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M12.3125 4.37498L7.34373 8.87498C7.15623 9.06248 6.87498 9.06248 6.68748 8.87498L1.65623 4.37498C1.43748 4.18748 1.43748 3.87498 1.62498 3.68748C1.81248 3.46873 2.12498 3.46873 2.31248 3.65623L6.99998 7.84373L11.6562 3.65623C11.8437 3.46873 12.1562 3.46873 12.3437 3.68748C12.5312 3.87498 12.5312 4.18748 12.3125 4.37498Z"
							fill="#2E3442"
						/>
					</svg>
				</Box>
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
							disabledReason: "TBD",
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
					<MenuTrigger asChild>
						<Box
							ml="32"
							display="flex"
							alignItems={"center"}
							gap="8"
							style={{cursor: "pointer"}}
						>
							<Text fontSize="md" fontWeight="500" color="fg.default">
								{getCurrentProduct()}
							</Text>
							<svg
								width="14"
								height="12"
								viewBox="0 0 14 12"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d="M12.3125 4.37498L7.34373 8.87498C7.15623 9.06248 6.87498 9.06248 6.68748 8.87498L1.65623 4.37498C1.43748 4.18748 1.43748 3.87498 1.62498 3.68748C1.81248 3.46873 2.12498 3.46873 2.31248 3.65623L6.99998 7.84373L11.6562 3.65623C11.8437 3.46873 12.1562 3.46873 12.3437 3.68748C12.5312 3.87498 12.5312 4.18748 12.3125 4.37498Z"
									fill="#2E3442"
								/>
							</svg>
						</Box>
					</MenuTrigger>
					<MenuContent />
				</Menu>
			</Box>
			<Box display="flex" alignItems="center" gap="8">
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
							icon={
								{
									system: <IconDeviceDesktop />,
									light: <IconSunFilled />,
									dark: <IconMoon />,
								}[themePreference]
							}
							aria-label="Theme"
							className="capitalize"
						>
							{themePreference}
						</Button>
					</MenuTrigger>
					<MenuContent />
				</Menu>
				<Button
					appearance="subtle"
					size="md"
					icon={<IconSearch size={20} />}
					aria-label="Search"
				/>
				<Button
					appearance="subtle"
					size="md"
					aria-label="Opal AI Assistant"
					onClick={onOpalClick}
				>
					<Image src="/opal-orb.png" alt="Opal" width={20} height={20} />
				</Button>
				<Box style={{position: "relative"}}>
					<Button
						appearance="subtle"
						size="md"
						icon={<IconBell size={20} />}
						aria-label="Notifications"
					/>
					<Box
						style={{
							position: "absolute",
							top: "4px",
							right: "4px",
							height: "8px",
							width: "8px",
							border: "1.5px solid #FFFFFF",
						}}
						bg="bg.error"
						rounded="full"
					/>
				</Box>
				<Button
					appearance="subtle"
					size="md"
					icon={<IconHelp size={20} />}
					aria-label="Help"
				/>
				<Button
					appearance="subtle"
					size="md"
					icon={<IconUser size={20} />}
					aria-label="User profile"
				/>
			</Box>
		</Box>
	);
}
