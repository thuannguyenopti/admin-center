import { NextRequest, NextResponse } from 'next/server';
import { readFile, access } from 'fs/promises';
import { join } from 'path';

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

    const absolutePath = join(process.cwd(), filePath);

    // Try to read the file
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
