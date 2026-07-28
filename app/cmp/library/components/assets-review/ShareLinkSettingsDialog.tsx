"use client";

import { useState } from "react";
import { Box, Checkbox, Dialog, DialogContent, DialogFooter, DialogHeader, Field, Input, Switch, toaster } from "@optiaxiom/react";
import { Button } from "@/app/components/Button";
import { Text } from "@/app/components/Text";
import { IconChevronDown, IconChevronRight, IconCopy } from "@optimizely/axiom-icons";
import type { DropZoneLink } from "@/app/dam/drop-zone/data";

/**
 * Share Link Settings — matches the Collections reference structurally: a top Switch for
 * the link itself, then an "Additional settings" disclosure whose rows are Checkboxes (not
 * switches). Password and Expiration map directly. Collections' "Fields"/"Renditions" are
 * about which *existing asset* data a *view* link exposes — a Drop Zone link is an *upload*
 * portal with no asset to expose, so those become Required fields and Allowed file types
 * (real fields on DropZoneLink) — kept as the same real, per-item checkbox-list interaction
 * Renditions uses, not a plain read-only line.
 */
export function ShareLinkSettingsDialog({ zone, open, onClose }: { zone: DropZoneLink; open: boolean; onClose: () => void }) {
	const [sharable, setSharable] = useState(zone.status === "active");
	const [expanded, setExpanded] = useState(false);
	const [password, setPassword] = useState("");
	const [passwordTouched, setPasswordTouched] = useState(false);
	const [expirationEnabled, setExpirationEnabled] = useState(true);
	const [validFrom, setValidFrom] = useState(zone.createdAt);
	const [validUntil, setValidUntil] = useState(zone.expiresAt);
	const [fieldsEnabled, setFieldsEnabled] = useState(true);
	const [enabledFields, setEnabledFields] = useState<Set<string>>(() => new Set(zone.requiredFields));
	const [filesEnabled, setFilesEnabled] = useState(true);
	const [enabledFileTypes, setEnabledFileTypes] = useState<Set<string>>(() => new Set(zone.allowedFileTypes));

	const url = typeof window !== "undefined" ? `${window.location.origin}/dam/drop-zone/${zone.token}` : `/dam/drop-zone/${zone.token}`;

	function toggleField(field: string) {
		setEnabledFields((current) => {
			const next = new Set(current);
			if (next.has(field)) next.delete(field);
			else next.add(field);
			return next;
		});
	}

	function toggleFileType(type: string) {
		setEnabledFileTypes((current) => {
			const next = new Set(current);
			if (next.has(type)) next.delete(type);
			else next.add(type);
			return next;
		});
	}

	function copyLink() {
		navigator.clipboard?.writeText(url);
		toaster.create("Link copied to clipboard", { intent: "success" });
	}

	function confirm() {
		if (sharable && !password.trim()) {
			setPasswordTouched(true);
			setExpanded(true);
			toaster.create("Set a password before sharing this link", { intent: "danger" });
			return;
		}
		toaster.create("Share settings saved", { intent: "success" });
		onClose();
	}

	return (
		<Dialog open={open} onOpenChange={(next) => { if (!next) onClose(); }}>
			<DialogContent size="md" style={{ maxWidth: 560, width: "min(560px, calc(100vw - 48px))" }}>
				<DialogHeader>
					<Text fontSize="lg" fontWeight="600">Share Link Settings</Text>
				</DialogHeader>

				<Box display="flex" flexDirection="column" gap="20" p="20">
					<Box alignItems="center" display="flex" gap="10">
						<Switch checked={sharable} onCheckedChange={setSharable} />
						<Text color="fg.default" fontSize="md" fontWeight="500">Turn on sharable link</Text>
					</Box>

					{sharable && (
						<>
							<Box alignItems="center" display="flex" gap="8">
								<Box style={{ flex: 1 }}>
									<Input readOnly size="lg" value={url} />
								</Box>
								<Button appearance="default" icon={<IconCopy size={14} />} iconPosition="start" size="lg" onClick={copyLink}>
									Copy Link
								</Button>
							</Box>

							<Box display="flex" flexDirection="column" gap="16">
								<Box
									alignItems="center"
									display="flex"
									gap="6"
									role="button"
									tabIndex={0}
									style={{ cursor: "pointer" }}
									onClick={() => setExpanded((v) => !v)}
									onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setExpanded((v) => !v); } }}
								>
									{expanded ? <IconChevronDown size={14} /> : <IconChevronRight size={14} />}
									<Text color="fg.default" fontSize="md" fontWeight="500">Additional settings</Text>
								</Box>

								{expanded && (
									<Box display="flex" flexDirection="column" gap="20" style={{ paddingLeft: 20 }}>
										<Box display="flex" flexDirection="column" gap="8">
											<Text color="fg.default" fontSize="sm" fontWeight="500">Password</Text>
											<Field
												description="Required on every share link — reviewers must enter it before they can open this Drop Zone."
												error={passwordTouched && !password.trim() ? "Enter a password to protect this link" : undefined}
											>
												<Input
													placeholder="Set a password"
													size="lg"
													type="password"
													value={password}
													onBlur={() => setPasswordTouched(true)}
													onChange={(e) => setPassword(e.target.value)}
												/>
											</Field>
										</Box>

										<Box display="flex" flexDirection="column" gap="8">
											<Box alignItems="center" display="flex" gap="8">
												<Checkbox checked={expirationEnabled} onCheckedChange={(checked) => setExpirationEnabled(Boolean(checked))} />
												<Text color="fg.default" fontSize="sm" fontWeight="500">Expiration</Text>
											</Box>
											{expirationEnabled && (
												<Box display="flex" gap="16">
													<Box style={{ flex: 1 }}>
														<Field label="Valid from">
															<Input size="lg" type="date" value={validFrom} onChange={(e) => setValidFrom(e.target.value)} />
														</Field>
													</Box>
													<Box style={{ flex: 1 }}>
														<Field label="Valid until">
															<Input size="lg" type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
														</Field>
													</Box>
												</Box>
											)}
										</Box>

										<Box display="flex" flexDirection="column" gap="8">
											<Box alignItems="center" display="flex" gap="8">
												<Checkbox checked={fieldsEnabled} onCheckedChange={(checked) => setFieldsEnabled(Boolean(checked))} />
												<Text color="fg.default" fontSize="sm" fontWeight="500">Required fields</Text>
											</Box>
											{fieldsEnabled && (
												<Box bg="bg.page" border="1" borderColor="border.tertiary" display="flex" flexDirection="column" rounded="md">
													{zone.requiredFields.map((field, i) => (
														<Box key={field} alignItems="center" borderT={i > 0 ? "1" : undefined} borderColor="border.tertiary" display="flex" gap="8" px="12" py="8">
															<Checkbox checked={enabledFields.has(field)} onCheckedChange={() => toggleField(field)} />
															<Text color="fg.default" fontSize="sm">{field}</Text>
														</Box>
													))}
												</Box>
											)}
										</Box>

										<Box display="flex" flexDirection="column" gap="8">
											<Box alignItems="center" display="flex" gap="8">
												<Checkbox checked={filesEnabled} onCheckedChange={(checked) => setFilesEnabled(Boolean(checked))} />
												<Text color="fg.default" fontSize="sm" fontWeight="500">Allowed file types</Text>
											</Box>
											{filesEnabled && (
												<Box bg="bg.page" border="1" borderColor="border.tertiary" display="flex" flexDirection="column" rounded="md">
													{zone.allowedFileTypes.map((type, i) => (
														<Box key={type} alignItems="center" borderT={i > 0 ? "1" : undefined} borderColor="border.tertiary" display="flex" gap="8" justifyContent="space-between" px="12" py="8">
															<Box alignItems="center" display="flex" gap="8">
																<Checkbox checked={enabledFileTypes.has(type)} onCheckedChange={() => toggleFileType(type)} />
																<Text color="fg.default" fontSize="sm">{type}</Text>
															</Box>
															<Text color="fg.tertiary" fontSize="sm">up to {zone.maxFileSizeMb}MB</Text>
														</Box>
													))}
												</Box>
											)}
										</Box>
									</Box>
								)}
							</Box>
						</>
					)}
				</Box>

				<DialogFooter alignItems="center" display="flex" justifyContent="flex-end" style={{ gap: 8 }}>
					<Button appearance="subtle" size="lg" onClick={onClose}>Cancel</Button>
					<Button appearance="primary" size="lg" onClick={confirm}>Confirm</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
