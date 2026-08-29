import React, { useState } from 'react';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Plus, 
  Trash2, 
  Edit2, 
  Save, 
  Search, 
  Building2, 
  Phone, 
  Mail, 
  CheckCircle2, 
  Sparkles,
  Shield,
  Briefcase
} from 'lucide-react';
import { ClientRecord, ClientContact, updateClientContacts } from '../data/clientsDatabase';

interface ClientMultiContactSelectorProps {
  clientsList: ClientRecord[];
  selectedClientId: string;
  onSelectClient: (client: ClientRecord) => void;
  contacts: ClientContact[];
  onChangeContacts: (contacts: ClientContact[]) => void;
  onUpdateClientsList?: (updatedClients: ClientRecord[]) => void;
  disabled?: boolean;
}

export const ClientMultiContactSelector: React.FC<ClientMultiContactSelectorProps> = ({
  clientsList,
  selectedClientId,
  onSelectClient,
  contacts,
  onChangeContacts,
  onUpdateClientsList,
  disabled = false
}) => {
  const [searchQuery, setSearchTerm] = useState('');
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [saveDbFeedback, setSaveDbFeedback] = useState<string | null>(null);

  const [newContactForm, setNewContactForm] = useState<Omit<ClientContact, 'id'>>({
    nombre: '',
    puesto: 'Compras / Operaciones',
    email: '',
    telefono: '',
    es_principal: false,
    incluir_en_envio: true
  });

  // Client search filter (matches number, ID, name, RFC, phone)
  const filteredClients = clientsList.filter(c => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      String(c.numero_cliente) === q ||
      c.id.toLowerCase().includes(q) ||
      c.razon_social.toLowerCase().includes(q) ||
      c.rfc.toLowerCase().includes(q) ||
      c.contactos.some(cnt => cnt.telefono.includes(q) || cnt.nombre.toLowerCase().includes(q))
    );
  });

  const selectedClient = clientsList.find(c => c.id === selectedClientId);

  const handleToggleContactSend = (contactId: string) => {
    const updated = contacts.map(c => 
      c.id === contactId ? { ...c, incluir_en_envio: !c.incluir_en_envio } : c
    );
    onChangeContacts(updated);
  };

  const handleUpdateContactField = (contactId: string, field: keyof ClientContact, value: any) => {
    const updated = contacts.map(c => 
      c.id === contactId ? { ...c, [field]: value } : c
    );
    onChangeContacts(updated);
  };

  const handleRemoveContact = (contactId: string) => {
    if (contacts.length <= 1) {
      alert("La cotización debe tener al menos un contacto asignado.");
      return;
    }
    const updated = contacts.filter(c => c.id !== contactId);
    onChangeContacts(updated);
  };

  const handleAddNewContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactForm.nombre.trim() || !newContactForm.email.trim()) {
      alert("Por favor ingrese el nombre y correo del nuevo contacto.");
      return;
    }

    const created: ClientContact = {
      ...newContactForm,
      id: `cnt-${Date.now()}`
    };

    const updated = [...contacts, created];
    onChangeContacts(updated);

    // Reset form
    setNewContactForm({
      nombre: '',
      puesto: 'Compras / Operaciones',
      email: '',
      telefono: '',
      es_principal: false,
      incluir_en_envio: true
    });
    setIsAddingContact(false);
  };

  // Sync / Save current contacts back to central clients database
  const handleSaveToClientDatabase = () => {
    if (!selectedClient) return;
    const updatedList = updateClientContacts(selectedClient.id, contacts);
    if (onUpdateClientsList) {
      onUpdateClientsList(updatedList);
    }
    setSaveDbFeedback("¡Contactos actualizados y guardados en la Base de Datos de Clientes!");
    setTimeout(() => setSaveDbFeedback(null), 3500);
  };

  const activeRecipientsCount = contacts.filter(c => c.incluir_en_envio).length;

  return (
    <div className="space-y-3">
      {/* 1. SELECCIÓN / BÚSQUEDA DE CLIENTE POR NÚMERO O NOMBRE */}
      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1.5">
          <label className="text-[10px] font-bold text-slate-700 uppercase font-mono flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-[#85AA1C]" />
            <span>1. Buscar Cliente (Por # de Cliente, ID o Razón Social) *</span>
          </label>
          <span className="text-[9px] font-mono text-slate-400">
            {clientsList.length} clientes en base de datos
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
          {/* Quick search input by number or text */}
          <div className="sm:col-span-4 relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar #1, CLI-001, etc..."
              value={searchQuery}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg pl-8 pr-2.5 py-1.5 text-xs font-mono font-medium focus:outline-none focus:ring-2 focus:ring-[#85AA1C]"
            />
          </div>

          {/* Client Select dropdown */}
          <div className="sm:col-span-8">
            <select
              value={selectedClientId}
              onChange={(e) => {
                const found = clientsList.find(c => c.id === e.target.value);
                if (found) {
                  onSelectClient(found);
                  onChangeContacts(found.contactos && found.contactos.length > 0 ? found.contactos : [
                    {
                      id: `cnt-${found.id}-1`,
                      nombre: found.contacto_nombre || "Contacto Principal",
                      puesto: "Representante Comercial",
                      email: found.contacto_email || "contacto@empresa.com",
                      telefono: found.contacto_telefono || "811-000-0000",
                      es_principal: true,
                      incluir_en_envio: true
                    }
                  ]);
                }
              }}
              className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#85AA1C]"
            >
              <option value="">-- Seleccionar Cliente del Directorio --</option>
              {filteredClients.map(c => (
                <option key={c.id} value={c.id}>
                  #{c.numero_cliente || c.id} — {c.razon_social} ({c.contactos?.length || 1} contactos)
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedClient && (
          <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-xs flex flex-wrap items-center justify-between gap-2">
            <div className="space-y-0.5">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <span>{selectedClient.razon_social}</span>
                <span className="text-[9px] font-mono font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                  RFC: {selectedClient.rfc}
                </span>
                <span className="text-[9px] font-mono font-bold bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200">
                  #{selectedClient.numero_cliente || selectedClient.id}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 line-clamp-1">{selectedClient.direccion}</p>
            </div>
            <div className="text-[10px] font-mono text-slate-400">
              Sector: <strong className="text-slate-700">{selectedClient.sector}</strong>
            </div>
          </div>
        )}
      </div>

      {/* 2. GESTIÓN MULTI-CONTACTO (2 O MÁS CONTACTOS POR CLIENTE) */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-2">
          <div>
            <span className="text-[10.5px] font-bold text-slate-800 uppercase font-mono flex items-center gap-1.5">
              <Users className="w-4 h-4 text-blue-600" />
              <span>Contactos Asociados ({contacts.length}) & Selección de Destinatarios</span>
            </span>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Active o bloquee destinatarios. Puede editar datos o agregar nuevos contactos directamente.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold bg-blue-50 text-blue-800 px-2 py-0.5 rounded border border-blue-200">
              {activeRecipientsCount} de {contacts.length} recibirán cotización
            </span>
            <button
              type="button"
              onClick={() => setIsAddingContact(!isAddingContact)}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition"
            >
              <Plus className="w-3 h-3 text-slate-600" />
              <span>+ Contacto</span>
            </button>
          </div>
        </div>

        {/* Form to add a new contact on the fly */}
        {isAddingContact && (
          <form onSubmit={handleAddNewContact} className="bg-blue-50/60 p-3 rounded-xl border border-blue-200 space-y-2.5 text-xs animate-in fade-in">
            <div className="flex justify-between items-center">
              <span className="font-bold text-[10.5px] text-blue-900 uppercase font-mono flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Alta de Contacto Adicional en Cotización</span>
              </span>
              <button
                type="button"
                onClick={() => setIsAddingContact(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-[9px] font-bold text-slate-600 uppercase">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Lic. Fernando Treviño"
                  value={newContactForm.nombre}
                  onChange={(e) => setNewContactForm({ ...newContactForm, nombre: e.target.value })}
                  className="w-full bg-white border border-blue-200 rounded px-2.5 py-1 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-slate-600 uppercase">Puesto / Área</label>
                <input
                  type="text"
                  placeholder="Ej. Jefa de Compras / EHS"
                  value={newContactForm.puesto}
                  onChange={(e) => setNewContactForm({ ...newContactForm, puesto: e.target.value })}
                  className="w-full bg-white border border-blue-200 rounded px-2.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-[9px] font-bold text-slate-600 uppercase">Correo Electrónico *</label>
                <input
                  type="email"
                  required
                  placeholder="contacto@empresa.com"
                  value={newContactForm.email}
                  onChange={(e) => setNewContactForm({ ...newContactForm, email: e.target.value })}
                  className="w-full bg-white border border-blue-200 rounded px-2.5 py-1 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-slate-600 uppercase">Teléfono / WhatsApp</label>
                <input
                  type="tel"
                  placeholder="811-555-0199"
                  value={newContactForm.telefono}
                  onChange={(e) => setNewContactForm({ ...newContactForm, telefono: e.target.value })}
                  className="w-full bg-white border border-blue-200 rounded px-2.5 py-1 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAddingContact(false)}
                className="px-3 py-1 bg-white border border-slate-300 rounded text-[10px] font-bold text-slate-600"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-3.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px] font-bold shadow-xs cursor-pointer"
              >
                Agregar a Cotización
              </button>
            </div>
          </form>
        )}

        {/* List of contacts with interactive edit and send/block toggle */}
        <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
          {contacts.map((cnt, idx) => (
            <div
              key={cnt.id}
              className={`p-3 rounded-xl border transition ${
                cnt.incluir_en_envio 
                  ? 'bg-emerald-50/40 border-emerald-200 shadow-2xs' 
                  : 'bg-slate-50 border-slate-200 opacity-60'
              }`}
            >
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-xs text-slate-900">{cnt.nombre}</span>
                    <span className="text-[9px] font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-600">
                      {cnt.puesto || 'Contacto'}
                    </span>
                    {cnt.es_principal && (
                      <span className="text-[9px] font-mono font-bold bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded">
                        Principal
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-[11px] font-mono text-slate-600 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3 text-slate-400" />
                      {cnt.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      {cnt.telefono || 'Sin teléfono'}
                    </span>
                  </div>
                </div>

                {/* Toggle Send / Block button */}
                <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                  <button
                    type="button"
                    onClick={() => handleToggleContactSend(cnt.id)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition cursor-pointer ${
                      cnt.incluir_en_envio
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                        : 'bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-300'
                    }`}
                    title={cnt.incluir_en_envio ? "Este contacto recibirá la cotización" : "Contacto bloqueado para esta cotización"}
                  >
                    {cnt.incluir_en_envio ? (
                      <>
                        <UserCheck className="w-3 h-3" />
                        <span>🟢 Enviar a este contacto</span>
                      </>
                    ) : (
                      <>
                        <UserX className="w-3 h-3 text-rose-600" />
                        <span>🔴 Bloquear / Excluir</span>
                      </>
                    )}
                  </button>

                  {contacts.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveContact(cnt.id)}
                      className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-red-50 transition cursor-pointer"
                      title="Quitar contacto de esta cotización"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Feedback / Save to Master Database Action */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pt-2 border-t border-slate-100">
          {saveDbFeedback ? (
            <div className="text-[11px] text-emerald-800 font-bold font-mono flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{saveDbFeedback}</span>
            </div>
          ) : (
            <span className="text-[10px] text-slate-500 font-mono">
              Los cambios en contactos pueden persistirse en el catálogo maestro de clientes.
            </span>
          )}

          <button
            type="button"
            onClick={handleSaveToClientDatabase}
            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition self-end sm:self-center"
            title="Guardar esta lista de contactos de forma permanente en la ficha de este cliente"
          >
            <Save className="w-3 h-3 text-slate-600" />
            <span>Guardar Contactos en Base de Datos</span>
          </button>
        </div>
      </div>
    </div>
  );
};
