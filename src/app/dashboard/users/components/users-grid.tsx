'use client';

import type { ColDef } from 'ag-grid-community';
import { useMemo, useRef } from 'react';
import {
  AGGridWrapper,
  type AGGridWrapperRef,
} from '@/components/ag-grid/ag-grid-wrapper';

export type User = {
  _id: string;
  _creationTime: number;
  name: string;
  email?: string;
  phone: string;
  avatarUrl?: string;
  createdAt: number;
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
        flex: 1,
        minWidth: 50,
        cellRenderer: (params: { data: User }) => {
          const { _id } = params.data;
          return (
            <div className="flex flex-col">
              <div className="font-mono text-sm">{_id}</div>
            </div>
          );
        },
      },
      {
        field: 'name',
        headerName: 'Name',
        flex: 2,
        minWidth: 200,
        cellRenderer: (params: { data: User }) => {
          const { name } = params.data;
          return (
            <div className="flex flex-col">
              <div className="font-mono text-sm">{name}</div>
            </div>
          );
        },
      },
      {
        field: 'email',
        headerName: 'Email',
        flex: 2,
        minWidth: 200,
        hide: true, // Hidden since we show it in the name column
      },
      {
        field: 'phone',
        headerName: 'Phone',
        flex: 1,
        minWidth: 120,
      },
      {
        field: 'createdAt',
        headerName: 'Created',
        flex: 1,
        minWidth: 120,
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
      // Custom grid options
      paginationPageSize={25}
      paginationPageSizeSelector={[25, 50, 100]}
      ref={gridRef} // Taller rows for the two-line name/email layout
      rowData={users}
      rowHeight={56}
      selectionMode="single"
      tooltipShowDelay={500}
    />
  );
};
