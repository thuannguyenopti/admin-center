import type { Connector } from "./types";

export const MARKETING_CONNECTORS: Connector[] = [
    {
        id: "marketo", name: "Marketo", category: "Marketing",
        description: "Access Marketo leads, programs, and smart list data.",
        about: "The Marketo REST API allows agents to programmatically manage leads, campaigns, and marketing programs.",
        type: "auth_provider", authType: "OAuth 2.0", initials: "Mk", color: "#5C4B99", textColor: "#ffffff",
        tools: [
            { id: "mk_get_leads", name: "leads_get", description: "Retrieves one or more lead records by ID or filter.", action: "Read" },
            { id: "mk_create_update_leads", name: "leads_createOrUpdate", description: "Creates or updates lead records in bulk.", action: "Update" },
            { id: "mk_list_programs", name: "programs_list", description: "Returns a list of marketing programs.", action: "Read" },
            { id: "mk_trigger_campaign", name: "campaigns_trigger", description: "Triggers a smart campaign for a list of leads.", action: "Create" },
        ],
    },
    {
        id: "klaviyo", name: "Klaviyo", category: "Marketing",
        description: "Manage Klaviyo profiles, segments, and email flows.",
        about: "Klaviyo's API lets agents sync customer profiles, manage list memberships, and trigger flows or campaigns.",
        type: "auth_provider", authType: "API Key", initials: "Kl", color: "#1D1D1F", textColor: "#ffffff",
        tools: [
            { id: "kl_list_profiles", name: "profiles_list", description: "Returns a filtered, sorted list of customer profiles.", action: "Read" },
            { id: "kl_create_profile", name: "profiles_create", description: "Creates or updates a profile with the given attributes.", action: "Create" },
            { id: "kl_list_campaigns", name: "campaigns_list", description: "Returns all email and SMS campaigns.", action: "Read" },
            { id: "kl_create_event", name: "events_create", description: "Creates a metric event to trigger flows and automations.", action: "Create" },
        ],
    },
    {
        id: "braze", name: "Braze", category: "Marketing",
        description: "Trigger Braze campaigns and manage user attributes.",
        about: "The Braze REST API allows agents to send messages, update user attributes and events, and trigger campaign or Canvas entry.",
        type: "auth_provider", authType: "API Key", initials: "Bz", color: "#FF3A44", textColor: "#ffffff",
        tools: [
            { id: "braze_track_users", name: "users_track", description: "Records custom events, user attributes, and purchases.", action: "Update" },
            { id: "braze_send_message", name: "messages_send", description: "Sends a message immediately to a specified set of users.", action: "Create" },
            { id: "braze_trigger_campaign", name: "campaigns_trigger", description: "Triggers API-triggered delivery of a campaign.", action: "Create" },
            { id: "braze_export_users", name: "users_export", description: "Exports user data by identifier.", action: "Read" },
        ],
    },
];

export const ANALYTICS_CONNECTORS: Connector[] = [
    {
        id: "amplitude", name: "Amplitude", category: "Analytics",
        description: "Query Amplitude event data and user behavior analytics.",
        about: "Amplitude's API lets agents fetch event data, segment analytics, and user-level behavioral data to surface product insights within your workflows.",
        type: "auth_provider", authType: "API Key", initials: "Am", color: "#1C6EF2", textColor: "#ffffff",
        tools: [
            { id: "amp_query_events", name: "events_query", description: "Queries event data with segmentation and filters.", action: "Read" },
            { id: "amp_get_user", name: "users_get", description: "Gets all events associated with a specific user.", action: "Read" },
            { id: "amp_export_events", name: "events_export", description: "Exports event data for a date range to a file.", action: "Read" },
        ],
    },
    {
        id: "mixpanel", name: "Mixpanel", category: "Analytics",
        description: "Query Mixpanel funnels, retention, and segmentation reports.",
        about: "Mixpanel's Query API lets agents fetch segmentation, funnel, retention, and raw event data.",
        type: "auth_provider", authType: "API Key", initials: "Mp", color: "#7856FF", textColor: "#ffffff",
        tools: [
            { id: "mx_segmentation", name: "segmentation_query", description: "Returns segmentation data for a given event and date range.", action: "Read" },
            { id: "mx_funnels", name: "funnels_query", description: "Returns funnel analysis data across a sequence of events.", action: "Read" },
            { id: "mx_retention", name: "retention_query", description: "Returns retention data for cohorts.", action: "Read" },
        ],
    },
];

