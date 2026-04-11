import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

interface PageProps {
  params: { clubId: string; locale: string }
}

function formatPrice(cents: number): string {
  return `€${(cents / 100).toFixed(2).replace('.', ',')}`
}

export default async function BotigaPage({ params: { clubId, locale } }: PageProps) {
  const supabase = createClient()

  const { data: club } = await supabase
    .from('clubs')
    .select('id, name')
    .eq('id', clubId)
    .maybeSingle()

  if (!club) {
    return (
      <div className="max-w-3xl">
        <div className="card text-center py-12">
          <div className="eyebrow mb-2">404</div>
          <h1 className="font-display font-black text-3xl uppercase mb-4">Club no trobat</h1>
          <Link href={`/${locale}/clubs`} className="btn-ghost inline-block">← Clubs</Link>
        </div>
      </div>
    )
  }

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('club_id', clubId)
    .eq('in_stock', true)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <section className="hero p-6 md:p-10">
        <div className="hero-glow" />
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-accent-line" />
        <div className="relative z-10">
          <Link
            href={`/${locale}/clubs/${clubId}`}
            className="eyebrow-light hover:text-accent transition-colors"
          >
            ← TORNAR AL CLUB
          </Link>
          <div className="eyebrow-light mt-3 mb-2">🛒 BOTIGA OFICIAL · TEMPORADA 2025/26</div>
          <h1 className="font-display font-black text-3xl md:text-5xl text-white uppercase tracking-tighter">
            {club.name}
          </h1>
        </div>
      </section>

      {!products || products.length === 0 ? (
        <div className="card text-center py-16">
          <div className="eyebrow mb-3">🛒 BOTIGA</div>
          <h2 className="font-display font-black text-3xl uppercase mb-4">
            Botiga en preparació
          </h2>
          <p className="font-sans text-ink2 max-w-md mx-auto">
            Els productes oficials del club s&apos;estan preparant. Torna aviat per veure la
            col·lecció completa.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {products.map((p: any) => (
            <div key={p.id} className="card-hover bg-card border border-border p-0 overflow-hidden">
              <div className="aspect-square bg-surface border-b border-border flex items-center justify-center relative">
                {p.image_url ? (
                  <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-6xl">👕</div>
                )}
                {p.is_new && (
                  <div className="absolute top-3 left-0 bg-accent text-white font-mono text-[10px] uppercase tracking-wider px-2 py-1">
                    NOU
                  </div>
                )}
                {p.is_pack && (
                  <div className="absolute top-3 left-0 bg-neon text-ink font-mono text-[10px] uppercase tracking-wider px-2 py-1 font-bold">
                    PACK
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="font-display font-black uppercase text-sm tracking-tight truncate">
                  {p.name}
                </div>
                {p.description && (
                  <div className="font-mono text-[10px] text-ink3 uppercase mt-1 truncate">
                    {p.description}
                  </div>
                )}
                <div className="flex items-center justify-between mt-3">
                  <div>
                    {p.original_price_cents && (
                      <span className="font-mono text-[10px] text-ink3 line-through mr-1">
                        {formatPrice(p.original_price_cents)}
                      </span>
                    )}
                    <span className="font-display font-black text-xl text-ink">
                      {formatPrice(p.price_cents)}
                    </span>
                  </div>
                  <button className="btn-primary text-xs py-2 px-3">+</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
