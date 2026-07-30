<<<<<<< HEAD
"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Box, Button, Group, Heading, Text } from "@optiaxiom/react";
import { useRouter } from "next/navigation";
import { IconArrowLeft, IconSparkles, IconPlugConnected, IconRobot } from "@tabler/icons-react";
import { IconAgent } from "@optimizely/axiom-icons";
import { OpalChatView } from "@/app/components/Opal/OpalChatView";
import type { ChatMessage } from "@/app/hooks/useOpalState";
import type { AgentDisplayCardBlockMetadata } from "@/app/components/ai/blocks/AgentDisplayCardBlock";
import type { AgentInteractiveCardBlockMetadata } from "@/app/components/ai/blocks/AgentInteractiveCardBlock";
import type { AgentQuestionSurveyBlockMetadata, AgentSurveyOption } from "@/app/components/ai/blocks/AgentQuestionSurveyBlock";

const DEFAULT_TOOLS = ["Figma", "Google Drive", "Web research", "Brand guidelines"];

function createMessage(
  partial: Omit<ChatMessage, "id" | "timestamp">
): ChatMessage {
  return {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    ...partial,
  };
}

export function BuildWithOpalPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [awaitingCustomRequest, setAwaitingCustomRequest] = useState(false);
  const initializedRef = useRef(false);

  const appendMessages = useCallback((nextMessages: ChatMessage[]) => {
    setMessages((current) => [...current, ...nextMessages]);
  }, []);

  const pushInteractiveCard = useCallback(
    (defaults?: Partial<Pick<AgentInteractiveCardBlockMetadata, "defaultGoal" | "defaultName" | "defaultAudience" | "defaultTools">>) => {
      const metadata: AgentInteractiveCardBlockMetadata = {
        blockType: "agent-interactive-card",
        title: "Build your agent brief",
        description: "Use a lightweight brief here in chat, then iterate before you open the full editor.",
        defaultName: defaults?.defaultName,
        defaultGoal: defaults?.defaultGoal,
        defaultAudience: defaults?.defaultAudience,
        defaultTools: defaults?.defaultTools ?? DEFAULT_TOOLS.slice(0, 2),
        toolOptions: DEFAULT_TOOLS,
        submitLabel: "Create draft",
        onSubmit: ({ name, goal, audience, tools }) => {
          appendMessages([
            createMessage({
              role: "user",
              content: `Build "${name}" for ${audience || "my team"} using ${tools.length ? tools.join(", ") : "Opal defaults"}.`,
            }),
            createMessage({
              role: "assistant",
              content: `Here’s a solid starting point for \`${name}\`:\n\n- Goal: ${goal}\n- Audience: ${audience || "Not specified yet"}\n- Tools: ${tools.length ? tools.join(", ") : "Opal defaults"}\n\nNext, we can refine the prompt, add tool permissions, and decide whether this should be available directly in chat.`,
            }),
          ]);
        },
      };

      appendMessages([
        createMessage({
          role: "assistant",
          content: "",
          messageType: metadata.blockType,
          metadata,
        }),
      ]);
    },
    [appendMessages]
  );

  const pushDisplayCard = useCallback(
    (metadata: AgentDisplayCardBlockMetadata) => {
      appendMessages([
        createMessage({
          role: "assistant",
          content: "",
          messageType: metadata.blockType,
          metadata,
        }),
      ]);
    },
    [appendMessages]
  );

  const handleSurveySelect = useCallback(
    (option: AgentSurveyOption) => {
      setAwaitingCustomRequest(false);

      appendMessages([
        createMessage({
          role: "user",
          content: option.label,
        }),
      ]);

      if (option.id === "learn") {
        appendMessages([
          createMessage({
            role: "assistant",
            content:
              "A good first build keeps the job narrow, chooses only the tools it truly needs, and stays available in chat so the team can iterate quickly.",
          }),
        ]);
        pushDisplayCard({
          blockType: "agent-display-card",
          eyebrow: "Starter paths",
          title: "Good starting points inside Opal",
          description: "Pick a pattern, then shape it in chat before you open deeper configuration.",
          items: [
            {
              id: "onboarding-guide",
              title: "Opal onboarding guide",
              description: "Help new teammates learn navigation, prompts, and agent handoff patterns.",
              icon: <IconSparkles size={18} />,
              ctaLabel: "Use this",
              onCta: () =>
                pushInteractiveCard({
                  defaultName: "Opal onboarding guide",
                  defaultGoal: "Guide new users through Opal capabilities, recommended first prompts, and when to use agents versus standard chat.",
                  defaultAudience: "New Opal users",
                }),
            },
            {
              id: "tool-setup",
              title: "Connector setup coach",
              description: "Recommend the most relevant integrations for a team’s workflow.",
              icon: <IconPlugConnected size={18} />,
              ctaLabel: "Use this",
              onCta: () =>
                pushInteractiveCard({
                  defaultName: "Connector setup coach",
                  defaultGoal: "Recommend the best connectors for the user's workflow and explain why each one matters before setup.",
                  defaultAudience: "Admins and agent builders",
                  defaultTools: ["Google Drive", "Figma", "Web research"],
                }),
            },
          ],
        });
        return;
      }

      if (option.id === "connect") {
        appendMessages([
          createMessage({
            role: "assistant",
            content:
              "For agent-building, I’d start with the tools that sharpen context instead of overwhelming the flow.",
          }),
        ]);
        pushDisplayCard({
          blockType: "agent-display-card",
          eyebrow: "Recommended tools",
          title: "Connect these first",
          description: "These give Opal stronger context during agent creation and testing.",
          items: [
            {
              id: "figma",
              title: "Figma",
              description: "Pull design references and implementation context directly into the build loop.",
              icon: "F",
              ctaLabel: "Add to brief",
              onCta: () =>
                pushInteractiveCard({
                  defaultGoal: "Build an agent that uses design context to guide creative and UX tasks.",
                  defaultTools: ["Figma", "Brand guidelines"],
                }),
            },
            {
              id: "drive",
              title: "Google Drive",
              description: "Bring briefs, docs, and research into the chat workflow.",
              icon: "G",
              ctaLabel: "Add to brief",
              onCta: () =>
                pushInteractiveCard({
                  defaultGoal: "Create an agent that reads briefs and references from shared docs before responding.",
                  defaultTools: ["Google Drive", "Web research"],
                }),
            },
            {
              id: "research",
              title: "Web research",
              description: "Use fresh context when the agent needs to compare competitors or pull current information.",
              icon: <IconRobot size={18} />,
              ctaLabel: "Add to brief",
              onCta: () =>
                pushInteractiveCard({
                  defaultGoal: "Create an agent that combines internal context with lightweight web research for recommendations.",
                  defaultTools: ["Web research", "Brand guidelines"],
                }),
            },
          ],
          footerText: "Need something else?",
          footerLinkLabel: "Start with a custom brief",
          onFooterClick: () => pushInteractiveCard(),
        });
        return;
      }

      if (option.id === "recommend") {
        appendMessages([
          createMessage({
            role: "assistant",
            content:
              "Based on the most common marketing-builder needs, these are the strongest starter agents to prototype in chat.",
          }),
        ]);
        pushDisplayCard({
          blockType: "agent-display-card",
          eyebrow: "Suggested agents",
          title: "Agents worth building first",
          items: [
            {
              id: "brief-assistant",
              title: "Campaign brief assistant",
              description: "Turn loose requests into structured briefs, prompts, and handoff notes.",
              icon: <IconAgent size={18} />,
              ctaLabel: "Customize",
              onCta: () =>
                pushInteractiveCard({
                  defaultName: "Campaign brief assistant",
                  defaultGoal: "Turn rough campaign goals into structured creative briefs with recommended prompts and deliverables.",
                  defaultAudience: "Marketing managers",
                }),
            },
            {
              id: "research-agent",
              title: "Competitor pulse agent",
              description: "Summarize competitor changes and surface actions the team should take.",
              icon: <IconSparkles size={18} />,
              ctaLabel: "Customize",
              onCta: () =>
                pushInteractiveCard({
                  defaultName: "Competitor pulse agent",
                  defaultGoal: "Review competitor messaging and summarize the most actionable changes for our team.",
                  defaultAudience: "Growth and content teams",
                  defaultTools: ["Web research", "Google Drive"],
                }),
            },
          ],
        });
        return;
      }

      setAwaitingCustomRequest(true);
      appendMessages([
        createMessage({
          role: "assistant",
          content:
            "Tell me what you want the agent to do, and I’ll turn it into a draft brief here in chat. If you’d rather skip ahead, you can also fill in the brief card below.",
        }),
      ]);
      pushInteractiveCard();
    },
    [appendMessages, pushDisplayCard, pushInteractiveCard]
  );

  const pushInitialSurvey = useCallback(() => {
    const metadata: AgentQuestionSurveyBlockMetadata = {
      blockType: "agent-question-survey",
      title: "What would you like help with today?",
      progressLabel: "1 of 2",
      onDismiss: () => router.push("/opal/agents"),
      onSelect: handleSurveySelect,
      options: [
        { id: "learn", label: "I would like to learn how to use Opal", prefix: "1" },
        { id: "connect", label: "Tell me what tools I should connect", prefix: "2" },
        { id: "recommend", label: "Recommend an agent for me", prefix: "3" },
      ],
      customOption: {
        label: "Something else",
        buttonLabel: "Skip",
        icon: "✎",
        onSelect: () => handleSurveySelect({ id: "custom", label: "Something else" }),
      },
    };

    setMessages([
      createMessage({
        role: "assistant",
        content: "Let’s build an agent in chat and keep the brief lightweight until you’re ready for the full editor.",
      }),
      createMessage({
        role: "assistant",
        content: "",
        messageType: metadata.blockType,
        metadata,
      }),
    ]);
  }, [handleSurveySelect, router]);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    pushInitialSurvey();
  }, [pushInitialSurvey]);

  const handleSend = (content: string) => {
    const trimmed = content.trim();
    if (!trimmed) return;

    appendMessages([
      createMessage({
        role: "user",
        content: trimmed,
      }),
    ]);
    setInputValue("");

    if (awaitingCustomRequest) {
      setAwaitingCustomRequest(false);
      appendMessages([
        createMessage({
          role: "assistant",
          content: "Nice direction. I turned that into a draft brief so you can refine it in the same chat flow.",
        }),
      ]);
      pushInteractiveCard({
        defaultGoal: trimmed,
      });
      return;
    }

    appendMessages([
      createMessage({
        role: "assistant",
        content:
          "I can keep shaping that with you here. If you want, answer the survey card above or fill in the brief card to turn this into a concrete agent draft.",
      }),
    ]);
  };

  return (
    <Box display="flex" flexDirection="column" h="full" overflow="hidden">
      <Box px="24" pt="24" pb="12" borderB="1" borderColor="border.tertiary">
        <Button appearance="subtle" size="sm" onClick={() => router.push("/opal/agents")}>
          <IconArrowLeft size={14} />
          Back to Agents
        </Button>
        <Box mt="12">
          <Heading level="1" fontSize="2xl">
            Build with Opal
          </Heading>
          <Text color="fg.secondary" mt="4">
            Start in the chat window, use action cards to shape the brief, and move into deeper configuration only when you need it.
          </Text>
        </Box>
      </Box>

      <Box flex="1" px="24" pb="24" pt="16" style={{ minHeight: 0 }}>
        <Box
          border="1"
          borderColor="border.default"
          rounded="xl"
          h="full"
          overflow="hidden"
          bg="bg.page"
        >
          <OpalChatView
            variant="assistant"
            messages={messages}
            inputValue={inputValue}
            isLoading={false}
            setInputValue={setInputValue}
            onSend={handleSend}
            onSuggestionClick={handleSend}
          />
        </Box>
      </Box>
    </Box>
  );
}
=======
"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Box, Button, Group, Heading, Text } from "@optiaxiom/react";
import { useRouter } from "next/navigation";
import {IconArrowLeft, IconSparkles, IconRobot} from "@optimizely/axiom-icons";
import {IconPlugConnected} from "@/app/lib/axiom-icons";
import { IconAgent } from "@optimizely/axiom-icons";
import { OpalChatView } from "@/app/components/Opal/OpalChatView";
import type { ChatMessage } from "@/app/hooks/useOpalState";
import type { AgentDisplayCardBlockMetadata } from "@/app/components/ai/blocks/AgentDisplayCardBlock";
import type { AgentInteractiveCardBlockMetadata } from "@/app/components/ai/blocks/AgentInteractiveCardBlock";
import type { AgentQuestionSurveyBlockMetadata, AgentSurveyOption } from "@/app/components/ai/blocks/AgentQuestionSurveyBlock";

