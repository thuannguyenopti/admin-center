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
				{(backLink || title) && (
					<Box
						px="12"
						py="16"
					>
						{backLink && (
							<Link href={backLink.url as Url}>
								<Text
									color="fg.secondary"
									fontSize="sm"
								>
									← {backLink.label}
								</Text>
							</Link>
						)}
						{title && (
							<Text
								fontSize="lg"
								fontWeight="600"
								color="fg.default"
							>
								{title}
							</Text>
						)}
					</Box>
				)}
				{items?.map((menuItem, i) =>
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
						<Fragment key={menuItem.label}>
							{i !== 0 && <NavSeparator />}
							<NavGroupTrigger>{menuItem.label}</NavGroupTrigger>
						</Fragment>
					)
				)}
			</NavList>
		</NavBody>
	);
}
