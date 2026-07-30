"use client";

import SparklesIcon from "@/app/cmp/assets/sparkles 16.svg";
import {IconCalendar, IconCheck, IconCopy, IconTag} from "@/app/lib/axiom-icons";
import type { WorkflowTemplateIconKind } from "../../types";

export function WorkflowTemplateIcon({ icon }: { icon: WorkflowTemplateIconKind }) {
	const common = { color: "var(--ax-colors-fg-secondary)", size: 18 };

	switch (icon) {
		case "calendar":
			return <IconCalendar {...common} />;
		case "sparkles":
			return <SparklesIcon height={common.size} style={{ color: common.color }} width={common.size} />;
		case "tag":
			return <IconTag {...common} />;
		case "check":
			return <IconCheck {...common} />;
		case "copy":
		default:
			return <IconCopy {...common} />;
	}
}
