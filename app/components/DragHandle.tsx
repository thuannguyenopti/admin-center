"use client";

import {Box} from "@optiaxiom/react";
import {IconArrowBarBoth} from "@tabler/icons-react";

interface DragHandleProps {
	/** Position of the handle */
	position?: "left" | "right";
	/** Minimum width constraint (default: 180) */
	minWidth?: number;
	/** Maximum width constraint (default: 600) */
	maxWidth?: number;
	/** Current width value for controlled component */
	width?: number;
	/** Callback when width changes */
	onWidthChange?: (width: number) => void;
}

export default function DragHandle({
	position = "right",
	minWidth = 180,
	maxWidth = 600,
	width,
	onWidthChange,
}: DragHandleProps) {
	const handleMouseDown = (e: React.MouseEvent) => {
		e.preventDefault();
		const startX = e.clientX;
		const parentElement = e.currentTarget.parentElement as HTMLElement;
		const startWidth = width ?? parentElement.offsetWidth;

		const handleMouseMove = (moveEvent: MouseEvent) => {
			let delta: number;
			if (position === "right") {
				delta = moveEvent.clientX - startX;
			} else {
				delta = startX - moveEvent.clientX; // Inverted for left-side handle
			}

			const newWidth = Math.max(minWidth, Math.min(maxWidth, startWidth + delta));

			if (onWidthChange) {
				onWidthChange(newWidth);
			} else {
				parentElement.style.width = newWidth + "px";
			}
		};

		const handleMouseUp = () => {
			window.removeEventListener("mousemove", handleMouseMove);
			window.removeEventListener("mouseup", handleMouseUp);
			document.body.style.cursor = "";
			document.body.style.userSelect = "";
		};

		document.body.style.cursor = position === "left" ? "col-resize" : "ew-resize";
		document.body.style.userSelect = "none";
		window.addEventListener("mousemove", handleMouseMove);
		window.addEventListener("mouseup", handleMouseUp);
	};

	return (
		<div
			onMouseDown={handleMouseDown}
			style={{
				position: "absolute",
				[position]: 0,
				top: 0,
				bottom: 0,
				width: "8px",
				cursor: "col-resize",
				zIndex: 10,
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				userSelect: "none",
			}}
			className="group hover:bg-blue-500/10 transition-colors"
		>
			<div
				style={{
					width: "2px",
					height: "40px",
					background: "rgba(0, 0, 0, 0.1)",
					borderRadius: "1px",
					transition: "all 0.2s ease",
				}}
				className="group-hover:bg-blue-500 group-hover:h-12"
			/>
		</div>
	);
}
