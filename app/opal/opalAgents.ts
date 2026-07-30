<<<<<<< HEAD
import type { AgentBarAgent } from "@/app/components/Opal/AgentBar";

export type FeaturedAgent = AgentBarAgent & { id: string; handle: string };

export const FEATURED_AGENTS: FeaturedAgent[] = [
  { id: "content_creation", emoji: "✏️", name: "Content editor", handle: "@content_creation", subtitle: "Edit and update your current page content" },
  { id: "email_gen_agent", emoji: "✍️", name: "Email campaign writer", handle: "@email_gen_agent", subtitle: "Write an email campaign for your product or feature" },
  { id: "ab_test", emoji: "🧪", name: "A/B experiment setup", handle: "@ab_test", subtitle: "Design and launch an A/B test for your page" },
  { id: "competitors_are_dust", emoji: "📊", name: "Competitor analysis", handle: "@competitors_are_dust", subtitle: "Analyze and compare competitor positioning" },
  { id: "campaign_agent", emoji: "🌐", name: "Campaign planner", handle: "@campaign_agent", subtitle: "Plan and strategize marketing campaigns" },
  { id: "audience_agent", emoji: "🎯", name: "Audience segmentation", handle: "@audience_agent", subtitle: "Identify and target the right audience segments" },
  { id: "social_media_pro", emoji: "📱", name: "Social media pro", handle: "@social_media_pro", subtitle: "Create and repurpose content for social media" },
  { id: "ad_variations_agent", emoji: "⚡", name: "Ad variations", handle: "@ad_variations_agent", subtitle: "Generate ad copy variations for your campaigns" },
  { id: "brief_to_campaign", emoji: "🚀", name: "Brief to campaign", handle: "@brief_to_campaign", subtitle: "Turn a brief or case study into a full campaign" },
];

/** Starter prompt templates shown in the input after an agent is activated. */
export const AGENT_PROMPTS: Record<string, string> = {
  content_creation:      "Update [element/section] to [desired change]",
  email_gen_agent:       "Write an email campaign for [product or feature] targeting [audience] with the goal of [campaign goal]",
  ab_test:               "Set up an A/B test for [page or element] to test [hypothesis], measuring [success metric]",
  competitors_are_dust:  "Analyze competitors for [your product or market] focusing on [positioning / pricing / features]",
  campaign_agent:        "Plan a marketing campaign for [product or service] targeting [audience], launching [date]",
  audience_agent:        "Identify and segment audiences for [product or service] based on [behavioral / demographic criteria]",
  social_media_pro:      "Create [platform] content for [product or topic] targeting [audience] for [week / campaign]",
  ad_variations_agent:   "Generate ad copy variations for [product or service] on [platform] with the goal of [objective]",
  brief_to_campaign:     "Turn this brief into a full campaign: [paste your brief or case study here]",
};
=======
import type { AgentBarAgent } from "@/app/components/Opal/AgentBar";

export type FeaturedAgent = AgentBarAgent & { id: string; handle: string };

export const FEATURED_AGENTS: FeaturedAgent[] = [
  { id: "content_creation", emoji: "✏️", name: "Content editor", handle: "@content_creation", subtitle: "Edit and update your current page content" },
  { id: "email_gen_agent", emoji: "✍️", name: "Email campaign writer", handle: "@email_gen_agent", subtitle: "Write an email campaign for your product or feature" },
  { id: "ab_test", emoji: "🧪", name: "A/B experiment setup", handle: "@ab_test", subtitle: "Design and launch an A/B test for your page" },
  { id: "competitors_are_dust", emoji: "📊", name: "Competitor analysis", handle: "@competitors_are_dust", subtitle: "Analyze and compare competitor positioning" },
  { id: "campaign_agent", emoji: "🌐", name: "Campaign planner", handle: "@campaign_agent", subtitle: "Plan and strategize marketing campaigns" },
  { id: "audience_agent", emoji: "🎯", name: "Audience segmentation", handle: "@audience_agent", subtitle: "Identify and target the right audience segments" },
  { id: "social_media_pro", emoji: "📱", name: "Social media pro", handle: "@social_media_pro", subtitle: "Create and repurpose content for social media" },
  { id: "ad_variations_agent", emoji: "⚡", name: "Ad variations", handle: "@ad_variations_agent", subtitle: "Generate ad copy variations for your campaigns" },
  { id: "brief_to_campaign", emoji: "🚀", name: "Brief to campaign", handle: "@brief_to_campaign", subtitle: "Turn a brief or case study into a full campaign" },
];

/** Starter prompt templates shown in the input after an agent is activated. */
export const AGENT_PROMPTS: Record<string, string> = {
  content_creation:      "Update [element/section] to [desired change]",
  email_gen_agent:       "Write an email campaign for [product or feature] targeting [audience] with the goal of [campaign goal]",
  ab_test:               "Set up an A/B test for [page or element] to test [hypothesis], measuring [success metric]",
  competitors_are_dust:  "Analyze competitors for [your product or market] focusing on [positioning / pricing / features]",
  campaign_agent:        "Plan a marketing campaign for [product or service] targeting [audience], launching [date]",
  audience_agent:        "Identify and segment audiences for [product or service] based on [behavioral / demographic criteria]",
  social_media_pro:      "Create [platform] content for [product or topic] targeting [audience] for [week / campaign]",
  ad_variations_agent:   "Generate ad copy variations for [product or service] on [platform] with the goal of [objective]",
  brief_to_campaign:     "Turn this brief into a full campaign: [paste your brief or case study here]",
};
>>>>>>> origin/main
