import { NextResponse } from 'next/server';

export class ApiError extends Error {
  constructor(
    public status: number,
    message?: string,
    public details?: unknown,
  ) {
    super(message || getDefaultMessage(status));
    this.name = 'ApiError';
  }
}

function getDefaultMessage(status: number): string {
  switch (status) {
    case 400: return 'Bad request';
    case 401: return 'Unauthorized';
    case 403: return 'Forbidden';
    case 404: return 'Not found';
    case 409: return 'Conflict';
    case 429: return 'Too many requests';
    default: return 'Internal server error';
  }
}

export function handleError(error: unknown): NextResponse {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: error.message, details: error.details },
      { status: error.status },
    );
  }
  console.error('Unhandled API error:', error);
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 },
  );
}
