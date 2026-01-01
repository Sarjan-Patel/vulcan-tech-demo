import { Metadata } from 'next';
import { ChatContainer } from '@/components/chat/chat-container';

export const metadata: Metadata = {
  title: 'Analyze | Vulcan Legal',
  description: 'Analyze local ordinances and draft bills for conflicts with higher-level laws.',
};

export default function ChatPage() {
  return <ChatContainer />;
}
