export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-serif text-display">Futbas</h1>
          <p className="text-muted mt-1">Futbol Amateur</p>
        </div>
        {children}
      </div>
    </div>
  )
}
