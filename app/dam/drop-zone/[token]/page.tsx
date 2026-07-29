"use client";

import { Badge, Box, Field, Input, Textarea } from "@optiaxiom/react";
import { Button } from "@/app/components/Button";
import { Text } from "@/app/components/Text";
import { IconCheck, IconFile, IconLock, IconUpload, IconXmark } from "@optimizely/axiom-icons";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import StrideHeader from "@/app/site/StrideHeader";
import { useDropZoneUpload } from "@/app/shared/hooks/useDropZoneUpload";
import { SUBMISSION_STATUS_BADGE } from "@/app/cmp/library/components/assets-review/DropZoneSubmissionCard";
import { getDropZoneByToken, subscribeDropZones } from "../dropZones";
import { addSubmission, getSubmissionsForZone, subscribeSubmissions } from "../submissions";

const VISITOR_ID_KEY = "dropZoneVisitorId";
const UNLOCKED_ZONES_KEY = "dropZoneUnlocked";

/** Identifies "your" submissions on this unauthenticated public page — a
 * random ID generated once per browser and persisted, not real auth. */
function getOrCreateVisitorId(): string {
	if (typeof window === "undefined") return "server";
	try {
		const existing = localStorage.getItem(VISITOR_ID_KEY);
		if (existing) return existing;
		const generated = crypto.randomUUID();
		localStorage.setItem(VISITOR_ID_KEY, generated);
		return generated;
	} catch {
		return "anonymous";
	}
}

/** Password gate is per-browser, not a real session — once unlocked, a return
 * visit (e.g. clicking back in from a status-update email) skips straight to
 * the content instead of asking again every time. */
function isZoneUnlocked(zoneId: string): boolean {
	if (typeof window === "undefined") return false;
	try {
		const unlocked: string[] = JSON.parse(localStorage.getItem(UNLOCKED_ZONES_KEY) ?? "[]");
		return unlocked.includes(zoneId);
	} catch {
		return false;
	}
}

function markZoneUnlocked(zoneId: string) {
	try {
		const unlocked: string[] = JSON.parse(localStorage.getItem(UNLOCKED_ZONES_KEY) ?? "[]");
		if (!unlocked.includes(zoneId)) localStorage.setItem(UNLOCKED_ZONES_KEY, JSON.stringify([...unlocked, zoneId]));
	} catch {
		// Best-effort — worst case the gate reappears next visit.
	}
}

const PAGE_BG = "#F2F8FC";

function ExternalShell({ children }: { children: React.ReactNode }) {
	return (
		<div className="min-h-screen font-stride-sans flex flex-col" style={{ background: PAGE_BG }}>
			<StrideHeader />
			<div className="flex-1 flex items-center justify-center px-6 py-16">{children}</div>
		</div>
	);
}

