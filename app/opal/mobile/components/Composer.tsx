"use client";

import { useRef, useState } from "react";
import { Box, Button, Tooltip } from "@optiaxiom/react";
import {
  IconPlus,
  IconPaperclip,
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
        gap="8"
        px="12"
        pt="10"
        pb="4"
      >
        {/* Attach / format toggle */}
        <Button
          appearance="subtle"
          size="sm"
          icon={fmtVisible ? <IconPaperclip /> : <IconPlus />}
          aria-label={fmtVisible ? "Attach file" : "More options"}
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
            borderRadius: 22,
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
              fontSize: 15,
              lineHeight: 1.45,
              color: "var(--ax-colors-fg-default)",
              maxHeight: 120,
              overflowY: "auto",
              width: "100%",
            }}
          />
        </Box>

        {/* Send button */}
        <Box
          onClick={handleSend}
          className={sendPulsing ? "mobile-send-tap" : undefined}
          style={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            background: isEmpty || disabled
              ? "var(--ax-colors-bg-tertiary)"
              : "var(--ax-colors-bg-accent)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            cursor: isEmpty || disabled ? "default" : "pointer",
            transition: "background 0.18s ease",
            marginBottom: 1,
          }}
        >
          <IconPaperPlaneTop
            style={{
              width: 18,
              height: 18,
              color: isEmpty || disabled ? "var(--ax-colors-fg-disabled)" : "white",
              transform: "translateX(1px)",
            }}
          />
        </Box>
      </Box>
    </Box>
  );
}
