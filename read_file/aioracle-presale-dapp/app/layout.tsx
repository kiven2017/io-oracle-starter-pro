import './globals.css';
import type { Metadata } from 'next';
import { AppProviders } from '@/components/providers';

export const metadata: Metadata = {
  title: 'AIOracle Presale dApp',
  description: 'Physical Truth Infrastructure for Real-World Assets',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
