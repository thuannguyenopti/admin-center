"use client";

import AbstractDialog from "@/app/components/AbstractDialog";
import usePersistentState from "@/app/usePersistentState";
import {Heading, Text} from "@optiaxiom/react";
import {Button} from "@/app/components/Button";
import {useState} from "react";
import {useRouter} from "next/navigation";

export default function Home() {
	const [sites, setSites] = usePersistentState("sites", []);

	const [open, setOpen] = useState(false);

	const router = useRouter();
	const onDelete = () => {
		setSites({status: "ok", sites: []});
		setOpen(false);
		router.push("/fe-hosting/applications/apps");
	};

	return (
		<>
			<Heading level="4">Delete Application</Heading>
			<Text mt="12">This will delete this application. You cannot undo the deletion.</Text>
			<Button
				mt="24"
				appearance="danger-outline"
				onClick={() => setOpen(true)}
			>
				Delete Application
			</Button>
			<AbstractDialog
				isAlert
				title="Delete Application"
				description="This will permanently remove this application and cannot be undone."
				open={open}
				setOpen={setOpen}
				footerPrimaryText="Delete Application"
				footerAppearance="danger"
				footerPrimaryAction={onDelete}
			/>
		</>
	);
}
