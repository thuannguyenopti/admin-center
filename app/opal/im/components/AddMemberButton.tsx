"use client";

import { useState } from "react";
import { Button } from "@optiaxiom/react";
import { IconUserPlus } from "@optiaxiom/icons";
import { AddMemberDialog } from "./AddMemberDialog";

type Props = {
  conversationId: string;
  existingMemberIds: string[];
  onAdded?: () => void;
  /** Optional inline style for positioning (e.g. floating overlay). */
  style?: React.CSSProperties;
};

export function AddMemberButton({
  conversationId,
  existingMemberIds,
  onAdded,
  style,
}: Props) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        appearance="subtle"
        size="md"
        icon={<IconUserPlus size={16} />}
        onClick={() => setOpen(true)}
        aria-label="Add people"
        style={style}
      >
        {existingMemberIds.length}
      </Button>
      <AddMemberDialog
        open={open}
        onOpenChange={setOpen}
        conversationId={conversationId}
        existingMemberIds={existingMemberIds}
        onAdded={onAdded}
      />
    </>
  );
}
