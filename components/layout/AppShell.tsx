import Link from 'next/link';
import { BarChart3, Database, FileText, Home, Table2, Upload, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const navItems = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/analysis', label: 'Analysis', icon: BarChart3 },
  { href: '/participants', label: 'Participants', icon: Users },
  { href: '/table', label: 'Data Table', icon: Table2 },
  { href: '/import', label: 'CSV Import', icon: Upload },
  { href: '/results', label: 'Results Summary', icon: FileText },
  { href: '/methodology', label: 'Methodology', icon: Database }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-[var(--border)] bg-white p-5 lg:block">
        <div className="mb-8">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--primary)] text-xl font-black text-white">
            日
          </div>
          <h1 className="text-xl font-black leading-tight">MP6 Learning Evaluation</h1>
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">AI Japanese assessment data analysis system</p>
        </div>
        <nav className="grid gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--primary)]"
                href={item.href}
              >
                <Icon size={17} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-white/95 px-4 py-3 backdrop-blur lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[var(--muted-foreground)]">
                AI-Based Japanese Proficiency Assessment and Learning Evaluation System
              </p>
            </div>
            <Badge className="bg-[#fee9df] text-[var(--accent)]">DEMONSTRATION WITH SIMULATED DATA</Badge>
          </div>
        </header>
        <main className="px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
