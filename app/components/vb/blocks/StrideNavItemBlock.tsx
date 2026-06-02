"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getProperty } from "./utils";

export const NavItemBlock = React.memo(function StrideNavItemBlock({
	properties,
}: {
	properties: any;
}) {
	const label = getProperty(properties, "label", "Label") || "Link";
	const href = getProperty(properties, "href", "Href") || "#";
	const isSub = getProperty(properties, "sub", "Sub") === "true";
	const pathname = usePathname();

	const fullHref = `/site${href}`;
	const isActive = isSub ? pathname?.startsWith(fullHref) : pathname === fullHref;

	return (
		<Link
			href={fullHref}
			className={`group relative block font-semibold transition-colors py-2 no-underline ${
				isSub
					? "pl-3 text-sm text-stride-dark/60 hover:text-stride-dark/90"
					: "text-stride-dark/90 hover:text-stride-dark"
			}`}
		>
			{label}
			<span
				className={`-z-10 absolute border border-black/5 opacity-0 group-hover:opacity-100 duration-100 -inset-4 top-0 bottom-0 rounded bg-black/[0.04] ${
					isActive ? "opacity-100 border-l-4 border-l-stride-blue" : ""
				}`}
				style={{ backdropFilter: 'blur(3px)' }}
			/>
		</Link>
	);
});
