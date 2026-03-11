"use client";

import {useState, useEffect} from "react";
import {
	Box,
	Dialog,
	DialogContent,
	DialogHeader,
	DialogBody,
	DialogFooter,
	DialogClose,
	Field,
	Checkbox,
	Text,
	Heading,
	Disclosure,
	DisclosureContent,
	DisclosureTrigger,
} from "@optiaxiom/react";
import {Button} from "@/app/components/Button";
import {Input} from "@/app/components/Input";
import {OpalAction, availableAgents, PropertyType} from "./mockData";

interface OpalActionDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	action: OpalAction | null;
	onSave: (action: Omit<OpalAction, "id" | "modified">) => void;
}

export default function OpalActionDialog({
	open,
	onOpenChange,
	action,
	onSave,
}: OpalActionDialogProps) {
	const [name, setName] = useState("");
	const [enabled, setEnabled] = useState(true);
	const [helpText, setHelpText] = useState("");
	const [contextMenu, setContextMenu] = useState(false);
	const [improveButton, setImproveButton] = useState(false);
	const [assetPanel, setAssetPanel] = useState(false);
	const [propertyTypes, setPropertyTypes] = useState<string[]>([]);
	const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
	const [visibleAt, setVisibleAt] = useState<"Everyone" | "Editors" | "Administrators">(
		"Everyone"
	);

	// Reset form when dialog opens/closes or action changes
	useEffect(() => {
		if (action) {
			setName(action.name);
			setEnabled(action.enabled);
			setHelpText(action.helpText || "");
			setContextMenu(action.locations.toolbar.contextMenu);
			setImproveButton(action.locations.toolbar.improveButton);
			setAssetPanel(action.locations.assetPanel);
			setPropertyTypes(action.locations.propertyEditor.propertyTypes);
			setSelectedAgents(action.agents);
			setVisibleAt(action.visibleAt);
		} else {
			setName("");
			setEnabled(true);
			setHelpText("");
			setContextMenu(false);
			setImproveButton(false);
			setAssetPanel(false);
			setPropertyTypes([]);
			setSelectedAgents([]);
			setVisibleAt("Everyone");
		}
	}, [action, open]);

	const handleSave = () => {
		if (!name.trim()) return;

		onSave({
			name: name.trim(),
			enabled,
			helpText: helpText.trim() || undefined,
			locations: {
				toolbar: {
					contextMenu,
					improveButton,
				},
				assetPanel,
				propertyEditor: {
					enabled: propertyTypes.length > 0,
					propertyTypes: propertyTypes as PropertyType[],
				},
			},
			agents: selectedAgents,
			visibleAt,
		});
	};

	const toggleAgent = (agentId: string) => {
		setSelectedAgents((prev) =>
			prev.includes(agentId) ? prev.filter((id) => id !== agentId) : [...prev, agentId]
		);
	};

	// Group agents by category
	const agentsByCategory = availableAgents.reduce(
		(acc, agent) => {
			if (!acc[agent.category]) {
				acc[agent.category] = [];
			}
			acc[agent.category].push(agent);
			return acc;
		},
		{} as Record<string, typeof availableAgents>
	);

	const getLocationCount = () => {
		let count = 0;
		if (contextMenu || improveButton) count++;
		if (assetPanel) count++;
		if (propertyTypes.length > 0) count++;
		return count;
	};

	const togglePropertyType = (type: string) => {
		setPropertyTypes((prev) =>
			prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
		);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent size="lg" style={{maxWidth: "1156px", height: "calc(100vh - 128px)", maxHeight: "800px", margin: "auto"}}>
				<DialogHeader>{action ? "Edit Opal Action" : "Add Opal Action"}</DialogHeader>
				<DialogBody>
					<Box display="flex" gap="24">
						{/* Left Column - Basic Info */}
						<Box display="flex" flexDirection="column" gap="16" flex="1" pr="24" borderR="1" borderColor="border.secondary">
							<Heading level="4">Basic Information</Heading>

							{/* Name field */}
							<Field label="Name" required>
								<Input
									placeholder="e.g. GEO Optimization"
									value={name}
									onChange={(e) => setName(e.target.value)}
								/>
							</Field>

							{/* Enabled checkbox */}
							<Checkbox checked={enabled} onCheckedChange={(checked) => setEnabled(!!checked)}>
								Enabled
							</Checkbox>

							{/* Help Text field */}
							<Field label="Help Text" description="Optional description shown to users">
								<Input
									placeholder="e.g. Improve your content for search engines"
									value={helpText}
									onChange={(e) => setHelpText(e.target.value)}
								/>
							</Field>
						</Box>

						{/* Middle Column - Locations */}
						<Box display="flex" flexDirection="column" gap="0" flex="1" pr="24" borderR="1" borderColor="border.secondary">
							<Heading level="4"  mb="16">Location(s)</Heading>
							<Text fontSize="sm" color="fg.secondary" mb="16">
								Choose where this Opal Action CTA should appear ({getLocationCount()}{" "}
								location(s) selected)
							</Text>

						{/* Locations section */}
							{/* Visual diagram */}
							<Box
								mb="12"
								display="flex"
								alignItems="center"
								justifyContent="center"
							>
								<svg
									width="359"
									height="258"
									viewBox="0 0 359 258"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
									style={{maxWidth: "100%", height: "auto"}}
								>
									<mask id="path-1-inside-1" fill="white">
										<path d="M0 10C0 4.47716 4.47715 0 10 0H349C354.523 0 359 4.47715 359 10V248C359 253.523 354.523 258 349 258H10C4.47715 258 0 253.523 0 248V10Z" />
									</mask>
									<path
										d="M0 10C0 4.47716 4.47715 0 10 0H349C354.523 0 359 4.47715 359 10V248C359 253.523 354.523 258 349 258H10C4.47715 258 0 253.523 0 248V10Z"
										fill="#F9FAFC"
									/>
									<path
										d="M10 0V1H349V0V-1H10V0ZM359 10H358V248H359H360V10H359ZM349 258V257H10V258V259H349V258ZM0 248H1V10H0H-1V248H0ZM10 258V257C5.02944 257 1 252.971 1 248H0H-1C-1 254.075 3.92487 259 10 259V258ZM359 248H358C358 252.971 353.971 257 349 257V258V259C355.075 259 360 254.075 360 248H359ZM349 0V1C353.971 1 358 5.02944 358 10H359H360C360 3.92487 355.075 -1 349 -1V0ZM10 0V-1C3.92487 -1 -1 3.92487 -1 10H0H1C1 5.02944 5.02944 1 10 1V0Z"
										fill="#E9EDF5"
										mask="url(#path-1-inside-1)"
									/>
									<mask id="path-3-inside-2" fill="white">
										<path d="M1 1H358V37H1V1Z" />
									</mask>
									<path d="M1 1H358V37H1V1Z" fill="white" />
									<path
										d="M358 37V36H1V37V38H358V37Z"
										fill="#E9EDF5"
										mask="url(#path-3-inside-2)"
									/>
									<path
										d="M13 13.5C13 11.8431 14.3431 10.5 16 10.5H26C27.6569 10.5 29 11.8431 29 13.5V23.5C29 25.1569 27.6569 26.5 26 26.5H16C14.3431 26.5 13 25.1569 13 23.5V13.5Z"
										fill="url(#paint0_linear)"
									/>
									<path
										d="M37 18.5C37 16.2909 38.7909 14.5 41 14.5H81C83.2091 14.5 85 16.2909 85 18.5C85 20.7091 83.2091 22.5 81 22.5H41C38.7909 22.5 37 20.7091 37 18.5Z"
										fill="#DDE0E8"
									/>
									<path
										d="M93 18.5C93 16.2909 94.7909 14.5 97 14.5H121C123.209 14.5 125 16.2909 125 18.5C125 20.7091 123.209 22.5 121 22.5H97C94.7909 22.5 93 20.7091 93 18.5Z"
										fill="#DDE0E8"
									/>
									<path
										d="M290 18.5C290 16.2909 291.791 14.5 294 14.5H326C328.209 14.5 330 16.2909 330 18.5C330 20.7091 328.209 22.5 326 22.5H294C291.791 22.5 290 20.7091 290 18.5Z"
										fill="#DDE0E8"
									/>
									<path
										d="M334 18.5C334 15.1863 336.686 12.5 340 12.5C343.314 12.5 346 15.1863 346 18.5C346 21.8137 343.314 24.5 340 24.5C336.686 24.5 334 21.8137 334 18.5Z"
										fill="#DDE0E8"
									/>
									<mask id="path-10-inside-3" fill="white">
										<path d="M1 37H41V257H1V37Z" />
									</mask>
									<path d="M1 37H41V257H1V37Z" fill="white" />
									<path
										d="M41 37H40V257H41H42V37H41Z"
										fill="#E9EDF5"
										mask="url(#path-10-inside-3)"
									/>
									<path
										d="M12.5 52C12.5 50.3431 13.8431 49 15.5 49H25.5C27.1569 49 28.5 50.3431 28.5 52V62C28.5 63.6569 27.1569 65 25.5 65H15.5C13.8431 65 12.5 63.6569 12.5 62V52Z"
										fill="#F0F1F4"
									/>
									<path
										d="M12.5 76C12.5 74.3431 13.8431 73 15.5 73H25.5C27.1569 73 28.5 74.3431 28.5 76V86C28.5 87.6569 27.1569 89 25.5 89H15.5C13.8431 89 12.5 87.6569 12.5 86V76Z"
										fill="#F0F1F4"
									/>
									<path
										d="M12.5 100C12.5 98.3431 13.8431 97 15.5 97H25.5C27.1569 97 28.5 98.3431 28.5 100V110C28.5 111.657 27.1569 113 25.5 113H15.5C13.8431 113 12.5 111.657 12.5 110V100Z"
										fill="#F0F1F4"
									/>
									<path
										d="M12.5 124C12.5 122.343 13.8431 121 15.5 121H25.5C27.1569 121 28.5 122.343 28.5 124V134C28.5 135.657 27.1569 137 25.5 137H15.5C13.8431 137 12.5 135.657 12.5 134V124Z"
										fill="#F0F3FF"
									/>
									<path
										d="M12.5 148C12.5 146.343 13.8431 145 15.5 145H25.5C27.1569 145 28.5 146.343 28.5 148V158C28.5 159.657 27.1569 161 25.5 161H15.5C13.8431 161 12.5 159.657 12.5 158V148Z"
										fill="#F0F1F4"
									/>
									<mask id="path-17-inside-4" fill="white">
										<path d="M41 37H131V257H41V37Z" />
									</mask>
									<path d="M41 37H131V257H41V37Z" fill="white" />
									<path
										d="M131 37H130V257H131H132V37H131Z"
										fill="#E9EDF5"
										mask="url(#path-17-inside-4)"
									/>
									<path
										d="M49 49C49 46.7909 50.7909 45 53 45H101C103.209 45 105 46.7909 105 49V51C105 53.2091 103.209 55 101 55H53C50.7909 55 49 53.2091 49 51V49Z"
										fill="#DDE0E8"
									/>
									<path
										d="M55 73C55 71.3431 56.3431 70 58 70H113C114.657 70 116 71.3431 116 73C116 74.6569 114.657 76 113 76H58C56.3431 76 55 74.6569 55 73Z"
										fill="#E2E5ED"
									/>
									<path
										d="M55 97C55 95.3431 56.3431 94 58 94H113C114.657 94 116 95.3431 116 97C116 98.6569 114.657 100 113 100H58C56.3431 100 55 98.6569 55 97Z"
										fill="#E2E5ED"
									/>
									<path
										d="M55 121C55 119.343 56.3431 118 58 118H113C114.657 118 116 119.343 116 121C116 122.657 114.657 124 113 124H58C56.3431 124 55 122.657 55 121Z"
										fill="#E2E5ED"
									/>
									<path
										d="M55 145C55 143.343 56.3431 142 58 142H113C114.657 142 116 143.343 116 145C116 146.657 114.657 148 113 148H58C56.3431 148 55 146.657 55 145Z"
										fill="#E2E5ED"
									/>
									<path
										d="M49 162C49 160.343 50.3431 159 52 159H119C120.657 159 122 160.343 122 162V176C122 177.657 120.657 179 119 179H52C50.3431 179 49 177.657 49 176V162Z"
										fill="#F0F3FF"
									/>
									<path
										d="M55 169C55 167.343 56.3431 166 58 166H113C114.657 166 116 167.343 116 169C116 170.657 114.657 172 113 172H58C56.3431 172 55 170.657 55 169Z"
										fill="#0037FF"
										fillOpacity="0.2"
									/>
									<rect width="147" height="182" transform="translate(131 75)" fill="#F9FAFC" />
									<path
										d="M143 91C143 88.7909 144.791 87 147 87H231.25C233.459 87 235.25 88.7909 235.25 91C235.25 93.2091 233.459 95 231.25 95H147C144.791 95 143 93.2091 143 91Z"
										fill="#DDE0E8"
									/>
									<path
										d="M143 106C143 104.343 144.343 103 146 103H263C264.657 103 266 104.343 266 106C266 107.657 264.657 109 263 109H146C144.343 109 143 107.657 143 106Z"
										fill="#E8EAF0"
									/>
									<path
										d="M143 120C143 118.343 144.343 117 146 117H242.5C244.157 117 245.5 118.343 245.5 120C245.5 121.657 244.157 123 242.5 123H146C144.343 123 143 121.657 143 120Z"
										fill="#E8EAF0"
									/>
									<path
										d="M143 134C143 132.343 144.343 131 146 131H222C223.657 131 225 132.343 225 134C225 135.657 223.657 137 222 137H146C144.343 137 143 135.657 143 134Z"
										fill="#E8EAF0"
									/>
									<path
										d="M143 153C143 150.791 144.791 149 147 149H262C264.209 149 266 150.791 266 153V193C266 195.209 264.209 197 262 197H147C144.791 197 143 195.209 143 193V153Z"
										fill="#E8EAF0"
									/>
									<path
										d="M143 208C143 206.343 144.343 205 146 205H263C264.657 205 266 206.343 266 208C266 209.657 264.657 211 263 211H146C144.343 211 143 209.657 143 208Z"
										fill="#E8EAF0"
									/>
									<path
										d="M143 222C143 220.343 144.343 219 146 219H238.398C240.055 219 241.398 220.343 241.398 222C241.398 223.657 240.055 225 238.398 225H146C144.343 225 143 223.657 143 222Z"
										fill="#E8EAF0"
									/>
									{/* Property Editor blue circle indicators when selected */}
									{propertyTypes.length > 0 && (
										<>
											<circle cx="268" cy="106" r="3" fill="#0037FF" />
											<circle cx="268" cy="120" r="3" fill="#0037FF" />
											<circle cx="268" cy="208" r="3" fill="#0037FF" />
										</>
									)}
									{/* Asset Panel */}
									<mask id="path-37-inside-5" fill="white">
										<path d="M278 75H358V257H278V75Z" />
									</mask>
									<path d="M278 75H358V257H278V75Z" fill="white" />
									<path
										d="M278 257H279V75H278H277V257H278Z"
										fill="#E9EDF5"
										mask="url(#path-37-inside-5)"
									/>
									<path
										d="M287 86C287 84.3431 288.343 83 290 83H347C348.657 83 350 84.3431 350 86C350 87.6569 348.657 89 347 89H290C288.343 89 287 87.6569 287 86Z"
										fill="#DDE0E8"
									/>
									<path
										d="M287 101C287 98.7909 288.791 97 291 97H346C348.209 97 350 98.7909 350 101V117C350 119.209 348.209 121 346 121H291C288.791 121 287 119.209 287 117V101Z"
										fill="#F0F1F4"
									/>
									<path
										d="M287 132C287 130.343 288.343 129 290 129H347C348.657 129 350 130.343 350 132C350 133.657 348.657 135 347 135H290C288.343 135 287 133.657 287 132Z"
										fill="#DDE0E8"
									/>
									<path
										d="M287 147C287 144.791 288.791 143 291 143H346C348.209 143 350 147V163C350 165.209 348.209 167 346 167H291C288.791 167 287 165.209 287 163V147Z"
										fill="#F0F1F4"
									/>
									{/* Asset Panel blue border when selected */}
									{assetPanel && (
										<rect
											x="279"
											y="76"
											width="78"
											height="180"
											fill="none"
											stroke="#0037FF"
											strokeWidth="2"
											style={{transition: "opacity 0.3s ease"}}
										/>
									)}
									{/* Asset Panel blue circle indicator when selected */}
									{assetPanel && (
										<circle
											cx="318"
											cy="85"
											r="4"
											fill="#0037FF"
											style={{transition: "opacity 0.3s ease"}}
										/>
									)}
									{/* Toolbar */}
									<mask id="path-43-inside-6" fill="white">
										<path d="M131 37H358V75H131V37Z" />
									</mask>
									<path d="M131 37H358V75H131V37Z" fill="white" />
									<path
										d="M358 75V74H131V75V76H358V75Z"
										fill="#E9EDF5"
										mask="url(#path-43-inside-6)"
									/>
									<path
										d="M143 55.5C143 53.2909 144.791 51.5 147 51.5H219C221.209 51.5 223 53.2909 223 55.5C223 57.7091 221.209 59.5 219 59.5H147C144.791 59.5 143 57.7091 143 55.5Z"
										fill="#DDE0E8"
									/>
									{/* Improve Button */}
									<path
										d="M278 49.5C278 47.2909 279.791 45.5 282 45.5H294C296.209 45.5 298 47.2909 298 49.5V61.5C298 63.7091 296.209 65.5 294 65.5H282C279.791 65.5 278 63.7091 278 61.5V49.5Z"
										fill="#F0F1F4"
									/>
									{/* Improve Button blue circle indicator when selected */}
									{improveButton && (
										<circle
											cx="288"
											cy="55.5"
											r="4"
											fill="#0037FF"
											style={{transition: "opacity 0.3s ease"}}
										/>
									)}
									<path
										d="M302 49.5C302 47.2909 303.791 45.5 306 45.5H318C320.209 45.5 322 47.2909 322 49.5V61.5C322 63.7091 320.209 65.5 318 65.5H306C303.791 65.5 302 63.7091 302 61.5V49.5Z"
										fill="#F0F1F4"
									/>
									{/* Context Menu button (three dots) */}
									<path
										d="M326 49.5C326 47.2909 327.791 45.5 330 45.5H342C344.209 45.5 346 47.2909 346 49.5V61.5C346 63.7091 344.209 65.5 342 65.5H330C327.791 65.5 326 63.7091 326 61.5V49.5Z"
										fill="#F0F1F4"
									/>
									{/* Context Menu blue circle indicator when selected */}
									{contextMenu && (
										<circle
											cx="336"
											cy="55.5"
											r="4"
											fill="#0037FF"
											style={{transition: "opacity 0.3s ease"}}
										/>
									)}
									{/* Toolbar blue border when any toolbar location is selected */}
									{(contextMenu || improveButton) && (
										<rect
											x="132"
											y="38"
											width="225"
											height="36"
											fill="none"
											stroke="#0037FF"
											strokeWidth="2"
											style={{transition: "opacity 0.3s ease"}}
										/>
									)}
									<defs>
										<linearGradient
											id="paint0_linear"
											x1="21"
											y1="10.5"
											x2="21"
											y2="26.5"
											gradientUnits="userSpaceOnUse"
										>
											<stop stopColor="#3BE081" />
											<stop offset="0.5" stopColor="#00CCFF" />
											<stop offset="1" stopColor="#861DFF" />
										</linearGradient>
									</defs>
								</svg>
							</Box>

							{/* Toolbar section */}
							<Disclosure defaultOpen mb="0">
								<DisclosureTrigger>
									<Box display="flex" alignItems="center" gap="8">
										<Text fontWeight="500">Toolbar</Text>
										<Text fontSize="sm" color="fg.secondary">
											{contextMenu || improveButton ? "2 locations" : "0 locations"}
										</Text>
									</Box>
								</DisclosureTrigger>
								<DisclosureContent display="flex" flexDirection="column" gap="8">
									<Checkbox
										checked={contextMenu}
										onCheckedChange={(checked) => setContextMenu(!!checked)}
									>
										Context Menu
									</Checkbox>
									<Checkbox
										checked={improveButton}
										onCheckedChange={(checked) => setImproveButton(!!checked)}
									>
										Improve Button
									</Checkbox>
								</DisclosureContent>
							</Disclosure>

							{/* Asset Panel section */}
							<Disclosure mb="0">
								<DisclosureTrigger>
									<Box display="flex" alignItems="center" gap="8">
										<Text fontWeight="500">Asset panel</Text>
										<Text fontSize="sm" color="fg.secondary">
											{assetPanel ? "3 locations" : "0 locations"}
										</Text>
									</Box>
								</DisclosureTrigger>
								<DisclosureContent>
									<Checkbox
										checked={assetPanel}
										onCheckedChange={(checked) => setAssetPanel(!!checked)}
									>
										Show in Asset Panel
									</Checkbox>
								</DisclosureContent>
							</Disclosure>

							{/* Property Editor section */}
							<Disclosure>
									<DisclosureTrigger>
										<Box display="flex" alignItems="center" gap="8">
											<Text fontWeight="500">Properties</Text>
											<Text fontSize="sm" color="fg.secondary">
												{propertyTypes.length > 0
													? `${propertyTypes.length} type(s)`
													: "0 types"}
											</Text>
										</Box>
									</DisclosureTrigger>
									<DisclosureContent display="flex" flexDirection="column" gap="12">
										<Text fontSize="sm" color="fg.secondary" mb="8">
											Select which property types show this action
										</Text>
										<Box display="flex" flexDirection="column" gap="8">
													{/* Text types */}
													<Box>
														<Text fontSize="xs" fontWeight="500" color="fg.secondary" mb="4">
															Text
														</Text>
														<Box display="flex" flexDirection="column" gap="4" pl="8">
															<Checkbox
																checked={propertyTypes.includes("String")}
																onCheckedChange={() => togglePropertyType("String")}
															>
																String (≤255)
															</Checkbox>
															<Checkbox
																checked={propertyTypes.includes("LongString")}
																onCheckedChange={() => togglePropertyType("LongString")}
															>
																String ({">"}255)
															</Checkbox>
															<Checkbox
																checked={propertyTypes.includes("XhtmlString")}
																onCheckedChange={() => togglePropertyType("XhtmlString")}
															>
																XHTML String
															</Checkbox>
														</Box>
													</Box>

													{/* Number types */}
													<Box>
														<Text fontSize="xs" fontWeight="500" color="fg.secondary" mb="4">
															Number
														</Text>
														<Box display="flex" flexDirection="column" gap="4" pl="8">
															<Checkbox
																checked={propertyTypes.includes("Int")}
																onCheckedChange={() => togglePropertyType("Int")}
															>
																Integer
															</Checkbox>
															<Checkbox
																checked={propertyTypes.includes("Double")}
																onCheckedChange={() => togglePropertyType("Double")}
															>
																Decimal
															</Checkbox>
														</Box>
													</Box>

													{/* Boolean */}
													<Box>
														<Text fontSize="xs" fontWeight="500" color="fg.secondary" mb="4">
															Boolean
														</Text>
														<Box display="flex" flexDirection="column" gap="4" pl="8">
															<Checkbox
																checked={propertyTypes.includes("Boolean")}
																onCheckedChange={() => togglePropertyType("Boolean")}
															>
																Boolean
															</Checkbox>
														</Box>
													</Box>

													{/* Date/Time */}
													<Box>
														<Text fontSize="xs" fontWeight="500" color="fg.secondary" mb="4">
															Date/Time
														</Text>
														<Box display="flex" flexDirection="column" gap="4" pl="8">
															<Checkbox
																checked={propertyTypes.includes("DateTime")}
																onCheckedChange={() => togglePropertyType("DateTime")}
															>
																Date/Time
															</Checkbox>
														</Box>
													</Box>

													{/* Reference types */}
													<Box>
														<Text fontSize="xs" fontWeight="500" color="fg.secondary" mb="4">
															Reference
														</Text>
														<Box display="flex" flexDirection="column" gap="4" pl="8">
															<Checkbox
																checked={propertyTypes.includes("ContentReference")}
																onCheckedChange={() => togglePropertyType("ContentReference")}
															>
																Content Reference
															</Checkbox>
															<Checkbox
																checked={propertyTypes.includes("PageReference")}
																onCheckedChange={() => togglePropertyType("PageReference")}
															>
																Page Reference
															</Checkbox>
															<Checkbox
																checked={propertyTypes.includes("ImageReference")}
																onCheckedChange={() => togglePropertyType("ImageReference")}
															>
																Image Reference
															</Checkbox>
															<Checkbox
																checked={propertyTypes.includes("VideoReference")}
																onCheckedChange={() => togglePropertyType("VideoReference")}
															>
																Video Reference
															</Checkbox>
															<Checkbox
																checked={propertyTypes.includes("Url")}
																onCheckedChange={() => togglePropertyType("Url")}
															>
																URL
															</Checkbox>
														</Box>
													</Box>

													{/* Selection types */}
													<Box>
														<Text fontSize="xs" fontWeight="500" color="fg.secondary" mb="4">
															Selection
														</Text>
														<Box display="flex" flexDirection="column" gap="4" pl="8">
															<Checkbox
																checked={propertyTypes.includes("SelectOne")}
																onCheckedChange={() => togglePropertyType("SelectOne")}
															>
																Selection (single)
															</Checkbox>
															<Checkbox
																checked={propertyTypes.includes("SelectMany")}
																onCheckedChange={() => togglePropertyType("SelectMany")}
															>
																Selection (multiple)
															</Checkbox>
														</Box>
													</Box>

													{/* Content types */}
													<Box>
														<Text fontSize="xs" fontWeight="500" color="fg.secondary" mb="4">
															Content
														</Text>
														<Box display="flex" flexDirection="column" gap="4" pl="8">
															<Checkbox
																checked={propertyTypes.includes("ContentArea")}
																onCheckedChange={() => togglePropertyType("ContentArea")}
															>
																Content Area
															</Checkbox>
															<Checkbox
																checked={propertyTypes.includes("LinkItemCollection")}
																onCheckedChange={() => togglePropertyType("LinkItemCollection")}
															>
																Link Collection
															</Checkbox>
														</Box>
													</Box>
												</Box>
									</DisclosureContent>
							</Disclosure>
						</Box>

						{/* Right Column - Agents */}
						<Box display="flex" flexDirection="column" gap="16" flex="1">
							<Heading level="4">Agent(s)</Heading>
							<Text fontSize="sm" color="fg.secondary">
								Select the agents to include in this action
							</Text>

							{Object.entries(agentsByCategory).map(([category, agents]) => {
								const selectedCount = agents.filter((a) =>
									selectedAgents.includes(a.id)
								).length;
								return (
									<Box key={category} mb="12">
										<Box
											display="flex"
											alignItems="center"
											gap="8"
											mb="8"
											pb="4"
											borderB="1"
											borderColor="border.tertiary"
										>
											<Text fontWeight="500" fontSize="sm">
												{category}
											</Text>
											<Text fontSize="sm" color="fg.secondary">
												{selectedCount} of {agents.length} agent(s)
											</Text>
										</Box>
										<Box display="flex" flexDirection="column" gap="8" pl="8">
											{agents.map((agent) => (
												<Checkbox
													key={agent.id}
													checked={selectedAgents.includes(agent.id)}
													onCheckedChange={() => toggleAgent(agent.id)}
												>
													{agent.name}
												</Checkbox>
											))}
										</Box>
									</Box>
								);
							})}
						</Box>
					</Box>
				</DialogBody>
				<DialogFooter>
					<DialogClose appearance="subtle">Cancel</DialogClose>
					<Button appearance="primary" onClick={handleSave} disabled={!name.trim()}>
						{action ? "Save" : "Create"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