export const SOCIAL_CONNECTORS: Connector[] = [
    {
        id: "linkedin", name: "LinkedIn", category: "Social",
        description: "Post updates and read company page data via LinkedIn API.",
        about: "The LinkedIn API lets agents post organic updates to company pages, manage posts, and retrieve analytics.",
        type: "auth_provider", authType: "OAuth 2.0", initials: "Li", color: "#0A66C2", textColor: "#ffffff",
        tools: [
            { id: "li_create_post", name: "ugcPosts_create", description: "Creates a new post on a LinkedIn page or profile.", action: "Create" },
            { id: "li_get_org", name: "organizations_get", description: "Retrieves a company page by ID.", action: "Read" },
            { id: "li_get_analytics", name: "shareStatistics_get", description: "Returns share and engagement statistics for posts.", action: "Read" },
        ],
    },
    {
        id: "twitter", name: "Twitter / X", category: "Social",
        description: "Post tweets and search the Twitter/X timeline via API.",
        about: "The Twitter API v2 lets agents post tweets, search recent and full-archive tweets, manage lists, and pull user data.",
        type: "auth_provider", authType: "OAuth 2.0", initials: "Tw", color: "#000000", textColor: "#ffffff",
        tools: [
            { id: "tw_create_tweet", name: "tweets_create", description: "Creates a new tweet on behalf of the authenticated user.", action: "Create" },
            { id: "tw_search_tweets", name: "tweets_search", description: "Returns tweets matching a query from the recent 7 days.", action: "Read" },
            { id: "tw_get_user", name: "users_get", description: "Returns information about a user by ID or username.", action: "Read" },
        ],
    },
    {
        id: "meta", name: "Meta", category: "Social",
        description: "Manage Facebook and Instagram Pages, posts, and insights.",
        about: "The Meta Graph API lets agents manage Page posts and stories, retrieve content performance insights, publish media, and manage comments.",
        type: "auth_provider", authType: "OAuth 2.0", initials: "Me", color: "#0866FF", textColor: "#ffffff",
        tools: [
            { id: "meta_get_page", name: "page_get", description: "Retrieves a Facebook Page's details and metadata.", action: "Read" },
            { id: "meta_create_post", name: "feed_post", description: "Publishes a post to a Facebook Page's feed.", action: "Create" },
            { id: "meta_get_insights", name: "insights_get", description: "Returns analytics insights for a page or post.", action: "Read" },
        ],
    },
];

