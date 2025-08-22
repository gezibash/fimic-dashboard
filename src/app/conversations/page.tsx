'use client';

import { useQuery } from 'convex/react';
import { Eye } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/../convex/_generated/api';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function ConversationsPage() {
  const conversations = useQuery(api.queries.getAllConversations);

  if (conversations === undefined) {
    return (
      <div className="flex h-64 items-center justify-center">
        Loading conversations...
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

  const getTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60_000);
    const hours = Math.floor(diff / 3_600_000);
    const days = Math.floor(diff / 86_400_000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-3xl tracking-tight">Conversations</h1>
          <p className="text-muted-foreground">
            View and manage all chat conversations
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Conversations</CardTitle>
          <CardDescription>
            {conversations.length} total conversations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last Activity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conversations.map((conversation) => (
                <TableRow key={conversation._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={conversation.user?.avatarUrl} />
                        <AvatarFallback>
                          {conversation.user
                            ? getInitials(conversation.user.name)
                            : 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {conversation.user?.name || 'Unknown User'}
                        </div>
                        <div className="text-muted-foreground text-sm">
                          {conversation.user?.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs font-medium">
                    <div className="truncate">{conversation.title}</div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(conversation.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {getTimeAgo(conversation.lastMessageAt)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="default">Active</Badge>
                  </TableCell>
                  <TableCell>
                    <Link href={`/conversations/${conversation._id}`}>
                      <Button size="sm" variant="outline">
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
              {conversations.length === 0 && (
                <TableRow>
                  <TableCell
                    className="h-24 text-center text-muted-foreground"
                    colSpan={6}
                  >
                    No conversations found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
