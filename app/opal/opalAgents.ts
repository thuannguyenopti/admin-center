import type { AgentBarAgent } from "@/app/components/Opal/AgentBar";

export type FeaturedAgent = AgentBarAgent & { id: string; handle: string };

export const FEATURED_AGENTS: FeaturedAgent[] = [
  { id: "email_gen_agent", emoji: "✍️", name: "Email campaign writer", handle: "@email_gen_agent", subtitle: "Write an email campaign for your product or feature" },
  { id: "ab_test", emoji: "🧪", name: "A/B experiment setup", handle: "@ab_test", subtitle: "Design and launch an A/B test for your page" },
  { id: "competitors_are_dust", emoji: "📊", name: "Competitor analysis", handle: "@competitors_are_dust", subtitle: "Analyze and compare competitor positioning" },
  { id: "campaign_agent", emoji: "🌐", name: "Campaign planner", handle: "@campaign_agent", subtitle: "Plan and strategize marketing campaigns" },
  { id: "audience_agent", emoji: "🎯", name: "Audience segmentation", handle: "@audience_agent", subtitle: "Identify and target the right audience segments" },
  { id: "social_media_pro", emoji: "📱", name: "Social media pro", handle: "@social_media_pro", subtitle: "Create and repurpose content for social media" },
  { id: "ad_variations_agent", emoji: "⚡", name: "Ad variations", handle: "@ad_variations_agent", subtitle: "Generate ad copy variations for your campaigns" },
  { id: "brief_to_campaign", emoji: "🚀", name: "Brief to campaign", handle: "@brief_to_campaign", subtitle: "Turn a brief or case study into a full campaign" },
];
