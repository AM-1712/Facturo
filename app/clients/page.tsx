'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Plus, LayoutDashboard, Users, FileText, X } from "lucide-react"
import Link from "next/link"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [nom, setNom] = useState('')
  const [email, setEmail] = useState('')
  const [telephone, setTelephone] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => { getClients() }, [])

  async function getClients() {
    setLoading(true)
    const { data } = await supabase.from('clients').select('*').order('created_at', { ascending: false })
    setClients(data || [])
    setLoading(false)
  }

  async function ajouterClient() {
    if(!nom || !email) return alert('Nom et Email obligatoires')
    const { error } = await supabase.from('clients').insert([{ nom, email, telephone }])
    if(error) return alert(error.message)
    setShowForm(false)
    setNom(''); setEmail(''); setTelephone('')
    getClients()
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-[#16a34a] text-white flex flex-col">
        <div className="p-6"><h1 className="text-2xl font-bold">Facturo</h1></div>
        <nav className="flex-1 px-4">
          <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#15803d] mb-2"><LayoutDashboard size={20} /> Dashboard</Link>
          <Link href="/clients" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[#15803d] mb-2"><Users size={20} /> Clients</Link>
          <Link href="/factures" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#15803d] mb-2"><FileText size={20} /> Factures</Link>
        </nav>
      </aside>

      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Clients</h2>
          <button onClick={() => setShowForm(true)} className="bg-[#16a34a] hover:bg-[#15803d] text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <Plus size={16}/> Nouveau Client
          </button>
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-96">
              <div className="flex justify-between mb-4">
                <h3 className="text-lg font-bold">Nouveau Client</h3>
                <X onClick={() => setShowForm(false)} className="cursor-pointer"/>
              </div>
              <input placeholder="Nom *" value={nom} onChange={e => setNom(e.target.value)} className="w-full border p-2 mb-3 rounded"/>
              <input placeholder="Email *" value={email} onChange={e => setEmail(e.target.value)} className="w-full border p-2 mb-3 rounded"/>
              <input placeholder="Téléphone" value={telephone} onChange={e => setTelephone(e.target.value)} className="w-full border p-2 mb-3 rounded"/>
              <button onClick={ajouterClient} className="w-full bg-[#16a34a] text-white p-2 rounded font-semibold">Enregistrer</button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b"><h3 className="text-lg font-semibold">Liste des clients</h3></div>
          {loading ? <p className="p-6">Chargement...</p> : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Nom</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Email</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Téléphone</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {clients.length === 0 ? (
                <tr><td colSpan={3} className="px-6 py-4 text-center text-gray-500">Aucun client. Clique sur "Nouveau Client"</td></tr>
              ) : clients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{client.nom}</td>
                  <td className="px-6 py-4 text-gray-600">{client.email}</td>
                  <td className="px-6 py-4 text-gray-600">{client.telephone}</td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>
      </main>
    </div>
  )
}