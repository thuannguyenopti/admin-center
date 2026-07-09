"use client";

import {
	Box,
	Field,
	Menu,
	MenuTrigger,
	MenuContent,
	Text as AxiomText,
} from "@optiaxiom/react";
import {useRef, useCallback, useMemo} from "react";
import {IconFileImport} from "@/app/lib/axiom-icons";

export function UploadContextDropZone({label}: {label: string}) {
	const inputRef = useRef<HTMLInputElement>(null);

	const openFilePicker = useCallback(() => {
		inputRef.current?.click();
	}, []);

	const menuOptions = useMemo(
		() => [{label: "Upload files" as const, execute: openFilePicker}],
		[openFilePicker],
	);

	return (
		<Field label={label}>
			<input
				ref={inputRef}
				type="file"
				multiple
				style={{ display: "none" }}
				aria-hidden
			/>
			<Box
				display="flex"
				flexDirection="column"
				alignItems="center"
				justifyContent="center"
				p="24"
				gap="12"
				rounded="md"
				border="2"
				borderColor="border.tertiary"
				bg="bg.secondary"
				w="full"
				style={{
					borderStyle: "dashed",
					cursor: "pointer",
					minHeight: "140px",
				}}
				onClick={openFilePicker}
			>
				<IconFileImport
					size={28}
					stroke={1.5}
					style={{ color: "var(--ax-colors-fg-secondary)" }}
					aria-hidden
				/>
				<AxiomText fontSize="sm" color="fg.default" textAlign="center">
					Drag and drop or click to upload
				</AxiomText>
				<AxiomText fontSize="xs" color="fg.tertiary" textAlign="center">
					Upload files up to 5MB
				</AxiomText>
				<Box onClick={(e) => e.stopPropagation()}>
					<Menu options={menuOptions}>
						<MenuTrigger appearance="default" size="sm">
							Add
						</MenuTrigger>
						<MenuContent />
					</Menu>
				</Box>
			</Box>
		</Field>
	);
}
