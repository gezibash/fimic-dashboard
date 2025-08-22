import type { GridOptions } from 'ag-grid-community';

export interface GeistThemeParams {
  fontFamily?: string;
  fontSize?: number;
  headerFontSize?: number;
  rowHeight?: number;
  headerHeight?: number;
  backgroundColor?: string;
  foregroundColor?: string;
  headerBackgroundColor?: string;
  headerForegroundColor?: string;
  borderColor?: string;
  oddRowBackgroundColor?: string;
  rowHoverColor?: string;
  selectedRowBackgroundColor?: string;
  selectedRowBorderColor?: string;
  checkboxCheckedColor?: string;
  rangeSelectionBackgroundColor?: string;
  rangeSelectionBorderColor?: string;
}

export const createGeistTheme = (darkMode = false): Partial<GridOptions> => {
  const lightThemeParams: GeistThemeParams = {
    fontFamily: 'var(--font-geist-sans)',
    fontSize: 14,
    headerFontSize: 14,
    rowHeight: 42,
    headerHeight: 48,
    backgroundColor: 'hsl(var(--background))',
    foregroundColor: 'hsl(var(--foreground))',
    headerBackgroundColor: 'hsl(var(--muted))',
    headerForegroundColor: 'hsl(var(--muted-foreground))',
    borderColor: 'hsl(var(--border))',
    oddRowBackgroundColor: 'hsl(var(--background))',
    rowHoverColor: 'hsl(var(--muted) / 0.5)',
    selectedRowBackgroundColor: 'hsl(var(--accent))',
    selectedRowBorderColor: 'hsl(var(--border))',
    checkboxCheckedColor: 'hsl(var(--primary))',
    rangeSelectionBackgroundColor: 'hsl(var(--accent) / 0.3)',
    rangeSelectionBorderColor: 'hsl(var(--primary))',
  };

  const darkThemeParams: GeistThemeParams = {
    ...lightThemeParams,
    // Dark mode inherits from CSS variables automatically
    // The CSS variables handle the dark mode switching
  };

  const params = darkMode ? darkThemeParams : lightThemeParams;

  return {
    // Don't set the theme property here - it will be handled by CSS classes
    // Apply theme parameters using CSS variables
    // AG Grid will automatically use these when the theme is applied
  };
};

// CSS-in-JS styles for the AG Grid theme
export const getGridThemeStyles = (darkMode = false): React.CSSProperties => {
  return {
    fontFamily: 'var(--font-geist-sans)',
    fontSize: '14px',
    '--ag-font-family': 'var(--font-geist-sans)',
    '--ag-font-size': '14px',
    '--ag-header-font-size': '14px',
    '--ag-row-height': '42px',
    '--ag-header-height': '48px',
    '--ag-background-color': 'hsl(var(--background))',
    '--ag-foreground-color': 'hsl(var(--foreground))',
    '--ag-border-color': 'hsl(var(--border))',
    '--ag-secondary-border-color': 'hsl(var(--border))',
    '--ag-header-background-color': 'hsl(var(--muted))',
    '--ag-header-foreground-color': 'hsl(var(--muted-foreground))',
    '--ag-odd-row-background-color': 'hsl(var(--background))',
    '--ag-row-hover-color': 'hsl(var(--muted) / 0.5)',
    '--ag-selected-row-background-color': 'hsl(var(--accent))',
    '--ag-selected-row-border-color': 'hsl(var(--border))',
    '--ag-checkbox-checked-color': 'hsl(var(--primary))',
    '--ag-range-selection-background-color': 'hsl(var(--accent) / 0.3)',
    '--ag-range-selection-border-color': 'hsl(var(--primary))',
    '--ag-card-radius': 'calc(var(--radius) - 2px)',
    '--ag-card-shadow':
      '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  } as React.CSSProperties;
};

export const AG_GRID_THEME_CLASS = 'ag-theme-quartz';
export const AG_GRID_THEME_CLASS_DARK = 'ag-theme-quartz-dark';
