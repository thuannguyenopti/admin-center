"use client";

import {Box, Heading} from "@optiaxiom/react";
import {Text} from "@/app/components/Text";
import Link from "next/link";
import {Button} from "@/app/components/Button";
import {IconWand} from "@tabler/icons-react";

export default function EditPage() {
	return (
		<Box>
			<Heading
				level="4"
				mb="16"
			>
				Content Editing
			</Heading>
			<Text
				mb="24"
				color="fg.secondary"
			>
				Edit and manage your content using the visual builder.
			</Text>
			<Link href="/cms/edit/proto">
				<Button
					appearance="primary"
					icon={<IconWand size={16} />}
				>
					Open Visual Builder Prototype
				</Button>
			</Link>
		</Box>
	);
}