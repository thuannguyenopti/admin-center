import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export function ToolRailButton({
	active,
	label,
	icon,
	expanded,
	onClick,
}: {
	active: boolean;
	label: string;
	icon: IconDefinition;
	expanded: boolean;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			aria-label={label}
			title={label}
			style={{
				width: "100%",
				height: 40,
				display: "inline-flex",
				alignItems: "center",
				justifyContent: expanded ? "flex-start" : "center",
				gap: expanded ? 12 : 0,
				padding: expanded ? "0 14px" : 0,
				borderRadius: 14,
				border: active ? "1.5px solid var(--ax-colors-border-accent)" : "1px solid var(--ax-colors-border-tertiary)",
				background: "var(--ax-colors-bg-default)",
				boxShadow: active ? "0 4px 12px rgba(36, 87, 255, 0.08)" : "none",
				color: active ? "var(--ax-colors-fg-accent)" : "var(--ax-colors-fg-secondary)",
				cursor: "pointer",
				transition: "all 160ms ease",
			}}
		>
			<FontAwesomeIcon icon={icon} style={{ fontSize: 18 }} />
			{expanded ? <span style={{ fontSize: 15, fontWeight: 600 }}>{label}</span> : null}
		</button>
	);
}
