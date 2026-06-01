export type CampaignMetric = "awareness" | "conversion" | "retention" | "education";

export type CampaignMetricDefinition = {
  id: CampaignMetric;
  name: string;
  description: string;
  icon: string; // Icon component name
};

export const CAMPAIGN_METRICS: CampaignMetricDefinition[] = [
  { id: "awareness", name: "Awareness", description: "Reach and impressions", icon: "IconEye" },
  { id: "conversion", name: "Conversion", description: "Drive purchases or signups", icon: "IconTarget" },
  { id: "retention", name: "Retention", description: "Re-engage existing customers", icon: "IconRefresh" },
  { id: "education", name: "Education", description: "Inform and educate audience", icon: "IconSchool" },
];
