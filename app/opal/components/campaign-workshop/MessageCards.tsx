"use client";

import { Box, Button } from "@optiaxiom/react";
import { IconArrowRight, IconCheck, IconEnvelope, IconFileLines, IconGlobe, IconImage, IconSparkles } from "@optiaxiom/icons";
import { Text } from "@/app/components/Text";

// IM-thread action cards rendered inline via OpalChatView's `messageCards` prop
// (keyed by each scripted message's `cardAfterKey`), split out of page.tsx so
// the page file stays focused on scene/state orchestration.

export function CampaignBriefOptions({ onNo, onYes }: { onNo: () => void; onYes: () => void }) {
	return (
		<Box display="flex" gap="8" pt="8" flexWrap="wrap">
			<Button appearance="primary" size="sm" onClick={onYes}>
				Yes, open the brief
			</Button>
			<Button appearance="subtle" size="sm" onClick={onNo} style={{ border: "1px solid var(--ax-colors-border-secondary)" }}>
				No, something else
			</Button>
		</Box>
	);
}

export function BuildPlanCard({ activeStep, onContinue }: { activeStep: number; onContinue: () => void }) {
	const steps = [
		["Brief drafted", "Audience: runners · Angle: motivation", IconFileLines],
		["Assets created", "Blog, social, and email suite ready", IconImage],
		["Design review", "Hero, copy, and suite sign-off", IconGlobe],
		["Notify approver", "Pei Chen — Campaign Manager", IconEnvelope],
	] as const;

	return (
		<Box bg="bg.default" border="1" borderColor="border.tertiary" rounded="md" shadow="sm" display="flex" flexDirection="column" gap="12" mt="8" p="16">
			<Box display="flex" alignItems="center" gap="10">
				<Box bg="bg.page" rounded="md" display="flex" alignItems="center" justifyContent="center" style={{ height: 30, width: 30 }} color="fg.success">
					<IconSparkles size={15} />
				</Box>
				<Box>
					<Text fontSize="sm" fontWeight="700">
						Campaign suite ready for review
					</Text>
					<Text fontSize="xs" color="fg.tertiary">
						Frank has completed all assets
					</Text>
				</Box>
			</Box>
			<Box display="flex" flexDirection="column" gap="8">
				{steps.map(([title, detail, StepIcon], index) => {
					const complete = index < 2 || activeStep > index;
					return (
						<Box key={title} display="flex" alignItems="start" gap="8">
							<Box bg={complete ? "bg.success" : "bg.page"} color={complete ? "fg.default.inverse" : "fg.secondary"} rounded="full" display="flex" alignItems="center" justifyContent="center" style={{ height: 20, marginTop: 1, width: 20 }}>
								{complete ? <IconCheck size={12} /> : <StepIcon size={13} />}
							</Box>
							<Box>
								<Text fontSize="sm" fontWeight="700">
									{title}
								</Text>
								<Text fontSize="xs" color="fg.tertiary">
									{detail}
								</Text>
							</Box>
						</Box>
					);
				})}
			</Box>
			<Box bg="bg.page" border="1" borderColor="border.tertiary" rounded="md" display="flex" alignItems="center" gap="10" p="8">
				<Box rounded="sm" style={{ background: "linear-gradient(135deg, #94bbe8 0%, #f3d18b 100%)", height: 48, width: 72 }} />
				<Box display="flex" flexDirection="column" gap="6" style={{ flex: 1 }}>
					<Box bg="bg.tertiary" rounded="full" style={{ height: 7, width: "78%" }} />
					<Box bg="bg.tertiary" rounded="full" style={{ height: 7, width: "92%" }} />
					<Box bg="bg.tertiary" rounded="full" style={{ height: 7, width: "66%" }} />
				</Box>
			</Box>
			{activeStep < 3 && (
				<Button appearance="primary" size="sm" icon={<IconArrowRight size={14} />} iconPosition="end" style={{ alignSelf: "flex-start" }} onClick={onContinue}>
					Review hero direction
				</Button>
			)}
		</Box>
	);
}

