"use client";

import { Badge, Box } from "@optiaxiom/react";
import { Button } from "@/app/components/Button";
import { Text } from "@/app/components/Text";
import {
	IconChevronRight,
	IconCopy,
	IconEye,
	IconLink,
	IconMaximize,
	IconSearch,
	IconUpload,
} from "@tabler/icons-react";
import type { AssetItem } from "../types";

export function PreviewPage({
	asset,
	onAdd,
	onClose,
}: {
	asset: AssetItem;
	onAdd: () => void;
	onClose: () => void;
}) {
	const fileTitle = asset.preview === "pdf" ? "pdf.pdf" : `${asset.title}.jpg`;

	return (
		<Box display="flex" flexDirection="column" style={{ height: "calc(100vh - 48px)" }}>
			<Box display="flex" flex="1" overflow="auto">
				<Box flex="1" px="40" py="24">
					<Box alignItems="center" display="flex" justifyContent="space-between">
						<Box display="flex" flexDirection="column" gap="10">
							<Text color="fg.tertiary" fontSize="lg">File</Text>
							<Text color="fg.default" fontSize="4xl" fontWeight="500">{fileTitle}</Text>
							<Text color="fg.secondary" fontSize="2xl">Updated on Jun 9, 2020</Text>
						</Box>
						<Box alignItems="center" display="flex" style={{ gap: 18 }}>
							<img alt="brand" height={28} src="/opal-orb.svg" width={28} />
							<Box alignItems="center" display="flex" gap="8">
								<IconCopy size={16} color="var(--ax-colors-fg-secondary)" />
								<Text fontSize="lg">Share</Text>
							</Box>
							<Box alignItems="center" display="flex" gap="8">
								<IconEye size={16} color="var(--ax-colors-fg-secondary)" />
								<Text fontSize="lg">1</Text>
							</Box>
						</Box>
					</Box>

					<Box alignItems="center" display="flex" justifyContent="flex-end" mt="20">
						<Box alignItems="center" display="flex" gap="8">
							<IconLink size={18} color="var(--ax-colors-fg-secondary)" />
							<Text color="fg.secondary" fontSize="lg">Public Link</Text>
						</Box>
					</Box>

					<Box
						bg="bg.default"
						border="1"
						borderColor="border.default"
						mt="12"
						style={{ maxWidth: 980 }}
					>
						<Box
							alignItems="center"
							display="flex"
							gap="16"
							px="16"
							py="12"
							style={{ borderBottom: "1px solid var(--ax-colors-border-default)" }}
						>
							{["▥", "📄", "117 %", "⊖", "⊕", "🙈", "☞", "⬚"].map((item, index) => (
								<Box key={item + index} alignItems="center" display="flex" justifyContent="center" style={{ color: "var(--ax-colors-fg-secondary)", minWidth: 28 }}>
									{item}
								</Box>
							))}
							<Box style={{ flex: 1 }} />
							<IconSearch size={18} color="var(--ax-colors-fg-secondary)" />
							<IconUpload size={18} color="var(--ax-colors-fg-secondary)" />
							<IconMaximize size={18} color="var(--ax-colors-fg-secondary)" />
						</Box>
						<Box p="10">
							<img
								alt={asset.title}
								src={asset.preview === "pdf" ? asset.previewSrc || asset.src : asset.src}
								style={{ display: "block", width: "100%" }}
							/>
						</Box>
					</Box>

						<Box display="flex" flexDirection="column" mt="24" style={{ gap: 22 }}>
						{["File Information", "Related Assets", "Fields", "Tags", "Usage"].map((section) => (
							<Box key={section} alignItems="center" display="flex" style={{ gap: 14 }}>
								<IconChevronRight size={16} color="var(--ax-colors-fg-secondary)" />
								<Text color="fg.default" fontSize="2xl">{section}</Text>
							</Box>
						))}
						<Box alignItems="center" display="flex" gap="10" style={{ paddingLeft: 28 }}>
							<Badge intent="neutral">v1</Badge>
							<Text fontSize="lg">{fileTitle}</Text>
						</Box>
					</Box>
				</Box>
			</Box>

			<Box
				alignItems="center"
				bg="bg.default"
				borderT="1"
				borderColor="border.tertiary"
				display="flex"
				justifyContent="center"
				style={{ gap: 14, padding: "14px 18px" }}
			>
				<Button appearance="subtle" onClick={onClose} size="sm">Close</Button>
				<Button appearance="primary" onClick={onAdd} size="sm">Add to Task</Button>
			</Box>
		</Box>
	);
}
