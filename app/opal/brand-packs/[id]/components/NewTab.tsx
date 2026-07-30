"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Box, Text } from "@optiaxiom/react";
import { IconCheck } from "@optimizely/axiom-icons";
import type { BrandPack } from "../../types";
import { ColoursSection } from "./NewTabColoursSection";
import { TypographySection } from "./NewTabTypographySection";
import { LogosSection } from "./NewTabLogosSection";
import { ImagesSection } from "./NewTabImagesSection";
import { DescriptorsSection } from "./NewTabDescriptorsSection";
import { ToneSection } from "./NewTabToneSection";
import { TemplatesSection } from "./NewTabTemplatesSection";

type SectionId =
	| "colours"
	| "typography"
	| "logos"
	| "images"
	| "descriptors"
	| "tone"
	| "templates";

const SECTION_LABELS: Record<SectionId, string> = {
	colours: "Colours",
	typography: "Typography",
	logos: "Logos",
	images: "Images",
	descriptors: "Style Descriptors",
	tone: "Tone of Voice",
	templates: "Templates",
};

const SECTION_IDS: SectionId[] = [
	"colours",
	"typography",
	"logos",
	"images",
	"descriptors",
	"tone",
	"templates",
];

type Props = { pack: BrandPack };

export function NewTab({ pack }: Props) {
	const [activeSection, setActiveSection] = useState<SectionId>("colours");
	const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
	const [descriptorsFilled, setDescriptorsFilled] = useState(false);
	const [toneFilled, setToneFilled] = useState(false);
	const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

	const triggerSave = useCallback(() => {
		setSaveStatus("saving");
		if (saveTimer.current) clearTimeout(saveTimer.current);
		saveTimer.current = setTimeout(() => setSaveStatus("saved"), 1400);
	}, []);

	const isFilled = (id: SectionId): boolean => {
		switch (id) {
			case "colours":    return pack.colors.length > 0;
			case "typography": return Boolean(pack.typography.heading);
			case "logos":      return pack.assets.some((a) => a.type === "logo");
			case "images":     return pack.assets.some((a) => a.type !== "logo");
			case "descriptors": return descriptorsFilled;
			case "tone":       return toneFilled;
			case "templates":  return pack.templates.length > 0;
		}
	};

	const scrollToSection = (id: SectionId) => {
		document.getElementById(`section-${id}`)?.scrollIntoView({
			behavior: "smooth",
			block: "start",
		});
		setActiveSection(id);
	};

	// Scroll-spy: find the nearest scrollable ancestor and listen to its scroll events
	useEffect(() => {
		const findScrollParent = (el: Element | null): Element | null => {
			if (!el || el === document.body) return null;
			const style = getComputedStyle(el);
			if (style.overflowY === "auto" || style.overflowY === "scroll") return el;
			return findScrollParent(el.parentElement);
		};

		const anchor = document.getElementById("section-colours");
		const container = findScrollParent(anchor?.parentElement ?? null);
		if (!container) return;

		const onScroll = () => {
			const containerTop = container.getBoundingClientRect().top;
			for (const id of [...SECTION_IDS].reverse()) {
				const el = document.getElementById(`section-${id}`);
				if (!el) continue;
				if (el.getBoundingClientRect().top - containerTop <= 140) {
					setActiveSection(id);
					break;
				}
			}
		};

		container.addEventListener("scroll", onScroll, { passive: true });
		return () => container.removeEventListener("scroll", onScroll);
	}, []);

	return (
		<Box display="flex" gap="40" pb="80">
			{/* Left sticky nav */}
			<Box
				display="flex"
				flexDirection="column"
				style={{
					alignSelf: "flex-start",
					flexShrink: 0,
					position: "sticky",
					top: 24,
					width: 168,
				}}
			>
				{SECTION_IDS.map((id) => {
					const isActive = activeSection === id;
					const filled = isFilled(id);
					return (
						<Box
							alignItems="center"
							display="flex"
							gap="10"
							key={id}
							onClick={() => scrollToSection(id)}
							py="6"
							style={{ cursor: "pointer" }}
						>
							{/* Completeness dot */}
							<Box
								rounded="full"
								style={{
									background: filled
										? "var(--ax-colors-fg-accent)"
										: "var(--ax-colors-border-default)",
									flexShrink: 0,
									height: 6,
									width: 6,
								}}
							/>
							<Text
								color={isActive ? "fg.default" : "fg.secondary"}
								fontSize="sm"
								fontWeight={isActive ? "600" : "400"}
								style={{ lineHeight: 1.4, transition: "color 0.12s, font-weight 0.12s" }}
							>
								{SECTION_LABELS[id]}
							</Text>
						</Box>
					);
				})}

				{/* Save indicator */}
				{saveStatus !== "idle" && (
					<Box
						alignItems="center"
						display="flex"
						gap="4"
						mt="20"
						style={{
							opacity: saveStatus === "saving" ? 0.4 : 1,
							transition: "opacity 0.2s",
						}}
					>
						{saveStatus === "saved" && (
							<IconCheck
								size={12}
								style={{ color: "var(--ax-colors-fg-success)", flexShrink: 0 }}
							/>
						)}
						<Text color="fg.tertiary" fontSize="xs">
							{saveStatus === "saving" ? "Saving…" : "Saved"}
						</Text>
					</Box>
				)}
			</Box>

			{/* Document */}
			<Box display="flex" flexDirection="column" gap="48" style={{ flex: 1, minWidth: 0, maxWidth: 760 }}>
				<Section heading="Colours">
					<ColoursSection pack={pack} onSave={triggerSave} />
				</Section>
				<Section heading="Typography">
					<TypographySection pack={pack} onSave={triggerSave} />
				</Section>
				<Section heading="Logos">
					<LogosSection pack={pack} onSave={triggerSave} />
				</Section>
				<Section heading="Images">
					<ImagesSection pack={pack} onSave={triggerSave} />
				</Section>
				<Section heading="Style Descriptors">
					<DescriptorsSection
						onSave={triggerSave}
						onFilledChange={setDescriptorsFilled}
					/>
				</Section>
				<Section heading="Tone of Voice">
					<ToneSection
						pack={pack}
						onSave={triggerSave}
						onFilledChange={setToneFilled}
					/>
				</Section>
				<Section heading="Templates">
					<TemplatesSection pack={pack} />
				</Section>
			</Box>
		</Box>
	);
}

function Section({ children, heading }: { children: React.ReactNode; heading: string }) {
	return (
		<Box display="flex" flexDirection="column" gap="16">
			<Text
				style={{
					fontSize: 30,
					fontWeight: 800,
					letterSpacing: "-0.03em",
					lineHeight: 1,
				}}
			>
				{heading}
			</Text>
			{children}
		</Box>
	);
}