export function CopyDraftCard({ onApprove }: { onApprove: () => void }) {
	return (
		<Box bg="bg.default" border="1" borderColor="border.tertiary" rounded="md" shadow="sm" display="flex" flexDirection="column" gap="12" mt="8" p="16">
			<Box display="flex" alignItems="center" gap="10">
				<Box bg="bg.page" rounded="md" display="flex" alignItems="center" justifyContent="center" style={{ height: 30, width: 30 }} color="fg.success">
					<IconFileLines size={15} />
				</Box>
				<Box>
					<Text fontSize="sm" fontWeight="700">
						Opening draft
					</Text>
					<Text fontSize="xs" color="fg.tertiary">
						Frank wants a human check before scaling it
					</Text>
				</Box>
			</Box>
			<Box bg="bg.page" border="1" borderColor="border.tertiary" rounded="md" p="12">
				<Text fontSize="sm" fontWeight="700">
					Boston Starts Long Before the Starting Line
				</Text>
				<Text fontSize="sm" style={{ marginTop: 4 }}>
					Boston is not just a finish line. It is the proof that every winter mile, every early alarm, and every disciplined choice can become a citywide celebration.
				</Text>
			</Box>
			<Box display="grid" gap="8" style={{ gridTemplateColumns: "1fr 1fr" }}>
				<Button appearance="subtle" size="sm">
					Punchier
				</Button>
				<Button appearance="subtle" size="sm">
					More premium
				</Button>
			</Box>
			<Button appearance="primary" size="sm" icon={<IconArrowRight size={14} />} iconPosition="end" style={{ alignSelf: "flex-start" }} onClick={onApprove}>
				Approve opening
			</Button>
		</Box>
	);
}

export function SuiteReadyCard({
	notificationSent,
	onMarkReviewed,
	onOpenRationale,
	onOpenSocial,
}: {
	notificationSent: boolean;
	onMarkReviewed: () => void;
	onOpenRationale: () => void;
	onOpenSocial: () => void;
}) {
	return (
		<Box bg="bg.default" border="1" borderColor="border.tertiary" rounded="md" shadow="sm" display="flex" flexDirection="column" gap="12" mt="8" p="16">
			<Box display="grid" gap="8" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
				<StatusTile label="Blog" value="Built" />
				<StatusTile label="Social" value="3 assets" />
				<StatusTile label="Email" value="Ready" />
			</Box>
			<Text fontSize="sm" color="fg.secondary">
				I kept the hero, headline, and channel variants tied to the same runner-first story so the campaign feels like one system.
			</Text>
			<Box display="flex" flexWrap="wrap" gap="8">
				<Button appearance="subtle" size="sm" onClick={onOpenRationale}>
					Show rationale
				</Button>
				<Button appearance="primary" size="sm" icon={<IconArrowRight size={14} />} iconPosition="end" onClick={onOpenSocial}>
					Open social posts
				</Button>
			</Box>
			{notificationSent ? (
				<Box display="flex" alignItems="center" gap="6" color="fg.success">
					<IconCheck size={13} />
					<Text fontSize="sm" color="fg.success">
						Pei Chen notified — awaiting final approval
					</Text>
				</Box>
			) : (
				<Button appearance="primary" size="sm" icon={<IconArrowRight size={14} />} iconPosition="end" style={{ alignSelf: "flex-start" }} onClick={onMarkReviewed}>
					Mark reviewed & notify Pei
				</Button>
			)}
		</Box>
	);
}

export function StatusTile({ label, value }: { label: string; value: string }) {
	return (
		<Box bg="bg.page" border="1" borderColor="border.tertiary" rounded="md" p="10">
			<Text fontSize="xs" fontWeight="700" color="fg.tertiary">
				{label}
			</Text>
			<Text fontSize="sm" fontWeight="700">
				{value}
			</Text>
		</Box>
	);
}
