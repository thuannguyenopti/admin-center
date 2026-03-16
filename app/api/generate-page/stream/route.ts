/**
 * SSE Streaming endpoint for AI-powered page generation
 * Generates page structure and content based on user instructions
 */

interface ChecklistItem {
	label: string;
	status: "pending" | "running" | "completed" | "failed";
}

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const {pageId, instructions, contentTypeId} = body;

		console.log("[Generate Page Stream] Request received:", {
			pageId,
			instructionsLength: instructions?.length,
			contentTypeId,
		});

		// Validate inputs
		if (!pageId || !instructions || !contentTypeId) {
			return new Response(
				JSON.stringify({error: "pageId, instructions, and contentTypeId are required"}),
				{
					status: 400,
					headers: {"Content-Type": "application/json"},
				}
			);
		}

		// Create SSE stream
		const encoder = new TextEncoder();

		const stream = new ReadableStream({
			async start(controller) {
				// Helper to send SSE event
				const sendEvent = (event: string, data: any) => {
					const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
					controller.enqueue(encoder.encode(message));
				};

				// Helper to add delay between tasks
				const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
				const taskDelay = () => delay(500 + Math.random() * 500); // 500-1000ms

				// Initial checklist
				const checklist: ChecklistItem[] = [
					{label: "Analyzing instructions", status: "pending"},
					{label: "Designing page structure", status: "pending"},
					{label: "Generating content", status: "pending"},
					{label: "Creating sections", status: "pending"},
					{label: "Populating elements", status: "pending"},
					{label: "Finalizing page", status: "pending"},
				];

				// Send initial checklist
				sendEvent("checklist", checklist);

				try {
					// Task 1: Analyze instructions and create page structure
					checklist[0].status = "running";
					sendEvent("checklist", checklist);

					// For MVP, we'll use a simple template-based approach
					// In production, this would call OpenAI API
					const analysis = await analyzeInstructions(instructions, contentTypeId);

					// Create page structure immediately
					const pageStructure = await generatePageStructure(analysis);
					const outlines = await createSections(pageStructure, {});

					// Send initial structure with empty sections - VB can load now!
					sendEvent("structure", {outlines: outlines});

					checklist[0].status = "completed";
					sendEvent("checklist", checklist);
					await taskDelay();

					// Task 2: Design page structure (placeholder - structure already created)
					checklist[1].status = "running";
					sendEvent("checklist", checklist);

					await delay(300); // Simulate some work

					checklist[1].status = "completed";
					sendEvent("checklist", checklist);
					await taskDelay();

					// Task 3: Generate content
					checklist[2].status = "running";
					sendEvent("checklist", checklist);

					const contentData = await generateContent(analysis, pageStructure);

					checklist[2].status = "completed";
					sendEvent("checklist", checklist);
					await taskDelay();

					// Task 4: Create sections (placeholder - sections already created)
					checklist[3].status = "running";
					sendEvent("checklist", checklist);

					await delay(300); // Simulate some work

					checklist[3].status = "completed";
					sendEvent("checklist", checklist);
					await taskDelay();

					// Task 5: Populate elements
					checklist[4].status = "running";
					sendEvent("checklist", checklist);

					const populatedOutlines = await populateElements(outlines, contentData);

					console.log("[Generate Page Stream] Generated outlines:", JSON.stringify(populatedOutlines, null, 2));

					// Send structure update with populated content
					sendEvent("structure", {outlines: populatedOutlines});

					checklist[4].status = "completed";
					sendEvent("checklist", checklist);
					await taskDelay();

					// Task 6: Finalize
					checklist[5].status = "running";
					sendEvent("checklist", checklist);

					await delay(500);

					checklist[5].status = "completed";
					sendEvent("checklist", checklist);

					// Send completion
					const sectionCount = populatedOutlines.length;
					const elementCount = populatedOutlines.reduce(
						(sum: number, outline: any) => sum + Object.keys(outline.elements || {}).length,
						0
					);

					sendEvent("complete", {
						success: true,
						summary: `Page generated successfully with ${sectionCount} section${sectionCount !== 1 ? "s" : ""} and ${elementCount} element${elementCount !== 1 ? "s" : ""}.`,
					});

					console.log("[Generate Page Stream] Complete:", {
						sectionCount,
						elementCount,
					});
				} catch (error) {
					console.error("[Generate Page Stream] Error occurred:", error);
					sendEvent("error", {
						message:
							error instanceof Error ? error.message : "An error occurred during generation",
					});
				} finally {
					controller.close();
				}
			},
		});

		return new Response(stream, {
			headers: {
				"Content-Type": "text/event-stream",
				"Cache-Control": "no-cache",
				Connection: "keep-alive",
			},
		});
	} catch (error) {
		console.error("[Generate Page Stream] Error occurred:", error);
		return new Response(JSON.stringify({error: "Internal Server Error"}), {
			status: 500,
			headers: {"Content-Type": "application/json"},
		});
	}
}

// Helper functions for page generation

