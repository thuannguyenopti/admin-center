"use client";

import { Fragment, useState, useEffect, useMemo } from "react";
import {
    Box,
    Text,
    Button,
    Badge,
    Heading,
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    LabelMenuButton,
    toaster,
} from "@optiaxiom/react";
import {
    IconGear,
    IconChevronDown,
    IconChevronRight,
    IconPlus,
    IconShieldCheck,
    IconScrewdriverWrench,
    IconEllipsisSolid,
    IconSearch,
} from "@optimizely/axiom-icons";
import { Table, Tr, Th, Td } from "@/app/components/Table";
import { Input } from "@/app/components/Input";
import { AddConnectorModal, type ConnectedConnector } from "./components/AddConnectorModal";
import { ConnectorAvatar } from "./components/ConnectorAvatar";
import { OCPConfigPanel } from "./components/OCPConfigPanel";
import { AddAuthProviderModal, type AuthProviderDraft } from "./components/AddAuthProviderModal";
import { RegisterRemoteMcpProviderModal, type RemoteMcpProviderDraft } from "./components/RegisterRemoteMcpProviderModal";
import { CONNECTORS, type Connector } from "./data/connectors";

const STORAGE_KEY = "opal_connected_connectors";

// ── Static Auth Provider mock data (from OCP) ─────────────────────────────────
type AuthScope = "Instance" | "System";
interface AuthProvider {
    id: string;
    name: string;
    description: string;
    authType: string;
    scope: AuthScope;
    isRemoteMcp: boolean;
    isActive: boolean;
    bundles: number;
    created: string;
}

const DEFAULT_AUTH_PROVIDERS: AuthProvider[] = [
    { id: "notion-mcp", name: "notion-mcp", description: "OAuth provider for notion-mcp Remote MCP integration", authType: "oauth2", scope: "Instance", isRemoteMcp: true, isActive: true, bundles: 1, created: "4/6/2026" },
    { id: "local-atlassian", name: "Local-Atlassian", description: "OAuth provider for Local-Atlassian Remote MCP integration · https://mcp.atlassian.com/v1/mcp", authType: "oauth2", scope: "Instance", isRemoteMcp: true, isActive: true, bundles: 1, created: "2/9/2026" },
    { id: "oksana-google", name: "OksanaGoogle", description: "Oksana Google ads Test", authType: "oauth2", scope: "System", isRemoteMcp: false, isActive: false, bundles: 1, created: "3/6/2026" },
    { id: "slack-auth", name: "Slack", description: "OAuth provider for Slack Remote MCP integration", authType: "oauth2", scope: "System", isRemoteMcp: true, isActive: true, bundles: 1, created: "3/31/2026" },
    { id: "microsoft-auth", name: "Microsoft", description: "ocp_microsoft_graph_opal_tool · Onedrive & Sharepoint", authType: "oauth2", scope: "System", isRemoteMcp: false, isActive: false, bundles: 2, created: "4/2/2026" },
    { id: "clickup-auth", name: "ClickUp", description: "OAuth provider for ClickUp Remote MCP integration", authType: "oauth2", scope: "System", isRemoteMcp: true, isActive: true, bundles: 1, created: "3/31/2026" },
    { id: "zoom-auth", name: "Zoom", description: "Zoom OAuth provider", authType: "oauth2", scope: "System", isRemoteMcp: false, isActive: false, bundles: 1, created: "2/6/2026" },
    { id: "sentry-auth", name: "Sentry", description: "OAuth provider for Sentry Remote MCP integration", authType: "oauth2", scope: "System", isRemoteMcp: true, isActive: true, bundles: 1, created: "2/2/2026" },
    { id: "salesforce-auth", name: "Salesforce", description: "Salesforce One Sandbox QA", authType: "oauth2", scope: "System", isRemoteMcp: false, isActive: false, bundles: 1, created: "3/20/2026" },
    { id: "wordpress-auth", name: "Wordpress", description: "Wordpress OAuth provider", authType: "oauth2", scope: "System", isRemoteMcp: false, isActive: false, bundles: 1, created: "2/20/2026" },
    { id: "figma-auth", name: "Figma", description: "OAuth provider for Figma", authType: "oauth2", scope: "System", isRemoteMcp: false, isActive: false, bundles: 1, created: "3/19/2026" },
    { id: "amplitude-auth", name: "Amplitude MCP", description: "OAuth provider for Amplitude MCP Remote MCP integration", authType: "oauth2", scope: "System", isRemoteMcp: true, isActive: true, bundles: 1, created: "3/8/2026" },
    { id: "coda-auth", name: "Coda", description: "OAuth provider for Coda Remote MCP integration", authType: "oauth2", scope: "System", isRemoteMcp: true, isActive: true, bundles: 1, created: "4/3/2026" },
    { id: "github-auth", name: "Github", description: "OAuth provider for Github Remote MCP integration", authType: "oauth2", scope: "System", isRemoteMcp: true, isActive: true, bundles: 1, created: "2/2/2026" },
    { id: "adobe-auth", name: "Adobe", description: "Adobe OAuth provider", authType: "oauth2", scope: "System", isRemoteMcp: false, isActive: false, bundles: 1, created: "1/29/2026" },
    { id: "atlassian-auth", name: "Atlassian", description: "OAuth provider for Atlassian Remote MCP integration", authType: "oauth2", scope: "System", isRemoteMcp: true, isActive: true, bundles: 1, created: "4/6/2026" },
    { id: "notion-auth", name: "Notion", description: "OAuth provider for Notion Remote MCP integration", authType: "oauth2", scope: "System", isRemoteMcp: true, isActive: true, bundles: 1, created: "4/3/2026" },
];

