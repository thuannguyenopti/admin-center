"use client";

import {useState} from "react";
import {IconPlus, IconXmark} from "@optiaxiom/icons";
import {Box, Button, Input, Select, Text} from "@optiaxiom/react";
import type {BrandAsset, BrandDevice, BrandPack} from "../../types";
import {getLogoAssets} from "../../adapters";
import {EditorField, EditorFieldStack, EditorHeader, EditorPage, EditorPanel} from "./EditorPrimitives";
import styles from "./LogosTab.module.css";

type LogosTabProps = {
	onManageAssets: () => void;
	pack: BrandPack;
};

type VariantDraft = {
	name: string;
	usage_context: string;
	colour_versions: string[];
	assetId: string | null;
};

function monogram(name: string) {
	return name.trim().charAt(0).toUpperCase() || "•";
}

// ── Chip lists ────────────────────────────────────────────────────────────────

function InlineChipList({
	items,
	onAdd,
	onRemove,
	placeholder,
	prepend = false,
}: {
	items: string[];
	onAdd: (value: string) => void;
	onRemove: (index: number) => void;
	placeholder: string;
	prepend?: boolean;
}) {
	const [text, setText] = useState("");

	const submit = () => {
		const trimmed = text.trim();
		if (!trimmed) {
			return;
		}

		onAdd(trimmed);
		setText("");
	};

	return (
		<Box display="flex" flexDirection="column" gap="10">
			<Box className={styles.addRow}>
				<Input
					placeholder={placeholder}
					size="md"
					value={text}
					onChange={(event) => setText(event.target.value)}
					onKeyDown={(event) => {
						if (event.key === "Enter") {
							event.preventDefault();
							submit();
						}
					}}
				/>
				<Button appearance="default" icon={<IconPlus />} onClick={submit} size="md">
					Add
				</Button>
			</Box>

			{items.length === 0 ? (
				<Text color="fg.tertiary" style={{fontSize: 14}}>
					None added
				</Text>
			) : (
				<Box className={styles.zoneChips}>
					{items.map((item, index) => (
						<Box key={`${item}-${index}`} className={styles.zoneChip}>
							<Text style={{fontSize: 13, fontWeight: 600}}>{item}</Text>
							<button
								aria-label={`Remove ${item}`}
								className={styles.zoneChipDelete}
								type="button"
								onClick={() => onRemove(index)}
							>
								<IconXmark size={11} />
							</button>
						</Box>
					))}
				</Box>
			)}
		</Box>
	);
}

function DangerChipList({
	items,
	onAdd,
	onRemove,
	placeholder,
}: {
	items: string[];
	onAdd: (value: string) => void;
	onRemove: (index: number) => void;
	placeholder: string;
}) {
	const [text, setText] = useState("");

	const submit = () => {
		const trimmed = text.trim();
		if (!trimmed) {
			return;
		}

		onAdd(trimmed);
		setText("");
	};

	return (
		<Box display="flex" flexDirection="column" gap="10">
			<Box className={styles.addRow}>
				<Input
					placeholder={placeholder}
					size="md"
					value={text}
					onChange={(event) => setText(event.target.value)}
					onKeyDown={(event) => {
						if (event.key === "Enter") {
							event.preventDefault();
							submit();
						}
					}}
				/>
				<Button appearance="default" icon={<IconPlus />} onClick={submit} size="md">
					Add
				</Button>
			</Box>

			{items.length === 0 ? (
				<Text color="fg.tertiary" style={{fontSize: 14}}>
					None added
				</Text>
			) : (
				<Box display="flex" flexDirection="column" gap="8">
					{items.map((item, index) => (
						<Box key={`${item}-${index}`} className={styles.alterChip}>
							<Text style={{fontSize: 14, lineHeight: 1.45, minWidth: 0}}>{item}</Text>
							<button
								aria-label={`Remove "${item}"`}
								className={styles.alterChipDelete}
								type="button"
								onClick={() => onRemove(index)}
							>
								<IconXmark size={12} />
							</button>
						</Box>
					))}
				</Box>
			)}
		</Box>
	);
}

