// Clean authoritative initial data for development and demos.
// This file intentionally minimal and well-formed to avoid merge remnants.

export type Algorithm = {
	id: string;
	name: string;
	publishState: string;
	creationDate: string;
	owner: string;
	type?: "Search" | "Custom";
								open: true,
								children: [
									{
										id: "col-6",
										open: true,
