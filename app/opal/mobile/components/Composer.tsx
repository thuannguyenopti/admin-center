"use client";

import { useRef, useState } from "react";
import { Box, Button, Tooltip } from "@optiaxiom/react";
import { mobileType } from "../typography";
import {
  IconPlus,
  IconPaperPlaneTop,
  IconBold,
  IconItalic,
  IconUnderline,
  IconListUl,
  IconListOl,
  IconCode,
  IconLink,
} from "@optiaxiom/icons";

type Props = {
  placeholder?: string;
  disabled?: boolean;
  onSend: (text: string) => void;
};

export function Composer({ placeholder = "Message…", disabled = false, onSend }: Props) {
  const [value, setValue] = useState("");
  const [fmtVisible, setFmtVisible] = useState(false);
  const [sendPulsing, setSendPulsing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isEmpty = !value.trim();

  const handleSend = () => {
    if (isEmpty || disabled) return;
    setSendPulsing(true);
    const text = value.trim();
    setValue("");
    setFmtVisible(false);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setTimeout(() => {
      setSendPulsing(false);
      onSend(text);
    }, 160);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    // auto-grow
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  };

  const FmtBtn = ({ icon, label }: { icon: React.ReactNode; label: string }) => (
    <Tooltip content={label}>
      <Button
        appearance="subtle"
        size="sm"
        icon={icon}
        aria-label={label}
        style={{ width: 32, height: 32, padding: 0, color: "var(--ax-colors-fg-secondary)", flexShrink: 0 }}
      />
    </Tooltip>
  );

  return (
    <Box
      style={{
        background: "var(--ax-colors-bg-default)",
        borderTop: "1px solid var(--ax-colors-border-secondary)",
        paddingBottom: 28, // safe area bottom
      }}
    >
      {/* Formatting strip — slides in above composer on focus */}
      {fmtVisible && (
        <Box
          className="mobile-fmt-in"
          display="flex"
          alignItems="center"
          gap="2"
          px="12"
          style={{
            height: 44,
            borderBottom: "1px solid var(--ax-colors-border-secondary)",
            background: "var(--ax-colors-bg-secondary)",
            overflowX: "auto",
          }}
        >
          <FmtBtn icon={<IconBold />} label="Bold" />
          <FmtBtn icon={<IconItalic />} label="Italic" />
          <FmtBtn icon={<IconUnderline />} label="Underline" />
          <Box style={{ width: 1, height: 16, background: "var(--ax-colors-border-secondary)", flexShrink: 0, margin: "0 4px" }} />
          <FmtBtn icon={<IconLink />} label="Link" />
          <FmtBtn icon={<IconListUl />} label="Bullet list" />
          <FmtBtn icon={<IconListOl />} label="Ordered list" />
          <FmtBtn icon={<IconCode />} label="Code" />
        </Box>
      )}

      {/* Main composer row */}
      <Box
        display="flex"
        alignItems="end"
        gap="4"
        px="12"
        pt="10"
        pb="4"
      >
        {/* + button — always shows Plus regardless of focus state */}
        <Button
          appearance="subtle"
          size="sm"
          icon={<IconPlus />}
          aria-label="More options"
          onClick={() => setFmtVisible((v) => !v)}
          style={{
            width: 36,
            height: 36,
            padding: 0,
            borderRadius: "50%",
            flexShrink: 0,
            color: "var(--ax-colors-fg-secondary)",
            marginBottom: 1,
          }}
        />

        {/* Input area */}
        <Box
          style={{
            flex: 1,
            background: "var(--ax-colors-bg-secondary)",
            borderRadius: 8,
            padding: "9px 14px",
            minHeight: 38,
            display: "flex",
            alignItems: "center",
          }}
        >
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            onFocus={() => setFmtVisible(true)}
            placeholder={disabled ? "Select a conversation…" : placeholder}
            disabled={disabled}
            rows={1}
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              resize: "none",
              background: "transparent",
              fontFamily: "inherit",
              ...mobileType.primary,
              lineHeight: 1.45,
              color: "var(--ax-colors-fg-default)",
              maxHeight: 120,
              overflowY: "hidden",
              width: "100%",
              scrollbarWidth: "none",
            }}
          />
        </Box>

        {/* Send button */}
        <Button
          appearance={isEmpty || disabled ? "subtle" : "primary"}
          size="sm"
          icon={<IconPaperPlaneTop style={{ width: 18, height: 18, transform: "translateX(1px)" }} />}
          aria-label="Send"
          disabled={isEmpty || disabled}
          onClick={handleSend}
          className={sendPulsing ? "mobile-send-tap" : undefined}
          style={{ width: 38, height: 38, padding: 0, borderRadius: "50%", flexShrink: 0, marginBottom: 1 }}
        />
      </Box>
    </Box>
  );
}
