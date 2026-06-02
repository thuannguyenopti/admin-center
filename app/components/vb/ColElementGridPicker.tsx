import React, {ReactNode, useMemo, useState} from "react";
import {Box, Popover, PopoverContent, PopoverTrigger, SearchInput, Text} from "@optiaxiom/react";
import {HoverCard, HoverCardContent, HoverCardTrigger} from "@optiaxiom/react/unstable";
import {IconBook} from "@tabler/icons-react";

type ElementOption = {type: string; label: string};

type ColElementGridPickerProps = {
	elementOptions: ElementOption[];
	addElement: (type: string) => void;
	iconForType: (type: string) => ReactNode;
	/** Optional trigger node. Wrap your button in PopoverTrigger or pass plain children. */
	trigger: ReactNode;
	/** Optional thumbnail content keyed by element type. Renders inside the tile's preview square. */
	thumbnails?: Record<string, ReactNode>;
	/** Optional Storybook URL keyed by element type. When provided, the book icon's
	 *  hover overlay shows an embedded Storybook page; otherwise a placeholder is shown. */
	storybookUrls?: Record<string, string>;
	/** Notified when the popover opens or closes. */
	onOpenChange?: (open: boolean) => void;
};

const ColElementGridPicker: React.FC<ColElementGridPickerProps> = ({
	elementOptions,
	addElement,
	iconForType,
	trigger,
	thumbnails,
	storybookUrls,
	onOpenChange,
}) => {
	const [open, setOpen] = useState(false);
	const [inputValue, setInputValue] = useState("");

	const handleOpenChange = (next: boolean) => {
		setOpen(next);
		onOpenChange?.(next);
		if (!next) setInputValue("");
	};

	const handleSelect = (type: string) => {
		handleOpenChange(false);
		addElement(type);
	};

	const filteredOptions = useMemo(() => {
		const q = inputValue.trim().toLowerCase();
		if (!q) return elementOptions;
		return elementOptions.filter((opt) => opt.label.toLowerCase().includes(q));
	}, [elementOptions, inputValue]);

	return (
		<Popover open={open} onOpenChange={handleOpenChange}>
			<PopoverTrigger asChild>{trigger}</PopoverTrigger>
			<PopoverContent
				onClick={(e) => e.stopPropagation()}
				style={{
					padding: 8,
					width: 296,
				}}
			>
				<Box mb="8" px="4">
					<Text
						fontSize="sm"
						color="fg.tertiary"
						fontFamily="mono"
						textTransform="uppercase"
					>
						Add Element
					</Text>
				</Box>
				<Box mb="8">
					<SearchInput
						autoFocus
						placeholder="Filter..."
						value={inputValue}
						onValueChange={setInputValue}
						onValueClear={() => setInputValue("")}
					/>
				</Box>
				{filteredOptions.length === 0 ? (
					<Box py="8" textAlign="center">
						<Text fontSize="sm" color="fg.tertiary">
							No matching elements
						</Text>
					</Box>
				) : (
					<div
						style={{
							display: "grid",
							gridTemplateColumns: "repeat(3, 1fr)",
							gap: 8,
						}}
					>
						{filteredOptions.map((opt) => {
							const previewUrl = storybookUrls?.[opt.type];
							return (
								<button
									key={opt.type}
									type="button"
									onClick={(e) => {
										e.stopPropagation();
										handleSelect(opt.type);
									}}
									className="group flex flex-col items-stretch gap-1.5 rounded cursor-pointer transition-colors"
								>
									<Box
										bg="bg.secondary"
										borderColor="border.tertiary"
										border="1"
										rounded="md"
										className="relative w-full aspect-square flex items-center justify-center overflow-hidden transition-shadow group-hover:shadow-[0_0_0_2px_var(--ax-colors-border-focus)]"
									>
										{thumbnails?.[opt.type]}
										<HoverCard openDelay={120} closeDelay={80}>
											<HoverCardTrigger asChild>
												<span
													role="button"
													aria-label={`Preview ${opt.label}`}
													onClick={(e) => e.stopPropagation()}
													className="absolute top-1 right-1 transition-opacity duration-500 group-hover:opacity-50 flex items-center justify-center w-5 h-5 rounded bg-[var(--ax-colors-fg-default)] text-[var(--ax-colors-bg-default)] !hover:opacity-100 opacity-0 shadow-sm"
												>
													<IconBook size={16} />
												</span>
											</HoverCardTrigger>
											<HoverCardContent
												onClick={(e) => e.stopPropagation()}
												style={{
													padding: 0,
													width: 480,
													height: 320,
													overflow: "hidden",
												}}
											>
												<Box
													borderColor="border.tertiary"
													borderB="1"
													px="12"
													py="8"
													bg="bg.default"
												>
													<Text
														fontSize="sm"
														color="fg.default"
														fontWeight="500"
													>
														{opt.label}
													</Text>
												</Box>
												{previewUrl ? (
													<iframe
														src={previewUrl}
														title={`Storybook preview: ${opt.type}`}
														style={{
															width: "100%",
															height: "calc(100% - 33px)",
															border: 0,
															background:
																"var(--ax-colors-bg-default)",
														}}
													/>
												) : (
													<Box
														px="16"
														textAlign="center"
														style={{
															height: "calc(100% - 33px)",
															display: "flex",
															alignItems: "center",
															justifyContent: "center",
														}}
													>
														<Text fontSize="sm" color="fg.tertiary">
															No Storybook URL provided for {opt.type}
														</Text>
													</Box>
												)}
											</HoverCardContent>
										</HoverCard>
									</Box>
									<Box
										display="flex"
										alignItems="center"
										gap="4"
										color="fg.default"
									>
										<span style={{display: "inline-flex", flexShrink: 0}}>
											{iconForType(opt.type)}
										</span>
										<Text fontSize="sm" color="fg.default">
											{opt.label}
										</Text>
									</Box>
								</button>
							);
						})}
					</div>
				)}
			</PopoverContent>
		</Popover>
	);
};

export default ColElementGridPicker;
