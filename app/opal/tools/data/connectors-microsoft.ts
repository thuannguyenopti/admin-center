import type { Connector } from "./types";

export const MICROSOFT_CONNECTORS: Connector[] = [
    {
        id: "microsoft-outlook", name: "Microsoft Outlook", category: "Microsoft 365",
        description: "Access and send emails via Microsoft Outlook and Exchange.",
        about: "The Microsoft Graph Outlook API enables your agents to read, send, and manage email messages and folders in Microsoft Outlook and Exchange mailboxes.",
        type: "auth_provider", authType: "OAuth 2.0", initials: "OL", color: "#0078D4", textColor: "#ffffff",
        tools: [
            { id: "outlook_list_messages", name: "messages_list", description: "Retrieves messages from the signed-in user's mailbox.", action: "Read" },
            { id: "outlook_get_message", name: "messages_get", description: "Gets the properties and relationships of a message.", action: "Read" },
            { id: "outlook_send_mail", name: "sendMail", description: "Sends the email specified in the request body.", action: "Create" },
            { id: "outlook_create_draft", name: "messages_create", description: "Creates a draft of a new message.", action: "Create" },
            { id: "outlook_move_message", name: "messages_move", description: "Moves a message to another folder in the mailbox.", action: "Update" },
        ],
    },
    {
        id: "microsoft-teams", name: "Microsoft Teams", category: "Microsoft 365",
        description: "Send messages and access channels in Microsoft Teams.",
        about: "The Microsoft Graph Teams API enables your agents to interact with Teams channels and chats, read messages, and post updates to keep teams in sync with your workflows.",
        type: "auth_provider", authType: "OAuth 2.0", initials: "MT", color: "#464775", textColor: "#ffffff",
        tools: [
            { id: "teams_list_channels", name: "channels_list", description: "Retrieves the list of channels in a team.", action: "Read" },
            { id: "teams_list_messages", name: "messages_list", description: "Gets messages in a Teams channel.", action: "Read" },
            { id: "teams_send_message", name: "messages_send", description: "Sends a new message in a channel or chat.", action: "Create" },
            { id: "teams_list_teams", name: "teams_list", description: "Lists all teams the authenticated user is a member of.", action: "Read" },
        ],
    },
    {
        id: "onedrive", name: "OneDrive", category: "Microsoft 365",
        description: "Read and manage files stored in Microsoft OneDrive.",
        about: "The Microsoft Graph OneDrive API lets your agents list, read, upload, and update files stored in personal and shared OneDrive storage.",
        type: "auth_provider", authType: "OAuth 2.0", initials: "OD", color: "#0078D4", textColor: "#ffffff",
        tools: [
            { id: "od_list_items", name: "driveItems_list", description: "Lists files and folders in the root of the user's OneDrive.", action: "Read" },
            { id: "od_get_item", name: "driveItems_get", description: "Gets metadata for a file or folder by path or item ID.", action: "Read" },
            { id: "od_upload_file", name: "driveItems_upload", description: "Uploads or replaces content of a file.", action: "Create" },
        ],
    },
];
