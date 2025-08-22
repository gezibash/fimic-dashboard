'use client';

import { useQuery } from 'convex/react';
import {
  Activity,
  ArrowRight,
  FileText,
  MessageSquare,
  Users,
} from 'lucide-react';
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

export default function DashboardPage() {
  const stats = useQuery(api.queries.getDashboardStats);
  const recentConversations = useQuery(api.queries.getAllConversations);
  const recentUsers = useQuery(api.queries.getAllUsers);

  if (
    stats === undefined ||
    recentConversations === undefined ||
    recentUsers === undefined
  ) {
    return (
      <div className="flex h-64 items-center justify-center">
        Loading dashboard...
      </div>
    );
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
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

  // Get recent items (last 5)
  const recentConversationsLimited = recentConversations.slice(0, 5);
  const recentUsersLimited = recentUsers.slice(0, 5);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-3xl tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to your Fimic tax filing dashboard
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{stats.totalUsers}</div>
            <p className="text-muted-foreground text-xs">
              +{stats.recentUsers} new this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Conversations</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{stats.totalConversations}</div>
            <p className="text-muted-foreground text-xs">
              +{stats.recentConversations} new this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Messages</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{stats.totalMessages}</div>
            <p className="text-muted-foreground text-xs">
              +{stats.recentMessages} new this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Files</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{stats.totalFiles}</div>
            <p className="text-muted-foreground text-xs">
              Tax documents uploaded
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Conversations */}
        <Card className="col-span-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Conversations</CardTitle>
              <CardDescription>
                Latest chat activity from your users
              </CardDescription>
            </div>
            <Link href="/conversations">
              <Button size="sm" variant="outline">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentConversationsLimited.map((conversation) => (
                <div className="flex items-center gap-3" key={conversation._id}>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={conversation.user?.avatarUrl} />
                    <AvatarFallback>
                      {conversation.user
                        ? getInitials(conversation.user.name)
                        : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="truncate font-medium text-sm">
                        {conversation.title}
                      </p>
                      <span className="text-muted-foreground text-xs">
                        {getTimeAgo(conversation.lastMessageAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="truncate text-muted-foreground text-xs">
                        {conversation.user?.name || 'Unknown User'}
                      </p>
                      <Badge className="text-xs" variant="secondary">
                        Active
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
              {recentConversationsLimited.length === 0 && (
                <div className="py-4 text-center text-muted-foreground">
                  No recent conversations
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Users */}
        <Card className="col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Users</CardTitle>
              <CardDescription>Newly registered users</CardDescription>
            </div>
            <Link href="/users">
              <Button size="sm" variant="outline">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentUsersLimited.map((user) => (
                <div className="flex items-center gap-3" key={user._id}>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatarUrl} />
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-sm">{user.name}</p>
                    <div className="flex items-center justify-between">
                      <p className="truncate text-muted-foreground text-xs">
                        {user.email}
                      </p>
                      <span className="text-muted-foreground text-xs">
                        {formatDate(user.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {recentUsersLimited.length === 0 && (
                <div className="py-4 text-center text-muted-foreground">
                  No recent users
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
