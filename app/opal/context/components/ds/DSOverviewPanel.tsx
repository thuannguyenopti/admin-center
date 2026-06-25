"use client";

import {Box, Text} from "@optiaxiom/react";
import {STRIDE_SB_BASE, type DSComponent} from "../../data/designSystem";
import {iframeStyleForTileSize} from "@/app/components/PreviewCard";
import {getStorySize} from "@/app/components/vb/storySizes";

const TILE_W = 360;
const TILE_H = 210;

function storySize(comp: DSComponent) {
	return getStorySize(comp.id.replace(/^ds-/, "ct-"));
}

export function DSOverviewPanel({componentList}: {componentList: DSComponent[]}) {
	return (
		<Box style={{padding: "20px", overflowY: "auto", height: "100%", boxSizing: "border-box"}}>
			<Box display="flex" flexDirection="column" gap="16">
				<Text fontWeight="500" fontSize="md" color="fg.default">
					Stride Design System
				</Text>
				<Box
					style={{
						display: "grid",
						gridTemplateColumns: `repeat(auto-fill, ${TILE_W}px)`,
						gap: 10,
					}}
				>
					{componentList.map((comp) => (
						<Box
							key={comp.id}
							rounded="lg"
							border="1"
							borderColor="border.secondary"
							style={{overflow: "hidden", width: TILE_W}}
						>
							<Box
								style={{
									height: TILE_H,
									width: TILE_W,
									position: "relative",
									overflow: "hidden",
									background: "var(--ax-colors-bg-secondary)",
								}}
							>
								<iframe
									src={`${STRIDE_SB_BASE}${comp.story}`}
									style={iframeStyleForTileSize(TILE_W, TILE_H, storySize(comp))}
									title={comp.label}
									sandbox="allow-scripts allow-same-origin"
								/>
							</Box>
							<Box
								display="flex"
								alignItems="center"
								px="8"
								py="6"
								style={{borderTop: "1px solid var(--ax-colors-border-secondary)"}}
							>
								<Text fontSize="sm" fontWeight="500" color="fg.default">
									{comp.label}
								</Text>
							</Box>
						</Box>
					))}
				</Box>
			</Box>
		</Box>
	);
}
