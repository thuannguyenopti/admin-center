import AbstractDialog from "@/app/components/AbstractDialog";
import {Field, Select, SelectTrigger, SelectContent, Switch, Textarea} from "@optiaxiom/react";
import {Flex} from "@/app/components/Flex";
import {useState, useEffect} from "react";
import searchResults from "@/app/db/searchResults.json";

interface BestBetDialogProps {
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

export default function BestBetDialog({
	open,
	setOpen,
	mode,
	initialData,
	onSave,
	showStatus = false,
}: BestBetDialogProps) {
	const [query, setQuery] = useState("");
	const [destination, setDestination] = useState("");
	const [status, setStatus] = useState<"Active" | "Inactive">("Active");

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
			title={mode === "create" ? "Create Best Bet" : "Edit Best Bet"}
			description={
				mode === "create"
					? "Add a new best bet to direct users to specific destinations."
					: "Update the details of this best bet."
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
					label="Destination"
					required
				>
					<Select
						value={destination}
						onValueChange={setDestination}
						options={searchResults.map((r) => ({label: r.title, value: r.url}))}
					>
						<SelectTrigger size="lg">
							{destination
								? searchResults.find((r) => r.url === destination)?.title ||
								  destination
								: "Select Destination"}
						</SelectTrigger>
						<SelectContent />
					</Select>
				</Field>
				<Field
					label="Phrases"
					required
					description="Separate multiple phrases with commas"
				>
					<Textarea
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder="e.g. return policy, returns"
					/>
				</Field>
				{showStatus && (
					<Field
						label="Status"
						required
					>
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
