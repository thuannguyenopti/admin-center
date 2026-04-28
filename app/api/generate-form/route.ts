import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = process.env.OPENAI_API_KEY
	? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
	: null;

const VALID_FIELD_IDS = [
	"request-type",
	"project-name",
	"client-brand",
	"campaign-type",
	"region",
	"country",
	"business-function",
	"budget-code",
	"project-description",
	"target-audience",
	"deliverables",
	"marketing-channels",
	"launch-date",
	"deadline",
	"priority",
	"budget",
	"creative-assets",
	"reference-assets",
	"approval-contacts",
	"requires-approval",
	"additional-notes",
];

const FIELD_METADATA: Record<string, { name: string; typeLabel: string; required: boolean }> = {
	"request-type":       { name: "Request Type",         typeLabel: "Dropdown",    required: true  },
	"project-name":       { name: "Project Name",          typeLabel: "Text",        required: true  },
	"client-brand":       { name: "Client / Brand",        typeLabel: "Text",        required: true  },
	"campaign-type":      { name: "Campaign Type",         typeLabel: "Dropdown",    required: true  },
	"region":             { name: "Region",                typeLabel: "Dropdown",    required: true  },
	"country":            { name: "Country",               typeLabel: "Dropdown",    required: true  },
	"business-function":  { name: "Business or Function",  typeLabel: "Dropdown",    required: true  },
	"budget-code":        { name: "Budget Code",           typeLabel: "Text",        required: true  },
	"project-description":{ name: "Project Description",   typeLabel: "Long Text",   required: true  },
	"target-audience":    { name: "Target Audience",       typeLabel: "Long Text",   required: false },
	"deliverables":       { name: "Deliverables",          typeLabel: "Checkbox",    required: true  },
	"marketing-channels": { name: "Marketing Channels",    typeLabel: "Checkbox",    required: false },
	"launch-date":        { name: "Launch Date",           typeLabel: "Date",        required: true  },
	"deadline":           { name: "Internal Deadline",     typeLabel: "Date",        required: false },
	"priority":           { name: "Priority",              typeLabel: "Dropdown",    required: true  },
	"budget":             { name: "Estimated Budget",      typeLabel: "Number",      required: false },
	"creative-assets":    { name: "Creative Assets",       typeLabel: "File Upload", required: false },
	"reference-assets":   { name: "Reference Assets",      typeLabel: "File Upload", required: false },
	"approval-contacts":  { name: "Approval Contacts",     typeLabel: "People",      required: false },
	"requires-approval":  { name: "Requires Approval",     typeLabel: "Toggle",      required: false },
	"additional-notes":   { name: "Additional Notes",      typeLabel: "Long Text",   required: false },
};

const SYSTEM_PROMPT = `You are a form builder assistant. Given a description of a form's purpose and audience, select the most relevant fields and arrange them in a logical order.

Available field IDs:
${VALID_FIELD_IDS.join(", ")}

Return a JSON object with this exact shape:
{
  "fieldIds": ["field-id-1", "field-id-2", ...]
}

Ordering rules:
- Start with identifying fields: request-type, project-name, client-brand
- Then context: region, country, business-function, campaign-type
- Then detail: project-description, target-audience, deliverables, marketing-channels
- Then scheduling: launch-date, deadline, priority
- Then resources: budget, budget-code, creative-assets, reference-assets
- Finish with meta: approval-contacts, requires-approval, additional-notes
- Include 5–12 fields appropriate to the described purpose
- Always include "project-name" and "request-type"
- Return only valid JSON`;

const FALLBACK_FIELDS = [
	"request-type",
	"project-name",
	"region",
	"business-function",
	"budget-code",
	"project-description",
	"deliverables",
	"launch-date",
	"priority",
	"creative-assets",
];

function buildNodesAndEdges(fieldIds: string[]) {
	const nodes: Array<{
		id: string;
		type: string;
		position: { x: number; y: number };
		data: { label: string; typeLabel: string; required: boolean; fieldDefId: string };
	}> = [];

	const timestamp = Date.now();
	let y = 80;
	for (const fieldId of fieldIds) {
		const meta = FIELD_METADATA[fieldId];
		if (!meta) continue;
		nodes.push({
			id: `gen-${fieldId}-${timestamp}`,
			type: "formField",
			position: { x: 300, y },
			data: {
				label: meta.name,
				typeLabel: meta.typeLabel,
				required: meta.required,
				fieldDefId: fieldId,
			},
		});
		y += 110;
	}

	const edges = nodes.slice(0, -1).map((node, i) => ({
		id: `gen-edge-${i}-${timestamp}`,
		source: node.id,
		target: nodes[i + 1].id,
		type: "default",
	}));

	return { nodes, edges };
}

export async function POST(req: NextRequest) {
	const { description } = await req.json();

	if (!openai) {
		const { nodes, edges } = buildNodesAndEdges(FALLBACK_FIELDS);
		return NextResponse.json({ nodes, edges, fieldCount: nodes.length });
	}

	try {
		const response = await openai.chat.completions.create({
			model: "gpt-4o",
			temperature: 0.2,
			response_format: { type: "json_object" },
			messages: [
				{ role: "system", content: SYSTEM_PROMPT },
				{ role: "user", content: `Build a form for: ${description}` },
			],
		});

		const raw = response.choices[0]?.message?.content ?? "{}";
		const parsed = JSON.parse(raw);
		const fieldIds: string[] = (parsed.fieldIds ?? []).filter((id: string) =>
			VALID_FIELD_IDS.includes(id),
		);

		const chosen = fieldIds.length >= 3 ? fieldIds : FALLBACK_FIELDS;
		const { nodes, edges } = buildNodesAndEdges(chosen);
		return NextResponse.json({ nodes, edges, fieldCount: nodes.length });
	} catch {
		const { nodes: fallbackNodes, edges: fallbackEdges } = buildNodesAndEdges(FALLBACK_FIELDS);
		return NextResponse.json({
			nodes: fallbackNodes,
			edges: fallbackEdges,
			fieldCount: fallbackNodes.length,
		});
	}
}
