"use client";

import {
	DialogContent,
	DialogBody,
	DialogFooter,
	Dialog,
	DialogHeader,
	DialogClose,
	AlertDialog,
	AlertDialogBody,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogHeader,
} from "@optiaxiom/react";

import {ReactNode} from "react";

export default function AbstractDialog({
	isAlert,
	title,
	description,
	open,
	setOpen,
	children,
	size = "sm",
	footerPrimaryText = "Close",
	footerPrimaryAction = () => setOpen(false),
	footerAppearance,
	footerSecondaryText = "Cancel",
	blockPrimaryAction = false,
	style,
}: {
	isAlert?: boolean;
	size?: "sm" | "md" | "lg" | "xl" | undefined;
	title: string;
	description: string;
	open: boolean;
	setOpen: any;
	children?: ReactNode;
	footerPrimaryText?: string;
	footerPrimaryAction?: () => void;
	footerAppearance?:
		| "default"
		| "danger"
		| "primary"
		| "subtle"
		| "inverse"
		| "danger-outline"
		| undefined;
	footerSecondaryText?: string;
	blockPrimaryAction?: boolean;
	style?: React.CSSProperties;
}) {
	// Map xl to lg for Axiom, but apply custom styles
	const dialogSize = size === "xl" ? "lg" : size;
	const customStyle = size === "xl" ? {
		minWidth: "800px",
		maxWidth: "1200px",
		width: "90vw",
		minHeight: "600px",
		maxHeight: "90vh",
		...style
	} : style;

	return (
		<>
			{isAlert ? (
				<AlertDialog open={open} onOpenChange={setOpen}>
					<AlertDialogContent size={dialogSize} style={customStyle}>
						<AlertDialogHeader>{title}</AlertDialogHeader>
						<AlertDialogBody>{description}</AlertDialogBody>
						<AlertDialogFooter>
							<AlertDialogCancel />
							<AlertDialogAction onClick={() => footerPrimaryAction()}>
								{footerPrimaryText}
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			) : (
				<Dialog open={open} onOpenChange={setOpen}>
					<DialogContent size={dialogSize} style={customStyle}>
						<DialogHeader description={description}>{title}</DialogHeader>
						<DialogBody>{children}</DialogBody>
						<DialogFooter>
							{footerSecondaryText && (
								<DialogClose size="lg">{footerSecondaryText}</DialogClose>
							)}
							{footerPrimaryText && (
								<DialogClose
									onClick={() => footerPrimaryAction()}
									appearance={footerAppearance}
									size="lg"
									disabled={blockPrimaryAction}
								>
									{footerPrimaryText}
								</DialogClose>
							)}
						</DialogFooter>
					</DialogContent>
				</Dialog>
			)}
		</>
	);
}
