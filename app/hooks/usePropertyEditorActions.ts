import usePersistentState from "@/app/usePersistentState";
import {OpalAction, availableAgents, PropertyType} from "@/app/cms/settings/opal-actions/mockData";
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
	const [opalActions] = usePersistentState("opal-actions", []) as [OpalAction[], any];
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

	// Filter actions that:
	// 1. Are enabled
	// 2. Have propertyEditor.enabled = true
	// 3. Have matching property type (or empty array = all types)
	const filteredActions = opalActions.filter((action) => {
		if (!action.enabled) return false;
		if (!action.locations.propertyEditor?.enabled) return false;

		const types = action.locations.propertyEditor.propertyTypes;
		// If no types specified, show for all property types
		if (types.length === 0) return true;
		// Otherwise, check if current property type is in the list
		return types.includes(propertyType);
	});

	// Convert to FieldWithAIActions format with group headers
	return filteredActions.flatMap((action) => {
		if (action.agents.length > 1) {
			// Multiple agents - create group with header
			return action.agents.map((agentId, index) => {
				const agent = availableAgents.find((a) => a.id === agentId);
				return {
					label: agent?.name || agentId,
					group: {label: action.name, hidden: index > 0},
					onClick: () => {
						if (agentId === "brand-tone-audit" && currentText) {
							analyzeText(currentText, "property", currentOnApply);
						} else {
							console.log("Execute Opal Action:", action.name, "- Agent:", agent?.name);
						}
					},
				};
			});
		}
		// Single agent - just show action name without group
		const agentId = action.agents[0];
		return [
			{
				label: action.name,
				onClick: () => {
					if (agentId === "brand-tone-audit" && currentText) {
						analyzeText(currentText, "property", currentOnApply);
					} else {
						console.log("Execute Opal Action:", action.name);
					}
				},
			},
		];
	});
}
