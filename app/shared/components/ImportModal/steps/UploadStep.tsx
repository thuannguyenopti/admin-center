import {
	DialogHeader,
	DialogBody,
	DialogFooter,
	DialogClose,
	Box,
	Group,
	Button,
	Alert,
	Input,
	SegmentedControl,
	SegmentedControlItem,
} from "@optiaxiom/react";
import {Fragment} from "react";
import {Text} from "@/app/components/Text";
import {
	IconUpload,
	IconFile,
	IconXmark,
	IconFileTypeCsv,
	IconLink,
	IconApi,
	IconCircleExclamation,
} from "@/app/lib/axiom-icons";
import {
	BaseEntity,
	BaseFormRow,
	BaseParsedRow,
	ImportConfig,
	ImportSource,
	ValidationState,
} from "../types";
import {downloadTemplate} from "@/app/shared/utils/import";

interface UploadStepProps<
	TEntity extends BaseEntity,
	TFormRow extends BaseFormRow,
	TParsedRow extends BaseParsedRow<TEntity>,
> {
	config: ImportConfig<TEntity, TFormRow, TParsedRow>;
	importSource: ImportSource;
	onImportSourceChange: (source: ImportSource) => void;
	csvFile: File | null;
	urlInput: string;
	urlValidation: ValidationState;
	endpointInput: string;
	endpointValidation: ValidationState;
	isDragging: boolean;
	parseError: string | null;
	isLoading: boolean;
	canContinue: boolean;
	onContinue: () => void;
	fileHandlers: {
		handleFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
		handleDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
		handleDragLeave: (event: React.DragEvent<HTMLDivElement>) => void;
		handleDrop: (event: React.DragEvent<HTMLDivElement>) => void;
		handleRemoveFile: () => void;
		handleUrlChange: (value: string) => void;
		handleEndpointChange: (value: string) => void;
		triggerFileInput: () => void;
		fileInputRef: React.RefObject<HTMLInputElement | null>;
	};
}

export function UploadStep<
	TEntity extends BaseEntity,
	TFormRow extends BaseFormRow,
	TParsedRow extends BaseParsedRow<TEntity>,
