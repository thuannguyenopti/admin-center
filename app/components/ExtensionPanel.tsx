"use client";

import {Box, Button} from "@optiaxiom/react";
import {IconDots, IconPhotoPin, IconPinEnd, IconPinInvoke, IconX} from "@tabler/icons-react";
import {useState, useRef, useEffect} from "react";
import {IconPopOut} from "@optimizely/axiom-icons";
// @ts-ignore
import usePersistentState from "@/app/usePersistentState";

interface ExtensionPanelProps {
	title: React.ReactNode;
	children: React.ReactNode;
	onClose: () => void;
	width?: number;
	minWidth?: number;
	maxWidth?: number;
}

export default function ExtensionPanel({
	title,
	children,
	onClose,
	width = 300,
	minWidth = 200,
	maxWidth = 600,
}: ExtensionPanelProps) {
	const [panelWidth, setPanelWidth] = usePersistentState("extension-panel-width", width);
	const [isResizing, setIsResizing] = useState(false);
	const [isPoppedOut, setIsPoppedOut] = usePersistentState("extension-panel-popped", false);
	const panelRef = useRef<HTMLDivElement>(null);

	const handleMouseDown = (e: React.MouseEvent) => {
		e.preventDefault();
		setIsResizing(true);
		const startX = e.clientX;
		const startWidth = panelWidth;

		const handleMouseMove = (moveEvent: MouseEvent) => {
			const delta = startX - moveEvent.clientX; // Inverted because we're resizing from left
			const newWidth = Math.max(minWidth, Math.min(maxWidth, startWidth + delta));
			setPanelWidth(newWidth);
		};

		const handleMouseUp = () => {
			setIsResizing(false);
			window.removeEventListener("mousemove", handleMouseMove);
			window.removeEventListener("mouseup", handleMouseUp);
			document.body.style.cursor = "";
			document.body.style.userSelect = "";
		};

		document.body.style.cursor = "col-resize";
		document.body.style.userSelect = "none";
		window.addEventListener("mousemove", handleMouseMove);
		window.addEventListener("mouseup", handleMouseUp);
	};

	return (
		<Box
			ref={panelRef}
			bg="bg.page" // Ensure background is set
			borderL={isPoppedOut ? undefined : "1"}
			border={isPoppedOut ? "1" : undefined}
			borderColor="border.tertiary"
			rounded={isPoppedOut ? "xl" : "none"}
			shadow={isPoppedOut ? "lg" : "none"}
			flexDirection="column"
			display="flex"
			style={{
				alignSelf: isPoppedOut ? "flex-start" : "stretch",
				width: `${panelWidth}px`,
				minWidth: `${panelWidth}px`,
				transform: isPoppedOut ? "translate(-24px, 24px)" : undefined,
				position: "relative",
				marginLeft: isPoppedOut ? `-${panelWidth + 0}px` : undefined,
				//opacity: isPoppedOut ? 0.5 : 1,
				//top: isPoppedOut ? "8px" : undefined,
				maxHeight: isPoppedOut ? "calc(100vh - 159px - 0px)" : "100%",
				transition: isResizing ? "none" : "transform 0.1s",
				//right: isPoppedOut ? "64px" : undefined,
				// Ensure it doesn't overshoot the page, leaving 8px gap at bottom
				zIndex: 50,
			}}
		>
			{/* Resize Handle */}
			<div
				onMouseDown={handleMouseDown}
				style={{
					position: "absolute",
					left: 0,
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

			{/* Header */}
			<Box
				display="flex"
				alignItems="center"
				justifyContent="space-between"
				px="24"
				py="24"
				pb="8"
				style={{flexShrink: 0}}
			>
				<Box
					fontSize="lg"
					fontWeight="600"
					color="fg.default"
					style={{letterSpacing: "-0.20px"}}
					display="flex"
					alignItems="center"
				>
					{title}
				</Box>
				<Box display="flex" gap="4">
					<Button
						appearance="subtle"
						size="sm"
						aria-label="More options"
						style={{borderRadius: "6px"}}
						icon={<IconDots />}
					/>
					<Button
						appearance="subtle"
						size="sm"
						aria-label={isPoppedOut ? "Dock" : "Pop out"}
						onClick={() => setIsPoppedOut(!isPoppedOut)}
						icon={isPoppedOut ? <IconPinInvoke /> : <IconPinEnd />}
					/>
					<Button
						icon={<IconX />}
						appearance="subtle"
						size="sm"
						aria-label="Close"
						onClick={onClose}
					/>
				</Box>
			</Box>

			{/* Content */}
			<Box
				flex={isPoppedOut ? undefined : "1"}
				px="24"
				pb="24"
				overflow="auto"
				style={{
					position: "relative",
				}}
			>
				{children}
			</Box>
		</Box>
	);
}
