import {Link as AxiomLink} from "@optiaxiom/react";
import type {ComponentPropsWithoutRef} from "react";
import NextLink from "next/link";

type Props = Omit<ComponentPropsWithoutRef<typeof AxiomLink>, "href"> & {
	href: string;
};

/**
 * Inline text link — Axiom Link styling composed with Next.js Link for
 * client-side navigation. Pass `external` for out-of-app URLs (adds icon +
 * sets target/rel automatically).
 */
export function LinkStyle({href, children, ...props}: Props) {
	return (
		<AxiomLink asChild {...props}>
			<NextLink href={href}>{children}</NextLink>
		</AxiomLink>
	);
}
