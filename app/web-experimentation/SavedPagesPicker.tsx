"use client";

import {useEffect, useRef, useState, type ChangeEvent} from "react";
import {Box, Card, Field, SearchInput, Text as AxiomText} from "@optiaxiom/react";
import {IconCheck, IconXmark} from "@/app/lib/axiom-icons";
import {Button} from "@/app/components/Button";
import type {SavedPageRecord} from "@/app/web-experimentation/savedPagesMock";

export type SavedPagesPickerProps = {
	pages: readonly SavedPageRecord[];
	searchQuery: string;
	onSearchChange: (q: string) => void;
	selectedIds: string[];
	onChangeSelectedIds: (ids: string[]) => void;
};

export function SavedPagesPicker({
	pages,
	searchQuery,
	onSearchChange,
	selectedIds,
	onChangeSelectedIds,
}: SavedPagesPickerProps) {
	const [menuOpen, setMenuOpen] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!menuOpen) return;
		const handlePointerDown = (e: PointerEvent) => {
			if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
				setMenuOpen(false);
			}
		};
		document.addEventListener("pointerdown", handlePointerDown);
		return () => document.removeEventListener("pointerdown", handlePointerDown);
	}, [menuOpen]);

	const filtered = pages.filter((p) =>
		p.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
	);
	const toggle = (id: string) => {
		onChangeSelectedIds(
			selectedIds.includes(id) ? selectedIds.filter((x) => x !== id) : [...selectedIds, id]
		);
	};
	const remove = (id: string) => onChangeSelectedIds(selectedIds.filter((x) => x !== id));

	const openMenu = () => setMenuOpen(true);

	return (
		<Field label="Saved Pages">
			<Box display="flex" flexDirection="column" gap="12" w="full">
				<div ref={containerRef} style={{position: "relative", width: "100%"}}>
					<SearchInput
						size="lg"
						placeholder="Search to add pages"
						value={searchQuery}
						onChange={(e: ChangeEvent<HTMLInputElement>) =>
							onSearchChange(e.target.value)
						}
						onFocus={openMenu}
						onClick={openMenu}
						w="full"
					/>
					{menuOpen && (
						<Box
							rounded="md"
							border="1"
							borderColor="border.tertiary"
							bg="bg.default"
							p="8"
							w="full"
							style={{
								position: "absolute",
								left: 0,
								right: 0,
								top: "100%",
								marginTop: "4px",
								zIndex: 20,
								maxHeight: "220px",
								overflowY: "auto",
								boxShadow: "var(--ax-shadows-lg, 0 8px 24px rgba(0, 0, 0, 0.12))",
							}}
						>
							<AxiomText
								fontSize="xs"
								color="fg.secondary"
								display="block"
								mb="8"
								px="4"
							>
								Recently created pages
							</AxiomText>
							<Box display="flex" flexDirection="column" gap="2">
								{filtered.length === 0 ? (
									<AxiomText fontSize="sm" color="fg.secondary" px="4" py="8">
										No pages match your search.
									</AxiomText>
								) : (
									filtered.map((page) => {
										const selected = selectedIds.includes(page.id);
										return (
											<Box
												key={page.id}
												display="flex"
												alignItems="center"
												justifyContent="space-between"
												gap="8"
												px="8"
												py="8"
												rounded="sm"
												cursor="pointer"
												bg={selected ? "bg.default.pressed" : undefined}
												onClick={() => toggle(page.id)}
											>
												<AxiomText
													fontSize="sm"
													style={{flex: 1, minWidth: 0}}
												>
													{page.name}
												</AxiomText>
												{selected ? (
													<IconCheck
														size={18}
														stroke={2.5}
														style={{
															color: "var(--ax-colors-fg-default)",
															flexShrink: 0,
														}}
														aria-hidden
													/>
												) : (
													<Box
														style={{width: "18px", flexShrink: 0}}
														aria-hidden
													/>
												)}
											</Box>
										);
									})
								)}
							</Box>
						</Box>
					)}
				</div>
				{selectedIds.length > 0 && (
					<Box display="flex" flexDirection="column" gap="8" w="full">
						{selectedIds.map((id) => {
							const page = pages.find((p) => p.id === id);
							if (!page) return null;
							return (
								<Card
									key={id}
									p="12"
									w="full"
									border="1"
									borderColor="border.tertiary"
									rounded="md"
									bg="bg.default"
								>
									<Box
										display="flex"
										alignItems="center"
										justifyContent="space-between"
										gap="12"
										w="full"
									>
										<Box
											display="flex"
											flexDirection="column"
											gap="4"
											style={{minWidth: 0}}
										>
											<AxiomText fontWeight="600" fontSize="sm">
												{page.name}
											</AxiomText>
											<AxiomText fontSize="sm" color="fg.secondary">
												Used in {page.usedInExperiments}{" "}
												{page.usedInExperiments === 1
													? "experiment"
													: "experiments"}
											</AxiomText>
										</Box>
										<Button
											type="button"
											appearance="subtle"
											size="lg"
											icon={<IconXmark size={18} />}
											aria-label={`Remove ${page.name}`}
											onClick={() => remove(id)}
										/>
									</Box>
								</Card>
							);
						})}
					</Box>
				)}
			</Box>
		</Field>
	);
}
