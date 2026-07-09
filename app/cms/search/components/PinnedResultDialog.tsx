import AbstractDialog from "@/app/components/AbstractDialog";
import {
	Field,
	Menu,
	MenuTrigger,
	MenuContent,
	LabelMenuButton,
	Switch,
	Textarea,
	Box,
} from "@optiaxiom/react";
import {Flex} from "@/app/components/Flex";
import {useState, useEffect} from "react";
import searchResults from "@/app/db/searchResults.json";
import {Button} from "@/app/components/Button";
import {IconFile, IconSparkles} from "@/app/lib/axiom-icons";

interface PinnedResultDialogProps {
	open: boolean;
	setOpen: (open: boolean) => void;
	mode: "create" | "edit";
	initialData?: {
		query: string;
		destination: string;
		status?: "Active" | "Inactive";
	};
	onSave: (data: {query: string; destination: string; status?: "Active" | "Inactive"}) => void;
	showStatus?: boolean;
}

export default function PinnedResultDialog({
	open,
	setOpen,
	mode,
	initialData,
	onSave,
	showStatus = false,
}: PinnedResultDialogProps) {
	const [query, setQuery] = useState("");
	const [destination, setDestination] = useState("");
	const [status, setStatus] = useState<"Active" | "Inactive">("Active");
	const [isGenerating, setIsGenerating] = useState(false);

	useEffect(() => {
		if (open) {
			if (mode === "edit" && initialData) {
				setQuery(initialData.query || "");
				setDestination(initialData.destination || "");
				if (initialData.status) setStatus(initialData.status);
			} else if (mode === "create") {
				setQuery(initialData?.query || "");
				setDestination(initialData?.destination || "");
				setStatus("Active");
			}
		}
	}, [open, initialData, mode]);

	const handleGeneratePhrases = async () => {
		const selectedDestination = searchResults.find((r) => r.url === destination);
		const seedText = query || selectedDestination?.title;

		if (!seedText) return;

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
							content: `Generate 5 comma-separated search phrases that should trigger a pinned result for: "${seedText}". Return only the comma-separated list, no other text.`,
						},
					],
				}),
			});

			const data = await response.json();
			if (data.content) {
				const newPhrases = data.content.replace(/\.$/, ""); // Remove trailing dot if any
				setQuery((prev) => {
					const current = prev ? prev.split(",").map((s) => s.trim()) : [];
					const incoming = newPhrases.split(",").map((s: string) => s.trim());
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
			destination,
			status: showStatus ? status : undefined,
		});
		setOpen(false);
	};

	return (
		<AbstractDialog
			title={mode === "create" ? "Create Pinned Result" : "Edit Pinned Result"}
			description={
				mode === "create"
					? "Add a new pinned result to direct users to specific destinations."
					: "Update the details of this pinned result."
			}
			open={open}
			setOpen={setOpen}
			footerPrimaryText={mode === "create" ? "Create" : "Save Changes"}
			footerPrimaryAction={handleSave}
			footerAppearance="primary"
		>
			<Flex flexDirection="column" gap="16">
				<Field label="Destination" required>
					<Menu
						options={
							searchResults?.map((r) => ({
								addon: <IconFile size={16} />,
								label: r?.title || "Unknown",
								execute: () => setDestination(r?.url || ""),
							})) || []
						}
					>
						<MenuTrigger size="lg">
							{destination ? (
								<Flex gap="8">
									<IconFile size={16} />{" "}
									{searchResults?.find((r) => r.url === destination)?.title ||
										destination}
								</Flex>
							) : (
								"Select Destination"
							)}
						</MenuTrigger>
						<MenuContent />
					</Menu>
				</Field>
				<Field label="Phrases" required>
					<Textarea
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder="e.g. return policy, returns"
					/>
					<Box>
						<Button
							size="md"
							icon={<IconSparkles />}
							onClick={handleGeneratePhrases}
							loading={isGenerating}
							disabled={!query && !destination}
						>
							Generate phrases
						</Button>
					</Box>
				</Field>
				{showStatus && (
					<Field label="Status" required>
						<Switch
							checked={status === "Active"}
							onCheckedChange={(checked) =>
								setStatus(checked ? "Active" : "Inactive")
							}
						>
							{status}
						</Switch>
					</Field>
				)}
			</Flex>
		</AbstractDialog>
	);
}
