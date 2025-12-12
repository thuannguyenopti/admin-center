export type Algorithm = {
    id: string;
    name: string;
    publishState: string;
    creationDate: string;
    owner: string;
};

export type BestBet = {
    query: string;
    destination: string;
    owner: string;
};

export type RelatedQuery = {
    query: string;
    synonyms: string[];
    owner: string;
};

export type AlgorithmBestBet = BestBet & {
    status: "Active" | "Inactive";
};

export const initialAlgorithms: Algorithm[] = [
    {
        id: "1",
        name: "Summer Sale Boost",
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
    },
    {
        id: "3",
        name: "Wearables Launch",
        publishState: "Testing",
        creationDate: "2023-11-15",
        owner: "Carol Williams",
    },
    {
        id: "4",
        name: "Holiday Gift Guide",
        publishState: "Published",
        creationDate: "2023-09-10",
        owner: "David Brown",
    },
    {
        id: "5",
        name: "Clearance Logic",
        publishState: "Archived",
        creationDate: "2023-01-20",
        owner: "Alice Johnson",
    },
];

export const initialBestBets: BestBet[] = [
    {
        query: "return policy",
        destination: "https://stride.com/help/returns",
        owner: "Support Team",
    },
    {
        query: "shipping rates",
        destination: "https://stride.com/help/shipping",
        owner: "Logistics",
    },
    {
        query: "running shoes",
        destination: "https://stride.com/products/runner-elite",
        owner: "Marketing",
    },
];

