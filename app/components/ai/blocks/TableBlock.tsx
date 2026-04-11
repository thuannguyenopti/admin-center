"use client";

import React from 'react';
import { AdaptiveBlock, AdaptiveBlockAction } from '../AdaptiveBlock';
import { AdaptiveBlockComponentProps } from '../AdaptiveBlockRegistry';

export type TableBlockColumn = {
  key: string;
  label: string;
  width?: string;
  render?: (value: any, row: any, rowIndex: number) => React.ReactNode;
};

export type TableBlockMetadata = {
  blockType: 'table';
  title?: string;
  columns: TableBlockColumn[];
  data: any[];
  actions?: AdaptiveBlockAction[];
  maxHeight?: string;
  scrollable?: boolean;
  renderContent?: (data: any[]) => React.ReactNode;
};

/**
 * TableBlock - An adaptive block specialized for displaying tabular data
 *
 * Can be used for simple data tables or complex interactive tables like
 * the preflight results. Supports custom rendering for cells and flexible
 * column configuration.
 */
export const TableBlock: React.FC<AdaptiveBlockComponentProps> = ({
  metadata,
  messageId,
  onDismiss,
}) => {
  const tableMetadata = metadata as TableBlockMetadata;
  const {
    title,
    columns,
    data,
    actions,
    maxHeight,
    scrollable,
    renderContent,
  } = tableMetadata;

  // If custom render function is provided, use it
  const content = renderContent
    ? renderContent(data)
    : (
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                style={{
                  textAlign: 'left',
                  padding: '8px',
                  borderBottom: '1px solid #e5e7eb',
                  fontWeight: 600,
                  fontSize: '14px',
                }}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((column) => (
                <td
                  key={column.key}
                  style={{
                    padding: '8px',
                    borderBottom: '1px solid #e5e7eb',
                    fontSize: '14px',
                  }}
                >
                  {column.render
                    ? column.render(row[column.key], row, rowIndex)
                    : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );

  return (
    <AdaptiveBlock
      title={title}
      actions={actions}
      maxHeight={maxHeight}
      scrollable={scrollable}
    >
      {content}
    </AdaptiveBlock>
  );
};
