import {Box, Sidebar, NavBody, NavItem, Nav, Heading, SubNav, Button} from "@optiaxiom/react";
import {Text} from "./Text";
import Link from "next/link";
import {useEffect, useState} from "react";

import {useRouter, usePathname} from "next/navigation";
import VT from "./VT";
import GlobalBar from "./GlobalBar";
import {LayoutProvider, useLayout} from "../context/LayoutContext";
import {IconChevronLeft, IconChevronRight} from "@tabler/icons-react";

function TemplateContent({
	children,
	structure,
}: Readonly<{
	children: React.ReactNode;
	structure: any;
}>) {
	const {asideContent} = useLayout();
	const router = useRouter();
	const path = usePathname();
	const [isExpanded, setIsExpanded] = useState(true);

	const menuClick = (url: string) => {
		router.push(`${url}`);
	};

	const menuItems = structure;

	const highlight1 = menuItems.find((item: any) => path.includes(item.highlight));
	const lvl2 = highlight1?.children
		?.filter((item: any) => (item.url ? path.includes(item.url) : false))
		.sort((a: any, b: any) => b.url.length - a.url.length)[0];
	const lvl3 = lvl2?.children?.children
		?.filter((item: any) => (item.url ? path.includes(item.url) : false))
		.sort((a: any, b: any) => b.url.length - a.url.length)[0];
	const lvl4 = lvl3?.children?.children
		?.filter((item: any) => (item.url ? path.includes(item.url) : false))
		.sort((a: any, b: any) => b.url.length - a.url.length)[0];

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
			<Box
				display="flex"
				z="10"
			>
				<Sidebar
					className="h-full z-10 relative"
					expanded={isExpanded}
				>
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
					<Box
						className="absolute bottom-0 left-0 right-0"
						p="8"
						borderT="1"
						borderColor="border.tertiary"
					>
						<Button
							aria-label={!isExpanded ? "Expand sidebar" : "Collapse sidebar"}
							icon={!isExpanded ? <IconChevronRight /> : <IconChevronLeft />}
							onClick={() => setIsExpanded(!isExpanded)}
							size="md"
							appearance="subtle"
						/>
					</Box>
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
											title={highlight1?.children?.title || highlight1?.label}
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
				overflowX="hidden"
				display="flex"
				flexDirection="row"
				fontSize="md"
				color="fg.default"
			>
				<Box
					flex="1"
					className="min-w-0 relative"
					overflow="auto"
				>
					<Box
						style={{
							marginLeft: "224px",
							marginRight: "-224px",
							width: !showVT ? "100%" : "calc(100% - 224px)",
							transform: showVT ? "translatex(0px)" : "translatex(-224px)",
							transition: ".7s cubic-bezier(0, 1, 0, 1)",
						}}
						p="24"
						color="fg.default"
						overflow="auto"
					>
						<Heading level="3">{heading || highlight1?.label}</Heading>
						{desc && <Text mt="4">{desc}</Text>}
						<Box
							mt="16"
							z="10"
							className="relative"
						>
							{children}
						</Box>
					</Box>
				</Box>
				{asideContent && (
					<Box
						className="w-[420px]"
						borderL="1"
						borderColor="border.tertiary"
						bg="bg.default"
						h="full"
						overflow="auto"
					>
						{asideContent}
					</Box>
				)}
			</Box>
		</Box>
	);
}

export default function Template(props: any) {
	return (
		<LayoutProvider>
			<TemplateContent {...props} />
		</LayoutProvider>
	);
}
