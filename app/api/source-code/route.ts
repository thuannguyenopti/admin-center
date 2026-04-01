import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

// Cache for the source bundle in production
let sourceBundle: Record<string, { content: string; language: string }> | null = null;

async function loadSourceBundle() {
  if (sourceBundle) return sourceBundle;

  try {
    const bundlePath = join(process.cwd(), 'public', 'source-bundle.json');
    const bundleContent = await readFile(bundlePath, 'utf-8');
    sourceBundle = JSON.parse(bundleContent);
    return sourceBundle;
  } catch (err) {
    console.warn('Source bundle not found - falling back to filesystem reads');
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filePath = searchParams.get('file');

    if (!filePath) {
      return NextResponse.json(
        { error: 'File path is required' },
        { status: 400 }
      );
    }

    // Security: Only allow reading from the app directory
    if (!filePath.startsWith('app/')) {
      return NextResponse.json(
        { error: 'Access denied: Only app directory files are allowed' },
        { status: 403 }
      );
    }

    // Prevent directory traversal attacks
    if (filePath.includes('..')) {
      return NextResponse.json(
        { error: 'Invalid file path' },
        { status: 400 }
      );
    }

    // Try source bundle first (production)
    const bundle = await loadSourceBundle();
    if (bundle && bundle[filePath]) {
      return NextResponse.json({
        content: bundle[filePath].content,
        filePath,
        language: bundle[filePath].language,
      });
    }

    // Fall back to filesystem (development)
    const absolutePath = join(process.cwd(), filePath);

    try {
      const content = await readFile(absolutePath, 'utf-8');
      return NextResponse.json({
        content,
        filePath,
        language: getLanguageFromPath(filePath),
      });
    } catch (readError: any) {
      if (readError.code === 'ENOENT') {
        // File not found - provide helpful error message
        return NextResponse.json(
          {
            error: 'Source file not found',
            message: `File not found: ${filePath}`,
            hint: 'This page might use a different file structure, or the file may not exist.',
          },
          { status: 404 }
        );
      }
      throw readError;
    }
  } catch (error: any) {
    console.error('Source code API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to read source file',
        message: error.message || 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}

function getLanguageFromPath(filePath: string): string {
  if (filePath.endsWith('.tsx')) return 'typescript';
  if (filePath.endsWith('.ts')) return 'typescript';
  if (filePath.endsWith('.jsx')) return 'javascript';
  if (filePath.endsWith('.js')) return 'javascript';
  if (filePath.endsWith('.css')) return 'css';
  if (filePath.endsWith('.json')) return 'json';
  return 'typescript';
}