>({
	config,
	importSource,
	onImportSourceChange,
	csvFile,
	urlInput,
	urlValidation,
	endpointInput,
	endpointValidation,
	isDragging,
	parseError,
	isLoading,
	canContinue,
	onContinue,
	fileHandlers,
}: UploadStepProps<TEntity, TFormRow, TParsedRow>) {
	const handleDownloadTemplate = () => {
		downloadTemplate(config.templateData, `${config.entityNamePlural}-template.csv`);
	};

	// Build field description for UI
	const requiredFields = ["name"];
	const optionalFields = config.csvHeaders.filter((h) => h !== "name");

	return (
		<>
			<DialogHeader>
				<Text fontSize="xl" fontWeight="600">
					Import {config.entityNamePlural}
				</Text>
			</DialogHeader>
			<DialogBody style={{flex: 1, minHeight: 0, overflowY: "auto"}}>
				<Group flexDirection="column" gap="24" w="full">
					<Text fontSize="md" maxW="full">
						Import multiple {config.entityNamePlural} from different sources. Preview
						your changes before confirming.
					</Text>

					{/* Import Source Selector */}
					<Group flexDirection="column" gap="12">
						<Text fontSize="sm" fontWeight="600">
							Import source
						</Text>
						<SegmentedControl
							value={importSource}
							onValueChange={(value: string) => {
								if (value) onImportSourceChange(value as ImportSource);
							}}
						>
							<SegmentedControlItem value="csv">
								<Group gap="8" alignItems="center">
									<IconFileTypeCsv size={16} />
									<Text>CSV File</Text>
								</Group>
							</SegmentedControlItem>
							<SegmentedControlItem value="url">
								<Group gap="8" alignItems="center">
									<IconLink size={16} />
									<Text>URL</Text>
								</Group>
							</SegmentedControlItem>
							<SegmentedControlItem value="endpoint">
								<Group gap="8" alignItems="center">
									<IconApi size={16} />
									<Text>API Endpoint</Text>
								</Group>
							</SegmentedControlItem>
						</SegmentedControl>
					</Group>

					{parseError && (
						<Alert intent="danger" rounded="md">
							<Group gap="8" alignItems="center">
								<IconCircleExclamation size={20} />
								<Text fontSize="sm">{parseError}</Text>
							</Group>
						</Alert>
					)}

					{/* CSV Upload UI */}
					{importSource === "csv" && (
						<>
							<Box
								onDragOver={fileHandlers.handleDragOver}
								onDragLeave={fileHandlers.handleDragLeave}
								onDrop={fileHandlers.handleDrop}
								onClick={csvFile ? undefined : fileHandlers.triggerFileInput}
								rounded="md"
								textAlign="center"
								transition="colors"
								style={{
									border: csvFile
										? "2px solid var(--ax-colors-border-success)"
										: isDragging
											? "2px dashed var(--ax-colors-border-focus)"
											: "2px dashed var(--ax-colors-border-secondary)",
									padding: "48px 24px",
									cursor: csvFile ? "default" : "pointer",
									backgroundColor: csvFile
										? "var(--ax-colors-bg-success-subtlest)"
										: isDragging
											? "var(--ax-colors-bg-secondary)"
											: "var(--ax-colors-bg-secondary)",
									position: "relative",
								}}
							>
								{csvFile && (
									<Box style={{position: "absolute", top: "12px", right: "12px"}}>
										<Button
											appearance="subtle"
											size="sm"
											onClick={(e: React.MouseEvent) => {
												e.stopPropagation();
												fileHandlers.handleRemoveFile();
											}}
											aria-label="Remove file"
										>
											<IconXmark size={16} />
										</Button>
									</Box>
								)}
								<Group flexDirection="column" alignItems="center" gap="12">
									{csvFile ? (
										<IconFile
											size={48}
											style={{color: "var(--ax-colors-fg-success)"}}
										/>
									) : (
										<IconUpload
											size={48}
											style={{color: "var(--ax-colors-fg-tertiary)"}}
										/>
									)}
									<Group flexDirection="column" alignItems="center" gap="4">
										<Text
											fontSize="lg"
											fontWeight="600"
											color={csvFile ? "fg.success" : "fg.default"}
										>
											{csvFile
												? csvFile.name
												: "Drag and drop your CSV file here"}
										</Text>
										<Text fontSize="sm" color="fg.secondary">
											{csvFile
												? "File ready to import"
												: "or click to browse your files"}
										</Text>
									</Group>
									{!csvFile ? (
										<Text fontSize="xs" color="fg.tertiary">
											CSV files only, maximum 10MB
										</Text>
									) : (
										<Button
											appearance="default"
											size="sm"
											onClick={fileHandlers.triggerFileInput}
										>
											Choose different file
										</Button>
									)}
								</Group>
							</Box>

							<input
								ref={fileHandlers.fileInputRef}
								type="file"
								accept=".csv,text/csv"
								onChange={fileHandlers.handleFileSelect}
								style={{display: "none"}}
							/>

							<Group
								alignItems="center"
								justifyContent="center"
								gap="12"
								flexWrap="wrap"
							>
								<Text fontSize="sm" color="fg.secondary">
									Your file needs:{" "}
									{requiredFields.map((field, i) => (
										<Text key={field} asChild fontWeight="600">
											<span>{field}</span>
										</Text>
									))}{" "}
									(required){optionalFields.length > 0 && ", "}
									{optionalFields.map((field, i) => (
										<Fragment key={field}>
											<Text asChild fontWeight="600">
												<span>{field}</span>
											</Text>
											{i < optionalFields.length - 1 && ", "}
										</Fragment>
									))}
									{optionalFields.length > 0 && " (optional)"}.
								</Text>
								<Button
									appearance="default"
									size="sm"
									onClick={handleDownloadTemplate}
								>
									Download template
								</Button>
							</Group>
						</>
					)}

					{/* URL Input UI */}
					{importSource === "url" && (
						<Group flexDirection="column" gap="12">
							<Group flexDirection="column" gap="8">
								<Text fontSize="sm" fontWeight="600">
									CSV URL
								</Text>
								<Group flexDirection="column" gap="4">
									<Input
										type="url"
										placeholder={`https://example.com/${config.entityNamePlural}.csv`}
										value={urlInput}
										onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
											fileHandlers.handleUrlChange(e.target.value)
										}
										style={{
											borderColor:
												urlValidation === "valid"
													? "var(--ax-colors-border-success)"
													: urlValidation === "invalid"
														? "var(--ax-colors-border-danger)"
														: undefined,
										}}
									/>
									{urlValidation === "invalid" && (
										<Text fontSize="xs" color="fg.error">
											Please enter a valid URL starting with http:// or
											https://
										</Text>
									)}
									{urlValidation === "valid" && (
										<Text fontSize="xs" color="fg.success">
											Valid URL format
										</Text>
									)}
								</Group>
								<Text fontSize="xs" color="fg.secondary">
									Enter a direct URL to a CSV file containing your{" "}
									{config.entityNamePlural}.
								</Text>
							</Group>
							<Alert intent="information" rounded="md">
								<Group flexDirection="column" gap="4">
									<Text fontSize="sm" fontWeight="600">
										CSV Format
									</Text>
									<Text fontSize="xs" color="fg.secondary">
										The CSV should have columns:{" "}
										{config.csvHeaders.map((header, i) => (
											<Fragment key={header}>
												<Text asChild fontWeight="600">
													<span>{header}</span>
												</Text>
												{i < config.csvHeaders.length - 1 && ", "}
											</Fragment>
										))}
										.
									</Text>
								</Group>
							</Alert>
						</Group>
					)}

					{/* Endpoint Input UI */}
					{importSource === "endpoint" && (
						<Group flexDirection="column" gap="12">
							<Group flexDirection="column" gap="8">
								<Text fontSize="sm" fontWeight="600">
									API Endpoint
								</Text>
								<Group flexDirection="column" gap="4">
									<Input
										type="url"
										placeholder={`https://api.example.com/${config.entityNamePlural}`}
										value={endpointInput}
										onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
											fileHandlers.handleEndpointChange(e.target.value)
										}
										style={{
											borderColor:
												endpointValidation === "valid"
													? "var(--ax-colors-border-success)"
													: endpointValidation === "invalid"
														? "var(--ax-colors-border-danger)"
														: undefined,
										}}
									/>
									{endpointValidation === "invalid" && (
										<Text fontSize="xs" color="fg.error">
											Please enter a valid URL starting with http:// or
											https://
										</Text>
									)}
									{endpointValidation === "valid" && (
										<Text fontSize="xs" color="fg.success">
											Valid URL format
										</Text>
									)}
								</Group>
								<Text fontSize="xs" color="fg.secondary">
									Enter an API endpoint that returns {config.entityNamePlural} in
									CSV or JSON format.
								</Text>
							</Group>
							<Alert intent="information" rounded="md">
								<Group flexDirection="column" gap="8">
									<Group flexDirection="column" gap="4">
										<Text fontSize="sm" fontWeight="600">
											Supported Formats
										</Text>
										<Text fontSize="xs" color="fg.secondary">
											<Text asChild fontWeight="600">
												<span>CSV:</span>
											</Text>{" "}
											Should have columns: {config.csvHeaders.join(", ")}
										</Text>
										<Text fontSize="xs" color="fg.secondary">
											<Text asChild fontWeight="600">
												<span>JSON:</span>
											</Text>{" "}
											Should be an array of objects with properties:{" "}
											{config.csvHeaders.join(", ")}
										</Text>
									</Group>
									<Group flexDirection="column" gap="2">
										<Text fontSize="xs" color="fg.tertiary">
											Example JSON response:
										</Text>
										<Box p="8" bg="bg.secondary" rounded="sm" fontFamily="mono">
											<Text
												fontSize="xs"
												fontFamily="mono"
												color="fg.secondary"
											>
												{"[{"}
												{config.csvHeaders
													.map((h, i) => `"${h}": "..."`)
													.join(", ")}
												{"}]"}
											</Text>
										</Box>
									</Group>
								</Group>
							</Alert>
						</Group>
					)}
				</Group>
			</DialogBody>
			<DialogFooter>
				<Group gap="16" justifyContent="flex-end" w="full">
					<DialogClose asChild>
						<Button appearance="default" size="lg">
							Cancel
						</Button>
					</DialogClose>
					<Button
						appearance="primary"
						size="lg"
						onClick={onContinue}
						disabled={!canContinue || isLoading}
						loading={isLoading}
					>
						Continue
					</Button>
				</Group>
			</DialogFooter>
		</>
	);
}