const DEFAULT_TOOLS = ["Figma", "Google Drive", "Web research", "Brand guidelines"];

function createMessage(
  partial: Omit<ChatMessage, "id" | "timestamp">
): ChatMessage {
  return {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    ...partial,
  };
}

export function BuildWithOpalPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [awaitingCustomRequest, setAwaitingCustomRequest] = useState(false);
  const initializedRef = useRef(false);

  const appendMessages = useCallback((nextMessages: ChatMessage[]) => {
    setMessages((current) => [...current, ...nextMessages]);
  }, []);

  const pushInteractiveCard = useCallback(
    (defaults?: Partial<Pick<AgentInteractiveCardBlockMetadata, "defaultGoal" | "defaultName" | "defaultAudience" | "defaultTools">>) => {
      const metadata: AgentInteractiveCardBlockMetadata = {
        blockType: "agent-interactive-card",
        title: "Build your agent brief",
        description: "Use a lightweight brief here in chat, then iterate before you open the full editor.",
        defaultName: defaults?.defaultName,
        defaultGoal: defaults?.defaultGoal,
        defaultAudience: defaults?.defaultAudience,
        defaultTools: defaults?.defaultTools ?? DEFAULT_TOOLS.slice(0, 2),
        toolOptions: DEFAULT_TOOLS,
        submitLabel: "Create draft",
        onSubmit: ({ name, goal, audience, tools }) => {
          appendMessages([
            createMessage({
              role: "user",
              content: `Build "${name}" for ${audience || "my team"} using ${tools.length ? tools.join(", ") : "Opal defaults"}.`,
            }),
            createMessage({
              role: "assistant",
              content: `Here’s a solid starting point for \`${name}\`:\n\n- Goal: ${goal}\n- Audience: ${audience || "Not specified yet"}\n- Tools: ${tools.length ? tools.join(", ") : "Opal defaults"}\n\nNext, we can refine the prompt, add tool permissions, and decide whether this should be available directly in chat.`,
            }),
          ]);
        },
      };

      appendMessages([
        createMessage({
          role: "assistant",
          content: "",
          messageType: metadata.blockType,
          metadata,
        }),
      ]);
    },
    [appendMessages]
  );

  const pushDisplayCard = useCallback(
    (metadata: AgentDisplayCardBlockMetadata) => {
      appendMessages([
        createMessage({
          role: "assistant",
          content: "",
          messageType: metadata.blockType,
          metadata,
        }),
      ]);
    },
    [appendMessages]
  );

  const handleSurveySelect = useCallback(
    (option: AgentSurveyOption) => {
      setAwaitingCustomRequest(false);

      appendMessages([
        createMessage({
          role: "user",
          content: option.label,
        }),
      ]);

      if (option.id === "learn") {
        appendMessages([
          createMessage({
            role: "assistant",
            content:
              "A good first build keeps the job narrow, chooses only the tools it truly needs, and stays available in chat so the team can iterate quickly.",
          }),
        ]);
        pushDisplayCard({
          blockType: "agent-display-card",
          eyebrow: "Starter paths",
          title: "Good starting points inside Opal",
          description: "Pick a pattern, then shape it in chat before you open deeper configuration.",
          items: [
            {
              id: "onboarding-guide",
              title: "Opal onboarding guide",
              description: "Help new teammates learn navigation, prompts, and agent handoff patterns.",
              icon: <IconSparkles size={18} />,
              ctaLabel: "Use this",
              onCta: () =>
                pushInteractiveCard({
                  defaultName: "Opal onboarding guide",
                  defaultGoal: "Guide new users through Opal capabilities, recommended first prompts, and when to use agents versus standard chat.",
                  defaultAudience: "New Opal users",
                }),
            },
            {
              id: "tool-setup",
              title: "Connector setup coach",
              description: "Recommend the most relevant integrations for a team’s workflow.",
              icon: <IconPlugConnected size={18} />,
              ctaLabel: "Use this",
              onCta: () =>
                pushInteractiveCard({
                  defaultName: "Connector setup coach",
                  defaultGoal: "Recommend the best connectors for the user's workflow and explain why each one matters before setup.",
                  defaultAudience: "Admins and agent builders",
                  defaultTools: ["Google Drive", "Figma", "Web research"],
                }),
            },
          ],
        });
        return;
      }

      if (option.id === "connect") {
        appendMessages([
          createMessage({
            role: "assistant",
            content:
              "For agent-building, I’d start with the tools that sharpen context instead of overwhelming the flow.",
          }),
        ]);
        pushDisplayCard({
          blockType: "agent-display-card",
          eyebrow: "Recommended tools",
          title: "Connect these first",
          description: "These give Opal stronger context during agent creation and testing.",
          items: [
            {
              id: "figma",
              title: "Figma",
              description: "Pull design references and implementation context directly into the build loop.",
              icon: "F",
              ctaLabel: "Add to brief",
              onCta: () =>
                pushInteractiveCard({
                  defaultGoal: "Build an agent that uses design context to guide creative and UX tasks.",
                  defaultTools: ["Figma", "Brand guidelines"],
                }),
            },
            {
              id: "drive",
              title: "Google Drive",
              description: "Bring briefs, docs, and research into the chat workflow.",
              icon: "G",
              ctaLabel: "Add to brief",
              onCta: () =>
                pushInteractiveCard({
                  defaultGoal: "Create an agent that reads briefs and references from shared docs before responding.",
                  defaultTools: ["Google Drive", "Web research"],
                }),
            },
            {
              id: "research",
              title: "Web research",
              description: "Use fresh context when the agent needs to compare competitors or pull current information.",
              icon: <IconRobot size={18} />,
              ctaLabel: "Add to brief",
              onCta: () =>
                pushInteractiveCard({
                  defaultGoal: "Create an agent that combines internal context with lightweight web research for recommendations.",
                  defaultTools: ["Web research", "Brand guidelines"],
                }),
            },
          ],
          footerText: "Need something else?",
          footerLinkLabel: "Start with a custom brief",
          onFooterClick: () => pushInteractiveCard(),
        });
        return;
      }

      if (option.id === "recommend") {
        appendMessages([
          createMessage({
            role: "assistant",
            content:
              "Based on the most common marketing-builder needs, these are the strongest starter agents to prototype in chat.",
          }),
        ]);
        pushDisplayCard({
          blockType: "agent-display-card",
          eyebrow: "Suggested agents",
          title: "Agents worth building first",
          items: [
            {
              id: "brief-assistant",
              title: "Campaign brief assistant",
              description: "Turn loose requests into structured briefs, prompts, and handoff notes.",
              icon: <IconAgent size={18} />,
              ctaLabel: "Customize",
              onCta: () =>
                pushInteractiveCard({
                  defaultName: "Campaign brief assistant",
                  defaultGoal: "Turn rough campaign goals into structured creative briefs with recommended prompts and deliverables.",
                  defaultAudience: "Marketing managers",
                }),
            },
            {
              id: "research-agent",
              title: "Competitor pulse agent",
              description: "Summarize competitor changes and surface actions the team should take.",
              icon: <IconSparkles size={18} />,
              ctaLabel: "Customize",
              onCta: () =>
                pushInteractiveCard({
                  defaultName: "Competitor pulse agent",
                  defaultGoal: "Review competitor messaging and summarize the most actionable changes for our team.",
                  defaultAudience: "Growth and content teams",
                  defaultTools: ["Web research", "Google Drive"],
                }),
            },
          ],
        });
        return;
      }

      setAwaitingCustomRequest(true);
      appendMessages([
        createMessage({
          role: "assistant",
          content:
            "Tell me what you want the agent to do, and I’ll turn it into a draft brief here in chat. If you’d rather skip ahead, you can also fill in the brief card below.",
        }),
      ]);
      pushInteractiveCard();
    },
    [appendMessages, pushDisplayCard, pushInteractiveCard]
  );

  const pushInitialSurvey = useCallback(() => {
    const metadata: AgentQuestionSurveyBlockMetadata = {
      blockType: "agent-question-survey",
      title: "What would you like help with today?",
      progressLabel: "1 of 2",
      onDismiss: () => router.push("/opal/agents"),
      onSelect: handleSurveySelect,
      options: [
        { id: "learn", label: "I would like to learn how to use Opal", prefix: "1" },
        { id: "connect", label: "Tell me what tools I should connect", prefix: "2" },
        { id: "recommend", label: "Recommend an agent for me", prefix: "3" },
      ],
      customOption: {
        label: "Something else",
        buttonLabel: "Skip",
        icon: "✎",
        onSelect: () => handleSurveySelect({ id: "custom", label: "Something else" }),
      },
    };

    setMessages([
      createMessage({
        role: "assistant",
        content: "Let’s build an agent in chat and keep the brief lightweight until you’re ready for the full editor.",
      }),
      createMessage({
        role: "assistant",
        content: "",
        messageType: metadata.blockType,
        metadata,
      }),
    ]);
  }, [handleSurveySelect, router]);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    pushInitialSurvey();
  }, [pushInitialSurvey]);

  const handleSend = (content: string) => {
    const trimmed = content.trim();
    if (!trimmed) return;

    appendMessages([
      createMessage({
        role: "user",
        content: trimmed,
      }),
    ]);
    setInputValue("");

    if (awaitingCustomRequest) {
      setAwaitingCustomRequest(false);
      appendMessages([
        createMessage({
          role: "assistant",
          content: "Nice direction. I turned that into a draft brief so you can refine it in the same chat flow.",
        }),
      ]);
      pushInteractiveCard({
        defaultGoal: trimmed,
      });
      return;
    }

    appendMessages([
      createMessage({
        role: "assistant",
        content:
          "I can keep shaping that with you here. If you want, answer the survey card above or fill in the brief card to turn this into a concrete agent draft.",
      }),
    ]);
  };

  return (
    <Box display="flex" flexDirection="column" h="full" overflow="hidden">
      <Box px="24" pt="24" pb="12" borderB="1" borderColor="border.tertiary">
        <Button appearance="subtle" size="sm" onClick={() => router.push("/opal/agents")} icon={<IconArrowLeft />}>
          Back to Agents
        </Button>
        <Box mt="12">
          <Heading level="1" fontSize="2xl">
            Build with Opal
          </Heading>
          <Text color="fg.secondary" mt="4">
            Start in the chat window, use action cards to shape the brief, and move into deeper configuration only when you need it.
          </Text>
        </Box>
      </Box>

      <Box flex="1" px="24" pb="24" pt="16" style={{ minHeight: 0 }}>
        <Box
          border="1"
          borderColor="border.default"
          rounded="xl"
          h="full"
          overflow="hidden"
          bg="bg.page"
        >
          <OpalChatView
            variant="assistant"
            messages={messages}
            inputValue={inputValue}
            isLoading={false}
            setInputValue={setInputValue}
            onSend={handleSend}
            onSuggestionClick={handleSend}
          />
        </Box>
      </Box>
    </Box>
  );
}
>>>>>>> origin/main
