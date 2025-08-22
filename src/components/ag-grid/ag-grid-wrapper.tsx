'use client';

import type {
  CellClickedEvent,
  FilterChangedEvent,
  GridApi,
  GridOptions,
  GridReadyEvent,
  RowSelectedEvent,
  SortChangedEvent,
} from 'ag-grid-community';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';
import { cn } from '@/lib/utils';
import {
  AG_GRID_THEME_CLASS,
  AG_GRID_THEME_CLASS_DARK,
  createGeistTheme,
  getGridThemeStyles,
} from './theme';

// Import AG Grid CSS
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

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
    height = 400,
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

  // Theme configuration
  const themeConfig = useMemo(() => createGeistTheme(darkMode), [darkMode]);
  const themeStyles = useMemo(() => getGridThemeStyles(darkMode), [darkMode]);
  const themeClassName = darkMode
    ? AG_GRID_THEME_CLASS_DARK
    : AG_GRID_THEME_CLASS;

  // Default grid options with sensible defaults
  const defaultGridOptions: Partial<GridOptions<TData>> = useMemo(
    () => ({
      // Selection
      ...(enableSelection && {
        rowSelection: selectionMode === 'multiple' ? 'multiple' : 'single',
        suppressRowClickSelection: false,
        suppressRowDeselection: selectionMode === 'single',
      }),

      // Pagination
      pagination: true,
      paginationPageSize: 50,
      paginationPageSizeSelector: [25, 50, 100, 200],

      // Sorting and filtering
      sortable: true,
      filter: true,
      floatingFilter: false,

      // Row and column sizing
      rowHeight: 42,
      headerHeight: 48,
      suppressSizeToFit: false,

      // Animation
      animateRows: true,

      // Loading and empty states
      loadingOverlayComponent: () =>
        `<div class="ag-overlay-loading-center">${loadingMessage}</div>`,
      noRowsOverlayComponent: () =>
        `<div class="ag-overlay-no-rows-center">${noDataMessage}</div>`,

      // Accessibility
      suppressMenuHide: false,
      suppressMovableColumns: false,

      // Default column definition
      defaultColDef: {
        resizable: true,
        sortable: true,
        filter: true,
        flex: 1,
        minWidth: 100,
      },

      ...themeConfig,
    }),
    [enableSelection, selectionMode, loadingMessage, noDataMessage, themeConfig]
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

  // Handle loading state
  useEffect(() => {
    if (loading && gridApiRef.current) {
      gridApiRef.current.showLoadingOverlay();
    } else if (!loading && gridApiRef.current) {
      gridApiRef.current.hideOverlay();
    }
  }, [loading]);

  const containerStyle: React.CSSProperties = {
    height,
    width,
    ...themeStyles,
    ...style,
  };

  return (
    <div
      className={cn(themeClassName, 'rounded-md border', className)}
      style={containerStyle}
    >
      <AgGridReact<TData>
        ref={gridRef}
        {...mergedGridOptions}
        onCellClicked={onCellClicked}
        onFilterChanged={onFilterChanged}
        onGridReady={onGridReady}
        onRowSelected={onRowSelected}
        onSortChanged={onSortChanged}
      />
    </div>
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
