'use client';

import { useQuery } from 'convex/react';
import { formatDistance } from 'date-fns';
import { Bot, Clock, MessageCircle, User } from 'lucide-react';
import { api } from '@/../convex/_generated/api';
import type { Doc } from '@/../convex/_generated/dataModel';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
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
      <div className="p-6 text-center">
        <MessageCircle className="mx-auto mb-4 h-12 w-12 text-gray-300" />
        <p className="text-gray-500">No messages found</p>
        <p className="mt-1 text-gray-400 text-sm">
          Messages will appear here once this user starts communicating
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-gray-400" />
          <span className="font-medium">
            {messagesWithConversations.length} messages across{' '}
            {conversations.length} conversation
            {conversations.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      <div className="space-y-3">
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
        <div className="flex items-center gap-4 py-2">
          <Separator className="flex-1" />
          <span className="px-2 text-gray-400 text-xs">
            {messageDate.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
          <Separator className="flex-1" />
        </div>
      )}

      <Card
        className={`${isAssistant ? 'border-blue-200 bg-blue-50' : 'bg-gray-50'}`}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Role Icon */}
            <div
              className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
                isAssistant
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-500 text-white'
              }`}
            >
              {isAssistant ? (
                <Bot className="h-4 w-4" />
              ) : (
                <User className="h-4 w-4" />
              )}
            </div>

            {/* Message Content */}
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex items-center gap-2">
                <Badge
                  className="text-xs"
                  variant={isAssistant ? 'default' : 'secondary'}
                >
                  {isAssistant ? 'Assistant' : 'User'}
                </Badge>
                <div className="flex items-center gap-1 text-gray-500 text-xs">
                  <Clock className="h-3 w-3" />
                  {formatDistance(messageDate, new Date(), { addSuffix: true })}
                </div>
              </div>

              <div className="whitespace-pre-wrap text-gray-900 text-sm">
                {message.content}
              </div>

              {/* Files if any */}
              {message.files && message.files.length > 0 && (
                <div className="mt-2 border-gray-200 border-t pt-2">
                  <div className="mb-1 text-gray-500 text-xs">
                    {message.files.length} file
                    {message.files.length !== 1 ? 's' : ''}:
                  </div>
                  <div className="space-y-1">
                    {message.files.map((file) => (
                      <div className="text-blue-600 text-xs" key={file._id}>
                        📎 {file.fileName}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Conversation context for multiple conversations */}
          {message.conversation && (
            <div className="mt-3 border-gray-200 border-t pt-2">
              <div className="text-gray-500 text-xs">
                Conversation: {message.conversation.title}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};

const MessageHistorySkeleton = () => {
  return (
    <div className="space-y-4 p-6">
      <div className="mb-6 flex items-center justify-between">
        <Skeleton className="h-6 w-64" />
      </div>

      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Skeleton className="h-8 w-8 flex-shrink-0 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            </CardContent>
          </Card>
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