export const PRODUCTIVITY_CONNECTORS: Connector[] = [
    {
        id: "jira", name: "Jira", category: "Project Management",
        description: "Create and query Jira issues, projects, and sprint data.",
        about: "The Jira REST API lets agents create, retrieve, update, and delete issues and projects.",
        type: "auth_provider", authType: "OAuth 2.0", initials: "Ji", color: "#0052CC", textColor: "#ffffff",
        tools: [
            { id: "jira_search", name: "issues_search", description: "Searches for issues using a JQL query.", action: "Read" },
            { id: "jira_get_issue", name: "issues_get", description: "Returns the details of a specific issue.", action: "Read" },
            { id: "jira_create_issue", name: "issues_create", description: "Creates an issue or sub-task in a project.", action: "Create" },
            { id: "jira_update_issue", name: "issues_update", description: "Updates an issue's fields, status, or assignee.", action: "Update" },
            { id: "jira_add_comment", name: "comments_add", description: "Adds a comment to a Jira issue.", action: "Create" },
        ],
    },
    {
        id: "confluence", name: "Confluence", category: "Project Management",
        description: "Read and create Confluence pages and spaces.",
        about: "The Confluence REST API lets agents read and write wiki pages, search spaces, and manage content.",
        type: "auth_provider", authType: "OAuth 2.0", initials: "Cf", color: "#172B4D", textColor: "#ffffff",
        tools: [
            { id: "cf_search", name: "content_search", description: "Searches Confluence content using CQL.", action: "Read" },
            { id: "cf_get_page", name: "content_get", description: "Returns a specific page or blog post by ID.", action: "Read" },
            { id: "cf_create_page", name: "content_create", description: "Creates a new page in a specified space.", action: "Create" },
            { id: "cf_update_page", name: "content_update", description: "Updates the title or body of an existing page.", action: "Update" },
        ],
    },
    {
        id: "asana", name: "Asana", category: "Project Management",
        description: "Create and manage Asana tasks, projects, and workspaces.",
        about: "The Asana API allows agents to create tasks, assign them, update statuses, and query projects.",
        type: "auth_provider", authType: "OAuth 2.0", initials: "As", color: "#F06A6A", textColor: "#ffffff",
        tools: [
            { id: "asana_list_tasks", name: "tasks_list", description: "Returns tasks matching a filter in a project or workspace.", action: "Read" },
            { id: "asana_create_task", name: "tasks_create", description: "Creates a new task with specified assignee and due date.", action: "Create" },
            { id: "asana_update_task", name: "tasks_update", description: "Updates an existing task's name, notes, or completion.", action: "Update" },
            { id: "asana_list_projects", name: "projects_list", description: "Returns all projects visible to the authenticated user.", action: "Read" },
        ],
    },
    {
        id: "notion", name: "Notion", category: "Project Management",
        description: "Read and write Notion pages, databases, and blocks.",
        about: "The Notion API enables agents to query database records, read page content, and create new entries.",
        type: "auth_provider", authType: "OAuth 2.0", initials: "No", color: "#1F1F1F", textColor: "#ffffff",
        tools: [
            { id: "notion_query_db", name: "databases_query", description: "Gets a list of pages in a database with optional filters.", action: "Read" },
            { id: "notion_get_page", name: "pages_get", description: "Retrieves a page and its properties by ID.", action: "Read" },
            { id: "notion_create_page", name: "pages_create", description: "Creates a new page inside a parent database or page.", action: "Create" },
            { id: "notion_append_block", name: "blocks_append", description: "Appends new children blocks to a specified block.", action: "Update" },
        ],
    },
    {
        id: "slack", name: "Slack", category: "Communication",
        description: "Post messages and read channel history in Slack.",
        about: "The Slack API lets agents post messages to channels and DMs, read channel history, and manage workflows.",
        type: "auth_provider", authType: "OAuth 2.0", initials: "Sk", color: "#4A154B", textColor: "#ffffff",
        tools: [
            { id: "slack_list_channels", name: "conversations_list", description: "Lists all channels a user or bot is a member of.", action: "Read" },
            { id: "slack_post_message", name: "chat_postMessage", description: "Sends a message to a channel, group, or DM.", action: "Create" },
            { id: "slack_get_history", name: "conversations_history", description: "Fetches a conversation's message history.", action: "Read" },
        ],
    },
    {
        id: "zoom", name: "Zoom", category: "Communication",
        description: "Schedule and retrieve Zoom meetings and recordings.",
        about: "The Zoom API lets agents create and manage video meetings, retrieve meeting recordings, and access participant reports.",
        type: "auth_provider", authType: "OAuth 2.0", initials: "Zm", color: "#2D8CFF", textColor: "#ffffff",
        tools: [
            { id: "zoom_list_meetings", name: "meetings_list", description: "Lists all meetings scheduled by a user.", action: "Read" },
            { id: "zoom_create_meeting", name: "meetings_create", description: "Creates a new Zoom meeting for a user.", action: "Create" },
            { id: "zoom_get_recording", name: "recordings_get", description: "Retrieves cloud recordings for a specific meeting.", action: "Read" },
        ],
    },
];

