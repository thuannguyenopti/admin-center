import type { Connector } from "./types";

export const CRM_CONNECTORS: Connector[] = [
    {
        id: "salesforce", name: "Salesforce", category: "CRM",
        description: "Query and update Salesforce objects like leads, contacts, and opportunities.",
        about: "The Salesforce REST API provides a powerful, convenient, and simple REST-based web services interface for interacting with Salesforce. Agents can query CRM data using SOQL, create or update records, and retrieve metadata.",
        type: "auth_provider", authType: "OAuth 2.0", initials: "SF", color: "#00A1E0", textColor: "#ffffff", usesOCP: true,
        tools: [
            { id: "sf_query", name: "soql_query", description: "Executes a SOQL query and returns matching records.", action: "Read" },
            { id: "sf_get_record", name: "records_get", description: "Retrieves a specific record by type and ID.", action: "Read" },
            { id: "sf_create_record", name: "records_create", description: "Creates a new record for the specified object type.", action: "Create" },
            { id: "sf_update_record", name: "records_update", description: "Updates fields on an existing Salesforce record.", action: "Update" },
            { id: "sf_search", name: "sosl_search", description: "Searches across multiple Salesforce objects using SOSL.", action: "Read" },
        ],
    },
    {
        id: "hubspot", name: "HubSpot", category: "CRM",
        description: "Access and update HubSpot CRM contacts, companies, and deals.",
        about: "The HubSpot API enables agents to interact with CRM records, manage contacts and companies, log activities, and retrieve pipeline data to power sales and marketing workflows.",
        type: "auth_provider", authType: "OAuth 2.0", initials: "HS", color: "#FF7A59", textColor: "#ffffff",
        tools: [
            { id: "hs_list_contacts", name: "contacts_list", description: "Returns a paginated list of contacts in your HubSpot account.", action: "Read" },
            { id: "hs_get_contact", name: "contacts_get", description: "Retrieves a single contact by ID.", action: "Read" },
            { id: "hs_create_contact", name: "contacts_create", description: "Creates a new contact with specified properties.", action: "Create" },
            { id: "hs_list_deals", name: "deals_list", description: "Returns deals with their pipeline stage and associated contacts.", action: "Read" },
            { id: "hs_create_note", name: "notes_create", description: "Logs a note activity on a contact, company, or deal.", action: "Create" },
        ],
    },
    {
        id: "ms-dynamics", name: "Microsoft Dynamics", category: "CRM",
        description: "Read and manage Dynamics 365 CRM entities and relationships.",
        about: "Dynamics 365 Web API provides a RESTful endpoint that gives access to Dynamics 365 Customer Engagement data. Agents can retrieve and update accounts, contacts, leads, and opportunities.",
        type: "auth_provider", authType: "OAuth 2.0", initials: "Dy", color: "#0078D4", textColor: "#ffffff",
        tools: [
            { id: "dyn_list_accounts", name: "accounts_list", description: "Retrieves a list of account entities from Dynamics.", action: "Read" },
            { id: "dyn_get_contact", name: "contacts_get", description: "Gets a specific contact record by GUID.", action: "Read" },
            { id: "dyn_create_lead", name: "leads_create", description: "Creates a new lead entity in Dynamics 365.", action: "Create" },
            { id: "dyn_update_opportunity", name: "opportunities_update", description: "Updates fields on an existing opportunity record.", action: "Update" },
        ],
    },
];
