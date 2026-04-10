export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-primary relative flex items-center justify-center px-4 overflow-hidden">
      {/* Glow decorations */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full pointer-events-none"
           style={{ background: 'radial-gradient(circle, rgba(255,40,130,.15), transparent 65%)' }} />
      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full pointer-events-none"
           style={{ background: 'radial-gradient(circle, rgba(0,255,133,.08), transparent 65%)' }} />
      <div className="absolute top-0 left-0 right-0 accent-line" />
      <div className="absolute bottom-0 left-0 right-0 accent-line" />

      <div className="w-full max-w-sm relative z-10">
        <div className="text-center mb-10">
          <h1 className="font-display font-black text-5xl uppercase tracking-tight text-white">
            FUT<span className="text-accent">BAS</span>
          </h1>
          <p className="eyebrow-light mt-2">FUTBOL AMATEUR CATALÀ</p>
        </div>
        <div className="bg-card p-6 border-l-[3px] border-l-accent border-y border-r border-border">
          {children}
        </div>
      </div>
    </div>
  )
}
