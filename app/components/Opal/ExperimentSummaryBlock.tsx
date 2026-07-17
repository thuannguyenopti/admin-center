"use client";

import { useState } from "react";
import { Box, Text as AxiomText } from "@optiaxiom/react";
import { IconCircleQuestion } from "@optimizely/axiom-icons";
import { IconChevronDown, IconChevronRight } from "@tabler/icons-react";
import { Table, Tr, Th, Td } from "../Table";
import { Button } from "../Button";
import type {
	ExperimentResultOutcome,
	ExperimentSummaryPayload,
} from "@/app/web-experimentation/optimizations/[id]/results/types";

type AppendixSectionKey = "primary" | "secondary" | "segment" | "cross";

type ExperimentSummaryBlockProps = {
	payload: ExperimentSummaryPayload;
	onSuggestionClick?: (suggestion: string) => void;
};

const sectionRule = {
	borderBottom: "1px solid var(--opal-border-secondary)",
} as const;

const positiveGreen = "var(--ax-colors-fg-success, #2E7D32)";
const negativeRed = "var(--ax-colors-fg-error, #D92D20)";

function conversionMetricColor(
	outcomeType: ExperimentResultOutcome | undefined,
	cardLabel: string,
	value: string,
	subtext?: string,
): string {
	if (cardLabel !== "CONVERSION") {
		return "var(--ax-colors-fg-default)";
	}
	if (outcomeType === "Inconclusive" || outcomeType === "Mixed" || outcomeType === undefined) {
		return "var(--ax-colors-fg-default)";
	}
	const v = value.trim();
	const looksPositive = /^\+[\d.]+\s*%/.test(v) || (subtext ?? "").toLowerCase().includes("lift");
	const looksNegative = /^-[\d.]+\s*%/.test(v);
	if (outcomeType === "Positive") {
		return looksPositive ? positiveGreen : "var(--ax-colors-fg-default)";
	}
	if (outcomeType === "Negative") {
		return looksNegative ? negativeRed : "var(--ax-colors-fg-default)";
	}
	return "var(--ax-colors-fg-default)";
}

/** Metric card item for outcome-specific layout (label + value + subtext). */
function MetricCardItem({
	label,
	value,
	subtext,
	showInfo,
	outcomeType,
}: {
	label: string;
	value: string;
	subtext?: string;
	showInfo?: boolean;
	outcomeType?: ExperimentResultOutcome;
}) {
	const valueColor = conversionMetricColor(outcomeType, label, value, subtext);
	return (
		<Box
			p="12"
			style={{
				flex: "1 1 0",
				minWidth: "0",
				backgroundColor: "var(--opal-bg-primary)",
				borderRadius: "8px",
				border: "1px solid var(--opal-border-secondary)",
			}}
		>
			<Box display="flex" flexDirection="row" alignItems="center" gap="4">
				<AxiomText fontSize="xs" color="fg.tertiary" style={{ margin: 0, textTransform: "uppercase" }}>
					{label}
				</AxiomText>
				{showInfo && (
					<Box
						style={{ display: "flex", flexShrink: 0 }}
						aria-label="Metric definition"
						title="Model-based estimate; methodology may vary by account."
					>
						<IconCircleQuestion size={14} color="var(--ax-colors-fg-tertiary)" />
					</Box>
				)}
			</Box>
			<AxiomText fontSize="md" fontWeight="700" style={{ margin: "4px 0 0 0", color: valueColor }}>
				{value}
			</AxiomText>
			{subtext && (
				<AxiomText fontSize="xs" color="fg.tertiary" style={{ margin: "2px 0 0 0" }}>
					{subtext}
				</AxiomText>
			)}
		</Box>
	);
}

/** Render metric value; CONVERSION color depends on outcome type. */
function MetricValue({
	value,
	subtext,
	cardLabel,
	outcomeType,
}: {
	value: string;
	subtext?: string;
	cardLabel?: string;
	outcomeType?: ExperimentResultOutcome;
}) {
	const valueColor = conversionMetricColor(outcomeType, cardLabel ?? "", value, subtext);
	return (
		<>
			<AxiomText fontSize="md" fontWeight="700" style={{ margin: "4px 0 0 0", color: valueColor }}>
				{value}
			</AxiomText>
			{subtext && (
				<AxiomText fontSize="xs" color="fg.tertiary" style={{ margin: "2px 0 0 0" }}>
					{subtext}
				</AxiomText>
			)}
		</>
	);
}

