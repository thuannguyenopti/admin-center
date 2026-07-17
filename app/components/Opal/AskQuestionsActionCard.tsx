"use client";

import { Box, Button } from "@optiaxiom/react";
import { IconPen } from "@optimizely/axiom-icons";
import { Text } from "../Text";
import { useState } from "react";

const SKIP_SENTINEL = "__skipped__";

type Question = {
  id: string;
  label: string;
  options: { value: string; label: string; description?: string }[];
};

type AskQuestionsActionCardProps = {
  title: string;
  description?: string;
  questions: Question[];
  submitLabel?: string;
  onSubmit?: (answers: Record<string, string>) => void;
};

export function AskQuestionsActionCard({
  title,
  description,
  questions,
  submitLabel = "Confirm",
  onSubmit,
}: AskQuestionsActionCardProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [customOpen, setCustomOpen] = useState<Record<string, boolean>>({});
  const [customDraft, setCustomDraft] = useState<Record<string, string>>({});

  const handleAutoConfirm = () => {
    if (submitted) return;
    const filled: Record<string, string> = { ...answers };
    for (const q of questions) {
      if (!filled[q.id] && q.options[0]) {
        filled[q.id] = q.options[0].value;
      }
    }
    setAnswers(filled);
    setTimeout(() => {
      setSubmitted(true);
      onSubmit?.(filled);
    }, 350);
  };

  const AutoConfirmButton = (
    <Button
      appearance="subtle"
      size="md"
      onClick={handleAutoConfirm}
      disabled={submitted}
      style={{ flexShrink: 0 }}
    >
      Auto confirm
    </Button>
  );

  const allAnswered = questions.every((q) => answers[q.id]);

  const handleSubmit = () => {
    if (!allAnswered) return;
    setSubmitted(true);
    onSubmit?.(answers);
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      bg="bg.default"
      rounded="lg"
      style={{
        border: "1px solid var(--ax-colors-border-default)",
        padding: 20,
        gap: 16,
        width: "100%",
      }}
    >
      <Box display="flex" flexDirection="column" gap="4">
        <Text style={{ fontSize: 16, fontWeight: 500, lineHeight: 1.5, color: "var(--ax-colors-fg-default)" }}>
          {title}
        </Text>
        {description && (
          <Text style={{ fontSize: 13, color: "var(--ax-colors-fg-secondary)", lineHeight: 1.4 }}>
            {description}
          </Text>
        )}
      </Box>

      <style>{`
        @keyframes askQuestionsReveal {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <Box display="flex" flexDirection="column">
        {questions.map((q, qIdx) => {
          const selected = answers[q.id];
          const prevAnswered = qIdx === 0 || !!answers[questions[qIdx - 1].id];
          if (!prevAnswered) return null;
          return (
            <Box
              key={q.id}
              display="flex"
              flexDirection="column"
              gap="0"
              style={{
                animation: qIdx === 0
                  ? undefined
                  : "askQuestionsReveal 0.25s cubic-bezier(0.16,1,0.3,1) both",
                marginTop: qIdx === 0 ? 0 : 12,
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: "var(--ax-colors-fg-default)",
                  paddingLeft: 4,
                  paddingBottom: 8,
                }}
              >
                {q.label}
              </Text>
              {q.options.map((opt, oIdx) => {
                const isSelected = selected === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    disabled={submitted}
                    onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: opt.value }))}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                      padding: "12px",
                      border: "none",
                      borderBottom: isSelected
                        ? "2px solid transparent"
                        : "2px solid var(--ax-colors-border-secondary)",
                      borderRadius: isSelected ? 8 : 0,
                      background: isSelected
                        ? "var(--ax-colors-bg-default-hovered)"
                        : "transparent",
                      cursor: submitted ? "default" : "pointer",
                      textAlign: "left",
                      fontFamily: "inherit",
                      width: "100%",
                      opacity: submitted && !isSelected ? 0.4 : 1,
                      transition: "background 0.2s ease, border-radius 0.2s ease, border-color 0.2s ease, opacity 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      if (!submitted && !isSelected) {
                        e.currentTarget.style.background = "var(--ax-colors-bg-default-hovered)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!submitted && !isSelected) {
                        e.currentTarget.style.background = "transparent";
                      }
                    }}
                  >
                    <span
                      style={{
                        flexShrink: 0,
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "var(--ax-colors-bg-accent-subtle)",
                        color: "var(--ax-colors-fg-accent)",
                        fontSize: 14,
                        fontWeight: 500,
                        lineHeight: 1,
                      }}
                    >
                      {oIdx + 1}
                    </span>
                    <span style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1, minWidth: 0 }}>
                      <Text style={{ fontSize: 14, fontWeight: 400, color: "var(--ax-colors-fg-default)", lineHeight: 1.43 }}>
                        {opt.label}
                      </Text>
                      {opt.description && (
                        <Text style={{ fontSize: 13, color: "var(--ax-colors-fg-tertiary)", lineHeight: 1.4 }}>
                          {opt.description}
                        </Text>
                      )}
                    </span>
                  </button>
                );
              })}
              {/* "Type something" row — pencil icon + free-form input + Skip */}
              {(() => {
                const isCustomOpen = !!customOpen[q.id];
                const draft = customDraft[q.id] ?? "";
                const isCustomSelected =
                  selected !== undefined &&
                  selected !== SKIP_SENTINEL &&
                  !q.options.some((o) => o.value === selected);
                return (
                  <Box
                    display="flex"
                    alignItems="center"
                    gap="16"
                    style={{
                      padding: "12px",
                      opacity: submitted && !isCustomSelected ? 0.4 : 1,
                      transition: "opacity 0.2s ease",
                    }}
                  >
                    <span
                      style={{
                        flexShrink: 0,
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: isCustomSelected
                          ? "var(--ax-colors-bg-accent)"
                          : "var(--ax-colors-bg-accent-subtle)",
                        color: isCustomSelected
                          ? "var(--ax-colors-fg-accent-on-accent, #FFFFFF)"
                          : "var(--ax-colors-fg-accent)",
                        transition: "background 0.2s ease",
                      }}
                    >
                      <IconPen size={16} />
                    </span>
                    {isCustomOpen || isCustomSelected ? (
                      <input
                        type="text"
                        autoFocus={isCustomOpen && !isCustomSelected}
                        value={isCustomSelected && !isCustomOpen ? (selected ?? "") : draft}
                        disabled={submitted}
                        placeholder="Type your answer…"
                        onChange={(e) =>
                          setCustomDraft((prev) => ({ ...prev, [q.id]: e.target.value }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && draft.trim()) {
                            setAnswers((prev) => ({ ...prev, [q.id]: draft.trim() }));
                            setCustomOpen((prev) => ({ ...prev, [q.id]: false }));
                          } else if (e.key === "Escape") {
                            setCustomOpen((prev) => ({ ...prev, [q.id]: false }));
                          }
                        }}
                        onBlur={() => {
                          if (draft.trim()) {
                            setAnswers((prev) => ({ ...prev, [q.id]: draft.trim() }));
                          }
                          setCustomOpen((prev) => ({ ...prev, [q.id]: false }));
                        }}
                        style={{
                          flex: 1,
                          minWidth: 0,
                          padding: "6px 8px",
                          fontSize: 14,
                          fontFamily: "inherit",
                          border: "1px solid var(--ax-colors-border-default)",
                          borderRadius: 6,
                          background: "var(--ax-colors-bg-default)",
                          color: "var(--ax-colors-fg-default)",
                          outline: "none",
                        }}
                      />
                    ) : (
                      <button
                        type="button"
                        disabled={submitted}
                        onClick={() =>
                          setCustomOpen((prev) => ({ ...prev, [q.id]: true }))
                        }
                        style={{
                          flex: 1,
                          minWidth: 0,
                          padding: 0,
                          border: "none",
                          background: "transparent",
                          cursor: submitted ? "default" : "pointer",
                          textAlign: "left",
                          fontFamily: "inherit",
                        }}
                      >
                        <Text style={{ fontSize: 14, fontWeight: 400, color: "var(--ax-colors-fg-tertiary)", lineHeight: 1.43 }}>
                          Something else
                        </Text>
                      </button>
                    )}
                    {!submitted && selected === undefined && (
                      <Box display="flex" alignItems="center" gap="12" style={{ flexShrink: 0 }}>
                        {AutoConfirmButton}
                        <Button
                          size="md"
                          onClick={() => {
                            setAnswers((prev) => ({ ...prev, [q.id]: SKIP_SENTINEL }));
                            setCustomOpen((prev) => ({ ...prev, [q.id]: false }));
                          }}
                        >
                          Skip
                        </Button>
                      </Box>
                    )}
                  </Box>
                );
              })()}
            </Box>
          );
        })}
      </Box>

      {(submitted || allAnswered) && (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="flex-end"
          gap="12"
          style={{
            animation: submitted
              ? undefined
              : "askQuestionsReveal 0.25s cubic-bezier(0.16,1,0.3,1) both",
          }}
        >
          {submitted ? (
            <Text fontSize="sm" fontWeight="500" color="fg.success">
              Submitted — Tony is on it
            </Text>
          ) : (
            <>
              {AutoConfirmButton}
              <Button appearance="primary" size="md" onClick={handleSubmit}>
                {submitLabel}
              </Button>
            </>
          )}
        </Box>
      )}
    </Box>
  );
}
