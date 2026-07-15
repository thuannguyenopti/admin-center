"use client";

import { useRef, useState } from "react";
import { useParams } from "next/navigation";
import {
	AlertDialog, AlertDialogAction, AlertDialogBody, AlertDialogCancel,
	AlertDialogContent, AlertDialogFooter, AlertDialogHeader,
	Box, Button, Heading, Select, SelectContent, SelectTrigger, Tabs,
	TabsContent, TabsList, TabsTrigger, Text, Tooltip,
} from "@optiaxiom/react";
import { IconCircleQuestion, IconEye, IconPen, IconTrashCan, IconUpload, IconUserSlash, IconXmark } from "@optiaxiom/icons";
import Image from "next/image";
import { Input } from "@/app/components/Input";
import { VAUS } from "@/app/opal/data/vaus";
import { PersonalityTab } from "./PersonalityTab";

const CAPTION: React.CSSProperties = {
	fontFamily: "Roboto Mono, monospace",
	fontSize: 12,
	fontWeight: 400,
	lineHeight: "1.25",
	letterSpacing: "0.08em",
	textTransform: "uppercase" as const,
};

const PICKER_AVATARS = [
	{ src: "/avatars/vau-frank.png",   bg: "#FAF6E8" },
	{ src: "/avatars/bub.png",         bg: "#E0F0F8" },
	{ src: "/avatars/bike.png",        bg: "#F5EDE0" },
	{ src: "/avatars/tat.png",         bg: "#F0EBF8" },
	{ src: "/avatars/chicken.png",     bg: "#FFF8E8" },
	{ src: "/avatars/vau-henry.png",   bg: "#F5F0E8" },
	{ src: "/avatars/vau-tony.png",    bg: "#E4F3EC" },
	{ src: "/avatars/vau-kerby.png",   bg: "#F5EBF8" },
	{ src: "/avatars/vau-mayling.png", bg: "#F0F5E8" },
	{ src: "/avatars/vau-poppy.png",   bg: "#F0E8F8" },
];

const PREVIEW_PROMPTS = ["Summarize my week", "Tell me a joke", "How would you handle a missed deadline"];
const PREVIEW_RESPONSES: Record<string, string> = {
	"Summarize my week": "Hey! 👋 Your week's mostly on track. Two deadlines slipped to Monday, and the budget review is still waiting on finance. 🧾 Happy to adjust if this isn't quite right.",
	"Tell me a joke": "Why did the calendar go to therapy? Too many dates. 📅 …I'll show myself out.",
	"How would you handle a missed deadline": "First, I'd surface it immediately — no point letting it fester. Then I'd map what slipped, what it unlocks, and what the new realistic timeline looks like. Surprises are worse than bad news.",
};

function AvatarPickerCard({
	avatar, isSelected, onClick,
}: {
	avatar: { src: string; bg: string };
	isSelected: boolean;
	onClick: () => void;
}) {
	const [hovered, setHovered] = useState(false);
	return (
		<Box
			onClick={onClick}
			onMouseEnter={() => setHovered(true)}
			onMouseLeave={() => setHovered(false)}
			style={{
				position: "relative",
				borderRadius: 12,
				overflow: "hidden",
				cursor: "pointer",
				border: isSelected ? "2.5px solid #14B8A6" : "2.5px solid transparent",
				backgroundColor: avatar.bg,
				aspectRatio: "1 / 1",
				transition: "border-color 0.15s ease",
			}}
		>
			<Image src={avatar.src} alt="" fill unoptimized style={{ objectFit: "cover" }} />
			{!isSelected && (
				<Box
					style={{
						position: "absolute",
						inset: 0,
						background: hovered ? "rgba(0,0,0,0.08)" : "rgba(0,0,0,0.32)",
						transition: "background 0.15s ease",
					}}
				/>
			)}
		</Box>
	);
}

