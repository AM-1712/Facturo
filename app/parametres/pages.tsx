'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { LayoutDashboard, Users, FileText, Settings, Save } from "lucide-react"
import Link from "next/link"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function ParametresPage() {
  const [nom, setNom] = useState('')
  const [adresse, setAdresse] = useState('')
  const [tel, setTel] = useState('')
  const [email, setEmail] = useState('')

  useEffect(() => { getProfil() }, [])

  async function getProfil() {
    const { data } = await supabase.from('profil').select('*').limit(1).single()
    if(data) {
      setNom(data.nom_entreprise || '')
      setAdresse(data.adresse || '')
      setTel(data.telephone || '')
      setEmail(data.email || '')
    }
  }

  async function sauvegarder() {
    const { data: existant } = await supabase.from('profil').select('id').limit(1).single()
    
    if(existant) {
      await supabase.from('profil').update({
        nom_entreprise: nom, adresse, telephone: tel, email
      }).eq('id', existant.id)
    } else {
      await supabase.from('profil').insert([{
        nom_entreprise: nom, adresse, telephone: tel, email
      }])
    }
    alert('Informations sauvegardées !')
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-[#16a34a] text-white flex-col">
        <div className="p-6"><h1 className="text-2xl font-bold">Facturo</h1></div>
        <nav className="flex-1 px-4">
          <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#15803d] mb-2"><LayoutDashboard size={20} /> Dashboard</Link>
          <Link href="/clients" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#15803d] mb-2"><Users size={20} /> Clients</Link>
          <Link href="/factures" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#15803d] mb-2"><FileText size={20} /> Factures</Link>
          <Link href="/parametres" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[#15803d] mb-2"><Settings size={20} /> Paramètres</Link>
        </nav>
      </aside>

      <main className="flex-1 p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Paramètres de l'entreprise</h2>
        <div className="bg-white p-6 rounded-lg shadow max-w-2xl">
          <label className="block mb-1 font-medium">Nom de l'entreprise</label>
          <input placeholder="Ex: Mon Entreprise SARL" value={nom} onChange={e => setNom(e.target.value)} className="w-full border p-3 mb-4 rounded"/>
          
          <label className="block mb-1 font-medium">Adresse</label>
          <input placeholder="Ex: 123 Rue de Paris, 75001 Paris" value={adresse} onChange={e => setAdresse(e.target.value)} className="w-full border p-3 mb-4 rounded"/>
          
          <label className="block mb-1 font-medium">Téléphone</label>
          <input placeholder="Ex: +33 6 12 34 56 78" value={tel} onChange={e => setTel(e.target.value)} className="w-full border p-3 mb-4 rounded"/>
          
          <label className="block mb-1 font-medium">Email</label>
          <input placeholder="Ex: contact@monentreprise.com" value={email} onChange={e => setEmail(e.target.value)} className="w-full border p-3 mb-4 rounded"/>
          
          <button onClick={sauvegarder} className="bg-[#16a34a] text-white px-6 py-3 rounded-lg flex items-center gap-2 font-semibold hover:bg-[#15803d]">
            <Save size={18}/> Sauvegarder
          </button>
        </div>
      </main>
    </div>
  )
}