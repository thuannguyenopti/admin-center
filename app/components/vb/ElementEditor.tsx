"use client";

import React, {Fragment, useEffect, useRef, useState, useMemo} from "react";
import {Box, Text, Heading, Menu, MenuTrigger, MenuContent, Separator} from "@optiaxiom/react";
import {IconDots, IconPalette, IconTrash} from "@tabler/icons-react";
import {initialContentTypes, Property, ContentType} from "@/app/db/initialData";
import {groupPropertiesByGroup} from "./utils/propertyGroups";
import {PropertyRenderer} from "@/app/components/property-renderers";
import usePersistentState from "@/app/usePersistentState";

// Import to register all property renderers
import "@/app/components/property-renderers";
import {Button} from "../Button";
import {IconArrowLeft} from "@optiaxiom/icons";
import Flow from "../Flow";

type Props = {
	currentEle: string;
	elementType: string;
	properties?: any;
	onBack: () => void;
	onInputChange: (value: any, keyOrIndex: string | number) => void;
	outlineTitle?: string;
	onOpenStyleEditor?: () => void;
	onRemove?: () => void;
};

export default function ElementEditor({
	currentEle,
	elementType,
	properties,
	onBack,
	onInputChange,
	outlineTitle,
	onOpenStyleEditor,
	onRemove,
}: Props) {
	const rootRef = useRef<HTMLDivElement | null>(null);
	const [menuOpen, setMenuOpen] = useState(false);

	// Load runtime content types from localStorage (includes user-created properties)
	const [runtimeContentTypes] = usePersistentState("contentTypes", initialContentTypes) as [
		ContentType[],
		any,
	];

	// Get content type definition and group properties
	const contentType = useMemo(() => {
		return (
			runtimeContentTypes?.find((ct) => ct.id === elementType) ||
			initialContentTypes.find((ct) => ct.id === elementType)
		);
	}, [elementType, runtimeContentTypes]);

	const propertyGroups = useMemo(() => {
		if (!contentType) return {};
		return groupPropertiesByGroup(contentType.properties, true);
	}, [contentType]);

	useEffect(() => {
		// Don't focus when "closed"
		if (!currentEle || currentEle === "none") return;

		// Match your slide duration (you use `duration-300`)
		const SLIDE_MS = 300;

		const t = window.setTimeout(() => {
			const root = rootRef.current;
			if (!root) return;

			const selector = [
				'input:not([type="hidden"]):not([disabled])',
				"textarea:not([disabled])",
				"select:not([disabled])",
				'[tabindex]:not([tabindex="-1"])',
			].join(",");

			const el = root.querySelector(selector) as any;
			if (!el) return;

			// Prevent scroll-jank during/after transform animations
			try {
				el.focus?.({preventScroll: true});
			} catch {
				el.focus?.();
			}

			// Optional: select text if it's a real input/textarea
			/*if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
        try {
          el.select?.();
        } catch { }
      }*/
		}, SLIDE_MS);

		return () => window.clearTimeout(t);
	}, [currentEle]);

	return (
		<div ref={rootRef} className="pl-6 pr-6 flex-none w-full pt-4">
			<Button
				className="-translate-x-2"
				appearance="subtle"
				icon={<IconArrowLeft />}
				size="sm"
				onClick={onBack}
			>
				{outlineTitle || "Outline"}
			</Button>
			<Box
				display="flex"
				alignItems="center"
				justifyContent="space-between"
				gap="8"
				pr="8"
				py="4"
			>
				<Heading level="4">
					{contentType?.displayName || contentType?.name || elementType}
				</Heading>

				<Box display="flex" alignItems="center" gap="8">
					{(onOpenStyleEditor || onRemove) && (
						<Menu
							onOpenChange={() => setMenuOpen(!menuOpen)}
							open={menuOpen}
							options={[
								...(onOpenStyleEditor
									? [
											{
												addon: <IconPalette size={16} />,
												label: "Style",
												execute: () => {
													onOpenStyleEditor();
													setMenuOpen(false);
												},
											},
										]
									: []),
								...(onRemove
									? [
											{
												addon: <IconTrash size={16} />,
												label: "Remove Element",
												intent: "danger" as const,
												execute: () => {
													onRemove();
													setMenuOpen(false);
												},
											},
										]
									: []),
							]}
						>
							<MenuTrigger
								onClick={(e) => {
									e.stopPropagation();
									setMenuOpen(true);
								}}
								icon={<IconDots />}
								aria-label="Element options"
								appearance="subtle"
								size="sm"
								iconPosition="start"
							/>
							<MenuContent />
						</Menu>
					)}
				</Box>
			</Box>
			{/* Render properties grouped by groupName */}
			<Box mt="16">
				{(() => {
					// Calculate groups with visible properties
					const groupsWithVisibleProps = Object.entries(propertyGroups).filter(
						([_, groupProps]) => {
							const visibleProps = groupProps.filter((prop) => {
								return !(prop.id === "template" || prop.type === "SelectOne");
							});
							return visibleProps.length > 0;
						}
					);

					// Only show headers if there are 2 or more groups with visible properties
					const shouldShowHeaders = groupsWithVisibleProps.length > 1;

					// Render properties grouped by groupName
					return Object.entries(propertyGroups).map(([groupName, groupProps]) => {
						// Filter out properties that should be hidden
						const visibleProps = groupProps.filter((prop) => {
							// Skip template property - it's accessed via context menu "Style" option
							return !(prop.id === "template" || prop.type === "SelectOne");
						});

						// Don't render the group at all if no visible properties
						if (visibleProps.length === 0) return null;

						return (
							<Fragment key={groupName}>
								{shouldShowHeaders && (
									<Box mb="12" mt="16">
										<Text
											fontSize="sm"
											fontFamily="mono"
											color="fg.tertiary"
											mb="8"
											mt="32"
											textTransform="uppercase"
										>
											{groupName}
										</Text>
										<Separator />
									</Box>
								)}
								<Box display="flex" flexDirection="column" gap="16">
									{visibleProps.map((prop) => {
										const propData = properties ? properties[prop.id] : null;
										const value =
											propData != null ? propData : (prop.defaultValue ?? "");

										return (
											<PropertyRenderer
												key={prop.id}
												property={prop}
												value={value}
												onChange={(newVal: any) =>
													onInputChange(newVal, prop.id)
												}
												enableAI={true}
												context={{runtimeContentTypes}}
											/>
										);
									})}
								</Box>
							</Fragment>
						);
					});
				})()}
			</Box>
		</div>
	);
}
