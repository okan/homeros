import { Inbox } from 'lucide-react';

export const EmptyState = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
      <Inbox className="w-16 h-16 text-icon-placeholder mb-normal" />
      <h2 className="text-header2 text-text-secondary mb-fine">No slots yet</h2>
      <p className="text-value text-text-placeholder max-w-md">
        Create your first slot to start organizing your bookmarks
      </p>
    </div>
  );
};
