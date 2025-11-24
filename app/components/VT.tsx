import {Text, Box, NavBody, NavList, NavItem} from "@optiaxiom/react";
import {Url} from "next/dist/shared/lib/router/router";
import Link from "next/link";

import {useRouter, usePathname} from "next/navigation";

export default function VT({
	items,
	backLink,
	title,
}: Readonly<{
	backLink?: {label: string; url?: string};
	title?: string;
	items: Array<{label: string; url?: string}> | undefined;
}>) {
	const router = useRouter();
	const path = usePathname();

	const menuClick = (url: string) => {
		router.push(`${url}`);
	};

	return (
		<NavBody style={{maxWidth: "224px"}}>
			<NavList className="appear">
				{backLink && (
					<Box
						px="12"
						py="16"
					>
						<Link href={backLink.url as Url}>
							<Text
								color="fg.accent"
								fontSize="sm"
							>
								← {backLink.label}
							</Text>
						</Link>
						<Text
							fontSize="lg"
							fontWeight="600"
							color="fg.default"
						>
							{title}
						</Text>
					</Box>
				)}
				{items?.map((menuItem) =>
					menuItem.url ? (
						<NavItem
							onClick={() => menuClick(menuItem.url || "")}
							active={menuItem.url === path}
							key={menuItem.label}
							aria-label={menuItem.label}
						>
							{menuItem.label}
						</NavItem>
					) : (
						<Text
							key={menuItem.label}
							fontSize="xs"
							px="8"
							mx="4"
							pb="4"
							pt="12"
							color="fg.tertiary"
						>
							{menuItem.label}
						</Text>
					)
				)}
			</NavList>
		</NavBody>
	);
}
