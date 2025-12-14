export type ContentType = "Page" | "Product" | "Block" | "Image";
export type PublishStatus = "Draft" | "Published";

export interface UnifiedContentItem {
  id: string;
  name: string;
  type: ContentType;
  publishStatus: PublishStatus;
  workflowStatus: "draft" | "in-review" | "approved" | "scheduled";
  modifiedBy: string;
  language: string;
  lastModified: string;
}

const reportNames = ["Alice Johnson", "Bob Smith", "Carol Williams", "David Brown", "Maria Garcia", "Sarah Chen", "Marcus Johnson", "Alex Rivera", "Emily Brown", "James Wilson", "Lisa Anderson", "David Kim", "Michelle Taylor", "Robert Garcia", "Jessica Moore", "Chris Lee", "Patricia White", "Kevin Davis", "Jennifer Martin", "Thomas Brown", "Steven Clark", "Nancy Rodriguez", "Daniel Lewis"];

const getRandomName = (id: string) => {
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return reportNames[hash % reportNames.length];
};

// All 50 content items - unified across app
export const allContentItems: UnifiedContentItem[] = [
  // Draft Items (20) - Map to Draft workflow
  { id: "1", name: "Features Page", type: "Page", publishStatus: "Draft", workflowStatus: "draft", modifiedBy: getRandomName("1"), language: "en", lastModified: "Jan 11, 2025" },
  { id: "2", name: "Training Plans Page", type: "Page", publishStatus: "Draft", workflowStatus: "draft", modifiedBy: getRandomName("2"), language: "en", lastModified: "Jan 11, 2025" },
  { id: "3", name: "Heart Rate Monitor - Product", type: "Product", publishStatus: "Draft", workflowStatus: "draft", modifiedBy: getRandomName("3"), language: "en", lastModified: "Jan 11, 2025" },
  { id: "4", name: "Getting Started Page", type: "Page", publishStatus: "Draft", workflowStatus: "draft", modifiedBy: getRandomName("4"), language: "en", lastModified: "Jan 11, 2025" },
  { id: "5", name: "Pricing Block", type: "Block", publishStatus: "Draft", workflowStatus: "draft", modifiedBy: getRandomName("5"), language: "en", lastModified: "Jan 11, 2025" },
  { id: "6", name: "Stride Premium Page", type: "Page", publishStatus: "Draft", workflowStatus: "draft", modifiedBy: getRandomName("6"), language: "en", lastModified: "Jan 11, 2025" },
  { id: "7", name: "Community Stories Page", type: "Page", publishStatus: "Draft", workflowStatus: "draft", modifiedBy: getRandomName("7"), language: "en", lastModified: "Jan 11, 2025" },
  { id: "8", name: "My Dashboard Page", type: "Page", publishStatus: "Draft", workflowStatus: "draft", modifiedBy: getRandomName("8"), language: "en", lastModified: "Jan 11, 2025" },
  { id: "9", name: "Cycling Hero - Image", type: "Image", publishStatus: "Draft", workflowStatus: "draft", modifiedBy: getRandomName("9"), language: "en", lastModified: "Jan 11, 2025" },
  { id: "10", name: "Help Center Page", type: "Page", publishStatus: "Draft", workflowStatus: "draft", modifiedBy: getRandomName("10"), language: "en", lastModified: "Jan 11, 2025" },

  // In Review Items (10) - Map to In-Review workflow
  { id: "11", name: "Beginner's Guide to Cycling Page", type: "Page", publishStatus: "Draft", workflowStatus: "in-review", modifiedBy: getRandomName("11"), language: "en", lastModified: "Jan 10, 2025" },
  { id: "12", name: "Advanced Training Techniques Page", type: "Page", publishStatus: "Draft", workflowStatus: "in-review", modifiedBy: getRandomName("12"), language: "en", lastModified: "Jan 9, 2025" },
  { id: "13", name: "Route Planning Block", type: "Block", publishStatus: "Draft", workflowStatus: "in-review", modifiedBy: getRandomName("13"), language: "en", lastModified: "Jan 8, 2025" },
  { id: "14", name: "Performance Metrics Page", type: "Page", publishStatus: "Draft", workflowStatus: "in-review", modifiedBy: getRandomName("14"), language: "en", lastModified: "Jan 7, 2025" },
  { id: "15", name: "Nutrition for Cyclists Page", type: "Page", publishStatus: "Draft", workflowStatus: "in-review", modifiedBy: getRandomName("15"), language: "en", lastModified: "Jan 6, 2025" },
  { id: "16", name: "Bike Maintenance Tips Page", type: "Page", publishStatus: "Draft", workflowStatus: "in-review", modifiedBy: getRandomName("16"), language: "en", lastModified: "Jan 5, 2025" },
  { id: "17", name: "Indoor Training Guide Page", type: "Page", publishStatus: "Draft", workflowStatus: "in-review", modifiedBy: getRandomName("17"), language: "en", lastModified: "Jan 4, 2025" },
  { id: "18", name: "Weather & Safety Page", type: "Page", publishStatus: "Draft", workflowStatus: "in-review", modifiedBy: getRandomName("18"), language: "en", lastModified: "Jan 3, 2025" },
  { id: "19", name: "Race Preparation Page", type: "Page", publishStatus: "Draft", workflowStatus: "in-review", modifiedBy: getRandomName("19"), language: "en", lastModified: "Jan 2, 2025" },
  { id: "20", name: "Recovery Strategies Page", type: "Page", publishStatus: "Draft", workflowStatus: "in-review", modifiedBy: getRandomName("20"), language: "en", lastModified: "Jan 1, 2025" },

  // Approved Items (30) - Map to Approved workflow
  { id: "21", name: "Climbing Techniques Page", type: "Page", publishStatus: "Published", workflowStatus: "approved", modifiedBy: getRandomName("21"), language: "en", lastModified: "Dec 31, 2024" },
  { id: "22", name: "Sprint Training Page", type: "Page", publishStatus: "Published", workflowStatus: "approved", modifiedBy: getRandomName("22"), language: "en", lastModified: "Dec 30, 2024" },
  { id: "23", name: "Cadence Optimization Page", type: "Page", publishStatus: "Published", workflowStatus: "approved", modifiedBy: getRandomName("23"), language: "en", lastModified: "Dec 29, 2024" },
  { id: "24", name: "Gear Ratios Guide Page", type: "Page", publishStatus: "Published", workflowStatus: "approved", modifiedBy: getRandomName("24"), language: "en", lastModified: "Dec 28, 2024" },
  { id: "25", name: "Community Rides Page", type: "Page", publishStatus: "Published", workflowStatus: "approved", modifiedBy: getRandomName("25"), language: "en", lastModified: "Dec 27, 2024" },
  { id: "26", name: "Leaderboards Block", type: "Block", publishStatus: "Published", workflowStatus: "approved", modifiedBy: getRandomName("26"), language: "en", lastModified: "Dec 26, 2024" },
  { id: "27", name: "Achievement Badges Page", type: "Page", publishStatus: "Published", workflowStatus: "approved", modifiedBy: getRandomName("27"), language: "en", lastModified: "Dec 25, 2024" },
  { id: "28", name: "Social Features Page", type: "Page", publishStatus: "Published", workflowStatus: "approved", modifiedBy: getRandomName("28"), language: "en", lastModified: "Dec 24, 2024" },
  { id: "29", name: "Premium Benefits Page", type: "Page", publishStatus: "Published", workflowStatus: "approved", modifiedBy: getRandomName("29"), language: "en", lastModified: "Dec 23, 2024" },
  { id: "30", name: "Subscription FAQ Page", type: "Page", publishStatus: "Published", workflowStatus: "approved", modifiedBy: getRandomName("30"), language: "en", lastModified: "Dec 22, 2024" },
  { id: "31", name: "Cycle Computer Pro - Product", type: "Product", publishStatus: "Published", workflowStatus: "approved", modifiedBy: getRandomName("31"), language: "en", lastModified: "Dec 21, 2024" },
  { id: "32", name: "HR Monitor Band - Product", type: "Product", publishStatus: "Published", workflowStatus: "approved", modifiedBy: getRandomName("32"), language: "en", lastModified: "Dec 20, 2024" },
  { id: "33", name: "Smart Bike Trainer - Product", type: "Product", publishStatus: "Published", workflowStatus: "approved", modifiedBy: getRandomName("33"), language: "en", lastModified: "Dec 19, 2024" },
  { id: "34", name: "Cadence Sensor - Product", type: "Product", publishStatus: "Published", workflowStatus: "approved", modifiedBy: getRandomName("34"), language: "en", lastModified: "Dec 18, 2024" },
  { id: "35", name: "Power Meter - Product", type: "Product", publishStatus: "Published", workflowStatus: "approved", modifiedBy: getRandomName("35"), language: "en", lastModified: "Dec 17, 2024" },
  { id: "36", name: "Speed Sensor - Product", type: "Product", publishStatus: "Published", workflowStatus: "approved", modifiedBy: getRandomName("36"), language: "en", lastModified: "Dec 16, 2024" },
  { id: "37", name: "Aero Helmet - Product", type: "Product", publishStatus: "Published", workflowStatus: "approved", modifiedBy: getRandomName("37"), language: "en", lastModified: "Dec 15, 2024" },
  { id: "38", name: "Bike Lights - Product", type: "Product", publishStatus: "Published", workflowStatus: "approved", modifiedBy: getRandomName("38"), language: "en", lastModified: "Dec 14, 2024" },
  { id: "39", name: "Water Bottle Holder - Product", type: "Product", publishStatus: "Published", workflowStatus: "approved", modifiedBy: getRandomName("39"), language: "en", lastModified: "Dec 13, 2024" },
  { id: "40", name: "Repair Tool Kit - Product", type: "Product", publishStatus: "Published", workflowStatus: "approved", modifiedBy: getRandomName("40"), language: "en", lastModified: "Dec 12, 2024" },
  { id: "41", name: "Weekly Challenge Block", type: "Block", publishStatus: "Published", workflowStatus: "approved", modifiedBy: getRandomName("41"), language: "en", lastModified: "Dec 11, 2024" },
  { id: "42", name: "Achievement Block", type: "Block", publishStatus: "Published", workflowStatus: "approved", modifiedBy: getRandomName("42"), language: "en", lastModified: "Dec 10, 2024" },
  { id: "43", name: "Social Feed Block", type: "Block", publishStatus: "Published", workflowStatus: "approved", modifiedBy: getRandomName("43"), language: "en", lastModified: "Dec 9, 2024" },
  { id: "44", name: "Leaderboard Widget Block", type: "Block", publishStatus: "Published", workflowStatus: "approved", modifiedBy: getRandomName("44"), language: "en", lastModified: "Dec 8, 2024" },
  { id: "45", name: "Stats Summary Block", type: "Block", publishStatus: "Published", workflowStatus: "approved", modifiedBy: getRandomName("45"), language: "en", lastModified: "Dec 7, 2024" },
  { id: "46", name: "Upcoming Events Block", type: "Block", publishStatus: "Published", workflowStatus: "approved", modifiedBy: getRandomName("46"), language: "en", lastModified: "Dec 6, 2024" },
  { id: "47", name: "Testimonial Carousel Block", type: "Block", publishStatus: "Published", workflowStatus: "approved", modifiedBy: getRandomName("47"), language: "en", lastModified: "Dec 5, 2024" },
  { id: "48", name: "Payment Plans Block", type: "Block", publishStatus: "Published", workflowStatus: "approved", modifiedBy: getRandomName("48"), language: "en", lastModified: "Dec 4, 2024" },
  { id: "49", name: "Mountain Pass Scenery - Image", type: "Image", publishStatus: "Published", workflowStatus: "approved", modifiedBy: getRandomName("49"), language: "en", lastModified: "Dec 3, 2024" },
  { id: "50", name: "Pro Cyclist In Action - Image", type: "Image", publishStatus: "Published", workflowStatus: "approved", modifiedBy: getRandomName("50"), language: "en", lastModified: "Dec 2, 2024" },
];
