export type ToolAction = "Read" | "Update" | "Create" | "Delete";
export type ConnectorType = "auth_provider" | "mcp";
export type AuthType = "OAuth 2.0" | "API Key" | "Service Account";

export interface ConnectorTool {
    id: string;
    name: string;
    description: string;
    action: ToolAction;
}

export interface Connector {
    id: string;
    name: string;
    category: string;
    description: string;
    about: string;
    type: ConnectorType;
    authType: AuthType;
    initials: string;
    color: string;
    textColor: string;
    tools: ConnectorTool[];
    usesOCP?: boolean;
}
