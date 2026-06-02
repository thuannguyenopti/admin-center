import { MARATHON_EVENT_OUTLINE } from "./marathonEventOutline";

// --- SEO Block Type ---
export type SEOBlockLocale = {
	title: string;
	description: string;
	canonicalUrl?: string;
	robots?: string;
	image?: string;
	meta?: Record<string, string>;
	ogTitle?: string;
	ogDescription?: string;
	ogImage?: string;
	twitterTitle?: string;
	twitterDescription?: string;
	twitterImage?: string;
};

export type SEOBlockVariants = Record<string, SEOBlockLocale>; // variant key (e.g. "original", "vip")

export type SEOBlock = {
	[locale: string]: SEOBlockVariants; // locale key (e.g. "en", "sv")
};

export type Algorithm = {
	id: string;
	name: string;
	publishState: string;
	creationDate: string;
	owner: string;
	type?: "Search" | "Custom";
};

export type PinnedResult = {
	id: string;
	query: string;
	destination: string;
	owner: string;
};

export type RelatedQuery = {
	id: string;
	query: string;
	synonyms: string[];
	owner: string;
};

export type AlgorithmRelatedQueryReference = {
	relatedQueryId: string;
};

export type Synonym = {
	id: string;
	term: string;
	synonyms: string[];
	type: "One-way" | "Two-way";
	owner: string;
};

export type AlgorithmSynonymReference = {
	synonymId: string;
};

export type AutocompletePhrase = {
	id: string;
	phrase: string;
	owner: string;
};

export type AlgorithmAutocompletePhraseReference = {
	autocompletePhraseId: string;
};

export type AlgorithmPinnedResultReference = {
	pinnedResultId: string;
	status: "Active" | "Inactive";
};

export type AlgorithmPinnedResult = PinnedResult & {
	status: "Active" | "Inactive";
};

export const initialAlgorithms: Algorithm[] = [
	{
		id: "1",
		name: "Main Site Search",
		publishState: "Published",
		creationDate: "2023-10-25",
		owner: "Alice Johnson",
	},
	{
		id: "2",
		name: "Cycling Gear Optimization",
		publishState: "Draft",
		creationDate: "2023-11-02",
		owner: "Bob Smith",
		type: "Custom",
	},
];

export const initialPinnedResults: PinnedResult[] = [
	{
		id: "1",
		query: "return policy",
		destination: "https://stride.com/help/returns",
		owner: "Support Team",
	},
	{
		id: "2",
		query: "shipping rates",
		destination: "https://stride.com/help/shipping",
		owner: "Logistics",
	},
	{
		id: "3",
		query: "running shoes",
		destination: "https://stride.com/products/runner-elite",
		owner: "Marketing",
	},
];

export const initialRelatedQueries: RelatedQuery[] = [
	{
		id: "1",
		query: "sneakers",
		synonyms: ["shoes", "trainers", "kicks"],
		owner: "Merchandising",
	},
	{
		id: "2",
		query: "jacket",
		synonyms: ["coat", "parka", "windbreaker"],
		owner: "Merchandising",
	},
];

export const initialSynonyms: Synonym[] = [
	{
		id: "1",
		term: "trousers",
		synonyms: ["pants", "slacks", "chinos"],
		type: "Two-way",
		owner: "Merchandising",
	},
	{
		id: "2",
		term: "mobile",
		synonyms: ["phone", "cellphone", "smartphone"],
		type: "One-way",
		owner: "IT",
	},
];

export const initialAutocompletePhrases: AutocompletePhrase[] = [
	{
		id: "1",
		phrase: "running shoes for men",
		owner: "Marketing",
	},
	{
		id: "2",
		phrase: "winter jackets sale",
		owner: "Merchandising",
	},
];

export type User = {
	id: string;
	name: string;
	email: string;
	role: "Admin" | "Editor" | "Viewer";
	avatar?: string;
};

export const initialUsers: User[] = [
	{
		id: "1",
		name: "Alice Johnson",
		email: "alice.johnson@example.com",
		role: "Admin",
	},
	{
		id: "2",
		name: "Bob Smith",
		email: "bob.smith@example.com",
		role: "Editor",
	},
	{
		id: "3",
		name: "Carol Williams",
		email: "carol.williams@example.com",
		role: "Editor",
	},
	{
		id: "4",
		name: "David Brown",
		email: "david.brown@example.com",
		role: "Viewer",
	},
];

// Property Groups - Central registry for organizing properties in the UI
export type PropertyGroup = {
	id: string;
	name: string;
	description?: string;
};

export const initialPropertyGroups: PropertyGroup[] = [
	{
		id: "content",
		name: "Content",
		description: "Main content and data fields",
	},
	{
		id: "design",
		name: "Design",
		description: "Visual elements, images, and layout",
	},
	{
		id: "actions",
		name: "Actions",
		description: "Call-to-actions, buttons, and links",
	},
	{
		id: "settings",
		name: "Settings",
		description: "Configuration and behavior options",
	},
	{
		id: "appearance",
		name: "Appearance",
		description: "Visual styles and templates",
	},
	{
		id: "geo-seo",
		name: "GEO & SEO",
		description: "Geographic targeting and search engine optimization",
	},
	{
		id: "categories-tags",
		name: "Categories & Tags",
		description: "Taxonomy and content classification",
	},
	{
		id: "basic",
		name: "Basic",
		description: "Basic or essential fields",
	},
	{
		id: "social",
		name: "Social",
		description: "Social media related fields",
	},
	{
		id: "event-details",
		name: "Event Details",
		description: "Event timing and schedule information",
	},
	{
		id: "location",
		name: "Location",
		description: "Physical and virtual location details",
	},
	{
		id: "registration",
		name: "Registration",
		description: "Registration and signup information",
	},
];

export type PropertyType =
	| "String"
	| "LongString"
	| "XhtmlString"
	| "Int"
	| "Double"
	| "Boolean"
	| "DateTime"
	| "ContentReference"
	| "ContentArea"
	| "Url"
	| "LinkItem"
	| "LinkItemCollection"
	| "PageReference"
	| "ImageReference"
	| "VideoReference"
	| "SelectOne"
	| "SelectMany"
	| "Guid"
	// Legacy types for backwards compatibility
	| "text"
	| "textarea"
	| "richtext"
	| "link"
	| "reference"
	| "address"
	| "outline"
	| "checkbox"
	| "seo";

export type Property = {
	id: string;
	name: string;
	displayName?: string;
	type: PropertyType;
	required?: boolean;
	searchable?: boolean;
	cultureSpecific?: boolean;
	groupName?: string; // Property group for organizing (e.g., "Content", "Settings", "SEO")
	order?: number;
	description?: string;
	defaultValue?: any;
	/** Controls how String type properties are rendered - input (default) or textarea */
	displayAs?: "input" | "textarea";
	/** when type is reference this points to a collection like 'users' */
	of?: string;
	/** For reference types - allowed content types */
	allowedTypes?: string[];
	/** For reference types - restricted/excluded content types */
	restrictedTypes?: string[];
	/** For selection types */
	options?: { label: string; value: string }[];
	/** Validation rules */
	validation?: {
		minLength?: number;
		maxLength?: number;
		min?: number;
		max?: number;
		pattern?: string;
	};
};

export type VariantDimension = {
	id: string;
	name: string;
	values: string[];
};

export type MediaType = "Image" | "Video" | "Audio" | "Documents" | "Archives" | "Web Files" | "Program Files";

export type CompositionDisplayAs = "Section" | "Element" | "FormElement";

export type MappingTransformationType =
	| "direct"          // Direct 1:1 mapping
	| "concat"          // Concatenate multiple fields
	| "default";        // Use default value if source is empty

export type PropertyMapping = {
	id: string;
	sourcePropertyId: string;       // Property ID from source
	targetPropertyId: string;       // Property ID from target
	transformation: MappingTransformationType;
	transformationConfig?: {
		// For concat
		separator?: string;
		sourcePropertyIds?: string[];

		// For default
		defaultValue?: any;
	};
	required?: boolean;
	description?: string;
};

export type ContentTypeMapping = {
	id: string;
	name: string;
	displayName?: string;
	description?: string;
	sourceContentTypeId: string;    // Content type being mapped FROM
	targetContentTypeId: string;    // Content type being mapped TO
	propertyMappings: PropertyMapping[];
	createdAt: string;
	modifiedAt?: string;
};

export type ContentType = {
	id: string;
	name: string;
	displayName: string;
	baseType: "Page" | "Experience" | "Media" | "Product" | "Block" | "Section";
	mediaType?: MediaType;
	description?: string;
	guid?: string;
	groupName?: string;
	sortOrder?: number;
	isAvailable?: boolean;
	availableForComposition?: boolean;
	compositionDisplayAs?: CompositionDisplayAs[];
	// AvailableContentTypesAttribute (parent-side control)
	availableContentTypes?: {
		availability?: "All" | "None"; // Default behavior: All means all types allowed, None means no types allowed
		include?: string[]; // Explicitly allow ONLY these child types (overrides availability)
		exclude?: string[]; // Explicitly disallow these child types from otherwise allowed types
	};
	// Child-side control (IncludeOn/ExcludeOn on the attribute)
	includeOn?: string[]; // This type can ONLY be created under these parent types
	excludeOn?: string[]; // This type CANNOT be created under these parent types
	properties: Property[];
	variantDimensions?: VariantDimension[];
	modifiedAt?: string;
	modifiedBy?: string;
	// CMP-specific optional fields (for unified CMP/CMS content types)
	source?: "cmp" | "cms"; // Track origin system
	apiIdentifier?: string; // CMP: External API identifier for programmatic access
	version?: string; // CMP: Version tracking (e.g., "_v1")
	defaultLocale?: string; // CMP: Default language locale (e.g., "en-US")
	modelType?: "component" | "content"; // CMP: Classification as component or content type
	coverImage?: string; // CMP: Cover image URL for visual representation
	isActive?: boolean; // CMP: Active/inactive status
	// Content type mappings
	mappings?: ContentTypeMapping[]; // Mappings defined for this content type
};