async function analyzeInstructions(instructions: string, contentTypeId: string) {
	// In production, this would call OpenAI API to parse instructions
	// For MVP, return a simple analysis
	return {
		pageType: contentTypeId,
		sections: determineSections(instructions),
		contentNeeds: {
			hero: instructions.toLowerCase().includes("hero"),
			features: instructions.toLowerCase().includes("feature"),
			cta: instructions.toLowerCase().includes("cta") || instructions.toLowerCase().includes("call to action"),
			testimonial: instructions.toLowerCase().includes("testimonial"),
			pricing: instructions.toLowerCase().includes("pricing"),
		},
	};
}

function determineSections(instructions: string): string[] {
	const sections: string[] = [];
	const lower = instructions.toLowerCase();

	if (lower.includes("hero")) sections.push("hero");
	if (lower.includes("feature")) sections.push("features");
	if (lower.includes("benefit")) sections.push("benefits");
	if (lower.includes("testimonial")) sections.push("testimonials");
	if (lower.includes("pricing")) sections.push("pricing");
	if (lower.includes("cta") || lower.includes("call to action")) sections.push("cta");
	if (lower.includes("faq")) sections.push("faq");

	// Default sections if none detected
	if (sections.length === 0) {
		sections.push("hero", "features", "cta");
	}

	return sections;
}

async function generatePageStructure(analysis: any) {
	return {
		sections: analysis.sections,
		layout: "single-column",
	};
}

async function generateContent(analysis: any, structure: any) {
	// Generate sample content for each section
	const contentMap: Record<string, any> = {
		hero: {
			heading: "Welcome to Your New Page",
			subheading: "Create amazing experiences with ease",
			ctaText: "Get Started",
		},
		features: {
			heading: "Key Features",
			items: [
				{title: "Feature One", description: "Description of first feature"},
				{title: "Feature Two", description: "Description of second feature"},
				{title: "Feature Three", description: "Description of third feature"},
			],
		},
		cta: {
			heading: "Ready to Get Started?",
			buttonText: "Sign Up Now",
		},
	};

	return contentMap;
}

async function createSections(structure: any, contentData: any) {
	const outlines: any[] = [];

	structure.sections.forEach((sectionType: string, index: number) => {
		const outlineId = `ol-${Date.now()}-${index}`;
		const sectionId = `sec-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`;
		const rowId = `row-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`;
		const colId = `col-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`;

		const title = sectionType.charAt(0).toUpperCase() + sectionType.slice(1);

		// Create tree structure immediately so VB can render the page shell
		const tree = [
			{
				id: sectionId,
				name: title,
				open: true,
				children: [
					{
						id: rowId,
						open: true,
						children: [
							{
								id: colId,
								open: true,
								elements: [], // Empty initially, will be populated later
							},
						],
					},
				],
			},
		];

		outlines.push({
			id: outlineId,
			title: title,
			tree: tree,
			elements: {},
		});
	});

	return outlines;
}

async function populateElements(outlines: any[], contentData: any) {
	return outlines.map((outline: any) => {
		const sectionType = outline.title.toLowerCase();
		const content = contentData[sectionType];

		if (!content) return outline;

		const elements: Record<string, any> = {};
		const elementIds: string[] = [];

		// Add content elements based on section type
		if (sectionType === "hero" && content.heading) {
			const headingId = `ele-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
			elementIds.push(headingId);
			elements[headingId] = {
				type: "ct-heading",
				properties: {
					text: {value: content.heading},
					level: {value: "h1"},
				},
			};

			if (content.subheading) {
				const subheadingId = `ele-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
				elementIds.push(subheadingId);
				elements[subheadingId] = {
					type: "ct-text",
					properties: {
						text: {value: content.subheading},
					},
				};
			}

			if (content.ctaText) {
				const buttonId = `ele-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
				elementIds.push(buttonId);
				elements[buttonId] = {
					type: "ct-button",
					properties: {
						text: {value: content.ctaText},
						appearance: {value: "primary"},
					},
				};
			}
		} else if (sectionType === "features" && content.heading) {
			const headingId = `ele-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
			elementIds.push(headingId);
			elements[headingId] = {
				type: "ct-heading",
				properties: {
					text: {value: content.heading},
					level: {value: "h2"},
				},
			};
		} else if (sectionType === "cta" && content.heading) {
			const headingId = `ele-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
			elementIds.push(headingId);
			elements[headingId] = {
				type: "ct-heading",
				properties: {
					text: {value: content.heading},
					level: {value: "h2"},
				},
			};

			if (content.buttonText) {
				const buttonId = `ele-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
				elementIds.push(buttonId);
				elements[buttonId] = {
					type: "ct-button",
					properties: {
						text: {value: content.buttonText},
						appearance: {value: "primary"},
					},
				};
			}
		}

		// Update the existing tree structure with elements
		// Navigate to the column node and update its elements
		const updatedTree = JSON.parse(JSON.stringify(outline.tree)); // Deep clone
		if (updatedTree[0]?.children[0]?.children[0]) {
			updatedTree[0].children[0].children[0].elements = elementIds.map((id) => ({id}));
		}

		return {
			...outline,
			tree: updatedTree,
			elements,
		};
	});
}
