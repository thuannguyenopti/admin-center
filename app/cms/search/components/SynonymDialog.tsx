import AbstractDialog from "@/app/components/AbstractDialog";
import {Field, Select, SelectTrigger, SelectContent, Textarea} from "@optiaxiom/react";
import {getSelectValueInOptions} from "@/utils/selectValue";
import {Input} from "@/app/components/Input";
import {Flex} from "@/app/components/Flex";
import {useState, useEffect} from "react";

interface SynonymDialogProps {
	open: boolean;
	setOpen: (open: boolean) => void;
	mode: "create" | "edit";
	initialData?: {
		term: string;
		synonyms: string[];
		type: "One-way" | "Two-way";
	};
	onSave: (data: {term: string; synonyms: string[]; type: "One-way" | "Two-way"}) => void;
}

export default function SynonymDialog({
	open,
	setOpen,
	mode,
	initialData,
	onSave,
}: SynonymDialogProps) {
	const [term, setTerm] = useState("");
	const [synonyms, setSynonyms] = useState("");
	const [type, setType] = useState<"One-way" | "Two-way">("Two-way");

	useEffect(() => {
		if (open) {
			if (mode === "edit" && initialData) {
				setTerm(initialData.term || "");
				setSynonyms(initialData.synonyms.join(", ") || "");
				setType(initialData.type || "Two-way");
			} else if (mode === "create") {
				setTerm("");
				setSynonyms("");
				setType("Two-way");
			}
		}
	}, [open, initialData, mode]);

	const handleSave = () => {
		onSave({
			term,
			synonyms: synonyms
				.split(",")
				.map((s) => s.trim())
				.filter(Boolean),
			type,
		});
		setOpen(false);
	};

	return (
		<AbstractDialog
			title={mode === "create" ? "Create Synonym" : "Edit Synonym"}
			description={
				mode === "create" ? "Add a new synonym mapping." : "Edit the synonym mapping."
			}
			open={open}
			setOpen={setOpen}
			footerPrimaryText={mode === "create" ? "Create" : "Save Changes"}
			footerPrimaryAction={handleSave}
			footerAppearance="primary"
		>
			<Flex
				flexDirection="column"
				gap="16"
			>
				<Field
					label="Term"
					required
				>
					<Input
						value={term}
						onChange={(e) => setTerm(e.target.value)}
						placeholder="e.g. trousers"
					/>
				</Field>
				<Field
					label="Synonyms"
					required
					description="Separate multiple synonyms with commas"
				>
					<Textarea
						value={synonyms}
						onChange={(e) => setSynonyms(e.target.value)}
						placeholder="e.g. pants, slacks"
					/>
				</Field>
				<Field
					label="Type"
					required
				>
					<Select
						value={getSelectValueInOptions(
							type,
							[
								{label: "Two-way (Equivalent)", value: "Two-way"},
								{label: "One-way (Expansion)", value: "One-way"},
							],
							"Two-way"
						)}
						onValueChange={(val) => setType(val as "One-way" | "Two-way")}
						options={[
							{label: "Two-way (Equivalent)", value: "Two-way"},
							{label: "One-way (Expansion)", value: "One-way"},
						]}
					>
						<SelectTrigger size="lg">
							{type === "Two-way" ? "Two-way (Equivalent)" : "One-way (Expansion)"}
						</SelectTrigger>
						<SelectContent />
					</Select>
				</Field>
			</Flex>
		</AbstractDialog>
	);
}
