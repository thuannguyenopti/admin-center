"use client";

import { useState, useMemo } from "react";
import { Box, Tabs, TabsList, TabsTrigger, TabsContent, Badge } from "@optiaxiom/react";
import { Text } from "@/app/components/Text";
import { Input } from "@/app/components/Input";
import { Button } from "@/app/components/Button";
import {
  IconSearch,
  IconChevronDown,
  IconLayoutGrid,
  IconList,
  IconFilter,
  IconPlus,
  IconBookmark,
  IconFolder,
  IconFile,
  IconPhoto,
} from "@tabler/icons-react";

interface Asset {
  id: string;
  name: string;
  type: "image" | "folder" | "python";
  thumbnail?: string;
  fileTypeLabel: string;
  modified: string;
}

const mockAssets: Asset[] = [
  { id: "1", name: "Product Hero Banner", type: "image", fileTypeLabel: "JPG", thumbnail: "https://picsum.photos/300/200?random=1", modified: "Feb 20, 2025" },
  { id: "2", name: "Campaign Video Thumbnail", type: "image", fileTypeLabel: "JPG", thumbnail: "https://picsum.photos/300/200?random=2", modified: "Feb 19, 2025" },
  { id: "3", name: "Brand Guidelines Cover", type: "image", fileTypeLabel: "JPG", thumbnail: "https://picsum.photos/300/200?random=3", modified: "Feb 18, 2025" },
  { id: "4", name: "Social Media Post", type: "image", fileTypeLabel: "JPG", thumbnail: "https://picsum.photos/300/200?random=4", modified: "Feb 17, 2025" },
  { id: "5", name: "Landing Page Hero", type: "image", fileTypeLabel: "JPG", thumbnail: "https://picsum.photos/300/200?random=5", modified: "Feb 16, 2025" },
  { id: "6", name: "Music Event", type: "image", fileTypeLabel: "JPG", thumbnail: "https://picsum.photos/300/200?random=6", modified: "Feb 15, 2025" },
  { id: "7", name: "d.py", type: "python", fileTypeLabel: "PY", modified: "Feb 14, 2025" },
  { id: "8", name: "my-asset-files-ssol...", type: "folder", fileTypeLabel: "Folder", modified: "Feb 13, 2025" },
  { id: "9", name: "my-asset-videos-s...", type: "folder", fileTypeLabel: "Folder", modified: "Feb 12, 2025" },
  { id: "10", name: "my-asset-images-s...", type: "folder", fileTypeLabel: "Folder", modified: "Feb 11, 2025" },
  { id: "11", name: "my-asset-articles-...", type: "folder", fileTypeLabel: "Folder", modified: "Feb 10, 2025" },
];

function getBadgeColor(type: string): string {
  switch (type) {
    case "JPG": return "#22C55E";
    case "PY": return "#8B5CF6";
    case "Folder": return "#3B82F6";
    default: return "#6B7280";
  }
}

