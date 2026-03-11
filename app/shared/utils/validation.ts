/**
 * Validate if a string is a valid HTTP/HTTPS URL
 */
export function validateUrl(url: string): boolean {
  if (!url.trim()) return false;

  try {
    const urlObj = new URL(url);
    // Check for http or https protocol
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Validate file type
 */
export function isValidCsvFile(file: File): boolean {
  return file.name.endsWith('.csv') || file.type === 'text/csv';
}

/**
 * Validate file size (max 10MB)
 */
export function isValidFileSize(file: File, maxSizeInMB: number = 10): boolean {
  const maxBytes = maxSizeInMB * 1024 * 1024;
  return file.size <= maxBytes;
}

/**
 * Validate file completely (type and size)
 */
export function validateCsvFile(file: File): { valid: boolean; error?: string } {
  if (!isValidCsvFile(file)) {
    return {
      valid: false,
      error: 'Please upload a CSV file (.csv)',
    };
  }

  if (!isValidFileSize(file)) {
    return {
      valid: false,
      error: 'File size must be less than 10MB',
    };
  }

  return { valid: true };
}
