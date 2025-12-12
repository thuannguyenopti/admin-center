import AbstractDialog from "@/app/components/AbstractDialog";
import {Field} from "@optiaxiom/react";
import {Input} from "@/app/components/Input";
import {Flex} from "@/app/components/Flex";
import {useState, useEffect} from "react";

interface AutocompletePhraseDialogProps {
	open: boolean;
	setOpen: (open: boolean) => void;
	mode: "create" | "edit";
	initialData?: {
		phrase: string;
	};
	onSave: (data: {phrase: string}) => void;
}

export default function AutocompletePhraseDialog({
	open,
	setOpen,
	mode,
	initialData,
	onSave,
}: AutocompletePhraseDialogProps) {
	const [phrase, setPhrase] = useState("");

	useEffect(() => {
		if (open) {
			if (mode === "edit" && initialData) {
				setPhrase(initialData.phrase || "");
			} else if (mode === "create") {
				setPhrase("");
			}
		}
	}, [open, initialData, mode]);

	const handleSave = () => {
		onSave({
			phrase,
		});
		setOpen(false);
	};

	return (
		<AbstractDialog
			title={mode === "create" ? "Create Autocomplete Phrase" : "Edit Autocomplete Phrase"}
			description={
				mode === "create"
					? "Add a new autocomplete phrase."
					: "Edit the autocomplete phrase."
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
					label="Phrase"
					required
				>
					<Input
						value={phrase}
						onChange={(e) => setPhrase(e.target.value)}
						placeholder="e.g. running shoes for men"
					/>
				</Field>
			</Flex>
		</AbstractDialog>
	);
}
