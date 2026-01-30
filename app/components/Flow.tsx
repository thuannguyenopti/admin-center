import * as React from "react";
import {Box, type BoxProps} from "@optiaxiom/react";

// ---- DS PRIVATE RHYTHM (not exported) ----
const DEFAULT_MT = 16;

const MT_BY_TYPE: Record<string, number> = {
	Text: 12,
	Heading: 64,
	Field: 16,
	Button: 16,
	Separator: 32,
};

const MT_BY_HEADING_LEVEL: Record<string, number> = {
	"1": 0,
	"2": 24,
	"3": 24,
	"4": 24,
	"5": 16,
	"6": 16,
};

const MB_BY_TYPE: Record<string, number> = {
	Heading: 16,
	Text: 0,
	Field: 0,
	Button: 0,
	Separator: 24,
};

const MB_BY_HEADING_LEVEL: Record<string, number> = {
	"1": 0,
	"2": 0,
	"3": 0,
	"4": 0,
	"5": 0,
	"6": 0,
};

function getTypeKey(el: React.ReactElement): string {
	if (typeof el.type === "string") return el.type;

	const t: any = el.type;

	const raw = t.displayName || t.name || "Unknown";
	return raw.includes("/") ? raw.split("/").pop()! : raw;
}

function isRenderable(n: React.ReactNode) {
	return n !== null && n !== undefined && n !== false;
}

/**
 * Flow: injects baked-in vertical rhythm spacing into children via `pt`.
 * No wrapper elements are added.
 *
 * Assumes DS components accept a `pt` prop.
 */
export default function Flow({children, ...props}: BoxProps) {
	const items = React.Children.toArray(children).filter(isRenderable);

	return (
		<Box {...props}>
			{items.map((node, index) => {
				if (!React.isValidElement(node)) {
					// Non-elements (strings etc) can't receive pt
					return node;
				}

				const typeKey = getTypeKey(node);
				let mt: number | undefined;
				let mb: number | undefined = MB_BY_TYPE[typeKey];

				// Calculate MT (only for non-first items)
				if (index > 0) {
					mt = MT_BY_TYPE[typeKey] ?? DEFAULT_MT;
					if (typeKey === "Heading") {
						const level = String((node.props as any).level || "1");
						if (MT_BY_HEADING_LEVEL[level]) {
							mt = MT_BY_HEADING_LEVEL[level];
						}
					}
				}

				// Calculate MB
				if (typeKey === "Heading") {
					const level = String((node.props as any).level || "1");
					if (MB_BY_HEADING_LEVEL[level]) {
						mb = MB_BY_HEADING_LEVEL[level];
					}
				}

				const newProps: any = {};

				// Only inject if not manually set
				if (mt !== undefined && (node.props as any).mt == null) {
					newProps.mt = mt;
				}
				if (mb !== undefined && (node.props as any).mb == null) {
					newProps.mb = mb;
				}

				if (Object.keys(newProps).length > 0) {
					return React.cloneElement(node as React.ReactElement<any>, newProps);
				}

				return node;
			})}
		</Box>
	);
}
