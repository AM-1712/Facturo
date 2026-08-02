'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Plus, LayoutDashboard, Users, FileText, Settings, X, Download } from "lucide-react"
import Link from "next/link"
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function FacturesPage() {
  const [factures, setFactures] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [clientId, setClientId] = useState('')
  const [montant, setMontant] = useState('')

  useEffect(() => {
    getData()
  }, [])

  async function getData() {
    const { data: f } = await supabase.from('factures').select('*, clients(nom, email)')
    const { data: c } = await supabase.from('clients').select('*')
    setFactures(f || [])
    setClients(c || [])
  }

  async function creerFacture() {
    if(!clientId || !montant) return alert('Remplis tout')
    const numero = `F-${Date.now()}`
    const { error } = await supabase.from('factures').insert([{ 
      numero, 
      client_id: clientId, 
      montant: parseFloat(montant) 
    }])
    if(error) return alert(error.message)
    
    await genererPDF(numero, clientId, montant) // <-- AJOUT DU AWAIT
    
    setShowForm(false)
    setClientId(''); setMontant('')
    getData()
  }

  async function genererPDF(numero: string, clientId: string, montant: string) { // <-- ASYNC ICI
    const { data: profil } = await supabase.from('profil').select('*').limit(1).single() // <-- ON RÉCUPÈRE LE PROFIL
    const client = clients.find(c => c.id === clientId)
    const doc = new jsPDF()
    
    // EN-TETE AVEC INFOS PERSO
    doc.setFillColor(22, 163, 74)
    doc.rect(0, 0, 210, 40, 'F')
    doc.setTextColor(255,255,255)
    doc.setFontSize(22)
    doc.text(profil?.nom_entreprise || "FACTURO", 20, 25)
    doc.setFontSize(10)
    doc.text(`${profil?.adresse || ''} - ${profil?.telephone || ''} - ${profil?.email || ''}`, 20, 32)
    
    // CORPS
    doc.setTextColor(0,0,0)
    doc.setFontSize(18)
    doc.text("FACTURE", 105, 60, { align: "center" })
    doc.setFontSize(11)
    doc.text(`N°: ${numero}`, 20, 75)
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 82)
    doc.text(`Client: ${client?.nom}`, 20, 89)
    doc.text(`Email: ${client?.email}`, 20, 96)
    
    autoTable(doc, {
      startY: 110,
      head: [['Description', 'Montant']],
      body: [['Prestation de service', `${montant} €`]],
      theme: 'grid',
      headStyles: { fillColor: [22, 163, 74] }
    })
    
    doc.setFontSize(12)
    doc.text(`Total TTC: ${montant} €`, 150, doc.lastAutoTable.finalY + 10)
    
    doc.setFontSize(8)
    doc.text("Merci pour votre confiance", 105, 280, { align: "center" })
    
    doc.save(`${numero}.pdf`)
  } // <-- CETTE ACCOLADE MANQUAIT

  return ( // <-- LE RETURN COMMENCE ICI
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-[#16a34a] text-white flex flex-col">
        <div className="p-6"><h1 className="text-2xl font-bold">Facturo</h1></div>
        <nav className="flex-1 px-4">
          <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#15803d] mb-2"><LayoutDashboard size={20} /> Dashboard</Link>
          <Link href="/clients" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#15803d] mb-2"><Users size={20} /> Clients</Link>
          <Link href="/factures" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[#15803d] mb-2"><FileText size={20} /> Factures</Link>
          <Link href="/parametres" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#15803d] mb-2"><Settings size={20} /> Paramètres</Link>
        </nav>
      </aside>

      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Factures</h2>
          <button onClick={() => setShowForm(true)} className="bg-[#16a34a] hover:bg-[#15803d] text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <Plus size={16}/> Nouvelle Facture
          </button>
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-96">
              <div className="flex justify-between mb-4">
                <h3 className="text-lg font-bold">Nouvelle Facture</h3>
                <X onClick={() => setShowForm(false)} className="cursor-pointer"/>
              </div>
              <select value={clientId} onChange={e => setClientId(e.target.value)} className="w-full border p-2 mb-3 rounded">
                <option value="">Choisir un client</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
              </select>
              <input type="number" placeholder="Montant €" value={montant} onChange={e => setMontant(e.target.value)} className="w-full border p-2 mb-3 rounded"/>
              <button onClick={creerFacture} className="w-full bg-[#16a34a] text-white p-2 rounded font-semibold flex items-center justify-center gap-2">
                <Download size={16}/> Créer et Télécharger PDF
              </button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b"><h3 className="text-lg font-semibold">Historique des factures</h3></div>
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">N°</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Client</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Montant</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {factures.map((f) => (
                <tr key={f.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{f.numero}</td>
                  <td className="px-6 py-4">{f.clients?.nom}</td>
                  <td className="px-6 py-4">{f.montant} €</td>
                  <td className="px-6 py-4"><span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">{f.statut}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}