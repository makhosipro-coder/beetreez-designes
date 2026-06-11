'use client';

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <html>
      <body className="flex min-h-screen items-center justify-center bg-canvas-bg p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-danger">Something went wrong</h1>
          <p className="mt-2 text-text-secondary">{error.message}</p>
          <button
            onClick={() => reset()}
            className="btn-primary mt-6"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
