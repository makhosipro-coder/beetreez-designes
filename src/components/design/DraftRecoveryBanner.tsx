import { Button } from '@/components/ui/Button';

interface DraftRecoveryBannerProps {
  onRestore: () => void;
  onDismiss: () => void;
}

export function DraftRecoveryBanner({ onRestore, onDismiss }: DraftRecoveryBannerProps) {
  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-slide-up">
      <div className="flex items-center gap-4 rounded-lg border border-warning bg-canvas-surface px-5 py-3 shadow-xl">
        <span className="text-sm text-text-primary">
          We found an unsaved design from your last session.
        </span>
        <Button variant="primary" size="sm" onClick={onRestore}>
          Restore
        </Button>
        <Button variant="ghost" size="sm" onClick={onDismiss}>
          Dismiss
        </Button>
      </div>
    </div>
  );
}
