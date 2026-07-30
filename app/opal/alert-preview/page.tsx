<<<<<<< HEAD
"use client";

import { Box, Button } from "@optiaxiom/react";
import { OpalAlert } from "@/app/opal/components/OpalAlert";

export default function AlertPreviewPage() {
	return (
		<Box display="flex" flexDirection="column" gap="24" p="32" style={{ maxWidth: 600 }}>
			<OpalAlert
				type="Default"
				title="Alert Title."
				body="Use this space to add additional details about what happened or what the user should do next."
				link={{ label: "link text", href: "#" }}
			/>

			<OpalAlert
				type="Default"
				body="Use this space to add additional details about what happened."
				link={{ label: "link text", href: "#" }}
				dismissible={false}
			/>

			<OpalAlert
				type="CTA"
				body="Use this space to add additional details about what happened."
				action={<Button size="sm" appearance="primary">Button</Button>}
			/>
		</Box>
	);
}
=======
"use client";

import { Box, Button } from "@optiaxiom/react";
import { OpalAlert } from "@/app/opal/components/OpalAlert";

export default function AlertPreviewPage() {
	return (
		<Box display="flex" flexDirection="column" gap="24" p="32" style={{ maxWidth: 600 }}>
			<OpalAlert
				type="Default"
				title="Alert Title."
				body="Use this space to add additional details about what happened or what the user should do next."
				link={{ label: "link text", href: "#" }}
			/>

			<OpalAlert
				type="Default"
				body="Use this space to add additional details about what happened."
				link={{ label: "link text", href: "#" }}
				dismissible={false}
			/>

			<OpalAlert
				type="CTA"
				body="Use this space to add additional details about what happened."
				action={<Button size="sm" appearance="primary">Button</Button>}
			/>
		</Box>
	);
}
>>>>>>> origin/main
