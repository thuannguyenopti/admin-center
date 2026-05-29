"use client";

import { Badge } from "@optiaxiom/react";
import type { BrandPackStatus } from "../types";

type StatusBadgeProps = {
	status: BrandPackStatus;
};

const config: Record<BrandPackStatus, { label: string; intent: "primary" | "neutral" | "warning" | "danger" }> = {
	active: { label: "Active", intent: "primary" },
	published: { label: "Published", intent: "neutral" },
	draft: { label: "Draft", intent: "warning" },
	archived: { label: "Archived", intent: "neutral" },
};

export function StatusBadge({ status }: StatusBadgeProps) {
	const { label, intent } = config[status];
	return <Badge intent={intent}>{label}</Badge>;
}