// ── Logo variants ───────────────────────────────────────────────────────────

function LogoVariantsSection({
	logos,
	variants,
	onAdd,
	onRemove,
	onManageAssets,
}: {
	logos: BrandAsset[];
	variants: VariantDraft[];
	onAdd: (variant: VariantDraft) => void;
	onRemove: (index: number) => void;
	onManageAssets: () => void;
}) {
	const [open, setOpen] = useState(false);
	const [assetId, setAssetId] = useState("");
	const [whenToUse, setWhenToUse] = useState("");

	const assetOptions = [
		{label: "Select from Assets…", value: ""},
		...logos.map((asset) => ({label: asset.name, value: asset.id})),
	];

	const reset = () => {
		setAssetId("");
		setWhenToUse("");
		setOpen(false);
	};

	const submit = () => {
		const asset = logos.find((item) => item.id === assetId);
		if (!asset) {
			return;
		}

		onAdd({
			assetId: asset.id,
			colour_versions: [],
			name: asset.name,
			usage_context: whenToUse.trim(),
		});
		reset();
	};

	const thumbFor = (variant: VariantDraft) => {
		const asset =
			(variant.assetId && logos.find((item) => item.id === variant.assetId)) ||
			logos.find((item) => item.name === variant.name);
		return asset ?? null;
	};

	return (
		<EditorPanel
			title="Logo variants"
			description="Which mark to use, where it belongs, and which colour versions are approved."
		>
			<Box display="flex" flexDirection="column" gap="12">
				{open ? (
					<Box className={styles.inlineForm}>
						<Box className={styles.variantFormGrid}>
							<Box display="flex" flexDirection="column" gap="6">
								<Text className={styles.formLabel}>Logo asset</Text>
								<Select
									options={assetOptions}
									value={assetId}
									onValueChange={(value) => setAssetId(value)}
								/>
							</Box>
							<Box display="flex" flexDirection="column" gap="6">
								<Text className={styles.formLabel}>When to use</Text>
								<Input
									placeholder="e.g. Primary mark for generated assets and email headers"
									size="md"
									value={whenToUse}
									onChange={(event) => setWhenToUse(event.target.value)}
								/>
							</Box>
						</Box>
						<Box alignItems="center" display="flex" gap="8" justifyContent="end">
							<Button appearance="subtle" onClick={reset} size="md">
								Cancel
							</Button>
							<Button
								appearance="default"
								disabled={!assetId}
								onClick={submit}
								size="md"
							>
								Add variant
							</Button>
						</Box>
					</Box>
				) : (
					<button
						className={styles.addTrigger}
						type="button"
						onClick={() => setOpen(true)}
					>
						<IconPlus size={14} />
						<span>Add variant</span>
					</button>
				)}

				{variants.length > 0 && (
					<Box className={styles.rowList}>
						{variants.map((variant, index) => {
							const asset = thumbFor(variant);
							const dark = /white|light/i.test(variant.name);
							return (
								<Box key={`${variant.name}-${index}`} className={styles.variantRow}>
									<Box
										className={
											dark
												? `${styles.variantThumb} ${styles.variantThumbDark}`
												: styles.variantThumb
										}
									>
										{asset ? (
											<img
												alt={variant.name}
												className={styles.variantThumbImage}
												src={asset.url}
											/>
										) : (
											<span className={styles.variantThumbMonogram}>
												{monogram(variant.name)}
											</span>
										)}
									</Box>
									<Box
										display="flex"
										flexDirection="column"
										gap="2"
										style={{minWidth: 0}}
									>
										<Text fontWeight="700" style={{fontSize: 15}}>
											{variant.name}
										</Text>
										<Text
											color="fg.secondary"
											style={{fontSize: 14, lineHeight: 1.45}}
										>
											{variant.usage_context || "Usage context not documented."}
										</Text>
									</Box>
									<button
										aria-label={`Remove ${variant.name}`}
										className={styles.rowDelete}
										type="button"
										onClick={() => onRemove(index)}
									>
										<IconXmark size={13} />
									</button>
								</Box>
							);
						})}
					</Box>
				)}

				<Button
					appearance="subtle"
					onClick={onManageAssets}
					size="sm"
					style={{alignSelf: "start"}}
				>
					Manage logo files in Assets →
				</Button>
			</Box>
		</EditorPanel>
	);
}

