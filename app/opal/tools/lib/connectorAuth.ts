import type { Connector } from "../data/connectors";

export function requiresUserLevelAuth(connector: Connector) {
    return connector.type === "auth_provider" &&
        connector.authType === "OAuth 2.0" &&
        !connector.usesOCP;
}
