"use client";

import {Box} from "@optiaxiom/react";
import {Button} from "@/app/components/Button";
import Link from "next/link";

export default function Home() {
	return (
		<Box
			w="full"
			h="full"
			display="flex"
			p="24"
			gap="12"
			flexDirection="column"
			alignItems="center"
			justifyContent="center"
		>
			<Link href="/cms/dashboard">
				<Button>To CMS</Button>
			</Link>
			<Link href="/graph/dashboard">
				<Button>To Graph</Button>
			</Link>
			<Link href="/fe-hosting/applications/apps">
				<Button>To FE Hosting</Button>
			</Link>
		</Box>
	);
}
