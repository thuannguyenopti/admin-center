"use client";

import {Box, Button, Text} from "@optiaxiom/react";
import {IconFileArrowUp, IconUpload} from "@optiaxiom/icons";
import {PdfPreview} from "./PdfPreview";

export function PdfEditView() {
	return (
		<Box
			display="flex"
			flexDirection="column"
			alignItems="center"
			justifyContent="center"
			gap="16"
			style={{height: "100%", padding: "40px 28px", boxSizing: "border-box"}}
		>
			<Box
				display="flex"
				flexDirection="column"
				alignItems="center"
				gap="12"
				rounded="xl"
				style={{
					border: "1.5px dashed var(--ax-colors-border-secondary)",
					padding: "40px 48px",
					width: "100%",
					maxWidth: 440,
					textAlign: "center",
				}}
			>
				<IconFileArrowUp size={32} color="var(--ax-colors-fg-tertiary)" />
				<Box display="flex" flexDirection="column" gap="4">
					<Text fontWeight="500" color="fg.default">
						Replace PDF
					</Text>
					<Text fontSize="sm" color="fg.tertiary">
						Drag a new file here or click to upload. Max file size 50 MB.
					</Text>
				</Box>
				<Button appearance="subtle" size="sm" icon={<IconUpload size={16} />}>
					Choose file
				</Button>
			</Box>
			<Text fontSize="sm" color="fg.tertiary">
				Or view the current file below
			</Text>
			<Box
				rounded="lg"
				style={{
					width: "100%",
					maxHeight: 320,
					overflow: "hidden",
					border: "1px solid var(--ax-colors-border-secondary)",
				}}
			>
				<PdfPreview />
			</Box>
		</Box>
	);
}