function AssetCard({ asset }: { asset: Asset }) {
  return (
    <Box
      bg="bg.default"
      rounded="lg"
      overflow="hidden"
      border="1"
      borderColor="border.tertiary"
      style={{ cursor: "pointer" }}
      className="hover:shadow-md"
    >
      {/* Thumbnail */}
      <Box style={{ height: 150, position: "relative", backgroundColor: asset.type === "python" ? "#8B5CF6" : asset.type === "folder" ? "#EEF2FF" : "#F5F6FA" }}>
        {asset.type === "image" && asset.thumbnail ? (
          <img
            src={asset.thumbnail}
            alt={asset.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <Box display="flex" alignItems="center" justifyContent="center" style={{ height: "100%" }}>
            {asset.type === "folder" ? (
              <IconFolder size={48} color="#3B82F6" />
            ) : (
              <IconFile size={48} color="white" />
            )}
          </Box>
        )}
      </Box>

      {/* Info */}
      <Box p="12">
        <Box display="flex" alignItems="center" gap="8" mb="4">
          <Box
            style={{
              backgroundColor: getBadgeColor(asset.fileTypeLabel),
              color: "white",
              fontSize: "10px",
              fontWeight: 600,
              padding: "2px 6px",
              borderRadius: 4,
            }}
          >
            {asset.fileTypeLabel}
          </Box>
        </Box>
        <Text fontSize="sm" fontWeight="500" color="fg.default" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {asset.name}
        </Text>
      </Box>
    </Box>
  );
}

export default function CMPLibraryPage() {
  const [activeTab, setActiveTab] = useState("assets");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("modified");

  const filteredAssets = useMemo(() => {
    let filtered = mockAssets;
    if (searchQuery) {
      filtered = filtered.filter((a) =>
        a.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (sortBy === "name") {
      filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    }
    return filtered;
  }, [searchQuery, sortBy]);

  return (
    <Box style={{ minHeight: "calc(100vh - 200px)" }}>
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb="16">
          <TabsList>
            <TabsTrigger value="assets">Assets</TabsTrigger>
            <TabsTrigger value="collections">Collections</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="dashboards">Dashboards</TabsTrigger>
          </TabsList>
          <Text fontSize="sm" color="fg.tertiary">Saved Views</Text>
        </Box>

        <TabsContent value="assets">
          {/* Toolbar */}
          <Box display="flex" alignItems="center" gap="8" mb="24" flexWrap="wrap">
            <Button appearance="subtle" size="md" style={{ position: "relative" }}>
              <IconFilter size={16} />
              <Box
                style={{
                  position: "absolute", top: -4, right: -4,
                  width: 18, height: 18, borderRadius: "50%",
                  backgroundColor: "var(--ax-colors-bg-accent)",
                  color: "white", fontSize: "11px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                1
              </Box>
            </Button>

            <Box flex="1" style={{ maxWidth: 300, position: "relative" }}>
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: 36 }}
              />
              <Box style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}>
                <IconSearch size={16} color="#66708C" />
              </Box>
            </Box>

            <Box display="flex" alignItems="center" gap="4" style={{ borderLeft: "1px solid var(--ax-colors-border-tertiary)", paddingLeft: 8 }}>
              <Button
                appearance={viewMode === "grid" ? "default" : "subtle"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <IconLayoutGrid size={16} />
              </Button>
              <Button
                appearance={viewMode === "list" ? "default" : "subtle"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <IconList size={16} />
              </Button>
            </Box>

            <Button appearance="subtle" size="md" onClick={() => setSortBy(sortBy === "modified" ? "name" : "modified")}>
              {sortBy === "modified" ? "Last Modified" : "Name"} <IconChevronDown size={14} />
            </Button>

            <Box flex="1" />

            <Button appearance="subtle" size="md">
              <IconBookmark size={16} /> Save View
            </Button>

            <Button appearance="primary" size="md">
              <IconPlus size={16} /> Add <IconChevronDown size={14} />
            </Button>
          </Box>

          {/* Grid View */}
          {viewMode === "grid" ? (
            <Box display="flex" flexWrap="wrap" gap="16">
              {filteredAssets.map((asset) => (
                <Box key={asset.id} style={{ width: "calc(16.66% - 14px)", minWidth: 180 }}>
                  <AssetCard asset={asset} />
                </Box>
              ))}
            </Box>
          ) : (
            /* List View */
            <Box bg="bg.default" rounded="md" border="1" borderColor="border.tertiary" overflow="hidden">
              <Box display="flex" alignItems="center" gap="16" p="12" borderB="1" borderColor="border.tertiary" bg="bg.secondary">
                <Box style={{ width: 60 }}>
                  <Text fontSize="sm" fontWeight="500" color="fg.tertiary">Type</Text>
                </Box>
                <Box flex="1">
                  <Text fontSize="sm" fontWeight="500" color="fg.tertiary">Name</Text>
                </Box>
                <Box style={{ width: 120 }}>
                  <Text fontSize="sm" fontWeight="500" color="fg.tertiary">Modified</Text>
                </Box>
              </Box>
              {filteredAssets.map((asset) => (
                <Box
                  key={asset.id}
                  display="flex"
                  alignItems="center"
                  gap="16"
                  p="12"
                  borderB="1"
                  borderColor="border.tertiary"
                  style={{ cursor: "pointer" }}
                  className="hover:bg-[var(--ax-colors-bg-default-hovered)]"
                >
                  <Box style={{ width: 60 }}>
                    <Box
                      style={{
                        backgroundColor: getBadgeColor(asset.fileTypeLabel),
                        color: "white", fontSize: "10px", fontWeight: 600,
                        padding: "2px 6px", borderRadius: 4, display: "inline-block",
                      }}
                    >
                      {asset.fileTypeLabel}
                    </Box>
                  </Box>
                  <Box flex="1" display="flex" alignItems="center" gap="8">
                    {asset.type === "image" ? (
                      <IconPhoto size={20} color="#66708C" />
                    ) : asset.type === "folder" ? (
                      <IconFolder size={20} color="#3B82F6" />
                    ) : (
                      <IconFile size={20} color="#8B5CF6" />
                    )}
                    <Text fontSize="sm" fontWeight="500" color="fg.default">{asset.name}</Text>
                  </Box>
                  <Box style={{ width: 120 }}>
                    <Text fontSize="sm" color="fg.tertiary">{asset.modified}</Text>
                  </Box>
                </Box>
              ))}
            </Box>
          )}

          {filteredAssets.length === 0 && (
            <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" style={{ minHeight: 400 }}>
              <Text fontSize="lg" fontWeight="500" color="fg.secondary" mb="8">No assets found</Text>
              <Text fontSize="sm" color="fg.tertiary">Try adjusting your search or filters</Text>
            </Box>
          )}
        </TabsContent>

        <TabsContent value="collections">
          <Box display="flex" alignItems="center" justifyContent="center" style={{ minHeight: 400 }}>
            <Text fontSize="lg" color="fg.tertiary">Collections coming soon</Text>
          </Box>
        </TabsContent>

        <TabsContent value="templates">
          <Box display="flex" alignItems="center" justifyContent="center" style={{ minHeight: 400 }}>
            <Text fontSize="lg" color="fg.tertiary">Templates coming soon</Text>
          </Box>
        </TabsContent>

        <TabsContent value="dashboards">
          <Box display="flex" alignItems="center" justifyContent="center" style={{ minHeight: 400 }}>
            <Text fontSize="lg" color="fg.tertiary">Dashboards coming soon</Text>
          </Box>
        </TabsContent>
      </Tabs>
    </Box>
  );
}
