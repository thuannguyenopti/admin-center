"use client";

import { Box, Heading } from "@optiaxiom/react";
import { Text } from "@/app/components/Text";
import Link from "next/link";
import { Button } from "@/app/components/Button";
import { IconWand } from "@tabler/icons-react";
import { Aside } from "@/app/context/LayoutContext";
import RightToolbar from "@/app/components/RightToolbar";

export default function ContentPage() {
	return (
		<>
			<Box>
				<Text
					mb="24"
					color="fg.secondary"
				>
					Edit and manage your content using the visual builder.
				</Text>
				<Link href="/cms/content/proto">
					<Button
						appearance="primary"
						icon={<IconWand size={16} />}
					>
						Open Visual Builder Prototype
					</Button>
				</Link>
			</Box>
			<Aside>
				<RightToolbar />
			</Aside>
		</>
	);
}