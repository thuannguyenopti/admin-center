"use client";

import { useEffect, useMemo, useState } from "react";
import { Box, Button, Spinner, Text } from "@optiaxiom/react";
import { IconCheck, IconChevronDown, IconCopy, IconX } from "@tabler/icons-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vs } from "react-syntax-highlighter/dist/esm/styles/prism";

type CodePanelProps = {
	isOpen: boolean;
	onClose: () => void;
	target: string | null;
};

type FileOption = {
	description?: string;
	id: string;
	label: string;
	path: string;
};

type SourceResponse = {
	availableFiles: FileOption[];
	content: string;
	endLine: number;
	filePath: string;
	isSnippet: boolean;
	language: string;
	panelDescription?: string | null;
	panelTitle?: string | null;
	selectedViewDescription?: string | null;
	selectedViewId: string;
	selectedViewLabel: string;
	startLine: number;
};

const codeTheme = {
	...vs,
	'pre[class*="language-"]': {
		...(vs['pre[class*="language-"]'] ?? {}),
		background: "#ffffff",
		color: "#213047",
		fontFamily:
			'"SFMono-Regular", SFMono-Regular, ui-monospace, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
		fontSize: "12.5px",
		lineHeight: 1.72,
		textShadow: "none",
	},
	'code[class*="language-"]': {
		...(vs['code[class*="language-"]'] ?? {}),
		background: "#ffffff",
		color: "#213047",
		fontFamily:
			'"SFMono-Regular", SFMono-Regular, ui-monospace, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
		fontSize: "12.5px",
		lineHeight: 1.72,
		textShadow: "none",
	},
};

