"use client";

import {Box, Card, Field, Heading, Spinner, Textarea, Checkbox} from "@optiaxiom/react";
import {Button} from "@/app/components/Button";
import {Text} from "@/app/components/Text";
import {useState} from "react";
import {IconSparkles, IconXmark, IconArrowLeft, IconStack2} from "@/app/lib/axiom-icons";
import Property from "@/app/components/Property";
import {Flex} from "@/app/components/Flex";

type AnalysisItem = {
	id: string;
	title: string;
	reason: string;
};

export default function VariationsPanel({
	variations,
	selectedVariation,
	onSelectVariation,
	onAddVariation,
}: any) {
	const [analysis, setAnalysis] = useState<AnalysisItem[] | null>(null);
	const [selectedSuggestions, setSelectedSuggestions] = useState<string[]>([]);
	const [userInput, setUserInput] = useState("");
	const [simple, setSimple] = useState(true);
	const [step, setStep] = useState<"analyze" | "analyzing" | "result" | "creating">("analyze");

	const currentVariation = variations?.find((v: any) => v.id === selectedVariation);

	const handleCreateFromAnalysis = async () => {
		if (!analysis || !currentVariation) return;

		const featuresToImplement = analysis.filter((item) =>
			selectedSuggestions.includes(item.id)
		);
		if (featuresToImplement.length === 0) return;

		setStep("creating");

		try {
			const contentToCreate = JSON.stringify({
				original: currentVariation,
				Instructions: featuresToImplement.map(
					(f) =>
						"- " +
						f.reason +
						`
					`
				),
			});
			console.log("Creating variation with content:", contentToCreate);
			const response = await fetch("/api/llm", {
				method: "POST",
				headers: {"Content-Type": "application/json"},
				body: JSON.stringify({
					messages: [
						{
							role: "system",
							content: `You are an expert CMS developer. Based on the selected analysis points provided, generate a new variation.
                            Return ONLY a valid JSON object with the following structure:
                            {
                                "name": "Name of the variation",
                                "outlines": [
                                    {
                                        "id": "...", 
                                        "title": "...", 
                                        "tree": [...], 
                                        "elements": {
                                            "ele-id-1": {
                                                "type": "ct-heading",
                                                "properties": { "text": { "value": "Heading Text" } }
                                            },
                                            "ele-id-2": {
                                                "type": "ct-text",
                                                "properties": { "text": { "value": "Body text content" } }
                                            },
                                            "ele-id-3": {
                                                "type": "ct-button",
                                                "properties": { "label": { "value": "Click Me" }, "variant": { "value": "primary" } }
                                            },
                                            "ele-id-4": {
                                                "type": "ct-image",
                                                "properties": {
                                                    "src": { "value": "https://..." },
                                                    "alt": { "value": "Description" }
                                                }
                                            },
                                            "ele-id-5": {
                                                "type": "ct-input",
                                                "properties": { 
                                                    "label": { "value": "Email" },
                                                    "placeholder": { "value": "Enter email..." }
                                                }
                                            }
                                        } 
                                    }
                                ],
                                "data": { ...modified properties object... }
                            }
                            IMPORTANT: The "elements" object MUST contain definitions for ALL node IDs referenced in the "tree". 
                            Do not leave "elements" empty if there possess nodes in the "tree".
                            KEY FORMAT: "properties" should be an object where keys are property names and values are objects with a "value" key.
                            SUPPORTED TYPES: ct-heading, ct-text, ct-button, ct-image, ct-input. Use these types for elements.
                            
                            IF YOU USE IMAGES, YOU MUST SELECT FROM THIS LIST OF APPROVED URLS:
                            - https://picsum.photos/seed/cycling1/400/300 (Person in hoodie by sea)
                            - https://picsum.photos/seed/cycling2/400/300 (Railroad tracks by beach)
                            - https://picsum.photos/seed/exercise1/400/300 (Car and scooter street)
                            - https://picsum.photos/seed/running1/400/300 (Green field with trees)
                            - https://picsum.photos/seed/cycling3/400/300 (Mist over calm lake)
                            - https://picsum.photos/seed/yoga1/400/300 (Red flower closeup)
                            - https://picsum.photos/seed/exercise2/400/300 (Wheat field and sky)
                            - https://picsum.photos/seed/cycling4/400/300 (People walking on bridge)
                            - https://picsum.photos/seed/running2/400/300 (Lightning over city lights)
                            - https://picsum.photos/seed/exercise3/400/300 (Woman walking in field)
                            - https://picsum.photos/seed/cycling5/400/300 (River between rock cliffs)
                            - https://picsum.photos/seed/exercise4/400/300 (Gray asphalt road)
                            - https://picsum.photos/seed/running3/400/300 (Trees and mountains)
                            - https://picsum.photos/seed/cycling6/400/300 (Scenic nature view)
                            - https://picsum.photos/seed/exercise5/400/300 (Person sitting on bench)
                            - https://picsum.photos/seed/cycling7/400/300 (Sunset over calm sea)
                            - https://picsum.photos/seed/exercise6/400/300 (Waterfall under cloudy sky)
                            - https://picsum.photos/seed/running4/400/300 (Man holding coffee mug)
                            - https://picsum.photos/seed/cycling8/400/300 (Three ships on water)
                            - https://picsum.photos/seed/exercise7/400/300 (Mountain ridge against sky)
                            - https://picsum.photos/seed/cycling9/400/300 (Misty lake landscape)
                            - https://picsum.photos/seed/running5/400/300 (Village near mountains)
                            - https://picsum.photos/seed/exercise8/400/300 (Forest trees silhouette)
                            - https://picsum.photos/seed/cycling10/400/300 (Rocky coast and ocean)
                            - https://picsum.photos/seed/exercise9/400/300 (Nature landscape)
                            - https://picsum.photos/seed/running6/400/300 (Houses near rocky coast)
                            - https://picsum.photos/seed/cycling11/400/300 (Twilight desert dunes)
                            - https://picsum.photos/seed/exercise10/400/300 (Computer desk setup)
                            - https://picsum.photos/seed/cycling12/400/300 (Blonde woman portrait)
                            - https://picsum.photos/seed/running7/400/300 (City aerial view)

                            Do not wrap in markdown code blocks. Just raw JSON.
                            `,
						},
						{
							role: "user",
							content: contentToCreate,
						},
					],
				}),
			});
			const res = await response.json();
			let content = res.content;
			// Clean up potential markdown code blocks if the model ignores instruction
			if (content.startsWith("```json")) {
				content = content.replace(/^```json/, "").replace(/```$/, "");
			} else if (content.startsWith("```")) {
				content = content.replace(/^```/, "").replace(/```$/, "");
			}

			const parsed = JSON.parse(content);
			const newId = onAddVariation(parsed);
			if (newId) {
				onSelectVariation(newId);
				setStep("analyze");
				setAnalysis(null);
				setUserInput("");
				setSimple(true);
			}
		} catch (e) {
			console.error("Failed to generate variation", e);
			setStep("result"); // Go back to result on error so user can retry
		}
	};

	const handleAnalyze = async () => {
		if (!currentVariation) return;
		setStep("analyzing");
		setAnalysis(null);
		setSelectedSuggestions([]);

		try {
			const content = `User defined goal: 
${simple ? "none" : userInput}. 
			
Data structure: 
${JSON.stringify(currentVariation)}`;
			console.log("Analyzing content:", content);
			const response = await fetch("/api/llm", {
				method: "POST",
				headers: {"Content-Type": "application/json"},
				body: JSON.stringify({
					messages: [
						{
							role: "system",
							content:
								"You are a conversion rate optimization expert. Analyze the provided page content structure and suggest 3 specific improvements to increase conversion. Return ONLY a valid JSON array of objects with keys: 'id' (unique string), 'title' (short title), 'reason' (explanation). No markdown formatting.",
						},
						{
							role: "user",
							content: content,
						},
					],
				}),
			});
			const data = await response.json();
			let contentRes = data.content;
			if (contentRes.startsWith("```json")) {
				contentRes = contentRes.replace(/^```json/, "").replace(/```$/, "");
			} else if (contentRes.startsWith("```")) {
				contentRes = contentRes.replace(/^```/, "").replace(/```$/, "");
			}
			const parsed = JSON.parse(contentRes);
			setAnalysis(parsed);
			setSelectedSuggestions(parsed.map((item: any) => item.id));
			setStep("result");
		} catch (e) {
			console.error(e);
			setStep("analyze"); // Go back to analyze on error
		}
	};

	const toggleSuggestion = (id: string) => {
		setSelectedSuggestions((prev) =>
			prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
		);
	};

	return (
		<Box className="overflow-hidden w-full relative h-full">
			<Box mt="16" mb="16">
				<Property title="Current Variation" description={currentVariation.name} />
			</Box>
			<div
				className="flex h-full w-[400%] transition-transform duration-300 ease-in-out"
				style={{
					transform:
						step === "analyze"
							? "translateX(0)"
							: step === "analyzing"
								? "translateX(-25%)"
								: step === "result"
									? "translateX(-50%)"
									: "translateX(-75%)",
				}}
			>
				{/* Step 1: Analyze */}
				<Box className="w-[25%] h-full p-4 overflow-y-auto">
					<Box display="block">
						<Heading level="4" mb="8">
							AI Analysis
						</Heading>
						{simple ? (
							<Card
								display="flex"
								flexDirection="row"
								justifyContent="space-between"
								alignItems="center"
								mb="16"
							>
								<Text>Unspecified analysis</Text>
								<Button size="sm" onClick={() => setSimple(false)}>
									Add a goal
								</Button>
							</Card>
						) : (
							<Field
								label="What should the new version focus on?"
								mt="8"
								mb="12"
								className="relative"
							>
								<Button
									aria-label="Close"
									size="sm"
									appearance="subtle"
									icon={<IconXmark size={16} />}
									className="!absolute right-2 top-8 z-10"
									onClick={() => setSimple(true)}
								/>
								<Textarea
									placeholder="e.g. More formal tone"
									value={userInput}
									onChange={(e) => setUserInput(e.target.value)}
								/>
							</Field>
						)}
						<Button
							appearance="primary-opal"
							icon={<IconSparkles />}
							onClick={handleAnalyze}
						>
							Analyze & Suggest Variation
						</Button>
					</Box>
				</Box>

				{/* Step 2: Analyzing (Loading) */}
				<Box className="w-[25%] p-4 flex flex-col items-center justify-center h-[200px]">
					<Spinner size="lg" />
					<Text mt="16" fontWeight="600">
						Analyzing content...
					</Text>
				</Box>

				{/* Step 3: Result */}
				<Box className="w-[25%] h-full p-4 overflow-y-auto">
					{analysis && (
						<>
							<Heading level="4" mb="8">
								Result
							</Heading>
							<Flex flexDirection="column" gap="4" mb="16">
								{analysis.map((item) => (
									<Card
										key={item.id}
										p="12"
										onClick={() => toggleSuggestion(item.id)}
										cursor="pointer"
										className="hover:fg.accent.default"
									>
										<Flex alignItems="start" gap="8">
											<Checkbox
												checked={selectedSuggestions.includes(item.id)}
												pointerEvents="none"
											/>
											<Box>
												<Text fontWeight="600" className="!-mt-0.5">
													{item.title}
												</Text>
												{selectedSuggestions.includes(item.id) && (
													<Text fontSize="sm" mt="8" color="fg.secondary">
														{item.reason}
													</Text>
												)}
											</Box>
										</Flex>
									</Card>
								))}
							</Flex>
							<Flex justifyContent="space-between">
								<Button
									icon={<IconArrowLeft />}
									onClick={() => {
										setStep("analyze");
										setUserInput("");
										setAnalysis(null);
									}}
								>
									Analyze again
								</Button>
								<Button
									appearance="primary-opal"
									onClick={handleCreateFromAnalysis}
									icon={<IconStack2 />}
									disabled={selectedSuggestions.length === 0}
								>
									Add Variation
								</Button>
							</Flex>
						</>
					)}
				</Box>

				{/* Step 4: Creating (Loading) */}
				<Box className="w-[25%] p-4 flex flex-col items-center justify-center h-[200px]">
					<Spinner size="lg" />
					<Text mt="16" fontWeight="600">
						Generating variation...
					</Text>
				</Box>
			</div>
		</Box>
	);
}
