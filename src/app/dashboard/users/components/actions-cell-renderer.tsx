'use client';

import type { ICellRendererParams } from 'ag-grid-community';
import { Eye, MoreHorizontal } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import type { User } from './users-grid';

type ActionsCellRendererProps = ICellRendererParams<User>;

export const ActionsCellRenderer = ({ data }: ActionsCellRendererProps) => {
  const router = useRouter();

  if (!data) {
    return null;
  }

  const handleViewUser = () => {
    router.push(`/dashboard/users/${data._id}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="h-8 w-8 cursor-pointer p-0 ring-0"
          size="sm"
          variant="ghost"
        >
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleViewUser}>
          <Eye className="mr-2 h-4 w-4" />
          View Profile
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
