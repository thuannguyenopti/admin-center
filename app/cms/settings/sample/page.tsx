"use client";

import {
	Box,
	Field,
	Checkbox,
	Select,
	SelectTrigger,
	SelectContent,
	Grid,
	Separator,
} from "@optiaxiom/react";
import {Input} from "@/app/components/Input";
import {Button} from "@/app/components/Button";
import {Text} from "@/app/components/Text";
import {Heading} from "@optiaxiom/react";
import {use, useState, useEffect} from "react";
import usePersistentState from "@/app/usePersistentState";
import {Flex} from "@/app/components/Flex";
import Flow from "@/app/components/Flow";

export default function WebhookSettings({params}: {params: Promise<{id: string}>}) {
	return (
		<Flow maxW="lg">
			<Heading level="1">Heading 1</Heading>
			<Text fontWeight="600" fontSize="lg">
				Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet,
				consectetur adipiscing elit.
			</Text>
			<Text>
				Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet,
				consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing
				elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit
				amet, consectetur adipiscing elit.
			</Text>
			<Heading level="2">Heading 2</Heading>
			<Field label="Sample Field">
				<Input placeholder="Enter something..." />
			</Field>
			<Field label="Sample Field" description="This is some help text for the field.">
				<Input placeholder="Enter something..." />
			</Field>
			<Button>Submit</Button>
			<Separator />
			<Heading level="3">Heading 3</Heading>
			<Text>
				Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet,
				consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing
				elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit
				amet, consectetur adipiscing elit.
			</Text>
			<Text>
				Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet,
				consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing
				elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit
				amet, consectetur adipiscing elit.
			</Text>
			<Heading level="4">Heding 4</Heading>
			<Text>This will permanently remove this Webhook and cannot be undone.</Text>
			<Button appearance="danger-outline">Delete Webhook</Button>
		</Flow>
	);
}
