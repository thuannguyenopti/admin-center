import type { Connector } from "../data/connectors";

export function usesDirectUserConnect(connector: Connector) {
    return connector.category === "Google Workspace" && !connector.usesOCP;
}

export function requiresDeferredUserConnect(connector: Connector) {
    return connector.type === "auth_provider" &&
        connector.authType === "OAuth 2.0" &&
        !connector.usesOCP &&
        !usesDirectUserConnect(connector);
}
