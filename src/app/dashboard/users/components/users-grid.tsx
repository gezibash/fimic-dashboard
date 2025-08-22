'use client';

import type { ColDef } from 'ag-grid-community';
import { useMemo, useRef } from 'react';
import {
  AGGridWrapper,
  type AGGridWrapperRef,
} from '@/components/ag-grid/ag-grid-wrapper';
import { ActionsCellRenderer } from './actions-cell-renderer';

export type User = {
  _id: string;
  _creationTime: number;
  name: string;
  email?: string;
  phone: string;
  avatarUrl?: string;
  createdAt: number;
  messageCount: number;
  lastMessageDate: number | null;
};

type UsersGridProps = {
  users: User[];
  height?: number | string;
  darkMode?: boolean;
  loading?: boolean;
};

export const UsersGrid = ({
  users,
  darkMode = false,
  loading = false,
}: UsersGridProps) => {
  const gridRef = useRef<AGGridWrapperRef<User>>(null);

  const columnDefs = useMemo(
    (): ColDef<User>[] => [
      {
        field: '_id',
        headerName: 'ID',
        maxWidth: 300,
        cellClass: 'text-gray-400',
      },
      {
        field: 'name',
        headerName: 'Name',
        flex: 1,
      },
      {
        field: 'phone',
        headerName: 'Phone',
        flex: 1,
        minWidth: 120,
      },
      {
        field: 'messageCount',
        headerName: 'Messages',
        width: 100,
        cellClass: 'text-center',
        valueFormatter: (params: { value?: number }) => {
          return params.value?.toLocaleString() ?? '0';
        },
      },
      {
        field: 'lastMessageDate',
        headerName: 'Last Message',
        width: 130,
        valueFormatter: (params: { value?: number | null }) => {
          if (!params.value) {
            return 'Never';
          }
          return new Date(params.value).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          });
        },
      },
      {
        field: 'createdAt',
        headerName: 'Created',
        width: 120,
        valueFormatter: (params: { value?: number }) => {
          if (!params.value) {
            return '-';
          }
          return new Date(params.value).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          });
        },
      },
      {
        headerName: 'Actions',
        cellRenderer: ActionsCellRenderer,
        width: 80,
        pinned: 'right',
        sortable: false,
        filter: false,
        resizable: false,
        suppressMenu: true,
      },
    ],
    []
  );

  return (
    <AGGridWrapper<User>
      animateRows={true}
      columnDefs={columnDefs}
      darkMode={darkMode}
      loading={loading}
      loadingMessage="Loading users..."
      noDataMessage="No users found"
      ref={gridRef}
      rowData={users}
    />
  );
};
