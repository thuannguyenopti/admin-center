"use client";
import EmptyList from "@/app/components/EmptyList";
import usePersistentState from "../../../usePersistentState";

import {
	Button,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	Box,
	SearchInput,
	Pagination,
	Skeleton,
} from "@optiaxiom/react";

import {useState, useEffect} from "react";
import {Table, Tr, Th, Td} from "@/app/components/Table";
import AbstractDialog from "@/app/components/AbstractDialog";
import {IconChevronDown} from "@tabler/icons-react";

const GitHub = (
	<svg
		width="21"
		height="20"
		viewBox="0 0 21 20"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
	>
		<path
			d="M7.25781 16.0469C7.25781 16.125 7.17969 16.1641 7.0625 16.1641C6.94531 16.2031 6.86719 16.125 6.86719 16.0469C6.86719 15.9688 6.94531 15.8906 7.0625 15.8906C7.17969 15.8906 7.25781 15.9688 7.25781 16.0469ZM6.04688 15.8516C6.08594 15.7734 6.20312 15.7344 6.32031 15.7734C6.4375 15.8125 6.47656 15.8906 6.47656 15.9688C6.4375 16.0469 6.32031 16.0859 6.24219 16.0469C6.125 16.0469 6.04688 15.9297 6.04688 15.8516ZM7.80469 15.8125C7.88281 15.7734 8 15.8516 8 15.9297C8.03906 16.0078 7.96094 16.0469 7.84375 16.0859C7.72656 16.125 7.60938 16.0859 7.60938 16.0078C7.60938 15.8906 7.6875 15.8125 7.80469 15.8125ZM10.3438 0.8125C15.7734 0.8125 20.1875 4.95312 20.1875 10.3438C20.1875 14.6797 17.5312 18.3906 13.625 19.6797C13.1172 19.7969 12.9219 19.4844 12.9219 19.2109C12.9219 18.8984 12.9609 17.2578 12.9609 15.9688C12.9609 15.0312 12.6484 14.4453 12.2969 14.1328C14.4844 13.8984 16.7891 13.5859 16.7891 9.83594C16.7891 8.74219 16.3984 8.23438 15.7734 7.53125C15.8516 7.25781 16.2031 6.24219 15.6562 4.875C14.8359 4.60156 12.9609 5.92969 12.9609 5.92969C12.1797 5.69531 11.3594 5.61719 10.5 5.61719C9.67969 5.61719 8.85938 5.69531 8.07812 5.92969C8.07812 5.92969 6.16406 4.64062 5.38281 4.875C4.83594 6.24219 5.14844 7.25781 5.26562 7.53125C4.64062 8.23438 4.32812 8.74219 4.32812 9.83594C4.32812 13.5859 6.55469 13.8984 8.74219 14.1328C8.42969 14.4062 8.19531 14.8359 8.11719 15.4609C7.53125 15.7344 6.125 16.1641 5.26562 14.6406C4.71875 13.7031 3.74219 13.625 3.74219 13.625C2.80469 13.625 3.70312 14.25 3.70312 14.25C4.32812 14.5234 4.75781 15.6562 4.75781 15.6562C5.34375 17.4141 8.07812 16.8281 8.07812 16.8281C8.07812 17.6484 8.07812 18.9766 8.07812 19.25C8.07812 19.4844 7.92188 19.7969 7.41406 19.7188C3.50781 18.3906 0.8125 14.6797 0.8125 10.3438C0.8125 4.95312 4.95312 0.8125 10.3438 0.8125ZM4.60156 14.2891C4.64062 14.25 4.71875 14.2891 4.79688 14.3281C4.875 14.4062 4.875 14.5234 4.83594 14.5625C4.75781 14.6016 4.67969 14.5625 4.60156 14.5234C4.5625 14.4453 4.52344 14.3281 4.60156 14.2891ZM4.17188 13.9766C4.21094 13.9375 4.25 13.9375 4.32812 13.9766C4.40625 14.0156 4.44531 14.0547 4.44531 14.0938C4.40625 14.1719 4.32812 14.1719 4.25 14.1328C4.17188 14.0938 4.13281 14.0547 4.17188 13.9766ZM5.42188 15.3828C5.5 15.3047 5.61719 15.3438 5.69531 15.4219C5.77344 15.5 5.77344 15.6172 5.73438 15.6562C5.69531 15.7344 5.57812 15.6953 5.5 15.6172C5.38281 15.5391 5.38281 15.4219 5.42188 15.3828ZM4.99219 14.7969C5.07031 14.7578 5.14844 14.7969 5.22656 14.875C5.26562 14.9531 5.26562 15.0703 5.22656 15.1094C5.14844 15.1484 5.07031 15.1094 4.99219 15.0312C4.91406 14.9531 4.91406 14.8359 4.99219 14.7969Z"
			fill="white"
		/>
	</svg>
);

