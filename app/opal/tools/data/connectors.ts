export type { ToolAction, ConnectorType, AuthType, ConnectorTool, Connector } from "./types";
import { GOOGLE_CONNECTORS } from "./connectors-google";
import { MICROSOFT_CONNECTORS } from "./connectors-microsoft";
import { CRM_CONNECTORS } from "./connectors-crm";
import {
    MARKETING_CONNECTORS,
    ANALYTICS_CONNECTORS,
    SOCIAL_CONNECTORS,
    PRODUCTIVITY_CONNECTORS,
    OTHER_CONNECTORS,
} from "./connectors-misc";

const HIDDEN_IDS = new Set(["google-drive", "klaviyo", "gong", "zoominfo", "snowflake", "stripe", "pitchbook", "onedrive", "braze"]);

export const CONNECTORS = [
    ...GOOGLE_CONNECTORS,
    ...MICROSOFT_CONNECTORS,
    ...CRM_CONNECTORS,
    ...MARKETING_CONNECTORS,
    ...ANALYTICS_CONNECTORS,
    ...PRODUCTIVITY_CONNECTORS,
    ...OTHER_CONNECTORS,
]
    .filter(c => !HIDDEN_IDS.has(c.id))
    .sort((a, b) => a.name.localeCompare(b.name));