export const OTHER_CONNECTORS: Connector[] = [
    {
        id: "figma", name: "Figma", category: "Content",
        description: "Read Figma files, components, and design assets.",
        about: "The Figma REST API lets agents retrieve file structure, component metadata, design tokens, and export assets.",
        type: "auth_provider", authType: "OAuth 2.0", initials: "Fg", color: "#F24E1E", textColor: "#ffffff",
        tools: [
            { id: "figma_get_file", name: "files_get", description: "Returns the document tree and metadata for a Figma file.", action: "Read" },
            { id: "figma_get_components", name: "components_get", description: "Returns a list of published components in a file.", action: "Read" },
            { id: "figma_export_images", name: "images_export", description: "Exports images for specified node IDs.", action: "Read" },
        ],
    },
    {
        id: "bynder", name: "Bynder", category: "Content",
        description: "Search and retrieve assets from the Bynder DAM.",
        about: "The Bynder API lets agents search for approved brand assets, retrieve download URLs, and check asset metadata.",
        type: "auth_provider", authType: "OAuth 2.0", initials: "By", color: "#006BFF", textColor: "#ffffff",
        tools: [
            { id: "bynder_list_assets", name: "media_list", description: "Returns a list of media assets with optional filters.", action: "Read" },
            { id: "bynder_get_asset", name: "media_get", description: "Returns metadata and download URL for a specific asset.", action: "Read" },
            { id: "bynder_search", name: "media_search", description: "Searches assets by keyword, tag, or metadata field.", action: "Read" },
        ],
    },
    {
        id: "gong", name: "Gong", category: "Sales Intelligence",
        description: "Pull call transcripts and deal insights from Gong.",
        about: "The Gong API lets agents retrieve call recordings, transcripts, and deal intelligence.",
        type: "auth_provider", authType: "API Key", initials: "Go", color: "#6C2BD9", textColor: "#ffffff",
        tools: [
            { id: "gong_list_calls", name: "calls_list", description: "Returns a list of calls filtered by date and participants.", action: "Read" },
            { id: "gong_get_transcript", name: "calls_transcript", description: "Returns the full transcript for a specific call.", action: "Read" },
            { id: "gong_get_stats", name: "calls_stats", description: "Returns talk ratio and engagement statistics for a call.", action: "Read" },
        ],
    },
    {
        id: "zoominfo", name: "ZoomInfo", category: "Sales Intelligence",
        description: "Look up company and contact intelligence from ZoomInfo.",
        about: "ZoomInfo's API enables agents to search for contacts and companies and enrich records with verified B2B data.",
        type: "auth_provider", authType: "OAuth 2.0", initials: "ZI", color: "#FF6900", textColor: "#ffffff",
        tools: [
            { id: "zi_search_contacts", name: "contacts_search", description: "Searches for contacts by name, title, or company.", action: "Read" },
            { id: "zi_search_companies", name: "companies_search", description: "Returns company records matching filter criteria.", action: "Read" },
            { id: "zi_enrich_contact", name: "contacts_enrich", description: "Enriches a contact record with verified ZoomInfo data.", action: "Update" },
        ],
    },
    {
        id: "pitchbook", name: "PitchBook", category: "Sales Intelligence",
        description: "Access PitchBook company financials, investors, and deal data.",
        about: "The PitchBook API lets agents explore private market data including funding rounds, investors, companies, and valuations.",
        type: "auth_provider", authType: "API Key", initials: "PB", color: "#1B2A4A", textColor: "#ffffff",
        tools: [
            { id: "pb_search_companies", name: "companies_search", description: "Searches for companies by name, industry, or location.", action: "Read" },
            { id: "pb_get_deals", name: "deals_get", description: "Returns deal and funding round data for a company.", action: "Read" },
            { id: "pb_get_investors", name: "investors_get", description: "Returns investor profile and portfolio data.", action: "Read" },
        ],
    },
    {
        id: "snowflake", name: "Snowflake", category: "Data & BI",
        description: "Execute SQL queries and read results from Snowflake data warehouse.",
        about: "The Snowflake SQL API lets agents execute queries, retrieve results, and access data warehouse content.",
        type: "auth_provider", authType: "OAuth 2.0", initials: "Sf", color: "#29B5E8", textColor: "#ffffff",
        tools: [
            { id: "snow_execute_query", name: "statements_execute", description: "Submits a SQL statement for execution.", action: "Read" },
            { id: "snow_get_results", name: "statements_getResults", description: "Retrieves query results by statement handle.", action: "Read" },
            { id: "snow_list_databases", name: "databases_list", description: "Returns a list of available databases in the account.", action: "Read" },
        ],
    },
    {
        id: "tableau", name: "Tableau", category: "Data & BI",
        description: "Query Tableau workbooks, views, and dashboard data.",
        about: "The Tableau REST API allows agents to retrieve workbook and view metadata and query view data.",
        type: "auth_provider", authType: "API Key", initials: "Tb", color: "#E97627", textColor: "#ffffff",
        tools: [
            { id: "tb_list_workbooks", name: "workbooks_list", description: "Returns a list of published workbooks on the server.", action: "Read" },
            { id: "tb_get_view", name: "views_get", description: "Retrieves details for a specific view.", action: "Read" },
            { id: "tb_query_data", name: "views_queryData", description: "Returns data for a specific view in CSV format.", action: "Read" },
        ],
    },
    {
        id: "stripe", name: "Stripe", category: "Finance",
        description: "Retrieve Stripe customer, payment, and subscription data.",
        about: "The Stripe API lets agents retrieve customer records, payment intents, invoices, and subscription data.",
        type: "auth_provider", authType: "API Key", initials: "St", color: "#635BFF", textColor: "#ffffff",
        tools: [
            { id: "stripe_list_customers", name: "customers_list", description: "Returns a list of customers, filterable by email or metadata.", action: "Read" },
            { id: "stripe_get_customer", name: "customers_retrieve", description: "Retrieves a specific customer by ID.", action: "Read" },
            { id: "stripe_list_payments", name: "paymentIntents_list", description: "Returns payment intents with optional filters.", action: "Read" },
            { id: "stripe_list_subscriptions", name: "subscriptions_list", description: "Returns all subscriptions for a customer or account.", action: "Read" },
        ],
    },
    {
        id: "custom-mcp", name: "Custom MCP Server", category: "Custom",
        description: "Connect any MCP-compatible server to extend agent capabilities.",
        about: "Add a custom Model Context Protocol (MCP) server to make its tools available to your agents. Provide the server URL and configure OAuth or API key authentication. Tools will be discovered automatically.",
        type: "mcp", authType: "OAuth 2.0", initials: "MCP", color: "#6B7280", textColor: "#ffffff",
        tools: [],
    },
];
