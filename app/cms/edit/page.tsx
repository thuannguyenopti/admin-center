"use client";

import {Box, Heading} from "@optiaxiom/react";
import {Text} from "@/app/components/Text";
import Link from "next/link";
import {Button} from "@/app/components/Button";
import {IconWand} from "@tabler/icons-react";
import {Aside} from "@/app/context/LayoutContext";
import RightToolbar from "@/app/components/RightToolbar";

export default function EditPage() {
	return (
		<>
			<Box p="24">
				<Heading
					level="3"
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
			<Aside>
				<RightToolbar />
			</Aside>
		</>
	);
}
