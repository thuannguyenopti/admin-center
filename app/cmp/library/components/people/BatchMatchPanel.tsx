"use client";

import { useRef, useState } from "react";
import {
	Box,
	Button,
	Checkbox,
	Dialog,
	DialogBody,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	Input,
	Text,
} from "@optiaxiom/react";
import {
	IconPen,
	IconSparkles,
	IconXmark,
} from "@optimizely/axiom-icons";
import { AiBanner, AiBannerOrb } from "../AiBanner";

const MATCH_POOL = [
	{ id: "bm-1", image: "/people/action-peloton-1.jpg", confidence: 94 },
	{ id: "bm-2", image: "/people/portrait-m-1.jpg", confidence: 91 },
	{ id: "bm-3", image: "/people/action-tri-road-m.jpg", confidence: 89 },
	{ id: "bm-4", image: "/people/portrait-m-3.jpg", confidence: 88 },
	{ id: "bm-5", image: "/people/portrait-m-gym.jpg", confidence: 85 },
	{ id: "bm-6", image: "/people/portrait-m-2.jpg", confidence: 83 },
	{ id: "bm-7", image: "/people/portrait-m-4.jpg", confidence: 79 },
	{ id: "bm-8", image: "/people/portrait-m-5.jpg", confidence: 77 },
	{ id: "bm-9", image: "/people/action-swim-m.jpg", confidence: 73 },
	{ id: "bm-10", image: "/people/action-fitness-f.jpg", confidence: 68 },
	{ id: "bm-11", image: "/people/portrait-f-3.jpg", confidence: 64 },
	{ id: "bm-12", image: "/people/action-yoga-f.jpg", confidence: 61 },
];

type Props = {
	name: string;
	open: boolean;
	onApply: (count: number) => void;
	onOpenChange: (open: boolean) => void;
};

