"use client";

import {Box, Text} from "@optiaxiom/react";

export function WordPreview() {
	return (
		<Box
			display="flex"
			flexDirection="column"
			alignItems="center"
			style={{
				minHeight: "calc(100dvh - 48px)",
				padding: "24px 28px",
				boxSizing: "border-box",
			}}
		>
			<Box
				bg="bg.default"
				rounded="sm"
				shadow="sm"
				style={{
					width: "100%",
					maxWidth: 600,
					minHeight: 760,
					padding: "64px 72px",
					boxSizing: "border-box",
				}}
			>
				{/* Word-like header bar */}
				<Box
					display="flex"
					alignItems="center"
					gap="8"
					pb="24"
					style={{borderBottom: "3px solid #2E82F5", marginBottom: 32}}
				>
					<Box
						style={{
							width: 28,
							height: 28,
							borderRadius: 4,
							background: "#2E82F5",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							flexShrink: 0,
						}}
					>
						<Text style={{color: "#fff", fontWeight: 700, fontSize: 13}}>W</Text>
					</Box>
					<Box>
						<Text style={{fontSize: 13, fontWeight: 600, color: "#2E3442"}}>
							Product Brief
						</Text>
						<Text style={{fontSize: 10, color: "#66708C"}}>
							Optimizely · Confidential Draft
						</Text>
					</Box>
				</Box>

				<Text style={{fontSize: 22, fontWeight: 700, color: "#2E3442", lineHeight: 1.2}}>
					Opal Files — Product Brief
				</Text>
				<Text style={{fontSize: 12, color: "#66708C", marginTop: 6}}>
					Version 0.3 · April 2025 · Jamie Chen
				</Text>

				{[
					{
						heading: "Overview",
						body: "This document outlines the product direction for the Opal Files feature, a persistent file layer that allows users to upload, organize, and reference documents directly within their Opal workspace.",
					},
					{
						heading: "Problem Statement",
						body: "Users currently paste context from working documents into Opal manually. There is no persistent file layer, no organization, and no way to connect existing repositories. This creates friction and makes agents less knowledgeable to set up.",
					},
					{
						heading: "Goals",
						body: "Enable users to systematically update personal context. Support team and org-level file sharing. Integrate with external repositories including Confluence, SharePoint, Notion, and Google Drive. Enforce tiered storage limits.",
					},
					{
						heading: "Out of Scope",
						body: "Real-time co-editing of documents, version conflict resolution, and offline access are not included in the initial release.",
					},
				].map(({heading, body}) => (
					<Box key={heading} mt="24">
						<Text
							style={{
								fontSize: 14,
								fontWeight: 700,
								color: "#2E3442",
								marginBottom: 6,
							}}
						>
							{heading}
						</Text>
						<Text style={{fontSize: 13, color: "#4F576E", lineHeight: 1.7}}>
							{body}
						</Text>
					</Box>
				))}

				<Box
					mt="48"
					pt="16"
					style={{borderTop: "1px solid #DADFEB"}}
					display="flex"
					justifyContent="space-between"
				>
					<Text style={{fontSize: 10, color: "#838DA4"}}>
						Optimizely Internal — Do Not Distribute
					</Text>
					<Text style={{fontSize: 10, color: "#838DA4"}}>Page 1 of 3</Text>
				</Box>
			</Box>
		</Box>
	);
}
