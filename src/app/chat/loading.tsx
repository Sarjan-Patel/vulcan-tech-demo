import { Loader2 } from 'lucide-react';

export default function ChatLoading() {
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-bg-primary items-center justify-center">
      <Loader2 className="h-8 w-8 text-brand animate-spin" />
      <p className="mt-4 text-text-muted">Loading chat...</p>
    </div>
  );
}
