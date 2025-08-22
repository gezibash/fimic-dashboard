// Override types for Radix UI Slot to fix complex ref type inference issues
declare module '@radix-ui/react-slot' {
  import * as React from 'react';

  export interface SlotProps extends React.HTMLAttributes<HTMLElement> {
    children?: React.ReactNode;
  }

  export const Slot: React.ForwardRefExoticComponent<
    SlotProps & React.RefAttributes<HTMLElement>
  >;
}
