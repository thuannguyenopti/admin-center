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
