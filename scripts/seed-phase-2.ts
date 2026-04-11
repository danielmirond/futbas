/**
 * Seed script for Phase 2 demo data.
 * Creates products + memberships for a real club (Argentona leader of Primera Catalana Grup 1).
 *
 * Run: npx tsx scripts/seed-phase-2.ts
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing env vars')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
})

async function main() {
  console.log('🌱 Seeding Phase 2 data')

  // 1. Find Argentona club
  const { data: club } = await supabase
    .from('clubs')
    .select('id, name')
    .ilike('name', '%ARGENTONA%')
    .maybeSingle()

  if (!club) {
    console.error('Argentona not found — run scraper first')
    process.exit(1)
  }
  console.log(`Found club: ${club.name} (${club.id})`)

  // 2. Seed products
  const products = [
    {
      club_id: club.id,
      name: 'Samarreta Local 2025/26',
      description: 'Adidas · Oficial',
      category: 'shirt',
      price_cents: 6500,
      original_price_cents: 7500,
      in_stock: true,
      is_new: true,
      is_pack: false,
    },
    {
      club_id: club.id,
      name: 'Samarreta Visitant 2025/26',
      description: 'Adidas · Oficial',
      category: 'shirt',
      price_cents: 6500,
      in_stock: true,
      is_new: false,
      is_pack: false,
    },
    {
      club_id: club.id,
      name: 'Bufanda + Gorra Pack',
      description: 'Edició limitada centenari',
      category: 'accessory',
      price_cents: 2900,
      in_stock: true,
      is_new: false,
      is_pack: true,
    },
    {
      club_id: club.id,
      name: 'Xandall oficial',
      description: 'Adidas · Entrenament',
      category: 'equipment',
      price_cents: 8900,
      in_stock: true,
      is_new: false,
      is_pack: false,
    },
    {
      club_id: club.id,
      name: 'Samarreta infantil',
      description: 'Talles 4-14 anys',
      category: 'kids',
      price_cents: 4500,
      in_stock: true,
      is_new: false,
      is_pack: false,
    },
    {
      club_id: club.id,
      name: 'Motxilla oficial',
      description: 'Capacitat 25L',
      category: 'accessory',
      price_cents: 3500,
      in_stock: true,
      is_new: true,
      is_pack: false,
    },
  ]

  // Check if products already exist
  const { count } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('club_id', club.id)

  if (count && count > 0) {
    console.log(`⚠  ${count} products already exist for ${club.name} — skipping`)
  } else {
    const { error: prodErr } = await supabase.from('products').insert(products)
    if (prodErr) {
      console.error('Product insert error:', prodErr)
    } else {
      console.log(`✅ Inserted ${products.length} products`)
    }
  }

  // 3. Seed memberships (socis)
  const members = [
    { member_name: 'Jordi Puig', member_number: '001', team_category: 'Sènior A', amount_cents: 8000, status: 'paid', paid_at: new Date().toISOString() },
    { member_name: 'Marc Torres', member_number: '002', team_category: 'Sènior A', amount_cents: 8000, status: 'paid', paid_at: new Date().toISOString() },
    { member_name: 'Laia Font', member_number: '003', team_category: 'Sènior A', amount_cents: 8000, status: 'paid', paid_at: new Date().toISOString() },
    { member_name: 'Arnau Mas', member_number: '004', team_category: 'Sènior A', amount_cents: 8000, status: 'paid', paid_at: new Date().toISOString() },
    { member_name: 'Pau Soler', member_number: '005', team_category: 'Sènior A', amount_cents: 8000, status: 'pending', due_date: '2026-04-30' },
    { member_name: 'Oriol Ferrer', member_number: '006', team_category: 'Sènior A', amount_cents: 8000, status: 'pending', due_date: '2026-04-30' },
    { member_name: 'Biel Torres', member_number: '007', team_category: 'Sènior A', amount_cents: 8000, status: 'paid', paid_at: new Date().toISOString() },
    { member_name: 'Pau Ferrer', member_number: '021', team_category: 'Juvenil', amount_cents: 12000, status: 'overdue', due_date: '2026-02-15' },
    { member_name: 'Rosa Camps', member_number: '022', team_category: 'Juvenil', amount_cents: 12000, status: 'paid', paid_at: new Date().toISOString() },
    { member_name: 'David Roca', member_number: '023', team_category: 'Juvenil', amount_cents: 12000, status: 'overdue', due_date: '2026-02-15' },
    { member_name: 'Nil Vidal', member_number: '024', team_category: 'Cadet', amount_cents: 6000, status: 'paid', paid_at: new Date().toISOString() },
    { member_name: 'Max Puig', member_number: '025', team_category: 'Cadet', amount_cents: 6000, status: 'paid', paid_at: new Date().toISOString() },
  ]

  const { count: memCount } = await supabase
    .from('memberships')
    .select('*', { count: 'exact', head: true })
    .eq('club_id', club.id)

  if (memCount && memCount > 0) {
    console.log(`⚠  ${memCount} memberships already exist for ${club.name} — skipping`)
  } else {
    const { error: memErr } = await supabase
      .from('memberships')
      .insert(members.map((m) => ({ ...m, club_id: club.id })))
    if (memErr) {
      console.error('Memberships insert error:', memErr)
    } else {
      console.log(`✅ Inserted ${members.length} memberships`)
    }
  }

  console.log('\n✨ Done!')
  console.log(`   Visit: /ca/admin/${club.id}`)
  console.log(`   Visit: /ca/botiga/${club.id}`)
}

main().catch((err) => {
  console.error('Fatal:', err)
  process.exit(1)
})
