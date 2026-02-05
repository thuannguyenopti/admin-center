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
	Badge,
	Alert,
	Card,
} from "@optiaxiom/react";
import {Input} from "@/app/components/Input";
import {Button} from "@/app/components/Button";
import {Text} from "@/app/components/Text";
import {Heading} from "@optiaxiom/react";
import {use, useState, useEffect} from "react";
import usePersistentState from "@/app/usePersistentState";
import {Flex} from "@/app/components/Flex";
import Flow from "@/app/components/Flow";
import {Table} from "@/app/components/Table";

export default function WebhookSettings({params}: {params: Promise<{id: string}>}) {
	return (
		<Flow maxW="lg">
			<Heading level="1">Heading 1</Heading>
			<Text fontWeight="600" fontSize="lg">
				Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet,
				consectetur adipiscing elit.
			</Text>
			<Alert intent="information">
				This is a sample alert to showcase the alert component styling.
			</Alert>
			<Alert intent="success">
				This is a sample alert to showcase the alert component styling.
			</Alert>
			<Alert intent="warning">
				This is a sample alert to showcase the alert component styling.
			</Alert>
			<Alert intent="danger">
				This is a sample alert to showcase the alert component styling.
			</Alert>
			<Text>
				Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet,
				consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing
				elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit
				amet, consectetur adipiscing elit.
			</Text>
			<Card>
				<Flex gap="8">
					<Badge>Status: Active</Badge>
					<Badge intent="information">Success Rate: 95%</Badge>
					<Badge intent="success">Successes: 150</Badge>
					<Badge intent="warning">Failures: 5</Badge>
					<Badge intent="danger">Errors: 2</Badge>
					<Badge intent="primary">Hey!</Badge>
				</Flex>
				<Flex gap="8">
					<Badge>Status: Active</Badge>
					<Badge variant="strong" intent="information">
						Success Rate: 95%
					</Badge>
					<Badge variant="strong" intent="success">
						Successes: 150
					</Badge>
					<Badge variant="strong" intent="warning">
						Failures: 5
					</Badge>
					<Badge variant="strong" intent="danger">
						Errors: 2
					</Badge>
					<Badge variant="strong" intent="primary">
						Hey!
					</Badge>
				</Flex>
			</Card>
			<Heading level="2">Heading 2</Heading>
			<Field label="Sample Field">
				<Input placeholder="Enter something..." />
			</Field>
			<Field label="Sample Field" description="This is some help text for the field.">
				<Input placeholder="Enter something..." />
			</Field>
			<Flex gap="8">
				<Button>Cancel</Button>
				<Button appearance="primary">Save</Button>
				<Button appearance="danger-outline">Delete</Button>
				<Button appearance="danger">Delete</Button>
			</Flex>
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
		</Flow>
	);
}