export const initialRelatedQueries: RelatedQuery[] = [
    {
        query: "sneakers",
        synonyms: ["shoes", "trainers", "kicks"],
        owner: "Merchandising",
    },
    {
        query: "jacket",
        synonyms: ["coat", "parka", "windbreaker"],
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

export type ContentField = {
    id: string;
    name: string;
    type: "text" | "textarea" | "richtext" | "reference" | "address";
    required?: boolean;
    /** when type is reference this points to a collection like 'users' */
    of?: string;
};

export type ContentType = {
    id: string;
    name: string;
    description?: string;
    fields: ContentField[];
};

export const initialContentTypes: ContentType[] = [
    {
        id: "ct-blog-post",
        name: "Blog Post",
        description: "A standard blog/article page",
        fields: [
            { id: "title", name: "Title", type: "text", required: true },
            { id: "subtitle", name: "Subtitle", type: "text" },
            { id: "body", name: "Body", type: "richtext", required: true },
            { id: "author", name: "Author", type: "reference", of: "users", required: true },
        ],
    },
    {
        id: "ct-about-page",
        name: "About Page",
        description: "Company about page",
        fields: [
            { id: "title", name: "Title", type: "text", required: true },
            { id: "about", name: "About (Stride)", type: "richtext" },
            { id: "history", name: "History", type: "textarea" },
            { id: "orgAddress", name: "Org address", type: "address" },
        ],
    },
];

export type Page = {
    id: string;
    contentTypeId: string;
    slug?: string;
    data: Record<string, any>;
};

export const initialPages: Page[] = [
    {
        id: "page-blog-1",
        contentTypeId: "ct-blog-post",
        slug: "blog/welcome",
        data: {
            title: "Welcome to Our Blog",
            subtitle: "Thoughts, news and updates",
            body: "<p>This is the first blog post. Welcome!</p>",
            author: "1",
        },
    },
    {
        id: "page-about-1",
        contentTypeId: "ct-about-page",
        slug: "about",
        data: {
            title: "About Stride",
            about: "<p>Stride is a company focused on building delightful shopping experiences.</p>",
            history: "Started in 2019 as a small team...",
            orgAddress: "123 Stride Way, Portland, OR, 97201",
        },
    },

    // Additional sample blog posts (sports related)
    {
        id: "page-blog-2",
        contentTypeId: "ct-blog-post",
        slug: "blog/marathon-training-basics",
        data: {
            title: "Marathon Training Basics",
            subtitle: "How to prepare for your first 26.2 miles",
            body: "<p>Start with a solid base, progressively increase mileage, and prioritise recovery.</p>",
            author: "2",
        },
    },
    {
        id: "page-blog-3",
        contentTypeId: "ct-blog-post",
        slug: "blog/grand-canyon-mountain-bike",
        data: {
            title: "Mountain Biking the Grand Canyon",
            subtitle: "A guide to routes, gear, and safety",
            body: "<p>The Grand Canyon offers epic descents — bring technical skills, hydration, and respect for the environment.</p>",
            author: "3",
        },
    },
    {
        id: "page-blog-4",
        contentTypeId: "ct-blog-post",
        slug: "blog/high-jump-competition-tips",
        data: {
            title: "High Jump Competition Tips",
            subtitle: "Improve your approach and clearance",
            body: "<p>Work on speed-to-bar rhythm, take-off mechanics, and consistent landing drills to boost clearance.</p>",
            author: "1",
        },
    },
    {
        id: "page-blog-5",
        contentTypeId: "ct-blog-post",
        slug: "blog/trail-running-skills",
        data: {
            title: "Essential Trail Running Skills",
            subtitle: "Downhill technique, footing and pacing",
            body: "<p>Focus on shorter, quicker steps downhill, look ahead for line choices, and build ankle strength.</p>",
            author: "4",
        },
    },
    {
        id: "page-blog-6",
        contentTypeId: "ct-blog-post",
        slug: "blog/triathlon-swim-bike-run-plan",
        data: {
            title: "Triathlon Training: Swim, Bike, Run",
            subtitle: "Balancing three disciplines without overtraining",
            body: "<p>Use block sessions, prioritise weaker disciplines, and keep consistent brick workouts to adapt to race demands.</p>",
            author: "2",
        },
    },
    {
        id: "page-blog-7",
        contentTypeId: "ct-blog-post",
        slug: "blog/rowing-regatta-prep",
        data: {
            title: "Preparing for a Rowing Regatta",
            subtitle: "Race day routines and crew coordination",
            body: "<p>Sync your cadence, practise race starts, and refine cox/crew calls during head-to-head pieces.</p>",
            author: "3",
        },
    },
    {
        id: "page-blog-8",
        contentTypeId: "ct-blog-post",
        slug: "blog/soccer-tactics-overview",
        data: {
            title: "Soccer Tactics: Pressing and Possession",
            subtitle: "When to press high and when to control possession",
            body: "<p>Pressing traps opponents but requires fitness; possession gains control — mix both depending on match context.</p>",
            author: "1",
        },
    },
    {
        id: "page-blog-9",
        contentTypeId: "ct-blog-post",
        slug: "blog/rock-climbing-beginners",
        data: {
            title: "Rock Climbing for Beginners",
            subtitle: "Technique, gear, and safety essentials",
            body: "<p>Learn footwork, efficient movement, and proper belaying before pushing grades outdoors.</p>",
            author: "4",
        },
    },
    {
        id: "page-blog-10",
        contentTypeId: "ct-blog-post",
        slug: "blog/open-water-swimming-tips",
        data: {
            title: "Open Water Swimming Tips",
            subtitle: "Sighting, drafting and race strategies",
            body: "<p>Practice sighting, warm up properly, and draft when possible to save energy on long swims.</p>",
            author: "2",
        },
    },
    {
        id: "page-blog-11",
        contentTypeId: "ct-blog-post",
        slug: "blog/ultra-running-nutrition",
        data: {
            title: "Ultra Running Nutrition Essentials",
            subtitle: "Fueling strategies for 50km+ events",
            body: "<p>Test fueling plans in training, use a mix of solids and gels, and adapt to GI tolerance on long efforts.</p>",
            author: "3",
        },
    },
];

export type ExperienceType = {
    id: string;
    name: string;
    description?: string;
    regions?: string[];
};

export const initialExperienceTypes: ExperienceType[] = [
    {
        id: "exp-landing-page",
        name: "Landing Page",
        description: "Landing page experience with main and aside outlines",
        regions: ["main", "aside"],
    },
];

export type Experience = {
    id: string;
    experienceTypeId: string;
    name: string;
    outlines?: Record<string, any>;
};
