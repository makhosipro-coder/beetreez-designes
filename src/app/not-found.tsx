import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-6xl font-bold text-brand-primary">404</h1>
      <p className="mt-4 text-lg text-text-secondary">This page could not be found.</p>
      <Link href="/" className="btn-primary mt-8">
        Go home
      </Link>
    </div>
  );
}