export function BatchMatchPanel({ name, onApply, onOpenChange, open }: Props) {
	const [selected, setSelected] = useState<Set<string>>(
		() => new Set(MATCH_POOL.map((m) => m.id)),
	);
	const [reassigned, setReassigned] = useState<Record<string, string>>({});
	const [reassigning, setReassigning] = useState<string | null>(null);
	const [reassignDraft, setReassignDraft] = useState("");
	const inputRef = useRef<HTMLInputElement>(null);

	const setSelectedState = (id: string, checked: boolean) => {
		if (reassigned[id]) return;
		setSelected((current) => {
			const next = new Set(current);
			if (checked) {
				next.add(id);
			} else {
				next.delete(id);
			}
			return next;
		});
	};

	const openReassign = (id: string) => {
		setReassigning(id);
		setReassignDraft("");
		setTimeout(() => inputRef.current?.focus(), 50);
	};

	const confirmReassign = (id: string) => {
		const trimmed = reassignDraft.trim();
		if (!trimmed) {
			cancelReassign();
			return;
		}
		setReassigned((prev) => ({ ...prev, [id]: trimmed }));
		setSelected((current) => {
			const next = new Set(current);
			next.delete(id);
			return next;
		});
		setReassigning(null);
		setReassignDraft("");
	};

	const cancelReassign = () => {
		setReassigning(null);
		setReassignDraft("");
	};

	const clearReassign = (id: string) => {
		setReassigned((prev) => {
			const next = { ...prev };
			delete next[id];
			return next;
		});
	};

	const selectedCount = selected.size;
	const reassignedCount = Object.keys(reassigned).length;
	const applyCount = selectedCount + reassignedCount;
	const total = MATCH_POOL.length;
	const selectableCount = total - reassignedCount;
	const allSelectableSelected = selectedCount === selectableCount;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				className="axiom-v3-recognition"
				size="lg"
				style={{
					display: "flex",
					flexDirection: "column",
					height: "78vh",
					maxHeight: 760,
					maxWidth: 980,
					width: "calc(100vw - 96px)",
				}}
			>
				<DialogHeader>More appearances of {name}</DialogHeader>

				<DialogBody flex="1" overflow="hidden" p="0" style={{ minHeight: 0 }}>
					<Box
						display="flex"
						flexDirection="column"
						gap="16"
						overflow="auto"
						p="24"
						style={{ height: "100%", minHeight: 0 }}
					>
						<AiBanner>
							<AiBannerOrb />
							<Box display="flex" flexDirection="column" gap="2">
								<Text color="fg.default" fontSize="sm" fontWeight="600">
									Opal found {total} potential appearances
								</Text>
								<Text color="fg.secondary" fontSize="sm">
									All selected. Uncheck any that aren't {name}, or reassign them to someone else.
								</Text>
							</Box>
						</AiBanner>

						<Box alignItems="center" display="flex" justifyContent="space-between">
							<Button
								appearance="subtle"
								size="sm"
								onClick={() => {
									setSelected(
										allSelectableSelected
											? new Set()
											: new Set(MATCH_POOL.filter((match) => !reassigned[match.id]).map((match) => match.id)),
									);
								}}
							>
								{allSelectableSelected ? "Deselect all" : "Select all"}
							</Button>
							<Text color="fg.secondary" fontSize="sm" fontWeight="500">
								{selectedCount} / {total} as {name}
								{reassignedCount > 0 && (
									<Box asChild color="fg.warning" fontWeight="600">
										<span> · {reassignedCount} reassigned</span>
									</Box>
								)}
							</Text>
						</Box>

						<Box
							display="grid"
							gap="12"
							style={{ gridTemplateColumns: "repeat(auto-fill, minmax(136px, 1fr))" }}
						>
							{MATCH_POOL.map((match) => {
								const isSelected = selected.has(match.id);
								const altName = reassigned[match.id];
								const isReassigning = reassigning === match.id;

								return (
									<Box key={match.id} style={{ position: "relative" }}>
										<Box
											bg="bg.default"
											overflow="hidden"
											rounded="md"
											shadow="sm"
											style={{
												aspectRatio: "1 / 1",
												opacity: isSelected || altName ? 1 : 0.42,
												position: "relative",
												transition: "opacity 0.15s ease",
											}}
										>
											<img
												alt=""
												src={match.image}
												style={{
													display: "block",
													height: "100%",
													objectFit: "cover",
													width: "100%",
												}}
											/>

											<Box
												style={{
													background: "rgba(0, 0, 0, 0.58)",
													borderRadius: 4,
													bottom: 6,
													left: 6,
													padding: "1px 6px",
													position: "absolute",
												}}
											>
												<Text fontSize="xs" style={{ color: "#fff" }}>
													{match.confidence}%
												</Text>
											</Box>

											{!altName && (
												<Box
													style={{ position: "absolute", right: 6, top: 6 }}
													onClick={(e) => e.stopPropagation()}
												>
													<Checkbox
														aria-label={`Tag this appearance as ${name}`}
														checked={isSelected}
														onCheckedChange={(checked) => setSelectedState(match.id, Boolean(checked))}
													/>
												</Box>
											)}

											{altName && (
												<Box
													bg="bg.warning"
													px="8"
													py="4"
													style={{
														bottom: 0,
														left: 0,
														position: "absolute",
														right: 0,
													}}
												>
													<Text
														fontSize="xs"
														fontWeight="600"
														style={{
															color: "var(--ax-colors-fg-black)",
															overflow: "hidden",
															textOverflow: "ellipsis",
															whiteSpace: "nowrap",
														}}
													>
														{altName}
													</Text>
												</Box>
											)}

											{!isSelected && !altName && !isReassigning && (
												<Button
													appearance="default"
													className="reassign-btn"
													icon={<IconPen size={12} />}
													iconPosition="start"
													size="sm"
													style={{
														bottom: 6,
														left: 6,
														opacity: 0,
														position: "absolute",
														transition: "opacity 0.15s ease",
													}}
													onClick={(e) => {
														e.stopPropagation();
														openReassign(match.id);
													}}
												>
													Reassign
												</Button>
											)}

											{altName && (
												<Button
													appearance="default"
													aria-label={`Remove reassignment to ${altName}`}
													icon={<IconXmark size={12} />}
													size="sm"
													style={{ position: "absolute", right: 6, top: 6 }}
													onClick={(e) => {
														e.stopPropagation();
														clearReassign(match.id);
													}}
												/>
											)}
										</Box>

										{isReassigning && (
												<Box
													bg="bg.default"
													border="1"
													borderColor="border.secondary"
													display="flex"
												flexDirection="column"
												gap="8"
												p="8"
												rounded="md"
												shadow="md"
												style={{
													left: 0,
													position: "absolute",
													right: 0,
													top: "calc(100% + 4px)",
													zIndex: 10,
												}}
											>
												<Text color="fg.secondary" fontSize="xs" fontWeight="500">
													Who is this person?
												</Text>
												<Input
													ref={inputRef}
													placeholder="Type a name..."
													size="md"
													value={reassignDraft}
													onChange={(e) => setReassignDraft(e.target.value)}
													onKeyDown={(e) => {
														if (e.key === "Enter") confirmReassign(match.id);
														if (e.key === "Escape") cancelReassign();
													}}
												/>
												<Box display="flex" gap="4">
													<Button appearance="subtle" size="sm" style={{ flex: 1 }} onClick={cancelReassign}>
														Cancel
													</Button>
													<Button
														appearance="primary"
														disabled={!reassignDraft.trim()}
														size="sm"
														style={{ flex: 1 }}
														onClick={() => confirmReassign(match.id)}
													>
														Assign
													</Button>
												</Box>
											</Box>
										)}
									</Box>
								);
							})}
						</Box>
					</Box>
				</DialogBody>

				<DialogFooter>
					<DialogClose appearance="subtle" size="lg">
						Skip for now
					</DialogClose>
					<Button
						appearance="primary"
						disabled={applyCount === 0}
						icon={<IconSparkles size={14} />}
						iconPosition="start"
						size="lg"
						onClick={() => onApply(applyCount)}
					>
						Apply {applyCount} {applyCount === 1 ? "tag" : "tags"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