export function CodePanel({ isOpen, onClose, target }: CodePanelProps) {
	const [code, setCode] = useState("");
	const [language, setLanguage] = useState("typescript");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [copied, setCopied] = useState(false);
	const [selectedViewId, setSelectedViewId] = useState<string | null>(null);
	const [selectedViewLabel, setSelectedViewLabel] = useState<string>("");
	const [selectedViewDescription, setSelectedViewDescription] = useState<string>("");
	const [resolvedFilePath, setResolvedFilePath] = useState<string>("");
	const [availableFiles, setAvailableFiles] = useState<FileOption[]>([]);
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const [panelTitle, setPanelTitle] = useState("Source Code");
	const [panelDescription, setPanelDescription] = useState("");
	const [startLine, setStartLine] = useState(1);
	const [endLine, setEndLine] = useState(1);
	const [isSnippet, setIsSnippet] = useState(false);

	const isRouteTarget = useMemo(() => Boolean(target?.startsWith("/")), [target]);
	const selectedOption = useMemo(
		() => availableFiles.find((file) => file.id === selectedViewId) ?? null,
		[availableFiles, selectedViewId]
	);
	const showQuickSwitch = useMemo(() => {
		if (!isRouteTarget) {
			return false;
		}

		const hasCuratedViews = availableFiles.some((file) => Boolean(file.description));
		return hasCuratedViews && availableFiles.length > 1 && availableFiles.length <= 4;
	}, [availableFiles, isRouteTarget]);

	useEffect(() => {
		setIsDropdownOpen(false);
	}, [target, isOpen]);

	useEffect(() => {
		if (!isOpen || !target) {
			return;
		}

		void fetchSourceCode(target);
	}, [isOpen, target]);

	const fetchSourceCode = async (
		nextTarget: string,
		options?: { filePathOverride?: string; viewId?: string }
	) => {
		setIsLoading(true);
		setError(null);

		try {
			const params = new URLSearchParams();
			if (nextTarget.startsWith("/")) {
				params.set("route", nextTarget);
				if (options?.viewId) {
					params.set("view", options.viewId);
				}
			} else {
				params.set("file", options?.filePathOverride ?? nextTarget);
			}

			const response = await fetch(`/api/source-code?${params.toString()}`);
			const data = (await response.json()) as Partial<SourceResponse> & {
				error?: string;
				message?: string;
			};

			if (!response.ok) {
				setError(data.message || data.error || "Failed to load source code");
				setCode("");
				return;
			}

			setCode(data.content ?? "");
			setLanguage(data.language ?? "typescript");
			setAvailableFiles(data.availableFiles ?? []);
			setResolvedFilePath(data.filePath ?? "");
			setSelectedViewId(data.selectedViewId ?? options?.viewId ?? data.filePath ?? null);
			setSelectedViewLabel(data.selectedViewLabel ?? data.filePath ?? "Source");
			setSelectedViewDescription(data.selectedViewDescription ?? "");
			setPanelTitle(data.panelTitle ?? "Source Code");
			setPanelDescription(data.panelDescription ?? "");
			setStartLine(data.startLine ?? 1);
			setEndLine(data.endLine ?? 1);
			setIsSnippet(Boolean(data.isSnippet));
		} catch {
			setError("Failed to fetch source code");
			setCode("");
		} finally {
			setIsLoading(false);
		}
	};

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(code);
			setCopied(true);
			window.setTimeout(() => setCopied(false), 1800);
		} catch (copyError) {
			console.error("Failed to copy code:", copyError);
		}
	};

	const handleOptionSelect = async (option: FileOption) => {
		if (!target) {
			return;
		}

		setIsDropdownOpen(false);
		if (isRouteTarget) {
			await fetchSourceCode(target, { viewId: option.id });
			return;
		}

		await fetchSourceCode(target, { filePathOverride: option.path });
	};

	if (!isOpen) {
		return null;
	}

	return (
		<>
			<Box
				style={{
					backgroundColor: "rgba(15, 23, 42, 0.20)",
					bottom: 0,
					left: 0,
					opacity: isOpen ? 1 : 0,
					position: "fixed",
					right: 0,
					top: 0,
					transition: "opacity 0.25s ease",
					zIndex: 999,
				}}
				onClick={onClose}
			/>

			<Box
				style={{
					background: "#ffffff",
					borderLeft: "1px solid rgba(148, 163, 184, 0.22)",
					bottom: 0,
					boxShadow: "-18px 0 56px rgba(15, 23, 42, 0.14)",
					display: "flex",
					flexDirection: "column",
					maxWidth: "92vw",
					position: "fixed",
					right: 0,
					top: 0,
					transform: isOpen ? "translateX(0)" : "translateX(100%)",
					transition: "transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)",
					width: "860px",
					zIndex: 1000,
				}}
			>
				<Box
					style={{
						background:
							"linear-gradient(180deg, rgba(248,250,252,0.95) 0%, rgba(255,255,255,1) 72%)",
						borderBottom: "1px solid rgba(226, 232, 240, 0.9)",
						padding: "22px 28px 18px",
					}}
				>
					<Box alignItems="start" display="flex" justifyContent="space-between" gap="20">
						<Box display="flex" flexDirection="column" gap="6" style={{ minWidth: 0 }}>
							<Text
								fontSize="xl"
								fontWeight="600"
								color="fg.default"
								style={{ color: "#23324a", letterSpacing: "-0.02em" }}
							>
								{panelTitle}
							</Text>
							{panelDescription ? (
								<Text fontSize="sm" color="fg.secondary" style={{ color: "#627189", maxWidth: 560 }}>
									{panelDescription}
								</Text>
							) : null}
						</Box>

						<Box display="flex" gap="8" alignItems="center">
							{code ? (
								<Button
									appearance="subtle"
									size="md"
									onClick={handleCopy}
									icon={copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
								>
									{copied ? "Copied" : "Copy"}
								</Button>
							) : null}
							<Button appearance="subtle" size="md" onClick={onClose} icon={<IconX size={20} />} aria-label="Close code panel" />
						</Box>
					</Box>

					<Box display="flex" flexDirection="column" gap="12" mt="16">
						<Box style={{ position: "relative" }}>
							<Box
								onClick={() => setIsDropdownOpen((current) => !current)}
								style={{
									alignItems: "center",
									background: "#f1f5f9",
									border: "1px solid #dbe4f0",
									borderRadius: 12,
									cursor: "pointer",
									display: "flex",
									gap: 12,
									justifyContent: "space-between",
									padding: "14px 16px",
								}}
							>
								<Box display="flex" flexDirection="column" style={{ gap: 3, minWidth: 0 }}>
									<Text fontSize="md" fontWeight="600" color="fg.default" style={{ color: "#23324a" }}>
										{selectedViewLabel || selectedOption?.label || resolvedFilePath || target}
									</Text>
									<Text
										fontSize="xs"
										fontFamily="mono"
										color="fg.secondary"
										style={{
											color: "#627189",
											overflow: "hidden",
											textOverflow: "ellipsis",
											whiteSpace: "nowrap",
										}}
									>
										{resolvedFilePath || selectedOption?.path || target}
									</Text>
								</Box>
								<IconChevronDown
									size={18}
									style={{
										color: "#627189",
										flexShrink: 0,
										transform: isDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
										transition: "transform 0.18s ease",
									}}
								/>
							</Box>

							{isDropdownOpen && availableFiles.length > 1 ? (
								<Box
									style={{
										background: "#ffffff",
										border: "1px solid #dbe4f0",
										borderRadius: 12,
										boxShadow: "0 18px 42px rgba(15, 23, 42, 0.10)",
										left: 0,
										marginTop: 8,
										maxHeight: 280,
										overflowY: "auto",
										position: "absolute",
										right: 0,
										zIndex: 10,
									}}
								>
									{availableFiles.map((file, index) => {
										const isActive = file.id === selectedViewId;
										return (
											<Box
												key={file.id}
												onClick={() => void handleOptionSelect(file)}
												style={{
													background: isActive ? "#eef4ff" : "#ffffff",
													borderBottom:
														index < availableFiles.length - 1
															? "1px solid rgba(226, 232, 240, 0.85)"
															: "none",
													cursor: "pointer",
													padding: "12px 14px",
												}}
											>
												<Text fontSize="sm" fontWeight="600" color="fg.default" style={{ color: "#23324a" }}>
													{file.label}
												</Text>
												<Text
													fontSize="xs"
													fontFamily="mono"
													color="fg.secondary"
													style={{ color: "#627189", marginTop: 2 }}
												>
													{file.path}
												</Text>
												{file.description ? (
													<Text fontSize="xs" color="fg.secondary" style={{ color: "#7a879c", marginTop: 6 }}>
														{file.description}
													</Text>
												) : null}
											</Box>
										);
									})}
								</Box>
							) : null}
						</Box>

						{showQuickSwitch ? (
							<Box display="flex" gap="8" flexWrap="wrap">
								{availableFiles.map((file) => {
									const isActive = file.id === selectedViewId;
									return (
										<button
											key={file.id}
											type="button"
											onClick={() => void handleOptionSelect(file)}
											style={{
												background: isActive ? "#233b74" : "#f8fafc",
												border: `1px solid ${isActive ? "#233b74" : "#dbe4f0"}`,
												borderRadius: 999,
												color: isActive ? "#ffffff" : "#46556d",
												cursor: "pointer",
												fontFamily: "inherit",
												fontSize: 12,
												fontWeight: 600,
												lineHeight: "16px",
												padding: "7px 12px",
											}}
										>
											{file.label}
										</button>
									);
								})}
							</Box>
						) : null}

						{selectedViewDescription ? (
							<Text fontSize="sm" color="fg.secondary" style={{ color: "#627189" }}>
								{selectedViewDescription}
							</Text>
						) : null}
					</Box>
				</Box>

				<Box flex="1" overflow="auto" style={{ background: "#ffffff", minHeight: 0 }}>
					{isLoading ? (
						<Box display="flex" alignItems="center" justifyContent="center" p="48" flexDirection="column" gap="16">
							<Spinner size="lg" />
							<Text color="fg.secondary">Loading source code...</Text>
						</Box>
					) : null}

					{error ? (
						<Box display="flex" flexDirection="column" gap="12" style={{ padding: 28 }}>
							<Text fontSize="lg" fontWeight="600" color="fg.error">
								Unable to load source code
							</Text>
							<Text color="fg.secondary">{error}</Text>
						</Box>
					) : null}

					{!isLoading && !error && code ? (
						<>
							<Box
								alignItems="center"
								display="flex"
								justifyContent="space-between"
								style={{
									background: "#fbfcfe",
									borderBottom: "1px solid rgba(226, 232, 240, 0.88)",
									gap: 12,
									padding: "12px 28px",
								}}
							>
								<Box display="flex" flexWrap="wrap" gap="10" alignItems="center">
									<Text
										fontSize="xs"
										fontWeight="600"
										style={{
											background: isSnippet ? "#e8f0ff" : "#eef2f7",
											borderRadius: 999,
											color: isSnippet ? "#274690" : "#55657d",
											padding: "4px 10px",
										}}
									>
										{isSnippet ? "Focused snippet" : "Full file"}
									</Text>
									<Text fontSize="xs" fontFamily="mono" color="fg.secondary" style={{ color: "#627189" }}>
										{resolvedFilePath}
									</Text>
								</Box>
								<Text fontSize="xs" fontFamily="mono" color="fg.secondary" style={{ color: "#627189", flexShrink: 0 }}>
									Lines {startLine}-{endLine}
								</Text>
							</Box>

							<Box style={{ overflowX: "auto" }}>
								<SyntaxHighlighter
									language={language}
									style={codeTheme}
									showLineNumbers
									startingLineNumber={startLine}
									wrapLines={false}
									customStyle={{
										background: "#ffffff",
										margin: 0,
										minWidth: "100%",
										padding: "24px 28px 36px",
									}}
									codeTagProps={{
										style: {
											fontFamily:
												'"SFMono-Regular", SFMono-Regular, ui-monospace, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
											fontSize: "12.5px",
										},
									}}
									lineNumberStyle={{
										color: "#9aa7bb",
										minWidth: "3.2em",
										paddingRight: "18px",
										textAlign: "right",
										userSelect: "none",
									}}
								>
									{code}
								</SyntaxHighlighter>
							</Box>
						</>
					) : null}
				</Box>
			</Box>
		</>
	);
}
