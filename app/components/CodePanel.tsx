"use client";

import { useEffect, useState } from "react";
import { Box, Button, Text, Spinner } from "@optiaxiom/react";
import { IconX, IconCopy, IconCheck, IconChevronDown } from "@tabler/icons-react";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { vs } from 'react-syntax-highlighter/dist/esm/styles/prism';

type CodePanelProps = {
  isOpen: boolean;
  onClose: () => void;
  filePath: string | null;
};

type FileOption = {
  path: string;
  label: string;
};

export function CodePanel({ isOpen, onClose, filePath }: CodePanelProps) {
  const [code, setCode] = useState<string>("");
  const [language, setLanguage] = useState<string>("typescript");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [availableFiles, setAvailableFiles] = useState<FileOption[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Detect theme on mount and when it changes
  useEffect(() => {
    const checkTheme = () => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark' ||
                     document.documentElement.classList.contains('dark');
      setIsDarkMode(isDark);
    };

    checkTheme();

    // Watch for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'class'],
    });

    return () => observer.disconnect();
  }, []);

  // Generate available files list based on the current page
  useEffect(() => {
    if (filePath) {
      const files: FileOption[] = [
        { path: filePath, label: filePath },
      ];

      // Add common related files
      const dir = filePath.substring(0, filePath.lastIndexOf('/'));

      // Determine what related files might exist based on the directory
      const commonRelatedFiles = [
        'mockData.ts',
        'types.ts',
        'constants.ts',
        'utils.ts',
        'hooks.ts',
      ];

      // Add related files that might exist in the same directory
      commonRelatedFiles.forEach((relatedFile) => {
        const relatedPath = `${dir}/${relatedFile}`;
        // Don't duplicate the main file
        if (relatedPath !== filePath) {
          files.push({ path: relatedPath, label: relatedPath });
        }
      });

      setAvailableFiles(files);
      setSelectedFile(filePath);
    }
  }, [filePath]);

  useEffect(() => {
    if (isOpen && selectedFile) {
      fetchSourceCode(selectedFile);
    }
  }, [isOpen, selectedFile]);

  const fetchSourceCode = async (path: string) => {
    setIsLoading(true);
    setError(null);

    // Try the straightforward path first
    try {
      const response = await fetch(`/api/source-code?file=${encodeURIComponent(path)}`);
      const data = await response.json();

      if (!response.ok && response.status === 404) {
        // If 404, try converting numeric segments to [id]
        const segments = path.split('/');
        const dynamicPath = segments.map((segment, index) => {
          // Only convert pure numeric segments after 'app/'
          if (index > 0 && /^[0-9]+$/.test(segment)) {
            return '[id]';
          }
          return segment;
        }).join('/');

        // Only retry if the path actually changed
        if (dynamicPath !== path) {
          const retryResponse = await fetch(`/api/source-code?file=${encodeURIComponent(dynamicPath)}`);
          const retryData = await retryResponse.json();

          if (!retryResponse.ok) {
            setError(retryData.message || retryData.error || 'Failed to load source code');
            setCode("");
            return;
          }

          setCode(retryData.content);
          setLanguage(retryData.language);
          return;
        }

        setError(data.message || data.error || 'Failed to load source code');
        setCode("");
        return;
      }

      if (!response.ok) {
        setError(data.message || data.error || 'Failed to load source code');
        setCode("");
        return;
      }

      setCode(data.content);
      setLanguage(data.language);
    } catch (err) {
      setError('Failed to fetch source code');
      setCode("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <Box
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'var(--ax-colors-bg-overlay)',
          zIndex: 999,
          opacity: isOpen ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
        onClick={onClose}
      />

      {/* Panel */}
      <Box
        bg="bg.default"
        borderL="1"
        borderColor="border.default"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '700px',
          maxWidth: '90vw',
          zIndex: 1000,
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.2)',
        }}
      >
        {/* Header */}
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          p="16"
          borderB="1"
          borderColor="border.secondary"
          bg="bg.secondary"
        >
          <Box display="flex" flexDirection="column" gap="8" flex="1" style={{ minWidth: 0 }}>
            <Box display="flex" alignItems="center" gap="8">
              <Text fontSize="lg" fontWeight="600" color="fg.default">
                Source Code
              </Text>
            </Box>
            {availableFiles.length > 0 && (
              <Box style={{ position: 'relative' }}>
                <Box
                  display="flex"
                  alignItems="center"
                  gap="4"
                  p="8"
                  rounded="md"
                  bg="bg.tertiary"
                  border="1"
                  borderColor="border.tertiary"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <Text
                    fontSize="sm"
                    fontFamily="mono"
                    color="fg.default"
                    style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {selectedFile || filePath}
                  </Text>
                  <IconChevronDown
                    size={14}
                    style={{
                      color: 'var(--ax-colors-fg-secondary)',
                      flexShrink: 0,
                      transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s',
                    }}
                  />
                </Box>

                {/* Dropdown Menu */}
                {isDropdownOpen && availableFiles.length > 1 && (
                  <Box
                    bg="bg.tertiary"
                    border="1"
                    borderColor="border.default"
                    rounded="md"
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      marginTop: '4px',
                      zIndex: 10,
                      maxHeight: '200px',
                      overflowY: 'auto',
                    }}
                  >
                    {availableFiles.map((file, index) => (
                      <Box
                        key={file.path}
                        p="8"
                        style={{
                          cursor: 'pointer',
                          backgroundColor:
                            file.path === selectedFile
                              ? 'var(--ax-colors-bg-accent-subtle)'
                              : 'transparent',
                        }}
                        borderB={index < availableFiles.length - 1 ? "1" : undefined}
                        borderColor="border.tertiary"
                        onClick={() => {
                          setSelectedFile(file.path);
                          setIsDropdownOpen(false);
                        }}
                        onMouseEnter={(e) => {
                          if (file.path !== selectedFile) {
                            e.currentTarget.style.backgroundColor = 'var(--ax-colors-bg-tertiary-hovered)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (file.path !== selectedFile) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }
                        }}
                      >
                        <Text
                          fontSize="sm"
                          fontFamily="mono"
                          color="fg.default"
                          style={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {file.label}
                        </Text>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            )}
          </Box>
          <Box display="flex" gap="8" alignItems="center">
            {code && (
              <Button
                appearance="subtle"
                size="md"
                onClick={handleCopy}
                icon={copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
              >
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            )}
            <Button
              appearance="subtle"
              size="md"
              onClick={onClose}
              icon={<IconX size={20} />}
              aria-label="Close code panel"
            />
          </Box>
        </Box>

        {/* Content */}
        <Box
          flex="1"
          overflow="auto"
          bg="bg.default"
          style={{ minHeight: 0 }}
        >
          {isLoading && (
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              p="48"
              flexDirection="column"
              gap="16"
            >
              <Spinner size="lg" />
              <Text color="fg.secondary">Loading source code...</Text>
            </Box>
          )}

          {error && (
            <Box p="24" display="flex" flexDirection="column" gap="12">
              <Text fontSize="lg" fontWeight="600" color="fg.error">
                Unable to load source code
              </Text>
              <Text color="fg.secondary">{error}</Text>
              {error.includes('development mode') && (
                <Box
                  mt="8"
                  p="16"
                  bg="bg.information.subtle"
                  rounded="md"
                  borderL="2"
                  borderColor="border.accent"
                >
                  <Text fontSize="sm" color="fg.secondary">
                    💡 The code viewer requires access to source files, which are only available in development mode.
                  </Text>
                </Box>
              )}
            </Box>
          )}

          {!isLoading && !error && code && (
            <Box
              style={{
                fontSize: '13px',
                lineHeight: '1.6',
              }}
            >
              <SyntaxHighlighter
                language={language}
                style={isDarkMode ? vscDarkPlus : vs}
                showLineNumbers={true}
                wrapLines={true}
                customStyle={{
                  margin: 0,
                  padding: '20px',
                  background: 'transparent',
                  fontSize: '13px',
                }}
                lineNumberStyle={{
                  minWidth: '3em',
                  paddingRight: '1em',
                  color: 'var(--ax-colors-fg-tertiary)',
                  userSelect: 'none',
                }}
              >
                {code}
              </SyntaxHighlighter>
            </Box>
          )}
        </Box>
      </Box>
    </>
  );
}
