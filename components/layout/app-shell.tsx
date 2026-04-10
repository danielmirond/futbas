import { Header } from './header'
import { BottomNav } from './bottom-nav'

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface">
      <Header />
      <main className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8 pb-24 md:pb-12">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
