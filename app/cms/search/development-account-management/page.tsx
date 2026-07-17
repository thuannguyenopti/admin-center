"use client";

import {
	Alert,
	Box,
	Dialog,
	DialogBody,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	Field,
	Link,
	Select,
	SelectContent,
	SelectTrigger,
	Tooltip,
	Text,
} from "@optiaxiom/react";
import {useEffect, useMemo, useRef, useState} from "react";
import {IconCopy, IconEye, IconEyeOff, IconKey, IconLock} from "@tabler/icons-react";
import {Button} from "@/app/components/Button";
import {Input} from "@/app/components/Input";
import usePersistentState from "@/app/usePersistentState";
import {initialUsers} from "@/app/db/initialData";
import {getSelectValueInOptions} from "@/utils/selectValue";
import Flow from "@/app/components/Flow";
import DevStateInspector from "./DevStateInspector";

type FormData = {
	firstName: string;
	lastName: string;
	email: string;
	region: string;
};

type FormErrors = {
	firstName?: string;
	lastName?: string;
	email?: string;
	region?: string;
};

type RetrievalStatus = "idle" | "loading" | "ready" | "error";

type DeveloperCredentials = {
	clientId: string;
	clientSecret: string;
};

type CredentialJobState = {
	status: RetrievalStatus;
	error: string;
	startedAt: number | null;
};

const DEFAULT_POLL_DURATION_MS = 2000;
const POLL_TIMEOUT_MS = 20000;

const regionOptions = [
	{label: "APAC", value: "APAC"},
	{label: "SWCE", value: "SWCE"},
	{label: "UAEN", value: "UAEN"},
	{label: "USCE", value: "USCE"},
] as const;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const splitName = (name: string) => {
	const trimmed = name.trim();
	if (!trimmed) return {firstName: "", lastName: ""};

	const parts = trimmed.split(/\s+/);
	return {
		firstName: parts[0] ?? "",
		lastName: parts.slice(1).join(" "),
	};
};

const validateForm = (values: FormData): FormErrors => {
	const errors: FormErrors = {};

	if (!values.firstName.trim()) {
		errors.firstName = "Developer first name is required.";
	}

	if (!values.lastName.trim()) {
		errors.lastName = "Developer last name is required.";
	}

	if (!values.email.trim()) {
		errors.email = "Developer email is required.";
	} else if (!emailPattern.test(values.email.trim())) {
		errors.email = "Enter a valid email address.";
	}

	if (!values.region) {
		errors.region = "Region is required.";
	}

	return errors;
};

const EMPTY_FORM: FormData = {
	firstName: "",
	lastName: "",
	email: "",
	region: "",
};

