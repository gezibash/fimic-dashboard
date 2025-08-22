'use client';

import { useQuery } from 'convex/react';
import { formatDistance } from 'date-fns';
import { Bot, Clock, MessageCircle, Paperclip, User } from 'lucide-react';
import { api } from '@/../convex/_generated/api';
import type { Doc } from '@/../convex/_generated/dataModel';
import { Skeleton } from '@/components/ui/skeleton';

type MessageHistoryProps = {
  userPhone: string;
  conversations: Doc<'conversations'>[];
};

type MessageWithConversation = Doc<'messages'> & {
  conversation?: Doc<'conversations'>;
};

export const MessageHistory = ({
  userPhone,
  conversations,
}: MessageHistoryProps) => {
  // Get all messages for the user using our custom query
  const messages = useQuery(api.messages.getMessagesByUserPhone, {
    userPhone,
  });

  // Check if query is still loading
  if (messages === undefined) {
    return <MessageHistorySkeleton />;
  }

  // Enhance messages with conversation information
  const messagesWithConversations: MessageWithConversation[] = messages.map(
    (message) => {
      const conversation = conversations.find(
        (conv) => conv._id === message.conversationId
      );
      return { ...message, conversation };
    }
  );

  // Sort messages chronologically (newest first)
  messagesWithConversations.sort((a, b) => b.createdAt - a.createdAt);

  if (messagesWithConversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <MessageCircle className="mb-3 h-8 w-8 text-gray-300" />
        <p className="font-medium text-gray-600">No messages yet</p>
        <p className="mt-1 text-gray-400 text-sm">
          Messages will appear here once this user starts communicating
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 border-gray-100 border-b pb-4">
        <h2 className="font-semibold text-gray-900 text-lg">Message History</h2>
        <p className="mt-1 text-gray-500 text-sm">
          {messagesWithConversations.length} messages across{' '}
          {conversations.length} conversation
          {conversations.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="space-y-6">
        {messagesWithConversations.map((message, index) => (
          <MessageItem
            key={message._id}
            message={message}
            showDateSeparator={
              index === 0 ||
              !isSameDay(
                message.createdAt,
                messagesWithConversations[index - 1].createdAt
              )
            }
          />
        ))}
      </div>
    </div>
  );
};

type MessageItemProps = {
  message: MessageWithConversation;
  showDateSeparator: boolean;
};

const MessageItem = ({ message, showDateSeparator }: MessageItemProps) => {
  const isAssistant = message.role === 'assistant';
  const messageDate = new Date(message.createdAt);

  return (
    <>
      {showDateSeparator && (
        <div className="flex items-center justify-center py-6">
          <div className="rounded-full bg-gray-50 px-4 py-2">
            <span className="font-medium text-gray-500 text-xs">
              {messageDate.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
        </div>
      )}

      <div className="group">
        <div className="flex items-start gap-4">
          <div
            className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
              isAssistant
                ? 'bg-gray-100 text-gray-600'
                : 'bg-gray-50 text-gray-500'
            }`}
          >
            {isAssistant ? (
              <Bot className="h-4 w-4" />
            ) : (
              <User className="h-4 w-4" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center gap-3">
              <span
                className={`font-medium text-sm ${isAssistant ? 'text-gray-900' : 'text-gray-700'}`}
              >
                {isAssistant ? 'Assistant' : 'User'}
              </span>
              <div className="flex items-center gap-1 text-gray-400 text-xs">
                <Clock className="h-3 w-3" />
                {formatDistance(messageDate, new Date(), { addSuffix: true })}
              </div>
            </div>

            <div className="prose prose-sm max-w-none">
              <p className="m-0 whitespace-pre-wrap text-gray-800 leading-relaxed">
                {message.content}
              </p>
            </div>

            {message.fileIds && message.fileIds.length > 0 && (
              <div className="mt-3 border-gray-50 border-t pt-3">
                <div className="flex flex-wrap gap-2">
                  {message.fileIds.map((fileId) => (
                    <div
                      className="flex items-center gap-1.5 rounded bg-gray-50 px-2 py-1 text-gray-600 text-xs transition-colors hover:bg-gray-100"
                      key={fileId}
                    >
                      <Paperclip className="h-3 w-3" />
                      File: {fileId}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {message.conversation && (
              <div className="mt-3 border-gray-50 border-t pt-2">
                <span className="text-gray-400 text-xs">
                  in {message.conversation.title}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

const MessageHistorySkeleton = () => {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 border-gray-100 border-b pb-4">
        <Skeleton className="mb-2 h-6 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>

      <div className="space-y-6">
        {Array.from({ length: 5 }, (_, i) => (
          <div className="flex items-start gap-4" key={`message-skeleton-${i}`}>
            <Skeleton className="h-8 w-8 flex-shrink-0 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Helper function to check if two timestamps are on the same day
const isSameDay = (date1: number, date2: number): boolean => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};
