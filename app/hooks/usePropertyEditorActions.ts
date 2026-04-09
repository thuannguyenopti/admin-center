import usePersistentState from "@/app/usePersistentState";
import {availableAgents, defaultOpalConfiguration} from "@/app/cms/settings/opal-actions/mockData";
import {OpalConfiguration, PropertyType} from "@/app/cms/settings/opal-actions/types";
import {getLocationMenu, getGroupsForPropertyType} from "@/app/cms/settings/opal-actions/helpers";
import {useBrandTone} from "@/app/components/ai/BrandToneProvider";

interface AIAction {
	label: string;
	onClick: () => void;
	group?: {
		label: string;
		hidden: boolean;
	};
}

interface UsePropertyEditorActionsParams {
	propertyType: PropertyType;
	text?: string;
	onApply?: (suggestion: string) => void;
}

export function usePropertyEditorActions(
	propertyType: PropertyType,
	text?: string,
	onApply?: (suggestion: string) => void
): AIAction[];
export function usePropertyEditorActions(params: UsePropertyEditorActionsParams): AIAction[];
export function usePropertyEditorActions(
	propertyTypeOrParams: PropertyType | UsePropertyEditorActionsParams,
	text?: string,
	onApply?: (suggestion: string) => void
): AIAction[] {
	const [opalConfig] = usePersistentState("opal-config", defaultOpalConfiguration) as [
		OpalConfiguration,
		any
	];
	const {analyzeText} = useBrandTone();

	// Handle both call signatures
	const propertyType =
		typeof propertyTypeOrParams === "string"
			? propertyTypeOrParams
			: propertyTypeOrParams.propertyType;
	const currentText =
		typeof propertyTypeOrParams === "string" ? text : propertyTypeOrParams.text;
	const currentOnApply =
		typeof propertyTypeOrParams === "string" ? onApply : propertyTypeOrParams.onApply;

	// Get property editor menu and filter by property type
	const propertyEditorMenu = getLocationMenu(opalConfig, "property-editor");
	const groups = getGroupsForPropertyType(propertyEditorMenu, propertyType);

	// Convert groups to FieldWithAIActions format with group headers
	return groups.flatMap((group) => {
		if (group.agents.length > 1) {
			// Multiple agents - create group with header
			return group.agents.map((agentId, index) => {
				const agent = availableAgents.find((a) => a.id === agentId);
				return {
					label: agent?.name || agentId,
					group: {label: group.name, hidden: index > 0},
					onClick: () => {
						if (agentId === "brand-tone-audit" && currentText) {
							analyzeText(currentText, "property", currentOnApply);
						} else {
							console.log("Execute Opal Action:", group.name, "- Agent:", agent?.name);
						}
					},
				};
			});
		}
		// Single agent - just show group name without additional nesting
		const agentId = group.agents[0];
		return [
			{
				label: group.name,
				onClick: () => {
					if (agentId === "brand-tone-audit" && currentText) {
						analyzeText(currentText, "property", currentOnApply);
					} else {
						console.log("Execute Opal Action:", group.name);
					}
				},
			},
		];
	});
}
