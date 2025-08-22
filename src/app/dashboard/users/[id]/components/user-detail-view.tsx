'use client';

import { formatDistance } from 'date-fns';
import { ArrowLeft, Mail, MessageCircle, Phone, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { Doc } from '@/../convex/_generated/dataModel';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageHistory } from './message-history';

type UserWithStats = Doc<'users'> & {
  messageCount: number;
  lastMessageDate: number | null;
};

type UserDetailViewProps = {
  user?: UserWithStats | Doc<'users'>;
  conversations?: Doc<'conversations'>[];
  loading?: boolean;
};

export const UserDetailView = ({
  user,
  conversations = [],
  loading = false,
}: UserDetailViewProps) => {
  const router = useRouter();

  if (loading) {
    return <UserDetailViewSkeleton />;
  }

  if (!user) {
    return (
      <div className="flex flex-1 flex-col gap-4">
        <div className="flex items-center gap-4">
          <Button onClick={() => router.back()} size="sm" variant="ghost">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
        <div className="py-8 text-center">
          <p className="text-gray-500">User not found</p>
        </div>
      </div>
    );
  }

  // Calculate stats if not already provided
  const messageCount = 'messageCount' in user ? user.messageCount : 0;
  const lastMessageDate =
    'lastMessageDate' in user ? user.lastMessageDate : null;

  const formatLastMessage = (date: number | null) => {
    if (!date) return 'Never';
    return formatDistance(new Date(date), new Date(), { addSuffix: true });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button onClick={() => router.back()} size="sm" variant="ghost">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Users
        </Button>
      </div>

      {/* User Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage alt={user.name} src={user.avatarUrl} />
                <AvatarFallback className="text-lg">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{user.name}</CardTitle>
                <p className="mt-1 text-gray-500 text-sm">
                  User ID: {user._id}
                </p>
              </div>
            </div>
            <Badge className="ml-4" variant="secondary">
              <User className="mr-1 h-3 w-3" />
              Active User
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Contact Info */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-700 text-sm">
                Contact Information
              </h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span>{user.phone}</span>
                </div>
                {user.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>{user.email}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Activity Stats */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-700 text-sm">Activity</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <MessageCircle className="h-4 w-4 text-gray-400" />
                  <span>{messageCount} messages</span>
                </div>
                <div className="text-gray-500 text-sm">
                  Last message: {formatLastMessage(lastMessageDate)}
                </div>
              </div>
            </div>

            {/* Account Info */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-700 text-sm">Account</h4>
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="text-gray-500">Created: </span>
                  {new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
                <div className="text-sm">
                  <span className="text-gray-500">Conversations: </span>
                  {conversations.length}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Message History */}
      <Card>
        <CardHeader>
          <CardTitle>Message History</CardTitle>
          <p className="text-gray-500 text-sm">
            All messages and conversations for this user
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <MessageHistory
            conversations={conversations}
            userPhone={user.phone}
          />
        </CardContent>
      </Card>
    </div>
  );
};

const UserDetailViewSkeleton = () => {
  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-9 w-24" />
      </div>

      {/* User Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div>
                <Skeleton className="mb-2 h-8 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <Skeleton className="h-6 w-20" />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="space-y-3">
              <Skeleton className="h-4 w-32" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
            <div className="space-y-3">
              <Skeleton className="h-4 w-20" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-36" />
              </div>
            </div>
            <div className="space-y-3">
              <Skeleton className="h-4 w-24" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Message History */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton className="h-16 w-full" key={i} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
