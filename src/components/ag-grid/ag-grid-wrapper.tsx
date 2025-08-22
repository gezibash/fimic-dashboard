'use client';

import {
  AllCommunityModule,
  type CellClickedEvent,
  type FilterChangedEvent,
  type GridApi,
  type GridOptions,
  type GridReadyEvent,
  ModuleRegistry,
  type RowSelectedEvent,
  type SortChangedEvent,
} from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { Loader2 } from 'lucide-react';
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';
import { theme } from './theme';

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);

export type AGGridWrapperProps<TData = Record<string, unknown>> = Omit<
  GridOptions<TData>,
  'theme'
> & {
  /** Height of the grid container */
  height?: number | string;
  /** Width of the grid container */
  width?: number | string;
  /** Whether to use dark mode theme */
  darkMode?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Custom styles */
  style?: React.CSSProperties;
  /** Loading state */
  loading?: boolean;
  /** Loading message */
  loadingMessage?: string;
  /** No data message */
  noDataMessage?: string;
  /** Enable row selection */
  enableSelection?: boolean;
  /** Selection mode */
  selectionMode?: 'single' | 'multiple';
  /** Callback when rows are selected */
  onRowSelectionChanged?: (selectedRows: TData[]) => void;
  /** Callback when a cell is clicked */
  onCellClicked?: (event: CellClickedEvent<TData>) => void;
  /** Callback when sorting changes */
  onSortChanged?: (event: SortChangedEvent<TData>) => void;
  /** Callback when filtering changes */
  onFilterChanged?: (event: FilterChangedEvent<TData>) => void;
};

export type AGGridWrapperRef<TData = Record<string, unknown>> = {
  /** Get the AG Grid API instance */
  getGridApi: () => GridApi<TData> | null;
  /** Get selected rows */
  getSelectedRows: () => TData[];
  /** Set selected rows */
  setSelectedRows: (rowIds: (string | number)[]) => void;
  /** Refresh the grid */
  refresh: () => void;
  /** Export to CSV */
  exportToCsv: (filename?: string) => void;
  /** Auto-size all columns */
  autoSizeAllColumns: () => void;
};

const AGGridWrapperComponent = <
  TData extends Record<string, unknown> = Record<string, unknown>,
>(
  {
    height = '100%',
    width = '100%',
    darkMode = false,
    className,
    style,
    loading = false,
    loadingMessage = 'Loading data...',
    noDataMessage = 'No data available',
    enableSelection = false,
    selectionMode = 'single',
    onRowSelectionChanged,
    onCellClicked,
    onSortChanged,
    onFilterChanged,
    rowData,
    columnDefs,
    ...gridOptions
  }: AGGridWrapperProps<TData>,
  ref: React.Ref<AGGridWrapperRef<TData>>
) => {
  const gridRef = useRef<AgGridReact<TData>>(null);
  const gridApiRef = useRef<GridApi<TData> | null>(null);

  // Default grid options with sensible defaults
  const defaultGridOptions: Partial<GridOptions<TData>> = useMemo(
    () => ({
      // Selection
      ...(enableSelection && {
        rowSelection: {
          mode: selectionMode === 'multiple' ? 'multiRow' : 'singleRow',
          enableClickSelection: true,
          enableSelectionWithoutKeys: selectionMode === 'single',
        },
      }),

      // Pagination
      pagination: true,

      // Default column definition
      defaultColDef: {
        resizable: true,
        sortable: true,
        filter: true,
        floatingFilter: false,
      },
    }),
    [enableSelection, selectionMode]
  );

  // Merged grid options - don't memoize gridOptions since it's passed as prop
  const mergedGridOptions = {
    ...defaultGridOptions,
    rowData,
    columnDefs,
    ...gridOptions, // Spread gridOptions last to allow overriding
  };

  // Grid ready callback
  const onGridReady = useCallback(
    (event: GridReadyEvent<TData>) => {
      gridApiRef.current = event.api;

      // Auto-size columns on first load
      if (columnDefs?.length) {
        event.api.sizeColumnsToFit();
      }

      // Call user's onGridReady if provided
      gridOptions.onGridReady?.(event);
    },
    [gridOptions.onGridReady, columnDefs]
  );

  // Row selection changed callback
  const onRowSelected = useCallback(
    (event: RowSelectedEvent<TData>) => {
      if (onRowSelectionChanged && gridApiRef.current) {
        const selectedRows = gridApiRef.current.getSelectedRows();
        onRowSelectionChanged(selectedRows);
      }

      // Call user's onRowSelected if provided
      gridOptions.onRowSelected?.(event);
    },
    [onRowSelectionChanged, gridOptions.onRowSelected]
  );

  // Expose API methods via ref
  useImperativeHandle(
    ref,
    () => ({
      getGridApi: () => gridApiRef.current,
      getSelectedRows: () => gridApiRef.current?.getSelectedRows() || [],
      setSelectedRows: (rowIds: (string | number)[]) => {
        if (gridApiRef.current) {
          gridApiRef.current.forEachNode((node) => {
            const isSelected = rowIds.includes(node.id || '');
            node.setSelected(isSelected);
          });
        }
      },
      refresh: () => gridApiRef.current?.refreshCells(),
      exportToCsv: (filename = 'export.csv') => {
        gridApiRef.current?.exportDataAsCsv({ fileName: filename });
      },
      autoSizeAllColumns: () => {
        gridApiRef.current?.autoSizeAllColumns();
      },
    }),
    []
  );

  return (
    <AgGridReact<TData>
      ref={gridRef}
      {...mergedGridOptions}
      loadingOverlayComponent={() => (
        <div className="flex h-full w-full items-center justify-center">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      )}
      onCellClicked={onCellClicked}
      onFilterChanged={onFilterChanged}
      onGridReady={onGridReady}
      onRowSelected={onRowSelected}
      onSortChanged={onSortChanged}
      theme={theme}
    />
  );
};

// Use forwardRef to support ref forwarding with generic types
export const AGGridWrapper = forwardRef(AGGridWrapperComponent) as <
  TData = Record<string, unknown>,
>(
  props: AGGridWrapperProps<TData> & {
    ref?: React.Ref<AGGridWrapperRef<TData>>;
  }
) => React.ReactElement;
