'use client';

import type { CellClickedEvent, ColDef } from 'ag-grid-community';
import { useMemo, useRef } from 'react';
import { AGGridWrapper, type AGGridWrapperRef } from './AGGridWrapper';

export interface User {
  _id: string;
  _creationTime: number;
  name: string;
  email?: string;
  phone: string;
  avatarUrl?: string;
  createdAt: number;
}

interface UsersGridProps {
  users: User[];
  height?: number | string;
  onUserSelect?: (user: User) => void;
  darkMode?: boolean;
  loading?: boolean;
}

export const UsersGrid = ({
  users,
  height = 600,
  onUserSelect,
  darkMode = false,
  loading = false,
}: UsersGridProps) => {
  const gridRef = useRef<AGGridWrapperRef<User>>(null);

  const columnDefs = useMemo(
    (): ColDef<User>[] => [
      {
        field: 'name',
        headerName: 'Name',
        flex: 2,
        minWidth: 150,
        cellRenderer: (params: any) => {
          const { name, email } = params.data;
          return (
            <div className="flex flex-col py-1">
              <div className="font-medium text-sm">{name}</div>
              {email && (
                <div className="text-muted-foreground text-xs">{email}</div>
              )}
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
        valueFormatter: (params: any) => {
          if (!params.value) return '-';
          return new Date(params.value).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          });
        },
      },
      {
        field: '_id',
        headerName: 'ID',
        flex: 1,
        minWidth: 100,
        valueFormatter: (params: any) => {
          if (!params.value) return '-';
          return params.value.substring(0, 8) + '...';
        },
      },
    ],
    []
  );

  const handleCellClicked = (event: CellClickedEvent<User>) => {
    if (event.data && onUserSelect) {
      onUserSelect(event.data);
    }
  };

  const handleRowSelectionChanged = (selectedRows: User[]) => {
    if (selectedRows.length > 0 && onUserSelect) {
      onUserSelect(selectedRows[0]);
    }
  };

  return (
    <AGGridWrapper<User>
      allowContextMenuWithControlKey={true}
      animateRows={true}
      columnDefs={columnDefs}
      darkMode={darkMode}
      enableSelection={true}
      getRowClass={(params) => {
        // Add custom row styling here if needed
        return '';
      }}
      height={height}
      loading={loading}
      loadingMessage="Loading users..."
      noDataMessage="No users found"
      onCellClicked={handleCellClicked}
      onRowSelectionChanged={handleRowSelectionChanged}
      // Custom grid options
      paginationPageSize={25}
      paginationPageSizeSelector={[25, 50, 100]}
      ref={gridRef} // Taller rows for the two-line name/email layout
      rowData={users}
      // Row styling
      rowHeight={56}
      // Tooltips
      selectionMode="single"
      // Context menu
      suppressMenuHide={false}
      // Column menu
      tooltipShowDelay={500}
    />
  );
};
