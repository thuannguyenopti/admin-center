"use client";

import { useState } from "react";
import { Box, Card, CardHeader } from "@optiaxiom/react";
import { IconChevronLeft, IconChevronDown } from "@/app/lib/axiom-icons";

interface FieldEditorAccordionProps {
	icon: React.ReactNode;
	title: string;
	children: React.ReactNode;
	defaultOpen?: boolean;
}

export function FieldEditorAccordion({ icon, title, children, defaultOpen = false }: FieldEditorAccordionProps) {
	const [isOpen, setIsOpen] = useState(defaultOpen);

	return (
		<Card>
			<CardHeader
				addonBefore={icon}
				addonAfter={
					<Box color="fg.secondary">
						{isOpen ? <IconChevronDown size={16} /> : <IconChevronLeft size={16} />}
					</Box>
				}
				onClick={() => setIsOpen(!isOpen)}
				style={{ cursor: "pointer" }}
			>
				{title}
			</CardHeader>

			{isOpen && (
				<Box p="16" borderColor="border.tertiary">
					{children}
				</Box>
			)}
		</Card>
	);
}
