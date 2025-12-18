"use client";

import { Box, Button, Menu, MenuTrigger, MenuContent } from "@optiaxiom/react";
import { Text } from "../Text";
import { IconX, IconMenu2 } from "@tabler/icons-react";
import IconDropdown from "@/app/assets/opal/icon-dropdown.svg";
import IconInfo from "@/app/assets/opal/icon-info.svg";
import IconMaximize from "@/app/assets/opal/icon-maximize.svg";
import IconTrash from "@/app/assets/opal/icon-trash.svg";
import IconPopOut from "@/app/assets/opal/icon-pop-out.svg";
import IconClose from "@/app/assets/opal/icon-close.svg";
import { opalTypography } from "@/app/styles/opalTypography";

type OpalHeaderProps = {
  onClose: () => void;
  mode: 'docked' | 'popped-out';
  isHistoryVisible: boolean;
  onToggleHistory: () => void;
  onToggleMode: () => void;
};

export function OpalHeader({ 
  onClose, 
  mode, 
  isHistoryVisible, 
  onToggleHistory,
  onToggleMode 
}: OpalHeaderProps) {
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      borderB="1"
      borderColor="border.secondary"
      bg="bg.default"
      style={{
        padding: '16px 24px',
        gap: '12px',
      }}
    >
      <Box display="flex" alignItems="center" gap="12">
        <Button
          appearance="subtle"
          size="md"
          aria-label="Toggle history"
          onClick={onToggleHistory}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '6px',
            padding: 0,
            minWidth: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <IconMenu2 size={16} />
        </Button>
        <Button
          appearance="subtle"
          size="md"
          aria-label="Info"
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '6px',
            padding: 0,
            minWidth: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <IconInfo style={{ width: '16px', height: '16px' }} />
        </Button>
        <Menu
          options={[
            {
              label: "Opal",
              disabledReason: "Current view",
            },
            {
              label: "Settings",
              disabledReason: "Coming soon",
            },
          ]}
        >
          <MenuTrigger asChild>
            <Box
              display="flex"
              alignItems="center"
              gap="8"
              style={{ cursor: 'pointer' }}
            >
              <Text
                style={{ 
                  ...opalTypography.title,
                  margin: 0,
                  color: 'var(--opal-text-primary)',
                }}
              >
                Opal
              </Text>
              <IconDropdown style={{ width: '10px', height: '5px' }} />
            </Box>
          </MenuTrigger>
          <MenuContent />
        </Menu>
      </Box>
      <Box display="flex" alignItems="center" gap="8">
        <Button
          appearance="subtle"
          size="md"
          aria-label="Maximize"
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '6px',
            padding: 0,
            minWidth: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <IconMaximize style={{ width: '14px', height: '14px' }} />
        </Button>
        <Button
          appearance="subtle"
          size="md"
          aria-label="Close"
          onClick={onClose}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '6px',
            padding: 0,
            minWidth: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <IconX size={16} />
        </Button>
      </Box>
    </Box>
  );
}