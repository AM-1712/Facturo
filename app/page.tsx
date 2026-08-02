'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { LayoutDashboard, Users, FileText, DollarSign } from "lucide-react"
import Link from "next/link"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Dashboard() {
  const [stats, setStats] = useState({ clients: 0, factures: 0, ca: 0 })

  useEffect(() => {
    getStats()
  }, [])

  async function getStats() {
    const { data: clients } = await supabase.from('clients').select('id', { count: 'exact' })
    const { data: factures } = await supabase.from('factures').select('montant')
    
    const ca = factures?.reduce((sum, f) => sum + f.montant, 0) || 0
    
    setStats({
      clients: clients?.length || 0,
      factures: factures?.length || 0,
      ca: ca
    })
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-[#16a34a] text-white flex flex-col">
        <div className="p-6"><h1 className="text-2xl font-bold">Facturo</h1></div>
        <nav className="flex-1 px-4">
          <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[#15803d] mb-2"><LayoutDashboard size={20} /> Dashboard</Link>
          <Link href="/clients" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#15803d] mb-2"><Users size={20} /> Clients</Link>
          <Link href="/factures" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#15803d] mb-2"><FileText size={20} /> Factures</Link>
        </nav>
      </aside>

      <main className="flex-1 p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500">Clients</p>
                <p className="text-3xl font-bold">{stats.clients}</p>
              </div>
              <Users className="text-[#16a34a]" size={40} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500">Factures</p>
                <p className="text-3xl font-bold">{stats.factures}</p>
              </div>
              <FileText className="text-[#16a34a]" size={40} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500">Chiffre d'Affaires</p>
                <p className="text-3xl font-bold">{stats.ca} €</p>
              </div>
              <DollarSign className="text-[#16a34a]" size={40} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}