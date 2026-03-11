"use client";

import {Box, Button, Tooltip} from "@optiaxiom/react";
import {IconDots, IconPhotoPin, IconPinEnd, IconPinInvoke, IconX} from "@tabler/icons-react";
import {useState, useRef, useEffect} from "react";
import {IconPopOut} from "@optimizely/axiom-icons";
// @ts-ignore
import usePersistentState from "@/app/usePersistentState";
import DragHandle from "@/app/components/DragHandle";

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
	minWidth = 350,
	maxWidth = 600,
}: ExtensionPanelProps) {
	const [panelWidth, setPanelWidth] = usePersistentState("extension-panel-width", width);
	const [isPoppedOut, setIsPoppedOut] = usePersistentState("extension-panel-popped", false);

	return (
		<Box
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
				maxHeight: isPoppedOut ? "calc(100vh - 159px - 0px)" : "100%",
				transition: "transform cubic-bezier(0, 1, 0, 1) .5s",
				zIndex: isPoppedOut ? 50 : 40,
			}}
		>
			<DragHandle
				position="left"
				minWidth={minWidth}
				maxWidth={maxWidth}
				width={panelWidth}
				onWidthChange={setPanelWidth}
			/>

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
					<Tooltip content="TBD: More options">
						<Button
							disabled
							appearance="subtle"
							size="sm"
							aria-label="More options"
							style={{borderRadius: "6px"}}
							icon={<IconDots />}
						/>
					</Tooltip>
					<Tooltip content="Pin/Unpin">
						<Button
							appearance="subtle"
							size="sm"
							aria-label={isPoppedOut ? "Dock" : "Pop out"}
							onClick={() => setIsPoppedOut(!isPoppedOut)}
							icon={isPoppedOut ? <IconPinInvoke /> : <IconPinEnd />}
						/>
					</Tooltip>
					<Tooltip content="Close">
						<Button
							icon={<IconX />}
							appearance="subtle"
							size="sm"
							aria-label="Close"
							onClick={onClose}
						/>
					</Tooltip>
				</Box>
			</Box>

			{/* Content  */}
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
