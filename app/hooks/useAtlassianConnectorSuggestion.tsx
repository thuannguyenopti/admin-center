"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AddConnectorModal, type ConnectedConnector } from "@/app/opal/tools/components/AddConnectorModal";
import { CONNECTORS } from "@/app/opal/tools/data/connectors";
import { ConnectorSuggestionCard } from "@/app/components/Opal/ConnectorSuggestionCard";

const STORAGE_KEY = "opal_connected_connectors";
const ATLASSIAN_CONNECTOR_ID = "atlassian-rovo";
const atlassianIntentPattern =
  /\b(jira|ticket|tickets|sprint|backlog|confluence|atlassian|issue|issues)\b/i;

export function useAtlassianConnectorSuggestion(inputValue: string) {
  const router = useRouter();
  const [connectedConnectors, setConnectedConnectors] = useState<ConnectedConnector[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalInitialConnector, setModalInitialConnector] = useState(
    CONNECTORS.find((connector) => connector.id === ATLASSIAN_CONNECTOR_ID) ?? null
  );

  const connectedIds = connectedConnectors.map((connector) => connector.id);
  const atlassianConnector = useMemo(
    () => CONNECTORS.find((connector) => connector.id === ATLASSIAN_CONNECTOR_ID) ?? null,
    []
  );

  const shouldShowAtlassianCard =
    Boolean(inputValue.trim()) &&
    atlassianIntentPattern.test(inputValue) &&
    !connectedIds.includes(ATLASSIAN_CONNECTOR_ID);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setConnectedConnectors(JSON.parse(raw));
      }
    } catch {
      // no-op
    }
  }, []);

  const handleConnectorAdded = (connector: ConnectedConnector) => {
    setConnectedConnectors((prev) => {
      const next = prev.some((item) => item.id === connector.id)
        ? prev.map((item) => (item.id === connector.id ? connector : item))
        : [...prev, connector];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const handleDisconnect = (id: string) => {
    setConnectedConnectors((prev) => {
      const next = prev.filter((item) => item.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const actionCard = shouldShowAtlassianCard && atlassianConnector ? (
    <ConnectorSuggestionCard
      onBrowseAll={() => router.push("/opal/connectors?tab=connectors")}
      onConnect={() => {
        setModalInitialConnector(atlassianConnector);
        setModalOpen(true);
      }}
    />
  ) : null;

  const modalElement = (
    <AddConnectorModal
      open={modalOpen}
      onOpenChange={setModalOpen}
      onConnectorAdded={handleConnectorAdded}
      onDisconnect={handleDisconnect}
      connectedIds={connectedIds}
      initialConnector={modalInitialConnector}
      initialScreen="configure"
      initialStep={0}
    />
  );

  return {
    actionCard,
    modalElement,
  };
}
