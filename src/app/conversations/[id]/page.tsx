'use client';

import { useQuery } from 'convex/react';
import { ArrowLeft, File } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { api } from '@/../convex/_generated/api';
import type { Id } from '@/../convex/_generated/dataModel';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function ConversationDetailPage() {
  const params = useParams();
  const conversationId = params.id as Id<'conversations'>;

  const conversation = useQuery(api.queries.getConversationById, {
    id: conversationId,
  });

  const messages = useQuery(api.queries.getMessagesByConversation, {
    conversationId,
  });

  if (messages === undefined || conversation === undefined) {
    return (
      <div className="flex h-64 items-center justify-center">
        Loading conversation...
      </div>
    );
  }

  if (conversation === null) {
    return (
      <div className="flex h-64 items-center justify-center">
        Conversation not found
      </div>
    );
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) {
      return '0 Bytes';
    }
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
  };

  const user = conversation.user;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center gap-4">
        <Link href="/conversations">
          <Button size="sm" variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Conversations
          </Button>
        </Link>
        <div>
          <h1 className="font-bold text-3xl tracking-tight">
            {conversation?.title || 'Conversation'}
          </h1>
          <p className="text-muted-foreground">
            Conversation with {user?.name}
          </p>
        </div>
      </div>

      {user && (
        <Card>
          <CardHeader>
            <CardTitle>Conversation Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={user.avatarUrl} />
                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium text-lg">{user.name}</div>
                <div className="text-muted-foreground text-sm">
                  {user.email}
                </div>
                {user.phone && (
                  <div className="text-muted-foreground text-sm">
                    {user.phone}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Messages</CardTitle>
          <CardDescription>
            {messages.length} messages in this conversation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                className={`flex gap-3 ${message.role === 'assistant' ? 'justify-start' : 'justify-start'}`}
                key={message._id}
              >
                <Avatar className="mt-1 h-8 w-8">
                  <AvatarImage
                    src={
                      message.role === 'assistant'
                        ? '/avatars/bot.png'
                        : message.user?.avatarUrl
                    }
                  />
                  <AvatarFallback>
                    {message.role === 'assistant'
                      ? 'AI'
                      : getInitials(message.user?.name || 'User')}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <Badge
                      variant={
                        message.role === 'assistant' ? 'secondary' : 'default'
                      }
                    >
                      {message.role === 'assistant' ? 'Assistant' : 'User'}
                    </Badge>
                    <span className="text-muted-foreground text-xs">
                      {formatDate(message.createdAt)}
                    </span>
                  </div>
                  <div className="rounded-lg bg-muted p-3">
                    <p className="whitespace-pre-wrap text-sm">
                      {message.content}
                    </p>

                    {message.files && message.files.length > 0 && (
                      <div className="mt-2 space-y-2">
                        <div className="text-muted-foreground text-xs">
                          Attachments:
                        </div>
                        {message.files.map((file) => (
                          <div
                            className="flex items-center gap-2 rounded border bg-background p-2"
                            key={file._id}
                          >
                            <File className="h-4 w-4" />
                            <div className="min-w-0 flex-1">
                              <div className="truncate font-medium text-sm">
                                {file.fileName}
                              </div>
                              <div className="text-muted-foreground text-xs">
                                {formatFileSize(file.fileSize)} •{' '}
                                {file.fileType}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {messages.length === 0 && (
              <div className="py-8 text-center text-muted-foreground">
                No messages in this conversation yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
