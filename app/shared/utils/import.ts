import { ImportSource } from '../components/ImportModal/types';

/**
 * Fetch a file from different sources (CSV file, URL, or API endpoint)
 */
export async function fetchFileFromSource(
  importSource: ImportSource,
  csvFile: File | null,
  urlInput: string,
  endpointInput: string,
  convertJsonToCsv?: (data: any[]) => string,
  entityName: string = 'data'
): Promise<File> {
  let file: File | null = null;

  if (importSource === 'csv') {
    if (!csvFile) {
      throw new Error('Please select a CSV file');
    }
    file = csvFile;
  } else if (importSource === 'url') {
    if (!urlInput.trim()) {
      throw new Error('Please enter a URL');
    }
    // Fetch CSV from URL
    try {
      const response = await fetch(urlInput);
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
      }
      const blob = await response.blob();
      file = new File([blob], `${entityName}.csv`, { type: 'text/csv' });
    } catch (error: any) {
      throw new Error(`Failed to fetch from URL: ${error.message}`);
    }
  } else if (importSource === 'endpoint') {
    if (!endpointInput.trim()) {
      throw new Error('Please enter an API endpoint');
    }
    // Fetch from API endpoint
    try {
      const response = await fetch(endpointInput);
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
      }
      const contentType = response.headers.get('content-type');

      // Handle both CSV and JSON responses
      if (contentType?.includes('application/json')) {
        if (!convertJsonToCsv) {
          throw new Error('JSON to CSV conversion not supported for this entity');
        }
        const data = await response.json();
        // Convert JSON to CSV format
        const csvContent = convertJsonToCsv(data);
        const blob = new Blob([csvContent], { type: 'text/csv' });
        file = new File([blob], `${entityName}.csv`, { type: 'text/csv' });
      } else {
        const blob = await response.blob();
        file = new File([blob], `${entityName}.csv`, { type: 'text/csv' });
      }
    } catch (error: any) {
      throw new Error(`Failed to fetch from endpoint: ${error.message}`);
    }
  }

  if (!file) {
    throw new Error('No file to parse');
  }

  return file;
}

/**
 * Download a CSV template with given headers and sample data
 */
export function downloadTemplate(templateData: string, filename: string): void {
  const blob = new Blob([templateData], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
