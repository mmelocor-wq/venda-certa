import AppSidebar from './AppSidebar';
import WelcomeDialog from './WelcomeDialog';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_hsl(var(--primary)/0.10),_transparent_26%),linear-gradient(180deg,_hsl(var(--background)),_hsl(var(--background))_40%,_hsl(var(--accent)/0.32))]">
      <WelcomeDialog />
      <div className="flex min-h-screen">
        <AppSidebar />
        <main className="min-w-0 flex-1 overflow-auto">
          <div className="mx-auto max-w-7xl p-4 pt-16 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
