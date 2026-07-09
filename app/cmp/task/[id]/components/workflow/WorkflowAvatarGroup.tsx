"use client";

import { Avatar, Box } from "@optiaxiom/react";
import { Text } from "@/app/components/Text";
import {IconPlus} from "@/app/lib/axiom-icons";
import { DashedCircle } from "../shared/DashedCircle";

export function WorkflowAvatarGroup() {
	return (
		<Box alignItems="center" display="flex">
			<DashedCircle>
				<IconPlus size={12} stroke={1.8} />
			</DashedCircle>
			<Avatar size="sm" src="/avatars/aamr-fakhry.png" style={{ height: 24, marginLeft: 6, width: 24 }} />
			<Avatar size="sm" src="/avatars/benjamin-holme.svg" style={{ height: 24, marginLeft: -4, width: 24 }} />
			<Avatar size="sm" src="/avatars/stefan-svebeck.svg" style={{ height: 24, marginLeft: -4, width: 24 }} />
			<Box
				alignItems="center"
				bg="bg.secondary"
				display="flex"
				justifyContent="center"
				rounded="full"
				style={{ height: 24, marginLeft: -4, width: 24 }}
			>
				<Text style={{ fontSize: 12, fontWeight: 500, lineHeight: "16px", maxWidth: "none" }}>+3</Text>
			</Box>
		</Box>
	);
}
