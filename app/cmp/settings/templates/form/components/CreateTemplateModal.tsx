"use client";

import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogBody,
	DialogFooter,
	DialogForm,
	Field,
	Input,
	Textarea,
	Checkbox,
	Button,
	Box,
} from "@optiaxiom/react";
import { Text } from "@/app/components/Text";

interface CreateTemplateModalProps {
	open: boolean;
	onSave: (data: { templateName: string; description: string; applicableTo: string[] }) => void;
	onCancel: () => void;
}

export function CreateTemplateModal({ open, onSave, onCancel }: CreateTemplateModalProps) {
	const [templateName, setTemplateName] = useState("");
	const [description, setDescription] = useState("");
	const [applicableTo, setApplicableTo] = useState<string[]>([]);

	const isValid = templateName.trim().length > 0 && description.trim().length > 0;

	const handleSave = () => {
		if (!isValid) return;
		onSave({ templateName: templateName.trim(), description: description.trim(), applicableTo });
	};

	const toggle = (value: string) =>
		setApplicableTo((prev) =>
			prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
		);

	return (
		<Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
			<DialogContent size="sm">
				<DialogForm onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
					<DialogHeader>Create Template</DialogHeader>

					<DialogBody display="flex" flexDirection="column" gap="20">
						{/* Template name */}
						<Box display="flex" flexDirection="column" gap="4">
							<Field label="Template name" required>
								<Input
									value={templateName}
									onValueChange={(v) => setTemplateName(v.slice(0, 80))}
									placeholder=""
								/>
							</Field>
							<Text fontSize="xs" color="fg.tertiary">{templateName.length}/80</Text>
						</Box>

						{/* Description */}
						<Box display="flex" flexDirection="column" gap="4">
							<Field label="Description" required>
								<Textarea
									value={description}
									onValueChange={(v) => setDescription(v.slice(0, 250))}
									placeholder=""
									rows={3}
									resize="none"
								/>
							</Field>
							<Text fontSize="xs" color="fg.tertiary">{description.length}/250</Text>
						</Box>

						{/* Applicable to */}
						<Box display="flex" flexDirection="column" gap="12">
							<Text fontSize="sm" color="fg.default" fontWeight="500">
								Applicable to
							</Text>
							<Box display="flex" gap="20" flexWrap="wrap">
								<Checkbox
									checked={applicableTo.includes("work-request")}
									onCheckedChange={() => toggle("work-request")}
								>
									Work Request
								</Checkbox>
								<Checkbox
									checked={applicableTo.includes("campaign-brief")}
									onCheckedChange={() => toggle("campaign-brief")}
								>
									Campaign Brief
								</Checkbox>
								<Checkbox
									checked={applicableTo.includes("task-brief")}
									onCheckedChange={() => toggle("task-brief")}
								>
									Task Brief
								</Checkbox>
							</Box>
						</Box>
					</DialogBody>

					<DialogFooter>
						<Button appearance="default" type="button" onClick={onCancel}>
							Cancel
						</Button>
						<Button appearance="primary" type="submit" disabled={!isValid}>
							Save
						</Button>
					</DialogFooter>
				</DialogForm>
			</DialogContent>
		</Dialog>
	);
}
