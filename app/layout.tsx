import type { Metadata } from 'next';
import './globals.css';
import { DataProvider } from '@/components/layout/DataProvider';
import { AppShell } from '@/components/layout/AppShell';

export const metadata: Metadata = {
  title: 'MP6 Japanese Learning Evaluation',
  description: 'Educational experiment data analysis system for AI-assisted Japanese learning'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <DataProvider>
          <AppShell>{children}</AppShell>
        </DataProvider>
      </body>
    </html>
  );
}
