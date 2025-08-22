import { themeAlpine } from 'ag-grid-community';

export const theme = themeAlpine.withParams({
  fontFamily: 'var(--font-geist)',
  fontSize: 13,
  headerFontSize: 14,
  rowHoverColor: 'var(--color-primary-foreground)',
  selectedRowBackgroundColor: 'var(--color-primary-foreground)',
});
