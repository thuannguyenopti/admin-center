"use client";

import {
	Box,
	Heading,
	RadioGroup,
	Radio,
	Separator,
	Menu,
	MenuTrigger,
	MenuContent,
	Field,
	Alert,
} from "@optiaxiom/react";
import {Button} from "@/app/components/Button";
import {Flex} from "@/app/components/Flex";
import {Text} from "@/app/components/Text";
import {IconDots, IconGripVertical, IconPlus} from "@tabler/icons-react";
import {useState} from "react";
import Preview from "./Preview";
import {useParams} from "next/navigation";
import usePersistentState from "@/app/usePersistentState";
import {AlgorithmBestBet} from "@/app/db/initialData";
import {Aside} from "@/app/context/LayoutContext";

export default function OrderPage() {
	const params = useParams();
	const id = params.id as string;
	const [algorithmBestBets] = usePersistentState(`algorithm_best_bets_${id}`, []) as [
		AlgorithmBestBet[],
		any
	];

	const [method, setMethod] = useState("relevance");

	const rules = [
		{
			id: 1,
			type: "Text Boost",
			property: "title",
			description: "If there is a match on the property title, multiply the score by 3.",
		},
		{
			id: 2,
			type: "Text Boost",
			property: "author",
			description: "If there is a match on the property author, multiply the score by 5.",
		},
		{
			id: 3,
			type: "Date Boost",
			property: "publish date",
			description:
				"If there is a match on the property publish date, divide the score by 1+(publishDate.days*.01).",
		},
		{
			id: 4,
			type: "Audience Boost",
			property: "tbd",
			description: "If matching relevant content for audience, boost it...",
		},
	];

	return (
		<>
			<Box flex="1">
				<Heading
					level="4"
					mb="16"
				>
					Order
				</Heading>
				<Field label="Method">
					<RadioGroup
						value={method}
						onValueChange={setMethod}
					>
						<Radio
							value="relevance"
							description="Based on relevancy score and boost settings"
						>
							Relevance
						</Radio>
						<Radio
							value="semantic"
							description="Based on AI-powered semantic algorithm"
						>
							Semantic
						</Radio>
					</RadioGroup>
				</Field>
				{method === "semantic" ? null : (
					<>
						<Flex
							justifyContent="space-between"
							alignItems="center"
							mb="16"
							mt="32"
						>
							<Heading level="4">Rules</Heading>
							<Button
								icon={<IconPlus size={16} />}
								appearance="subtle"
							>
								Add Rule...
							</Button>
						</Flex>

						<Flex
							flexDirection="column"
							gap="12"
						>
							{rules.map((rule, index) => (
								<Box
									key={rule.id}
									p="16"
									border="1"
									borderColor="border.tertiary"
									rounded="sm"
									bg="bg.default"
								>
									<Flex
										gap="12"
										alignItems="start"
									>
										<Text color="fg.tertiary">
											<IconGripVertical size={20} />
										</Text>
										<Text
											color="fg.secondary"
											fontWeight="600"
											w="16"
										>
											{index + 1}
										</Text>
										<Box flex="1">
											<Flex
												gap="4"
												mb="4"
											>
												<Text fontWeight="600">{rule.type}:</Text>
												<Text
													color="fg.error"
													fontFamily="mono"
												>
													{rule.property}
												</Text>
											</Flex>
											<Text
												color="fg.secondary"
												fontSize="sm"
											>
												{rule.description}
											</Text>
										</Box>
										<Menu
											options={[
												{label: "Edit", execute: () => {}},
												{
													label: "Delete",
													intent: "danger",
													execute: () => {},
												},
											]}
										>
											<MenuTrigger
												appearance="subtle"
												icon={<IconDots size={16} />}
												size="sm"
												aria-label="edit"
											/>
											<MenuContent />
										</Menu>
									</Flex>
								</Box>
							))}
						</Flex>
					</>
				)}
			</Box>
			<Aside>
				<Preview algorithmBestBets={algorithmBestBets} />
			</Aside>
		</>
	);
}