function formatFileSize(bytes: number) {
	const mb = bytes / (1024 * 1024);
	return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export default function DropZoneLandingPage() {
	const params = useParams();
	const token = params.token as string;
	const link = useSyncExternalStore(subscribeDropZones, () => getDropZoneByToken(token), () => getDropZoneByToken(token));

	const upload = useDropZoneUpload();
	const uploadBoxRef = useRef<HTMLDivElement | null>(null);
	const [submitted, setSubmitted] = useState(false);
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [notes, setNotes] = useState("");
	const [visitorId] = useState(getOrCreateVisitorId);
	const [unlocked, setUnlocked] = useState(false);
	const [passwordGuess, setPasswordGuess] = useState("");
	const [gateError, setGateError] = useState(false);
	const allSubmissionsForZone = useSyncExternalStore(
		subscribeSubmissions,
		() => getSubmissionsForZone(link?.id ?? ""),
		() => getSubmissionsForZone(link?.id ?? ""),
	);
	const mySubmissions = allSubmissionsForZone.filter((submission) => submission.visitorId === visitorId);

	useEffect(() => {
		if (link && isZoneUnlocked(link.id)) setUnlocked(true);
	}, [link]);

	function attemptUnlock() {
		if (!link) return;
		if (passwordGuess === link.password) {
			markZoneUnlocked(link.id);
			setUnlocked(true);
			setGateError(false);
		} else {
			setGateError(true);
		}
	}

	if (!link || link.status === "expired") {
		return (
			<ExternalShell>
				<div className="text-center" style={{ maxWidth: 420 }}>
					<h1 className="text-stride-dark font-stride-bold" style={{ fontSize: 24, marginBottom: 8 }}>
						{link ? "This link has expired" : "Link not found"}
					</h1>
					<p className="text-stride-dark/60 text-stride-lg">
						{link
							? "Please contact the campaign owner for a new submission link."
							: "Check the URL and try again."}
					</p>
				</div>
			</ExternalShell>
		);
	}

	if (!unlocked) {
		return (
			<ExternalShell>
				<Box display="flex" flexDirection="column" alignItems="center" gap="20" style={{ maxWidth: 380, textAlign: "center", width: "100%" }}>
					<Box alignItems="center" bg="bg.secondary" display="flex" justifyContent="center" rounded="full" style={{ width: 56, height: 56 }}>
						<IconLock size={22} style={{ color: "var(--ax-colors-fg-tertiary)" }} />
					</Box>
					<Box display="flex" flexDirection="column" gap="6">
						<span
							className="text-stride-dark/50"
							style={{ fontFamily: "'Roboto Mono', monospace", fontSize: 12, letterSpacing: "0.03em", lineHeight: 1.25, textTransform: "uppercase" }}
						>
							{link.campaign}
						</span>
						<h1 className="text-stride-dark font-stride-bold" style={{ fontSize: 24, margin: 0 }}>{link.name}</h1>
						<p className="text-stride-dark/60 text-stride-lg" style={{ margin: 0 }}>
							This Drop Zone is password protected. Enter the password shared with you to continue.
						</p>
					</Box>
					<Box display="flex" flexDirection="column" gap="12" style={{ textAlign: "left", width: "100%" }}>
						<Field error={gateError ? "That password doesn't match — check with whoever shared this link." : undefined}>
							<Input
								autoFocus
								placeholder="Enter password"
								size="lg"
								type="password"
								value={passwordGuess}
								onChange={(e) => { setPasswordGuess(e.target.value); if (gateError) setGateError(false); }}
								onKeyDown={(e) => { if (e.key === "Enter") attemptUnlock(); }}
							/>
						</Field>
						<Button appearance="primary" disabled={!passwordGuess.trim()} onClick={attemptUnlock} size="lg" style={{ width: "100%" }}>
							Unlock
						</Button>
					</Box>
				</Box>
			</ExternalShell>
		);
	}

	if (submitted) {
		return (
			<ExternalShell>
				<Box display="flex" flexDirection="column" alignItems="center" gap="16" style={{ textAlign: "center", maxWidth: 440 }}>
					<Box alignItems="center" bg="bg.success.subtle" display="flex" justifyContent="center" rounded="full" style={{ width: 72, height: 72 }}>
						<IconCheck size={32} style={{ color: "var(--ax-colors-fg-success-strong)" }} />
					</Box>
					<Box display="flex" flexDirection="column" gap="8">
						<h1 className="text-stride-dark font-stride-bold" style={{ fontSize: 26, margin: 0 }}>Thanks — your files are in</h1>
						<p className="text-stride-dark/60 text-stride-lg" style={{ margin: 0 }}>
							The Stride team reviews every submission before it&apos;s added to the library. You&apos;ll hear
							back if anything needs a follow-up.
						</p>
					</Box>
					<Box bg="bg.default" border="1" borderColor="border.tertiary" display="flex" flexDirection="column" gap="6" p="16" rounded="lg" style={{ textAlign: "left", width: "100%" }}>
						<Text color="fg.tertiary" fontSize="sm" fontWeight="500">Submitted to {link.name}</Text>
						{upload.files.map((file, i) => (
							<Text key={`${file.name}-${i}`} color="fg.default" fontSize="sm">{file.name}</Text>
						))}
					</Box>
				</Box>
			</ExternalShell>
		);
	}

	const canSubmit = upload.files.length > 0 && name.trim() && email.trim();

	function handleSubmit() {
		addSubmission({
			dropZoneId: link!.id,
			submitterName: name.trim(),
			submitterEmail: email.trim(),
			files: upload.files.map((file) => ({ name: file.name, sizeMb: file.size / (1024 * 1024) })),
			notes: notes.trim(),
			visitorId,
		});
		setSubmitted(true);
	}

	function handleReupload() {
		upload.reset();
		uploadBoxRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
		upload.triggerFileInput();
	}

	return (
		<ExternalShell>
			<div style={{ maxWidth: 560, width: "100%" }}>
				<Box display="flex" flexDirection="column" gap="10" style={{ marginBottom: 36 }}>
					<span
						className="text-stride-dark/50"
						style={{
							fontFamily: "'Roboto Mono', monospace",
							fontSize: 12,
							letterSpacing: "0.03em",
							lineHeight: 1.25,
							textTransform: "uppercase",
						}}
					>
						{link.campaign}
					</span>
					<h1 className="text-stride-dark font-stride-bold" style={{ fontSize: 30, margin: 0, lineHeight: 1.15 }}>
						{link.name}
					</h1>
					<p className="text-stride-dark/60 text-stride-lg" style={{ margin: 0, maxWidth: 480 }}>
						{link.brief}
					</p>
				</Box>

				{/* Your submissions — visible on a return visit to this same link, so a
				    rejected upload's reviewer comment shows up back where it was submitted. */}
				{mySubmissions.length > 0 && (
					<Box display="flex" flexDirection="column" gap="8" style={{ marginBottom: 28 }}>
						<Text color="fg.tertiary" fontSize="sm" fontWeight="600">Your submissions</Text>
						{mySubmissions.map((submission) => {
							const badge = SUBMISSION_STATUS_BADGE[submission.status];
							return (
								<Box key={submission.id} bg="bg.default" border="1" borderColor="border.tertiary" display="flex" flexDirection="column" gap="8" p="16" rounded="lg">
									<Box display="flex" alignItems="center" justifyContent="space-between" gap="8">
										<Text color="fg.default" fontSize="sm" fontWeight="600" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
											{submission.files.map((file) => file.name).join(", ")}
										</Text>
										<Badge intent={badge.intent}>{badge.label}</Badge>
									</Box>
									<Text color="fg.tertiary" fontSize="sm">Submitted {submission.submittedAt}</Text>
									{submission.status === "rejected" && (
										<>
											{submission.reviewerComment && (
												<Text color="fg.default" fontSize="sm" style={{ background: "var(--ax-colors-bg-error-subtle)", borderRadius: 6, padding: "8px 10px" }}>
													&ldquo;{submission.reviewerComment}&rdquo;
												</Text>
											)}
											<Button appearance="subtle" size="sm" onClick={handleReupload} style={{ alignSelf: "flex-start" }}>
												Re-upload
											</Button>
										</>
									)}
								</Box>
							);
						})}
					</Box>
				)}

				{/* Upload surface */}
				<Box
					ref={uploadBoxRef}
					onDragOver={upload.handleDragOver}
					onDragLeave={upload.handleDragLeave}
					onDrop={upload.handleDrop}
					onClick={upload.triggerFileInput}
					display="flex"
					flexDirection="column"
					alignItems="center"
					justifyContent="center"
					gap="12"
					style={{
						border: `1.5px dashed ${upload.isDragging ? "var(--ax-colors-border-accent)" : "var(--ax-colors-border-default)"}`,
						borderRadius: 16,
						background: upload.isDragging ? "var(--ax-colors-bg-accent-subtle)" : "white",
						padding: "56px 24px",
						cursor: "pointer",
						transition: "background 0.15s, border-color 0.15s",
					}}
				>
					<input
						ref={upload.fileInputRef}
						type="file"
						multiple
						hidden
						onChange={upload.handleFileSelect}
						accept={link.allowedFileTypes.map((t) => `.${t.toLowerCase()}`).join(",")}
					/>
					<Box
						alignItems="center"
						bg={upload.isDragging ? "bg.accent.subtle" : "bg.secondary"}
						display="flex"
						justifyContent="center"
						rounded="full"
						style={{ width: 56, height: 56, transition: "background 0.15s" }}
					>
						<IconUpload size={22} style={{ color: upload.isDragging ? "var(--ax-colors-fg-accent-strong)" : "var(--ax-colors-fg-tertiary)" }} />
					</Box>
					<Box display="flex" flexDirection="column" gap="2" style={{ textAlign: "center" }}>
						<Text color="fg.default" fontWeight="600" fontSize="md">Drop files here or click to browse</Text>
						<Text color="fg.tertiary" fontSize="sm">
							{link.allowedFileTypes.join(", ")} · up to {link.maxFileSizeMb}MB each
						</Text>
					</Box>
				</Box>

				{upload.files.length > 0 && (
					<Box display="flex" flexDirection="column" gap="8" style={{ marginTop: 16 }}>
						{upload.files.map((file, i) => (
							<Box
								key={`${file.name}-${i}`}
								bg="bg.default"
								border="1"
								borderColor="border.tertiary"
								display="flex"
								alignItems="center"
								gap="8"
								px="12"
								py="10"
								rounded="md"
							>
								<IconFile size={14} style={{ color: "var(--ax-colors-fg-tertiary)", flexShrink: 0 }} />
								<Text
									color="fg.default"
									fontSize="sm"
									style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
								>
									{file.name}
								</Text>
								<Text color="fg.tertiary" fontSize="sm" style={{ flexShrink: 0 }}>{formatFileSize(file.size)}</Text>
								<Button
									appearance="subtle"
									size="sm"
									aria-label={`Remove ${file.name}`}
									icon={<IconXmark size={12} />}
									onClick={() => upload.removeFile(i)}
								/>
							</Box>
						))}
					</Box>
				)}

				{/* Submission form */}
				<Box display="flex" flexDirection="column" gap="16" style={{ marginTop: 28 }}>
					<Box display="flex" gap="16">
						<Box style={{ flex: 1 }}>
							<Field label="Your name" required>
								<Input size="lg" value={name} onChange={(e) => setName(e.target.value)} />
							</Field>
						</Box>
						<Box style={{ flex: 1 }}>
							<Field label="Email" required>
								<Input size="lg" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
							</Field>
						</Box>
					</Box>
					{link.requiredFields.map((field) => (
						<Field key={field} label={field} required>
							<Input size="lg" />
						</Field>
					))}
					<Field label="Notes for the reviewer" info="Optional context — what should the brand team know about these files?">
						<Textarea resize="vertical" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
					</Field>
				</Box>

				<Button
					appearance="primary"
					size="lg"
					disabled={!canSubmit}
					onClick={handleSubmit}
					style={{ marginTop: 24, width: "100%" }}
				>
					Submit files
				</Button>
			</div>
		</ExternalShell>
	);
}
