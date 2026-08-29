import React, { useState } from 'react';
import { 
  Sliders, 
  Plus, 
  Trash2, 
  Edit2, 
  Check, 
  X, 
  Sparkles, 
  Layers, 
  BookOpen, 
  DollarSign, 
  Tag, 
  Search,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { MetrologyServiceItem } from '../data/metrologyServices';

interface ServiceCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  services: MetrologyServiceItem[];
  onSaveServices: (services: MetrologyServiceItem[]) => void;
  onSelectAndApplyService?: (service: MetrologyServiceItem) => void;
}

export const ServiceCatalogModal: React.FC<ServiceCatalogModalProps> = ({
  isOpen,
  onClose,
  services,
  onSaveServices,
  onSelectAndApplyService
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'create' | 'list'>('create');
  
  // New service form state
  const [formData, setFormData] = useState({
    nombre: '',
    norma: 'NOM-011-STPS-2001',
    costo_base_punto: 1800,
    unidad_medida: 'Punto de medición',
    categoria: 'Higiene Industrial' as MetrologyServiceItem['categoria'],
    descripcion: ''
  });

  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredServices = services.filter(s => 
    s.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.norma.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateOrUpdateService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre.trim()) {
      alert("Por favor ingrese el nombre del servicio.");
      return;
    }

    let updatedList: MetrologyServiceItem[];
    let createdOrUpdatedItem: MetrologyServiceItem;

    if (editingServiceId) {
      createdOrUpdatedItem = {
        ...formData,
        id: editingServiceId,
        es_personalizado: true
      };
      updatedList = services.map(s => s.id === editingServiceId ? createdOrUpdatedItem : s);
      setSuccessMessage(`Servicio "${createdOrUpdatedItem.nombre}" actualizado correctamente.`);
    } else {
      createdOrUpdatedItem = {
        ...formData,
        id: `srv-custom-${Date.now()}`,
        es_personalizado: true
      };
      updatedList = [createdOrUpdatedItem, ...services];
      setSuccessMessage(`¡Servicio "${createdOrUpdatedItem.nombre}" dado de alta y disponible de inmediato!`);
    }

    onSaveServices(updatedList);

    // If caller provided onSelectAndApplyService, immediately apply to quote
    if (onSelectAndApplyService) {
      onSelectAndApplyService(createdOrUpdatedItem);
    }

    // Reset form
    setFormData({
      nombre: '',
      norma: 'NOM-011-STPS-2001',
      costo_base_punto: 1800,
      unidad_medida: 'Punto de medición',
      categoria: 'Higiene Industrial',
      descripcion: ''
    });
    setEditingServiceId(null);

    setTimeout(() => {
      setSuccessMessage(null);
    }, 4000);
  };

  const handleStartEdit = (service: MetrologyServiceItem) => {
    setFormData({
      nombre: service.nombre,
      norma: service.norma,
      costo_base_punto: service.costo_base_punto,
      unidad_medida: service.unidad_medida || 'Punto de medición',
      categoria: service.categoria,
      descripcion: service.descripcion || ''
    });
    setEditingServiceId(service.id);
    setActiveTab('create');
  };

  const handleDeleteService = (id: string, name: string) => {
    if (confirm(`¿Desea eliminar el servicio "${name}" del catálogo?`)) {
      const updated = services.filter(s => s.id !== id);
      onSaveServices(updated);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex justify-between items-center border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#85AA1C]/20 border border-[#85AA1C]/40 rounded-xl text-[#85AA1C]">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                Gestión de Servicios Disponibles
                <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-400/30">
                  En Caliente (In-Quote)
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-light mt-0.5">
                Alta manual de nuevos servicios con disponibilidad inmediata en la cotización activa sin salir.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-2 gap-2 text-xs font-bold font-mono">
          <button
            type="button"
            onClick={() => {
              setActiveTab('create');
              setEditingServiceId(null);
            }}
            className={`py-2 px-3 border-b-2 flex items-center gap-1.5 cursor-pointer transition ${
              activeTab === 'create'
                ? 'border-[#85AA1C] text-[#85AA1C] bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{editingServiceId ? 'Editar Servicio' : '+ Alta de Nuevo Servicio'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('list')}
            className={`py-2 px-3 border-b-2 flex items-center gap-1.5 cursor-pointer transition ${
              activeTab === 'list'
                ? 'border-[#85AA1C] text-[#85AA1C] bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Catálogo Activo ({services.length})</span>
          </button>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="bg-emerald-50 border-y border-emerald-200 p-3 px-5 text-xs text-emerald-900 flex items-center justify-between font-mono animate-in fade-in">
            <div className="flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
            <button
              onClick={() => setSuccessMessage(null)}
              className="text-emerald-700 hover:text-emerald-900 font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'create' ? (
            <form onSubmit={handleCreateOrUpdateService} className="space-y-4 text-xs">
              
              <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 text-amber-900 text-[11.5px] space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-amber-950">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Disponibilidad Inmediata:</span>
                </div>
                <p>
                  Al dar de alta este servicio, se agregará inmediatamente al listado desplegable de la cotización actual, permitiendo asignarle puntos y costos editables sin perder los datos capturados.
                </p>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-700 uppercase font-mono">
                  Nombre del Servicio Metrológico *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. NOM-081-SEMARNAT (Ruido Perimetral en Linderos con Espectro de Octavas)"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-800 text-xs font-bold focus:ring-2 focus:ring-[#85AA1C] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-700 uppercase font-mono">
                    Norma / Acreditación Oficial *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. NOM-011-STPS-2001 / NMX-EC-17025"
                    value={formData.norma}
                    onChange={(e) => setFormData({ ...formData, norma: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-800 text-xs font-semibold focus:ring-2 focus:ring-[#85AA1C] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-700 uppercase font-mono">
                    Categoría de Laboratorio
                  </label>
                  <select
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value as any })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-800 text-xs font-semibold focus:ring-2 focus:ring-[#85AA1C] focus:outline-none"
                  >
                    <option value="Higiene Industrial">Higiene Industrial (STPS)</option>
                    <option value="Medio Ambiente">Medio Ambiente (SEMARNAT)</option>
                    <option value="Seguridad Eléctrica">Seguridad Eléctrica / Tierras</option>
                    <option value="Laboratorio y Calibración">Laboratorio y Calibración Metrológica</option>
                    <option value="Especializado">Especializado / Consultoría Técnica</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-700 uppercase font-mono">
                    Costo Base Sugerido por Punto / Unidad ($ MXN) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400 font-bold">$</span>
                    <input
                      type="number"
                      min="0"
                      required
                      value={formData.costo_base_punto}
                      onChange={(e) => setFormData({ ...formData, costo_base_punto: Number(e.target.value) })}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 pl-7 text-slate-900 font-mono font-black text-xs focus:ring-2 focus:ring-[#85AA1C] focus:outline-none"
                    />
                  </div>
                  <span className="text-[9px] text-slate-400">Podrá modificarse libremente en cada cotización.</span>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-700 uppercase font-mono">
                    Unidad de Medida
                  </label>
                  <input
                    type="text"
                    placeholder="Punto de medición / Muestra / Jornada"
                    value={formData.unidad_medida}
                    onChange={(e) => setFormData({ ...formData, unidad_medida: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-800 text-xs font-semibold focus:ring-2 focus:ring-[#85AA1C] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-700 uppercase font-mono">
                  Descripción Técnica y Alcance Metrológico (Opcional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Detalles sobre patrones a utilizar, condiciones de medición o informe entregable..."
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-800 text-xs focus:ring-2 focus:ring-[#85AA1C] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Cerrar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#85AA1C] hover:bg-lime-600 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingServiceId ? 'Actualizar y Aplicar' : 'Guardar y Aplicar a Cotización'}</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar servicio por nombre, norma o categoría..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#85AA1C]"
                />
              </div>

              {/* List */}
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {filteredServices.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    No se encontraron servicios que coincidan con la búsqueda.
                  </div>
                ) : (
                  filteredServices.map((srv) => (
                    <div
                      key={srv.id}
                      className="bg-white border border-slate-200 rounded-xl p-3 hover:border-slate-300 transition flex flex-col sm:flex-row justify-between sm:items-center gap-2 shadow-2xs"
                    >
                      <div className="space-y-0.5 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-xs text-slate-900">{srv.nombre}</span>
                          <span className="text-[9px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                            {srv.norma}
                          </span>
                          {srv.es_personalizado && (
                            <span className="text-[9px] font-mono font-bold bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded border border-amber-200">
                              Personalizado
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-3">
                          <span className="font-mono text-emerald-700 font-bold">
                            Base: ${srv.costo_base_punto.toLocaleString('es-MX')} MXN / {srv.unidad_medida}
                          </span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-600 font-medium">{srv.categoria}</span>
                        </div>
                        {srv.descripcion && (
                          <p className="text-[10px] text-slate-400 font-light line-clamp-1">{srv.descripcion}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                        {onSelectAndApplyService && (
                          <button
                            type="button"
                            onClick={() => {
                              onSelectAndApplyService(srv);
                              setSuccessMessage(`Servicio "${srv.nombre}" seleccionado para la cotización.`);
                              setTimeout(() => onClose(), 600);
                            }}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-[10.5px] font-bold transition flex items-center gap-1 cursor-pointer"
                            title="Seleccionar este servicio e insertarlo en la cotización"
                          >
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>Seleccionar</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleStartEdit(srv)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg border border-transparent hover:border-blue-200 transition cursor-pointer"
                          title="Editar parámetros"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {srv.es_personalizado && (
                          <button
                            type="button"
                            onClick={() => handleDeleteService(srv.id, srv.nombre)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-200 transition cursor-pointer"
                            title="Eliminar del catálogo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-3 px-5 border-t border-slate-200 flex justify-between items-center text-[11px] text-slate-500 font-mono">
          <span>{services.length} servicios registrados en catálogo maestro</span>
          <button
            onClick={onClose}
            className="text-slate-600 hover:text-slate-900 font-bold"
          >
            Listo / Volver a Cotización
          </button>
        </div>

      </div>
    </div>
  );
};