// ── Brand devices ─────────────────────────────────────────────────────────────

function BrandDevicesSection({
	devices,
	onAdd,
	onRemove,
}: {
	devices: BrandDevice[];
	onAdd: (device: BrandDevice) => void;
	onRemove: (index: number) => void;
}) {
	const [open, setOpen] = useState(false);
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [usageRules, setUsageRules] = useState("");
	const [neverUseAs, setNeverUseAs] = useState("");

	const reset = () => {
		setName("");
		setDescription("");
		setUsageRules("");
		setNeverUseAs("");
		setOpen(false);
	};

	const submit = () => {
		const trimmed = name.trim();
		if (!trimmed) {
			return;
		}

		onAdd({
			description: description.trim(),
			name: trimmed,
			usage_restriction: neverUseAs.trim() || null,
			usage_rules: usageRules.trim(),
		});
		reset();
	};

	return (
		<EditorPanel
			title="Brand devices"
			description="Distinctive graphic elements that support the logo but should not replace it."
		>
			<Box display="flex" flexDirection="column" gap="12">
				{open ? (
					<Box className={styles.inlineForm}>
						<Box className={styles.deviceFormGrid}>
							<Box display="flex" flexDirection="column" gap="6">
								<Text className={styles.formLabel}>Name</Text>
								<Input
									placeholder="e.g. Lime Velocity Bar"
									size="md"
									value={name}
									onChange={(event) => setName(event.target.value)}
								/>
							</Box>
							<Box display="flex" flexDirection="column" gap="6">
								<Text className={styles.formLabel}>Description</Text>
								<Input
									placeholder="Precise visual description — form, colour, behaviour"
									size="md"
									value={description}
									onChange={(event) => setDescription(event.target.value)}
								/>
							</Box>
							<Box display="flex" flexDirection="column" gap="6">
								<Text className={styles.formLabel}>Usage rules</Text>
								<Input
									placeholder="Where and how to use it"
									size="md"
									value={usageRules}
									onChange={(event) => setUsageRules(event.target.value)}
								/>
							</Box>
							<Box display="flex" flexDirection="column" gap="6">
								<Text className={styles.formLabel}>Never use as</Text>
								<Input
									placeholder="e.g. Decorative background pattern"
									size="md"
									value={neverUseAs}
									onChange={(event) => setNeverUseAs(event.target.value)}
								/>
							</Box>
						</Box>
						<Box alignItems="center" display="flex" gap="8" justifyContent="end">
							<Button appearance="subtle" onClick={reset} size="md">
								Cancel
							</Button>
							<Button
								appearance="default"
								disabled={!name.trim()}
								onClick={submit}
								size="md"
							>
								Add device
							</Button>
						</Box>
					</Box>
				) : (
					<button
						className={styles.addTrigger}
						type="button"
						onClick={() => setOpen(true)}
					>
						<IconPlus size={14} />
						<span>Add device</span>
					</button>
				)}

				{devices.length > 0 && (
					<Box className={styles.rowList}>
						{devices.map((device, index) => (
							<Box key={`${device.name}-${index}`} className={styles.deviceRow}>
								<Box
									display="flex"
									flexDirection="column"
									gap="4"
									style={{minWidth: 0}}
								>
									<Text fontWeight="700" style={{fontSize: 15}}>
										{device.name}
									</Text>
									<Text
										color="fg.secondary"
										style={{fontSize: 14, lineHeight: 1.45}}
									>
										{device.description}
									</Text>
								</Box>
								<Box
									display="flex"
									flexDirection="column"
									gap="8"
									style={{minWidth: 0}}
								>
									{device.usage_rules && (
										<Text style={{fontSize: 14, lineHeight: 1.45}}>
											{device.usage_rules}
										</Text>
									)}
									{device.usage_restriction && (
										<Box className={styles.deviceRestriction}>
											<Text style={{fontSize: 13, lineHeight: 1.4}}>
												Never use as: {device.usage_restriction}
											</Text>
										</Box>
									)}
								</Box>
								<button
									aria-label={`Remove ${device.name}`}
									className={styles.rowDelete}
									type="button"
									onClick={() => onRemove(index)}
								>
									<IconXmark size={13} />
								</button>
							</Box>
						))}
					</Box>
				)}
			</Box>
		</EditorPanel>
	);
}

