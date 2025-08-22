'use client';

import { useQuery } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import { UsersGrid } from '@/components/ag-grid/UsersGrid';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function UsersPage() {
  const users = useQuery(api.queries.getAllUsers);

  if (users === undefined) {
    return (
      <div className="flex h-64 items-center justify-center">
        Loading users...
      </div>
    );
  }

  const handleUserSelect = (user: { _id: string; name: string; email?: string }) => {
    // Handle user selection - could navigate to user detail page
  };

  return (
    <div className="page-container">
      <div className="page-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Users</h1>
            <p className="page-description">
              Manage and view all users in your tax filing system
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>
              {users.length} total users registered
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <UsersGrid
              height={600}
              onUserSelect={handleUserSelect}
              users={users}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