export function ExperimentSummaryBlock({
	payload,
}: ExperimentSummaryBlockProps) {
	const {
		title,
		meta,
		outcome,
		conversion,
		variance,
		timeToRerun,
		metricCards,
		keyLearning,
		faq,
		notableDivergences,
		nextStepItems,
		primaryMetricRows,
		secondaryMetricRows,
		segmentRows,
		crossExperimentRows,
		updatedAt,
		outcomeType,
	} = payload;

	const [appendixExpanded, setAppendixExpanded] = useState<Record<AppendixSectionKey, boolean>>({
		primary: false,
		secondary: false,
		segment: false,
		cross: false,
	});
	const toggleAppendix = (key: AppendixSectionKey) => {
		setAppendixExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
	};

	const [faqExpanded, setFaqExpanded] = useState<Record<number, boolean>>({});
	const toggleFaq = (index: number) => {
		setFaqExpanded((prev) => ({ ...prev, [index]: !prev[index] }));
	};

	return (
		<Box display="flex" flexDirection="column" gap="0" w="full">
			{/* Title, meta, and metric cards — no dividers between these and Key Learning */}
			<Box pb="16">
				<Box>
					<AxiomText fontSize="lg" fontWeight="700" color="fg.default" style={{ margin: 0 }}>
						{title}
					</AxiomText>
					{meta.length > 0 && (
						<AxiomText fontSize="sm" color="fg.secondary" style={{ margin: "6px 0 0 0" }}>
							{meta.join(" • ")}
						</AxiomText>
					)}
				</Box>

				{/* Metric cards: outcome-specific (Positive/Negative/Inconclusive) or default four */}
				<Box display="flex" flexDirection="row" flexWrap="wrap" gap="12" pt="16">
					{metricCards && metricCards.length > 0
						? metricCards.map((card) => (
							<MetricCardItem
								key={card.label}
								label={card.label}
								value={card.value}
								subtext={card.subtext}
								showInfo={card.showInfo}
								outcomeType={outcomeType}
							/>
						))
						: [
							{ label: "OUTCOME", ...outcome },
							{ label: "CONVERSION", ...conversion },
							{ label: "SIGNIFICANCE", ...variance },
							{ label: "TIME TO RE-RUN", ...timeToRerun },
						].map((card) => (
							<Box
								key={card.label}
								p="12"
								style={{
									flex: "1 1 0",
									minWidth: "0",
									backgroundColor: "var(--opal-bg-primary)",
									borderRadius: "8px",
									border: "1px solid var(--opal-border-secondary)",
								}}
							>
								<AxiomText fontSize="xs" color="fg.tertiary" style={{ margin: 0, textTransform: "uppercase" }}>
									{card.label}
								</AxiomText>
								<MetricValue
									value={card.value}
									subtext={card.subtext}
									cardLabel={card.label}
									outcomeType={outcomeType}
								/>
							</Box>
						))}
				</Box>
			</Box>

			{/* Key Learning */}
			<Box py="16" style={sectionRule}>
				<AxiomText fontSize="md" fontWeight="700" color="fg.default" style={{ margin: 0 }}>
					Key Learning
				</AxiomText>
				<AxiomText fontSize="sm" color="fg.secondary" style={{ margin: "10px 0 0 0", lineHeight: 1.55 }}>
					{keyLearning}
				</AxiomText>
			</Box>

			{/* Notable Divergences */}
			{notableDivergences.length > 0 && (
				<Box py="16" style={sectionRule}>
					<AxiomText fontSize="md" fontWeight="700" color="fg.default" style={{ margin: 0 }}>
						Notable Divergences
					</AxiomText>
					<ul style={{ margin: "10px 0 0 0", paddingLeft: "20px", listStyle: "disc" }}>
						{notableDivergences.map((item, i) => (
							<li key={i} style={{ marginBottom: 10 }}>
								<AxiomText fontSize="sm" fontWeight="600" color="fg.default" style={{ margin: 0 }}>
									{item.title}
								</AxiomText>
								<AxiomText fontSize="sm" color="fg.secondary" style={{ margin: "4px 0 0 0", display: "block", lineHeight: 1.55 }}>
									{item.text}
								</AxiomText>
							</li>
						))}
					</ul>
				</Box>
			)}

			{/* Next Steps */}
			{nextStepItems.length > 0 && (
				<Box py="16" style={sectionRule}>
					<AxiomText fontSize="md" fontWeight="700" color="fg.default" style={{ margin: 0 }}>
						Next Steps
					</AxiomText>
					<ul style={{ margin: "10px 0 0 0", paddingLeft: "20px", listStyle: "disc" }}>
						{nextStepItems.map((item, i) => (
							<li key={i} style={{ marginBottom: 10 }}>
								<AxiomText fontSize="sm" fontWeight="600" color="fg.default" style={{ margin: 0 }}>
									{item.title}
								</AxiomText>
								<AxiomText fontSize="sm" color="fg.secondary" style={{ margin: "4px 0 0 0", display: "block", lineHeight: 1.55 }}>
									{item.body}
								</AxiomText>
							</li>
						))}
					</ul>
				</Box>
			)}

			{/* FAQ — same disclose pattern as Appendix */}
			<Box py="16" style={sectionRule}>
				<AxiomText fontSize="md" fontWeight="700" color="fg.default" style={{ margin: 0 }}>
					FAQ
				</AxiomText>
				<Box display="flex" flexDirection="column" gap="16" style={{ marginTop: 10 }}>
					{faq.map((item, i) => (
						<Box key={i}>
							<Box
								display="flex"
								alignItems="center"
								gap="6"
								style={{
									cursor: "pointer",
									marginBottom: faqExpanded[i] ? 8 : 0,
								}}
								onClick={() => toggleFaq(i)}
								role="button"
								tabIndex={0}
								aria-expanded={Boolean(faqExpanded[i])}
								onKeyDown={(e) => {
									if (e.key === "Enter" || e.key === " ") {
										e.preventDefault();
										toggleFaq(i);
									}
								}}
							>
								{faqExpanded[i] ? (
									<IconChevronDown size={16} color="var(--ax-colors-fg-secondary)" />
								) : (
									<IconChevronRight size={16} color="var(--ax-colors-fg-secondary)" />
								)}
								<AxiomText fontSize="sm" color="fg.secondary" style={{ margin: 0 }}>
									{item.question}
								</AxiomText>
							</Box>
							{faqExpanded[i] && (
								<Box style={{ marginLeft: 22 }}>
									<AxiomText fontSize="sm" color="fg.secondary" style={{ margin: 0, lineHeight: 1.55 }}>
										{item.answer}
									</AxiomText>
								</Box>
							)}
						</Box>
					))}
				</Box>
			</Box>

			{/* Appendix */}
			<Box py="16" display="flex" flexDirection="column" gap="16">
				<AxiomText fontSize="md" fontWeight="700" color="fg.default" style={{ margin: 0 }}>
					Appendix
				</AxiomText>

				{primaryMetricRows.length > 0 && (
					<Box>
						<Box
							display="flex"
							alignItems="center"
							gap="6"
							style={{ cursor: "pointer", marginBottom: appendixExpanded.primary ? 8 : 0 }}
							onClick={() => toggleAppendix("primary")}
							role="button"
							tabIndex={0}
							onKeyDown={(e) => e.key === "Enter" && toggleAppendix("primary")}
						>
							{appendixExpanded.primary ? (
								<IconChevronDown size={16} color="var(--ax-colors-fg-secondary)" />
							) : (
								<IconChevronRight size={16} color="var(--ax-colors-fg-secondary)" />
							)}
							<AxiomText fontSize="sm" color="fg.secondary">
								Primary Metric Analysis
							</AxiomText>
						</Box>
						{appendixExpanded.primary && (
							<Box style={{ marginLeft: 22 }}>
								<Table className="experiment-summary-table">
									<thead>
										<Tr>
											<Th>Metric</Th>
											<Th>Variation</Th>
											<Th>Change vs. Control</Th>
											<Th>Significance</Th>
										</Tr>
									</thead>
									<tbody>
										{primaryMetricRows.map((row, i) => (
											<Tr key={i}>
												<Td>{row.metric}</Td>
												<Td>{row.variation}</Td>
												<Td>{row.changeVsControl}</Td>
												<Td>{row.significance}</Td>
											</Tr>
										))}
									</tbody>
								</Table>
							</Box>
						)}
					</Box>
				)}

				{secondaryMetricRows.length > 0 && (
					<Box>
						<Box
							display="flex"
							alignItems="center"
							gap="6"
							style={{ cursor: "pointer", marginBottom: appendixExpanded.secondary ? 8 : 0 }}
							onClick={() => toggleAppendix("secondary")}
							role="button"
							tabIndex={0}
							onKeyDown={(e) => e.key === "Enter" && toggleAppendix("secondary")}
						>
							{appendixExpanded.secondary ? (
								<IconChevronDown size={16} color="var(--ax-colors-fg-secondary)" />
							) : (
								<IconChevronRight size={16} color="var(--ax-colors-fg-secondary)" />
							)}
							<AxiomText fontSize="sm" color="fg.secondary">
								Secondary Metric Analysis
							</AxiomText>
						</Box>
						{appendixExpanded.secondary && (
							<Box style={{ marginLeft: 22 }}>
								<Table className="experiment-summary-table">
									<thead>
										<Tr>
											<Th>Metric</Th>
											<Th>Variation</Th>
											<Th>Change vs. Control</Th>
											<Th>Significance</Th>
										</Tr>
									</thead>
									<tbody>
										{secondaryMetricRows.map((row, i) => (
											<Tr key={i}>
												<Td>{row.metric}</Td>
												<Td>{row.variation}</Td>
												<Td>{row.changeVsControl}</Td>
												<Td>{row.significance}</Td>
											</Tr>
										))}
									</tbody>
								</Table>
							</Box>
						)}
					</Box>
				)}

				{segmentRows.length > 0 && (
					<Box>
						<Box
							display="flex"
							alignItems="center"
							gap="6"
							style={{ cursor: "pointer", marginBottom: appendixExpanded.segment ? 8 : 0 }}
							onClick={() => toggleAppendix("segment")}
							role="button"
							tabIndex={0}
							onKeyDown={(e) => e.key === "Enter" && toggleAppendix("segment")}
						>
							{appendixExpanded.segment ? (
								<IconChevronDown size={16} color="var(--ax-colors-fg-secondary)" />
							) : (
								<IconChevronRight size={16} color="var(--ax-colors-fg-secondary)" />
							)}
							<AxiomText fontSize="sm" color="fg.secondary">
								Segment Analysis
							</AxiomText>
						</Box>
						{appendixExpanded.segment && (
							<Box style={{ marginLeft: 22 }}>
								<Table className="experiment-summary-table">
									<thead>
										<Tr>
											<Th>Segment</Th>
											<Th>Change vs. Control</Th>
											<Th>Significance</Th>
											<Th>Interpretation</Th>
										</Tr>
									</thead>
									<tbody>
										{segmentRows.map((row, i) => (
											<Tr key={i}>
												<Td>{row.segment}</Td>
												<Td>{row.changeVsControl}</Td>
												<Td>{row.significance}</Td>
												<Td>{row.interpretation}</Td>
											</Tr>
										))}
									</tbody>
								</Table>
							</Box>
						)}
					</Box>
				)}

				{crossExperimentRows.length > 0 && (
					<Box>
						<Box
							display="flex"
							alignItems="center"
							gap="6"
							style={{ cursor: "pointer", marginBottom: appendixExpanded.cross ? 8 : 0 }}
							onClick={() => toggleAppendix("cross")}
							role="button"
							tabIndex={0}
							onKeyDown={(e) => e.key === "Enter" && toggleAppendix("cross")}
						>
							{appendixExpanded.cross ? (
								<IconChevronDown size={16} color="var(--ax-colors-fg-secondary)" />
							) : (
								<IconChevronRight size={16} color="var(--ax-colors-fg-secondary)" />
							)}
							<AxiomText fontSize="sm" color="fg.secondary">
								Cross-Experiment Comparison
							</AxiomText>
						</Box>
						{appendixExpanded.cross && (
							<Box style={{ marginLeft: 22 }}>
								<Table className="experiment-summary-table">
									<thead>
										<Tr>
											<Th>Experiment Name</Th>
											<Th>Start Date</Th>
											<Th>Primary Metric</Th>
											<Th>Outcome</Th>
										</Tr>
									</thead>
									<tbody>
										{crossExperimentRows.map((row, i) => (
											<Tr key={i}>
												<Td>{row.experimentName}</Td>
												<Td>{row.startDate}</Td>
												<Td>{row.primaryMetric}</Td>
												<Td>{row.outcome}</Td>
											</Tr>
										))}
									</tbody>
								</Table>
							</Box>
						)}
					</Box>
				)}
			</Box>

			{/* Footer: updated date, Share, Download */}
			<Box display="flex" flexDirection="row" alignItems="center" justifyContent="space-between" pt="16">
				{updatedAt && (
					<AxiomText fontSize="xs" color="fg.tertiary" style={{ margin: 0 }}>
						{updatedAt}
					</AxiomText>
				)}
				<Box display="flex" flexDirection="row" gap="8" alignItems="center" style={{ marginLeft: "auto" }}>
					<Button appearance="subtle" size="md" onClick={() => { }} style={{ borderRadius: "6px" }}>
						Share
					</Button>
					<Button appearance="primary" size="md" onClick={() => { }} style={{ borderRadius: "6px" }}>
						Download
					</Button>
				</Box>
			</Box>
		</Box>
	);
}
