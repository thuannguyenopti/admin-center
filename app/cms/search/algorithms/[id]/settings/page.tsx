"use client";

import {
	Box,
	Heading,
	Field,
	Select,
	SelectTrigger,
	SelectContent,
	Separator,
} from "@optiaxiom/react";
import {Button} from "@/app/components/Button";
import {Flex} from "@/app/components/Flex";
import {Input} from "@/app/components/Input";
import {useParams, useRouter} from "next/navigation";
import {useEffect, useState, use} from "react";
import usePersistentState from "@/app/usePersistentState";
import {Algorithm, initialAlgorithms, initialUsers} from "@/app/db/initialData.clean";
import {IconArrowLeft} from "@tabler/icons-react";
import {Aside} from "@/app/context/LayoutContext";
import Preview from "../order/Preview";

export default function EditAlgorithmPage() {
	const params = useParams();
	const router = useRouter();
	const resolvedParams = params instanceof Promise ? use(params) : params;
	const id = (resolvedParams?.id ?? "") as string;
	const [algorithms, setAlgorithms] = usePersistentState("algorithms", initialAlgorithms) as [
		Algorithm[],
		(val: Algorithm[]) => void
	];
	const [algorithm, setAlgorithm] = useState<Algorithm | null>(null);
	const [name, setName] = useState("");
	const [publishState, setPublishState] = useState("");
	const [owner, setOwner] = useState("");

	useEffect(() => {
		if (algorithms.length > 0) {
			const found = algorithms.find((a) => a.id === id);
			if (found) {
				setAlgorithm(found);
				setName(found.name);
				setPublishState(found.publishState);
				setOwner(found.owner);
			}
		}
	}, [algorithms, id]);

	const handleSave = () => {
		if (!algorithm) return;

		const updatedAlgorithms = algorithms.map((a) =>
			a.id === id ? {...a, name, publishState, owner} : a
		);
		setAlgorithms(updatedAlgorithms);
		router.push("/cms/search/algorithms");
	};

	if (!algorithm && algorithms.length > 0) {
		return <Box p="24">Algorithm not found</Box>;
	}

	if (!algorithm) {
		return <Box p="24">Loading...</Box>;
	}

	return (
		<>
			<Box maxW="lg">
				<Flex
					flexDirection="column"
					gap="16"
				>
					<Field
						label="Name"
						required
					>
						<Input
							value={name}
							onChange={(e) => setName(e.target.value)}
						/>
					</Field>

					<Field
						label="Publish State"
						required
					>
						<Select
							value={publishState}
							onValueChange={(val) => setPublishState(val)}
							options={[
								{label: "Draft", value: "Draft"},
								{label: "Testing", value: "Testing"},
								{label: "Published", value: "Published"},
								{label: "Archived", value: "Archived"},
							]}
						>
							<SelectTrigger size="lg">
								{publishState || "Select Publish State"}
							</SelectTrigger>
							<SelectContent />
						</Select>
					</Field>

					<Field
						label="Owner"
						required
					>
						<Select
							value={owner}
							onValueChange={(val) => setOwner(val)}
							options={initialUsers.map((u) => ({label: u.name, value: u.name}))}
						>
							<SelectTrigger size="lg">{owner || "Select Owner"}</SelectTrigger>
							<SelectContent />
						</Select>
					</Field>

					<Separator my="8" />

					<Flex
						flexDirection="row"
						justifyContent="flex-end"
						gap="8"
					>
						<Button
							appearance="subtle"
							size="lg"
							onClick={() => router.push("/cms/search/algorithms")}
						>
							Cancel
						</Button>
						<Button
							appearance="primary"
							size="lg"
							onClick={handleSave}
						>
							Save Changes
						</Button>
					</Flex>
				</Flex>
			</Box>
			<Aside>
				<Preview />
			</Aside>
		</>
	);
}
