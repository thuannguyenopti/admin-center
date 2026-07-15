import type { FaceBox } from "./types";

type Props = {
	boxes: FaceBox[];
	tone?: "primary" | "warning" | "subtle";
	cornerStyle?: "frame" | "rect";
};

const TONE_COLORS: Record<NonNullable<Props["tone"]>, string> = {
	primary: "var(--ax-colors-border-secondary)",
	warning: "var(--ax-colors-fg-warning)",
	subtle: "var(--ax-colors-fg-default-inverse)",
};

export function FaceBoundingBox({ boxes, tone = "primary", cornerStyle = "rect" }: Props) {
	const color = TONE_COLORS[tone];

	return (
		<>
			{boxes.map((box, idx) => (
				<div
					key={idx}
					aria-hidden
					style={{
						position: "absolute",
						top: `${box.top}%`,
						left: `${box.left}%`,
						width: `${box.width}%`,
						height: `${box.height}%`,
						border: cornerStyle === "rect" ? `2px solid ${color}` : "none",
						boxShadow:
							cornerStyle === "rect"
								? "0 0 0 1px color-mix(in srgb, var(--ax-colors-bg-overlay) 18%, transparent)"
								: undefined,
						borderRadius: 2,
						pointerEvents: "none",
					}}
				>
					{cornerStyle === "frame" && (
						<>
							<CornerL color={color} corner="tl" />
							<CornerL color={color} corner="tr" />
							<CornerL color={color} corner="bl" />
							<CornerL color={color} corner="br" />
						</>
					)}
				</div>
			))}
		</>
	);
}

function CornerL({ color, corner }: { color: string; corner: "tl" | "tr" | "bl" | "br" }) {
	const size = 14;
	const thickness = 2.5;
	const common: React.CSSProperties = {
		position: "absolute",
		width: size,
		height: size,
		borderColor: color,
		borderStyle: "solid",
		borderWidth: 0,
	};
	const map: Record<typeof corner, React.CSSProperties> = {
		tl: { top: -1, left: -1, borderTopWidth: thickness, borderLeftWidth: thickness, borderTopLeftRadius: 3 },
		tr: { top: -1, right: -1, borderTopWidth: thickness, borderRightWidth: thickness, borderTopRightRadius: 3 },
		bl: { bottom: -1, left: -1, borderBottomWidth: thickness, borderLeftWidth: thickness, borderBottomLeftRadius: 3 },
		br: { bottom: -1, right: -1, borderBottomWidth: thickness, borderRightWidth: thickness, borderBottomRightRadius: 3 },
	};
	return <span style={{ ...common, ...map[corner] }} />;
}
