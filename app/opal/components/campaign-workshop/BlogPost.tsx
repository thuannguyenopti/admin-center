"use client";

import type { CSSProperties } from "react";
import { Box } from "@optiaxiom/react";
import { ChannelCard } from "./ChannelCard";
import { EditableText } from "./EditableText";
import { IMG, SLOT_META, resolveSlotImage, type ImageOverrides } from "./assets";

const styles: Record<string, CSSProperties> = {
	article: {
		background: "var(--ax-colors-bg-default)",
		margin: "0 auto",
		maxWidth: 1036,
		padding: "0 0 48px",
		position: "relative",
	},
	buildOverlay: {
		background: "rgba(255,255,255,0.94)",
		border: "1px solid var(--ax-colors-border-secondary)",
		borderRadius: 8,
		boxShadow: "0 12px 34px rgba(16, 24, 40, 0.14)",
		left: 18,
		padding: 12,
		position: "absolute",
		top: 18,
		width: 298,
		zIndex: 4,
	},
	buildOverlayTop: {
		alignItems: "center",
		color: "#1b241b",
		display: "flex",
		fontSize: 13,
		fontWeight: 800,
		gap: 8,
		lineHeight: "18px",
	},
	liveDot: {
		background: "#37a24a",
		borderRadius: 999,
		boxShadow: "0 0 0 4px rgba(55, 162, 74, 0.14)",
		height: 8,
		width: 8,
	},
	buildOverlayCopy: {
		color: "#5d6959",
		fontSize: 12,
		lineHeight: "18px",
		marginTop: 5,
	},
	buildOverlayTrack: {
		background: "#ecf2e8",
		borderRadius: 999,
		height: 6,
		marginTop: 10,
		overflow: "hidden",
	},
	buildOverlayFill: {
		background: "#37a24a",
		borderRadius: 999,
		display: "block",
		height: "100%",
	},
	kicker: {
		color: "#6B6B6B",
		fontSize: 12,
		fontWeight: 800,
		letterSpacing: "0.08em",
		lineHeight: "18px",
		margin: "0 0 10px",
		textTransform: "uppercase",
	},
	title: {
		color: "#1C1C1C",
		fontSize: 28,
		fontWeight: 700,
		letterSpacing: 0,
		lineHeight: "36px",
		margin: "0 0 16px",
	},
	text: {
		color: "#3A3A3A",
		fontSize: 15,
		lineHeight: "25px",
		margin: "0 0 14px",
		maxWidth: 780,
	},
	highlightedText: {
		background: "#fff7b8",
		borderRadius: 3,
		color: "#1C1C1C",
		fontSize: 15,
		lineHeight: "25px",
		margin: "0 0 14px",
		maxWidth: 780,
		padding: "2px 4px",
		position: "relative",
	},
	rationaleTip: {
		background: "#121512",
		borderRadius: 6,
		color: "#fff",
		display: "block",
		fontSize: 12,
		fontWeight: 600,
		left: 206,
		lineHeight: "18px",
		padding: "8px 10px",
		position: "absolute",
		top: -44,
		whiteSpace: "nowrap",
	},
	sectionHeading: {
		color: "#1C1C1C",
		fontSize: 20,
		fontWeight: 700,
		lineHeight: "28px",
		margin: "0 0 10px",
	},
	infoBox: {
		background: "#F2F8FC",
		border: "1px solid #cfe6fb",
		borderRadius: 8,
		display: "grid",
		gap: "12px 24px",
		gridTemplateColumns: "1fr 1fr",
		margin: "20px 0 24px",
		padding: "18px 20px",
	},
	infoLabel: {
		color: "#6B6B6B",
		fontSize: 11,
		fontWeight: 800,
		letterSpacing: "0.08em",
		textTransform: "uppercase",
	},
	infoValue: {
		color: "#1C1C1C",
		fontSize: 14,
		fontWeight: 700,
		marginTop: 2,
	},
	blockquote: {
		borderLeft: "3px solid #0980F6",
		color: "#1C1C1C",
		fontSize: 18,
		fontStyle: "italic",
		fontWeight: 600,
		lineHeight: "28px",
		margin: "24px 0",
		padding: "4px 0 4px 20px",
	},
	communityCaption: {
		color: "#6B6B6B",
		fontSize: 13,
		lineHeight: "20px",
		margin: 0,
	},
};