// ── Tab ─────────────────────────────────────────────────────────────────────

export function LogosTab({onManageAssets, pack}: LogosTabProps) {
	const logos = getLogoAssets(pack);
	const logoSystem = pack.logo_system;

	const [clearSpace, setClearSpace] = useState(logoSystem?.clear_space_rule ?? "");
	const [minScreen, setMinScreen] = useState(logoSystem?.minimum_size_screen ?? "");
	const [minPrint, setMinPrint] = useState(logoSystem?.minimum_size_print ?? "");
	const [placementZones, setPlacementZones] = useState<string[]>(
		logoSystem?.placement_zones ?? []
	);
	const [doNotAlter, setDoNotAlter] = useState<string[]>(logoSystem?.do_not_alter_rules ?? []);
	const [variants, setVariants] = useState<VariantDraft[]>(() =>
		(logoSystem?.variants ?? []).map((variant) => ({
			assetId: null,
			colour_versions: variant.colour_versions,
			name: variant.name,
			usage_context: variant.usage_context,
		}))
	);
	const [devices, setDevices] = useState<BrandDevice[]>(pack.brand_devices ?? []);

	return (
		<EditorPage>
			<EditorHeader
				eyebrow="Logos & Devices"
				title="Logo placement settings"
				description="Configure how Opal should use approved logo assets during generation. This is a rule surface, not a logo gallery."
			/>

			<EditorPanel
				title="LLM placement rules"
				description="Operational rules used by generation, compositing, and brand checks."
			>
				<EditorFieldStack>
					<EditorField label="Clear space">
						<Input
							placeholder="e.g. Use at least the cap-height of the S on all sides."
							size="md"
							value={clearSpace}
							onChange={(event) => setClearSpace(event.target.value)}
						/>
					</EditorField>
					<EditorField label="Minimum screen">
						<Input
							placeholder="e.g. 96 px wide"
							size="md"
							value={minScreen}
							onChange={(event) => setMinScreen(event.target.value)}
						/>
					</EditorField>
					<EditorField label="Minimum print">
						<Input
							placeholder="e.g. 0.75 in wide"
							size="md"
							value={minPrint}
							onChange={(event) => setMinPrint(event.target.value)}
						/>
					</EditorField>
					<EditorField label="Placement zones">
						<InlineChipList
							items={placementZones}
							placeholder="Add placement zone"
							onAdd={(value) => setPlacementZones((current) => [...current, value])}
							onRemove={(index) =>
								setPlacementZones((current) =>
									current.filter((_, i) => i !== index)
								)
							}
						/>
					</EditorField>
				</EditorFieldStack>
			</EditorPanel>

			<EditorPanel
				title="Do not alter"
				description="Rules that must never be broken when handling the logo."
			>
				<DangerChipList
					items={doNotAlter}
					placeholder="Add a rule"
					onAdd={(value) => setDoNotAlter((current) => [value, ...current])}
					onRemove={(index) =>
						setDoNotAlter((current) => current.filter((_, i) => i !== index))
					}
				/>
			</EditorPanel>

			<LogoVariantsSection
				logos={logos}
				variants={variants}
				onAdd={(variant) => setVariants((current) => [...current, variant])}
				onManageAssets={onManageAssets}
				onRemove={(index) =>
					setVariants((current) => current.filter((_, i) => i !== index))
				}
			/>

			<BrandDevicesSection
				devices={devices}
				onAdd={(device) => setDevices((current) => [...current, device])}
				onRemove={(index) =>
					setDevices((current) => current.filter((_, i) => i !== index))
				}
			/>
		</EditorPage>
	);
}
