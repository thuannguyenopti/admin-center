"use client";

import {Alert, Field, Select, SelectContent, SelectTrigger, Text} from "@optiaxiom/react";
import {useEffect, useMemo, useState} from "react";
import {Button} from "@/app/components/Button";
import {Input} from "@/app/components/Input";
import usePersistentState from "@/app/usePersistentState";
import {initialUsers} from "@/app/db/initialData";
import {getSelectValueInOptions} from "@/utils/selectValue";
import Flow from "@/app/components/Flow";

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

export default function DevelopmentAccountManagementPage() {
	const [currentUser] = usePersistentState("currentUser", initialUsers[0]);

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

	const [formData, setFormData] = useState<FormData>(prefilledForm);
	const [touched, setTouched] = useState<Record<keyof FormData, boolean>>({
		firstName: false,
		lastName: false,
		email: false,
		region: false,
	});

	useEffect(() => {
		setFormData(prefilledForm);
	}, [prefilledForm]);

	const errors = useMemo(() => validateForm(formData), [formData]);
	const isFormValid = Object.keys(errors).length === 0;

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

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!isFormValid) {
			setTouched({firstName: true, lastName: true, email: true, region: true});
		}
	};

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
					onChange={(e) => handleInputChange("firstName", e.target.value)}
					onBlur={() => markTouched("firstName")}
					placeholder="Enter first name"
				/>
			</Field>
			<Field label="Developer Last Name" required error={visibleErrors.lastName}>
				<Input
					onChange={(e) => handleInputChange("lastName", e.target.value)}
					onBlur={() => markTouched("lastName")}
					placeholder="Enter last name"
				/>
			</Field>
			<Field label="Developer Email" required error={visibleErrors.email}>
				<Input
					type="email"
					onChange={(e) => handleInputChange("email", e.target.value)}
					onBlur={() => markTouched("email")}
					placeholder="name@company.com"
				/>
			</Field>
			<Field label="Region" required error={visibleErrors.region}>
				<Select
					options={[...regionOptions]}
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
				<Button appearance="primary" type="submit" disabled={!isFormValid}>
					Submit
				</Button>
			</Text>
		</Flow>
	);
}
