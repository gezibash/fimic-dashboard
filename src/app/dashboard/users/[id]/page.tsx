'use client';

import { useQuery } from 'convex/react';
import { notFound, useParams } from 'next/navigation';
import { api } from '@/../convex/_generated/api';
import type { Id } from '@/../convex/_generated/dataModel';
import { UserDetailView } from './components/user-detail-view';

export default function UserDetailPage() {
  const params = useParams();
  const userId = params.id as Id<'users'>;

  const user = useQuery(api.queries.getUserById, { id: userId });
  const conversations = useQuery(api.queries.getConversationsByUser, {
    userId,
  });

  // Handle loading state
  if (user === undefined || conversations === undefined) {
    return <UserDetailView loading />;
  }

  // Handle user not found
  if (user === null) {
    notFound();
  }

  return (
    <UserDetailView conversations={conversations} loading={false} user={user} />
  );
}
