<<<<<<< HEAD
import {
	Box,
	NavBody,
	NavList,
	NavItem,
	NavGroup,
	NavGroupTrigger,
	NavSeparator,
} from "@optiaxiom/react";
import {Text} from "@/app/components/Text";
import {Url} from "next/dist/shared/lib/router/router";
import Link from "next/link";

import {useRouter, usePathname} from "next/navigation";
import {Fragment} from "react";

export default function VT({
	items,
	backLink,
	title,
	description,
	collapsed = false,
}: Readonly<{
	backLink?: {label: string; url?: string};
	title?: string;
	description?: string;
	collapsed?: boolean;
	items:
		| Array<{label: string; url?: string; separator?: boolean; icon?: React.ReactNode}>
		| undefined;
}>) {
	const router = useRouter();
	const path = usePathname();

	const menuClick = (url: string) => {
		router.push(`${url}`);
	};

	return (
		<NavBody
			style={{
				maxWidth: collapsed ? "56px" : "224px",
				minWidth: collapsed ? "56px" : "224px",
				minHeight: "100%",
				overflow: "auto",
				height: "calc(100vh - 80px)",
			}}
		>
			<NavList className="appear">
				{!collapsed && (backLink || title) && (
					<Box px="12" py="16">
						{backLink && (
							<Link href={backLink.url as Url}>
								<Text
									color="fg.secondary"
									fontSize="sm"
									className="hover:!text-black"
								>
									← {backLink.label}
								</Text>
							</Link>
						)}
						{title && (
							<Text fontSize="lg" fontWeight="600" color="fg.default">
								{title}
							</Text>
						)}
						{description && (
							<Text fontSize="sm" color="fg.tertiary" mt="4">
								{description}
							</Text>
						)}
					</Box>
				)}
				{items?.map((menuItem, i) => {
					if (menuItem.url) {
						const url = menuItem.url;
						// Sticky-active: a child item stays highlighted while the user is
						// anywhere under its URL prefix (e.g. /product-access/[id]).
						// Use longest-prefix matching among items so /product-access/[id]
						// doesn't also light up shorter overlapping URLs.
						const isPrefixMatch =
							path === url ||
							path.startsWith(url + "/") ||
							path.startsWith(url + "?");
						const longerCandidate = items?.some(
							(other) =>
								other !== menuItem &&
								other.url &&
								other.url.length > url.length &&
								(path === other.url ||
									path.startsWith(other.url + "/") ||
									path.startsWith(other.url + "?")),
						);
						const active = isPrefixMatch && !longerCandidate;
						return (
							<Fragment key={`${menuItem.label}-${menuItem.url}`}>
								<NavItem
									onClick={() => menuClick(menuItem.url || "")}
									active={active}
									aria-label={menuItem.label}
									icon={menuItem.icon}
								>
									{menuItem.label}
								</NavItem>
								{menuItem.separator && <NavSeparator />}
							</Fragment>
						);
					} else {
						return (
							<Fragment key={`${menuItem.label}-group-${i}`}>
								{i !== 0 && <NavSeparator />}
								<NavGroupTrigger>{menuItem.label}</NavGroupTrigger>
							</Fragment>
						);
					}
				})}
			</NavList>
		</NavBody>
	);
}
=======
import {
	Box,
	NavBody,
	NavList,
	NavItem,
	NavGroup,
	NavGroupTrigger,
	NavSeparator,
} from "@optiaxiom/react";
import {Text} from "@/app/components/Text";
import {Url} from "next/dist/shared/lib/router/router";
import Link from "next/link";

import {useRouter, usePathname} from "next/navigation";
import {Fragment} from "react";

export default function VT({
	items,
	backLink,
	title,
	description,
}: Readonly<{
	backLink?: {label: string; url?: string};
	title?: string;
	description?: string;
	items: Array<{label: string; url?: string; separator?: boolean}> | undefined;
}>) {
	const router = useRouter();
	const path = usePathname();

	const menuClick = (url: string) => {
		router.push(`${url}`);
	};

	return (
		<NavBody
			style={{
				maxWidth: "224px",
				minHeight: "100%",
				overflow: "auto",
				height: "calc(100vh - 80px)",
			}}
		>
			<NavList className="appear">
				{(backLink || title) && (
					<Box px="12" py="16">
						{backLink && (
							<Link href={backLink.url as Url}>
								<Text
									color="fg.secondary"
									fontSize="sm"
									className="hover:!text-black"
								>
									← {backLink.label}
								</Text>
							</Link>
						)}
						{title && (
							<Text fontSize="lg" fontWeight="600" color="fg.default">
								{title}
							</Text>
						)}
						{description && (
							<Text fontSize="sm" color="fg.tertiary" mt="4">
								{description}
							</Text>
						)}
					</Box>
				)}
				{items?.map((menuItem, i) => {
					if (menuItem.url) {
						return (
							<Fragment key={`${menuItem.label}-${menuItem.url}`}>
								<NavItem
									onClick={() => menuClick(menuItem.url || "")}
									active={menuItem.url === path}
									aria-label={menuItem.label}
								>
									{menuItem.label}
								</NavItem>
								{menuItem.separator && <NavSeparator />}
							</Fragment>
						);
					} else {
						return (
							<Fragment key={`${menuItem.label}-group-${i}`}>
								{i !== 0 && <NavSeparator />}
								<NavGroupTrigger>{menuItem.label}</NavGroupTrigger>
							</Fragment>
						);
					}
				})}
			</NavList>
		</NavBody>
	);
}
>>>>>>> origin/main