export function BlogPost({
	buildStep,
	imageOverrides,
	onEdit,
	onEditText,
	showRationale,
	textOverrides,
}: {
	buildStep: number;
	imageOverrides: ImageOverrides;
	onEdit: (slot: "blog-hero") => void;
	onEditText: (fieldId: string, value: string) => void;
	showRationale: boolean;
	textOverrides: Partial<Record<string, string>>;
}) {
	const showBuildOverlay = buildStep < 3;
	const meta = SLOT_META["blog-hero"];
	const text = (id: string, fallback: string) => textOverrides[id] ?? fallback;

	return (
		<article style={styles.article}>
			{showBuildOverlay && (
				<div style={styles.buildOverlay}>
					<div style={styles.buildOverlayTop}>
						<span style={styles.liveDot} />
						Frank is assembling this page
					</div>
					<div style={styles.buildOverlayCopy}>
						{buildStep === 1
							? "Selecting hero treatment and campaign structure."
							: "Drafting the opening copy and preparing channel variants."}
					</div>
					<div style={styles.buildOverlayTrack}>
						<span style={{ ...styles.buildOverlayFill, width: buildStep === 1 ? "42%" : "72%" }} />
					</div>
				</div>
			)}

			<Box style={{ marginBottom: 34, maxWidth: 780 }}>
				<ChannelCard
					altText={text("blog-hero-alt", meta.altText)}
					aspectRatio="16 / 7"
					createdLabel={meta.createdLabel}
					image={resolveSlotImage("blog-hero", imageOverrides)}
					imageAlt="Boston Marathon finish line for Stride's 2026 campaign"
					onAltTextChange={(next) => onEditText("blog-hero-alt", next)}
					onEdit={() => onEdit("blog-hero")}
					onTitleChange={(next) => onEditText("blog-hero-title", next)}
					title={text("blog-hero-title", meta.title)}
					variant="hero"
				/>
			</Box>

			<EditableText ariaLabel="kicker" value={text("blog-kicker", "Stride Event Guide • Boston Marathon 2026")} onChange={(v) => onEditText("blog-kicker", v)} style={styles.kicker} />
			<EditableText ariaLabel="headline" value={text("blog-headline", "Boston Starts Long Before the Starting Line")} onChange={(v) => onEditText("blog-headline", v)} style={styles.title} />
			<p style={styles.text}>
				On Monday, April 20, 2026, the Boston Marathon will turn the road from Hopkinton to Boylston Street into one of running&apos;s most electric stages. For Stride runners, Boston is more than race day. It is the months of quiet training, the weekday miles squeezed between meetings, and the moment a personal goal becomes something a whole city can cheer.
			</p>

			<div style={styles.infoBox}>
				<div>
					<div style={styles.infoLabel}>Date</div>
					<div style={styles.infoValue}>Monday, April 20, 2026</div>
				</div>
				<div>
					<div style={styles.infoLabel}>Start</div>
					<div style={styles.infoValue}>Hopkinton, MA · 9:02 AM</div>
				</div>
				<div>
					<div style={styles.infoLabel}>Finish</div>
					<div style={styles.infoValue}>Boylston Street, Boston</div>
				</div>
				<div>
					<div style={styles.infoLabel}>Distance</div>
					<div style={styles.infoValue}>26.2 miles · 42.195 km</div>
				</div>
			</div>

			<h2 style={styles.sectionHeading}>Why This Race Is Different</h2>
			<p style={showRationale ? styles.highlightedText : styles.text}>
				This campaign frames the marathon as a shared invitation: train with intention, show up with heart, and let every mile carry a purpose. The story gives Stride a useful editorial spine for event-week content, from runner preparation and gear guidance to community stories and post-race recovery.
				{showRationale && (
					<span style={styles.rationaleTip}>This anchors the campaign to Boston Marathon 2026 search intent.</span>
				)}
			</p>

			<blockquote style={styles.blockquote}>
				&quot;Boston doesn&apos;t reward talent. It rewards the person who kept showing up in February.&quot;
			</blockquote>

			<h2 style={styles.sectionHeading}>Your Race-Week Playbook</h2>
			<p style={styles.text}>
				The week before Boston is about arriving ready, not squeezing in last miles. Pack your singlet the night before, confirm your bib pickup window, and plan your Hopkinton transport early — the athlete village fills fast. Stride&apos;s race-week checklist covers everything from carb timing to post-race recovery kit so your focus stays where it belongs: the road.
			</p>
			<p style={styles.text}>
				Social posts pull the most visual moments from training arc — early alarms, long runs, the first glimpse of the finish line. Email gives subscribers a direct path into training plans, event reminders, and Stride&apos;s race-week collection. Every channel reinforces the same runner-first story.
			</p>

			<h2 style={styles.sectionHeading}>After the Finish Line</h2>
			<Box display="flex" gap="16" alignItems="center" style={{ margin: "4px 0 18px" }}>
				<img
					alt="Runners and neighbors along the Boston Marathon course near mile 17"
					src={IMG.communityCircle}
					style={{ borderRadius: "50%", flexShrink: 0, height: 104, objectFit: "cover", width: 104 }}
				/>
				<p style={styles.communityCaption}>
					Every mile has a crowd behind it — neighbors, aid-station volunteers, and the runners who circle back for their pace group.
				</p>
			</Box>
			<p style={styles.text}>
				Boston rewards preparation. Stride&apos;s role is to make that preparation feel visible, supported, and worth celebrating — whether someone is chasing a qualifying time, cheering from the course, or using marathon Monday as the spark for their own first mile. The campaign carries through to post-race recovery content so the relationship doesn&apos;t end at Boylston.
			</p>
		</article>
	);
}
