import type { Connector } from "./types";

export const GOOGLE_CONNECTORS: Connector[] = [
    {
        id: "gmail", name: "Gmail", category: "Google Workspace",
        description: "Read, send, and manage Gmail messages and labels for your agents.",
        about: "The Gmail API lets you view and manage Gmail mailbox data like threads, messages, and labels. Use it to read incoming mail, send messages, organize by label, and create drafts — all from within your agent workflows.",
        type: "auth_provider", authType: "OAuth 2.0", initials: "Gm", color: "#EA4335", textColor: "#ffffff",
        tools: [
            { id: "gmail_read_email", name: "read_email", description: "Retrieves a message by ID including headers, body, and attachments.", action: "Read" },
            { id: "gmail_list_messages", name: "list_messages", description: "Lists messages in the inbox matching an optional query string.", action: "Read" },
            { id: "gmail_send_email", name: "send_email", description: "Sends a new email from the authenticated account.", action: "Create" },
            { id: "gmail_create_draft", name: "create_draft", description: "Creates a draft message without sending it.", action: "Create" },
            { id: "gmail_list_labels", name: "list_labels", description: "Returns all labels in the authenticated user's mailbox.", action: "Read" },
            { id: "gmail_modify_labels", name: "modify_labels", description: "Adds or removes labels from a specific message.", action: "Update" },
        ],
    },
    {
        id: "google-calendar", name: "Google Calendar", category: "Google Workspace",
        description: "Read and manage Google Calendar events and calendars.",
        about: "The Google Calendar API is a RESTful API that exposes most features available in the Google Calendar web interface, including creating and modifying events and calendars.",
        type: "auth_provider", authType: "OAuth 2.0", initials: "GC", color: "#1A73E8", textColor: "#ffffff",
        tools: [
            { id: "gcal_list_events", name: "events_list", description: "Lists events on the specified calendar matching optional filters.", action: "Read" },
            { id: "gcal_get_event", name: "events_get", description: "Retrieves a single calendar event by event ID.", action: "Read" },
            { id: "gcal_create_event", name: "events_insert", description: "Creates a new event on the specified calendar.", action: "Create" },
            { id: "gcal_update_event", name: "events_update", description: "Updates an existing event, replacing all properties with new values.", action: "Update" },
            { id: "gcal_delete_event", name: "events_delete", description: "Deletes a specific event from the calendar.", action: "Delete" },
            { id: "gcal_calendarlist_get", name: "calendarlist_get", description: "Retrieves detailed information about a specific calendar by ID.", action: "Read" },
        ],
    },
    {
        id: "google-docs", name: "Google Docs", category: "Google Workspace",
        description: "Create, read, and update Google Docs documents from agent workflows.",
        about: "The Google Docs API allows you to create and modify documents programmatically. Use it to generate reports, update content, extract text, and integrate document workflows into your agents.",
        type: "auth_provider", authType: "OAuth 2.0", initials: "GD", color: "#4285F4", textColor: "#ffffff",
        tools: [
            { id: "gdocs_get", name: "documents_get", description: "Returns the content and metadata of the specified Google Doc.", action: "Read" },
            { id: "gdocs_create", name: "documents_create", description: "Creates a new, empty Google Doc with an optional title.", action: "Create" },
            { id: "gdocs_batch_update", name: "documents_batchUpdate", description: "Applies a batch of update requests to a document.", action: "Update" },
        ],
    },
    {
        id: "google-drive", name: "Google Drive", category: "Google Workspace",
        description: "Search, read, and organize files stored in Google Drive.",
        about: "The Google Drive API lets you read and manage files on Drive, including uploading new files, searching across your storage, retrieving file metadata, and setting permissions.",
        type: "auth_provider", authType: "OAuth 2.0", initials: "Dr", color: "#0F9D58", textColor: "#ffffff",
        tools: [
            { id: "gdrive_list", name: "files_list", description: "Lists or searches files and folders in Drive.", action: "Read" },
            { id: "gdrive_get", name: "files_get", description: "Gets a file's metadata or content by file ID.", action: "Read" },
            { id: "gdrive_create", name: "files_create", description: "Creates a new file in Drive with specified content.", action: "Create" },
            { id: "gdrive_update", name: "files_update", description: "Updates an existing file's metadata or content.", action: "Update" },
            { id: "gdrive_delete", name: "files_delete", description: "Permanently deletes a file owned by the user.", action: "Delete" },
        ],
    },
    {
        id: "google-sheets", name: "Google Sheets", category: "Google Workspace",
        description: "Read and write data in Google Sheets spreadsheets.",
        about: "The Google Sheets API lets you create, read, and update spreadsheets. Ideal for data collection, reporting, and bulk data processing within agent workflows.",
        type: "auth_provider", authType: "OAuth 2.0", initials: "GS", color: "#34A853", textColor: "#ffffff",
        tools: [
            { id: "gsheets_get", name: "spreadsheets_get", description: "Returns the spreadsheet at the given ID with sheet properties.", action: "Read" },
            { id: "gsheets_values_get", name: "values_get", description: "Returns a range of values from a spreadsheet.", action: "Read" },
            { id: "gsheets_values_update", name: "values_update", description: "Sets values in a range of a spreadsheet.", action: "Update" },
            { id: "gsheets_values_append", name: "values_append", description: "Appends values after the last row with data in a range.", action: "Create" },
        ],
    },
    {
        id: "google-slides", name: "Google Slides", category: "Google Workspace",
        description: "Read and update Google Slides presentations programmatically.",
        about: "The Google Slides API lets you create and modify presentations. Use it to build presentation decks, update slide content, and extract speaker notes from within your agent.",
        type: "auth_provider", authType: "OAuth 2.0", initials: "Sl", color: "#FBBC05", textColor: "#333333",
        tools: [
            { id: "gslides_get", name: "presentations_get", description: "Gets the latest version of the specified presentation.", action: "Read" },
            { id: "gslides_create", name: "presentations_create", description: "Creates a blank presentation with the given title.", action: "Create" },
            { id: "gslides_batch_update", name: "presentations_batchUpdate", description: "Applies a batch of updates to the specified presentation.", action: "Update" },
        ],
    },
    {
        id: "google-analytics", name: "Google Analytics", category: "Analytics",
        description: "Query Google Analytics 4 reports and event data.",
        about: "The Google Analytics Data API allows agents to run reports, retrieve real-time data, and access audience metrics. Use it to pull site performance data directly into your agent workflows.",
        type: "auth_provider", authType: "OAuth 2.0", initials: "GA", color: "#E37400", textColor: "#ffffff", usesOCP: true,
        tools: [
            { id: "ga_run_report", name: "runReport", description: "Returns a customized report of your Google Analytics event data.", action: "Read" },
            { id: "ga_run_realtime", name: "runRealtimeReport", description: "Returns a real-time report of active users on your site.", action: "Read" },
            { id: "ga_batch_report", name: "batchRunReports", description: "Returns multiple reports in a single batch request.", action: "Read" },
        ],
    },
];