export const initialContentTypes: ContentType[] = [
	{
		id: "ct-header",
		name: "Header",
		displayName: "Header",
		baseType: "Block",
		description: "Site header block with navigation",
		groupName: "Group header",
		guid: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
		isAvailable: true,
		modifiedAt: "2024-01-13T10:30:00Z",
		modifiedBy: "Alice Johnson",
		properties: [
			{ id: "siteName", name: "SiteName", displayName: "Site Name", type: "String", groupName: "Content", order: 1, required: true, validation: { maxLength: 100 } },
			{ id: "logo", name: "Logo", displayName: "Logo", type: "ImageReference", groupName: "Content", order: 2 },
			{ id: "navigationLinks", name: "NavigationLinks", displayName: "Navigation Links", type: "LinkItemCollection", groupName: "Content", order: 3 },
			{ id: "ctaButtonText", name: "CtaButtonText", displayName: "CTA Button Text", type: "String", groupName: "Content", order: 4, validation: { maxLength: 50 } },
			{ id: "ctaButtonUrl", name: "CtaButtonUrl", displayName: "CTA Button URL", type: "Url", groupName: "Content", order: 5 },
			{ id: "isSticky", name: "IsSticky", displayName: "Sticky Header", type: "Boolean", groupName: "Settings", order: 6, description: "Keep the header fixed at the top when scrolling" },
			{ id: "showSearch", name: "ShowSearch", displayName: "Show Search", type: "Boolean", groupName: "Settings", order: 7 },
		],
	},
	{
		id: "ct-page",
		name: "Page",
		displayName: "Page",
		baseType: "Experience",
		description: "Standard page (uses outlines)",
		groupName: "Standard",
		guid: "b2c3d4e5-f6a7-8901-bcde-f23456789012",
		isAvailable: true,
		modifiedAt: "2024-01-10T14:20:00Z",
		modifiedBy: "Bob Smith",
		properties: [
			// Content group
			{ id: "mainOutline", name: "Main", displayName: "Main Content", type: "outline", groupName: "Content", order: 1 },

			// GEO & SEO group
			{ id: "seo", name: "SEO", displayName: "SEO Settings", type: "ContentReference", allowedTypes: ["ct-seo"], groupName: "GEO & SEO", order: 1 },

			// Categories & Tags group
			{ id: "categories", name: "Categories", displayName: "Categories", type: "SelectMany", groupName: "Categories & Tags", order: 1, description: "Page categories" },
			{ id: "tags", name: "Tags", displayName: "Tags", type: "SelectMany", groupName: "Categories & Tags", order: 2, description: "Page tags" },
		],
	},
	{
		id: "ct-blog-post",
		name: "Blog Post",
		displayName: "Blog Post",
		baseType: "Page",
		description: "A standard blog/article page",
		availableContentTypes: { availability: "None" }, // Blog posts don't allow any children
		includeOn: ["ct-blog-listing"], // Can only be created under Blog Listing pages
		properties: [
			{ id: "title", name: "Title", displayName: "Title", type: "String", required: true, groupName: "Content", order: 1 },
			{ id: "subtitle", name: "Subtitle", displayName: "Subtitle", type: "String", groupName: "Content", order: 2 },
			{ id: "category", name: "Category", displayName: "Category", type: "String", groupName: "Content", order: 3 },
			{ id: "readingTime", name: "Reading Time", displayName: "Reading Time", type: "String", groupName: "Content", order: 4 },
			{ id: "publishDate", name: "Publish Date", displayName: "Publish Date", type: "String", groupName: "Content", order: 5 },
			{ id: "featuredImage", name: "Featured Image", displayName: "Featured Image", type: "ContentReference", allowedTypes: ["ct-image", "ct-image-block"], groupName: "Content", order: 6 },
			{ id: "heroLogo", name: "Hero Logo", displayName: "Hero Logo", type: "ContentReference", allowedTypes: ["ct-image", "ct-image-block"], groupName: "Content", order: 7 },
			{ id: "body", name: "Body", displayName: "Body", type: "XhtmlString", required: true, groupName: "Content", order: 7 },
			{ id: "author", name: "Author", displayName: "Author", type: "ContentReference", allowedTypes: ["ct-author"], required: true, groupName: "Content", order: 8 },
			{ id: "ctaHeading", name: "CTA Heading", displayName: "CTA Heading", type: "String", groupName: "Actions", order: 1 },
			{ id: "ctaPrimaryText", name: "CTA Primary Text", displayName: "CTA Primary Button", type: "String", groupName: "Actions", order: 2 },
			{ id: "ctaPrimaryLink", name: "CTA Primary Link", displayName: "CTA Primary Link", type: "String", groupName: "Actions", order: 3 },
			{ id: "ctaSecondaryText", name: "CTA Secondary Text", displayName: "CTA Secondary Button", type: "String", groupName: "Actions", order: 4 },
			{ id: "ctaSecondaryLink", name: "CTA Secondary Link", displayName: "CTA Secondary Link", type: "String", groupName: "Actions", order: 5 },
			{ id: "seo", name: "SEO", displayName: "SEO Settings", type: "ContentReference", allowedTypes: ["ct-seo"], groupName: "GEO & SEO", order: 1 },
		],
	},
	{
		id: "ct-blog-listing",
		name: "Blog Listing",
		displayName: "Blog Listing",
		baseType: "Page",
		description: "A blog listing page that can only contain blog posts",
		groupName: "Standard",
		guid: "c3d4e5f6-a7b8-9012-cdef-g34567890123",
		isAvailable: true,
		availableContentTypes: { include: ["ct-blog-post"] }, // Only allow blog posts as children
		modifiedAt: new Date().toISOString(),
		modifiedBy: "System",
		properties: [
			{ id: "title", name: "Title", displayName: "Title", type: "String", required: true, groupName: "Content", order: 1 },
			{ id: "subtitle", name: "Subtitle", displayName: "Subtitle", type: "String", groupName: "Content", order: 2 },
			{ id: "seo", name: "SEO", displayName: "SEO Settings", type: "ContentReference", allowedTypes: ["ct-seo"], groupName: "GEO & SEO", order: 1 },
		],
	},
	{
		id: "ct-event",
		name: "Event",
		displayName: "Event",
		baseType: "Page",
		description: "An event with date, location, and registration details",
		availableContentTypes: { availability: "None" },
		includeOn: ["ct-event-listing"],
		properties: [
			{ id: "title", name: "Title", displayName: "Event Title", type: "String", required: true, groupName: "Content", order: 1 },
			{ id: "subtitle", name: "Subtitle", displayName: "Subtitle", type: "String", groupName: "Content", order: 2 },
			{ id: "featuredImage", name: "Featured Image", displayName: "Event Banner", type: "ContentReference", allowedTypes: ["ct-image", "ct-image-block"], groupName: "Content", order: 3 },
			{ id: "description", name: "Description", displayName: "Event Description", type: "XhtmlString", required: true, groupName: "Content", order: 4 },
			{ id: "startDate", name: "Start Date", displayName: "Start Date & Time", type: "DateTime", required: true, groupName: "Event Details", order: 1 },
			{ id: "endDate", name: "End Date", displayName: "End Date & Time", type: "DateTime", groupName: "Event Details", order: 2 },
			{ id: "timezone", name: "Timezone", displayName: "Timezone", type: "String", groupName: "Event Details", order: 3 },
			{ id: "locationType", name: "Location Type", displayName: "Location Type", type: "String", groupName: "Event Details", order: 4 },
			{ id: "venueName", name: "Venue Name", displayName: "Venue Name", type: "String", groupName: "Location", order: 1 },
			{ id: "address", name: "Address", displayName: "Street Address", type: "String", groupName: "Location", order: 2 },
			{ id: "city", name: "City", displayName: "City", type: "String", groupName: "Location", order: 3 },
			{ id: "state", name: "State", displayName: "State/Province", type: "String", groupName: "Location", order: 4 },
			{ id: "country", name: "Country", displayName: "Country", type: "String", groupName: "Location", order: 5 },
			{ id: "virtualLink", name: "Virtual Link", displayName: "Virtual Event Link", type: "String", groupName: "Location", order: 6 },
			{ id: "capacity", name: "Capacity", displayName: "Max Attendees", type: "Int", groupName: "Registration", order: 1 },
			{ id: "registrationUrl", name: "Registration URL", displayName: "Registration Link", type: "String", groupName: "Registration", order: 2 },
			{ id: "registrationDeadline", name: "Registration Deadline", displayName: "Registration Deadline", type: "DateTime", groupName: "Registration", order: 3 },
			{ id: "price", name: "Price", displayName: "Ticket Price", type: "String", groupName: "Registration", order: 4 },
			{ id: "organizer", name: "Organizer", displayName: "Event Organizer", type: "ContentReference", allowedTypes: ["ct-author"], groupName: "Content", order: 5 },
			{ id: "seo", name: "SEO", displayName: "SEO Settings", type: "ContentReference", allowedTypes: ["ct-seo"], groupName: "GEO & SEO", order: 1 },
		],
	},
	{
		id: "ct-event-listing",
		name: "Event Listing",
		displayName: "Event Listing",
		baseType: "Page",
		description: "An event listing page that can only contain events",
		groupName: "Standard",
		guid: "d4e5f6a7-b8c9-0123-defg-h45678901234",
		isAvailable: true,
		availableContentTypes: { include: ["ct-event"] },
		modifiedAt: new Date().toISOString(),
		modifiedBy: "System",
		properties: [
			{ id: "title", name: "Title", displayName: "Title", type: "String", required: true, groupName: "Content", order: 1 },
			{ id: "subtitle", name: "Subtitle", displayName: "Subtitle", type: "String", groupName: "Content", order: 2 },
			{ id: "seo", name: "SEO", displayName: "SEO Settings", type: "ContentReference", allowedTypes: ["ct-seo"], groupName: "GEO & SEO", order: 1 },
		],
	},
	{
		id: "ct-about-page",
		name: "About Page",
		displayName: "About Page",
		baseType: "Page",
		description: "Company about page",
		properties: [
			{ id: "title", name: "Title", displayName: "Title", type: "String", required: true, groupName: "Content", order: 1 },
			{ id: "about", name: "About (Stride)", displayName: "About (Stride)", type: "XhtmlString", groupName: "Content", order: 2 },
			{ id: "history", name: "History", displayName: "History", type: "LongString", groupName: "Content", order: 3 },
			{ id: "orgAddress", name: "Org address", displayName: "Organization Address", type: "String", groupName: "Content", order: 4 },
			{ id: "seo", name: "SEO", displayName: "SEO Settings", type: "ContentReference", allowedTypes: ["ct-seo"], groupName: "GEO & SEO", order: 1 },
		],
	},
	{
		id: "exp-landing-page",
		name: "Landing Page",
		displayName: "Landing Page",
		baseType: "Experience",
		description: "Landing page experience with main and aside outlines",
		properties: [
			{ id: "mainOutline", name: "Main", type: "outline" },
			{ id: "asideOutline", name: "Aside", type: "outline" },
			{ id: "seo", name: "SEO", displayName: "SEO Settings", type: "ContentReference", allowedTypes: ["ct-seo"], groupName: "GEO & SEO", order: 1 },
		],
		variantDimensions: [
			{ id: "experiment", name: "A/B Test", values: ["Control", "Variant A", "Variant B"] },
			{ id: "audience", name: "Audience", values: ["All Users", "New Users", "Returning Users", "VIP"] },
		],
	},
	{
		id: "exp-about-page",
		name: "About Page",
		displayName: "About Page",
		baseType: "Experience",
		description: "About section page with left sidebar navigation",
		properties: [
			{ id: "mainOutline", name: "Main", type: "outline" },
			{ id: "sidenavOutline", name: "Sidenav", type: "outline" },
		],
	},
	{
		id: "exp-event-page",
		name: "Event Page",
		displayName: "Event Page",
		baseType: "Experience",
		description: "Event landing page with hero, registration form, and content sections",
		properties: [
			{ id: "mainOutline", name: "Main", type: "outline" },
		],
	},
	{
		id: "ct-product",
		name: "Product",
		displayName: "Product",
		baseType: "Product",
		description: "A standard product",
		properties: [
			{ id: "name", name: "Name", displayName: "Name", type: "String", required: true, groupName: "Content", order: 1 },
			{ id: "description", name: "Description", displayName: "Description", type: "LongString", groupName: "Content", order: 2 },
			{ id: "price", name: "Price", displayName: "Price", type: "String", groupName: "Content", order: 3 },
		],
		variantDimensions: [
			{ id: "size", name: "Size", values: ["Small", "Medium", "Large", "XL"] },
			{ id: "color", name: "Color", values: ["Black", "White", "Blue", "Red"] },
		],
	},
	{
		id: "ct-block",
		name: "Block",
		displayName: "Block",
		baseType: "Block",
		description: "A reusable content block",
		properties: [{ id: "title", name: "Title", displayName: "Title", type: "String", required: true, groupName: "Content", order: 1 }],
	},
	{
		id: "ct-image",
		name: "Image",
		displayName: "Image",
		baseType: "Media",
		description: "An image asset",
		properties: [
			{ id: "src", name: "Image URL", displayName: "Image URL", type: "String", required: true, groupName: "Design", order: 1 },
			{ id: "alt", name: "Alt Text", displayName: "Alt Text", type: "String", groupName: "Design", order: 2 },
			{ id: "width", name: "Width", displayName: "Width", type: "Int", groupName: "Design", order: 1 },
			{ id: "height", name: "Height", displayName: "Height", type: "Int", groupName: "Design", order: 2 },
		],
		variantDimensions: [
			{ id: "size", name: "Size", values: ["Original", "Large (1920px)", "Medium (800px)", "Thumbnail (200px)"] },
			{ id: "format", name: "Format", values: ["JPEG", "WebP", "PNG", "AVIF"] },
			{ id: "crop", name: "Crop", values: ["Original", "1:1 Square", "16:9 Landscape", "4:3 Standard"] },
		],
	},
	{
		id: "ct-image-block",
		name: "Image",
		displayName: "Image",
		baseType: "Block",
		description: "An image block for page layouts",
		properties: [
			{
				id: "image",
				name: "Image",
				displayName: "Image",
				type: "ImageReference",
				required: true,
				groupName: "Content",
				order: 1
			},
			{
				id: "width",
				name: "Width Override",
				displayName: "Width Override",
				type: "String",
				groupName: "Design",
				order: 2,
				description: "Override width (e.g., '100%', '400px', 'auto')",
				defaultValue: "auto"
			},
			{
				id: "height",
				name: "Height Override",
				displayName: "Height Override",
				type: "String",
				groupName: "Design",
				order: 3,
				description: "Override height (e.g., '300px', 'auto')",
				defaultValue: "auto"
			}
		]
	},
	{
		id: "ct-heading",
		name: "Heading",
		displayName: "Heading",
		baseType: "Block",
		description: "A heading block",
		properties: [
			{ id: "text", name: "Text", displayName: "Text", type: "String", required: true, groupName: "Content", order: 1 },
			{ id: "accent", name: "Accent", displayName: "Accent Text", type: "String", required: false, groupName: "Content", order: 2, description: "Optional rotated accent text displayed above the heading" },
			{
				id: "level",
				name: "Level",
				displayName: "Heading Level",
				type: "SelectOne",
				groupName: "Appearance",
				options: [
					{ label: "H1 (Largest)", value: "h1" },
					{ label: "H2", value: "h2" },
					{ label: "H3", value: "h3" },
					{ label: "H4", value: "h4" },
					{ label: "H5", value: "h5" },
					{ label: "H6 (Smallest)", value: "h6" }
				],
				defaultValue: "h2"
			},
			{
				id: "template",
				name: "Template",
				displayName: "Visual Style",
				type: "SelectOne",
				groupName: "Appearance",
				options: [
					{ label: "Default", value: "default" },
					{ label: "Prominent", value: "prominent" },
					{ label: "Subtle", value: "subtle" },
					{ label: "Red Accent", value: "accent-red" },
					{ label: "Blue Accent", value: "accent-blue" }
				],
				defaultValue: "default"
			}
		],
	},
	{
		id: "ct-number-line",
		name: "NumberLine",
		displayName: "Number Line",
		baseType: "Block",
		description: "A number badge with horizontal line separator",
		properties: [
			{ id: "number", name: "Number", displayName: "Number", type: "String", required: false, groupName: "Content", order: 1, description: "Number to display (e.g., '01', '02'). Leave empty for line only." }
		],
	},
	{
		id: "ct-text",
		name: "Text",
		displayName: "Text",
		baseType: "Block",
		description: "A text block",
		properties: [
			{ id: "text", name: "Text", displayName: "Text", type: "LongString", required: true, groupName: "Content", order: 1 },
			{
				id: "template",
				name: "Template",
				displayName: "Visual Style",
				type: "SelectOne",
				groupName: "Appearance",
				options: [
					{ label: "Default", value: "default" },
					{ label: "Prominent", value: "prominent" },
					{ label: "Subtle", value: "subtle" }
				],
				defaultValue: "default"
			}
		],
	},
	{
		id: "ct-rich-text",
		name: "Rich Text",
		displayName: "Rich Text",
		baseType: "Block",
		description: "A rich text block supporting simple markup",
		properties: [{ id: "richtext", name: "Rich Text", displayName: "Rich Text", type: "XhtmlString", required: true, groupName: "Content", order: 1 }],
	},
	{
		id: "ct-button",
		name: "Button",
		displayName: "Button",
		baseType: "Block",
		description: "A button block",
		properties: [
			{ id: "label", name: "Label", displayName: "Label", type: "String", required: true, groupName: "Content", order: 1 },
			{ id: "url", name: "URL", displayName: "URL", type: "Url", groupName: "Content", order: 2 },
			{
				id: "template",
				name: "Template",
				displayName: "Button Style",
				type: "SelectOne",
				groupName: "Appearance",
				options: [
					{ label: "Primary", value: "primary" },
					{ label: "Secondary", value: "secondary" },
					{ label: "Subtle", value: "subtle" }
				],
				defaultValue: "primary"
			}
		],
	},
	{
		id: "ct-section-header",
		name: "Section Header",
		displayName: "Section Header",
		baseType: "Block",
		description: "A section header block with vertical accent label, heading, and body text",
		properties: [
			{
				id: "number",
				name: "Number",
				displayName: "Section Number",
				type: "String",
				groupName: "Content",
				order: 1,
				description: "Optional section number badge (e.g., '01', '02')"
			},
			{
				id: "accent",
				name: "Accent Text",
				displayName: "Accent Label",
				type: "String",
				groupName: "Content",
				order: 2,
				description: "Vertical accent text label (e.g., 'JOIN US - NEW VIEW')",
				defaultValue: "JOIN US - NEW VIEW"
			},
			{
				id: "heading",
				name: "Heading",
				displayName: "Heading",
				type: "LongString",
				required: true,
				groupName: "Content",
				order: 3,
				description: "Main heading text"
			},
			{
				id: "body",
				name: "Body Text",
				displayName: "Body Text",
				type: "LongString",
				groupName: "Content",
				order: 4,
				description: "Optional body paragraph text",
				displayAs: "textarea"
			}
		],
	},
	{
		id: "ct-hero",
		name: "Hero",
		displayName: "Hero Section",
		baseType: "Block",
		description: "A full-width hero section with heading, subheading, buttons, and optional app mockup",
		properties: [
			{
				id: "badge",
				name: "Badge Text",
				displayName: "Badge Text",
				type: "String",
				groupName: "Content",
				order: 0,
				description: "Optional badge text above heading (e.g., 'STRIDE PLATFORM')",
				defaultValue: ""
			},
			{
				id: "heading",
				name: "Heading",
				displayName: "Heading",
				type: "LongString",
				required: true,
				groupName: "Content",
				order: 1,
				description: "Main hero heading",
				defaultValue: "Set it. Sweat it. Send it."
			},
			{
				id: "subheading",
				name: "Subheading",
				displayName: "Subheading",
				type: "String",
				groupName: "Content",
				order: 2,
				description: "Hero subheading text",
				defaultValue: "Let the streets, and the world know."
			},
			{
				id: "primaryButton",
				name: "Primary Button",
				displayName: "Primary Button Text",
				type: "String",
				groupName: "Content",
				order: 3,
				description: "Text for the primary CTA button",
				defaultValue: "GET STARTED"
			},
			{
				id: "secondaryButton",
				name: "Secondary Button",
				displayName: "Secondary Button Text",
				type: "String",
				groupName: "Content",
				order: 4,
				description: "Text for the secondary button",
				defaultValue: "BOOK A DEMO"
			},
			{
				id: "backgroundImage",
				name: "Background Image",
				displayName: "Background Image",
				type: "String",
				groupName: "Appearance",
				order: 5,
				description: "URL or path to the background image",
				defaultValue: "/stride-hero/hero.png"
			},
			{
				id: "showAppMockup",
				name: "Show App Mockup",
				displayName: "Show App Mockup",
				type: "SelectOne",
				groupName: "Appearance",
				order: 6,
				description: "Show or hide the app mockup on the right side",
				options: [
					{ label: "Show", value: "true" },
					{ label: "Hide", value: "false" }
				],
				defaultValue: "true"
			},
			{
				id: "appMockupImage",
				name: "App Mockup Image",
				displayName: "App Mockup Image",
				type: "String",
				required: false,
				groupName: "Appearance",
				order: 7,
				description: "URL or path to custom app mockup image (optional - uses default if empty)",
				defaultValue: ""
			},
			{
				id: "template",
				name: "Template",
				displayName: "Layout Style",
				type: "String",
				groupName: "Appearance",
				order: 8,
				description: "Hero layout template",
				defaultValue: "default"
			}
		],
	},
	{
		id: "ct-card",
		name: "Card",
		displayName: "Feature Card",
		baseType: "Block",
		description: "A feature card with icon, label, description, and optional background image",
		properties: [
			{
				id: "icon",
				name: "Icon",
				displayName: "Icon",
				type: "String",
				groupName: "Content",
				order: 1,
				description: "Icon SVG path or emoji to display",
				defaultValue: "/stride-icons/sticky-note.svg"
			},
			{
				id: "label",
				name: "Label",
				displayName: "Label",
				type: "String",
				required: true,
				groupName: "Content",
				order: 2,
				description: "Card label text (uppercase)",
				defaultValue: "CHALLENGES"
			},
			{
				id: "description",
				name: "Description",
				displayName: "Description",
				type: "String",
				required: true,
				groupName: "Content",
				order: 3,
				description: "Card description text",
				defaultValue: "Plan work without the back-and-forth"
			},
			{
				id: "backgroundImage",
				name: "Background Image",
				displayName: "Background Image",
				type: "ImageReference",
				required: false,
				groupName: "Appearance",
				order: 4,
				description: "Optional background image",
				defaultValue: ""
			},
			{
				id: "template",
				name: "Template",
				displayName: "Style",
				type: "String",
				groupName: "Appearance",
				order: 5,
				description: "Card style template",
				defaultValue: "default"
			}
		],
	},
	{
		id: "ct-feature-card",
		name: "FeatureCard",
		displayName: "Stride Feature Card",
		baseType: "Block",
		description: "A simple feature card with icon, label, and description (no background image)",
		properties: [
			{
				id: "icon",
				name: "Icon",
				displayName: "Icon",
				type: "String",
				groupName: "Content",
				order: 1,
				description: "Icon SVG path or emoji to display",
				defaultValue: "/stride-icons/sticky-note.svg"
			},
			{
				id: "label",
				name: "Label",
				displayName: "Label",
				type: "String",
				required: true,
				groupName: "Content",
				order: 2,
				description: "Card label text",
				defaultValue: "Feature"
			},
			{
				id: "description",
				name: "Description",
				displayName: "Description",
				type: "String",
				required: true,
				groupName: "Content",
				order: 3,
				description: "Card description text",
				defaultValue: "Feature description"
			},
			{
				id: "style",
				name: "Style",
				displayName: "Card Style",
				type: "String",
				groupName: "Appearance",
				order: 4,
				description: "Card style variant: 'regular' (frosted glass background) or 'compact' (no background, smaller text)",
				defaultValue: "regular"
			}
		],
	},
	{
		id: "ct-app-preview",
		name: "AppPreview",
		displayName: "App Preview",
		baseType: "Block",
		description: "A mobile app mockup preview with configurable height and opacity",
		properties: [
			{
				id: "appImage",
				name: "App Image",
				displayName: "App Image",
				type: "String",
				required: true,
				groupName: "Content",
				order: 1,
				description: "Path to app mockup image",
				defaultValue: "/stride-hero/app1.png"
			},
			{
				id: "containerMarginTop",
				name: "Container Margin Top",
				displayName: "Container Margin Top",
				type: "String",
				groupName: "Appearance",
				order: 2,
				description: "Percentage margin-top for container staggering (e.g., '20' for 20%)",
				defaultValue: "0"
			}
		],
	},
	{
		id: "ct-sidebar-item",
		name: "Sidebar Item",
		displayName: "Sidebar Item",
		baseType: "Block",
		description: "A sidebar item for EVENTS/NEWS sections with title and description",
		properties: [
			{
				id: "title",
				name: "Title",
				displayName: "Title",
				type: "String",
				required: true,
				groupName: "Content",
				order: 1,
				description: "Item title (18px)",
			},
			{
				id: "description",
				name: "Description",
				displayName: "Description",
				type: "String",
				required: true,
				groupName: "Content",
				order: 2,
				description: "Item description (14px)",
			}
		],
	},
	{
		id: "ct-author",
		name: "Author",
		displayName: "Author",
		baseType: "Block",
		description: "An author block for blog posts and articles",
		properties: [
			{
				id: "name",
				name: "Name",
				displayName: "Name",
				type: "String",
				required: true,
				groupName: "Content",
				order: 1,
				description: "Author's full name"
			},
			{
				id: "bio",
				name: "Bio",
				displayName: "Bio",
				type: "LongString",
				groupName: "Content",
				order: 2,
				description: "Author biography or description",
				displayAs: "textarea"
			},
			{
				id: "image",
				name: "Image",
				displayName: "Profile Image",
				type: "ImageReference",
				groupName: "Content",
				order: 3,
				description: "Author profile photo"
			},
			{
				id: "email",
				name: "Email",
				displayName: "Email",
				type: "String",
				groupName: "Content",
				order: 4,
				description: "Author's email address"
			},
			{
				id: "website",
				name: "Website",
				displayName: "Website",
				type: "Url",
				groupName: "Content",
				order: 5,
				description: "Author's website or portfolio URL"
			}
		],
	},
	{
		id: "ct-input",
		name: "Input",
		displayName: "Input",
		baseType: "Block",
		description: "An input block",
		properties: [
			{ id: "label", name: "Label", displayName: "Label", type: "String", required: true, groupName: "Content", order: 1 },
			{ id: "placeholder", name: "Placeholder", displayName: "Placeholder", type: "String", groupName: "Content", order: 2 },
			{ id: "tooltip", name: "Tooltip", displayName: "Tooltip", type: "String", groupName: "Content", order: 3 },
			{ id: "required", name: "Required", displayName: "Required", type: "Boolean", groupName: "Settings", order: 1 },
		],
	},
	{
		id: "ct-seo",
		name: "SEO",
		displayName: "SEO Block",
		baseType: "Block",
		description: "SEO metadata block for pages and content",
		groupName: "GEO & SEO",
		isAvailable: true,
		properties: [
			{ id: "title", name: "Title", displayName: "Page Title", type: "String", groupName: "Basic", order: 1, description: "The page title shown in browser tabs and search results", validation: { maxLength: 60 } },
			{ id: "description", name: "Description", displayName: "Meta Description", type: "LongString", groupName: "Basic", order: 2, description: "A brief description for search engine results", validation: { maxLength: 160 } },
			{ id: "canonicalUrl", name: "CanonicalUrl", displayName: "Canonical URL", type: "Url", groupName: "Basic", order: 3, description: "The preferred URL for this page" },
			{ id: "robots", name: "Robots", displayName: "Robots Directive", type: "String", groupName: "Basic", order: 4, description: "Instructions for search engine crawlers (e.g., noindex, nofollow)" },
			{ id: "ogTitle", name: "OgTitle", displayName: "Open Graph Title", type: "String", groupName: "Social", order: 1 },
			{ id: "ogDescription", name: "OgDescription", displayName: "Open Graph Description", type: "LongString", groupName: "Social", order: 2 },
			{ id: "ogImage", name: "OgImage", displayName: "Open Graph Image", type: "ImageReference", groupName: "Social", order: 3 },
			{ id: "twitterTitle", name: "TwitterTitle", displayName: "Twitter Title", type: "String", groupName: "Social", order: 4 },
			{ id: "twitterDescription", name: "TwitterDescription", displayName: "Twitter Description", type: "LongString", groupName: "Social", order: 5 },
			{ id: "twitterImage", name: "TwitterImage", displayName: "Twitter Image", type: "ImageReference", groupName: "Social", order: 6 },
		],
	},
	// CMP Content Models (migrated to unified repository)
	{
		id: "cm-blog-post",
		name: "blog_post",
		displayName: "Blog Post",
		baseType: "Page",
		description: "A standard blog post with title, author, content, and metadata",
		properties: [
			{ id: "field-bp-title", name: "title", displayName: "Title", type: "String", required: true, cultureSpecific: true, description: "The main title of the blog post", groupName: "Content", order: 1 },
			{ id: "field-bp-author", name: "author", displayName: "Author", type: "String", required: true, description: "Author name", groupName: "Content", order: 2 },
			{ id: "field-bp-publish-date", name: "publish_date", displayName: "Publish Date", type: "DateTime", required: true, description: "When the post should be published", groupName: "Content", order: 1 },
			{ id: "field-bp-excerpt", name: "excerpt", displayName: "Excerpt", type: "LongString", cultureSpecific: true, description: "Short summary for previews and SEO", groupName: "Content", order: 3 },
			{ id: "field-bp-content", name: "content", displayName: "Content", type: "XhtmlString", required: true, cultureSpecific: true, description: "The main blog post content", groupName: "Content", order: 4 },
			{ id: "field-bp-featured-image", name: "featured_image", displayName: "Featured Image", type: "ImageReference", description: "Main image for the blog post", groupName: "Design", order: 1 },
			{ id: "field-bp-tags", name: "tags", displayName: "Tags", type: "String", description: "Tags for categorizing the post", groupName: "GEO & SEO", order: 1 },
			{ id: "field-bp-seo-keywords", name: "seo_keywords", displayName: "SEO Keywords", type: "String", cultureSpecific: true, description: "Keywords for search engine optimization", groupName: "GEO & SEO", order: 2 },
		],
		modifiedAt: new Date("2024-03-20T10:00:00Z").toISOString(),
		modifiedBy: "System",
		source: "cmp",
		apiIdentifier: "blog_post",
		version: "_v1",
		defaultLocale: "en-US",
		modelType: "content",
		isActive: true,
		mappings: [
			{
				id: "mapping-cmp-blog-to-cms-blog",
				name: "blog_post_to_cms_blog_post",
				displayName: "Blog Post → CMS Blog Post",
				description: "Maps CMP blog post fields to CMS Blog Post page type",
				sourceContentTypeId: "cm-blog-post",
				targetContentTypeId: "ct-blog-post",
				propertyMappings: [
					{ id: "pm-bp-title", sourcePropertyId: "field-bp-title", targetPropertyId: "title", transformation: "direct", required: true, description: "Title → Title" },
					{ id: "pm-bp-excerpt", sourcePropertyId: "field-bp-excerpt", targetPropertyId: "subtitle", transformation: "direct", description: "Excerpt → Subtitle" },
					{ id: "pm-bp-featured-image", sourcePropertyId: "field-bp-featured-image", targetPropertyId: "featuredImage", transformation: "direct", description: "Featured Image → Featured Image" },
					{ id: "pm-bp-hero-logo", sourcePropertyId: "field-bp-hero-logo", targetPropertyId: "heroLogo", transformation: "direct", description: "Hero Logo → Hero Logo" },
					{ id: "pm-bp-content", sourcePropertyId: "field-bp-content", targetPropertyId: "body", transformation: "direct", required: true, description: "Content → Body" },
					{ id: "pm-bp-author", sourcePropertyId: "field-bp-author", targetPropertyId: "author", transformation: "direct", required: true, description: "Author → Author" },
				],
				createdAt: "2024-03-20T10:00:00Z",
			},
		],
	},
	{
		id: "cm-article",
		name: "article",
		displayName: "Article",
		baseType: "Page",
		description: "Long-form editorial content with sections and rich media",
		properties: [
			{ id: "field-art-headline", name: "headline", displayName: "Headline", type: "String", required: true, cultureSpecific: true, description: "Main article headline", groupName: "Content", order: 1 },
			{ id: "field-art-subheadline", name: "subheadline", displayName: "Subheadline", type: "String", cultureSpecific: true, description: "Supporting headline text", groupName: "Content", order: 2 },
			{ id: "field-art-byline", name: "byline", displayName: "Byline", type: "String", required: true, description: "Author and publication information", groupName: "Content", order: 3 },
			{ id: "field-art-body", name: "body", displayName: "Body", type: "XhtmlString", required: true, cultureSpecific: true, description: "Main article content", groupName: "Content", order: 4 },
			{ id: "field-art-hero-image", name: "hero_image", displayName: "Hero Image", type: "ImageReference", description: "Large header image", groupName: "Design", order: 1 },
			{ id: "field-art-related-articles", name: "related_articles", displayName: "Related Articles", type: "ContentReference", description: "Links to related content", groupName: "Content", order: 1 },
		],
		modifiedAt: new Date("2024-03-20T10:30:00Z").toISOString(),
		modifiedBy: "System",
		source: "cmp",
		apiIdentifier: "article",
		version: "_v1",
		defaultLocale: "en-US",
		modelType: "content",
		isActive: true,
	},
	{
		id: "cm-banner",
		name: "banner",
		displayName: "Banner",
		baseType: "Block",
		description: "Promotional banner for campaigns and announcements",
		properties: [
			{ id: "field-ban-message", name: "message", displayName: "Message", type: "String", required: true, cultureSpecific: true, description: "Banner message text", groupName: "Content", order: 1 },
			{ id: "field-ban-cta-text", name: "cta_text", displayName: "CTA Text", type: "String", cultureSpecific: true, description: "Call-to-action button text", groupName: "Content", order: 2 },
			{ id: "field-ban-cta-link", name: "cta_link", displayName: "CTA Link", type: "Url", description: "Call-to-action destination URL", groupName: "Content", order: 3 },
			{ id: "field-ban-background-image", name: "background_image", displayName: "Background Image", type: "ImageReference", description: "Optional background image", groupName: "Design", order: 1 },
			{ id: "field-ban-dismissible", name: "dismissible", displayName: "Dismissible", type: "Boolean", description: "Allow users to dismiss the banner", groupName: "Settings", order: 1 },
			{ id: "field-ban-display-duration", name: "display_duration", displayName: "Display Duration", type: "Int", description: "How long to show banner (in days)", groupName: "Settings", order: 2 },
		],
		modifiedAt: new Date("2024-03-20T11:00:00Z").toISOString(),
		modifiedBy: "System",
		source: "cmp",
		apiIdentifier: "banner",
		version: "_v1",
		defaultLocale: "en-US",
		modelType: "component",
		isActive: true,
	},
	{
		id: "cm-hero-component",
		name: "hero_component",
		displayName: "Hero Component",
		baseType: "Block",
		description: "Large hero section with image, headline, and call-to-action",
		properties: [
			{ id: "field-hero-headline", name: "headline", displayName: "Headline", type: "String", required: true, cultureSpecific: true, description: "Main hero headline", groupName: "Content", order: 1 },
			{ id: "field-hero-subheadline", name: "subheadline", displayName: "Subheadline", type: "String", cultureSpecific: true, description: "Supporting text below headline", groupName: "Content", order: 2 },
			{ id: "field-hero-description", name: "description", displayName: "Description", type: "LongString", cultureSpecific: true, description: "Detailed description text", groupName: "Content", order: 3 },
			{ id: "field-hero-background", name: "background_image", displayName: "Background Image", type: "ImageReference", required: true, description: "Large background image", groupName: "Design", order: 1 },
			{ id: "field-hero-primary-cta", name: "primary_cta_text", displayName: "Primary CTA Text", type: "String", cultureSpecific: true, description: "Primary button text", groupName: "Actions", order: 1 },
			{ id: "field-hero-primary-link", name: "primary_cta_link", displayName: "Primary CTA Link", type: "Url", description: "Primary button destination", groupName: "Actions", order: 2 },
			{ id: "field-hero-secondary-cta", name: "secondary_cta_text", displayName: "Secondary CTA Text", type: "String", cultureSpecific: true, description: "Secondary button text", groupName: "Actions", order: 3 },
			{ id: "field-hero-secondary-link", name: "secondary_cta_link", displayName: "Secondary CTA Link", type: "Url", description: "Secondary button destination", groupName: "Actions", order: 4 },
		],
		modifiedAt: new Date("2024-03-20T11:30:00Z").toISOString(),
		modifiedBy: "System",
		source: "cmp",
		apiIdentifier: "hero_component",
		version: "_v1",
		defaultLocale: "en-US",
		modelType: "component",
		isActive: true,
	},
	{
		id: "cm-email",
		name: "email",
		displayName: "Email",
		baseType: "Media",
		description: "Email template for marketing campaigns",
		properties: [
			{ id: "field-email-subject", name: "subject_line", displayName: "Subject Line", type: "String", required: true, cultureSpecific: true, description: "Email subject line", groupName: "Content", order: 1 },
			{ id: "field-email-preheader", name: "preheader", displayName: "Preheader Text", type: "String", cultureSpecific: true, description: "Preview text shown in inbox", groupName: "Content", order: 2 },
			{ id: "field-email-from-name", name: "from_name", displayName: "From Name", type: "String", required: true, description: "Sender name", groupName: "Settings", order: 1 },
			{ id: "field-email-from-address", name: "from_address", displayName: "From Address", type: "String", required: true, description: "Sender email address", groupName: "Settings", order: 2 },
			{ id: "field-email-body", name: "body", displayName: "Email Body", type: "XhtmlString", required: true, cultureSpecific: true, description: "Main email content (HTML)", groupName: "Content", order: 3 },
			{ id: "field-email-cta", name: "cta_text", displayName: "CTA Text", type: "String", cultureSpecific: true, description: "Call-to-action button text", groupName: "Actions", order: 1 },
			{ id: "field-email-cta-link", name: "cta_link", displayName: "CTA Link", type: "Url", description: "Call-to-action destination", groupName: "Actions", order: 2 },
			{ id: "field-email-footer", name: "footer_text", displayName: "Footer Text", type: "LongString", cultureSpecific: true, description: "Email footer content", groupName: "Content", order: 4 },
			{ id: "field-email-unsubscribe", name: "unsubscribe_link", displayName: "Unsubscribe Link", type: "Url", required: true, description: "Unsubscribe page URL", groupName: "Settings", order: 3 },
		],
		modifiedAt: new Date("2024-03-20T12:00:00Z").toISOString(),
		modifiedBy: "System",
		source: "cmp",
		apiIdentifier: "email",
		version: "_v1",
		defaultLocale: "en-US",
		modelType: "content",
		isActive: true,
	},
];

export type EleProp = {
	type: "text" | "checkbox";
	label: string;
	value?: any;
};

export type EleDef = {
	type:
	| "ct-heading"
	| "ct-text"
	| "ct-rich-text"
	| "ct-input"
	| "ct-button"
	| "ct-section-header"
	| "ct-hero"
	| "ct-card"
	| "ct-feature-card"
	| "ct-app-preview"
	| "ct-sidebar-item"
	| "ct-image"
	| "ct-product"
	| string;
	properties: Record<string, any>;
};

export type EleMap = Record<string, EleDef>;

export type OutlineNode =
	| {
		id: string;
		name?: string;
		open?: boolean;
		children?: OutlineNode[]; // section/row nodes
		elements?: { id: string }[]; // column nodes
	}
	| {
		id: string; // element ref node (ele id)
	};

export type OutlineId = string;

export type Outline = {
	id: OutlineId;
	title: string;
	tree: any[]; // or OutlineNode[] if you want to type it tighter
	elements: EleMap; // <-- this fixes "Cannot find name 'EleMap'"
};

export type Page = {
	id: string;
	name: string;
	parentId: string | null;
	status: "Published" | "Draft" | "Review" | "Changed" | "In Trash";
	lastModified: string;
	contentTypeId: string;
	slug?: string;
	data?: Record<string, any>;
	variations?: {
		id: string;
		name: string;
		status: string;
		outlines?: Outline[];
		data?: Record<string, any>;
	}[];
	outlines?: Outline[]; // ALWAYS this for layouts
	/** When set, used by getAllContentItems instead of getPageTagsAndCategories for this page */
	tags?: string[];
	/** When set, used by getAllContentItems instead of getPageTagsAndCategories for this page */
	categories?: string[];
	/** Display template system (Optimizely pattern) */
	displayTemplateKey?: string;
	displaySettings?: Array<{key: string; value: string}>;
	/** CMP connection metadata - tracks connection to CMP content instance */
	cmpConnection?: {
		instanceId: string; // ID of connected CMP content instance
		modelId: string; // CMP model/content type ID
		mappingId?: string; // Optional: specific mapping to use
		syncStatus: "synced" | "out-of-sync" | "manual-override";
		lastSyncedAt?: string;
		syncMode: "auto" | "manual"; // Auto-sync on CMP changes or manual only
	};
	/** CMP Task association - tracks which task this page belongs to */
	cmpTaskMetadata?: {
		taskId: string; // ID of the CMP task (from URL /cmp/task/[id])
		taskName: string; // Display name of the task
		addedAt: string; // ISO timestamp when page was added to task
		applicationName?: string; // Name of the application this page was published to
		addedVia: "created" | "manual"; // How it was added: created via "Add to Application" or manually added
	};
};

export type Application = {
	id: string;
	name: string;
	appId: string;
	url?: string;
	startPageId?: string;
	modifiedAt?: string;
	modifiedBy?: string;
};

