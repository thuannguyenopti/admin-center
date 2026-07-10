"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  Field,
  Heading,
  Input,
  Radio,
  RadioGroup,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Text,
  Textarea,
} from "@optiaxiom/react";
import { IconUpload } from "@optiaxiom/icons";

// "above-tabs" = Create as row sits above the tab bar
// "within-tabs" = Create as row sits inside each tab's content area
export type CreateAsPlacement = "above-tabs" | "within-tabs";

interface ImportSkillModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  placement?: CreateAsPlacement;
}

function FilenamePill({ children }: { children: React.ReactNode }) {
  return (
    <code
      style={{
        background: "var(--ax-colors-bg-secondary)",
        borderRadius: 4,
        padding: "1px 5px",
        fontFamily: "monospace",
        fontSize: 13,
      }}
    >
      {children}
    </code>
  );
}

function DropZone() {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      gap="8"
      p="32"
      style={{
        border: "1.5px dashed var(--ax-colors-border-secondary)",
        borderRadius: 8,
        cursor: "pointer",
      }}
    >
      <IconUpload size={24} style={{ color: "var(--ax-colors-fg-secondary)" }} />
      <Text fontSize="sm" color="fg.secondary">
        Drop a <FilenamePill>skill.json</FilenamePill>,{" "}
        <FilenamePill>SKILL.md</FilenamePill>,{" "}
        <FilenamePill>.zip</FilenamePill>,{" "}
        <FilenamePill>.skill</FilenamePill>, or folder here
      </Text>
      <Button appearance="subtle" size="sm">Browse files</Button>
    </Box>
  );
}

function CreateAsRadio({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <Box display="flex" alignItems="center" gap="16">
      <Text fontSize="sm" color="fg.secondary">Create as</Text>
      <RadioGroup value={value} onValueChange={onChange}>
        <Box display="flex" gap="16">
          <Radio value="personal">Personal</Radio>
          <Radio value="organization">Organization</Radio>
        </Box>
      </RadioGroup>
    </Box>
  );
}

interface ImportSkillContentProps {
  placement?: CreateAsPlacement;
  onCancel?: () => void;
}

export function ImportSkillContent({
  placement = "above-tabs",
  onCancel,
}: ImportSkillContentProps) {
  const [jsonInput, setJsonInput] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [createAs, setCreateAs] = useState("personal");
  const [activeTab, setActiveTab] = useState("direct");

  const canImport =
    activeTab === "direct"
      ? jsonInput.trim().length > 0
      : githubUrl.trim().length > 0;

  return (
    <Box display="flex" flexDirection="column">
      {/* Header */}
      <Box px="24" pt="24" pb="16">
        <Text fontSize="lg" fontWeight="600" color="fg.default">Import Skill</Text>
      </Box>

      {/* Body */}
      <Box px="24" pb="16" display="flex" flexDirection="column" gap="0">
        {placement === "above-tabs" && (
          <Box mb="20">
            <CreateAsRadio value={createAs} onChange={setCreateAs} />
          </Box>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="direct">Direct upload</TabsTrigger>
            <TabsTrigger value="github">GitHub URL</TabsTrigger>
          </TabsList>

          <TabsContent value="direct">
            <Box display="flex" flexDirection="column" gap="16" mt="16">
              {placement === "within-tabs" && (
                <Box mb="8">
                  <CreateAsRadio value={createAs} onChange={setCreateAs} />
                </Box>
              )}

              <Textarea
                placeholder="Paste your skill JSON data here..."
                value={jsonInput}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setJsonInput(e.target.value)
                }
                rows={6}
                resize="vertical"
              />

              <Box display="flex" alignItems="center" gap="12">
                <Box style={{ flex: 1, height: 1, background: "var(--ax-colors-border-secondary)" }} />
                <Text fontSize="sm" color="fg.tertiary">or</Text>
                <Box style={{ flex: 1, height: 1, background: "var(--ax-colors-border-secondary)" }} />
              </Box>

              <DropZone />
            </Box>
          </TabsContent>

          <TabsContent value="github">
            <Box display="flex" flexDirection="column" gap="16" mt="16">
              {placement === "within-tabs" && (
                <CreateAsRadio value={createAs} onChange={setCreateAs} />
              )}

              <Field label="GitHub URL">
                <Input
                  placeholder="https://github.com/owner/repo/blob/main/skill.json"
                  value={githubUrl}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setGithubUrl(e.target.value)
                  }
                />
              </Field>
            </Box>
          </TabsContent>
        </Tabs>
      </Box>

      {/* Footer */}
      <Box
        px="24"
        py="16"
        display="flex"
        justifyContent="flex-end"
        gap="8"
        style={{ borderTop: "1px solid var(--ax-colors-border-secondary)" }}
      >
        <Button appearance="subtle" onClick={onCancel}>Cancel</Button>
        <Button appearance="primary" disabled={!canImport}>Import</Button>
      </Box>
    </Box>
  );
}

export function ImportSkillModal({
  open,
  onOpenChange,
  placement = "above-tabs",
}: ImportSkillModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <ImportSkillContent
          placement={placement}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