export default function Home() {
	const [sites, setSites] = usePersistentState("sites", {status: "loading", sites: []});
	const [open, setOpen] = useState(false);
	const [dropped, setDropped] = useState(false);
	const [search, setSearch] = useState("");
	// In a server-rendered page/component
	const connectGitHub = () => {
		setOpen(false);
		setSites({
			status: "ok",
			sites: [
				...sites.sites,
				{
					name: [
						"AlphaSite",
						"BetaBase",
						"GammaGround",
						"DeltaDomain",
						"EpsilonEmpire",
						"ZetaZone",
						"EtaEstate",
						"ThetaTerritory",
						"IotaIsland",
						"KappaKingdom",
						"LambdaLand",
						"MuMetropolis",
						"NuNexus",
						"XiXanadu",
						"OmicronOasis",
						"PiPlace",
						"RhoRealm",
						"SigmaSanctuary",
						"TauTown",
						"UpsilonUtopia",
					][Math.floor(Math.random() * 20)],
					url: "/fe-hosting/applications/apps/mosey-bank/overview",
					description: "Mosey’s official webiste",
					status: "Published",
					deployStatus: "Success",
					lastPublishedDate: "Jan 13, 2024",
					lastPublishedTime: "03:50 PM",
				},
			],
		});
	};

	const columns: any = [
		{label: "Application"},
		{label: "Application Status"},
		{label: "Last Deploy Status"},
		{label: "Last Published"},
	];
	const rows = sites.sites?.map((site: any) => {
		return {
			url: site.url,
			children: [
				{
					label: site.name,
					description: site.description,
					type: "header",
				},
				{label: site.status, type: "badge", data: "information"},
				{label: site.deployStatus, type: "badge", data: "success"},
				{label: "Jan 11, 2024", description: "15:50:45"},
			],
		};
	});

	const [loading, setLoading] = useState(true);

	useEffect(() => {
		setLoading(sites.status === "loading");
	}, [loading, setLoading, sites, setSites]);

	return (
		<>
			{loading ? (
				<>
					<Box
						display="flex"
						justifyContent="space-between"
						pb="16"
						style={{maxWidth: "1280px"}}
					>
						<SearchInput
							disabled
							defaultValue=""
							value={search}
							onChange={(e) => setSearch(e.target.value)}
						/>
						<Button
							disabled
							appearance="primary"
							onClick={() => setOpen(true)}
						>
							Create Application...
						</Button>
					</Box>
					<Table style={{maxWidth: "1280px"}}>
						<thead>
							<Tr>
								{columns.map((col: any) => (
									<Th key={col.label}>{col.label}</Th>
								))}
							</Tr>
						</thead>
						<tbody>
							<Tr>
								<Td>
									<Skeleton />
								</Td>
								<Td>
									<Skeleton />
								</Td>
								<Td>
									<Skeleton />
								</Td>
								<Td>
									<Skeleton />
								</Td>
							</Tr>
							<Tr>
								<Td>
									<Skeleton />
								</Td>
								<Td>
									<Skeleton />
								</Td>
								<Td>
									<Skeleton />
								</Td>
								<Td>
									<Skeleton />
								</Td>
							</Tr>
							<Tr>
								<Td>
									<Skeleton />
								</Td>
								<Td>
									<Skeleton />
								</Td>
								<Td>
									<Skeleton />
								</Td>
								<Td>
									<Skeleton />
								</Td>
							</Tr>
						</tbody>
					</Table>
				</>
			) : sites.sites?.length ? (
				<>
					<Box
						display="flex"
						justifyContent="space-between"
						pb="16"
						style={{maxWidth: "1280px"}}
					>
						<SearchInput
							defaultValue=""
							value={search}
							onChange={(e) => setSearch(e.target.value)}
						/>
						<Button
							appearance="primary"
							onClick={() => setOpen(true)}
						>
							Create Application...
						</Button>
					</Box>
					<Table style={{maxWidth: "1280px"}}>
						<thead>
							<Tr>
								{columns.map((col: any) => (
									<Th key={col.label}>{col.label}</Th>
								))}
							</Tr>
						</thead>
						<tbody>
							{rows
								.filter((row: any) =>
									row.children[0].label
										.toLowerCase()
										.includes(search.toLowerCase())
								)
								.map((row: any, i: number) => (
									<Tr
										url={row.url}
										key={i + row.children[0].label}
									>
										{row.children.map((col: any, i: number) => (
											<Td
												type={col.type}
												data={col.data}
												key={i + col.label}
												description={col.description}
											>
												{col.label}
											</Td>
										))}
									</Tr>
								))}
						</tbody>
					</Table>
					{rows.length > 5 && (
						<Box
							style={{maxWidth: "1280px"}}
							mt="16"
							justifyContent="center"
							display="flex"
						>
							<Pagination total={10}>1</Pagination>
						</Box>
					)}
				</>
			) : (
				<EmptyList
					heading="No Applications yet!"
					body="This is where you will find all your applications."
				>
					<DropdownMenu
						open={dropped}
						onOpenChange={setDropped}
					>
						<DropdownMenuTrigger
							appearance="primary"
							size="lg"
						>
							Create Application...
						</DropdownMenuTrigger>
						<DropdownMenuContent>
							<DropdownMenuItem onSelect={(event) => setOpen(true)}>
								Import an existing project
							</DropdownMenuItem>
							<DropdownMenuItem>Deploy manually</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</EmptyList>
			)}
			<AbstractDialog
				size="md"
				open={open}
				setOpen={setOpen}
				title="Import an existing project"
				description="Connect to your GutHub account, and then select which repository to import."
			>
				<Box textAlign="center">
					<Button
						icon={GitHub}
						size="lg"
						appearance="primary"
						onClick={() => connectGitHub()}
					>
						Connect your GitHub account
					</Button>
				</Box>
			</AbstractDialog>
		</>
	);
}
