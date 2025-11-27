"use client";

import {Box, Button, Card, Flex, Input, Text, Heading} from "@optiaxiom/react";
import {IconPlus, IconSearch, IconSettings, IconTrash} from "@tabler/icons-react";
import {useState} from "react";

export default function OptimizeSearchPage() {
	const [synonyms, setSynonyms] = useState([
		{id: 1, term: "car", synonyms: "automobile, vehicle, auto"},
		{id: 2, term: "phone", synonyms: "mobile, cell, smartphone"},
	]);

	const [boostRules, setBoostRules] = useState([
		{id: 1, keyword: "sale", boost: "2x", field: "Title"},
		{id: 2, keyword: "new", boost: "1.5x", field: "Description"},
	]);

	return (
		<Box>
			<Flex
				flexDirection="row"
				justifyContent="space-between"
				mb="24"
			>
				<Box>
					<Text>Configure search behavior, synonyms, and ranking rules</Text>
				</Box>
				<Button
					size="lg"
					icon={<IconSettings size={16} />}
					appearance="primary"
				>
					Advanced Settings
				</Button>
			</Flex>

			{/* Search Configuration */}
			<Card mb="24">
				<Heading
					level="2"
					fontSize="lg"
				>
					Search Configuration
				</Heading>
				<Flex
					flexDirection="column"
					gap="16"
				>
					<Box>
						<Button appearance="subtle">Title</Button>
						<Button appearance="subtle">Description</Button>
						<Button appearance="subtle">Content</Button>
						<Button appearance="subtle">Tags</Button>
						<Button
							appearance="default"
							icon={<IconPlus size={14} />}
						>
							Add Field
						</Button>
					</Box>

					<Box>
						<Text
							fontSize="md"
							fontWeight="500"
							mb="8"
						>
							Minimum Match Score
						</Text>
						<Input
							type="number"
							defaultValue="0.5"
							w="224"
						/>
						<Text
							fontSize="sm"
							color="fg.secondary"
							mt="4"
						>
							Results below this threshold will be filtered out (0-1)
						</Text>
					</Box>
				</Flex>
			</Card>

			{/* Synonyms */}
			<Card mb="24">
				<Box p="16">
					<Flex
						flexDirection="row"
						justifyContent="space-between"
						alignItems="center"
						mb="16"
					>
						<Heading
							level="2"
							fontSize="lg"
						>
							Synonyms
						</Heading>
						<Button
							appearance="primary"
							icon={<IconPlus size={14} />}
						>
							Add Synonym
						</Button>
					</Flex>
					<Text
						fontSize="md"
						color="fg.secondary"
						mb="16"
					>
						Define synonym groups to improve search relevance
					</Text>

					<Flex
						flexDirection="column"
						gap="12"
					>
						{synonyms.map((item) => (
							<Card
								key={item.id}
								bg="bg.accent.subtle"
							>
								<Box p="12">
									<Flex
										gap="12"
										alignItems="start"
									>
										<Box flex="1">
											<Text
												fontSize="sm"
												fontWeight="500"
												color="fg.secondary"
												mb="4"
											>
												Term
											</Text>
											<Input defaultValue={item.term} />
										</Box>
										<Box
											flex="1"
											style={{flexGrow: 2}}
										>
											<Text
												fontSize="sm"
												fontWeight="500"
												color="fg.secondary"
												mb="4"
											>
												Synonyms (comma-separated)
											</Text>
											<Input defaultValue={item.synonyms} />
										</Box>
										<Button
											appearance="danger-outline"
											style={{marginTop: "26px"}}
											icon={<IconTrash size={14} />}
											aria-label="Delete synonym"
										/>
									</Flex>
								</Box>
							</Card>
						))}
					</Flex>
				</Box>
			</Card>

			{/* Boost Rules */}
			<Card>
				<Box p="16">
					<Flex
						flexDirection="row"
						justifyContent="space-between"
						alignItems="center"
						mb="16"
					>
						<Heading
							level="2"
							fontSize="lg"
						>
							Boost Rules
						</Heading>
						<Button
							appearance="primary"
							icon={<IconPlus size={14} />}
						>
							Add Rule
						</Button>
					</Flex>
					<Text
						fontSize="md"
						color="fg.secondary"
						mb="16"
					>
						Boost or demote results based on keywords and fields
					</Text>

					<Flex
						flexDirection="column"
						gap="12"
					>
						{boostRules.map((rule) => (
							<Card
								key={rule.id}
								bg="bg.accent.subtle"
							>
								<Box p="12">
									<Flex
										gap="12"
										alignItems="start"
									>
										<Box
											flex="1"
											style={{flexGrow: 2}}
										>
											<Text
												fontSize="sm"
												fontWeight="500"
												color="fg.secondary"
												mb="4"
											>
												Keyword
											</Text>
											<Input defaultValue={rule.keyword} />
										</Box>
										<Box flex="1">
											<Text
												fontSize="sm"
												fontWeight="500"
												color="fg.secondary"
												mb="4"
											>
												Boost Factor
											</Text>
											<Input defaultValue={rule.boost} />
										</Box>
										<Box flex="1">
											<Text
												fontSize="sm"
												fontWeight="500"
												color="fg.secondary"
												mb="4"
											>
												Field
											</Text>
											<Input defaultValue={rule.field} />
										</Box>
										<Button
											appearance="danger-outline"
											style={{marginTop: "26px"}}
											icon={<IconTrash size={14} />}
											aria-label="boost"
										/>
									</Flex>
								</Box>
							</Card>
						))}
					</Flex>
				</Box>
			</Card>

			{/* Save Section */}
			<Flex
				justifyContent="end"
				gap="12"
				mt="24"
			>
				<Button appearance="subtle">Reset to Defaults</Button>
				<Button appearance="primary">Save Changes</Button>
			</Flex>
		</Box>
	);
}
