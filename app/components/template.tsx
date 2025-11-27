import {Box, Sidebar, NavBody, NavItem, Text, Nav, Heading, SubNav} from "@optiaxiom/react";
import Link from "next/link";
import {useEffect, useState} from "react";

import {useRouter, usePathname} from "next/navigation";
import VT from "./VT";
import GlobalBar from "./GlobalBar";

export default function Template({
	children,
	structure,
}: Readonly<{
	children: React.ReactNode;
	structure: any;
}>) {
	const router = useRouter();
	const path = usePathname();

	const menuClick = (url: string) => {
		router.push(`${url}`);
	};

	const menuItems = structure;

	const highlight1 = menuItems.find((item: any) => path.includes(item.highlight));
	const lvl2 = highlight1?.children?.find((item: any) =>
		item.url ? path.includes(item.url) : false
	);
	const lvl3 = lvl2?.children?.children.find((item: any) =>
		item.url ? path.includes(item.url) : false
	);
	const lvl4 = lvl3?.children?.children.find((item: any) =>
		item.url ? path.includes(item.url) : false
	);

	const heading = lvl4?.label || lvl3?.label || lvl2?.label;
	const desc = lvl4?.description || lvl3?.description || lvl2?.description;
	const showVT =
		highlight1?.children?.length > 1 ||
		typeof lvl3 !== "undefined" ||
		typeof lvl4 !== "undefined";

	return (
		<Box
			className="grid grid-cols-[0fr_1fr] grid-rows-[0fr_1fr] h-[100vh]"
			bg="bg.page"
		>
			<GlobalBar />
			<Box display="flex">
				<Sidebar className="h-full z-10 relative">
					<Nav>
						<NavBody>
							{menuItems.map((menuItem: any) => (
								<NavItem
									onClick={() => menuClick(menuItem.url)}
									active={path.includes(menuItem.highlight)}
									key={menuItem.label}
									aria-label={menuItem.label}
									icon={menuItem.icon}
								>
									{menuItem.label}
								</NavItem>
							))}
						</NavBody>
					</Nav>
				</Sidebar>
				<Box
					style={{
						marginLeft: "-224px",
						transform: showVT ? "translatex(224px)" : "translatex(0px)",
						transition: ".7s cubic-bezier(0, 1, 0, 1)",
					}}
					borderR="1"
					borderColor="border.tertiary"
					className="slide w-[224px]"
					h="full"
					overflow="hidden"
					bg="bg.default"
				>
					{showVT && (
						<Sidebar
							className="flex"
							h="full"
						>
							<SubNav>
								<div
									className="flex w-[500%]"
									style={{
										transform: `translateX(-${
											224 * (lvl4 ? 2 : lvl3 ? 1 : 0)
										}px)`,
										transition: ".7s cubic-bezier(0, 1, 0, 1)",
									}}
								>
									{showVT && lvl2 && (
										<VT
											backLink={undefined}
											title={highlight1?.children?.title || undefined}
											items={highlight1?.children}
										/>
									)}
									{showVT && lvl3 && (
										<VT
											backLink={lvl2}
											title={lvl2.children?.title}
											items={lvl2.children?.children}
										/>
									)}
									{showVT && lvl4 && (
										<VT
											backLink={lvl3}
											title={lvl3.children?.title}
											items={lvl3.children?.children}
										/>
									)}
								</div>
							</SubNav>
						</Sidebar>
					)}
				</Box>
			</Box>
			<Box
				style={{
					marginLeft: "224px",
					width: !showVT ? "100%" : "calc(100% - 224px)",
					transform: showVT ? "translatex(0px)" : "translatex(-224px)",
					transition: ".7s cubic-bezier(0, 1, 0, 1)",
				}}
				p="24"
				color="fg.default"
				overflow="auto"
			>
				<Heading level="3">{heading || highlight1?.label}</Heading>
				{desc && (
					<Text
						color="fg.secondary"
						mt="4"
					>
						{desc}
					</Text>
				)}
				<Box
					mt="16"
					z="10"
					className="relative"
				>
					{children}
				</Box>
			</Box>
		</Box>
	);
}