export default function ToolsPage() {
    const [connectedConnectors, setConnectedConnectors] = useState<ConnectedConnector[]>([]);
    const [authProviders, setAuthProviders] = useState<AuthProvider[]>(DEFAULT_AUTH_PROVIDERS);

    // OCP config panel state
    const [ocpConnector, setOcpConnector] = useState<Connector | null>(null);

    // Modal state — which connector (if any) and which screen to open to
    const [modalOpen, setModalOpen] = useState(false);
    const [modalInitialConnector, setModalInitialConnector] = useState<Connector | null>(null);
    const [modalInitialScreen, setModalInitialScreen] = useState<"browse" | "detail" | "configure">("browse");
    const [addAuthProviderOpen, setAddAuthProviderOpen] = useState(false);
    const [registerRemoteMcpOpen, setRegisterRemoteMcpOpen] = useState(false);

    // Connector tab filters
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All");
    const [connectorStatusFilter, setConnectorStatusFilter] = useState("All");

    // Auth providers tab filters
    const [authSearch, setAuthSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [expandedAuthProviderId, setExpandedAuthProviderId] = useState<string | null>(null);

    // Hydrate from localStorage
    useEffect(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) setConnectedConnectors(JSON.parse(raw));
        } catch { /* ignore */ }
    }, []);

    const handleConnectorAdded = (connector: ConnectedConnector) => {
        setConnectedConnectors(prev => {
            const next = prev.some(c => c.id === connector.id)
                ? prev.map(c => c.id === connector.id ? connector : c)
                : [...prev, connector];
            localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            return next;
        });
    };

    const handleDisconnect = (id: string) => {
        setConnectedConnectors(prev => {
            const next = prev.filter(c => c.id !== id);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            return next;
        });
        toaster.create("Connector disconnected", { intent: "information" });
    };

    const openConfigure = (connector: Connector) => {
        setModalInitialConnector(connector);
        setModalInitialScreen("configure");
        setModalOpen(true);
    };

    const openDetails = (connector: Connector) => {
        setModalInitialConnector(connector);
        setModalInitialScreen("detail");
        setModalOpen(true);
    };

    const openOCP = (connector: Connector) => setOcpConnector(connector);
    const openAddAuthProvider = () => setAddAuthProviderOpen(true);
    const openRegisterRemoteMcp = () => setRegisterRemoteMcpOpen(true);
    const isUserLevelConnector = (connector: Connector) =>
        connector.id !== "google-analytics" &&
        (connector.category === "Google Workspace" || connector.category === "Microsoft 365");

    const connectedIds = connectedConnectors.map(c => c.id);

    const renderConnectorStatusOption = (status: string) => {
        if (status === "All") {
            return "All";
        }

        const dotColor = status === "Connected"
            ? "var(--ax-colors-fg-success)"
            : "var(--ax-colors-border-secondary)";

        return (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <span
                    style={{
                        width: 8,
                        height: 8,
                        borderRadius: "999px",
                        background: dotColor,
                        flexShrink: 0,
                    }}
                />
                <span>{status}</span>
            </span>
        );
    };

    // Categories for filter
    const categories = useMemo(() => {
        const cats = Array.from(new Set(CONNECTORS.map(c => c.category)));
        return ["All", ...cats];
    }, []);

    // Filtered connector tiles
    const filteredTiles = useMemo(() => {
        return CONNECTORS.filter(c => {
            const matchesSearch = !search.trim() ||
                c.name.toLowerCase().includes(search.toLowerCase()) ||
                c.category.toLowerCase().includes(search.toLowerCase()) ||
                c.description.toLowerCase().includes(search.toLowerCase());
            const matchesCategory = categoryFilter === "All" || c.category === categoryFilter;
            const isConnected = connectedIds.includes(c.id);
            const matchesStatus = connectorStatusFilter === "All" ||
                (connectorStatusFilter === "Connected" && isConnected) ||
                (connectorStatusFilter === "Not connected" && !isConnected);
            return matchesSearch && matchesCategory && matchesStatus;
        });
    }, [search, categoryFilter, connectorStatusFilter, connectedIds]);

    // Filtered auth providers table
    const filteredAuth = useMemo(() => {
        return authProviders.filter(c => {
            const matchesSearch = !authSearch.trim() ||
                c.name.toLowerCase().includes(authSearch.toLowerCase()) ||
                c.description.toLowerCase().includes(authSearch.toLowerCase());
            const matchesStatus = statusFilter === "All" ||
                (statusFilter === "Active" && c.isActive) ||
                (statusFilter === "Inactive" && !c.isActive);
            return matchesSearch && matchesStatus;
        });
    }, [authProviders, authSearch, statusFilter]);

    const handleRemoteMcpProviderRegistered = (draft: RemoteMcpProviderDraft) => {
        const nextProvider: AuthProvider = {
            id: `remote-mcp-${Date.now()}`,
            name: draft.name,
            description: draft.description || `OAuth provider for ${draft.name} Remote MCP integration`,
            authType: "oauth2",
            scope: "Instance",
            isRemoteMcp: true,
            isActive: false,
            bundles: 1,
            created: new Date().toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "numeric" }),
        };

        setAuthProviders(prev => [nextProvider, ...prev]);
    };

    const handleAuthProviderAdded = (draft: AuthProviderDraft) => {
        const nextProvider: AuthProvider = {
            id: draft.providerId,
            name: draft.name,
            description: draft.description,
            authType: draft.authType,
            scope: "System",
            isRemoteMcp: false,
            isActive: false,
            bundles: 1,
            created: new Date().toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "numeric" }),
        };

        setAuthProviders(prev => [nextProvider, ...prev]);
    };

    return (
        <>
            <AddConnectorModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                onConnectorAdded={handleConnectorAdded}
                onDisconnect={handleDisconnect}
                connectedIds={connectedIds}
                initialConnector={modalInitialConnector}
                initialScreen={modalInitialScreen}
            />
            <RegisterRemoteMcpProviderModal
                open={registerRemoteMcpOpen}
                onOpenChange={setRegisterRemoteMcpOpen}
                onRegistered={handleRemoteMcpProviderRegistered}
            />
            <AddAuthProviderModal
                open={addAuthProviderOpen}
                onOpenChange={setAddAuthProviderOpen}
                onSaved={handleAuthProviderAdded}
            />

            <Box display="flex" flexDirection="column" gap="24">
                {/* ── Page header ──────────────────────────────────────────── */}
                <Box display="flex" flexDirection="column" gap="8">
                    <Heading level="1" fontSize="2xl">Connectors</Heading>
                    <Text color="fg.secondary">Enable connectors and tools your agents will use.</Text>
                </Box>

                {/* ── Tabs ─────────────────────────────────────────────────── */}
                <Tabs defaultValue="connectors">
                    <TabsList>
                        <TabsTrigger value="connectors">Connectors</TabsTrigger>
                        <TabsTrigger value="tools">Tools</TabsTrigger>
                        <TabsTrigger value="registries">Registries</TabsTrigger>
                        <TabsTrigger value="auth-providers">Auth Providers</TabsTrigger>
                    </TabsList>

                    {/* ── Connectors tab: all 33 tiles ─────────────────────── */}
                    <TabsContent value="connectors">
                        {ocpConnector && (
                            <OCPConfigPanel
                                connector={ocpConnector}
                                isInstalled={connectedIds.includes(ocpConnector.id)}
                                onClose={() => setOcpConnector(null)}
                                onInstall={() => {
                                    handleConnectorAdded({ id: ocpConnector.id, name: ocpConnector.name, category: ocpConnector.category, type: ocpConnector.type, status: "connected", managedBy: "Admin", toolCount: ocpConnector.tools.length, access: "All users", addedOn: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) });
                                    toaster.create(`${ocpConnector.name} activated`, { intent: "success" });
                                }}
                                onUninstall={() => { handleDisconnect(ocpConnector.id); }}
                            />
                        )}
                        <Box display="flex" flexDirection="column" gap="16" pt="16">
                            {/* Filters */}
                            <Box display="flex" gap="12" alignItems="center">
                                <Box style={{ width: 280 }}>
                                    <Input
                                        placeholder="Search connectors..."
                                        value={search}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                                        addonBefore={<IconSearch size={16} />}
                                    />
                                </Box>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <LabelMenuButton label="Category">
                                            {categoryFilter}
                                        </LabelMenuButton>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        {categories.map(cat => (
                                            <DropdownMenuItem key={cat} onClick={() => setCategoryFilter(cat)}>
                                                {cat}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <LabelMenuButton label="Status">
                                            {renderConnectorStatusOption(connectorStatusFilter)}
                                        </LabelMenuButton>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        {["All", "Connected", "Not connected"].map(status => (
                                            <DropdownMenuItem key={status} onClick={() => setConnectorStatusFilter(status)}>
                                                {renderConnectorStatusOption(status)}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <Box display="flex" alignItems="center" style={{ marginLeft: "auto" }}>
                                    <Button
                                        appearance="primary"
                                        onClick={() => {
                                            const mcpConnector = CONNECTORS.find(c => c.id === "custom-mcp")!;
                                            openConfigure(mcpConnector);
                                        }}
                                    >
                                        Add Connector
                                    </Button>
                                </Box>
                            </Box>

                            {/* Tile grid */}
                            {filteredTiles.length === 0 ? (
                                <Box display="flex" justifyContent="center" py="48">
                                    <Text color="fg.tertiary">No connectors match your search.</Text>
                                </Box>
                            ) : (
                                <Box
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: "repeat(4, 1fr)",
                                        gap: "16px",
                                        gridAutoRows: "1fr",
                                    }}
                                >
                                    {filteredTiles.map(connector => (
                                        <ConnectorCard
                                            key={connector.id}
                                            connector={connector}
                                            isConnected={connectedIds.includes(connector.id)}
                                            onConnect={() => {
                                                if (connector.usesOCP) {
                                                    openOCP(connector);
                                                    return;
                                                }

                                                if (connectedIds.includes(connector.id)) {
                                                    openDetails(connector);
                                                    return;
                                                }

                                                if (isUserLevelConnector(connector)) {
                                                    openDetails(connector);
                                                    return;
                                                }

                                                openConfigure(connector);
                                            }}
                                            onDetails={() => connector.usesOCP ? openOCP(connector) : openDetails(connector)}
                                        />
                                    ))}
                                </Box>
                            )}
                        </Box>
                    </TabsContent>

                    {/* ── Tools tab ────────────────────────────────────────── */}
                    <TabsContent value="tools">
                        <Box pt="16">
                            <ToolsTab />
                        </Box>
                    </TabsContent>

                    {/* ── Registries tab ───────────────────────────────────── */}
                    <TabsContent value="registries">
                        <Box pt="16">
                            <RegistriesTab />
                        </Box>
                    </TabsContent>

                    {/* ── Auth Providers tab ───────────────────────────────── */}
                    <TabsContent value="auth-providers">
                        <Box display="flex" flexDirection="column" gap="16" pt="16">
                            {/* Filters */}
                            <Box display="flex" gap="12" alignItems="center">
                                <Box style={{ width: 280 }}>
                                    <Input
                                        placeholder="Search providers..."
                                        value={authSearch}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAuthSearch(e.target.value)}
                                        addonBefore={<IconSearch size={16} />}
                                    />
                                </Box>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <LabelMenuButton label="Status">
                                            {statusFilter}
                                        </LabelMenuButton>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        {["All", "Active", "Inactive"].map(s => (
                                            <DropdownMenuItem key={s} onClick={() => setStatusFilter(s)}>
                                                {s}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button appearance="primary" style={{ marginLeft: "auto" }} icon={<IconChevronDown />} iconPosition="end">
                                            Add Auth Provider
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" style={{ minWidth: 260 }}>
                                        <DropdownMenuItem onClick={openAddAuthProvider}>
                                            <IconShieldCheck size={14} />
                                            Authentication Provider
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={openRegisterRemoteMcp}>
                                            <IconScrewdriverWrench size={14} />
                                            Remote MCP Auth Provider
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </Box>

                            {filteredAuth.length === 0 ? (
                                <Box display="flex" justifyContent="center" py="48">
                                    <Text color="fg.tertiary">No auth providers match your search.</Text>
                                </Box>
                            ) : (
                                <Table>
                                    <thead>
                                        <Tr>
                                            <Th style={{ width: 48 }}></Th>
                                            <Th>Name</Th>
                                            <Th>Auth Type</Th>
                                            <Th>Status</Th>
                                            <Th>Bundles</Th>
                                            <Th>Created</Th>
                                            <Th style={{ width: 56 }}></Th>
                                        </Tr>
                                    </thead>
                                    <tbody>
                                        {filteredAuth.map(provider => {
                                            const isExpanded = expandedAuthProviderId === provider.id;

                                            return (
                                                <Fragment key={provider.id}>
                                                    <Tr>
                                                        <Td type="button">
                                                            <Button
                                                                appearance="subtle"
                                                                icon={isExpanded ? <IconChevronDown /> : <IconChevronRight />}
                                                                aria-label={isExpanded ? "Collapse row" : "Expand row"}
                                                                onClick={() => setExpandedAuthProviderId(prev => prev === provider.id ? null : provider.id)}
                                                            />
                                                        </Td>
                                                        <Td type="header">{provider.name}</Td>
                                                        <Td>
                                                            <Box display="flex" alignItems="center" gap="6" flexWrap="wrap">
                                                                <Badge intent="neutral">{provider.authType}</Badge>
                                                                <Badge intent="neutral">{provider.scope}</Badge>
                                                                {provider.isRemoteMcp ? <Badge intent="information">Remote MCP</Badge> : null}
                                                            </Box>
                                                        </Td>
                                                        <Td>
                                                            <Badge intent={provider.isActive ? "success" : "neutral"}>
                                                                {provider.isActive ? "Active" : "Inactive"}
                                                            </Badge>
                                                        </Td>
                                                        <Td>
                                                            <Text fontSize="sm" color="fg.accent">
                                                                {provider.bundles} {provider.bundles === 1 ? "bundle" : "bundles"}
                                                            </Text>
                                                        </Td>
                                                        <Td>
                                                            <Text fontSize="sm" color="fg.secondary">{provider.created}</Text>
                                                        </Td>
                                                        <Td type="button">
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button
                                                                        appearance="subtle"
                                                                        icon={<IconEllipsisSolid />}
                                                                        aria-label="Actions"
                                                                    />
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuItem>Edit</DropdownMenuItem>
                                                                    <DropdownMenuItem>Add Bundle</DropdownMenuItem>
                                                                    <DropdownMenuItem style={{ color: "var(--ax-colors-fg-danger)" }}>
                                                                        Delete
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </Td>
                                                    </Tr>
                                                    {isExpanded ? (
                                                        <Tr>
                                                            <td
                                                                colSpan={7}
                                                                style={{
                                                                    padding: "16px 16px 16px 80px",
                                                                    borderTop: "1px solid var(--ax-colors-border-tertiary)",
                                                                }}
                                                            >
                                                                <Box display="flex" flexDirection="column" gap="12">
                                                                    <Box>
                                                                        <Text fontSize="sm" fontWeight="500" color="fg.default">Description</Text>
                                                                        <Text fontSize="sm" color="fg.secondary" mt="4">
                                                                            {provider.description}
                                                                        </Text>
                                                                    </Box>
                                                                    <Box display="flex" alignItems="center" gap="8" flexWrap="wrap">
                                                                        <Badge intent="neutral">Scope: {provider.scope}</Badge>
                                                                        {provider.isRemoteMcp ? <Badge intent="information">Remote MCP</Badge> : null}
                                                                    </Box>
                                                                </Box>
                                                            </td>
                                                        </Tr>
                                                    ) : null}
                                                </Fragment>
                                            );
                                        })}
                                    </tbody>
                                </Table>
                            )}
                        </Box>
                    </TabsContent>
                </Tabs>
            </Box>
        </>
    );
}

// ── ConnectorCard ─────────────────────────────────────────────────────────────

function ConnectorCard({
    connector,
    isConnected,
    onConnect,
    onDetails,
}: {
    connector: Connector;
    isConnected: boolean;
    onConnect: () => void;
    onDetails: () => void;
}) {
    return (
        <Box
            border="1"
            borderColor="border.tertiary"
            rounded="lg"
            pt="16"
            px="16"
            pb={isConnected ? "8" : "16"}
            display="flex"
            flexDirection="column"
            gap="12"
            onClick={onDetails}
            style={{
                background: "var(--ax-colors-bg-default)",
                cursor: "pointer",
                transition: "border-color 0.15s",
                minHeight: 152,
                height: "100%",
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--ax-colors-border-secondary)")}
            onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--ax-colors-border-tertiary)")}
        >
            {/* Top row: icon + name + action button */}
            <Box display="flex" alignItems="center" gap="12">
                <ConnectorAvatar connector={connector} size={40} />
                <Text fontWeight="500" style={{ flex: 1 }}>
                    {connector.name}
                </Text>
                <Button
                    appearance="subtle"
                    size="md"
                    icon={connector.usesOCP ? <IconGear /> : isConnected ? <IconGear /> : <IconPlus />}
                    onClick={e => { e.stopPropagation(); onConnect(); }}
                    aria-label={connector.usesOCP ? "Configure" : isConnected ? "Configure" : "Connect"}
                />
            </Box>

            {/* Description */}
            <Text
                fontSize="sm"
                color="fg.secondary"
                style={{
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    lineHeight: "1.4",
                    minHeight: "2.8em",
                }}
            >
                {connector.description}
            </Text>

            {isConnected && (
                <Box
                    display="flex"
                    alignItems="center"
                    gap="8"
                    pt="10"
                >
                    <Box
                        rounded="full"
                        style={{
                            width: 8,
                            height: 8,
                            background: "var(--ax-colors-fg-success)",
                            flexShrink: 0,
                        }}
                    />
                    <Text fontSize="sm" fontWeight="500" color="fg.success">
                        Connected
                    </Text>
                </Box>
            )}
        </Box>
    );
}

// ── Tools tab ─────────────────────────────────────────────────────────────────

function ToolsTab() {
    return (
        <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            py="48"
            rounded="md"
            style={{ border: "1px solid var(--ax-colors-border-tertiary)" }}
        >
            <Text color="fg.tertiary">Tools content coming soon.</Text>
        </Box>
    );
}

function RegistriesTab() {
    return (
        <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            py="48"
            rounded="md"
            style={{ border: "1px solid var(--ax-colors-border-tertiary)" }}
        >
            <Text color="fg.tertiary">Registries content coming soon.</Text>
        </Box>
    );
}
