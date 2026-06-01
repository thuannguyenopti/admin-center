/**
 * API endpoint for AI-powered brief content generation
 * Generates realistic content instances for selected channels using OpenAI GPT-4o and DALL-E 3
 */

import OpenAI from "openai";
import type { ContentInstance } from "@/app/db/cmpInitialData";
import type { BriefWizardInputs } from "@/app/cmp/task/[id]/types";
import { channelDefinitions } from "@/app/cmp/task/[id]/components/publishing/channelDefinitions";
import { REAL_TIME_SEGMENTS } from "@/app/cmp/types/segments";
import { CAMPAIGN_METRICS } from "@/app/cmp/types/metrics";

const openai = process.env.OPENAI_API_KEY
	? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
	: null;

// Company background context for content generation
const COMPANY_CONTEXT = `Stride is a professional sports event company that organizes and manages endurance running events, triathlons, and athletic competitions. We provide comprehensive event management services including race logistics, participant registration, timing systems, and post-race experiences. Our events range from 5K community runs to ultramarathons and IRONMAN-distance triathlons, welcoming participants of all abilities from first-time runners to competitive athletes. We're known for creating well-organized, inclusive sporting events that combine athletic challenge with community building.`;

const EVENT_PHOTOGRAPHY_CONTEXT = `Organized race event photography: professional race setting with branded signage, timing equipment, participant bibs, event tents/infrastructure, race course markers, and support stations. Shows diverse participants - mix of casual runners, age-groupers, and competitive athletes - in motion during a sanctioned sporting event. Captures the inclusive, community atmosphere of organized endurance sports with participants of varying fitness levels and abilities.`;

interface GeneratedContent {
	instances: ContentInstance[];
	channelIds: string[];
}

interface TopicExtractionResult {
	headline: string;
	topics: string[];
	mainTopic: string;
}

