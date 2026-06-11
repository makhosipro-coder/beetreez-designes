export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-text-primary">You&apos;re offline</h1>
        <p className="mt-4 text-lg text-text-secondary">
          Some features may be unavailable. Your recent changes will sync when you reconnect.
        </p>
      </div>
    </div>
  );
}
