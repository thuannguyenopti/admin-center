"use client";

import { Box } from "@optiaxiom/react";
import { ChannelCard } from "./ChannelCard";
import { EditableText } from "./EditableText";
import { SLOT_META, resolveSlotImage, type ImageOverrides } from "./assets";

const RACE_DETAILS = [
	["📅", "Date", "Mon April 20, 2026"],
	["📍", "Start", "Hopkinton, MA"],
	["🏁", "Finish", "Boylston Street"],
	["⏰", "First wave", "9:02 AM EST"],
] as const;

const FEATURES = [
	["Race-week checklist", "Everything from bib pickup to carb timing"],
	["Gear guide", "Stride picks for Boston weather & pace zones"],
	["Recovery kit", "What to do the moment you cross Boylston"],
] as const;

export function EmailPreview({
	buildStep,
	imageOverrides,
	onEdit,
	onEditText,
	showRationale,
	textOverrides,
}: {
	buildStep: number;
	imageOverrides: ImageOverrides;
	onEdit: (slot: "email-hero") => void;
	onEditText: (fieldId: string, value: string) => void;
	showRationale: boolean;
	textOverrides: Partial<Record<string, string>>;
}) {
	const showBuildOverlay = buildStep < 3;
	const meta = SLOT_META["email-hero"];
	const text = (id: string, fallback: string) => textOverrides[id] ?? fallback;

	return (
		<article style={{ background: "var(--ax-colors-bg-default)", boxShadow: "0 0 0 1px rgba(28, 28, 28, 0.08)", margin: "0 auto", maxWidth: 680, padding: 24, position: "relative" }}>
			{showBuildOverlay && (
				<div style={{ background: "rgba(255,255,255,0.94)", border: "1px solid #dce6d7", borderRadius: 8, boxShadow: "0 12px 34px rgba(16, 24, 40, 0.14)", left: 18, padding: 12, position: "absolute", top: 18, width: 298, zIndex: 4 }}>
					<div style={{ alignItems: "center", color: "#1b241b", display: "flex", fontSize: 13, fontWeight: 800, gap: 8, lineHeight: "18px" }}>
						<span style={{ background: "#37a24a", borderRadius: 999, boxShadow: "0 0 0 4px rgba(55, 162, 74, 0.14)", height: 8, width: 8 }} />
						Frank is assembling this email
					</div>
					<div style={{ color: "#5d6959", fontSize: 12, lineHeight: "18px", marginTop: 5 }}>
						{buildStep === 1 ? "Matching the blog hero and campaign structure." : "Drafting subject line and channel-matched copy."}
					</div>
				</div>
			)}

			<Box display="flex" gap="4" style={{ alignItems: "baseline", color: "#6B6B6B", fontSize: 13, fontWeight: 650, marginBottom: 16 }}>
				<span>Subject:</span>
				<EditableText ariaLabel="subject line" value={text("email-subject", "Your Boston Marathon week starts with Stride")} onChange={(v) => onEditText("email-subject", v)} style={{ color: "#6B6B6B", fontSize: 13, fontWeight: 650 }} />
			</Box>

			<Box style={{ marginBottom: 20 }}>
				<ChannelCard
					altText={text("email-hero-alt", meta.altText)}
					aspectRatio="16 / 9"
					createdLabel={meta.createdLabel}
					image={resolveSlotImage("email-hero", imageOverrides)}
					imageAlt="Sunrise training run for Stride's Boston Marathon 2026 campaign"
					onAltTextChange={(next) => onEditText("email-hero-alt", next)}
					onEdit={() => onEdit("email-hero")}
					onTitleChange={(next) => onEditText("email-hero-title", next)}
					title={text("email-hero-title", meta.title)}
					variant="hero"
				/>
			</Box>

			{/* Header bar — simulated rendered-email markup: a real email cannot contain an Axiom component here.
			    Colors below come from the real Stride Design System (Figma gyL2kb297EyROFe0q3X04i):
			    primary blue #0980F6, dark #1C1C1C, light tint #F2F8FC. */}
			<div style={{ alignItems: "center", background: "#1C1C1C", display: "flex", justifyContent: "space-between", padding: "16px 24px" }}>
				<span style={{ color: "#fff", fontSize: 17, fontWeight: 800, letterSpacing: "0.07em" }}>STRIDE</span>
				<span style={{ color: "#8FC4FB", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>Boston Marathon 2026</span>
			</div>

			<div style={{ background: "#F2F8FC", padding: "28px 32px 0" }}>
				<div style={{ marginBottom: 18, textAlign: "center" }}>
					<span style={{ background: "#0980F6", borderRadius: 4, color: "#fff", fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", padding: "5px 14px", textTransform: "uppercase" }}>
						Monday · April 20, 2026 · Boston, MA
					</span>
				</div>

				<Box style={{ margin: "0 0 14px", textAlign: "center" }}>
					<EditableText
						ariaLabel="email headline"
						value={text("email-headline", "Make marathon Monday your momentum moment.")}
						onChange={(v) => onEditText("email-headline", v)}
						style={{ color: "#1C1C1C", fontSize: 28, fontWeight: 800, lineHeight: "36px" }}
					/>
				</Box>
				<p style={{ color: "#3A3A3A", fontSize: 15, lineHeight: "24px", margin: "0 0 24px", textAlign: "center" }}>
					Race week is the moment every training run was building toward.
					<br />
					Stride has everything you need to arrive ready and leave proud.
				</p>

				<div style={{ marginBottom: 32, textAlign: "center" }}>
					<button type="button" style={{ background: "#0980F6", border: 0, borderRadius: 6, color: "#fff", cursor: "pointer", fontSize: 15, fontWeight: 800, height: 50, letterSpacing: "0.04em", padding: "0 36px", textTransform: "uppercase" }}>
						Get Your Race-Week Guide →
					</button>
				</div>

				<div style={{ background: "#fff", border: "1px solid #cfe6fb", borderRadius: 8, marginBottom: 28, padding: "20px 24px" }}>
					<div style={{ color: "#1C1C1C", fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", marginBottom: 14, textTransform: "uppercase" }}>Race Day Details</div>
					<div style={{ display: "grid", gap: "12px 0", gridTemplateColumns: "1fr 1fr" }}>
						{RACE_DETAILS.map(([icon, label, value]) => (
							<div key={label} style={{ alignItems: "flex-start", display: "flex", gap: 8 }}>
								<span style={{ fontSize: 16, lineHeight: "20px" }}>{icon}</span>
								<div>
									<div style={{ color: "#6B6B6B", fontSize: 11, fontWeight: 700, lineHeight: "16px" }}>{label}</div>
									<div style={{ color: "#1C1C1C", fontSize: 13, fontWeight: 700, lineHeight: "18px" }}>{value}</div>
								</div>
							</div>
						))}
					</div>
				</div>

				<p style={{ color: "#3A3A3A", fontSize: 14, lineHeight: "22px", margin: "0 0 20px" }}>
					Whether you are racing, cheering, or letting marathon Monday fuel your own goals — Stride has the race-week guidance, gear, and training support to keep every mile moving with purpose.
				</p>

				<div style={showRationale ? { background: "#fff7b8", borderRadius: 3, marginBottom: 20, padding: "14px 16px" } : { marginBottom: 20 }}>
					<div style={{ color: "#1C1C1C", fontSize: 13, fontWeight: 800, letterSpacing: "0.04em", marginBottom: 8, textTransform: "uppercase" }}>What to Expect Race Week</div>
					<p style={{ color: "#3A3A3A", fontSize: 14, lineHeight: "22px", margin: "0 0 8px" }}>
						Course support runs the full 26.2 miles: medical tents every mile after mile 5, aid stations with water and Gatorade at every mile marker, and a dedicated family meet-up area near the finish on Boylston.
					</p>
					<p style={{ color: "#3A3A3A", fontSize: 14, lineHeight: "22px", margin: 0 }}>
						Spectating? The best free viewing is Wellesley&apos;s Scream Tunnel (mile 13) and Heartbreak Hill (mile 20) — both reachable by the MBTA Green Line without a car.
					</p>
					{showRationale && (
						<div style={{ color: "#6B6B6B", fontSize: 12, fontStyle: "italic", marginTop: 8 }}>
							Added to give the email the same race-week depth as the blog post instead of stopping at the CTA.
						</div>
					)}
				</div>

				<div style={{ borderTop: "1px solid #cfe6fb", display: "grid", gap: 1, gridTemplateColumns: "1fr 1fr 1fr", marginBottom: 28 }}>
					{FEATURES.map(([title, desc]) => (
						<div key={title} style={{ borderTop: "1px solid #cfe6fb", padding: "16px 14px", textAlign: "center" }}>
							<div style={{ color: "#1C1C1C", fontSize: 13, fontWeight: 800, lineHeight: "18px", marginBottom: 4 }}>{title}</div>
							<div style={{ color: "#6B6B6B", fontSize: 12, lineHeight: "17px" }}>{desc}</div>
						</div>
					))}
				</div>

				<div style={{ marginBottom: 32, textAlign: "center" }}>
					<button type="button" style={{ background: "#fff", border: "2px solid #1C1C1C", borderRadius: 6, color: "#1C1C1C", cursor: "pointer", fontSize: 14, fontWeight: 800, height: 44, letterSpacing: "0.04em", padding: "0 28px", textTransform: "uppercase" }}>
						Shop Race-Week Gear →
					</button>
				</div>
			</div>

			<div style={{ background: "#1C1C1C", padding: "20px 24px", textAlign: "center" }}>
				<p style={{ color: "#9CA3AF", fontSize: 12, margin: "0 0 6px" }}>Stride · 1 Boylston Street, Boston MA 02101</p>
				<p style={{ color: "#9CA3AF", fontSize: 12, margin: 0 }}>
					<button type="button" style={{ background: "none", border: 0, color: "#8FC4FB", cursor: "pointer", fontSize: 12, padding: 0, textDecoration: "underline" }}>Unsubscribe</button>
					{" · "}
					<button type="button" style={{ background: "none", border: 0, color: "#8FC4FB", cursor: "pointer", fontSize: 12, padding: 0, textDecoration: "underline" }}>View in browser</button>
				</p>
			</div>
		</article>
	);
}
