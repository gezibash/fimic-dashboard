'use client';

import { useQuery } from 'convex/react';
import { api } from '@/../convex/_generated/api';

import { UsersGrid } from './components/users-grid';

export default function UsersPage() {
  const users = useQuery(api.queries.getUsersWithStats);

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div>
        <h1 className="font-black text-2xl">Users</h1>
        <p className="page-description">
          Manage and view all users in your tax filing system
        </p>
      </div>
      <div className="h-full">
        <UsersGrid loading={users === undefined} users={users ?? []} />
      </div>
    </div>
  );
}
