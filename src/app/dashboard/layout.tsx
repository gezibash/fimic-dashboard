import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { ConvexClientProvider } from '@/providers/convex-client-provider';

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ConvexClientProvider>
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-background">
          <AppSidebar />
          <main className="flex flex-1 flex-col p-4">
            <div className="flex flex-1 flex-col">{children}</div>
          </main>
        </div>
      </SidebarProvider>
    </ConvexClientProvider>
  );
}