export default function VATIdentityPage() {
	const params = useParams();
	const id = params?.id as string;
	const vau = VAUS.find((v) => v.id === id);
	const name = vau?.characterName ?? vau?.name ?? "Randy";

	const [nameValue, setNameValue] = useState(name);
	const [visibility, setVisibility] = useState("Private");
	const [showDeactivate, setShowDeactivate] = useState(false);
	const [savedName, setSavedName] = useState(name);

	const [currentAvatar, setCurrentAvatar] = useState<{ src: string; bg: string } | null>(null);
	const [showAvatarPicker, setShowAvatarPicker] = useState(false);
	const [pickerSelected, setPickerSelected] = useState<{ src: string; bg: string } | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const [previewOpen, setPreviewOpen] = useState(false);
	const [previewPrompt, setPreviewPrompt] = useState("Summarize my week");
	const [activeTab, setActiveTab] = useState("basics");
	const [selectedPersonality, setSelectedPersonality] = useState<{ name: string; icon: string } | null>(null);

	const isDirty = nameValue !== savedName;
	const handleSave = () => setSavedName(nameValue);

	const displayAvatarSrc = currentAvatar?.src ?? vau?.avatar ?? "";
	const displayAvatarBg = currentAvatar?.bg ?? vau?.avatarBg;

	return (
		<Box style={{ display: "flex", height: "100%", overflow: "hidden" }}>
			<Box style={{ flex: 1, minWidth: 0, overflowY: "auto" }}>
				<Box style={{ padding: "32px 40px 0" }}>
					<Box style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
						<Heading level="2">Identity</Heading>
						{activeTab === "personality" && (
							<Button
								size="md"
								icon={<IconEye size={16} />}
								onClick={() => setPreviewOpen((p) => !p)}
							>
								{previewOpen ? "Close preview" : "Open personality preview"}
							</Button>
						)}
					</Box>
					<Text color="fg.secondary" fontSize="md" style={{ display: "block", marginBottom: 24 }}>
						Define who {name} is and how they show up in the workplace
					</Text>

					<Tabs value={activeTab} onValueChange={setActiveTab}>
						<TabsList mb="24">
							<TabsTrigger value="basics">The basics</TabsTrigger>
							<TabsTrigger value="personality">Personality</TabsTrigger>
						</TabsList>

						{/* ── The basics tab ── */}
						<TabsContent value="basics">
							<Box style={{ paddingBottom: 40 }}>
								{/* Identity card */}
								<Box bg="bg.default" style={{ border: "1px solid var(--ax-colors-border-default)", borderRadius: 8, padding: "28px 32px" }}>
									<Box style={{ display: "flex", alignItems: "flex-start", gap: 20, marginBottom: 24 }}>
										<Box style={{ position: "relative", flexShrink: 0 }}>
											<Box style={{ width: 56, height: 56, borderRadius: "50%", overflow: "hidden", backgroundColor: displayAvatarBg }}>
												{displayAvatarSrc && (
													<Image
														src={displayAvatarSrc}
														alt={name}
														width={56}
														height={56}
														unoptimized
														style={{ width: "100%", height: "100%", objectFit: "cover" }}
													/>
												)}
											</Box>
											<Box
												onClick={() => { setPickerSelected(null); setShowAvatarPicker(true); }}
												style={{
													position: "absolute", bottom: -6, right: -6,
													width: 24, height: 24, borderRadius: "50%",
													background: "var(--ax-colors-bg-default)",
													border: "1px solid var(--ax-colors-border-default)",
													display: "flex", alignItems: "center", justifyContent: "center",
													cursor: "pointer",
												}}
											>
												<IconPen style={{ width: 13, height: 13, color: "var(--ax-colors-fg-secondary)" }} />
											</Box>
										</Box>
										<Box style={{ flex: 1 }}>
											<Text style={{ fontWeight: 600, fontSize: 16, color: "var(--ax-colors-fg-default)", display: "block", marginBottom: 2 }}>Identity</Text>
											<Text fontSize="sm" color="fg.secondary">
												The basics — who {name} is and how long they&apos;ve been on the job.
											</Text>
										</Box>
										{isDirty && (
											<Button appearance="primary" size="md" onClick={handleSave} style={{ alignSelf: "flex-start", flexShrink: 0 }}>
												Save changes
											</Button>
										)}
									</Box>

									<Box style={{ display: "flex", flexDirection: "column", gap: 20 }}>
										<Box>
											<Text fontSize="sm" color="fg.secondary" mb="6" style={{ fontWeight: 500 }}>Name</Text>
											<Input
												value={nameValue}
												onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNameValue(e.target.value)}
												style={{ width: "100%" }}
											/>
										</Box>
										<Box>
											<Text fontSize="sm" color="fg.secondary" mb="6" style={{ fontWeight: 500 }}>Visibility</Text>
											<Select
												value={visibility}
												onValueChange={setVisibility}
												options={["Private", "Team", "Public"].map((opt) => ({ label: opt, value: opt }))}
											>
												<SelectTrigger size="lg" style={{ width: "100%", fontFamily: "inherit", fontSize: 16, fontWeight: 400 }} />
												<SelectContent />
											</Select>
										</Box>
										<Box>
											<Box display="flex" alignItems="center" gap="4" mb="6">
												<Text fontSize="sm" color="fg.secondary" style={{ fontWeight: 500 }}>Email</Text>
												<Tooltip content="This field is not editable" delayDuration={300}>
													<span style={{ display: "inline-flex" }}>
														<IconCircleQuestion size={14} color="var(--ax-colors-fg-tertiary)" />
													</span>
												</Tooltip>
											</Box>
											<Box style={{
												display: "flex", alignItems: "center",
												height: 48, padding: "0 14px",
												border: "1px solid var(--ax-colors-border-default)",
												borderRadius: 6, background: "var(--ax-colors-bg-secondary)",
											}}>
												<Text fontSize="md" color="fg.default">{name}.VT@vau.opal.optimizely.com</Text>
											</Box>
										</Box>
										<Box>
											<Box display="flex" alignItems="center" gap="4" mb="6">
												<Text fontSize="sm" color="fg.secondary" style={{ fontWeight: 500 }}>Start date</Text>
												<Tooltip content="This field is not editable" delayDuration={300}>
													<span style={{ display: "inline-flex" }}>
														<IconCircleQuestion size={14} color="var(--ax-colors-fg-tertiary)" />
													</span>
												</Tooltip>
											</Box>
											<Box style={{
												height: 40, padding: "0 12px",
												background: "var(--ax-colors-bg-secondary)",
												border: "1px solid var(--ax-colors-border-default)",
												borderRadius: 6, display: "flex", alignItems: "center",
											}}>
												<Text fontSize="md" color="fg.default">March 12, 2026</Text>
											</Box>
										</Box>
									</Box>
								</Box>

								<Box style={{ height: 1, background: "var(--ax-colors-border-default)", margin: "32px 0" }} />

								{/* Deactivate */}
								<Box bg="bg.default" style={{ border: "1px solid var(--ax-colors-border-default)", borderRadius: 8, padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
									<Box>
										<Text style={{ fontWeight: 600, fontSize: 15, color: "var(--ax-colors-fg-default)", marginBottom: 2, display: "block" }}>
											Deactivate {name}
										</Text>
										<Text fontSize="sm" color="fg.secondary">
											This action is permanent. All context and history will be deleted.
										</Text>
									</Box>
									<Button
										appearance="primary"
										size="md"
										addonBefore={<IconTrashCan style={{ color: "#fff" }} />}
										style={{ background: "#A95A77", border: "none", color: "#fff", flexShrink: 0 }}
										onClick={() => setShowDeactivate(true)}
									>
										Deactivate
									</Button>
								</Box>
							</Box>
						</TabsContent>

						{/* ── Personality tab ── */}
						<TabsContent value="personality">
							<PersonalityTab
								name={name}
								cardImage={vau?.cardImage}
								previewOpen={previewOpen}
								setPreviewOpen={setPreviewOpen}
								onTemplateSelect={setSelectedPersonality}
							/>
						</TabsContent>
					</Tabs>
				</Box>
			</Box>

			{/* Preview panel — only on personality tab */}
			{previewOpen && activeTab === "personality" && (
				<Box
					bg="bg.default"
					style={{
						width: 320, flexShrink: 0,
						borderLeft: "1px solid var(--ax-colors-border-default)",
						display: "flex", flexDirection: "column", height: "100%",
					}}
				>
					<Box style={{ padding: "20px 20px 12px", borderBottom: "1px solid var(--ax-colors-border-secondary)", flexShrink: 0 }}>
						<Box style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
							<Text fontSize="md" style={{ fontWeight: 600, color: "var(--ax-colors-fg-default)" }}>Personality preview</Text>
							<button
								onClick={() => setPreviewOpen(false)}
								style={{ background: "none", border: "none", cursor: "pointer", padding: 2, color: "var(--ax-colors-fg-tertiary)", display: "flex" }}
							>
								<IconXmark size={16} />
							</button>
						</Box>
						<Text fontSize="sm" color="fg.tertiary" style={{ lineHeight: "1.4" }}>
							See how your teammate will engage with you, updates in real time
						</Text>
					</Box>

					<Box style={{ flex: 1, padding: "20px 16px", overflowY: "auto" }}>
						<Box style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
							<Box style={{ background: "var(--ax-colors-bg-secondary)", borderRadius: "12px 12px 4px 12px", padding: "8px 12px", maxWidth: "85%" }}>
								<Text fontSize="sm" color="fg.default">{previewPrompt}</Text>
							</Box>
						</Box>
						<Box style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
							<Box style={{ width: 28, height: 28, borderRadius: "50%", overflow: "hidden", flexShrink: 0, backgroundColor: selectedPersonality ? "transparent" : (displayAvatarBg ?? "var(--ax-colors-bg-secondary)"), display: "flex", alignItems: "center", justifyContent: "center" }}>
								{selectedPersonality ? (
									<img src={selectedPersonality.icon} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
								) : displayAvatarSrc ? (
									<Image src={displayAvatarSrc} alt={name} width={28} height={28} unoptimized style={{ width: "100%", height: "100%", objectFit: "cover" }} />
								) : null}
							</Box>
							<Box>
								<Box style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
									<Text fontSize="sm" style={{ fontWeight: 600, color: "var(--ax-colors-fg-default)" }}>
										{name}{selectedPersonality ? ` · ${selectedPersonality.name}` : ""}
									</Text>
									<Text fontSize="sm" color="fg.tertiary">9:39 AM</Text>
								</Box>
								<Box style={{ background: "var(--ax-colors-bg-success-subtle)", borderRadius: "4px 12px 12px 12px", padding: "10px 12px", maxWidth: 240 }}>
									<Text fontSize="sm" style={{ lineHeight: "1.5", color: "var(--ax-colors-fg-default)" }}>
										{PREVIEW_RESPONSES[previewPrompt]}
									</Text>
								</Box>
							</Box>
						</Box>
					</Box>

					<Box style={{ borderTop: "1px solid var(--ax-colors-border-secondary)", padding: "12px 16px 20px", flexShrink: 0 }}>
						<span style={{ ...CAPTION, color: "var(--ax-colors-fg-tertiary)", display: "block", marginBottom: 8 }}>PREVIEW PROMPTS</span>
						<Box style={{ display: "flex", flexDirection: "column", gap: 6 }}>
							{PREVIEW_PROMPTS.map((prompt) => (
								<button
									key={prompt}
									onClick={() => setPreviewPrompt(prompt)}
									style={{
										display: "flex", alignItems: "center", gap: 6,
										background: previewPrompt === prompt ? "var(--ax-colors-bg-secondary)" : "transparent",
										border: "1px solid var(--ax-colors-border-default)",
										borderRadius: 99, padding: "7px 14px",
										cursor: "pointer", fontSize: 13,
										color: "var(--ax-colors-fg-default)",
										fontFamily: "inherit", textAlign: "left",
									}}
								>
									<span style={{ color: "var(--ax-colors-fg-tertiary)", flexShrink: 0 }}>+</span>
									{prompt}
								</button>
							))}
						</Box>
					</Box>
				</Box>
			)}

			{/* Deactivate dialog */}
			<AlertDialog open={showDeactivate} onOpenChange={setShowDeactivate}>
				<AlertDialogContent size="sm" style={{ width: 520, borderRadius: 24 }}>
					<AlertDialogHeader>{"Are you sure you want to deactivate " + name + "?"}</AlertDialogHeader>
					<AlertDialogBody>
						<Text fontSize="md" color="fg.default" style={{ lineHeight: "1.6" }}>
							{"This can't be undone. Everything " + name + " has learned — context, memory, conversation history, and all personal instructions — will be permanently deleted. All workflows will stop immediately."}
						</Text>
					</AlertDialogBody>
					<AlertDialogFooter>
						<AlertDialogCancel appearance="subtle" size="md" onClick={() => setShowDeactivate(false)}>
							{"Keep " + name + " active"}
						</AlertDialogCancel>
						<AlertDialogAction
							appearance="primary"
							size="md"
							addonBefore={<IconUserSlash />}
							style={{ background: "#7C3B5A", border: "none", color: "white" }}
							onClick={() => setShowDeactivate(false)}
						>
							{"Deactivate " + name}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* Avatar picker dialog */}
			<AlertDialog open={showAvatarPicker} onOpenChange={setShowAvatarPicker}>
				<AlertDialogContent style={{ width: 560, maxWidth: "92vw", borderRadius: 20 }}>
					<AlertDialogHeader>Edit avatar</AlertDialogHeader>
					<AlertDialogBody>
						<Box style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
							{PICKER_AVATARS.map((avatar) => (
								<AvatarPickerCard
									key={avatar.src}
									avatar={avatar}
									isSelected={
										pickerSelected
											? pickerSelected.src === avatar.src
											: (currentAvatar?.src ?? displayAvatarSrc) === avatar.src
									}
									onClick={() => setPickerSelected(avatar)}
								/>
							))}
						</Box>
						<input
							ref={fileInputRef}
							type="file"
							accept="image/*"
							style={{ display: "none" }}
							onChange={(e) => {
								const file = e.target.files?.[0];
								if (file) {
									const url = URL.createObjectURL(file);
									setCurrentAvatar({ src: url, bg: "#F9FCF8" });
									setPickerSelected(null);
									setShowAvatarPicker(false);
								}
							}}
						/>
						<Box display="flex" justifyContent="center" mt="16">
							<Button size="md" icon={<IconUpload size={16} />} onClick={() => fileInputRef.current?.click()}>
								Upload your own
							</Button>
						</Box>
					</AlertDialogBody>
					<AlertDialogFooter>
						<AlertDialogCancel appearance="subtle" size="md" onClick={() => { setPickerSelected(null); setShowAvatarPicker(false); }}>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction
							appearance="primary"
							size="md"
							disabled={!pickerSelected && !currentAvatar}
							onClick={() => {
								if (pickerSelected) setCurrentAvatar(pickerSelected);
								setPickerSelected(null);
								setShowAvatarPicker(false);
							}}
						>
							Save
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</Box>
	);
}