export const initialPages: Page[] = [
	{
		id: "page-site-home",
		name: "Homepage",
		parentId: null,
		status: "Published",
		lastModified: "2023-10-27",
		contentTypeId: "ct-page",
		displayTemplateKey: "defaultExperience",
		displaySettings: [
			{ key: "backgroundColor", value: "light-blue" },
			{ key: "spacing", value: "default" }
		],
		data: {
			seo: {
				en: {
					original: {
						title: "Stride - Personal Training App | Set it. Sweat it. Send it.",
						description: "Level up your game with Stride, your go-to personal training app that boosts workout efficiency with essential tools. Join the community today.",
						canonicalUrl: "https://stride.com/",
						robots: "index,follow",
						image: "https://stride.com/og-home.jpg",
						ogTitle: "Stride - Personal Training App",
						ogDescription: "Level up your game with Stride personal training app.",
						ogImage: "https://stride.com/og-home.jpg",
						twitterTitle: "Stride - Personal Training App",
						twitterDescription: "Level up your game with Stride personal training app.",
						twitterImage: "https://stride.com/og-home.jpg",
					},
				},
			},
		},
		variations: [
			{
				id: "original",
				name: "Original",
				status: "Published",
				outlines: [
					{
						id: "ol-home-main",
						title: "Main",
						tree: [
							// Hero Section
							{
								id: "sec-home-hero",
								name: "Hero",
								type: "ct-section",
								open: true,
								noPadding: true,
								displayTemplateKey: "defaultSection",
								displaySettings: [
									{ key: "colorScheme", value: "default" },
									{ key: "spacing", value: "default" }
								],
								children: [
									{
										id: "row-home-hero",
										open: true,
										children: [
											{
												id: "col-home-hero-content",
												open: true,
												elements: [
													{ id: "ele-hero-block" },
												],
											},
										],
									},
								],
							},
							// Section 1.5: What is Stride? - Two-column intro (New Figma Design)
							{
								id: "sec-stride-intro",
								name: "What is Stride?",
								open: true,
								displayTemplateKey: "defaultSection",
								displaySettings: [
									{ key: "colorScheme", value: "default" },
									{ key: "spacing", value: "default" },
								],
								children: [
									{
										id: "row-stride-intro",
										open: true,
										children: [
											{
												id: "col-intro-left",
												open: true,
												elements: [
													{ id: "ele-intro-number-line" },
													{ id: "ele-intro-heading" },
												],
											},
											{
												id: "col-intro-right",
												open: true,
												elements: [
													{ id: "ele-intro-line" },
													{ id: "ele-intro-body" },
												],
											},
										],
									},
								],
							},
							// Section 1.75: Three-column feature cards (New Figma Design)
							{
								id: "sec-challenges",
								name: "Challenges",
								open: true,
								displayTemplateKey: "defaultSection",
								displaySettings: [
									{ key: "colorScheme", value: "default" },
									{ key: "spacing", value: "default" },
								],
								children: [
									{
										id: "row-challenges",
										open: true,
										children: [
											{
												id: "col-challenge-1",
												open: true,
												elements: [
													{ id: "ele-challenge-card-1" },
												],
											},
											{
												id: "col-challenge-2",
												open: true,
												elements: [
													{ id: "ele-challenge-card-2" },
												],
											},
											{
												id: "col-challenge-3",
												open: true,
												elements: [
													{ id: "ele-challenge-card-3" },
												],
											},
										],
									},
								],
							},
							// Section 2: Level up your game - Cards variant
							{
								id: "sec-home-levelup-1",
								name: "Level Up - Challenges",
								type: "ct-section",
								open: true,
								displayTemplateKey: "defaultSection",
								displaySettings: [
									{ key: "colorScheme", value: "default" },
									{ key: "spacing", value: "top-only" }
								],
								children: [
									{
										id: "row-levelup-1",
										open: true,
										children: [
											{
												id: "col-levelup-1-text",
												open: true,
												elements: [
												{ id: "ele-levelup-1-number-line" },
												{ id: "ele-levelup-1-heading" },
												{ id: "ele-levelup-1-body" },
												],
											},
											{
												id: "col-levelup-1-cards",
												open: true,
												elements: [],
											},
										],
									},
								],
							},
								// App Showcase - Three app previews with fade effect
								{
									id: "sec-app-showcase",
									name: "App Showcase",
									open: true,
									displayTemplateKey: "defaultSection",
									displaySettings: [
										{ key: "colorScheme", value: "default" },
										{ key: "spacing", value: "none" },
									],
									children: [
										{
											id: "row-app-showcase",
											open: true,
											children: [
												{
													id: "col-app-preview-1",
													open: true,
													elements: [
														{ id: "ele-app-preview-1" },
													],
												},
												{
													id: "col-app-preview-2",
													open: true,
													elements: [
														{ id: "ele-app-preview-2" },
													],
												},
												{
													id: "col-app-preview-3",
													open: true,
													elements: [
														{ id: "ele-app-preview-3" },
													],
												},
											],
										},
									],
								},
							// Section 3: Level up your game - Buddies variant
							{
								id: "sec-home-levelup-2",
								name: "Level Up - Community",
								type: "ct-section",
								open: true,
								displayTemplateKey: "defaultSection",
								displaySettings: [
									{ key: "colorScheme", value: "default" },
									{ key: "spacing", value: "default" }
								],
								children: [
									{
										id: "row-levelup-2",
										open: true,
										children: [
											{
												id: "col-levelup-2-text",
												open: true,
												elements: [
												{ id: "ele-levelup-2-number-line" },
												{ id: "ele-levelup-2-heading" },
												{ id: "ele-levelup-2-body" },
												],
											},
											{
												id: "col-levelup-2-image",
												open: true,
												elements: [
													{ id: "ele-levelup-2-app-image" },
												],
											},
										],
									},
									{
										id: "row-feature-cards",
										open: true,
										children: [
											{
												id: "col-feature-card-1",
												open: true,
												elements: [
													{ id: "ele-feature-card-1" },
												],
											},
											{
												id: "col-feature-card-2",
												open: true,
												elements: [
													{ id: "ele-feature-card-2" },
												],
											},
											{
												id: "col-feature-card-3",
												open: true,
												elements: [
													{ id: "ele-feature-card-3" },
												],
											},
										],
									},
								],
							},
						// Section 4: Join Stride Today - Community variant
						{
							id: "sec-home-community",
							name: "Join Stride - Community",
							type: "ct-section",
							open: true,
							displayTemplateKey: "defaultSection",
							displaySettings: [
								{ key: "colorScheme", value: "default" },
								{ key: "spacing", value: "community" }
							],
							children: [
								{
									id: "row-community",
									open: true,
									children: [
										{
											id: "col-community-text",
											open: true,
											elements: [
												{ id: "ele-community-number-line" },
												{ id: "ele-community-heading" },
												{ id: "ele-community-body" },
											],
										},
										{
											id: "col-community-image",
											open: true,
											elements: [
												{ id: "ele-community-app-image" },
											],
										},
									],
								},
							],
						},
						{
							id: "sec-home-compact-features",
							name: "Compact Features",
							type: "ct-section",
							open: true,
							displayTemplateKey: "defaultSection",
							displaySettings: [
								{ key: "colorScheme", value: "default" },
								{ key: "spacing", value: "default" }
							],
							children: [
								{
									id: "row-features-grid",
									open: true,
									children: [
										{
											id: "col-feature-grid-1",
											open: true,
											elements: [
												{ id: "ele-feature-grid-1" },
											],
										},
										{
											id: "col-feature-grid-2",
											open: true,
											elements: [
												{ id: "ele-feature-grid-2" },
											],
										},
										{
											id: "col-feature-grid-3",
											open: true,
											elements: [
												{ id: "ele-feature-grid-3" },
											],
										},
										{
											id: "col-feature-grid-4",
											open: true,
											elements: [
												{ id: "ele-feature-grid-4" },
											],
										},
									],
								},
							],
						},
						],
						elements: {
							// Hero Elements
							"ele-hero-block": {
								type: "ct-hero",
								properties: {
									heading: "Set it. Sweat it.\nSend it.",
									subheading: "Let the streets, and the world know.",
									primaryButton: "GET STARTED",
									secondaryButton: "BOOK A DEMO",
									backgroundImage: "/stride-hero/hero.png",
									backgroundVideo: "https://cdn.midjourney.com/video/12166248-0ad6-4ab9-a545-022e30eef2ee/3.mp4",
									appMockupImage: "/stride-hero/app1.png",
									showAppMockup: "true",
								},
							},

							// Section 1.5 Elements (What is Stride? - New Figma Design)
							"ele-intro-number-line": {
								type: "ct-number-line",
								properties: {
									number: "01",
								},
							},
							"ele-intro-heading": {
								type: "ct-heading",
								properties: {
									text: "One home for every training block",
									accent: "01Why Stride",
									level: "h2",
									displayTemplateKey: "prominentHeading",
					displaySettings: [
						{ key: "size", value: "large" },
						{ key: "emphasis", value: "bold" },
					],
								},
							},
							"ele-intro-line": {
								type: "ct-number-line",
								properties: {
									number: "",
								},
							},
							"ele-intro-body": {
								type: "ct-text",
								properties: {
									text: "The platform serves as an always-on training headquarters where users can build shared season plans, stream biometric data, and keep workout-related conversations organized for quick decision-making.",
									displayTemplateKey: "defaultText",
					displaySettings: [
						{ key: "size", value: "default" },
						{ key: "emphasis", value: "normal" },
					],
								},
							},

							// Section 1.75 Elements (Three-column feature cards - New Figma Design)
							"ele-challenge-card-1": {
								type: "ct-card",
								properties: {
									title: "Command the platform",
									productType: "features",
									href: "#",
									backgroundImage: "/stride-hero/app1.png",
									displaySettings: [
										{ key: "style", value: "product" },
									],
								},
							},
							"ele-challenge-card-2": {
								type: "ct-card",
								properties: {
									title: "Ignite every challenge",
									productType: "challenges",
									href: "#",
									backgroundImage: "/stride-hero/app2.png",
									displaySettings: [
										{ key: "style", value: "product" },
									],
								},
							},
							"ele-challenge-card-3": {
								type: "ct-card",
								properties: {
									title: "Scale subscriptions",
									productType: "subscriptions",
									href: "#",
									backgroundImage: "/stride-hero/app3.png",
									displaySettings: [
										{ key: "style", value: "product" },
									],
								},
							},

							// Section 1.8 Elements (App Showcase)
							"ele-app-preview-1": {
								type: "ct-app-preview",
								properties: {
									appImage: "/stride-hero/app1.png",
									containerMarginTop: "20",
									style: "showcase",
									lenisSpeed: "1",
								},
							},
							"ele-app-preview-2": {
								type: "ct-app-preview",
								properties: {
									appImage: "/stride-hero/app2.png",
									containerMarginTop: "10",
									style: "showcase",
									lenisSpeed: "0.9",
								},
							},
							"ele-app-preview-3": {
								type: "ct-app-preview",
								properties: {
									appImage: "/stride-hero/app3.png",
									containerMarginTop: "0",
									style: "showcase",
									lenisSpeed: "0.8",
								},
							},

							// Section 1.9 Elements (Feature Cards)
							"ele-feature-card-1": {
								type: "ct-feature-card",
								properties: {
									icon: "/stride-icons/globe.svg",
									label: "A motivated community",
									description: "Engage in community challenges to motivate yourself and others.",
								},
							},
							"ele-feature-card-2": {
								type: "ct-feature-card",
								properties: {
									icon: "/stride-icons/sticky-note.svg",
									label: "Set Goals",
									description: "Track your fitness goals and monitor progress with real-time analytics.",
								},
							},
							"ele-feature-card-3": {
								type: "ct-feature-card",
								properties: {
									icon: "/stride-icons/sticky-note.svg",
									label: "Workout Library",
									description: "Access a library of guided workouts and nutrition plans tailored to individual needs.",
								},
							},

							// Section 2 Elements
							"ele-levelup-1-number-line": {
								type: "ct-number-line",
								properties: {
									number: "02",
								},
							},
							"ele-levelup-1-heading": {
								type: "ct-heading",
								properties: {
									text: "Coaches get clarity fast",
									accent: "02Live context",
									level: "h2",
									displayTemplateKey: "prominentHeading",
									displaySettings: [
										{ key: "size", value: "large" },
										{ key: "emphasis", value: "bold" },
									],
								},
							},
							"ele-levelup-1-body": {
								type: "ct-text",
								properties: {
									text: "The system combines live session notes with film, uploads, and AI-generated summaries to provide coaches with context before they begin working.",
									displayTemplateKey: "defaultText",
					displaySettings: [
						{ key: "size", value: "default" },
						{ key: "emphasis", value: "normal" },
					],
								},
							},

							// Section 3 Elements
							"ele-levelup-2-number-line": {
								type: "ct-number-line",
								properties: {
									number: "03",
								},
							},
							"ele-levelup-2-heading": {
								type: "ct-heading",
								properties: {
									text: "Features that keep crews aligned",
									accent: "03Crew rituals",
									level: "h2",
									displayTemplateKey: "prominentHeading",
									displaySettings: [
										{ key: "size", value: "large" },
										{ key: "emphasis", value: "bold" },
									],
								},
							},
							"ele-levelup-2-body": {
								type: "ct-text",
								properties: {
									text: "Teams can broadcast goals, rituals, and readiness cues in a shared workspace, ensuring athletes understand the plan while preserving decision context.",
									displayTemplateKey: "defaultText",
					displaySettings: [
						{ key: "size", value: "default" },
						{ key: "emphasis", value: "normal" },
					],
								},
							},
							"ele-levelup-2-app-image": {
								type: "ct-image",
								properties: {
									image: "https://via.placeholder.com/400x600/F2F8FC/1C1C1C?text=My+Buddies",
								},
							},

							// Section 4 Elements
							"ele-community-number-line": {
								type: "ct-number-line",
								properties: {
									number: "04",
								},
							},
							"ele-community-heading": {
								type: "ct-heading",
								properties: {
									text: "Let athletes stay in flow",
									accent: "04Flow state",
									level: "h2",
									displayTemplateKey: "prominentHeading",
									displaySettings: [
										{ key: "size", value: "large" },
										{ key: "emphasis", value: "bold" },
									],
								},
							},
							"ele-community-body": {
								type: "ct-text",
								properties: {
									text: "The platform maintains athlete rhythm using context-aware reminders, spatial audio notes, and schedules that adapt when disruptions occur.",
									displayTemplateKey: "defaultText",
					displaySettings: [
						{ key: "size", value: "default" },
						{ key: "emphasis", value: "normal" },
					],
								},
							},
							"ele-community-app-image": {
								type: "ct-app-preview",
								properties: {
									appImage: "/stride-hero/app3.png",
									style: "community",
								},
							},

							// Section 5 Elements (Features Grid)
							"ele-feature-grid-1": {
								type: "ct-feature-card",
								properties: {
									icon: "/stride-icons/globe.svg",
									label: "Local intel",
									description: "Share route tweaks, weather calls, and meetup pins without leaving the thread.",
									style: "compact",
								},
							},
							"ele-feature-grid-2": {
								type: "ct-feature-card",
								properties: {
									icon: "/stride-icons/check.svg",
									label: "Session receipts",
									description: "Drop RPE, mood, or kit status in a tap so coaches see more than numbers.",
									style: "compact",
								},
							},
							"ele-feature-grid-3": {
								type: "ct-feature-card",
								properties: {
									icon: "/stride-icons/book.svg",
									label: "Playbook notes",
									description: "Attach cues, fueling tweaks, or rehab guardrails directly to each block.",
									style: "compact",
								},
							},
							"ele-feature-grid-4": {
								type: "ct-feature-card",
								properties: {
									icon: "/stride-icons/check-check.svg",
									label: "Auto follow-ups",
									description: "Stride pings the right person when recovery lags or a milestone unlocks.",
									style: "compact",
								},
							},
						},
					},
				],
			},
		],
	},
	{
		id: "page-site-about",
		name: "About Us",
		parentId: "page-site-home",
		status: "Published",
		lastModified: "2026-05-28",
		contentTypeId: "exp-about-page",
		displayTemplateKey: "defaultExperience",
		displaySettings: [
			{ key: "backgroundColor", value: "light-blue" },
			{ key: "spacing", value: "default" }
		],
		slug: "about",
		data: {},
		variations: [
			{
				id: "original",
				name: "Original",
				status: "Published",
				outlines: [
					{
						id: "ol-about-main",
						title: "Main",
						tree: [
							{
								id: "sec-about-intro",
								name: "Introduction",
								type: "ct-section",
								open: true,
								displayTemplateKey: "defaultSection",
								displaySettings: [{ key: "spacing", value: "compact" }],
								children: [{ id: "row-about-intro", open: true, children: [{ id: "col-about-intro", open: true, elements: [
									{ id: "ele-about-h1" },
									{ id: "ele-about-intro-text" },
								] }] }],
							},
							{
								id: "sec-about-mission",
								name: "Our Mission",
								type: "ct-section",
								open: true,
								displayTemplateKey: "defaultSection",
								displaySettings: [{ key: "spacing", value: "compact" }],
								children: [{ id: "row-about-mission", open: true, children: [{ id: "col-about-mission", open: true, elements: [
									{ id: "ele-about-mission-h2" },
									{ id: "ele-about-mission-text" },
								] }] }],
							},
							{
								id: "sec-about-cards",
								name: "CTA Cards",
								type: "ct-section",
								open: true,
								displayTemplateKey: "defaultSection",
								displaySettings: [{ key: "spacing", value: "compact" }],
								children: [{ id: "row-about-cards", open: true, children: [
									{ id: "col-about-join", open: true, elements: [{ id: "ele-about-join-card" }] },
									{ id: "col-about-coach", open: true, elements: [{ id: "ele-about-coach-card" }] },
								] }],
							},
						],
						elements: {
							"ele-about-h1": { type: "ct-heading", properties: { text: "About us", level: "h1", displayTemplateKey: "prominentHeading", displaySettings: [{ key: "size", value: "extra-large" }] } },
							"ele-about-intro-text": { type: "ct-text", properties: { text: "Stride was founded on a simple belief: that everyone has an athlete inside them, waiting to break free. We build tools that help you visualize your progress, connect with others, and reach your full potential.", displayTemplateKey: "defaultText", displaySettings: [{ key: "size", value: "large" }] } },
							"ele-about-mission-h2": { type: "ct-heading", properties: { text: "Our Mission", level: "h2" } },
							"ele-about-mission-text": { type: "ct-text", properties: { text: "We're dedicated to making professional-grade training tools accessible to everyone. Whether you're training for your first 5k or your fiftieth marathon, Stride is with you every step of the way.", displayTemplateKey: "defaultText", displaySettings: [{ key: "size", value: "default" }] } },
							"ele-about-join-card": { type: "ct-card", properties: { backgroundImage: "/features-card-1.jpg", label: "Join the Community", description: "Ride with thousands of others.", displaySettings: [{ key: "style", value: "simple" }] } },
							"ele-about-coach-card": { type: "ct-card", properties: { backgroundImage: "/features-card-2.jpg", label: "Find a Coach", description: "Get a personalized training plan.", displaySettings: [{ key: "style", value: "simple" }] } },
						},
					},
					{
						id: "ol-about-sidebar",
						title: "Sidebar",
						tree: [
							{
								id: "sec-about-nav",
								name: "About Navigation",
								open: true,
								children: [{ id: "row-about-nav", open: true, children: [{ id: "col-about-nav", open: true, elements: [
									{ id: "ele-nav-news-events" },
									{ id: "ele-nav-events-sub" },
									{ id: "ele-nav-news-sub" },
									{ id: "ele-nav-management" },
									{ id: "ele-nav-contact" },
									{ id: "ele-nav-coaches" },
								] }] }],
							},
						],
						elements: {
							"ele-nav-news-events": { type: "ct-nav-item", properties: { label: "News & Events", href: "/about/news-events" } },
							"ele-nav-events-sub": { type: "ct-nav-item", properties: { label: "Events", href: "/about/news-events/events", sub: "true" } },
							"ele-nav-news-sub": { type: "ct-nav-item", properties: { label: "News", href: "/about/news-events/news", sub: "true" } },
							"ele-nav-management": { type: "ct-nav-item", properties: { label: "Management", href: "/about/management" } },
							"ele-nav-contact": { type: "ct-nav-item", properties: { label: "Contact us", href: "/about/contact" } },
							"ele-nav-coaches": { type: "ct-nav-item", properties: { label: "Become a Coach", href: "/about/coaches" } },
						},
					},
				],
			},
		],
	},

	// --- About Sub-Pages (all use exp-about-page with left sidenav) ---

	{
		id: "page-site-news-events",
		name: "News & Events",
		parentId: "page-site-about",
		status: "Published",
		lastModified: "2026-05-28",
		contentTypeId: "exp-about-page",
		slug: "about/news-events",
		data: {},
		variations: [{ id: "original", name: "Original", status: "Published", outlines: [
			{ id: "ol-ne-main", title: "Main", tree: [
				{ id: "sec-ne-intro", name: "News & Events", type: "ct-section", open: true, displayTemplateKey: "defaultSection", displaySettings: [{ key: "spacing", value: "compact" }], children: [{ id: "row-ne-intro", open: true, children: [{ id: "col-ne-intro", open: true, elements: [{ id: "ele-ne-h1" }] }] }] },
				{ id: "sec-ne-news", name: "Latest News", type: "ct-section", open: true, displayTemplateKey: "defaultSection", displaySettings: [{ key: "spacing", value: "compact" }], children: [{ id: "row-ne-news", open: true, children: [{ id: "col-ne-news", open: true, elements: [{ id: "ele-ne-news-h2" }, { id: "ele-ne-news-1" }, { id: "ele-ne-news-2" }, { id: "ele-ne-news-3" }, { id: "ele-ne-all-news-btn" }] }] }] },
				{ id: "sec-ne-events-heading", name: "Events Heading", type: "ct-section", open: true, displayTemplateKey: "defaultSection", displaySettings: [{ key: "spacing", value: "compact" }], children: [{ id: "row-ne-events-h", open: true, children: [{ id: "col-ne-events-h", open: true, elements: [{ id: "ele-ne-events-h2" }] }] }] },
				{ id: "sec-ne-events-grid", name: "Events Grid", type: "ct-section", open: true, displayTemplateKey: "defaultSection", displaySettings: [{ key: "spacing", value: "compact" }], children: [{ id: "row-ne-events-grid", open: true, children: [
					{ id: "col-ne-ev-1", open: true, elements: [{ id: "ele-ne-event-1" }] },
					{ id: "col-ne-ev-2", open: true, elements: [{ id: "ele-ne-event-2" }] },
				] }] },
				{ id: "sec-ne-events-btn", name: "Events Button", type: "ct-section", open: true, displayTemplateKey: "defaultSection", displaySettings: [{ key: "spacing", value: "compact" }], children: [{ id: "row-ne-events-btn", open: true, children: [{ id: "col-ne-events-btn", open: true, elements: [{ id: "ele-ne-all-events-btn" }] }] }] },
			], elements: {
				"ele-ne-h1": { type: "ct-heading", properties: { text: "News & Events", level: "h1", displayTemplateKey: "prominentHeading", displaySettings: [{ key: "size", value: "extra-large" }] } },
				"ele-ne-news-h2": { type: "ct-heading", properties: { text: "Latest News", level: "h2" } },
				"ele-ne-news-1": { type: "ct-news-item", properties: { title: "Stride raises Series B to expand global fitness community", date: "2026-02-01", image: "/sports-1.jpg", summary: "We are thrilled to announce our latest funding round led by top-tier investors to accelerate our mission of making the world move more." } },
				"ele-ne-news-2": { type: "ct-news-item", properties: { title: "Introducing Stride Stats 2.0 with AI coaching", date: "2026-01-15", image: "/sports-2.jpg", summary: "Our biggest update yet includes automated form analysis, recovery recommendations, and predictive race pacing." } },
				"ele-ne-news-3": { type: "ct-news-item", properties: { title: "Stride named Top 10 Fitness App of 2025", date: "2025-12-10", image: "/sports-3.jpg", summary: "FitTech Magazine has recognized Stride as a leading solution for endurance athletes in their annual awards." } },
				"ele-ne-all-news-btn": { type: "ct-button", properties: { label: "ALL NEWS", displayTemplateKey: "secondaryButton" } },
				"ele-ne-events-h2": { type: "ct-heading", properties: { text: "Upcoming Events", level: "h2" } },
				"ele-ne-event-1": { type: "ct-event-card", properties: { title: "Global Running Summit 2026", date: "2026-04-20", location: "San Francisco, CA", description: "Join us for a day of keynotes and workshops on the future of endurance sports and wearable technology." } },
				"ele-ne-event-2": { type: "ct-event-card", properties: { title: "Stride Community Marathon", date: "2026-06-15", location: "London, UK", description: "Connect with other Stride athletes, break your personal bests, and celebrate with the community." } },
				"ele-ne-all-events-btn": { type: "ct-button", properties: { label: "ALL EVENTS", displayTemplateKey: "secondaryButton" } },
			}},
			{ id: "ol-ne-sidebar", title: "Sidebar", tree: [{ id: "sec-ne-nav", name: "Nav", open: true, children: [{ id: "row-ne-nav", open: true, children: [{ id: "col-ne-nav", open: true, elements: [{ id: "ele-ne-nav-1" }, { id: "ele-ne-nav-1a" }, { id: "ele-ne-nav-1b" }, { id: "ele-ne-nav-2" }, { id: "ele-ne-nav-3" }, { id: "ele-ne-nav-4" }] }] }] }], elements: {
				"ele-ne-nav-1": { type: "ct-nav-item", properties: { label: "News & Events", href: "/about/news-events" } },
				"ele-ne-nav-1a": { type: "ct-nav-item", properties: { label: "Events", href: "/about/news-events/events", sub: "true" } },
				"ele-ne-nav-1b": { type: "ct-nav-item", properties: { label: "News", href: "/about/news-events/news", sub: "true" } },
				"ele-ne-nav-2": { type: "ct-nav-item", properties: { label: "Management", href: "/about/management" } },
				"ele-ne-nav-3": { type: "ct-nav-item", properties: { label: "Contact us", href: "/about/contact" } },
				"ele-ne-nav-4": { type: "ct-nav-item", properties: { label: "Become a Coach", href: "/about/coaches" } },
			}},
		]}],
	},

	{
		id: "page-site-news",
		name: "News",
		parentId: "page-site-news-events",
		status: "Published",
		lastModified: "2026-05-28",
		contentTypeId: "exp-about-page",
		slug: "about/news-events/news",
		data: {},
		variations: [{ id: "original", name: "Original", status: "Published", outlines: [
			{ id: "ol-news-main", title: "Main", tree: [
				{ id: "sec-news-list", name: "News", type: "ct-section", open: true, displayTemplateKey: "defaultSection", displaySettings: [{ key: "spacing", value: "compact" }], children: [{ id: "row-news-list", open: true, children: [{ id: "col-news-list", open: true, elements: [{ id: "ele-news-h1" }, { id: "ele-news-item-1" }, { id: "ele-news-item-2" }, { id: "ele-news-item-3" }] }] }] },
			], elements: {
				"ele-news-h1": { type: "ct-heading", properties: { text: "News", level: "h1", displayTemplateKey: "prominentHeading", displaySettings: [{ key: "size", value: "extra-large" }] } },
				"ele-news-item-1": { type: "ct-news-item", properties: { title: "Stride raises Series B to expand global fitness community", date: "2026-02-01", image: "/sports-1.jpg", summary: "We are thrilled to announce our latest funding round led by top-tier investors to accelerate our mission of making the world move more." } },
				"ele-news-item-2": { type: "ct-news-item", properties: { title: "Introducing Stride Stats 2.0 with AI coaching", date: "2026-01-15", image: "/sports-2.jpg", summary: "Our biggest update yet includes automated form analysis, recovery recommendations, and predictive race pacing." } },
				"ele-news-item-3": { type: "ct-news-item", properties: { title: "Stride named Top 10 Fitness App of 2025", date: "2025-12-10", image: "/sports-3.jpg", summary: "FitTech Magazine has recognized Stride as a leading solution for endurance athletes in their annual awards." } },
			}},
			{ id: "ol-news-sidebar", title: "Sidebar", tree: [{ id: "sec-news-nav", name: "Nav", open: true, children: [{ id: "row-news-nav", open: true, children: [{ id: "col-news-nav", open: true, elements: [{ id: "ele-nn-nav-1" }, { id: "ele-nn-nav-1a" }, { id: "ele-nn-nav-1b" }, { id: "ele-nn-nav-2" }, { id: "ele-nn-nav-3" }, { id: "ele-nn-nav-4" }] }] }] }], elements: {
				"ele-nn-nav-1": { type: "ct-nav-item", properties: { label: "News & Events", href: "/about/news-events" } },
				"ele-nn-nav-1a": { type: "ct-nav-item", properties: { label: "Events", href: "/about/news-events/events", sub: "true" } },
				"ele-nn-nav-1b": { type: "ct-nav-item", properties: { label: "News", href: "/about/news-events/news", sub: "true" } },
				"ele-nn-nav-2": { type: "ct-nav-item", properties: { label: "Management", href: "/about/management" } },
				"ele-nn-nav-3": { type: "ct-nav-item", properties: { label: "Contact us", href: "/about/contact" } },
				"ele-nn-nav-4": { type: "ct-nav-item", properties: { label: "Become a Coach", href: "/about/coaches" } },
			}},
		]}],
	},

	{
		id: "page-site-events-about",
		name: "Events",
		parentId: "page-site-news-events",
		status: "Published",
		lastModified: "2026-05-28",
		contentTypeId: "exp-about-page",
		slug: "about/news-events/events",
		data: {},
		variations: [{ id: "original", name: "Original", status: "Published", outlines: [
			{ id: "ol-ev-main", title: "Main", tree: [
				{ id: "sec-ev-heading", name: "Events Heading", type: "ct-section", open: true, displayTemplateKey: "defaultSection", displaySettings: [{ key: "spacing", value: "compact" }], children: [{ id: "row-ev-heading", open: true, children: [{ id: "col-ev-heading", open: true, elements: [{ id: "ele-ev-h1" }] }] }] },
				{ id: "sec-ev-grid", name: "Events Grid", type: "ct-section", open: true, displayTemplateKey: "defaultSection", displaySettings: [{ key: "spacing", value: "compact" }], children: [{ id: "row-ev-grid", open: true, children: [
					{ id: "col-ev-1", open: true, elements: [{ id: "ele-ev-item-1" }] },
					{ id: "col-ev-2", open: true, elements: [{ id: "ele-ev-item-2" }] },
				] }] },
			], elements: {
				"ele-ev-h1": { type: "ct-heading", properties: { text: "Events", level: "h1", displayTemplateKey: "prominentHeading", displaySettings: [{ key: "size", value: "extra-large" }] } },
				"ele-ev-item-1": { type: "ct-event-card", properties: { title: "Global Running Summit 2026", date: "2026-04-20", location: "San Francisco, CA", description: "Join us for a day of keynotes and workshops on the future of endurance sports and wearable technology." } },
				"ele-ev-item-2": { type: "ct-event-card", properties: { title: "Stride Community Marathon", date: "2026-06-15", location: "London, UK", description: "Connect with other Stride athletes, break your personal bests, and celebrate with the community." } },
			}},
			{ id: "ol-ev-sidebar", title: "Sidebar", tree: [{ id: "sec-ev-nav", name: "Nav", open: true, children: [{ id: "row-ev-nav", open: true, children: [{ id: "col-ev-nav", open: true, elements: [{ id: "ele-ev-nav-1" }, { id: "ele-ev-nav-1a" }, { id: "ele-ev-nav-1b" }, { id: "ele-ev-nav-2" }, { id: "ele-ev-nav-3" }, { id: "ele-ev-nav-4" }] }] }] }], elements: {
				"ele-ev-nav-1": { type: "ct-nav-item", properties: { label: "News & Events", href: "/about/news-events" } },
				"ele-ev-nav-1a": { type: "ct-nav-item", properties: { label: "Events", href: "/about/news-events/events", sub: "true" } },
				"ele-ev-nav-1b": { type: "ct-nav-item", properties: { label: "News", href: "/about/news-events/news", sub: "true" } },
				"ele-ev-nav-2": { type: "ct-nav-item", properties: { label: "Management", href: "/about/management" } },
				"ele-ev-nav-3": { type: "ct-nav-item", properties: { label: "Contact us", href: "/about/contact" } },
				"ele-ev-nav-4": { type: "ct-nav-item", properties: { label: "Become a Coach", href: "/about/coaches" } },
			}},
		]}],
	},

	{
		id: "page-site-management",
		name: "Management",
		parentId: "page-site-about",
		status: "Published",
		lastModified: "2026-05-28",
		contentTypeId: "exp-about-page",
		slug: "about/management",
		data: {},
		variations: [{ id: "original", name: "Original", status: "Published", outlines: [
			{ id: "ol-mgmt-main", title: "Main", tree: [
				{ id: "sec-mgmt-intro", name: "Management", type: "ct-section", open: true, displayTemplateKey: "defaultSection", displaySettings: [{ key: "spacing", value: "compact" }], children: [{ id: "row-mgmt-intro", open: true, children: [{ id: "col-mgmt-intro", open: true, elements: [{ id: "ele-mgmt-h1" }, { id: "ele-mgmt-intro" }] }] }] },
				{ id: "sec-mgmt-cards", name: "Team", type: "ct-section", open: true, displayTemplateKey: "defaultSection", displaySettings: [{ key: "spacing", value: "compact" }], children: [{ id: "row-mgmt-cards", open: true, children: [
					{ id: "col-mgmt-1", open: true, elements: [{ id: "ele-mgmt-card-1" }] },
					{ id: "col-mgmt-2", open: true, elements: [{ id: "ele-mgmt-card-2" }] },
				] }, { id: "row-mgmt-cards-2", open: true, children: [
					{ id: "col-mgmt-3", open: true, elements: [{ id: "ele-mgmt-card-3" }] },
					{ id: "col-mgmt-4", open: true, elements: [{ id: "ele-mgmt-card-4" }] },
				] }] },
			], elements: {
				"ele-mgmt-h1": { type: "ct-heading", properties: { text: "Management", level: "h1", displayTemplateKey: "prominentHeading", displaySettings: [{ key: "size", value: "extra-large" }] } },
				"ele-mgmt-intro": { type: "ct-text", properties: { text: "Our experienced and dedicated managers are committed to improving the effectiveness of project teams everywhere. Meet them here:", displayTemplateKey: "defaultText", displaySettings: [{ key: "size", value: "default" }] } },
				"ele-mgmt-card-1": { type: "ct-card", properties: { backgroundImage: "/sports-1.jpg", label: "Robert Carlsson — CEO", description: "Robert is Stride's CEO and visionary leader. Robert has led product development for major sports brands for over 20 years. robert.carlsson@stride.com | +46 8 123 456", displaySettings: [{ key: "style", value: "simple" }] } },
				"ele-mgmt-card-2": { type: "ct-card", properties: { backgroundImage: "/sports-2.jpg", label: "Michelle Hernandez — CFO", description: "Michelle brings more than 10 years of finance and operational management experience to Stride. michelle.hernandez@stride.com | +46 8 123 458", displaySettings: [{ key: "style", value: "simple" }] } },
				"ele-mgmt-card-3": { type: "ct-card", properties: { backgroundImage: "/sports-3.jpg", label: "Amar Gupta — CTO", description: "Amar is our CTO and manages Stride's engineering team, delivering millions of data points per second to athletes worldwide. amar.gupta@stride.com | +46 8 123 459", displaySettings: [{ key: "style", value: "simple" }] } },
				"ele-mgmt-card-4": { type: "ct-card", properties: { backgroundImage: "/features-card-1.jpg", label: "Todd Slayton — Community Builder", description: "Todd is Stride's community builder, responsible for partnerships, events and athlete engagement. todd.slayton@stride.com | +46 8 123 457", displaySettings: [{ key: "style", value: "simple" }] } },
			}},
			{ id: "ol-mgmt-sidebar", title: "Sidebar", tree: [{ id: "sec-mgmt-nav", name: "Nav", open: true, children: [{ id: "row-mgmt-nav", open: true, children: [{ id: "col-mgmt-nav", open: true, elements: [{ id: "ele-mg-nav-1" }, { id: "ele-mg-nav-1a" }, { id: "ele-mg-nav-1b" }, { id: "ele-mg-nav-2" }, { id: "ele-mg-nav-3" }, { id: "ele-mg-nav-4" }] }] }] }], elements: {
				"ele-mg-nav-1": { type: "ct-nav-item", properties: { label: "News & Events", href: "/about/news-events" } },
				"ele-mg-nav-1a": { type: "ct-nav-item", properties: { label: "Events", href: "/about/news-events/events", sub: "true" } },
				"ele-mg-nav-1b": { type: "ct-nav-item", properties: { label: "News", href: "/about/news-events/news", sub: "true" } },
				"ele-mg-nav-2": { type: "ct-nav-item", properties: { label: "Management", href: "/about/management" } },
				"ele-mg-nav-3": { type: "ct-nav-item", properties: { label: "Contact us", href: "/about/contact" } },
				"ele-mg-nav-4": { type: "ct-nav-item", properties: { label: "Become a Coach", href: "/about/coaches" } },
			}},
		]}],
	},

	{
		id: "page-site-contact",
		name: "Contact Us",
		parentId: "page-site-about",
		status: "Published",
		lastModified: "2026-05-28",
		contentTypeId: "exp-about-page",
		slug: "about/contact",
		data: {},
		variations: [{ id: "original", name: "Original", status: "Published", outlines: [
			{ id: "ol-ct-main", title: "Main", tree: [
				{ id: "sec-ct-content", name: "Contact", type: "ct-section", open: true, displayTemplateKey: "defaultSection", displaySettings: [{ key: "spacing", value: "compact" }], children: [{ id: "row-ct-content", open: true, children: [{ id: "col-ct-content", open: true, elements: [{ id: "ele-ct-h1" }, { id: "ele-ct-intro" }, { id: "ele-ct-body" }, { id: "ele-ct-support" }, { id: "ele-ct-press" }, { id: "ele-ct-phone" }] }] }] },
			], elements: {
				"ele-ct-h1": { type: "ct-heading", properties: { text: "Contact Us", level: "h1", displayTemplateKey: "prominentHeading", displaySettings: [{ key: "size", value: "extra-large" }] } },
				"ele-ct-intro": { type: "ct-text", properties: { text: "We'd love to hear from you.", displayTemplateKey: "defaultText", displaySettings: [{ key: "size", value: "large" }] } },
				"ele-ct-body": { type: "ct-text", properties: { text: "Get in touch with our team for support, partnership inquiries, or general questions.", displayTemplateKey: "defaultText", displaySettings: [{ key: "size", value: "default" }] } },
				"ele-ct-support": { type: "ct-text", properties: { text: "Support: support@stride.com", displayTemplateKey: "defaultText", displaySettings: [{ key: "size", value: "default" }] } },
				"ele-ct-press": { type: "ct-text", properties: { text: "Press: press@stride.com", displayTemplateKey: "defaultText", displaySettings: [{ key: "size", value: "default" }] } },
				"ele-ct-phone": { type: "ct-text", properties: { text: "Phone: +1 415 555 0123", displayTemplateKey: "defaultText", displaySettings: [{ key: "size", value: "default" }] } },
			}},
			{ id: "ol-ct-sidebar", title: "Sidebar", tree: [{ id: "sec-ct-nav", name: "Nav", open: true, children: [{ id: "row-ct-nav", open: true, children: [{ id: "col-ct-nav", open: true, elements: [{ id: "ele-ct-nav-1" }, { id: "ele-ct-nav-1a" }, { id: "ele-ct-nav-1b" }, { id: "ele-ct-nav-2" }, { id: "ele-ct-nav-3" }, { id: "ele-ct-nav-4" }] }] }] }], elements: {
				"ele-ct-nav-1": { type: "ct-nav-item", properties: { label: "News & Events", href: "/about/news-events" } },
				"ele-ct-nav-1a": { type: "ct-nav-item", properties: { label: "Events", href: "/about/news-events/events", sub: "true" } },
				"ele-ct-nav-1b": { type: "ct-nav-item", properties: { label: "News", href: "/about/news-events/news", sub: "true" } },
				"ele-ct-nav-2": { type: "ct-nav-item", properties: { label: "Management", href: "/about/management" } },
				"ele-ct-nav-3": { type: "ct-nav-item", properties: { label: "Contact us", href: "/about/contact" } },
				"ele-ct-nav-4": { type: "ct-nav-item", properties: { label: "Become a Coach", href: "/about/coaches" } },
			}},
		]}],
	},

	{
		id: "page-site-coaches",
		name: "Become a Coach",
		parentId: "page-site-about",
		status: "Published",
		lastModified: "2026-05-28",
		contentTypeId: "exp-about-page",
		slug: "about/coaches",
		data: {},
		variations: [{ id: "original", name: "Original", status: "Published", outlines: [
			{ id: "ol-coach-main", title: "Main", tree: [
				{ id: "sec-coach-content", name: "Coaches", type: "ct-section", open: true, displayTemplateKey: "defaultSection", displaySettings: [{ key: "spacing", value: "compact" }], children: [{ id: "row-coach-content", open: true, children: [{ id: "col-coach-content", open: true, elements: [{ id: "ele-coach-h1" }, { id: "ele-coach-intro" }, { id: "ele-coach-body" }, { id: "ele-coach-apply-btn" }] }] }] },
			], elements: {
				"ele-coach-h1": { type: "ct-heading", properties: { text: "Become a Coach", level: "h1", displayTemplateKey: "prominentHeading", displaySettings: [{ key: "size", value: "extra-large" }] } },
				"ele-coach-intro": { type: "ct-text", properties: { text: "Partner with us to bring professional training to everyone.", displayTemplateKey: "defaultText", displaySettings: [{ key: "size", value: "large" }] } },
				"ele-coach-body": { type: "ct-text", properties: { text: "Join our network of certified coaches and help athletes across the globe reach their peak performance.", displayTemplateKey: "defaultText", displaySettings: [{ key: "size", value: "default" }] } },
				"ele-coach-apply-btn": { type: "ct-button", properties: { label: "APPLY NOW", displayTemplateKey: "secondaryButton" } },
			}},
			{ id: "ol-coach-sidebar", title: "Sidebar", tree: [{ id: "sec-coach-nav", name: "Nav", open: true, children: [{ id: "row-coach-nav", open: true, children: [{ id: "col-coach-nav", open: true, elements: [{ id: "ele-co-nav-1" }, { id: "ele-co-nav-1a" }, { id: "ele-co-nav-1b" }, { id: "ele-co-nav-2" }, { id: "ele-co-nav-3" }, { id: "ele-co-nav-4" }] }] }] }], elements: {
				"ele-co-nav-1": { type: "ct-nav-item", properties: { label: "News & Events", href: "/about/news-events" } },
				"ele-co-nav-1a": { type: "ct-nav-item", properties: { label: "Events", href: "/about/news-events/events", sub: "true" } },
				"ele-co-nav-1b": { type: "ct-nav-item", properties: { label: "News", href: "/about/news-events/news", sub: "true" } },
				"ele-co-nav-2": { type: "ct-nav-item", properties: { label: "Management", href: "/about/management" } },
				"ele-co-nav-3": { type: "ct-nav-item", properties: { label: "Contact us", href: "/about/contact" } },
				"ele-co-nav-4": { type: "ct-nav-item", properties: { label: "Become a Coach", href: "/about/coaches" } },
			}},
		]}],
	},

	{
		id: "page-site-reseller",
		name: "Become a Reseller",
		parentId: "page-site-about",
		status: "Published",
		lastModified: "2026-05-28",
		contentTypeId: "exp-about-page",
		slug: "about/reseller",
		data: {},
		variations: [{ id: "original", name: "Original", status: "Published", outlines: [
			{ id: "ol-reseller-main", title: "Main", tree: [
				{ id: "sec-reseller-content", name: "Reseller", type: "ct-section", open: true, displayTemplateKey: "defaultSection", displaySettings: [{ key: "spacing", value: "compact" }], children: [{ id: "row-reseller-content", open: true, children: [{ id: "col-reseller-content", open: true, elements: [{ id: "ele-reseller-h1" }, { id: "ele-reseller-intro" }, { id: "ele-reseller-body" }, { id: "ele-reseller-apply-btn" }] }] }] },
			], elements: {
				"ele-reseller-h1": { type: "ct-heading", properties: { text: "Become a Reseller", level: "h1", displayTemplateKey: "prominentHeading", displaySettings: [{ key: "size", value: "extra-large" }] } },
				"ele-reseller-intro": { type: "ct-text", properties: { text: "Stock Stride hardware, apparel, and subscriptions at your retail location or online shop.", displayTemplateKey: "defaultText", displaySettings: [{ key: "size", value: "large" }] } },
				"ele-reseller-body": { type: "ct-text", properties: { text: "Our reseller program gives you access to wholesale pricing, co-branded marketing assets, and priority support. Whether you run a specialty running store or an online fitness marketplace, we make onboarding seamless.", displayTemplateKey: "defaultText", displaySettings: [{ key: "size", value: "default" }] } },
				"ele-reseller-apply-btn": { type: "ct-button", properties: { label: "BECOME A RESELLER", displayTemplateKey: "secondaryButton" } },
			}},
			{ id: "ol-reseller-sidebar", title: "Sidebar", tree: [{ id: "sec-reseller-nav", name: "Nav", open: true, children: [{ id: "row-reseller-nav", open: true, children: [{ id: "col-reseller-nav", open: true, elements: [{ id: "ele-rs-nav-1" }, { id: "ele-rs-nav-1a" }, { id: "ele-rs-nav-1b" }, { id: "ele-rs-nav-2" }, { id: "ele-rs-nav-3" }, { id: "ele-rs-nav-4" }] }] }] }], elements: {
				"ele-rs-nav-1": { type: "ct-nav-item", properties: { label: "News & Events", href: "/about/news-events" } },
				"ele-rs-nav-1a": { type: "ct-nav-item", properties: { label: "Events", href: "/about/news-events/events", sub: "true" } },
				"ele-rs-nav-1b": { type: "ct-nav-item", properties: { label: "News", href: "/about/news-events/news", sub: "true" } },
				"ele-rs-nav-2": { type: "ct-nav-item", properties: { label: "Management", href: "/about/management" } },
				"ele-rs-nav-3": { type: "ct-nav-item", properties: { label: "Contact us", href: "/about/contact" } },
				"ele-rs-nav-4": { type: "ct-nav-item", properties: { label: "Become a Coach", href: "/about/coaches" } },
			}},
		]}],
	},

	{
		id: "page-site-blog",
		name: "Blog",
		parentId: "page-site-home",
		status: "Published",
		lastModified: "2023-10-24",
		contentTypeId: "ct-blog-listing",
		data: {
			title: "Blog",
			subtitle: "Latest running tips and gear reviews",
			seo: {
				en: {
					original: {
						title: "Blog | Stride",
						description: "Tips, training guides, and gear reviews from Stride.",
						canonicalUrl: "https://stride.com/blog",
						robots: "index,follow",
						image: "https://stride.com/og-blog.jpg",
						ogTitle: "Stride Blog",
						ogDescription: "Tips, training guides, and gear reviews.",
						ogImage: "https://stride.com/og-blog.jpg",
						twitterTitle: "Stride Blog",
						twitterDescription: "Tips, training guides, and gear reviews.",
						twitterImage: "https://stride.com/og-blog.jpg",
					},
				},
			},
		},
		variations: [
			{
				id: "original",
				name: "Original",
				status: "Published",
				outlines: [
					{
						id: "ol-blog-main",
						title: "Main",
						tree: [
							{
								id: "sec-blog-header",
								name: "Header",
								open: true,
								children: [
									{
										id: "row-blog-header",
										open: true,
										children: [
											{
												id: "col-blog-header",
												open: true,
												elements: [
													{ id: "ele-blog-heading" },
													{ id: "ele-blog-subtext" },
												],
											},
										],
									},
								],
							},
						],
						elements: {
							"ele-blog-heading": {
								type: "ct-heading",
								properties: {
									text: "The Stride Blog",
								},
							},
							"ele-blog-subtext": {
								type: "ct-text",
								properties: {
									text: "Tips, training guides, and gear reviews.",
								},
							},
						},
					},
				],
			},
		],
		outlines: [
			{
				id: "ol-blog-main",
				title: "Main",
				tree: [
					{
						id: "sec-blog-header",
						name: "Header",
						open: true,
						children: [
							{
								id: "row-blog-header",
								open: true,
								children: [
									{
										id: "col-blog-header",
										open: true,
										elements: [
											{ id: "ele-blog-heading" },
											{ id: "ele-blog-subtext" },
										],
									},
								],
							},
						],
					},
				],
				elements: {
					"ele-blog-heading": {
						type: "ct-heading",
						properties: {
							text: "The Stride Blog",
						},
					},
					"ele-blog-subtext": {
						type: "ct-text",
						properties: {
							text: "Tips, training guides, and gear reviews.",
						},
					},
				},
			},
		],
	},

	{
		id: "page-site-products",
		name: "Products",
		parentId: "page-site-home",
		status: "Published",
		lastModified: "2023-10-23",
		contentTypeId: "ct-page",
		displayTemplateKey: "defaultExperience",
		displaySettings: [
			{ key: "backgroundColor", value: "light-blue" },
			{ key: "spacing", value: "default" }
		],
		data: {
			seo: {
				en: {
					original: {
						title: "Products | Stride",
						description: "Check out the latest gear for this season at Stride.",
						canonicalUrl: "https://stride.com/products",
						robots: "index,follow",
						image: "https://stride.com/og-products.jpg",
						ogTitle: "Stride Products",
						ogDescription: "Check out the latest gear for this season.",
						ogImage: "https://stride.com/og-products.jpg",
						twitterTitle: "Stride Products",
						twitterDescription: "Check out the latest gear for this season.",
						twitterImage: "https://stride.com/og-products.jpg",
					},
				},
			},
		},
		variations: [
			{
				id: "original",
				name: "Original",
				status: "Published",
				outlines: [
					{
						id: "ol-products-main",
						title: "Main",
						tree: [
							{
								id: "sec-products-arrivals",
								name: "New Arrivals",
								open: true,
								children: [
									{
										id: "row-products-arrivals",
										open: true,
										children: [
											{
												id: "col-products-arrivals",
												open: true,
												elements: [
													{ id: "ele-products-heading" },
													{ id: "ele-products-subtext" },
												],
											},
										],
									},
								],
							},
						],
						elements: {
							"ele-products-heading": {
								type: "ct-heading",
								properties: {
									text: "New Arrivals",
								},
							},
							"ele-products-subtext": {
								type: "ct-text",
								properties: {
									text: "Check out the latest gear for this season.",
								},
							},
						},
					},
				],
			},
		],
		outlines: [
			{
				id: "ol-products-main",
				title: "Main",
				tree: [
					{
						id: "sec-products-arrivals",
						name: "New Arrivals",
						open: true,
						children: [
							{
								id: "row-products-arrivals",
								open: true,
								children: [
									{
										id: "col-products-arrivals",
										open: true,
										elements: [
											{ id: "ele-products-heading" },
											{ id: "ele-products-subtext" },
										],
									},
								],
							},
						],
					},
				],
				elements: {
					"ele-products-heading": {
						type: "ct-heading",
						properties: {
							text: "New Arrivals",
						},
					},
					"ele-products-subtext": {
						type: "ct-text",
						properties: {
							text: "Check out the latest gear for this season.",
						},
					},
				},
			},
		],
	},

	{
		id: "page-site-product-a",
		name: "Product A",
		parentId: "page-site-products",
		status: "Review",
		lastModified: "2023-10-23",
		contentTypeId: "ct-page",
		data: {
			seo: {
				en: {
					original: {
						title: "Stride Elite Runner | Stride",
						description: "Our most advanced running shoe yet. Lightweight, responsive, and durable.",
						canonicalUrl: "https://stride.com/products/elite-runner",
						robots: "index,follow",
						image: "https://stride.com/og-elite-runner.jpg",
						ogTitle: "Stride Elite Runner",
						ogDescription: "Our most advanced running shoe yet.",
						ogImage: "https://stride.com/og-elite-runner.jpg",
						twitterTitle: "Stride Elite Runner",
						twitterDescription: "Our most advanced running shoe yet.",
						twitterImage: "https://stride.com/og-elite-runner.jpg",
					},
				},
			},
		},
		variations: [
			{
				id: "original",
				name: "Original",
				status: "Review",
				outlines: [
					{
						id: "ol-product-a-main",
						title: "Main",
						tree: [
							{
								id: "sec-product-a-hero",
								name: "Hero",
								open: true,
								children: [
									{
										id: "row-product-a-hero",
										open: true,
										children: [
											{
												id: "col-product-a-hero",
												open: true,
												elements: [
													{ id: "ele-product-a-heading" },
													{ id: "ele-product-a-body" },
													{ id: "ele-product-a-cta" },
												],
											},
										],
									},
								],
							},
						],
						elements: {
							"ele-product-a-heading": {
								type: "ct-heading",
								properties: {
									text: "Stride Elite Runner",
								},
							},
							"ele-product-a-body": {
								type: "ct-text",
								properties: {
									text: "Our most advanced running shoe yet. Lightweight, responsive, and durable.",
								},
							},
							"ele-product-a-cta": {
								type: "ct-button",
								properties: {
									label: "Add to Cart",
								},
							},
						},
					},
				],
			},
		],
		outlines: [
			{
				id: "ol-product-a-main",
				title: "Main",
				tree: [
					{
						id: "sec-product-a-hero",
						name: "Hero",
						open: true,
						children: [
							{
								id: "row-product-a-hero",
								open: true,
								children: [
									{
										id: "col-product-a-hero",
										open: true,
										elements: [
											{ id: "ele-product-a-heading" },
											{ id: "ele-product-a-body" },
											{ id: "ele-product-a-cta" },
										],
									},
								],
							},
						],
					},
				],
				elements: {
					"ele-product-a-heading": {
						type: "ct-heading",
						properties: {
							text: "Stride Elite Runner",
						},
					},
					"ele-product-a-body": {
						type: "ct-text",
						properties: {
							text: "Our most advanced running shoe yet. Lightweight, responsive, and durable.",
						},
					},
					"ele-product-a-cta": {
						type: "ct-button",
						properties: {
							label: "Add to Cart",
						},
					},
				},
			},
		],
	},

	{
		id: "page-site-features",
		name: "Features",
		parentId: "page-site-home",
		status: "Published",
		lastModified: "2026-05-26",
		contentTypeId: "exp-landing-page",
		displayTemplateKey: "defaultExperience",
		displaySettings: [
			{ key: "backgroundColor", value: "light-blue" },
			{ key: "spacing", value: "compact" }
		],
		slug: "features",
		data: {
			seo: {
				en: {
					original: {
						title: "Features | Stride Platform",
						description: "Orchestrate every crew from one cockpit with Stride Platform.",
						canonicalUrl: "https://stride.com/features",
						robots: "index,follow",
						image: "https://stride.com/og-features.jpg",
						ogTitle: "Stride Platform Features",
						ogDescription: "Surface plans, biometrics, and readiness cues in a single operating view.",
						ogImage: "https://stride.com/og-features.jpg",
						twitterTitle: "Stride Platform Features",
						twitterDescription: "Surface plans, biometrics, and readiness cues in a single operating view.",
						twitterImage: "https://stride.com/og-features.jpg",
					},
				},
			},
		},
		variations: [
			{
				id: "original",
				name: "Original",
				status: "Published",
				outlines: [
					{
						id: "ol-features-main",
						title: "Main",
						tree: [
							// Hero Section
							{
								id: "sec-features-hero",
								name: "Hero",
								type: "ct-section",
								open: true,
								noPadding: true,
								displayTemplateKey: "defaultSection",
								displaySettings: [
									{ key: "colorScheme", value: "default" },
									{ key: "spacing", value: "default" }
								],
								children: [
									{
										id: "row-features-hero",
										open: true,
										children: [
											{
												id: "col-features-hero-content",
												open: true,
												elements: [
													{ id: "ele-features-hero" },
												],
											},
										],
									},
								],
							},
							// Section 2: One Canvas
							{
								id: "sec-features-canvas",
								name: "One Canvas",
								type: "ct-section",
								open: true,
								displayTemplateKey: "defaultSection",
								displaySettings: [
									{ key: "colorScheme", value: "default" },
									{ key: "spacing", value: "compact" }
								],
								children: [
									{
										id: "row-features-canvas",
										open: true,
										children: [
											{
												id: "col-canvas-content",
												open: true,
												elements: [
													{ id: "ele-canvas-heading" },
													{ id: "ele-canvas-body" },
												],
											},
										],
									},
								],
							},
							// Section 3: Design Flows
							{
								id: "sec-features-flows",
								name: "Design Flows",
								type: "ct-section",
								open: true,
								displayTemplateKey: "defaultSection",
								displaySettings: [
									{ key: "colorScheme", value: "default" },
									{ key: "spacing", value: "compact" }
								],
								children: [
									{
										id: "row-features-flows",
										open: true,
										children: [
											{
												id: "col-flows-content",
												open: true,
												elements: [
													{ id: "ele-flows-heading" },
													{ id: "ele-flows-body" },
												],
											},
										],
									},
								],
							},
							// Section 4: Context Follows
							{
								id: "sec-features-context",
								name: "Context Follows",
								type: "ct-section",
								open: true,
								displayTemplateKey: "defaultSection",
								displaySettings: [
									{ key: "colorScheme", value: "default" },
									{ key: "spacing", value: "compact" }
								],
								children: [
									{
										id: "row-features-context",
										open: true,
										children: [
											{
												id: "col-context-content",
												open: true,
												elements: [
													{ id: "ele-context-heading" },
													{ id: "ele-context-body" },
												],
											},
										],
									},
								],
							},
							// Section 5: Cards Row
							{
								id: "sec-features-cards",
								name: "Cards",
								type: "ct-section",
								open: true,
								displayTemplateKey: "defaultSection",
								displaySettings: [
									{ key: "colorScheme", value: "default" },
									{ key: "spacing", value: "compact" }
								],
								children: [
									{
										id: "row-features-cards",
										open: true,
										children: [
											{
												id: "col-join-card",
												open: true,
												elements: [
													{ id: "ele-join-card" },
												],
											},
											{
												id: "col-coach-card",
												open: true,
												elements: [
													{ id: "ele-coach-card" },
												],
											},
										],
									},
								],
							},
						],
						elements: {
							// Hero Elements
							"ele-features-hero": {
								type: "ct-hero",
								properties: {
									badge: "STRIDE PLATFORM",
									heading: "Orchestrate every crew from one cockpit",
									subheading: "Surface plans, biometrics, and readiness cues in a single operating view so coaches can shift priorities without jumping between tools.",
									primaryButton: "",
									secondaryButton: "",
									backgroundImage: "/sports-1.jpg",
									appMockupImage: "",
									showAppMockup: "false",
									displayTemplateKey: "centeredHero",
									displaySettings: [
										{ key: "layout", value: "centered" },
									],
								},
							},

							// Section 2: One Canvas Elements
							"ele-canvas-heading": {
								type: "ct-heading",
								properties: {
									text: "One canvas for every signal",
									accent: "",
									level: "h2",
								},
							},
							"ele-canvas-body": {
								type: "ct-text",
								properties: {
									text: "Blend workouts, notes, and live vitals into a shared board that updates in real time. Coaches get instant context, and athletes always see the latest calls without waiting for status meetings.",
									displayTemplateKey: "defaultText",
					displaySettings: [
						{ key: "size", value: "default" },
						{ key: "emphasis", value: "normal" },
					],
								},
							},

							// Section 3: Design Flows Elements
							"ele-flows-heading": {
								type: "ct-heading",
								properties: {
									text: "Design flows once, reuse forever",
									accent: "",
									level: "h2",
								},
							},
							"ele-flows-body": {
								type: "ct-text",
								properties: {
									text: "Template onboarding journeys, playbooks, and recovery protocols. Drop them into any squad with one click and tweak the details without breaking the underlying flow.",
									displayTemplateKey: "defaultText",
					displaySettings: [
						{ key: "size", value: "default" },
						{ key: "emphasis", value: "normal" },
					],
								},
							},

							// Section 4: Context Follows Elements
							"ele-context-heading": {
								type: "ct-heading",
								properties: {
									text: "Context follows every decision",
									accent: "",
									level: "h2",
								},
							},
							"ele-context-body": {
								type: "ct-text",
								properties: {
									text: "Thread film, files, and AI summaries directly onto each block so history is never siloed. Anyone new to the plan can rewind decisions in seconds.",
									displayTemplateKey: "defaultText",
					displaySettings: [
						{ key: "size", value: "default" },
						{ key: "emphasis", value: "normal" },
					],
								},
							},

							// Section 5: Cards Elements
							"ele-join-card": {
								type: "ct-card",
								properties: {
									backgroundImage: "/features-card-1.jpg",
									label: "Join the Community",
									description: "Ride with thousands of others.",
									displayTemplateKey: "defaultCard",
					displaySettings: [
						{ key: "style", value: "simple" },
					],
								},
							},
							"ele-coach-card": {
								type: "ct-card",
								properties: {
									backgroundImage: "/features-card-2.jpg",
									label: "Find a Coach",
									description: "Get a personalized training plan.",
									displayTemplateKey: "defaultCard",
					displaySettings: [
						{ key: "style", value: "simple" },
					],
								},
							},

						},
					},
					{
						id: "ol-features-sidebar",
						title: "Sidebar",
						tree: [
							// Events Section
							{
								id: "sec-sidebar-events",
								name: "Events",
								open: true,
								children: [
									{
										id: "row-sidebar-events",
										open: true,
										children: [
											{
												id: "col-events-content",
												open: true,
												elements: [
													{ id: "ele-events-label" },
													{ id: "ele-event-1" },
													{ id: "ele-event-2" },
												],
											},
										],
									},
								],
							},
							// News Section
							{
								id: "sec-sidebar-news",
								name: "News",
								open: true,
								children: [
									{
										id: "row-sidebar-news",
										open: true,
										children: [
											{
												id: "col-news-content",
												open: true,
												elements: [
													{ id: "ele-news-label" },
													{ id: "ele-news-1" },
													{ id: "ele-news-2" },
													{ id: "ele-news-btn" },
												],
											},
										],
									},
								],
							},
						],
						elements: {
							// Events Elements
							"ele-events-label": {
								type: "ct-text",
								properties: {
									text: "EVENTS",
									displayTemplateKey: "accentText",
					displaySettings: [
						{ key: "color", value: "blue" },
					],
								},
							},
							"ele-event-1": {
								type: "ct-sidebar-item",
								properties: {
									title: "Global Running Summit 2026",
									description: "Join us for a day of keynotes and workshops on the future of endurance sports and wearable technology.",
								},
							},
							"ele-event-2": {
								type: "ct-sidebar-item",
								properties: {
									title: "Stride Community Marathon",
									description: "Connect with other Stride athletes, break your personal bests, and celebrate with the community.",
								},
							},

							// News Elements
							"ele-news-label": {
								type: "ct-text",
								properties: {
									text: "NEWS",
									displayTemplateKey: "accentText",
					displaySettings: [
						{ key: "color", value: "blue" },
					],
								},
							},
							"ele-news-1": {
								type: "ct-sidebar-item",
								properties: {
									title: "Stride raises Series B to expand global fitness community",
									description: "We are thrilled to announce our latest funding round led by top-tier investors to accelerate our mission of making the world move more.",
								},
							},
							"ele-news-2": {
								type: "ct-sidebar-item",
								properties: {
									title: "Introducing Stride Stats 2.0 with AI coaching",
									description: "Our biggest update yet includes automated form analysis, recovery recommendations, and predictive race pacing.",
								},
							},
							"ele-news-btn": {
								type: "ct-button",
								properties: {
									label: "ALL NEWS & EVENTS",
									displayTemplateKey: "secondaryButton",
					displaySettings: [],
								},
							},
						},
					},
				],
			},
		],
	},
	{
		id: "page-exp-landing-default",
		contentTypeId: "exp-landing-page",
		name: "Default Landing",
		parentId: null,
		status: "Published",
		lastModified: "2023-10-27",
		data: {
			seo: {
				en: {
					original: {
						title: "Default Landing | Stride",
						description: "Join thousands of runners in the most iconic triathlon of the year.",
						canonicalUrl: "https://stride.com/landing",
						robots: "index,follow",
						image: "https://stride.com/og-landing.jpg",
						ogTitle: "Stride Landing Page",
						ogDescription: "Join thousands of runners in the most iconic triathlon of the year.",
						ogImage: "https://stride.com/og-landing.jpg",
						twitterTitle: "Stride Landing Page",
						twitterDescription: "Join thousands of runners in the most iconic triathlon of the year.",
						twitterImage: "https://stride.com/og-landing.jpg",
					},
				},
			},
		},
		variations: [
			{
				id: "original",
				name: "Original",
				status: "Published",
				outlines: [
					{
						id: "ol-landing-main",
						title: "Main",
						tree: [
							{
								id: "sec-landing-hero",
								name: "Hero",
								bgImage: "/stride-hero/hero.png",
								open: true,
								children: [
									{
										id: "row-landing-hero",
										open: true,
										children: [
											{
												id: "col-landing-hero",
												open: true,
												elements: [
													{ id: "ele-landing-hero-badge" },
													{ id: "ele-landing-hero-sub" },
													{ id: "ele-landing-hero-heading" },
													{ id: "ele-landing-hero-broken-image" },
												],
											},
										],
									},
									{
										id: "row-landing-hero-cta",
										open: true,
										children: [
											{
												id: "col-landing-hero-cta-1",
												open: true,
												elements: [{ id: "ele-landing-hero-cta-primary" }],
											},
											{
												id: "col-landing-hero-cta-2",
												open: true,
												elements: [{ id: "ele-landing-hero-cta-secondary" }],
											},
										],
									},
									{
										id: "row-landing-hero-stats",
										open: true,
										children: [
											{
												id: "col-landing-hero-stat-1",
												open: true,
												elements: [
													{ id: "ele-landing-hero-stat-1-heading" },
													{ id: "ele-landing-hero-stat-1-text" },
												],
											},
											{
												id: "col-landing-hero-stat-2",
												open: true,
												elements: [
													{ id: "ele-landing-hero-stat-2-heading" },
													{ id: "ele-landing-hero-stat-2-text" },
												],
											},
											{
												id: "col-landing-hero-stat-3",
												open: true,
												elements: [
													{ id: "ele-landing-hero-stat-3-heading" },
													{ id: "ele-landing-hero-stat-3-text" },
												],
											},
										],
									},
								],
							},
							{
								id: "sec-landing-features-intro",
								name: "Features Intro",
								open: true,
								children: [
									{
										id: "row-landing-features-intro",
										open: true,
										children: [
											{
												id: "col-landing-features-intro",
												open: true,
												elements: [
													{ id: "ele-landing-features-heading" },
													{ id: "ele-landing-features-sub" },
												],
											},
										],
									},
								],
							},
							{
								id: "sec-landing-features-grid",
								name: "Features Grid",
								open: true,
								children: [
									{
										id: "row-landing-features-1",
										open: true,
										children: [
											{
												id: "col-feat-1",
												open: true,
												elements: [{ id: "ele-feat-1" }],
											},
											{
												id: "col-feat-2",
												open: true,
												elements: [{ id: "ele-feat-2" }],
											},
											{
												id: "col-feat-3",
												open: true,
												elements: [{ id: "ele-feat-3" }],
											},
										],
									},
									{
										id: "row-landing-features-2",
										open: true,
										children: [
											{
												id: "col-feat-4",
												open: true,
												elements: [{ id: "ele-feat-4" }],
											},
											{
												id: "col-feat-5",
												open: true,
												elements: [{ id: "ele-feat-5" }],
											},
											{
												id: "col-feat-6",
												open: true,
												elements: [{ id: "ele-feat-6" }],
											},
										],
									},
								],
							},
							{
								id: "sec-landing-testimonials",
								name: "Testimonials",
								open: true,
								children: [
									{
										id: "row-landing-testimonials-intro",
										open: true,
										children: [
											{
												id: "col-landing-testimonials-intro",
												open: true,
												elements: [
													{ id: "ele-landing-testimonials-heading" },
													{ id: "ele-landing-testimonials-sub" },
												],
											},
										],
									},
									{
										id: "row-landing-testimonials-cards",
										open: true,
										children: [
											{
												id: "col-test-1",
												open: true,
												elements: [{ id: "ele-test-1" }],
											},
											{
												id: "col-test-2",
												open: true,
												elements: [{ id: "ele-test-2" }],
											},
										],
									},
								],
							},
							{
								id: "sec-landing-cta",
								name: "CTA",
								open: true,
								children: [
									{
										id: "row-landing-cta",
										open: true,
										children: [
											{
												id: "col-landing-cta",
												open: true,
												elements: [
													{ id: "ele-landing-cta-heading" },
													{ id: "ele-landing-cta-sub" },
													{ id: "ele-landing-cta-button" },
												],
											},
										],
									},
								],
							},
							{
								id: "sec-landing-challenges",
								name: "Challenges",
								open: true,
								children: [
									{
										id: "row-landing-challenges-intro",
										open: true,
										children: [
											{
												id: "col-landing-challenges-intro",
												open: true,
												elements: [
													{ id: "ele-landing-challenges-heading" },
													{ id: "ele-landing-challenges-sub" },
												],
											},
										],
									},
									{
										id: "row-landing-challenges-cards",
										open: true,
										children: [
											{
												id: "col-chal-1",
												open: true,
												elements: [{ id: "ele-chal-1" }],
											},
											{
												id: "col-chal-2",
												open: true,
												elements: [{ id: "ele-chal-2" }],
											},
											{
												id: "col-chal-3",
												open: true,
												elements: [{ id: "ele-chal-3" }],
											},
										],
									},
								],
							},
							{
								id: "sec-landing-pricing",
								name: "Pricing",
								open: true,
								children: [
									{
										id: "row-landing-pricing-intro",
										open: true,
										children: [
											{
												id: "col-landing-pricing-intro",
												open: true,
												elements: [
													{ id: "ele-landing-pricing-heading" },
													{ id: "ele-landing-pricing-sub" },
												],
											},
										],
									},
									{
										id: "row-landing-pricing-cards",
										open: true,
										children: [
											{
												id: "col-price-1",
												open: true,
												elements: [{ id: "ele-price-1" }],
											},
											{
												id: "col-price-2",
												open: true,
												elements: [{ id: "ele-price-2" }],
											},
											{
												id: "col-price-3",
												open: true,
												elements: [{ id: "ele-price-3" }],
											},
										],
									},
								],
							},
							{
								id: "sec-landing-stories",
								name: "Stories",
								open: true,
								children: [
									{
										id: "row-landing-stories-intro",
										open: true,
										children: [
											{
												id: "col-landing-stories-intro",
												open: true,
												elements: [
													{ id: "ele-landing-stories-heading" },
													{ id: "ele-landing-stories-sub" },
												],
											},
										],
									},
									{
										id: "row-landing-stories-cards",
										open: true,
										children: [
											{
												id: "col-story-1",
												open: true,
												elements: [{ id: "ele-story-1" }],
											},
											{
												id: "col-story-2",
												open: true,
												elements: [{ id: "ele-story-2" }],
											},
											{
												id: "col-story-3",
												open: true,
												elements: [{ id: "ele-story-3" }],
											},
										],
									},
								],
							},
							{
								id: "sec-landing-footer-cta",
								name: "Footer CTA",
								open: true,
								children: [
									{
										id: "row-landing-footer-cta",
										open: true,
										children: [
											{
												id: "col-landing-footer-cta",
												open: true,
												elements: [
													{ id: "ele-landing-footer-cta-heading" },
													{ id: "ele-landing-footer-cta-sub" },
													{ id: "ele-landing-footer-cta-stats" },
												],
											},
										],
									},
								],
							},
						],
						elements: {
							"ele-landing-hero-badge": {
								type: "ct-text",
								properties: {
									text: "● Join 2M+ active users worldwide",
								},
							},
							"ele-landing-hero-sub": {
								type: "ct-text",
								properties: {
									text: "Ready. Set. Go.",
								},
							},
							"ele-landing-hero-heading": {
								type: "ct-heading",
								properties: {
									text: "Join thousands of runners in the most iconic triathlon of the year. Challenge yourself and cross the finish line!",
								},
							},
							"ele-landing-hero-broken-image": {
								type: "ct-image-block",
								properties: {
									image: "https://example.com/missing-image-404.jpg",
								},
							},
							"ele-landing-hero-cta-primary": {
								type: "ct-button",
								properties: {
									label: "Register for your bib",
									url: "/register",
								},
							},
							"ele-landing-hero-cta-secondary": {
								type: "ct-button",
								properties: {
									label: "Learn More",
									url: "/about",
								},
							},
							"ele-landing-hero-stat-1-heading": {
								type: "ct-heading",
								properties: {
									text: "500K+",
									variant: "stat",
								},
							},
							"ele-landing-hero-stat-1-text": {
								type: "ct-text",
								properties: {
									text: "Annual participants",
									variant: "stat",
								},
							},
							"ele-landing-hero-stat-2-heading": {
								type: "ct-heading",
								properties: {
									text: "45+",
									variant: "stat",
								},
							},
							"ele-landing-hero-stat-2-text": {
								type: "ct-text",
								properties: {
									text: "Countries represented",
									variant: "stat",
								},
							},
							"ele-landing-hero-stat-3-heading": {
								type: "ct-heading",
								properties: {
									text: "4.9/5",
									variant: "stat",
								},
							},
							"ele-landing-hero-stat-3-text": {
								type: "ct-text",
								properties: {
									text: "Average rating",
									variant: "stat",
								},
							},
							"ele-landing-features-heading": {
								type: "ct-heading",
								properties: {
									text: "Everything you need to stay motivated",
								},
							},
							"ele-landing-features-sub": {
								type: "ct-text",
								properties: {
									text: "Track your progress, connect with friends, and push your limits with our comprehensive fitness platform.",
								},
							},
							"ele-feat-1": {
								type: "ct-rich-text",
								properties: {
									richtext: {
											type: "doc",
											content: [
												{
													type: "paragraph",
													content: [
														{
															type: "text",
															text: "GPS Tracking: ",
															marks: [{ type: "bold" }],
														},
														{
															type: "text",
															text: "Accurate route mapping and distance tracking for all your outdoor activities.",
														},
													],
												},
											],
										},
								},
							},
							"ele-feat-2": {
								type: "ct-rich-text",
								properties: {
									richtext: {
											type: "doc",
											content: [
												{
													type: "paragraph",
													content: [
														{
															type: "text",
															text: "Heart Rate Monitoring: ",
															marks: [{ type: "bold" }],
														},
														{
															type: "text",
															text: "Real-time heart rate tracking to optimize your workout intensity.",
														},
													],
												},
											],
										},
								},
							},
							"ele-feat-3": {
								type: "ct-rich-text",
								properties: {
									richtext: {
											type: "doc",
											content: [
												{
													type: "paragraph",
													content: [
														{
															type: "text",
															text: "Performance Analytics: ",
															marks: [{ type: "bold" }],
														},
														{
															type: "text",
															text: "Detailed insights and progress tracking to help you improve over time.",
														},
													],
												},
											],
										},
								},
							},
							"ele-feat-4": {
								type: "ct-rich-text",
								properties: {
									richtext: {
											type: "doc",
											content: [
												{
													type: "paragraph",
													content: [
														{
															type: "text",
															text: "Achievement System: ",
															marks: [{ type: "bold" }],
														},
														{
															type: "text",
															text: "Unlock badges and celebrate milestones as you reach your fitness goals.",
														},
													],
												},
											],
										},
								},
							},
							"ele-feat-5": {
								type: "ct-rich-text",
								properties: {
									richtext: {
											type: "doc",
											content: [
												{
													type: "paragraph",
													content: [
														{
															type: "text",
															text: "Social Features: ",
															marks: [{ type: "bold" }],
														},
														{
															type: "text",
															text: "Share your achievements and connect with a community of fitness enthusiasts.",
														},
													],
												},
											],
										},
								},
							},
							"ele-feat-6": {
								type: "ct-rich-text",
								properties: {
									richtext: {
											type: "doc",
											content: [
												{
													type: "paragraph",
													content: [
														{
															type: "text",
															text: "Cross-Platform Sync: ",
															marks: [{ type: "bold" }],
														},
														{
															type: "text",
															text: "Seamlessly sync your data across all your devices and platforms.",
														},
													],
												},
											],
										},
								},
							},
							"ele-landing-testimonials-heading": {
								type: "ct-heading",
								properties: {
									text: "Join millions of active users",
								},
							},
							"ele-landing-testimonials-sub": {
								type: "ct-text",
								properties: {
									text: "Connect, compete, and get motivated by our global community of fitness enthusiasts.",
								},
							},
							"ele-test-1": {
								type: "ct-rich-text",
								properties: {
									richtext: {
											type: "doc",
											content: [
												{
													type: "paragraph",
													content: [
														{
															type: "text",
															text: "Sarah M.: ",
															marks: [{ type: "bold" }],
														},
														{
															type: "text",
															text: "Amazing run through Central Park this morning! The GPS tracking was spot-on and I love seeing my progress over time. 🏃‍♀️✨",
														},
													],
												},
											],
										},
								},
							},
							"ele-test-2": {
								type: "ct-rich-text",
								properties: {
									richtext: {
											type: "doc",
											content: [
												{
													type: "paragraph",
													content: [
														{
															type: "text",
															text: "Mike R.: ",
															marks: [{ type: "bold" }],
														},
														{
															type: "text",
															text: "Crushed my half-marathon goal! The community challenges really pushed me to go further than I thought possible. 💪🏆",
														},
													],
												},
											],
										},
								},
							},
							"ele-landing-cta-heading": {
								type: "ct-heading",
								properties: {
									text: "Ready to join the community?",
								},
							},
							"ele-landing-cta-sub": {
								type: "ct-text",
								properties: {
									text: "Start sharing your fitness journey and get inspired by others.",
								},
							},
							"ele-landing-cta-button": {
								type: "ct-button",
								properties: {
									label: "Join Now",
									url: "/register",
								},
							},
							"ele-landing-challenges-heading": {
								type: "ct-heading",
								properties: {
									text: "Push your limits",
								},
							},
							"ele-landing-challenges-sub": {
								type: "ct-text",
								properties: {
									text: "Join exciting challenges and compete with users worldwide to reach new fitness milestones.",
								},
							},
							"ele-chal-1": {
								type: "ct-rich-text",
								properties: {
									richtext: {
											type: "doc",
											content: [
												{
													type: "paragraph",
													content: [
														{
															type: "text",
															text: "October Run Streak: ",
															marks: [{ type: "bold" }],
														},
														{
															type: "text",
															text: "Run at least 1 mile every day this month. Progress: 65%",
														},
													],
												},
											],
										},
								},
							},
							"ele-chal-2": {
								type: "ct-rich-text",
								properties: {
									richtext: {
											type: "doc",
											content: [
												{
													type: "paragraph",
													content: [
														{
															type: "text",
															text: "100 Mile Challenge: ",
															marks: [{ type: "bold" }],
														},
														{
															type: "text",
															text: "Complete 100 miles in 30 days. Progress: 42%",
														},
													],
												},
											],
										},
								},
							},
							"ele-chal-3": {
								type: "ct-rich-text",
								properties: {
									richtext: {
											type: "doc",
											content: [
												{
													type: "paragraph",
													content: [
														{
															type: "text",
															text: "Weekend Warrior: ",
															marks: [{ type: "bold" }],
														},
														{
															type: "text",
															text: "Double your weekend mileage. Progress: 0%",
														},
													],
												},
											],
										},
								},
							},
							"ele-landing-pricing-heading": {
								type: "ct-heading",
								properties: {
									text: "Choose your plan",
								},
							},
							"ele-landing-pricing-sub": {
								type: "ct-text",
								properties: {
									text: "Select the perfect plan for your fitness journey. Upgrade or downgrade anytime.",
								},
							},
							"ele-price-1": {
								type: "ct-product",
								properties: {
									name: "Free",
									price: "$0/mo",
									description: "Basic activity tracking, Community access, 5 challenges per month.",
								},
							},
							"ele-price-2": {
								type: "ct-product",
								properties: {
									name: "Pro",
									price: "$9.99/mo",
									description: "Everything in Free, Unlimited challenges, Advanced analytics, Heart rate monitoring.",
								},
							},
							"ele-price-3": {
								type: "ct-product",
								properties: {
									name: "Team",
									price: "$24.99/mo",
									description: "Everything in Pro, Up to 10 team members, Team challenges, Admin dashboard.",
								},
							},
							"ele-landing-stories-heading": {
								type: "ct-heading",
								properties: {
									text: "Real results from real people",
								},
							},
							"ele-landing-stories-sub": {
								type: "ct-text",
								properties: {
									text: "See how STRIDE has transformed the fitness journeys of our amazing community members.",
								},
							},
							"ele-story-1": {
								type: "ct-rich-text",
								properties: {
									richtext: {
											type: "doc",
											content: [
												{
													type: "paragraph",
													content: [
														{
															type: "text",
															text: "Jessica T.: ",
															marks: [{ type: "bold" }],
														},
														{
															type: "text",
															text: "STRIDE helped me train for my first marathon. The personalized plans kept me motivated!",
														},
													],
												},
											],
										},
								},
							},
							"ele-story-2": {
								type: "ct-rich-text",
								properties: {
									richtext: {
											type: "doc",
											content: [
												{
													type: "paragraph",
													content: [
														{
															type: "text",
															text: "Marcus R.: ",
															marks: [{ type: "bold" }],
														},
														{
															type: "text",
															text: "The analytics features are incredible. Being able to track my performance has helped me identify areas for improvement.",
														},
													],
												},
											],
										},
								},
							},
							"ele-story-3": {
								type: "ct-rich-text",
								properties: {
									richtext: {
											type: "doc",
											content: [
												{
													type: "paragraph",
													content: [
														{
															type: "text",
															text: "Amanda K.: ",
															marks: [{ type: "bold" }],
														},
														{
															type: "text",
															text: "I love the social aspect of STRIDE. Connecting with other fitness enthusiasts has completely transformed my workout routine.",
														},
													],
												},
											],
										},
								},
							},
							"ele-landing-footer-cta-heading": {
								type: "ct-heading",
								properties: {
									text: "Join over 2 million users achieving their goals",
								},
							},
							"ele-landing-footer-cta-sub": {
								type: "ct-text",
								properties: {
									text: "Start your fitness journey today and become part of our success stories.",
								},
							},
							"ele-landing-footer-cta-stats": {
								type: "ct-text",
								properties: {
									text: "4.9/5 App Store Rating | 50K+ 5-Star Reviews | 2M+ Active Users",
								},
							},
						},
					},

					{
						id: "ol-landing-aside",
						title: "Aside",
						tree: [
							{
								id: "sec-aside-blog",
								name: "Latest Blog Posts",
								open: true,
								children: [
									{
										id: "row-aside-blog",
										open: true,
										children: [
											{
												id: "col-aside-blog",
												open: true,
												elements: [
													{ id: "ele-aside-blog-heading" },
													{ id: "ele-aside-blog-1" },
													{ id: "ele-aside-blog-2" },
													{ id: "ele-aside-blog-3" },
												],
											},
										],
									},
								],
							},
							{
								id: "sec-aside-signup",
								name: "Join STRIDE Today",
								open: true,
								children: [
									{
										id: "row-aside-signup",
										open: true,
										children: [
											{
												id: "col-aside-signup",
												open: true,
												elements: [
													{ id: "ele-aside-signup-heading" },
													{ id: "ele-aside-signup-sub" },
													{ id: "ele-aside-signup-name" },
													{ id: "ele-aside-signup-email" },
													{ id: "ele-aside-signup-pass" },
													{ id: "ele-aside-signup-btn" },
													{ id: "ele-aside-signup-footer" },
												],
											},
										],
									},
								],
							},
						],
						elements: {
							"ele-aside-blog-heading": {
								type: "ct-heading",
								properties: {
									text: "Latest Blog Posts",
								},
							},
							"ele-aside-blog-1": {
								type: "ct-text",
								properties: {
									text: "10 Tips For Your First Marathon (2 days ago)",
								},
							},
							"ele-aside-blog-2": {
								type: "ct-text",
								properties: {
									text: "Cycling Workouts for Beginners (5 days ago)",
								},
							},
							"ele-aside-blog-3": {
								type: "ct-text",
								properties: {
									text: "The Science of Running Form (1 week ago)",
								},
							},
							"ele-aside-signup-heading": {
								type: "ct-heading",
								properties: {
									text: "Join STRIDE Today",
								},
							},
							"ele-aside-signup-sub": {
								type: "ct-text",
								properties: {
									text: "Start your fitness journey with our community",
								},
							},
							"ele-aside-signup-name": {
								type: "ct-input",
								properties: {
									placeholder: "Full Name",
								},
							},
							"ele-aside-signup-email": {
								type: "ct-input",
								properties: {
									placeholder: "Email Address",
								},
							},
							"ele-aside-signup-pass": {
								type: "ct-input",
								properties: {
									placeholder: "Password",
								},
							},
							"ele-aside-signup-btn": {
								type: "ct-button",
								properties: {
									label: "Create Account",
								},
							},
							"ele-aside-signup-footer": {
								type: "ct-text",
								properties: {
									text: "By signing up, you agree to our Terms of Service and Privacy Policy",
								},
							},
						},
					},
				],
			},
		],
		outlines: [
			{
				id: "ol-landing-main",
				title: "Main",
				tree: [
					{
						id: "sec-landing-hero",
						name: "Hero",
						bgImage: "/stride-hero/hero.png",
						open: true,
						children: [
							{
								id: "row-landing-hero",
								open: true,
								children: [
									{
										id: "col-landing-hero",
										open: true,
										elements: [
											{ id: "ele-landing-hero-badge" },
											{ id: "ele-landing-hero-sub" },
											{ id: "ele-landing-hero-heading" },
										],
									},
								],
							},
							{
								id: "row-landing-hero-cta",
								open: true,
								children: [
									{
										id: "col-landing-hero-cta-1",
										open: true,
										elements: [{ id: "ele-landing-hero-cta-primary" }],
									},
									{
										id: "col-landing-hero-cta-2",
										open: true,
										elements: [{ id: "ele-landing-hero-cta-secondary" }],
									},
								],
							},
							{
								id: "row-landing-hero-stats",
								open: true,
								children: [
									{
										id: "col-landing-hero-stat-1",
										open: true,
										elements: [
											{ id: "ele-landing-hero-stat-1-heading" },
											{ id: "ele-landing-hero-stat-1-text" },
										],
									},
									{
										id: "col-landing-hero-stat-2",
										open: true,
										elements: [
											{ id: "ele-landing-hero-stat-2-heading" },
											{ id: "ele-landing-hero-stat-2-text" },
										],
									},
									{
										id: "col-landing-hero-stat-3",
										open: true,
										elements: [
											{ id: "ele-landing-hero-stat-3-heading" },
											{ id: "ele-landing-hero-stat-3-text" },
										],
									},
								],
							},
						],
					},
					{
						id: "sec-landing-features-intro",
						name: "Features Intro",
						open: true,
						children: [
							{
								id: "row-landing-features-intro",
								open: true,
								children: [
									{
										id: "col-landing-features-intro",
										open: true,
										elements: [
											{ id: "ele-landing-features-heading" },
											{ id: "ele-landing-features-sub" },
										],
									},
								],
							},
						],
					},
					{
						id: "sec-landing-features-grid",
						name: "Features Grid",
						open: true,
						children: [
							{
								id: "row-landing-features-1",
								open: true,
								children: [
									{ id: "col-feat-1", open: true, elements: [{ id: "ele-feat-1" }] },
									{ id: "col-feat-2", open: true, elements: [{ id: "ele-feat-2" }] },
									{ id: "col-feat-3", open: true, elements: [{ id: "ele-feat-3" }] },
								],
							},
							{
								id: "row-landing-features-2",
								open: true,
								children: [
									{ id: "col-feat-4", open: true, elements: [{ id: "ele-feat-4" }] },
									{ id: "col-feat-5", open: true, elements: [{ id: "ele-feat-5" }] },
									{ id: "col-feat-6", open: true, elements: [{ id: "ele-feat-6" }] },
								],
							},
						],
					},
					{
						id: "sec-landing-testimonials",
						name: "Testimonials",
						open: true,
						children: [
							{
								id: "row-landing-testimonials-intro",
								open: true,
								children: [
									{
										id: "col-landing-testimonials-intro",
										open: true,
										elements: [
											{ id: "ele-landing-testimonials-heading" },
											{ id: "ele-landing-testimonials-sub" },
										],
									},
								],
							},
							{
								id: "row-landing-testimonials-cards",
								open: true,
								children: [
									{ id: "col-test-1", open: true, elements: [{ id: "ele-test-1" }] },
									{ id: "col-test-2", open: true, elements: [{ id: "ele-test-2" }] },
								],
							},
						],
					},
					{
						id: "sec-landing-cta",
						name: "CTA",
						open: true,
						children: [
							{
								id: "row-landing-cta",
								open: true,
								children: [
									{
										id: "col-landing-cta",
										open: true,
										elements: [
											{ id: "ele-landing-cta-heading" },
											{ id: "ele-landing-cta-sub" },
											{ id: "ele-landing-cta-button" },
										],
									},
								],
							},
						],
					},
					{
						id: "sec-landing-challenges",
						name: "Challenges",
						open: true,
						children: [
							{
								id: "row-landing-challenges-intro",
								open: true,
								children: [
									{
										id: "col-landing-challenges-intro",
										open: true,
										elements: [
											{ id: "ele-landing-challenges-heading" },
											{ id: "ele-landing-challenges-sub" },
										],
									},
								],
							},
							{
								id: "row-landing-challenges-cards",
								open: true,
								children: [
									{ id: "col-chal-1", open: true, elements: [{ id: "ele-chal-1" }] },
									{ id: "col-chal-2", open: true, elements: [{ id: "ele-chal-2" }] },
									{ id: "col-chal-3", open: true, elements: [{ id: "ele-chal-3" }] },
								],
							},
						],
					},
					{
						id: "sec-landing-pricing",
						name: "Pricing",
						open: true,
						children: [
							{
								id: "row-landing-pricing-intro",
								open: true,
								children: [
									{
										id: "col-landing-pricing-intro",
										open: true,
										elements: [
											{ id: "ele-landing-pricing-heading" },
											{ id: "ele-landing-pricing-sub" },
										],
									},
								],
							},
							{
								id: "row-landing-pricing-cards",
								open: true,
								children: [
									{
										id: "col-price-1",
										open: true,
										elements: [{ id: "ele-price-1" }],
									},
									{
										id: "col-price-2",
										open: true,
										elements: [{ id: "ele-price-2" }],
									},
									{
										id: "col-price-3",
										open: true,
										elements: [{ id: "ele-price-3" }],
									},
								],
							},
						],
					},
					{
						id: "sec-landing-stories",
						name: "Stories",
						open: true,
						children: [
							{
								id: "row-landing-stories-intro",
								open: true,
								children: [
									{
										id: "col-landing-stories-intro",
										open: true,
										elements: [
											{ id: "ele-landing-stories-heading" },
											{ id: "ele-landing-stories-sub" },
										],
									},
								],
							},
							{
								id: "row-landing-stories-cards",
								open: true,
								children: [
									{
										id: "col-story-1",
										open: true,
										elements: [{ id: "ele-story-1" }],
									},
									{
										id: "col-story-2",
										open: true,
										elements: [{ id: "ele-story-2" }],
									},
									{
										id: "col-story-3",
										open: true,
										elements: [{ id: "ele-story-3" }],
									},
								],
							},
						],
					},
					{
						id: "sec-landing-footer-cta",
						name: "Footer CTA",
						open: true,
						children: [
							{
								id: "row-landing-footer-cta",
								open: true,
								children: [
									{
										id: "col-landing-footer-cta",
										open: true,
										elements: [
											{ id: "ele-landing-footer-cta-heading" },
											{ id: "ele-landing-footer-cta-sub" },
											{ id: "ele-landing-footer-cta-stats" },
										],
									},
								],
							},
						],
					},
				],
				elements: {
					"ele-landing-hero-badge": {
						type: "ct-text",
						properties: {
							text: "● Join 2M+ active users worldwide",
						},
					},
					"ele-landing-hero-sub": {
						type: "ct-text",
						properties: {
							text: "Ready. Set. Go.",
						},
					},
					"ele-landing-hero-heading": {
						type: "ct-heading",
						properties: {
							text: "Join thousands of runners in the most iconic triathlon of the year. Challenge yourself and cross the finish line!",
						},
					},
					"ele-landing-hero-cta-primary": {
						type: "ct-button",
						properties: {
							label: "Register for your bib",
						},
					},
					"ele-landing-hero-cta-secondary": {
						type: "ct-button",
						properties: {
							label: "Learn More",
						},
					},
					"ele-landing-hero-stat-1-heading": {
						type: "ct-heading",
						properties: {
							text: "500K+",
							variant: "stat",
						},
					},
					"ele-landing-hero-stat-1-text": {
						type: "ct-text",
						properties: {
							text: "Annual participants",
							variant: "stat",
						},
					},
					"ele-landing-hero-stat-2-heading": {
						type: "ct-heading",
						properties: {
							text: "45+",
							variant: "stat",
						},
					},
					"ele-landing-hero-stat-2-text": {
						type: "ct-text",
						properties: {
							text: "Countries represented",
							variant: "stat",
						},
					},
					"ele-landing-hero-stat-3-heading": {
						type: "ct-heading",
						properties: {
							text: "4.9/5",
							variant: "stat",
						},
					},
					"ele-landing-hero-stat-3-text": {
						type: "ct-text",
						properties: {
							text: "Average rating",
							variant: "stat",
						},
					},
					"ele-landing-features-heading": {
						type: "ct-heading",
						properties: {
							text: "Everything you need to stay motivated",
						},
					},
					"ele-landing-features-sub": {
						type: "ct-text",
						properties: {
							text: "Track your progress, connect with friends, and push your limits with our comprehensive fitness platform.",
						},
					},
					"ele-feat-1": {
						type: "ct-rich-text",
						properties: {
							richtext: {
									type: "doc",
									content: [
										{
											type: "paragraph",
											content: [
												{
													type: "text",
													text: "GPS Tracking: ",
													marks: [{ type: "bold" }],
												},
												{
													type: "text",
													text: "Accurate route mapping and distance tracking for all your outdoor activities.",
												},
											],
										},
									],
								},
						},
					},
					"ele-feat-2": {
						type: "ct-rich-text",
						properties: {
							richtext: {
									type: "doc",
									content: [
										{
											type: "paragraph",
											content: [
												{
													type: "text",
													text: "Heart Rate Monitoring: ",
													marks: [{ type: "bold" }],
												},
												{
													type: "text",
													text: "Real-time heart rate tracking to optimize your workout intensity.",
												},
											],
										},
									],
								},
						},
					},
					"ele-feat-3": {
						type: "ct-rich-text",
						properties: {
							richtext: {
									type: "doc",
									content: [
										{
											type: "paragraph",
											content: [
												{
													type: "text",
													text: "Performance Analytics: ",
													marks: [{ type: "bold" }],
												},
												{
													type: "text",
													text: "Detailed insights and progress tracking to help you improve over time.",
												},
											],
										},
									],
								},
						},
					},
					"ele-feat-4": {
						type: "ct-rich-text",
						properties: {
							richtext: {
									type: "doc",
									content: [
										{
											type: "paragraph",
											content: [
												{
													type: "text",
													text: "Achievement System: ",
													marks: [{ type: "bold" }],
												},
												{
													type: "text",
													text: "Unlock badges and celebrate milestones as you reach your fitness goals.",
												},
											],
										},
									],
								},
						},
					},
					"ele-feat-5": {
						type: "ct-rich-text",
						properties: {
							richtext: {
									type: "doc",
									content: [
										{
											type: "paragraph",
											content: [
												{
													type: "text",
													text: "Social Features: ",
													marks: [{ type: "bold" }],
												},
												{
													type: "text",
													text: "Share your achievements and connect with a community of fitness enthusiasts.",
												},
											],
										},
									],
								},
						},
					},
					"ele-feat-6": {
						type: "ct-rich-text",
						properties: {
							richtext: {
									type: "doc",
									content: [
										{
											type: "paragraph",
											content: [
												{
													type: "text",
													text: "Cross-Platform Sync: ",
													marks: [{ type: "bold" }],
												},
												{
													type: "text",
													text: "Seamlessly sync your data across all your devices and platforms.",
												},
											],
										},
									],
								},
						},
					},
					"ele-landing-testimonials-heading": {
						type: "ct-heading",
						properties: {
							text: "Join millions of active users",
						},
					},
					"ele-landing-testimonials-sub": {
						type: "ct-text",
						properties: {
							text: "Connect, compete, and get motivated by our global community of fitness enthusiasts.",
						},
					},
					"ele-test-1": {
						type: "ct-rich-text",
						properties: {
							richtext: {
									type: "doc",
									content: [
										{
											type: "paragraph",
											content: [
												{
													type: "text",
													text: "Sarah M.: ",
													marks: [{ type: "bold" }],
												},
												{
													type: "text",
													text: "Amazing run through Central Park this morning! The GPS tracking was spot-on and I love seeing my progress over time. 🏃‍♀️✨",
												},
											],
										},
									],
								},
						},
					},
					"ele-test-2": {
						type: "ct-rich-text",
						properties: {
							richtext: {
									type: "doc",
									content: [
										{
											type: "paragraph",
											content: [
												{
													type: "text",
													text: "Mike R.: ",
													marks: [{ type: "bold" }],
												},
												{
													type: "text",
													text: "Crushed my half-marathon goal! The community challenges really pushed me to go further than I thought possible. 💪🏆",
												},
											],
										},
									],
								},
						},
					},
					"ele-landing-cta-heading": {
						type: "ct-heading",
						properties: {
							text: "Ready to join the community?",
						},
					},
					"ele-landing-cta-sub": {
						type: "ct-text",
						properties: {
							text: "Start sharing your fitness journey and get inspired by others.",
						},
					},
					"ele-landing-cta-button": {
						type: "ct-button",
						properties: {
							label: "Join Now",
						},
					},
					"ele-landing-challenges-heading": {
						type: "ct-heading",
						properties: {
							text: "Push your limits",
						},
					},
					"ele-landing-challenges-sub": {
						type: "ct-text",
						properties: {
							text: "Join exciting challenges and compete with users worldwide to reach new fitness milestones.",
						},
					},
					"ele-chal-1": {
						type: "ct-rich-text",
						properties: {
							richtext: {
									type: "doc",
									content: [
										{
											type: "paragraph",
											content: [
												{
													type: "text",
													text: "October Run Streak: ",
													marks: [{ type: "bold" }],
												},
												{
													type: "text",
													text: "Run at least 1 mile every day this month. Progress: 65%",
												},
											],
										},
									],
								},
						},
					},
					"ele-chal-2": {
						type: "ct-rich-text",
						properties: {
							richtext: {
									type: "doc",
									content: [
										{
											type: "paragraph",
											content: [
												{
													type: "text",
													text: "100 Mile Challenge: ",
													marks: [{ type: "bold" }],
												},
												{
													type: "text",
													text: "Complete 100 miles in 30 days. Progress: 42%",
												},
											],
										},
									],
								},
						},
					},
					"ele-chal-3": {
						type: "ct-rich-text",
						properties: {
							richtext: {
									type: "doc",
									content: [
										{
											type: "paragraph",
											content: [
												{
													type: "text",
													text: "Weekend Warrior: ",
													marks: [{ type: "bold" }],
												},
												{
													type: "text",
													text: "Double your weekend mileage. Progress: 0%",
												},
											],
										},
									],
								},
						},
					},
					"ele-landing-pricing-heading": {
						type: "ct-heading",
						properties: {
							text: "Choose your plan",
						},
					},
					"ele-landing-pricing-sub": {
						type: "ct-text",
						properties: {
							text: "Select the perfect plan for your fitness journey. Upgrade or downgrade anytime.",
						},
					},
					"ele-price-1": {
						type: "ct-product",
						properties: {
							name: "Free",
							price: "$0/mo",
							description: "Basic activity tracking, Community access, 5 challenges per month.",
						},
					},
					"ele-price-2": {
						type: "ct-product",
						properties: {
							name: "Pro",
							price: "$9.99/mo",
							description: "Everything in Free, Unlimited challenges, Advanced analytics, Heart rate monitoring.",
						},
					},
					"ele-price-3": {
						type: "ct-product",
						properties: {
							name: "Team",
							price: "$24.99/mo",
							description: "Everything in Pro, Up to 10 team members, Team challenges, Admin dashboard.",
						},
					},
					"ele-landing-stories-heading": {
						type: "ct-heading",
						properties: {
							text: "Real results from real people",
						},
					},
					"ele-landing-stories-sub": {
						type: "ct-text",
						properties: {
							text: "See how STRIDE has transformed the fitness journeys of our amazing community members.",
						},
					},
					"ele-story-1": {
						type: "ct-rich-text",
						properties: {
							richtext: {
									type: "doc",
									content: [
										{
											type: "paragraph",
											content: [
												{
													type: "text",
													text: "Jessica T.: ",
													marks: [{ type: "bold" }],
												},
												{
													type: "text",
													text: "STRIDE helped me train for my first marathon. The personalized plans kept me motivated!",
												},
											],
										},
									],
								},
						},
					},
					"ele-story-2": {
						type: "ct-rich-text",
						properties: {
							richtext: {
									type: "doc",
									content: [
										{
											type: "paragraph",
											content: [
												{
													type: "text",
													text: "Marcus R.: ",
													marks: [{ type: "bold" }],
												},
												{
													type: "text",
													text: "The analytics features are incredible. Being able to track my performance has helped me identify areas for improvement.",
												},
											],
										},
									],
								},
						},
					},
					"ele-story-3": {
						type: "ct-rich-text",
						properties: {
							richtext: {
									type: "doc",
									content: [
										{
											type: "paragraph",
											content: [
												{
													type: "text",
													text: "Amanda K.: ",
													marks: [{ type: "bold" }],
												},
												{
													type: "text",
													text: "I love the social aspect of STRIDE. Connecting with other fitness enthusiasts has completely transformed my workout routine.",
												},
											],
										},
									],
								},
						},
					},
					"ele-landing-footer-cta-heading": {
						type: "ct-heading",
						properties: {
							text: "Join over 2 million users achieving their goals",
						},
					},
					"ele-landing-footer-cta-sub": {
						type: "ct-text",
						properties: {
							text: "Start your fitness journey today and become part of our success stories.",
						},
					},
					"ele-landing-footer-cta-stats": {
						type: "ct-text",
						properties: {
							text: "4.9/5 App Store Rating | 50K+ 5-Star Reviews | 2M+ Active Users",
						},
					},
				},
			},

			{
				id: "ol-landing-aside",
				title: "Aside",
				tree: [
					{
						id: "sec-aside-blog",
						name: "Latest Blog Posts",
						open: true,
						children: [
							{
								id: "row-aside-blog",
								open: true,
								children: [
									{
										id: "col-aside-blog",
										open: true,
										elements: [
											{ id: "ele-aside-blog-heading" },
											{ id: "ele-aside-blog-1" },
											{ id: "ele-aside-blog-2" },
											{ id: "ele-aside-blog-3" },
										],
									},
								],
							},
						],
					},
					{
						id: "sec-aside-signup",
						name: "Join STRIDE Today",
						open: true,
						children: [
							{
								id: "row-aside-signup",
								open: true,
								children: [
									{
										id: "col-aside-signup",
										open: true,
										elements: [
											{ id: "ele-aside-signup-heading" },
											{ id: "ele-aside-signup-sub" },
											{ id: "ele-aside-signup-name" },
											{ id: "ele-aside-signup-email" },
											{ id: "ele-aside-signup-pass" },
											{ id: "ele-aside-signup-btn" },
											{ id: "ele-aside-signup-footer" },
										],
									},
								],
							},
						],
					},
				],
				elements: {
					"ele-aside-blog-heading": {
						type: "ct-heading",
						properties: {
							text: "Latest Blog Posts",
						},
					},
					"ele-aside-blog-1": {
						type: "ct-text",
						properties: {
							text: "10 Tips For Your First Marathon (2 days ago)",
						},
					},
					"ele-aside-blog-2": {
						type: "ct-text",
						properties: {
							text: "Cycling Workouts for Beginners (5 days ago)",
						},
					},
					"ele-aside-blog-3": {
						type: "ct-text",
						properties: {
							text: "The Science of Running Form (1 week ago)",
						},
					},
					"ele-aside-signup-heading": {
						type: "ct-heading",
						properties: {
							text: "Join STRIDE Today",
						},
					},
					"ele-aside-signup-sub": {
						type: "ct-text",
						properties: {
							text: "Start your fitness journey with our community",
						},
					},
					"ele-aside-signup-name": {
						type: "ct-input",
						properties: {
							placeholder: "Full Name",
						},
					},
					"ele-aside-signup-email": {
						type: "ct-input",
						properties: {
							placeholder: "Email Address",
						},
					},
					"ele-aside-signup-pass": {
						type: "ct-input",
						properties: {
							placeholder: "Password",
						},
					},
					"ele-aside-signup-btn": {
						type: "ct-button",
						properties: {
							label: "Create Account",
						},
					},
					"ele-aside-signup-footer": {
						type: "ct-text",
						properties: {
							text: "By signing up, you agree to our Terms of Service and Privacy Policy",
						},
					},
				},
			},
		],
	},
	{
		id: "page-site-blog-post-1",
		name: "5 Tips for Your First Marathon",
		parentId: "page-site-blog",
		status: "Published",
		lastModified: "2026-04-12",
		contentTypeId: "ct-blog-post",
		slug: "5-tips-for-your-first-marathon",
		data: {
			title: "5 Tips for Your First Marathon with Stride",
			subtitle: "Build confidence, stay consistent, and make race day feel familiar.",
			category: "Training",
			heroLogo: "/boston-marathon-logo.png",
			readingTime: "8 min read",
			publishDate: "Apr 12, 2026",
			featuredImage: "/cmp/assets/recommendation/panel-01-image.jpg",
			body: `<p>Training for 26.2 miles starts with a single step — and a plan you can actually stick to. Whether you're lacing up your Stride Pros for the first time or graduating from 10Ks, these five tips will help you build fitness without burning out.</p>
<h2>1) Keep the easy runs easy</h2>
<p>Your easy pace should feel conversational. That's where most of your aerobic gains come from. The Stride Pro's cushioned midsole is built for exactly this — absorbing miles without breaking you down.</p>
<h2>2) Long runs are practice, not a test</h2>
<p>Focus on time-on-feet and fueling. Don't race your long run. Use it to rehearse your race-day nutrition and hydration strategy.</p>
<h2>3) Fuel early and often</h2>
<ul>
  <li><p>Start fueling around 30–45 minutes in</p></li>
  <li><p>Aim for 30–60g of carbs per hour</p></li>
  <li><p>Practice with the same gels and drinks you'll use on race day</p></li>
</ul>
<h2>4) Don't skip recovery</h2>
<p>Sleep, easy days, and lower-intensity weeks are part of the training. Your body adapts during rest, not during the run. Stride's recovery line is designed to support this phase.</p>
<h2>5) Rehearse race day</h2>
<p>Try your breakfast, gels, shoes, and outfit on a long run so there are no surprises. If you're running a Stride event, check in early and walk the start area the day before.</p>`,
			author: { name: "Rachel Voss", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face" },
			ctaHeading: "Ready to compete?",
			ctaPrimaryText: "GET STARTED",
			ctaPrimaryLink: "/registration",
			ctaSecondaryText: "REQUEST A DEMO",
			ctaSecondaryLink: "/demo",
		},
	},
	{
		id: "page-site-blog-post-2",
		name: "Interval Training with Stride",
		parentId: "page-site-blog",
		status: "Published",
		lastModified: "2026-04-18",
		contentTypeId: "ct-blog-post",
		slug: "interval-training-with-stride",
		data: {
			title: "Speed Sessions: A Runner's Guide to Intervals",
			subtitle: "How to add speedwork to your training without burning out.",
			category: "Performance",
			readingTime: "6 min read",
			publishDate: "Apr 18, 2026",
			featuredImage: "/cmp/assets/recommendation/panel-06-image.jpg",
			body: `<p>Intervals don't have to be scary. Think of them as controlled effort followed by recovery, repeated a few times. The goal is better form, efficiency, and confidence — not exhaustion.</p>
<h2>A starter workout</h2>
<ul>
  <li><p><strong>Warm up:</strong> 10 minutes easy + 3 short strides</p></li>
  <li><p><strong>Main set:</strong> 6 × (1 min steady-hard, 2 min easy)</p></li>
  <li><p><strong>Cool down:</strong> 10 minutes easy</p></li>
</ul>
<p>During the hard minute, aim for "comfortably hard" — you should finish feeling like you could do one more rep. The Stride Racer's responsive plate gives you that extra snap without the crash.</p>
<h2>When to level up</h2>
<p>Once 1-minute reps feel manageable, try 2–3 minute reps at a slightly slower pace. The key is progressive overload — small, sustainable jumps in volume or intensity.</p>
<h2>Common mistakes</h2>
<ul>
  <li><p>Starting too fast on rep 1</p></li>
  <li><p>Skipping the warm-up</p></li>
  <li><p>Doing intervals on tired legs every week</p></li>
</ul>
<p>One interval session per week is plenty for most runners. Quality over quantity — always.</p>`,
			author: { name: "Todd Slayton", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face" },
			ctaHeading: "Find your next event",
			ctaPrimaryText: "VIEW EVENTS",
			ctaPrimaryLink: "/events",
			ctaSecondaryText: "JOIN THE COMMUNITY",
			ctaSecondaryLink: "/community",
		},
	},
	{
		id: "page-site-blog-post-3",
		name: "Race Day Checklist",
		parentId: "page-site-blog",
		status: "Published",
		lastModified: "2026-05-02",
		contentTypeId: "ct-blog-post",
		slug: "race-day-checklist",
		data: {
			title: "The Stride Race Day Checklist",
			subtitle: "Remove the stress by planning the small stuff ahead of time.",
			category: "Race Day",
			readingTime: "5 min read",
			publishDate: "May 2, 2026",
			featuredImage: "/cmp/assets/recommendation/panel-05-image.jpg",
			body: `<p>Race mornings get chaotic fast. The best way to stay calm is to remove decisions and make the day feel like a routine workout. Here's the checklist our Stride athletes swear by.</p>
<h2>The night before</h2>
<ul>
  <li><p>Lay out your kit — Stride shoes, socks, top, shorts or tights</p></li>
  <li><p>Pin your bib and attach your timing chip</p></li>
  <li><p>Charge your watch and phone</p></li>
  <li><p>Plan breakfast + pack a backup snack</p></li>
  <li><p>Check the weather and adjust layers accordingly</p></li>
</ul>
<h2>Race morning</h2>
<ul>
  <li><p>Arrive early and find toilets first</p></li>
  <li><p>Do 5–10 minutes easy jogging + a few strides</p></li>
  <li><p>Start conservatively for the first 5–10 minutes</p></li>
  <li><p>Smile at the crowd — they're there for you</p></li>
</ul>
<blockquote><p><strong>Pro tip:</strong> Write your plan (pace + fueling) on your wrist or a card in your pocket. When nerves spike, you'll follow the plan instead of the adrenaline.</p></blockquote>`,
			author: { name: "Rachel Voss", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face" },
			ctaHeading: "Ready to compete?",
			ctaPrimaryText: "GET STARTED",
			ctaPrimaryLink: "/registration",
			ctaSecondaryText: "REQUEST A DEMO",
			ctaSecondaryLink: "/demo",
		},
	},
	{
		id: "page-site-blog-post-4",
		name: "How to Choose Running Shoes",
		parentId: "page-site-blog",
		status: "Published",
		lastModified: "2026-05-10",
		contentTypeId: "ct-blog-post",
		slug: "how-to-choose-running-shoes",
		data: {
			title: "Finding Your Perfect Stride: A Shoe Guide",
			subtitle: "Comfort first, then match the shoe to your training.",
			category: "Gear",
			readingTime: "7 min read",
			publishDate: "May 10, 2026",
			featuredImage: "/cmp/assets/recommendation/panel-08-image.jpg",
			body: `<p>The "best" shoe is the one that fits your foot and your running. Start with comfort and stability, then refine based on your training goals. Here's how the Stride lineup breaks down.</p>
<h2>Fit comes first</h2>
<p>Look for a secure heel, a roomy toe box, and no hot spots. Your toes should be able to wiggle, and the shoe shouldn't slip when you walk or jog. Every Stride shoe is designed with an anatomical last that mirrors the natural foot shape.</p>
<h2>Match the shoe to the session</h2>
<ul>
  <li><p><strong>Stride Pro:</strong> daily trainer — comfortable, durable, forgiving. Built for the miles that matter most.</p></li>
  <li><p><strong>Stride Racer:</strong> workout shoe — lighter, snappier, carbon plate for race-day performance.</p></li>
  <li><p><strong>Stride Trail:</strong> trail shoe — aggressive grip, rock plate protection, stable platform for technical terrain.</p></li>
</ul>
<h2>Don't overthink pronation labels</h2>
<p>Unless you have a specific injury history, prioritize what feels natural and stable. Visit a Stride retail partner for a free gait analysis, or test-run them at any Stride event expo.</p>`,
			author: { name: "Todd Slayton", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face" },
			ctaHeading: "Find your fit",
			ctaPrimaryText: "SHOP STRIDE",
			ctaPrimaryLink: "/shop",
			ctaSecondaryText: "FIND A STORE",
			ctaSecondaryLink: "/stores",
		},
	},

	{
		id: "page-site-marathon-2027",
		name: "Boston Marathon 2027",
		parentId: "page-site-home",
		status: "Published",
		lastModified: "2026-05-29",
		contentTypeId: "exp-event-page",
		slug: "boston-marathon-2027",
		data: {},
		variations: [
			{
				id: "original",
				name: "Original",
				status: "Published",
				outlines: [MARATHON_EVENT_OUTLINE],
			},
		],
	},

	{
		id: "page-site-events",
		name: "Events",
		parentId: "page-site-home",
		status: "Published",
		lastModified: "2024-01-15",
		contentTypeId: "ct-event-listing",
		slug: "events",
		data: {
			title: "Upcoming Events",
			subtitle: "Join us for training sessions, races, and community gatherings",
			seo: {
				en: {
					original: {
						title: "Events | Stride",
						description: "Discover upcoming Stride events, training sessions, and races.",
						canonicalUrl: "https://stride.com/events",
						robots: "index,follow",
					},
				},
			},
		},
	},

	{
		id: "page-site-event-1",
		name: "Spring Marathon Training Kickoff",
		parentId: "page-site-events",
		status: "Published",
		lastModified: "2024-01-15",
		contentTypeId: "ct-event",
		slug: "spring-marathon-training-kickoff",
		data: {
			title: "Spring Marathon Training Kickoff",
			subtitle: "Start your marathon journey with expert coaching",
			description: `<h2>About This Event</h2>
<p>Join us for the official kickoff of our Spring Marathon Training program. Whether you're targeting your first marathon or aiming for a new personal best, this 16-week structured program will get you to the finish line strong.</p>
<h2>What to Expect</h2>
<ul>
  <li><p>Expert coaching from certified running coaches</p></li>
  <li><p>Personalized training plans for all levels</p></li>
  <li><p>Weekly group runs and track workouts</p></li>
  <li><p>Nutrition and injury prevention workshops</p></li>
</ul>
<h2>Schedule</h2>
<p>Program runs for 16 weeks from February through May, culminating in the City Spring Marathon.</p>`,
			startDate: "2024-02-10T09:00:00Z",
			endDate: "2024-02-10T11:00:00Z",
			timezone: "PST",
			locationType: "in-person",
			venueName: "Stride Running Club",
			address: "123 Runner's Lane",
			city: "Portland",
			state: "OR",
			country: "USA",
			virtualLink: "",
			capacity: 50,
			registrationUrl: "https://stride.com/events/spring-marathon-training/register",
			registrationDeadline: "2024-02-05T23:59:59Z",
			price: "$199",
			organizer: "1",
		},
	},

	{
		id: "page-site-event-2",
		name: "Virtual 5K Challenge",
		parentId: "page-site-events",
		status: "Published",
		lastModified: "2024-01-16",
		contentTypeId: "ct-event",
		slug: "virtual-5k-challenge",
		data: {
			title: "Virtual 5K Challenge",
			subtitle: "Run anywhere, compete with everyone",
			description: `<h2>About This Event</h2>
<p>Our monthly Virtual 5K Challenge lets you compete from anywhere in the world. Run on your schedule, submit your time, and see how you stack up against the Stride community.</p>
<h2>How It Works</h2>
<ul>
  <li><p>Register and receive your digital race bib</p></li>
  <li><p>Complete your 5K run anytime between Feb 1-28</p></li>
  <li><p>Submit your verified time through the Stride app</p></li>
  <li><p>View leaderboards and celebrate with the community</p></li>
</ul>
<h2>Prizes</h2>
<p>Top 3 finishers in each age group receive Stride gear and premium app features.</p>`,
			startDate: "2024-02-01T00:00:00Z",
			endDate: "2024-02-28T23:59:59Z",
			timezone: "UTC",
			locationType: "virtual",
			venueName: "",
			address: "",
			city: "",
			state: "",
			country: "",
			virtualLink: "https://stride.com/events/virtual-5k",
			capacity: 1000,
			registrationUrl: "https://stride.com/events/virtual-5k/register",
			registrationDeadline: "2024-02-27T23:59:59Z",
			price: "Free",
			organizer: "1",
		},
	},

	{
		id: "page-site-event-3",
		name: "Trail Running Workshop",
		parentId: "page-site-events",
		status: "Published",
		lastModified: "2024-01-17",
		contentTypeId: "ct-event",
		slug: "trail-running-workshop",
		data: {
			title: "Trail Running Workshop",
			subtitle: "Master the techniques for off-road running",
			description: `<h2>About This Event</h2>
<p>Take your running off-road with confidence. This hands-on workshop covers everything from proper trail running form to navigation and safety essentials.</p>
<h2>Topics Covered</h2>
<ul>
  <li><p>Trail running technique and form</p></li>
  <li><p>Uphill and downhill strategies</p></li>
  <li><p>Gear selection and must-haves</p></li>
  <li><p>Navigation basics and trail safety</p></li>
  <li><p>Leave No Trace principles</p></li>
</ul>
<h2>What to Bring</h2>
<p>Trail running shoes, water bottle, weather-appropriate clothing, and an adventurous spirit!</p>`,
			startDate: "2024-03-15T08:00:00Z",
			endDate: "2024-03-15T12:00:00Z",
			timezone: "PST",
			locationType: "in-person",
			venueName: "Forest Park Trailhead",
			address: "NW Thurman St & NW Aspen Ave",
			city: "Portland",
			state: "OR",
			country: "USA",
			virtualLink: "",
			capacity: 25,
			registrationUrl: "https://stride.com/events/trail-workshop/register",
			registrationDeadline: "2024-03-10T23:59:59Z",
			price: "$75",
			organizer: "1",
		},
	},

	{
		id: "page-activities",
		contentTypeId: "exp-landing-page",
		displayTemplateKey: "defaultExperience",
		displaySettings: [
			{ key: "backgroundColor", value: "light-blue" },
			{ key: "spacing", value: "compact" }
		],
		name: "Activities",
		slug: "activities",
		parentId: null,
		status: "Published",
		lastModified: "2023-12-18",
		data: {},
		outlines: [
			{
				id: "ol-activities-main",
				title: "Main",
				tree: [
					{
						id: "sec-activities-hero",
						name: "Hero",
						open: true,
						children: [
							{
								id: "row-activities-hero",
								open: true,
								children: [
									{
										id: "col-activities-hero",
										open: true,
										elements: [
											{ id: "ele-activities-hero-badge" },
											{ id: "ele-activities-hero-heading" },
											{ id: "ele-activities-hero-sub" },
											{ id: "ele-activities-hero-cta" },
										],
									},
								],
							},
						],
					},
					{
						id: "sec-activities-stats",
						name: "Stats",
						open: true,
						children: [
							{
								id: "row-activities-stats",
								open: true,
								children: [
									{
										id: "col-activities-stats-1",
										open: true,
										elements: [{ id: "ele-activities-stat-1" }],
									},
									{
										id: "col-activities-stats-2",
										open: true,
										elements: [{ id: "ele-activities-stat-2" }],
									},
									{
										id: "col-activities-stats-3",
										open: true,
										elements: [{ id: "ele-activities-stat-3" }],
									},
								],
							},
						],
					},
				],
				elements: {
					"ele-activities-hero-badge": {
						type: "ct-text",
						properties: {
							text: "Join 2M+ active users worldwide",
						},
					},
					"ele-activities-hero-heading": {
						type: "ct-heading",
						properties: {
							text: "Ready. Set. Go.",
						},
					},
					"ele-activities-hero-sub": {
						type: "ct-text",
						properties: {
							text: "Join thousands of runners in the most iconic triathlon of the year. Challenge yourself and cross the finish line!",
						},
					},
					"ele-activities-hero-cta": {
						type: "ct-button",
						properties: {
							label: "Register for your bib",
						},
					},
					"ele-activities-stat-1": {
						type: "ct-heading",
						properties: {
							text: "500K+ Annual participants",
						},
					},
					"ele-activities-stat-2": {
						type: "ct-heading",
						properties: {
							text: "45+ Countries represented",
						},
					},
					"ele-activities-stat-3": {
						type: "ct-heading",
						properties: {
							text: "4.9/5 Average rating",
						},
					},
				},
			},
		],
	},

	{
		id: "page-community",
		contentTypeId: "exp-landing-page",
		displayTemplateKey: "defaultExperience",
		displaySettings: [
			{ key: "backgroundColor", value: "light-blue" },
			{ key: "spacing", value: "compact" }
		],
		name: "Community",
		slug: "community",
		parentId: null,
		status: "Published",
		lastModified: "2023-12-18",
		data: {},
		outlines: [
			{
				id: "ol-community-main",
				title: "Main",
				tree: [
					{
						id: "sec-community-hero",
						name: "Hero",
						open: true,
						children: [
							{
								id: "row-community-hero",
								open: true,
								children: [
									{
										id: "col-community-hero",
										open: true,
										elements: [
											{ id: "ele-community-hero-heading" },
											{ id: "ele-community-hero-sub" },
										],
									},
								],
							},
						],
					},
					{
						id: "sec-community-testimonials",
						name: "Testimonials",
						open: true,
						children: [
							{
								id: "row-community-testimonials",
								open: true,
								children: [
									{
										id: "col-community-test-1",
										open: true,
										elements: [{ id: "ele-community-test-1" }],
									},
									{
										id: "col-community-test-2",
										open: true,
										elements: [{ id: "ele-community-test-2" }],
									},
								],
							},
						],
					},
				],
				elements: {
					"ele-community-hero-heading": {
						type: "ct-heading",
						properties: {
							text: "Join millions of active users",
						},
					},
					"ele-community-hero-sub": {
						type: "ct-text",
						properties: {
							text: "Connect, compete, and get motivated by our global community of fitness enthusiasts.",
						},
					},
					"ele-community-test-1": {
						type: "ct-text",
						properties: {
							text: "Sarah M.: Amazing run through Central Park this morning! The GPS tracking was spot-on.",
						},
					},
					"ele-community-test-2": {
						type: "ct-text",
						properties: {
							text: "Mike R.: Crushed my half-marathon goal! The community challenges really pushed me.",
						},
					},
				},
			},
		],
	},

	{
		id: "page-site-challenges",
		contentTypeId: "exp-landing-page",
		displayTemplateKey: "defaultExperience",
		displaySettings: [
			{ key: "backgroundColor", value: "light-blue" },
			{ key: "spacing", value: "compact" }
		],
		name: "Challenges",
		slug: "challenges",
		parentId: "page-site-home",
		status: "Published",
		lastModified: "2026-05-28",
		data: {},
		variations: [
			{
				id: "original",
				name: "Original",
				status: "Published",
				outlines: [
					{
						id: "ol-challenges-main",
						title: "Main",
						tree: [
							{
								id: "sec-challenges-hero",
								name: "Hero",
								type: "ct-section",
								open: true,
								noPadding: true,
								children: [
									{
										id: "row-challenges-hero",
										open: true,
										children: [
											{
												id: "col-challenges-hero-content",
												open: true,
												elements: [{ id: "ele-challenges-hero" }],
											},
										],
									},
								],
							},
							{
								id: "sec-challenges-calendar",
								name: "Curated Race Calendar",
								type: "ct-section",
								open: true,
								displayTemplateKey: "defaultSection",
								displaySettings: [{ key: "spacing", value: "compact" }],
								children: [{ id: "row-challenges-calendar", open: true, children: [{ id: "col-challenges-calendar", open: true, elements: [{ id: "ele-cal-heading" }, { id: "ele-cal-body" }] }] }],
							},
							{
								id: "sec-challenges-leaderboards",
								name: "Live Leaderboards",
								type: "ct-section",
								open: true,
								displayTemplateKey: "defaultSection",
								displaySettings: [{ key: "spacing", value: "compact" }],
								children: [{ id: "row-challenges-leaderboards", open: true, children: [{ id: "col-challenges-leaderboards", open: true, elements: [{ id: "ele-lb-heading" }, { id: "ele-lb-body" }] }] }],
							},
							{
								id: "sec-challenges-celebrations",
								name: "Automated Celebrations",
								type: "ct-section",
								open: true,
								displayTemplateKey: "defaultSection",
								displaySettings: [{ key: "spacing", value: "compact" }],
								children: [{ id: "row-challenges-celebrations", open: true, children: [{ id: "col-challenges-celebrations", open: true, elements: [{ id: "ele-cel-heading" }, { id: "ele-cel-body" }] }] }],
							},
							{
								id: "sec-challenges-cards",
								name: "Cards",
								type: "ct-section",
								open: true,
								displayTemplateKey: "defaultSection",
								displaySettings: [{ key: "spacing", value: "compact" }],
								children: [{ id: "row-challenges-cards", open: true, children: [
									{ id: "col-ch-join-card", open: true, elements: [{ id: "ele-ch-join-card" }] },
									{ id: "col-ch-coach-card", open: true, elements: [{ id: "ele-ch-coach-card" }] },
								] }],
							},
						],
						elements: {
							"ele-challenges-hero": {
								type: "ct-hero",
								properties: {
									badge: "STRIDE CHALLENGES",
									heading: "Challenges that keep every squad honest",
									subheading: "Spin up time-boxed efforts, layer in stretch goals, and broadcast wins the moment they happen.",
									backgroundImage: "/sports-2.jpg",
									showAppMockup: "false",
									displayTemplateKey: "centeredHero",
									displaySettings: [{ key: "layout", value: "centered" }],
								},
							},
							"ele-cal-heading": { type: "ct-heading", properties: { text: "Curated race calendar", level: "h2" } },
							"ele-cal-body": { type: "ct-text", properties: { text: "Choose from community templates or build your own ladder. Mix endurance, skills, or wellness streaks so every athlete has a reason to log in.", displayTemplateKey: "defaultText", displaySettings: [{ key: "size", value: "default" }] } },
							"ele-lb-heading": { type: "ct-heading", properties: { text: "Live leaderboards everywhere", level: "h2" } },
							"ele-lb-body": { type: "ct-text", properties: { text: "Embed standings inside chats, dashboards, and announcements. Everyone knows who is leading without refreshing a spreadsheet.", displayTemplateKey: "defaultText", displaySettings: [{ key: "size", value: "default" }] } },
							"ele-cel-heading": { type: "ct-heading", properties: { text: "Automated celebrations", level: "h2" } },
							"ele-cel-body": { type: "ct-text", properties: { text: "Trigger highlight reels, reward codes, or coach shout-outs when milestones hit. Keep the hype high while the platform handles delivery.", displayTemplateKey: "defaultText", displaySettings: [{ key: "size", value: "default" }] } },
							"ele-ch-join-card": { type: "ct-card", properties: { backgroundImage: "/features-card-1.jpg", label: "Join the Community", description: "Ride with thousands of others.", displaySettings: [{ key: "style", value: "simple" }] } },
							"ele-ch-coach-card": { type: "ct-card", properties: { backgroundImage: "/features-card-2.jpg", label: "Find a Coach", description: "Get a personalized training plan.", displaySettings: [{ key: "style", value: "simple" }] } },
						},
					},
					{
						id: "ol-challenges-sidebar",
						title: "Sidebar",
						tree: [
							{ id: "sec-ch-sidebar-events", name: "Events", open: true, children: [{ id: "row-ch-sidebar-events", open: true, children: [{ id: "col-ch-events", open: true, elements: [{ id: "ele-ch-events-label" }, { id: "ele-ch-event-1" }, { id: "ele-ch-event-2" }] }] }] },
							{ id: "sec-ch-sidebar-news", name: "News", open: true, children: [{ id: "row-ch-sidebar-news", open: true, children: [{ id: "col-ch-news", open: true, elements: [{ id: "ele-ch-news-label" }, { id: "ele-ch-news-1" }, { id: "ele-ch-news-2" }, { id: "ele-ch-news-btn" }] }] }] },
						],
						elements: {
							"ele-ch-events-label": { type: "ct-text", properties: { text: "EVENTS", displayTemplateKey: "accentText", displaySettings: [{ key: "color", value: "blue" }] } },
							"ele-ch-event-1": { type: "ct-sidebar-item", properties: { title: "Global Running Summit 2026", description: "Join us for a day of keynotes and workshops on the future of endurance sports and wearable technology." } },
							"ele-ch-event-2": { type: "ct-sidebar-item", properties: { title: "Stride Community Marathon", description: "Connect with other Stride athletes, break your personal bests, and celebrate with the community." } },
							"ele-ch-news-label": { type: "ct-text", properties: { text: "NEWS", displayTemplateKey: "accentText", displaySettings: [{ key: "color", value: "blue" }] } },
							"ele-ch-news-1": { type: "ct-sidebar-item", properties: { title: "Stride raises Series B to expand global fitness community", description: "We are thrilled to announce our latest funding round led by top-tier investors to accelerate our mission of making the world move more." } },
							"ele-ch-news-2": { type: "ct-sidebar-item", properties: { title: "Introducing Stride Stats 2.0 with AI coaching", description: "Our biggest update yet includes automated form analysis, recovery recommendations, and predictive race pacing." } },
							"ele-ch-news-btn": { type: "ct-button", properties: { label: "ALL NEWS & EVENTS", displayTemplateKey: "secondaryButton" } },
						},
					},
				],
			},
		],
	},

	{
		id: "page-site-subscriptions",
		contentTypeId: "exp-landing-page",
		displayTemplateKey: "defaultExperience",
		displaySettings: [
			{ key: "backgroundColor", value: "light-blue" },
			{ key: "spacing", value: "compact" }
		],
		name: "Subscriptions",
		slug: "subscriptions",
		parentId: "page-site-home",
		status: "Published",
		lastModified: "2026-05-28",
		data: {},
		variations: [
			{
				id: "original",
				name: "Original",
				status: "Published",
				outlines: [
					{
						id: "ol-subs-main",
						title: "Main",
						tree: [
							{
								id: "sec-subs-hero",
								name: "Hero",
								type: "ct-section",
								open: true,
								noPadding: true,
								children: [{ id: "row-subs-hero", open: true, children: [{ id: "col-subs-hero-content", open: true, elements: [{ id: "ele-subs-hero" }] }] }],
							},
							{
								id: "sec-subs-packaging",
								name: "Flexible Packaging",
								type: "ct-section",
								open: true,
								displayTemplateKey: "defaultSection",
								displaySettings: [{ key: "spacing", value: "compact" }],
								children: [{ id: "row-subs-packaging", open: true, children: [{ id: "col-subs-packaging", open: true, elements: [{ id: "ele-pkg-heading" }, { id: "ele-pkg-body" }] }] }],
							},
							{
								id: "sec-subs-billing",
								name: "Billing",
								type: "ct-section",
								open: true,
								displayTemplateKey: "defaultSection",
								displaySettings: [{ key: "spacing", value: "compact" }],
								children: [{ id: "row-subs-billing", open: true, children: [{ id: "col-subs-billing", open: true, elements: [{ id: "ele-bil-heading" }, { id: "ele-bil-body" }] }] }],
							},
							{
								id: "sec-subs-perks",
								name: "Perks",
								type: "ct-section",
								open: true,
								displayTemplateKey: "defaultSection",
								displaySettings: [{ key: "spacing", value: "compact" }],
								children: [{ id: "row-subs-perks", open: true, children: [{ id: "col-subs-perks", open: true, elements: [{ id: "ele-prk-heading" }, { id: "ele-prk-body" }] }] }],
							},
							{
								id: "sec-subs-cards",
								name: "Cards",
								type: "ct-section",
								open: true,
								displayTemplateKey: "defaultSection",
								displaySettings: [{ key: "spacing", value: "compact" }],
								children: [{ id: "row-subs-cards", open: true, children: [
									{ id: "col-sub-join-card", open: true, elements: [{ id: "ele-sub-join-card" }] },
									{ id: "col-sub-coach-card", open: true, elements: [{ id: "ele-sub-coach-card" }] },
								] }],
							},
						],
						elements: {
							"ele-subs-hero": {
								type: "ct-hero",
								properties: {
									badge: "STRIDE SUBSCRIPTIONS",
									heading: "Subscriptions that scale with every crew",
									subheading: "Bundle coaching time, premium perks, and merch drops into flexible tiers—billing runs itself while you stay focused on athletes.",
									backgroundImage: "/sports-3.jpg",
									showAppMockup: "false",
									displayTemplateKey: "centeredHero",
									displaySettings: [{ key: "layout", value: "centered" }],
								},
							},
							"ele-pkg-heading": { type: "ct-heading", properties: { text: "Flexible packaging", level: "h2" } },
							"ele-pkg-body": { type: "ct-text", properties: { text: "Create recurring bundles for youth squads, elite crews, or remote communities. Add drop-in passes or VIP perks without rebuilding your stack.", displayTemplateKey: "defaultText", displaySettings: [{ key: "size", value: "default" }] } },
							"ele-bil-heading": { type: "ct-heading", properties: { text: "Billing that looks after itself", level: "h2" } },
							"ele-bil-body": { type: "ct-text", properties: { text: "Automated renewals, proration, and dunning flows keep revenue steady. Coaches get alerts only when a human touch is needed.", displayTemplateKey: "defaultText", displaySettings: [{ key: "size", value: "default" }] } },
							"ele-prk-heading": { type: "ct-heading", properties: { text: "Perks tied to engagement", level: "h2" } },
							"ele-prk-body": { type: "ct-text", properties: { text: "Unlock merch, travel credits, or bonus sessions when members hit streaks. Rewards sync straight to the app so fulfillment is instant.", displayTemplateKey: "defaultText", displaySettings: [{ key: "size", value: "default" }] } },
							"ele-sub-join-card": { type: "ct-card", properties: { backgroundImage: "/features-card-1.jpg", label: "Join the Community", description: "Ride with thousands of others.", displaySettings: [{ key: "style", value: "simple" }] } },
							"ele-sub-coach-card": { type: "ct-card", properties: { backgroundImage: "/features-card-2.jpg", label: "Find a Coach", description: "Get a personalized training plan.", displaySettings: [{ key: "style", value: "simple" }] } },
						},
					},
					{
						id: "ol-subs-sidebar",
						title: "Sidebar",
						tree: [
							{ id: "sec-sub-sidebar-events", name: "Events", open: true, children: [{ id: "row-sub-sidebar-events", open: true, children: [{ id: "col-sub-events", open: true, elements: [{ id: "ele-sub-events-label" }, { id: "ele-sub-event-1" }, { id: "ele-sub-event-2" }] }] }] },
							{ id: "sec-sub-sidebar-news", name: "News", open: true, children: [{ id: "row-sub-sidebar-news", open: true, children: [{ id: "col-sub-news", open: true, elements: [{ id: "ele-sub-news-label" }, { id: "ele-sub-news-1" }, { id: "ele-sub-news-2" }, { id: "ele-sub-news-btn" }] }] }] },
						],
						elements: {
							"ele-sub-events-label": { type: "ct-text", properties: { text: "EVENTS", displayTemplateKey: "accentText", displaySettings: [{ key: "color", value: "blue" }] } },
							"ele-sub-event-1": { type: "ct-sidebar-item", properties: { title: "Global Running Summit 2026", description: "Join us for a day of keynotes and workshops on the future of endurance sports and wearable technology." } },
							"ele-sub-event-2": { type: "ct-sidebar-item", properties: { title: "Stride Community Marathon", description: "Connect with other Stride athletes, break your personal bests, and celebrate with the community." } },
							"ele-sub-news-label": { type: "ct-text", properties: { text: "NEWS", displayTemplateKey: "accentText", displaySettings: [{ key: "color", value: "blue" }] } },
							"ele-sub-news-1": { type: "ct-sidebar-item", properties: { title: "Stride raises Series B to expand global fitness community", description: "We are thrilled to announce our latest funding round led by top-tier investors to accelerate our mission of making the world move more." } },
							"ele-sub-news-2": { type: "ct-sidebar-item", properties: { title: "Introducing Stride Stats 2.0 with AI coaching", description: "Our biggest update yet includes automated form analysis, recovery recommendations, and predictive race pacing." } },
							"ele-sub-news-btn": { type: "ct-button", properties: { label: "ALL NEWS & EVENTS", displayTemplateKey: "secondaryButton" } },
						},
					},
				],
			},
		],
	},

	{
		id: "page-pricing",
		contentTypeId: "exp-landing-page",
		displayTemplateKey: "defaultExperience",
		displaySettings: [
			{ key: "backgroundColor", value: "light-blue" },
			{ key: "spacing", value: "compact" }
		],
		name: "Pricing",
		slug: "pricing",
		parentId: null,
		status: "Published",
		lastModified: "2023-12-18",
		data: {},
		outlines: [
			{
				id: "ol-pricing-main",
				title: "Main",
				tree: [
					{
						id: "sec-pricing-hero",
						name: "Hero",
						open: true,
						children: [
							{
								id: "row-pricing-hero",
								open: true,
								children: [
									{
										id: "col-pricing-hero",
										open: true,
										elements: [
											{ id: "ele-pricing-hero-heading" },
											{ id: "ele-pricing-hero-sub" },
										],
									},
								],
							},
						],
					},
					{
						id: "sec-pricing-plans",
						name: "Plans",
						open: true,
						children: [
							{
								id: "row-pricing-plans",
								open: true,
								children: [
									{
										id: "col-plan-free",
										open: true,
										elements: [{ id: "ele-plan-free" }],
									},
									{
										id: "col-plan-pro",
										open: true,
										elements: [{ id: "ele-plan-pro" }],
									},
									{
										id: "col-plan-team",
										open: true,
										elements: [{ id: "ele-plan-team" }],
									},
								],
							},
						],
					},
				],
				elements: {
					"ele-pricing-hero-heading": {
						type: "ct-heading",
						properties: {
							text: "Choose your plan",
						},
					},
					"ele-pricing-hero-sub": {
						type: "ct-text",
						properties: {
							text: "Select the perfect plan for your fitness journey. Upgrade or downgrade anytime.",
						},
					},
					"ele-plan-free": {
						type: "ct-heading",
						properties: {
							text: "Free - $0",
						},
					},
					"ele-plan-pro": {
						type: "ct-heading",
						properties: {
							text: "Pro - $9.99/mo",
						},
					},
					"ele-plan-team": {
						type: "ct-heading",
						properties: {
							text: "Team - $24.99/mo",
						},
					},
				},
			},
		],
	},

	{
		id: "page-stories",
		contentTypeId: "exp-landing-page",
		name: "Stories",
		slug: "stories",
		parentId: null,
		status: "Published",
		lastModified: "2023-12-18",
		data: {},
		outlines: [
			{
				id: "ol-stories-main",
				title: "Main",
				tree: [
					{
						id: "sec-stories-hero",
						name: "Hero",
						open: true,
						children: [
							{
								id: "row-stories-hero",
								open: true,
								children: [
									{
										id: "col-stories-hero",
										open: true,
										elements: [
											{ id: "ele-stories-hero-heading" },
											{ id: "ele-stories-hero-sub" },
										],
									},
								],
							},
						],
					},
					{
						id: "sec-stories-list",
						name: "Success Stories",
						open: true,
						children: [
							{
								id: "row-stories-list",
								open: true,
								children: [
									{
										id: "col-story-1",
										open: true,
										elements: [{ id: "ele-story-1" }],
									},
									{
										id: "col-story-2",
										open: true,
										elements: [{ id: "ele-story-2" }],
									},
								],
							},
						],
					},
				],
				elements: {
					"ele-stories-hero-heading": {
						type: "ct-heading",
						properties: {
							text: "Real results from real people",
						},
					},
					"ele-stories-hero-sub": {
						type: "ct-text",
						properties: {
							text: "See how STRIDE has transformed the fitness journeys of our amazing community members.",
						},
					},
					"ele-story-1": {
						type: "ct-rich-text",
						properties: {
							richtext: {
									type: "doc",
									content: [
										{
											type: "paragraph",
											content: [
												{
													type: "text",
													text: "Jessica T.: ",
													marks: [{ type: "bold" }],
												},
												{
													type: "text",
													text: "STRIDE helped me train for my first marathon. The personalized plans kept me motivated!",
												},
											],
										},
									],
								},
						},
					},
					"ele-story-2": {
						type: "ct-rich-text",
						properties: {
							richtext: {
									type: "doc",
									content: [
										{
											type: "paragraph",
											content: [
												{
													type: "text",
													text: "Marcus R.: ",
													marks: [{ type: "bold" }],
												},
												{
													type: "text",
													text: "The analytics features are incredible. Being able to track my performance across swimming, cycling, and running has helped me identify areas for improvement.",
												},
											],
										},
									],
								},
						},
					},
				},
			},
		],
	},

	{
		id: "page-product-31",
		contentTypeId: "exp-landing-page",
		name: "Cycle Computer Pro",
		slug: "products/cycle-computer-pro",
		parentId: "page-site-products",
		status: "Published",
		lastModified: "2023-12-18",
		data: {},
		outlines: [
			{
				id: "ol-prod-31-main",
				title: "Main",
				tree: [
					{
						id: "sec-prod-31-hero",
						name: "Product Hero",
						open: true,
						children: [
							{
								id: "row-prod-31-hero",
								open: true,
								children: [
									{
										id: "col-prod-31-hero",
										open: true,
										elements: [
											{ id: "ele-prod-31-img" },
											{ id: "ele-prod-31-heading" },
											{ id: "ele-prod-31-price" },
											{ id: "ele-prod-31-desc" },
											{ id: "ele-prod-31-buy" },
										],
									},
								],
							},
						],
					},
				],
				elements: {
					"ele-prod-31-img": {
						type: "ct-image-block",
						properties: {
							image: "https://picsum.photos/seed/cycling1/400/300",
						},
					},
					"ele-prod-31-heading": {
						type: "ct-heading",
						properties: {
							text: "Cycle Computer Pro",
						},
					},
					"ele-prod-31-price": {
						type: "ct-heading",
						properties: {
							text: "$199.00",
						},
					},
					"ele-prod-31-desc": {
						type: "ct-text",
						properties: {
							text: "Advanced GPS cycling computer with performance tracking and navigation.",
						},
					},
					"ele-prod-31-buy": {
						type: "ct-button",
						properties: {
							label: "Add to Cart",
						},
					},
				},
			},
		],
	},

	{
		id: "page-product-32",
		contentTypeId: "exp-landing-page",
		name: "HR Monitor Band",
		slug: "products/hr-monitor-band",
		parentId: "page-site-products",
		status: "Published",
		lastModified: "2023-12-18",
		data: {},
		outlines: [
			{
				id: "ol-prod-32-main",
				title: "Main",
				tree: [
					{
						id: "sec-prod-32-hero",
						name: "Product Hero",
						open: true,
						children: [
							{
								id: "row-prod-32-hero",
								open: true,
								children: [
									{
										id: "col-prod-32-hero",
										open: true,
										elements: [
											{ id: "ele-prod-32-img" },
											{ id: "ele-prod-32-heading" },
											{ id: "ele-prod-32-price" },
											{ id: "ele-prod-32-desc" },
											{ id: "ele-prod-32-buy" },
										],
									},
								],
							},
						],
					},
				],
				elements: {
					"ele-prod-32-img": {

						type: "ct-image-block",

						properties: {

							image: "https://picsum.photos/seed/cycling3/400/300",

						},

					},
					"ele-prod-32-heading": {
						type: "ct-heading",
						properties: {
							text: "HR Monitor Band",
						},
					},
					"ele-prod-32-price": {
						type: "ct-heading",
						properties: {
							text: "$79.00",
						},
					},
					"ele-prod-32-desc": {
						type: "ct-text",
						properties: {
							text: "Precision heart rate monitoring for your most intense workouts.",
						},
					},
					"ele-prod-32-buy": {
						type: "ct-button",
						properties: {
							label: "Add to Cart",
						},
					},
				},
			},
		],
	},

	{
		id: "page-product-33",
		contentTypeId: "exp-landing-page",
		name: "Smart Bike Trainer",
		slug: "products/smart-bike-trainer",
		parentId: "page-site-products",
		status: "Published",
		lastModified: "2023-12-18",
		data: {},
		outlines: [
			{
				id: "ol-prod-33-main",
				title: "Main",
				tree: [
					{
						id: "sec-prod-33-hero",
						name: "Product Hero",
						open: true,
						children: [
							{
								id: "row-prod-33-hero",
								open: true,
								children: [
									{
										id: "col-prod-33-hero",
										open: true,
										elements: [
											{ id: "ele-prod-33-img" },
											{ id: "ele-prod-33-heading" },
											{ id: "ele-prod-33-price" },
											{ id: "ele-prod-33-desc" },
											{ id: "ele-prod-33-buy" },
										],
									},
								],
							},
						],
					},
				],
				elements: {
					"ele-prod-33-img": {

						type: "ct-image-block",

						properties: {

							image: "https://picsum.photos/seed/cycling2/400/300",

						},

					},
					"ele-prod-33-heading": {
						type: "ct-heading",
						properties: {
							text: "Smart Bike Trainer",
						},
					},
					"ele-prod-33-price": {
						type: "ct-heading",
						properties: {
							text: "$599.00",
						},
					},
					"ele-prod-33-desc": {
						type: "ct-text",
						properties: {
							text: "Transform your bike into a powerful indoor training machine.",
						},
					},
					"ele-prod-33-buy": {
						type: "ct-button",
						properties: {
							label: "Add to Cart",
						},
					},
				},
			},
		],
	},

	{
		id: "page-product-34",
		contentTypeId: "exp-landing-page",
		name: "Cadence Sensor",
		slug: "products/cadence-sensor",
		parentId: "page-site-products",
		status: "Published",
		lastModified: "2023-12-18",
		data: {},
		outlines: [
			{
				id: "ol-prod-34-main",
				title: "Main",
				tree: [
					{
						id: "sec-prod-34-hero",
						name: "Product Hero",
						open: true,
						children: [
							{
								id: "row-prod-34-hero",
								open: true,
								children: [
									{
										id: "col-prod-34-hero",
										open: true,
										elements: [
											{ id: "ele-prod-34-img" },
											{ id: "ele-prod-34-heading" },
											{ id: "ele-prod-34-price" },
											{ id: "ele-prod-34-desc" },
											{ id: "ele-prod-34-buy" },
										],
									},
								],
							},
						],
					},
				],
				elements: {
					"ele-prod-34-img": {

						type: "ct-image-block",

						properties: {

							image: "https://picsum.photos/seed/cycling4/400/300",

						},

					},
					"ele-prod-34-heading": {
						type: "ct-heading",
						properties: {
							text: "Cadence Sensor",
						},
					},
					"ele-prod-34-price": {
						type: "ct-heading",
						properties: {
							text: "$39.00",
						},
					},
					"ele-prod-34-desc": {
						type: "ct-text",
						properties: {
							text: "Track your pedaling cadence with precision and ease.",
						},
					},
					"ele-prod-34-buy": {
						type: "ct-button",
						properties: {
							label: "Add to Cart",
						},
					},
				},
			},
		],
	},

	{
		id: "page-product-35",
		contentTypeId: "exp-landing-page",
		name: "Power Meter",
		slug: "products/power-meter",
		parentId: "page-site-products",
		status: "Published",
		lastModified: "2023-12-18",
		data: {},
		outlines: [
			{
				id: "ol-prod-35-main",
				title: "Main",
				tree: [
					{
						id: "sec-prod-35-hero",
						name: "Product Hero",
						open: true,
						children: [
							{
								id: "row-prod-35-hero",
								open: true,
								children: [
									{
										id: "col-prod-35-hero",
										open: true,
										elements: [
											{ id: "ele-prod-35-img" },
											{ id: "ele-prod-35-heading" },
											{ id: "ele-prod-35-price" },
											{ id: "ele-prod-35-desc" },
											{ id: "ele-prod-35-buy" },
										],
									},
								],
							},
						],
					},
				],
				elements: {
					"ele-prod-35-img": {

						type: "ct-image-block",

						properties: {

							image: "https://picsum.photos/seed/cycling8/400/300",

						},

					},
					"ele-prod-35-heading": {
						type: "ct-heading",
						properties: {
							text: "Power Meter",
						},
					},
					"ele-prod-35-price": {
						type: "ct-heading",
						properties: {
							text: "$449.00",
						},
					},
					"ele-prod-35-desc": {
						type: "ct-text",
						properties: {
							text: "Measure your power output and optimize your cycling performance.",
						},
					},
					"ele-prod-35-buy": {
						type: "ct-button",
						properties: {
							label: "Add to Cart",
						},
					},
				},
			},
		],
	},

	{
		id: "page-product-36",
		contentTypeId: "exp-landing-page",
		name: "Speed Sensor",
		slug: "products/speed-sensor",
		parentId: "page-site-products",
		status: "Published",
		lastModified: "2023-12-18",
		data: {},
		outlines: [
			{
				id: "ol-prod-36-main",
				title: "Main",
				tree: [
					{
						id: "sec-prod-36-hero",
						name: "Product Hero",
						open: true,
						children: [
							{
								id: "row-prod-36-hero",
								open: true,
								children: [
									{
										id: "col-prod-36-hero",
										open: true,
										elements: [
											{ id: "ele-prod-36-img" },
											{ id: "ele-prod-36-heading" },
											{ id: "ele-prod-36-price" },
											{ id: "ele-prod-36-desc" },
											{ id: "ele-prod-36-buy" },
										],
									},
								],
							},
						],
					},
				],
				elements: {
					"ele-prod-36-img": {

						type: "ct-image-block",

						properties: {

							image: "https://picsum.photos/seed/cycling9/400/300",

						},

					},
					"ele-prod-36-heading": {
						type: "ct-heading",
						properties: {
							text: "Speed Sensor",
						},
					},
					"ele-prod-36-price": {
						type: "ct-heading",
						properties: {
							text: "$39.00",
						},
					},
					"ele-prod-36-desc": {
						type: "ct-text",
						properties: {
							text: "Accurate speed tracking for your outdoor and indoor rides.",
						},
					},
					"ele-prod-36-buy": {
						type: "ct-button",
						properties: {
							label: "Add to Cart",
						},
					},
				},
			},
		],
	},
];

// --- Merged Content Data ---

export type PublishStatus = "Draft" | "Published";

export interface UnifiedContentItem {
	id: string;
	name: string;
	baseType: ContentType["baseType"];
	contentTypeId: string;
	publishStatus: PublishStatus;
	workflowStatus: "draft" | "in-review" | "approved" | "scheduled";
	modifiedBy: string;
	language: string;
	lastModified: string;
	tags: string[];      // array of tag slugs
	categories: string[]; // array of category slugs
	hasConnection?: boolean; // true if page has an active content connection
}

const reportNames = [
	"Alice Johnson",
	"Bob Smith",
	"Carol Williams",
	"David Brown",
	"Maria Garcia",
	"Sarah Chen",
	"Marcus Johnson",
	"Alex Rivera",
	"Emily Brown",
	"James Wilson",
	"Lisa Anderson",
	"David Kim",
	"Michelle Taylor",
	"Robert Garcia",
	"Jessica Moore",
	"Chris Lee",
	"Patricia White",
	"Kevin Davis",
	"Jennifer Martin",
	"Thomas Brown",
	"Steven Clark",
	"Nancy Rodriguez",
	"Daniel Lewis",
];

const getRandomName = (id: string) => {
	const hash = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
	return reportNames[hash % reportNames.length];
};

export const initialOtherContent: UnifiedContentItem[] = [
	{
		id: "3",
		name: "Heart Rate Monitor - Product",
		baseType: "Product",
		contentTypeId: "ct-product",
		publishStatus: "Draft",
		workflowStatus: "draft",
		modifiedBy: getRandomName("3"),
		language: "en",
		lastModified: "Jan 11, 2025",
		tags: ["fitness-tracking", "cardio-workout"],
		categories: ["equipment"],
	},
	{
		id: "5",
		name: "Pricing Block",
		baseType: "Block",
		contentTypeId: "ct-block",
		publishStatus: "Draft",
		workflowStatus: "draft",
		modifiedBy: getRandomName("5"),
		language: "en",
		lastModified: "Jan 11, 2025",
		tags: [],
		categories: ["marketing"],
	},
	{
		id: "9",
		name: "Cycling Hero - Image",
		baseType: "Media",
		contentTypeId: "ct-image",
		publishStatus: "Draft",
		workflowStatus: "draft",
		modifiedBy: getRandomName("9"),
		language: "en",
		lastModified: "Jan 11, 2025",
		tags: ["cycling-training", "road-cycling"],
		categories: ["media"],
	},
	{
		id: "13",
		name: "Route Planning Block",
		baseType: "Block",
		contentTypeId: "ct-block",
		publishStatus: "Draft",
		workflowStatus: "in-review",
		modifiedBy: getRandomName("13"),
		language: "en",
		lastModified: "Jan 8, 2025",
		tags: ["outdoor-training", "cycling-training"],
		categories: ["features"],
	},
	{
		id: "26",
		name: "Leaderboards Block",
		baseType: "Block",
		contentTypeId: "ct-block",
		publishStatus: "Published",
		workflowStatus: "approved",
		modifiedBy: getRandomName("26"),
		language: "en",
		lastModified: "Dec 26, 2024",
		tags: ["fitness-tracking"],
		categories: ["features"],
	},
	{
		id: "31",
		name: "Cycle Computer Pro - Product",
		baseType: "Product",
		contentTypeId: "ct-product",
		publishStatus: "Published",
		workflowStatus: "approved",
		modifiedBy: getRandomName("31"),
		language: "en",
		lastModified: "Dec 21, 2024",
		tags: ["cycling-training", "cycling-performance", "fitness-tracking"],
		categories: ["equipment", "cycling"],
	},
	{
		id: "32",
		name: "HR Monitor Band - Product",
		baseType: "Product",
		contentTypeId: "ct-product",
		publishStatus: "Published",
		workflowStatus: "approved",
		modifiedBy: getRandomName("32"),
		language: "en",
		lastModified: "Dec 20, 2024",
		tags: ["fitness-tracking", "cardio-workout"],
		categories: ["equipment"],
	},
	{
		id: "33",
		name: "Smart Bike Trainer - Product",
		baseType: "Product",
		contentTypeId: "ct-product",
		publishStatus: "Published",
		workflowStatus: "approved",
		modifiedBy: getRandomName("33"),
		language: "en",
		lastModified: "Dec 19, 2024",
		tags: ["indoor-training", "cycling-training", "cycling-performance"],
		categories: ["equipment", "cycling"],
	},
	{
		id: "34",
		name: "Cadence Sensor - Product",
		baseType: "Product",
		contentTypeId: "ct-product",
		publishStatus: "Published",
		workflowStatus: "approved",
		modifiedBy: getRandomName("34"),
		language: "en",
		lastModified: "Dec 18, 2024",
		tags: ["cycling-training", "cycling-performance"],
		categories: ["equipment", "cycling"],
	},
	{
		id: "35",
		name: "Power Meter - Product",
		baseType: "Product",
		contentTypeId: "ct-product",
		publishStatus: "Published",
		workflowStatus: "approved",
		modifiedBy: getRandomName("35"),
		language: "en",
		lastModified: "Dec 17, 2024",
		tags: ["cycling-training", "cycling-performance", "endurance-training"],
		categories: ["equipment", "cycling"],
	},
	{
		id: "36",
		name: "Speed Sensor - Product",
		baseType: "Product",
		contentTypeId: "ct-product",
		publishStatus: "Published",
		workflowStatus: "approved",
		modifiedBy: getRandomName("36"),
		language: "en",
		lastModified: "Dec 16, 2024",
		tags: ["cycling-training", "fitness-tracking"],
		categories: ["equipment", "cycling"],
	},
	{
		id: "37",
		name: "Aero Helmet - Product",
		baseType: "Product",
		contentTypeId: "ct-product",
		publishStatus: "Published",
		workflowStatus: "approved",
		modifiedBy: getRandomName("37"),
		language: "en",
		lastModified: "Dec 15, 2024",
		tags: ["road-cycling", "cycling-performance"],
		categories: ["equipment", "cycling"],
	},
	{
		id: "38",
		name: "Bike Lights - Product",
		baseType: "Product",
		contentTypeId: "ct-product",
		publishStatus: "Published",
		workflowStatus: "approved",
		modifiedBy: getRandomName("38"),
		language: "en",
		lastModified: "Dec 14, 2024",
		tags: ["road-cycling", "mountain-biking"],
		categories: ["equipment", "cycling"],
	},
	{
		id: "39",
		name: "Water Bottle Holder - Product",
		baseType: "Product",
		contentTypeId: "ct-product",
		publishStatus: "Published",
		workflowStatus: "approved",
		modifiedBy: getRandomName("39"),
		language: "en",
		lastModified: "Dec 13, 2024",
		tags: ["cycling-training"],
		categories: ["equipment"],
	},
	{
		id: "40",
		name: "Repair Tool Kit - Product",
		baseType: "Product",
		contentTypeId: "ct-product",
		publishStatus: "Published",
		workflowStatus: "approved",
		modifiedBy: getRandomName("40"),
		language: "en",
		lastModified: "Dec 12, 2024",
		tags: ["road-cycling", "mountain-biking"],
		categories: ["equipment"],
	},
	{
		id: "41",
		name: "Weekly Challenge Block",
		baseType: "Block",
		contentTypeId: "ct-block",
		publishStatus: "Published",
		workflowStatus: "approved",
		modifiedBy: getRandomName("41"),
		language: "en",
		lastModified: "Dec 11, 2024",
		tags: ["fitness-tracking", "exercise-routine"],
		categories: ["features"],
	},
	{
		id: "42",
		name: "Achievement Block",
		baseType: "Block",
		contentTypeId: "ct-block",
		publishStatus: "Published",
		workflowStatus: "approved",
		modifiedBy: getRandomName("42"),
		language: "en",
		lastModified: "Dec 10, 2024",
		tags: ["fitness-tracking"],
		categories: ["features"],
	},
	{
		id: "43",
		name: "Social Feed Block",
		baseType: "Block",
		contentTypeId: "ct-block",
		publishStatus: "Published",
		workflowStatus: "approved",
		modifiedBy: getRandomName("43"),
		language: "en",
		lastModified: "Dec 9, 2024",
		tags: [],
		categories: ["features"],
	},
	{
		id: "44",
		name: "Leaderboard Widget Block",
		baseType: "Block",
		contentTypeId: "ct-block",
		publishStatus: "Published",
		workflowStatus: "approved",
		modifiedBy: getRandomName("44"),
		language: "en",
		lastModified: "Dec 8, 2024",
		tags: ["fitness-tracking"],
		categories: ["features"],
	},
	{
		id: "45",
		name: "Stats Summary Block",
		baseType: "Block",
		contentTypeId: "ct-block",
		publishStatus: "Published",
		workflowStatus: "approved",
		modifiedBy: getRandomName("45"),
		language: "en",
		lastModified: "Dec 7, 2024",
		tags: ["fitness-tracking"],
		categories: ["features"],
	},
	{
		id: "46",
		name: "Upcoming Events Block",
		baseType: "Block",
		contentTypeId: "ct-block",
		publishStatus: "Published",
		workflowStatus: "approved",
		modifiedBy: getRandomName("46"),
		language: "en",
		lastModified: "Dec 6, 2024",
		tags: [],
		categories: ["features"],
	},
	{
		id: "47",
		name: "Testimonial Carousel Block",
		baseType: "Block",
		contentTypeId: "ct-block",
		publishStatus: "Published",
		workflowStatus: "approved",
		modifiedBy: getRandomName("47"),
		language: "en",
		lastModified: "Dec 5, 2024",
		tags: [],
		categories: ["marketing"],
	},
	{
		id: "48",
		name: "Payment Plans Block",
		baseType: "Block",
		contentTypeId: "ct-block",
		publishStatus: "Published",
		workflowStatus: "approved",
		modifiedBy: getRandomName("48"),
		language: "en",
		lastModified: "Dec 4, 2024",
		tags: [],
		categories: ["marketing"],
	},
	{
		id: "49",
		name: "Mountain Pass Scenery - Image",
		baseType: "Media",
		contentTypeId: "ct-image",
		publishStatus: "Published",
		workflowStatus: "approved",
		modifiedBy: getRandomName("49"),
		language: "en",
		lastModified: "Dec 3, 2024",
		tags: ["mountain-biking", "outdoor-training"],
		categories: ["media"],
	},
	{
		id: "50",
		name: "Pro Cyclist In Action - Image",
		baseType: "Media",
		contentTypeId: "ct-image",
		publishStatus: "Published",
		workflowStatus: "approved",
		modifiedBy: getRandomName("50"),
		language: "en",
		lastModified: "Dec 2, 2024",
		tags: ["road-cycling", "cycling-performance"],
		categories: ["media"],
	},
];

// Sample tag/category assignments for pages based on content type
const getPageTagsAndCategories = (pageId: string, contentTypeId: string): { tags: string[], categories: string[] } => {
	// Map some pages to specific tags for demo purposes
	const pageTagMap: Record<string, string[]> = {
		"page-site-home": ["spring-reset", "fitness-tracking"],
		"page-site-about": [],
		"page-site-contact": [],
		"page-site-blog": ["exercise-routine"],
		"page-site-products": ["cycling-training"],
		"page-site-product-a": ["cycling-performance", "road-cycling"],
		"page-exp-landing-default": ["spring-reset", "summer-shred", "fitness-tracking"],
		"page-site-blog-post-1": ["exercise-routine", "endurance-training"],
		"page-site-blog-post-2": ["sprint-training", "exercise-routine"],
		"page-site-blog-post-3": ["outdoor-training"],
		"page-site-blog-post-4": ["road-cycling", "cycling-training"],
		"page-site-events": ["fitness-tracking"],
		"page-site-event-1": ["endurance-training", "exercise-routine"],
		"page-site-event-2": ["fitness-tracking", "cardio-workout"],
		"page-site-event-3": ["outdoor-training", "endurance-training"],
		"page-activities": ["outdoor-training", "fitness-tracking"],
		"page-community": ["fitness-tracking"],
		"page-challenges": ["exercise-routine", "fitness-tracking"],
		"page-pricing": [],
		"page-stories": ["fitness-tracking"],
		"page-product-31": ["cycling-training", "cycling-performance", "fitness-tracking"],
		"page-product-32": ["fitness-tracking", "cardio-workout"],
		"page-product-33": ["indoor-training", "cycling-training"],
		"page-product-34": ["cycling-training", "cycling-performance"],
		"page-product-35": ["cycling-training", "endurance-training"],
		"page-product-36": ["cycling-training", "fitness-tracking"],
	};

	const pageCategoryMap: Record<string, string[]> = {
		"page-site-home": ["marketing"],
		"page-site-about": ["company"],
		"page-site-contact": ["company"],
		"page-site-blog": ["content"],
		"page-site-products": ["products"],
		"page-site-product-a": ["products"],
		"page-exp-landing-default": ["marketing"],
		"page-site-blog-post-1": ["content", "training"],
		"page-site-blog-post-2": ["content", "training"],
		"page-site-blog-post-3": ["content"],
		"page-site-blog-post-4": ["content", "products"],
		"page-site-events": ["events"],
		"page-site-event-1": ["events", "training"],
		"page-site-event-2": ["events"],
		"page-site-event-3": ["events", "training"],
		"page-activities": ["features"],
		"page-community": ["features"],
		"page-challenges": ["features"],
		"page-pricing": ["marketing"],
		"page-stories": ["marketing"],
		"page-product-31": ["products", "cycling"],
		"page-product-32": ["products"],
		"page-product-33": ["products", "cycling"],
		"page-product-34": ["products", "cycling"],
		"page-product-35": ["products", "cycling"],
		"page-product-36": ["products", "cycling"],
	};

	return {
		tags: pageTagMap[pageId] || [],
		categories: pageCategoryMap[pageId] || [],
	};
};

export const getAllContentItems = (pages: Page[] = initialPages): UnifiedContentItem[] => {
	const pageItems: UnifiedContentItem[] = pages.map((p) => {
		const ct = initialContentTypes.find((c) => c.id === p.contentTypeId);
		const date = new Date(p.lastModified);
		const formattedDate = date.toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		});
		const fallback = getPageTagsAndCategories(p.id, p.contentTypeId);
		const tags = p.tags ?? fallback.tags;
		const categories = p.categories ?? fallback.categories;

		return {
			id: p.id,
			name: p.name,
			baseType: ct?.baseType || "Page",
			contentTypeId: p.contentTypeId,
			publishStatus: p.status === "Published" ? "Published" : "Draft",
			workflowStatus: p.status === "Published" ? "approved" : "draft",
			modifiedBy: getRandomName(p.id),
			language: "en",
			lastModified: formattedDate,
			tags,
			categories,
			hasConnection: !!p.cmpConnection,
		};
	});
	return [...pageItems, ...initialOtherContent];
};

export const siteConfig = {
	header: {
		logo: "STRIDE",
		links: [
			{ label: "Features", href: "/features" },
			{ label: "Challenges", href: "/challenges" },
			{ label: "Subscriptions", href: "/subscriptions" },
			{ label: "About Us", href: "/about" },
		],
		auth: {
			signIn: "Sign In",
			cta: "Get Started",
		},
	},
};

// Initial Tags - cleaned: removed 8 orphaned tags and updated usage counts to match actual content usage
export const initialTags = [
	{
		id: 'tag-1',
		name: 'Spring Reset',
		slug: 'spring-reset',
		visibility: 'private' as const,
		modifiedBy: 'Tien Le',
		usage: 2,
		lastModified: 'Jan 11, 2025',
	},
	{
		id: 'tag-2',
		name: 'Summer Shred',
		slug: 'summer-shred',
		visibility: 'private' as const,
		modifiedBy: 'Sofia Kim',
		usage: 1,
		lastModified: 'Feb 15, 2025',
	},
	{
		id: 'tag-4',
		name: 'Outdoor Training',
		slug: 'outdoor-training',
		visibility: 'private' as const,
		modifiedBy: 'Lara Chen',
		usage: 4,
		lastModified: 'Mar 20, 2025',
	},
	{
		id: 'tag-12',
		name: 'Cycling Training',
		slug: 'cycling-training',
		visibility: 'public' as const,
		modifiedBy: 'Current User',
		usage: 15,
		lastModified: 'Jan 28, 2026',
	},
	{
		id: 'tag-13',
		name: 'Cycling Performance',
		slug: 'cycling-performance',
		visibility: 'public' as const,
		modifiedBy: 'Current User',
		usage: 9,
		lastModified: 'Jan 28, 2026',
	},
	{
		id: 'tag-14',
		name: 'Exercise Routine',
		slug: 'exercise-routine',
		visibility: 'public' as const,
		modifiedBy: 'Current User',
		usage: 5,
		lastModified: 'Jan 28, 2026',
	},
	{
		id: 'tag-15',
		name: 'Cardio Workout',
		slug: 'cardio-workout',
		visibility: 'public' as const,
		modifiedBy: 'Current User',
		usage: 3,
		lastModified: 'Jan 28, 2026',
	},
	{
		id: 'tag-16',
		name: 'Mountain Biking',
		slug: 'mountain-biking',
		visibility: 'public' as const,
		modifiedBy: 'Current User',
		usage: 3,
		lastModified: 'Jan 28, 2026',
	},
	{
		id: 'tag-17',
		name: 'Road Cycling',
		slug: 'road-cycling',
		visibility: 'public' as const,
		modifiedBy: 'Current User',
		usage: 7,
		lastModified: 'Jan 28, 2026',
	},
	{
		id: 'tag-18',
		name: 'Indoor Training',
		slug: 'indoor-training',
		visibility: 'public' as const,
		modifiedBy: 'Current User',
		usage: 2,
		lastModified: 'Jan 28, 2026',
	},
	{
		id: 'tag-19',
		name: 'Fitness Tracking',
		slug: 'fitness-tracking',
		visibility: 'public' as const,
		modifiedBy: 'Current User',
		usage: 18,
		lastModified: 'Jan 28, 2026',
	},
	{
		id: 'tag-20',
		name: 'Endurance Training',
		slug: 'endurance-training',
		visibility: 'public' as const,
		modifiedBy: 'Current User',
		usage: 3,
		lastModified: 'Jan 28, 2026',
	},
	{
		id: 'tag-21',
		name: 'Sprint Training',
		slug: 'sprint-training',
		visibility: 'public' as const,
		modifiedBy: 'Current User',
		usage: 1,
		lastModified: 'Jan 28, 2026',
	},
];

// Initial Categories – must include every category slug used in content (pageCategoryMap + initialOtherContent)
// so the categories table matches what appears in content manager filters.
export const initialCategories = [
	{
		id: 'cat-1',
		name: 'Equipment',
		slug: 'equipment',
		status: 'published' as const,
		visibility: 'public' as const,
		modifiedBy: 'Alice Johnson',
		usage: 10,
		lastModified: 'Jan 15, 2025',
		parentId: null,
		isExpanded: true,
	},
	{
		id: 'cat-2',
		name: 'Cycling',
		slug: 'cycling',
		status: 'published' as const,
		visibility: 'public' as const,
		modifiedBy: 'Bob Smith',
		usage: 12,
		lastModified: 'Jan 14, 2025',
		parentId: null,
		isExpanded: true,
	},
	{
		id: 'cat-3',
		name: 'Features',
		slug: 'features',
		status: 'published' as const,
		visibility: 'public' as const,
		modifiedBy: 'Carol Williams',
		usage: 11,
		lastModified: 'Jan 13, 2025',
		parentId: null,
		isExpanded: false,
	},
	{
		id: 'cat-4',
		name: 'Marketing',
		slug: 'marketing',
		status: 'published' as const,
		visibility: 'public' as const,
		modifiedBy: 'David Brown',
		usage: 7,
		lastModified: 'Jan 12, 2025',
		parentId: null,
		isExpanded: false,
	},
	{
		id: 'cat-5',
		name: 'Content',
		slug: 'content',
		status: 'published' as const,
		visibility: 'public' as const,
		modifiedBy: 'Emma Wilson',
		usage: 5,
		lastModified: 'Jan 11, 2025',
		parentId: null,
		isExpanded: false,
	},
	{
		id: 'cat-6',
		name: 'Training',
		slug: 'training',
		status: 'published' as const,
		visibility: 'public' as const,
		modifiedBy: 'Frank Miller',
		usage: 2,
		lastModified: 'Jan 10, 2025',
		parentId: null,
		isExpanded: false,
	},
	{
		id: 'cat-7',
		name: 'Products',
		slug: 'products',
		status: 'published' as const,
		visibility: 'public' as const,
		modifiedBy: 'Grace Lee',
		usage: 10,
		lastModified: 'Jan 9, 2025',
		parentId: null,
		isExpanded: false,
	},
	{
		id: 'cat-8',
		name: 'Media',
		slug: 'media',
		status: 'published' as const,
		visibility: 'public' as const,
		modifiedBy: 'Henry Chen',
		usage: 3,
		lastModified: 'Jan 8, 2025',
		parentId: null,
		isExpanded: false,
	},
	{
		id: 'cat-9',
		name: 'Company',
		slug: 'company',
		status: 'published' as const,
		visibility: 'public' as const,
		modifiedBy: 'Ivy Park',
		usage: 2,
		lastModified: 'Jan 7, 2025',
		parentId: null,
		isExpanded: false,
	},
];

export const initialApplications: Application[] = [
	{
		id: "app-stride",
		name: "Stride",
		appId: "1234",
		url: "www",
		startPageId: "page-site-home",
		modifiedAt: new Date().toISOString(),
		modifiedBy: "System",
	},
	{
		id: "app-stride-mobile",
		name: "Stride Mobile",
		appId: "5678",
		url: "mobile.stride.com",
		startPageId: "page-site-home",
		modifiedAt: new Date().toISOString(),
		modifiedBy: "System",
	},
];

// Helper functions for content type restrictions
export function getContentType(contentTypeId: string): ContentType | undefined {
	return initialContentTypes.find(ct => ct.id === contentTypeId);
}

export function canCreateChildType(
	parentContentTypeId: string,
	childContentTypeId: string
): boolean {
	const parentType = getContentType(parentContentTypeId);
	const childType = getContentType(childContentTypeId);

	// Check parent-side restrictions (AvailableContentTypesAttribute)
	if (parentType?.availableContentTypes) {
		const { availability, include, exclude } = parentType.availableContentTypes;

		// If availability is explicitly set to None, no children allowed
		if (availability === "None") {
			return false;
		}

		// If include is set, ONLY those types are allowed
		if (include && include.length > 0) {
			if (!include.includes(childContentTypeId)) {
				return false;
			}
		}

		// If exclude is set, those types are NOT allowed
		if (exclude && exclude.length > 0) {
			if (exclude.includes(childContentTypeId)) {
				return false;
			}
		}

		// If availability is "All" (or undefined), and no include/exclude, all types allowed
	}

	// Check child-side restrictions (IncludeOn/ExcludeOn)
	// IncludeOn: This child can ONLY be created under these parent types
	if (childType?.includeOn && childType.includeOn.length > 0) {
		if (!childType.includeOn.includes(parentContentTypeId)) {
			return false;
		}
	}

	// ExcludeOn: This child CANNOT be created under these parent types
	if (childType?.excludeOn && childType.excludeOn.length > 0) {
		if (childType.excludeOn.includes(parentContentTypeId)) {
			return false;
		}
	}

	return true;
}
