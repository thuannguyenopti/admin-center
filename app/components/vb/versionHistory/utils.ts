/**
 * Deep equality comparison for objects and arrays
 * Handles nested structures, circular references protection
 */
export function deepEqual(a: any, b: any, visited = new WeakMap()): boolean {
  // Handle primitive types and null/undefined
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a !== typeof b) return false;

  // Handle primitives
  if (typeof a !== 'object') return a === b;

  // Circular reference protection
  if (visited.has(a)) {
    return visited.get(a) === b;
  }
  visited.set(a, b);

  // Handle arrays
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i], visited)) return false;
    }
    return true;
  }

  // Handle dates
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime();
  }

  // Handle objects
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    if (keysA.length !== keysB.length) return false;

    for (const key of keysA) {
      if (!keysB.includes(key)) return false;
      if (!deepEqual(a[key], b[key], visited)) return false;
    }

    return true;
  }

  return false;
}

/**
 * Analyze differences between two versions and return a summary
 */
export type VersionComparisonSummary = {
  sectionsChanged: number;
  sectionsAdded: number;
  sectionsRemoved: number;
  elementsChanged: number;
  elementsAdded: number;
  elementsRemoved: number;
  totalChanges: number;
};

export function compareVersions(leftOutlines: any[], rightOutlines: any[]): VersionComparisonSummary {
  const summary: VersionComparisonSummary = {
    sectionsChanged: 0,
    sectionsAdded: 0,
    sectionsRemoved: 0,
    elementsChanged: 0,
    elementsAdded: 0,
    elementsRemoved: 0,
    totalChanges: 0,
  };

  // Build section maps
  const leftSections = new Map<string, any>();
  const rightSections = new Map<string, any>();

  for (const outline of leftOutlines) {
    for (const section of outline.tree || []) {
      const id = section.id ?? section.name ?? "";
      leftSections.set(id, { section, elements: outline.elements });
    }
  }

  for (const outline of rightOutlines) {
    for (const section of outline.tree || []) {
      const id = section.id ?? section.name ?? "";
      rightSections.set(id, { section, elements: outline.elements });
    }
  }

  // Count section changes
  for (const id of leftSections.keys()) {
    if (!rightSections.has(id)) {
      summary.sectionsRemoved++;
    }
  }

  for (const id of rightSections.keys()) {
    if (!leftSections.has(id)) {
      summary.sectionsAdded++;
    }
  }

  // Count element changes in common sections
  for (const [id, left] of leftSections) {
    const right = rightSections.get(id);
    if (!right) continue;

    // Collect element ids from section
    const getEleIds = (section: any) => {
      const ids: string[] = [];
      for (const row of section.children || []) {
        for (const col of row.children || []) {
          for (const ele of col.elements || col.children || []) {
            ids.push(ele.id);
          }
        }
      }
      return ids;
    };

    const leftEleIds = getEleIds(left.section);
    const rightEleIds = getEleIds(right.section);

    const leftSet = new Set(leftEleIds);
    const rightSet = new Set(rightEleIds);

    // Elements removed
    for (const eleId of leftEleIds) {
      if (!rightSet.has(eleId)) {
        summary.elementsRemoved++;
      }
    }

    // Elements added
    for (const eleId of rightEleIds) {
      if (!leftSet.has(eleId)) {
        summary.elementsAdded++;
      }
    }

    // Elements changed (same ID but different content)
    for (const eleId of leftEleIds) {
      if (rightSet.has(eleId)) {
        const leftEle = left.elements[eleId];
        const rightEle = right.elements[eleId];
        if (!deepEqual(leftEle, rightEle)) {
          summary.elementsChanged++;
        }
      }
    }

    // Section structure changed
    if (
      leftEleIds.length !== rightEleIds.length ||
      !deepEqual(left.section, right.section)
    ) {
      summary.sectionsChanged++;
    }
  }

  summary.totalChanges =
    summary.sectionsChanged +
    summary.sectionsAdded +
    summary.sectionsRemoved +
    summary.elementsChanged +
    summary.elementsAdded +
    summary.elementsRemoved;

  return summary;
}

/**
 * Format comparison summary as human-readable text
 */
export function formatComparisonSummary(summary: VersionComparisonSummary): string {
  const parts: string[] = [];

  if (summary.totalChanges === 0) {
    return "No changes";
  }

  if (summary.sectionsChanged > 0) {
    parts.push(`${summary.sectionsChanged} section${summary.sectionsChanged !== 1 ? 's' : ''} modified`);
  }
  if (summary.sectionsAdded > 0) {
    parts.push(`${summary.sectionsAdded} section${summary.sectionsAdded !== 1 ? 's' : ''} added`);
  }
  if (summary.sectionsRemoved > 0) {
    parts.push(`${summary.sectionsRemoved} section${summary.sectionsRemoved !== 1 ? 's' : ''} removed`);
  }
  if (summary.elementsChanged > 0) {
    parts.push(`${summary.elementsChanged} element${summary.elementsChanged !== 1 ? 's' : ''} changed`);
  }
  if (summary.elementsAdded > 0) {
    parts.push(`${summary.elementsAdded} element${summary.elementsAdded !== 1 ? 's' : ''} added`);
  }
  if (summary.elementsRemoved > 0) {
    parts.push(`${summary.elementsRemoved} element${summary.elementsRemoved !== 1 ? 's' : ''} removed`);
  }

  if (parts.length === 0) {
    return `${summary.totalChanges} change${summary.totalChanges !== 1 ? 's' : ''}`;
  }

  return parts.join(', ');
}