export default function DevelopmentAccountManagementPage() {
	const [currentUser] = usePersistentState("currentUser", initialUsers[0]);
	const [isCredentialsDialogOpen, setIsCredentialsDialogOpen] = useState(false);
	const [credentialJob, setCredentialJob] = usePersistentState(
		"developmentAccountCredentialJob",
		{
			status: "idle",
			error: "",
			startedAt: null,
		} as CredentialJobState
	) as [CredentialJobState, (value: CredentialJobState) => void, boolean];
	const [showClientSecret, setShowClientSecret] = useState(false);
	const [copiedField, setCopiedField] = useState<"clientId" | "clientSecret" | null>(null);
	const previousRetrievalStatusRef = useRef<RetrievalStatus>(credentialJob.status);

	const prefilledForm = useMemo<FormData>(() => {
		const fallbackUser = initialUsers[0];
		const user = currentUser ?? fallbackUser;
		const {firstName, lastName} = splitName(user?.name ?? "");

		return {
			firstName,
			lastName,
			email: user?.email ?? "",
			region: "",
		};
	}, [currentUser]);

	const [formData, setFormData] = useState<FormData>(EMPTY_FORM);
	const [touched, setTouched] = useState<Record<keyof FormData, boolean>>({
		firstName: false,
		lastName: false,
		email: false,
		region: false,
	});

	const retrievedCredentials = useMemo<DeveloperCredentials>(() => {
		const emailSeed = (prefilledForm.email || "developer").replace(/[^a-zA-Z0-9]/g, "");
		const normalizedSeed = (emailSeed + "ABCDEFGHIJKLMNOP").slice(0, 24);
		return {
			clientId: `DkzelueL2XMs4k${normalizedSeed}`,
			clientSecret: `${normalizedSeed}9fW2KpQ4tV8yM3nR7cJ1sL6xB0dH`.slice(0, 48),
		};
	}, [prefilledForm.email]);

	const errors = useMemo(() => validateForm(formData), [formData]);
	const isFormValid = Object.keys(errors).length === 0;
	const isFormLocked = credentialJob.status === "loading";

	const visibleErrors: FormErrors = {
		firstName: touched.firstName ? errors.firstName : undefined,
		lastName: touched.lastName ? errors.lastName : undefined,
		email: touched.email ? errors.email : undefined,
		region: touched.region ? errors.region : undefined,
	};

	const handleInputChange = (field: keyof FormData, value: string) => {
		setFormData((prev) => ({...prev, [field]: value}));
	};

	const markTouched = (field: keyof FormData) => {
		setTouched((prev) => ({...prev, [field]: true}));
	};

	const runCredentialRetrieval = () => {
		setCredentialJob({
			status: "loading",
			error: "",
			startedAt: Date.now(),
		});
	};

	const handleSubmit = () => {
		if (!isFormValid) {
			setTouched({firstName: true, lastName: true, email: true, region: true});
			return;
		}

		setCopiedField(null);
		setIsCredentialsDialogOpen(false);
		runCredentialRetrieval();
	};

	const copyToClipboard = async (field: "clientId" | "clientSecret", value: string) => {
		try {
			await navigator.clipboard.writeText(value);
			setCopiedField(field);
			setTimeout(() => setCopiedField(null), 1500);
		} catch {
			setCopiedField(null);
		}
	};

	const handleRetryRetrieval = () => {
		setCopiedField(null);
		setIsCredentialsDialogOpen(false);
		runCredentialRetrieval();
	};

	const setImmediateSuccess = () => {
		setCredentialJob({
			status: "ready",
			error: "",
			startedAt: null,
		});
		setIsCredentialsDialogOpen(true);
	};

	const setImmediateFailure = () => {
		setCredentialJob({
			status: "error",
			error: "We could not retrieve credentials due to a temporary service issue.",
			startedAt: null,
		});
		setIsCredentialsDialogOpen(true);
	};

	useEffect(() => {
		if (!isCredentialsDialogOpen) {
			setShowClientSecret(false);
		}
	}, [isCredentialsDialogOpen]);

	useEffect(() => {
		const previousStatus = previousRetrievalStatusRef.current;
		const hasCompletedPoll =
			previousStatus === "loading" &&
			(credentialJob.status === "ready" || credentialJob.status === "error");

		if (hasCompletedPoll) {
			setIsCredentialsDialogOpen(true);
		}

		previousRetrievalStatusRef.current = credentialJob.status;
	}, [credentialJob.status]);

	useEffect(() => {
		if (credentialJob.status !== "loading") return;

		const elapsed = credentialJob.startedAt ? Date.now() - credentialJob.startedAt : 0;
		const msLeft = Math.max(0, DEFAULT_POLL_DURATION_MS - elapsed);
		const timeoutMsLeft = Math.max(0, POLL_TIMEOUT_MS - elapsed);

		const completionTimer = setTimeout(() => {
			setCredentialJob({
				status: "ready",
				error: "",
				startedAt: null,
			});
		}, msLeft);

		const timeoutTimer = setTimeout(() => {
			setCredentialJob({
				status: "error",
				error: "Credential retrieval took longer than expected and timed out.",
				startedAt: null,
			});
		}, timeoutMsLeft);

		return () => {
			clearTimeout(completionTimer);
			clearTimeout(timeoutTimer);
		};
	}, [credentialJob, setCredentialJob]);

	return (
		<Flow maxW="lg">
			<Alert intent="neutral">
				Free developer accounts are intended for evaluation and non-production use. Accounts
				expire automatically after 90 days, and query throughput is rate-limited (at a
				queries-per-second limit to be confirmed). If you need more time or higher limits,
				request an extension through your account team.
			</Alert>

			<Field label="Developer First Name" required error={visibleErrors.firstName}>
				<Input
					disabled={isFormLocked}
					value={formData.firstName}
					onChange={(e) => handleInputChange("firstName", e.target.value)}
					onBlur={() => markTouched("firstName")}
					placeholder="Enter first name"
				/>
			</Field>

			<Field label="Developer Last Name" required error={visibleErrors.lastName}>
				<Input
					disabled={isFormLocked}
					value={formData.lastName}
					onChange={(e) => handleInputChange("lastName", e.target.value)}
					onBlur={() => markTouched("lastName")}
					placeholder="Enter last name"
				/>
			</Field>

			<Field label="Developer Email" required error={visibleErrors.email}>
				<Input
					disabled={isFormLocked}
					type="email"
					value={formData.email}
					onChange={(e) => handleInputChange("email", e.target.value)}
					onBlur={() => markTouched("email")}
					placeholder="name@company.com"
				/>
			</Field>

			<Field label="Region" required error={visibleErrors.region}>
				<Select
					disabled={isFormLocked}
					options={[...regionOptions]}
					value={getSelectValueInOptions(formData.region, [...regionOptions], "")}
					onValueChange={(value) => {
						handleInputChange("region", value);
						markTouched("region");
					}}
				>
					<SelectTrigger size="lg" placeholder="Select a region" />
					<SelectContent />
				</Select>
			</Field>

			<Text>
				<Button
					appearance="primary"
					onClick={handleSubmit}
					loading={isFormLocked}
					disabled={!isFormValid || isFormLocked}
				>
					Submit
				</Button>
			</Text>

			<DevStateInspector
				status={credentialJob.status}
				startedAt={credentialJob.startedAt}
				onSetSuccess={setImmediateSuccess}
				onSetFailure={setImmediateFailure}
			/>

			<Dialog open={isCredentialsDialogOpen} onOpenChange={setIsCredentialsDialogOpen}>
				<DialogContent size="sm">
					<DialogHeader>Retrieved Credentials</DialogHeader>
					<DialogBody>
						{credentialJob.status === "loading" && (
							<Alert intent="information">
								Retrieving credentials. This can take a few seconds.
							</Alert>
						)}

						{credentialJob.status === "error" && (
							<Flow gap="8">
								<Alert intent="danger">
									{credentialJob.error ||
										"An unexpected error occurred before credentials were retrieved."}
								</Alert>
								<Text color="fg.secondary">
									Retry retrieval. If it still fails, confirm the developer email
									and region are correct.
								</Text>
								<Text>
									<Button appearance="primary" onClick={handleRetryRetrieval}>
										Retry retrieval
									</Button>
								</Text>
								<Text>
									If the issue persists,{" "}
									<Link href="mailto:support@example.com">contact support</Link>.
								</Text>
							</Flow>
						)}

						{credentialJob.status === "ready" && (
							<Flow>
								<Field label="Client ID">
									<Input
										readOnly
										value={retrievedCredentials.clientId}
										addonBefore={
											<Box
												color="fg.secondary"
												display="flex"
												alignItems="center"
											>
												<IconKey size={16} />
											</Box>
										}
										addonAfter={
											<Tooltip
												open={copiedField === "clientId"}
												content={
													copiedField === "clientId"
														? "Client ID copied"
														: "Copy client ID"
												}
											>
												<Button
													size="sm"
													appearance="subtle"
													aria-label="Copy client ID"
													onClick={() =>
														copyToClipboard(
															"clientId",
															retrievedCredentials.clientId
														)
													}
													icon={<IconCopy size={16} />}
												/>
											</Tooltip>
										}
									/>
								</Field>

								<Field label="Client Secret">
									<Input
										readOnly
										type={showClientSecret ? "text" : "password"}
										value={retrievedCredentials.clientSecret}
										addonBefore={
											<Box
												color="fg.secondary"
												display="flex"
												alignItems="center"
											>
												<IconLock size={16} />
											</Box>
										}
										addonAfter={
											<Box display="flex" gap="4">
												<Button
													size="sm"
													appearance="subtle"
													aria-label={
														showClientSecret
															? "Hide client secret"
															: "Show client secret"
													}
													onClick={() =>
														setShowClientSecret((prev) => !prev)
													}
													icon={
														showClientSecret ? (
															<IconEyeOff />
														) : (
															<IconEye />
														)
													}
												/>
												<Tooltip
													open={copiedField === "clientSecret"}
													content={
														copiedField === "clientSecret"
															? "Client Secret copied"
															: "Copy client secret"
													}
												>
													<Button
														size="sm"
														appearance="subtle"
														aria-label="Copy client secret"
														onClick={() =>
															copyToClipboard(
																"clientSecret",
																retrievedCredentials.clientSecret
															)
														}
														icon={<IconCopy />}
													/>
												</Tooltip>
											</Box>
										}
									/>
								</Field>
							</Flow>
						)}
					</DialogBody>
					<DialogFooter>
						{credentialJob.status === "error" ? (
							<DialogClose appearance="default">Close</DialogClose>
						) : (
							<DialogClose appearance="default">Done</DialogClose>
						)}
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</Flow>
	);
}
