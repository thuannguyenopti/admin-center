<<<<<<< HEAD
"use client";

import { Box } from "@optiaxiom/react";
import { Input } from "@/app/components/Input";
import { Text } from "@/app/components/Text";
import { IconSearch } from "@tabler/icons-react";
import { forwardRef } from "react";
import type { WorkflowTemplate } from "../../types";
import { WorkflowTemplateIcon } from "./WorkflowTemplateIcon";

type WorkflowTemplateMenuProps = {
	templates: WorkflowTemplate[];
	onSearchChange: (value: string) => void;
	onSelect: (workflowId: string) => void;
	searchValue: string;
};

export const WorkflowTemplateMenu = forwardRef<HTMLDivElement, WorkflowTemplateMenuProps>(
	function WorkflowTemplateMenu({ templates, onSearchChange, onSelect, searchValue }, ref) {
		return (
			<Box
				bg="bg.default"
				border="1"
				borderColor="border.default"
				ref={ref}
				rounded="lg"
				style={{
					boxShadow: "0 12px 32px rgba(22, 34, 51, 0.18)",
					left: 16,
					maxHeight: 560,
					overflow: "hidden",
					position: "absolute",
					right: 16,
					top: 164,
					zIndex: 30,
				}}
			>
			<Box display="flex" flexDirection="column" style={{ gap: 8, padding: 8 }}>
				<Input
					addonBefore={<IconSearch size={16} />}
					onChange={(event) => onSearchChange(event.target.value)}
					placeholder="Search by workflow Name"
					value={searchValue}
				/>
				<Box display="flex" flexDirection="column" overflow="auto" style={{ maxHeight: 470 }}>
					{templates.map((template) => (
						<button
							key={template.id}
							onClick={() => onSelect(template.id)}
							style={{
								alignItems: "flex-start",
								background: "transparent",
								border: "none",
								borderRadius: 8,
								cursor: "pointer",
								display: "flex",
								gap: 12,
								padding: "14px 12px",
								textAlign: "left",
								width: "100%",
							}}
							type="button"
						>
							<WorkflowTemplateIcon icon={template.icon} />
							<Box display="flex" flexDirection="column" style={{ gap: template.subtitle ? 4 : 0 }}>
								<Text color="fg.default" style={{ fontSize: 16, lineHeight: "24px", maxWidth: "none" }}>
									{template.name}
								</Text>
								{template.subtitle && (
									<Text
										color="fg.tertiary"
										style={{ fontSize: 14, lineHeight: "20px", maxWidth: "none" }}
									>
										{template.subtitle}
									</Text>
								)}
							</Box>
						</button>
					))}
				</Box>
			</Box>
		</Box>
	);
},
);
=======
"use client";

import { Box } from "@optiaxiom/react";
import { Input } from "@/app/components/Input";
import { Text } from "@/app/components/Text";
import {IconSearch} from "@/app/lib/axiom-icons";
import { forwardRef } from "react";
import type { WorkflowTemplate } from "../../types";
import { WorkflowTemplateIcon } from "./WorkflowTemplateIcon";

type WorkflowTemplateMenuProps = {
	templates: WorkflowTemplate[];
	onSearchChange: (value: string) => void;
	onSelect: (workflowId: string) => void;
	searchValue: string;
};

export const WorkflowTemplateMenu = forwardRef<HTMLDivElement, WorkflowTemplateMenuProps>(
	function WorkflowTemplateMenu({ templates, onSearchChange, onSelect, searchValue }, ref) {
		return (
			<Box
				bg="bg.default"
				border="1"
				borderColor="border.default"
				ref={ref}
				rounded="lg"
				style={{
					boxShadow: "0 12px 32px rgba(22, 34, 51, 0.18)",
					left: 16,
					maxHeight: 560,
					overflow: "hidden",
					position: "absolute",
					right: 16,
					top: 164,
					zIndex: 30,
				}}
			>
			<Box display="flex" flexDirection="column" style={{ gap: 8, padding: 8 }}>
				<Input
					addonBefore={<IconSearch size={16} />}
					onChange={(event) => onSearchChange(event.target.value)}
					placeholder="Search by workflow Name"
					value={searchValue}
				/>
				<Box display="flex" flexDirection="column" overflow="auto" style={{ maxHeight: 470 }}>
					{templates.map((template) => (
						<button
							key={template.id}
							onClick={() => onSelect(template.id)}
							style={{
								alignItems: "flex-start",
								background: "transparent",
								border: "none",
								borderRadius: 8,
								cursor: "pointer",
								display: "flex",
								gap: 12,
								padding: "14px 12px",
								textAlign: "left",
								width: "100%",
							}}
							type="button"
						>
							<WorkflowTemplateIcon icon={template.icon} />
							<Box display="flex" flexDirection="column" style={{ gap: template.subtitle ? 4 : 0 }}>
								<Text color="fg.default" style={{ fontSize: 16, lineHeight: "24px", maxWidth: "none" }}>
									{template.name}
								</Text>
								{template.subtitle && (
									<Text
										color="fg.tertiary"
										style={{ fontSize: 14, lineHeight: "20px", maxWidth: "none" }}
									>
										{template.subtitle}
									</Text>
								)}
							</Box>
						</button>
					))}
				</Box>
			</Box>
		</Box>
	);
},
);
>>>>>>> origin/main
