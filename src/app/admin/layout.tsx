import type { Metadata } from 'next';
import '@/styles/admin.css';

export const metadata: Metadata = {
  title: 'WatchTown Admin & Inventory CRM',
  description: 'Enterprise inventory control, stock management, and product catalog CRM for WatchTown.',
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
    <div className="admin-body">
      {children}
    </div>
  );
}
