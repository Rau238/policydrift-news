import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'NewsFree365 Admin Portal',
  description: 'Editorial desk, news pipelines, RSS sources and ranking controls.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-portal fixed inset-0 z-50 flex h-full min-h-[100dvh] w-full min-w-0 flex-col overflow-hidden bg-[#070b14] text-slate-100 font-sans antialiased">
      <div className="flex h-full w-full flex-1 min-w-0 flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}