// Extract actual topics from value proposition (removing instruction language)
function extractTopics(valueProposition: string): TopicExtractionResult {
	const vpLower = valueProposition.toLowerCase();

	// Remove instruction verbs and extract core topics
	let cleanText = valueProposition
		.replace(/^(write|create|develop|build|generate|produce)\s+(a|an|the)\s+/i, '')
		.replace(/^(in-depth|comprehensive|detailed|complete)\s+/i, '');

	// Extract content inside parentheses as detailed topics
	const parenthesesMatch = valueProposition.match(/\(([^)]+)\)/);
	const detailedTopics = parenthesesMatch
		? parenthesesMatch[1].split(',').map(t => t.trim())
		: [];

	// Extract main topic before parentheses or first phrase
	let mainTopic = '';
	if (vpLower.includes('guide covering')) {
		const match = valueProposition.match(/guide covering\s+([^(\.]+)/i);
		mainTopic = match ? match[1].trim() : '';
	} else if (vpLower.includes('guide to') || vpLower.includes('guide on')) {
		const match = valueProposition.match(/guide (?:to|on)\s+([^(\.]+)/i);
		mainTopic = match ? match[1].trim() : '';
	} else {
		// Get first meaningful phrase
		mainTopic = cleanText.split(/[,.(]/)[0].trim();
	}

	// Create headline from main topic
	const headline = mainTopic.length > 60
		? `The Complete Guide to ${mainTopic.slice(0, 40)}...`
		: `The Complete Guide to ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)}`;

	return {
		headline: headline.replace(/\s+/g, ' ').trim(),
		topics: detailedTopics.length > 0 ? detailedTopics : [mainTopic],
		mainTopic
	};
}

// Generate introductory content about the actual topic
function generateIntroContent(topics: string[], valueProposition: string): string {
	const mainTopic = topics[0] || 'this topic';
	const hasMultipleTopics = topics.length > 1;

	if (hasMultipleTopics) {
		return `Understanding ${mainTopic} is essential for optimal performance and recovery. This comprehensive guide covers ${topics.slice(0, 3).join(', ')}, and more, providing you with evidence-based strategies you can implement immediately.`;
	}

	return `When it comes to ${mainTopic}, the details matter. This guide provides everything you need to know to optimize your approach and achieve better results.`;
}

// Main handler
export async function POST(request: Request) {
	try {
		const body = await request.json();
		const { briefMetadata, taskId, taskName } = body as {
			briefMetadata: BriefWizardInputs;
			taskId: string;
			taskName: string;
		};

		console.log("[Generate Brief Content] Request received:", {
			taskId,
			channels: briefMetadata.selectedChannels?.length || 0,
		});

		if (!openai) {
			console.error("[Generate Brief Content] OpenAI client not initialized");
			return Response.json({ error: "OpenAI API key not configured" }, { status: 500 });
		}

		if (!briefMetadata || !taskId) {
			return Response.json(
				{ error: "briefMetadata and taskId are required" },
				{ status: 400 }
			);
		}

		// Extract topics from value proposition
		const topicData = extractTopics(briefMetadata.valueProposition);
		console.log("[Generate Brief Content] Extracted topics:", topicData);

		const instances: ContentInstance[] = [];

		// Get audience and metric names for context
		const audience = REAL_TIME_SEGMENTS.find(s => s.id === briefMetadata.targetAudience)?.name || "general audience";
		const metric = CAMPAIGN_METRICS.find(m => m.id === briefMetadata.metric)?.name || "engagement";

		// Generate content for each channel
		for (const channelId of briefMetadata.selectedChannels) {
			const channel = channelDefinitions.find((c: any) => c.id === channelId);
			if (!channel) continue;

			console.log(`[Generate Brief Content] Generating for channel: ${channel.name} (${channel.group})`);

			if (channel.group === "Email") {
				const emailContent = await generateEmailContent(topicData, briefMetadata.coreMessage, audience, metric);

				instances.push({
					id: `ci-${Date.now()}-${channelId}`,
					modelId: "cm-email",
					modelDisplayName: "Email",
					createdAt: new Date().toISOString(),
					taskId,
					fields: emailContent,
				});

			} else if (channel.group === "Banner") {
				const bannerContent = await generateBannerContent(topicData, briefMetadata);

				instances.push({
					id: `ci-${Date.now()}-${channelId}`,
					modelId: "cm-banner",
					modelDisplayName: "Banner",
					createdAt: new Date().toISOString(),
					taskId,
					fields: bannerContent,
				});

			} else if (channel.group.includes("CMS")) {
				const blogContent = await generateBlogContent(topicData, briefMetadata, audience, metric);

				// Only create the CMP instance - CMS page will be created via "Add to CMS" flow
				instances.push({
					id: `ci-${Date.now()}-${channelId}`,
					modelId: "cm-blog-post",
					modelDisplayName: "Blog Post",
					createdAt: new Date().toISOString(),
					taskId,
					fields: blogContent,
				});

			} else if (channel.group.includes("WordPress")) {
				const articleContent = await generateArticleContent(topicData, briefMetadata, audience, "wordpress");

				instances.push({
					id: `ci-${Date.now()}-${channelId}`,
					modelId: "cm-article",
					modelDisplayName: "Article",
					createdAt: new Date().toISOString(),
					taskId,
					fields: articleContent,
				});

			} else {
				// For other channels (Social, YouTube, etc.) - create article
				const articleContent = await generateArticleContent(topicData, briefMetadata, audience, channel.name);

				instances.push({
					id: `ci-${Date.now()}-${channelId}`,
					modelId: "cm-article",
					modelDisplayName: "Article",
					createdAt: new Date().toISOString(),
					taskId,
					fields: articleContent,
				});
			}

			// Small delay between channels to avoid rate limits
			await new Promise(resolve => setTimeout(resolve, 100));
		}

		console.log("[Generate Brief Content] Complete:", {
			instances: instances.length,
		});

		return Response.json({
			instances,
			channelIds: briefMetadata.selectedChannels,
		} as GeneratedContent);

	} catch (error) {
		console.error("[Generate Brief Content] Error occurred:", error);
		return Response.json(
			{ error: error instanceof Error ? error.message : "Internal Server Error" },
			{ status: 500 }
		);
	}
}

// Generate email content using AI
async function generateEmailContent(
	topicData: TopicExtractionResult,
	coreMessage: string,
	audience: string,
	metric: string
) {
	try {
		const completion = await openai!.chat.completions.create({
			model: "gpt-4o",
			messages: [
				{
					role: "system",
					content: `You are a professional email copywriter for Stride, a professional sports event company.

Company Background: ${COMPANY_CONTEXT}

Target Audience: ${audience}
Campaign Goal: ${metric}

Guidelines:
- Write about the actual topic, not about creating content
- Reflect Stride's professional event management expertise
- Subject line should be compelling and under 60 characters
- Preheader should complement the subject line
- Email body should be 3-4 paragraphs in HTML format
- Include a clear call-to-action
- Use professional but friendly tone
- Focus on benefits and value to athletes/participants

Respond with a JSON object:
{
  "subject_line": "Subject line here",
  "preheader": "Preheader text here",
  "body": "<p>Email body HTML here</p>",
  "cta_text": "Call to action"
}`,
				},
				{
					role: "user",
					content: `Generate email content about: ${topicData.headline}

Topics to cover: ${topicData.topics.join(', ')}
Core message: ${coreMessage}`,
				},
			],
			temperature: 0.7,
			response_format: { type: "json_object" },
			max_tokens: 1000,
		});

		const result = completion.choices[0]?.message?.content?.trim() || "{}";
		const parsed = JSON.parse(result);

		return {
			subject_line: parsed.subject_line || topicData.headline.slice(0, 60),
			preheader: parsed.preheader || topicData.topics[0],
			from_name: "Marketing Team",
			from_address: "marketing@example.com",
			body: parsed.body || `<p>${coreMessage}</p>`,
			cta_text: parsed.cta_text || "Learn More",
			cta_link: "#",
			footer_text: "Unsubscribe anytime",
			unsubscribe_link: "#",
		};
	} catch (error) {
		console.error("[Generate Brief Content] Email generation error:", error);
		// Fallback to simple template
		return {
			subject_line: topicData.headline.slice(0, 60),
			preheader: topicData.topics[0],
			from_name: "Marketing Team",
			from_address: "marketing@example.com",
			body: `<p>Learn about ${topicData.mainTopic} and discover ${topicData.topics.slice(0, 2).join(' and ')}.</p>`,
			cta_text: "Read More",
			cta_link: "#",
			footer_text: "Unsubscribe anytime",
			unsubscribe_link: "#",
		};
	}
}

// Generate banner content using AI
async function generateBannerContent(topicData: TopicExtractionResult, briefMetadata: BriefWizardInputs) {
	const imageUrl = await generateImage(
		`Wide-angle photograph related to ${topicData.mainTopic}`,
		`Banner for ${topicData.mainTopic}`,
		`${EVENT_PHOTOGRAPHY_CONTEXT} Neutral background suitable for text overlay, shallow depth of field, slightly out of focus background. Professional sports event setting.`,
		briefMetadata.imageGuidelines
	);

	try {
		const completion = await openai!.chat.completions.create({
			model: "gpt-4o",
			messages: [
				{
					role: "system",
					content: `You are a banner ad copywriter. Write concise, compelling banner text.

Guidelines:
- Keep message under 80 characters
- Focus on the core benefit
- Make it attention-grabbing
- Include action-oriented CTA

Respond with a JSON object:
{
  "message": "Banner message here",
  "cta_text": "CTA text"
}`,
				},
				{
					role: "user",
					content: `Generate banner ad copy for: ${topicData.headline}
Core message: ${briefMetadata.coreMessage}`,
				},
			],
			temperature: 0.7,
			response_format: { type: "json_object" },
			max_tokens: 200,
		});

		const result = completion.choices[0]?.message?.content?.trim() || "{}";
		const parsed = JSON.parse(result);

		return {
			message: parsed.message || topicData.headline.slice(0, 80),
			cta_text: parsed.cta_text || "Learn More",
			cta_link: "#",
			background_image: imageUrl,
			dismissible: true,
			display_duration: 5000,
		};
	} catch (error) {
		console.error("[Generate Brief Content] Banner generation error:", error);
		return {
			message: topicData.headline.slice(0, 80),
			cta_text: "Learn More",
			cta_link: "#",
			background_image: imageUrl,
			dismissible: true,
			display_duration: 5000,
		};
	}
}

// Generate blog post content using AI
async function generateBlogContent(
	topicData: TopicExtractionResult,
	briefMetadata: BriefWizardInputs,
	audience: string,
	metric: string
) {
	const heroImage = await generateImage(
		`Documentary photograph showing ${topicData.mainTopic}`,
		`${topicData.headline} hero image`,
		`${EVENT_PHOTOGRAPHY_CONTEXT} Candid moment, subjects not posing, natural body posture, realistic outdoor lighting with visible shadows. Shows athletes/participants during an organized Stride sporting event.`,
		briefMetadata.imageGuidelines
	);

	try {
		const completion = await openai!.chat.completions.create({
			model: "gpt-4o",
			messages: [
				{
					role: "system",
					content: `You are a professional content writer for Stride, a professional sports event company.

Company Background: ${COMPANY_CONTEXT}

Target Audience: ${audience}
Campaign Goal: ${metric}

Guidelines:
- Write ABOUT the topic itself, not about creating content about the topic
- Reflect Stride's expertise in professional event management and endurance sports
- Create an engaging headline (under 70 characters)
- Write 5-6 sections with H2 headings
- Include practical tips and actionable insights relevant to athletes/participants
- Use conversational but professional tone
- Make it informative and valuable
- Each section should have 2-3 paragraphs

Respond with a JSON object:
{
  "headline": "Article headline",
  "excerpt": "Brief summary (150 chars)",
  "body": "<h2>Section 1</h2><p>Content...</p><h2>Section 2</h2>..."
}`,
				},
				{
					role: "user",
					content: `Write a comprehensive blog post about: ${topicData.headline}

Topics to cover: ${topicData.topics.join(', ')}
Core message: ${briefMetadata.coreMessage}`,
				},
			],
			temperature: 0.7,
			response_format: { type: "json_object" },
			max_tokens: 3000,
		});

		const result = completion.choices[0]?.message?.content?.trim() || "{}";
		const parsed = JSON.parse(result);

		return {
			headline: parsed.headline || topicData.headline,
			byline: "Content Team",
			publish_date: new Date().toISOString(),
			excerpt: parsed.excerpt || generateIntroContent(topicData.topics, briefMetadata.valueProposition).slice(0, 150) + "...",
			category: "Guides",
			body: parsed.body || `<h2>Introduction</h2><p>${generateIntroContent(topicData.topics, briefMetadata.valueProposition)}</p>`,
			hero_image: heroImage,
			tags: [],
			seo_keywords: [],
		};
	} catch (error) {
		console.error("[Generate Brief Content] Blog generation error:", error);
		return {
			headline: topicData.headline,
			byline: "Content Team",
			publish_date: new Date().toISOString(),
			excerpt: generateIntroContent(topicData.topics, briefMetadata.valueProposition).slice(0, 150) + "...",
			category: "Guides",
			body: `<h2>Introduction</h2><p>${generateIntroContent(topicData.topics, briefMetadata.valueProposition)}</p>`,
			hero_image: heroImage,
			tags: [],
			seo_keywords: [],
		};
	}
}

// Generate article content using AI
async function generateArticleContent(
	topicData: TopicExtractionResult,
	briefMetadata: BriefWizardInputs,
	audience: string,
	channelName: string
) {
	const heroImage = await generateImage(
		`Documentary photograph showing ${topicData.mainTopic}`,
		`${topicData.headline} article image`,
		`${EVENT_PHOTOGRAPHY_CONTEXT} Candid scene, natural environment, realistic lighting, partially obstructed foreground. Shows athletes/participants during a professional Stride organized event.`,
		briefMetadata.imageGuidelines
	);

	try {
		const completion = await openai!.chat.completions.create({
			model: "gpt-4o",
			messages: [
				{
					role: "system",
					content: `You are a professional content writer for Stride, a professional sports event company. Write articles about the given topic for ${channelName}.

Company Background: ${COMPANY_CONTEXT}

Target Audience: ${audience}

Guidelines:
- Write ABOUT the topic itself
- Create an engaging headline
- Write 3-4 sections with H2/H3 headings
- Include practical insights
- Use conversational tone
- Make it valuable and actionable

Respond with a JSON object:
{
  "headline": "Article headline",
  "subheadline": "Supporting headline",
  "excerpt": "Brief summary (150 chars)",
  "body": "<h2>Section</h2><p>Content...</p>"
}`,
				},
				{
					role: "user",
					content: `Write an article about: ${topicData.headline}

Topics: ${topicData.topics.join(', ')}
Core message: ${briefMetadata.coreMessage}`,
				},
			],
			temperature: 0.7,
			response_format: { type: "json_object" },
			max_tokens: 2000,
		});

		const result = completion.choices[0]?.message?.content?.trim() || "{}";
		const parsed = JSON.parse(result);

		return {
			headline: parsed.headline || topicData.headline,
			subheadline: parsed.subheadline || topicData.topics[0],
			byline: "Content Team",
			body: parsed.body || `<h2>Overview</h2><p>${generateIntroContent(topicData.topics, briefMetadata.valueProposition)}</p>`,
			hero_image: heroImage,
			tags: [],
			excerpt: parsed.excerpt || generateIntroContent(topicData.topics, briefMetadata.valueProposition).slice(0, 150) + "...",
			publish_date: new Date().toISOString(),
			seo_keywords: [],
			related_articles: [],
		};
	} catch (error) {
		console.error("[Generate Brief Content] Article generation error:", error);
		return {
			headline: topicData.headline,
			subheadline: topicData.topics[0],
			byline: "Content Team",
			body: `<h2>Overview</h2><p>${generateIntroContent(topicData.topics, briefMetadata.valueProposition)}</p>`,
			hero_image: heroImage,
			tags: [],
			excerpt: generateIntroContent(topicData.topics, briefMetadata.valueProposition).slice(0, 150) + "...",
			publish_date: new Date().toISOString(),
			seo_keywords: [],
			related_articles: [],
		};
	}
}

// Generate image using DALL-E 3
async function generateImage(
	subjectPrompt: string,
	altText: string,
	backgroundContext: string = "",
	imageGuidelines?: string
): Promise<string> {
	try {
		// Force camera realism with technical specs and imperfections
		const cameraSpecs = "RAW photo, unedited, taken with Sony A7R IV, 85mm lens, f/2.8, ISO 200, natural lighting, realistic dynamic range";
		const imperfections = "slight motion blur, subtle lens distortion, mild chromatic aberration, uneven lighting, natural shadows, minor focus imperfections";
		const composition = "candid shot, casual composition, off-center framing, natural perspective";

		// Subject appearance - use custom guidelines if provided, otherwise use defaults
		const defaultSubjectAppearance = "diverse group of runners, mix of ages and fitness levels, some competitive athletes and some casual participants, healthy appearance, wearing race shirts with bib numbers, proper athletic clothing, race day attire, technical running shirts, athletic jerseys, varied body types representing recreational to competitive runners";
		const subjectAppearance = imageGuidelines || defaultSubjectAppearance;

		// Strong negative constraints (removed body/clothing negatives - use positive descriptors instead)
		const negatives = "not a painting, not stylized, not digital art, not illustration, not CGI, not rendered, no cinematic lighting, no exaggerated colors, no hyperreal glow, no fantasy atmosphere, no HDR, no color grading, no artistic interpretation, no ultra skinny people, no unrealistic body types, no extreme thinness";

		// Construct full prompt: subject + background context + technical details
		// If custom imageGuidelines provided, it replaces the default appearance
		const enhancedPrompt = `${cameraSpecs}. ${composition}. Subject: ${subjectPrompt}, ${subjectAppearance}. Background/Context: ${backgroundContext || "generic outdoor setting"}. ${imperfections}. ${negatives}`;

		console.log(`[Generate Brief Content] Generating image: "${enhancedPrompt.substring(0, 120)}..."`);

		const response = await openai!.images.generate({
			model: "dall-e-3",
			prompt: enhancedPrompt,
			n: 1,
			size: "1024x1024",
			quality: "standard", // Standard quality is less processed/polished than HD
			style: "natural", // Natural style instead of vivid (default)
		});

		const imageUrl = response?.data?.[0]?.url;
		if (imageUrl) {
			return imageUrl;
		}
	} catch (error: any) {
		console.error(`[Generate Brief Content] Image generation error:`, error.message);
	}

	// Fallback to placeholder
	const seed = altText.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40);
	return `https://picsum.photos/seed/${seed}-${Date.now()}/1024/1024`;
}
