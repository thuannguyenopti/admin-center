import AbstractDialog from "@/app/components/AbstractDialog";
import {Box, Field, Textarea, tokens} from "@optiaxiom/react";
import {Input} from "@/app/components/Input";
import {Flex} from "@/app/components/Flex";
import {useState, useEffect} from "react";
import {Button} from "@/app/components/Button";
import {IconSparkles, IconSettings} from "@tabler/icons-react";

interface RelatedQueryDialogProps {
	open: boolean;
	setOpen: (open: boolean) => void;
	mode: "create" | "edit";
	initialData?: {
		query: string;
		synonyms: string[];
	};
	onSave: (data: {query: string; synonyms: string[]}) => void;
}

export default function RelatedQueryDialog({
	open,
	setOpen,
	mode,
	initialData,
	onSave,
}: RelatedQueryDialogProps) {
	const [query, setQuery] = useState("");
	const [synonyms, setSynonyms] = useState("");
	const [isGenerating, setIsGenerating] = useState(false);

	useEffect(() => {
		if (open) {
			if (mode === "edit" && initialData) {
				setQuery(initialData.query || "");
				setSynonyms(initialData.synonyms.join(", ") || "");
			} else if (mode === "create") {
				setQuery("");
				setSynonyms("");
			}
		}
	}, [open, initialData, mode]);

	const handleGeneratePhrases = async () => {
		if (!query) return;

		setIsGenerating(true);
		try {
			const response = await fetch("/api/llm", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					messages: [
						{
							role: "user",
							content: `Generate 5 comma-separated synonyms or related search phrases for: "${query}". Return only the comma-separated list, no other text.`,
						},
					],
				}),
			});

			const data = await response.json();
			if (data.content) {
				const newSynonyms = data.content.replace(/\.$/, ""); // Remove trailing dot if any
				setSynonyms((prev) => {
					const current = prev ? prev.split(",").map((s) => s.trim()) : [];
					const incoming = newSynonyms.split(",").map((s: string) => s.trim());
					const combined = Array.from(new Set([...current, ...incoming]))
						.filter(Boolean)
						.join(", ");
					return combined;
				});
			}
		} catch (error) {
			console.error("Failed to generate phrases:", error);
		} finally {
			setIsGenerating(false);
		}
	};

	const handleSave = () => {
		onSave({
			query,
			synonyms: synonyms
				.split(",")
				.map((s) => s.trim())
				.filter(Boolean),
		});
		setOpen(false);
	};

	return (
		<AbstractDialog
			title={mode === "create" ? "Create Related Query" : "Edit Related Query"}
			description={
				mode === "create"
					? "Add a new related query mapping."
					: "Edit the related query mapping."
			}
			open={open}
			setOpen={setOpen}
			footerPrimaryText={mode === "create" ? "Create" : "Save Changes"}
			footerPrimaryAction={handleSave}
			footerAppearance="primary"
		>
			<Flex flexDirection="column" gap="16">
				<Field label="Query" required>
					<Input
						placeholder="e.g. sneakers"
						value={query}
						onChange={(e) => setQuery(e.target.value)}
					/>
				</Field>
				<Field label="Synonyms (comma separated)" required alignItems="start">
					<Textarea
						placeholder="e.g. shoes, trainers, kicks"
						value={synonyms}
						w="full"
						onChange={(e) => setSynonyms(e.target.value)}
					/>
					<Flex gap="8" alignItems="center">
						<Button
							size="md"
							icon={<IconSparkles size={16} />}
							onClick={handleGeneratePhrases}
							loading={isGenerating}
							disabled={!query}
						>
							Generate Phrases
						</Button>
					</Flex>
				</Field>
			</Flex>
		</AbstractDialog>
	);
}
