import type { Metadata } from 'next';
import '@/styles/admin.css';

export const metadata: Metadata = {
  title: 'WatchTown Super Admin CRM',
  description: 'Executive management portal for WatchTown luxury timepieces.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div id="admin-root" className="admin-body">
      {children}
    </div>
  );
}
