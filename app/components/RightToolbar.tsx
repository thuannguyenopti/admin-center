"use client";

import {Box, Sidebar, NavBody, NavItem, Nav, Separator} from "@optiaxiom/react";
import {IconFolders, IconMoodSmile, IconPlus} from "@tabler/icons-react";
import StrideLogo from "@/app/assets/stride-logo.svg";
import TeamsLogo from "@/app/assets/teams-logo.svg";
import GoogleLogo from "@/app/assets/google-logo.svg";

export default function RightToolbar() {
	const toolbarItems = [
		{
			label: "Folders",
			icon: <IconFolders size={16} />,
			action: () => console.log("Folders clicked"),
		},
		{type: "separator"},
		{
			label: "Smile",
			icon: <IconMoodSmile size={16} />,
			action: () => console.log("Smile clicked"),
		},
		{
			label: "Stride",
			icon: <StrideLogo width={16} height={16} />,
			action: () => console.log("Stride clicked"),
		},
		{
			label: "Teams",
			icon: <TeamsLogo width={20} height={16} />,
			action: () => console.log("Teams clicked"),
		},
		{
			label: "Google",
			icon: <GoogleLogo width={15} height={16} />,
			action: () => console.log("Google clicked"),
		},
		{
			label: "Add",
			icon: <IconPlus size={16} />,
			action: () => console.log("Add clicked"),
		},
	];

	return (
		<Sidebar
			className="h-full"
			expanded={false}
		>
			<Nav>
				<NavBody>
					{toolbarItems.map((item: any, index: number) =>
						item.type === "separator" ? (
							<Box
								key={`separator-${index}`}
								px="12"
								py="4"
							>
								<Separator />
							</Box>
						) : (
							<NavItem
								key={item.label}
								onClick={item.action}
								aria-label={item.label}
								icon={item.icon}
							>
								{item.label}
							</NavItem>
						)
					)}
				</NavBody>
			</Nav>
		</Sidebar>
	);
}