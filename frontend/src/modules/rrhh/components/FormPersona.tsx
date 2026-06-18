import React, { useState, useEffect } from 'react';
import { User, FileText, Briefcase, Image as ImageIcon, Trash2, X } from 'lucide-react';
import { Button } from '../../../shared/components/atoms/button';
import LabelRow from './LabelRow';
import { FormPersonaProps } from '../interfaces/FormPersonaProps';

const FormPersona = ({
  formData,
  setFormData,
  setFotoFile,
  documentosFiles,
  setDocumentosFiles,
  rolesLista,
  departamentos,
  puestosLista,
  onSubmit,
  isEdit = false
}: FormPersonaProps) => {
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);

  useEffect(() => {
    if (isEdit && formData.foto_ruta && !fotoPreview) {
      setFotoPreview(`http://localhost:3001${formData.foto_ruta}`);
    }
  }, [isEdit, formData.foto_ruta]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    if (name === 'tipo_recurso') return;
    setFormData((prev: any) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleRoleToggle = (rolId: number) => {
    setFormData((prev: any) => ({
      ...prev,
      roles: prev.roles.includes(rolId)
        ? prev.roles.filter((id: number) => id !== rolId)
        : [...prev.roles, rolId]
    }));
  };

  const handlePuestoChange = (index: number, field: string, value: any) => {
    setFormData((prev: any) => {
      const nuevosPuestos = [...prev.puestos_asignados];
      nuevosPuestos[index] = { ...nuevosPuestos[index], [field]: value };
      if (field === 'puesto_id' && value && index === nuevosPuestos.length - 1 && nuevosPuestos.length < 3) {
        nuevosPuestos.push({ departamento_id: '', puesto_id: '' });
      }
      return { ...prev, puestos_asignados: nuevosPuestos };
    });
  };

  const handleLimpiarPuestos = () => {
    setFormData((prev: any) => ({ ...prev, puestos_asignados: [{ departamento_id: '', puesto_id: '' }] }));
  };

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFotoFile(file);
      const previewUrl = URL.createObjectURL(file);
      setFotoPreview(previewUrl);
      // ✅ Si sube foto nueva, cancelamos el flag de eliminación
      setFormData((prev: any) => ({ ...prev, eliminar_foto: false }));
    }
  };

  const handleDocumentosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setDocumentosFiles((prev: File[]) => [...prev, ...Array.from(e.target.files as FileList)]);
    }
  };

  const handleRemoveDocumento = (index: number) => {
    setDocumentosFiles((prev: File[]) => prev.filter((_, i) => i !== index));
  };

  const handleEliminarFoto = () => {
    setFotoPreview(null);
    setFotoFile(null);
    // ✅ Activamos el flag para avisar al backend
    setFormData((prev: any) => ({ ...prev, eliminar_foto: true }));
    const input = document.getElementById('foto_upload') as HTMLInputElement;
    if (input) input.value = '';
  };

  return (
    <form onSubmit={onSubmit} className="bg-[#f2f2f2] border-l-[6px] border-[#006400] text-[11px]">
      <div className="p-8 bg-white">
        <h3 className="font-bold text-[12px] mb-6 text-gray-900 underline uppercase tracking-wide">
          Datos personales
        </h3>

        <div className="flex flex-col md:flex-row gap-10 mb-2">
          <div className="flex flex-col items-center gap-3 text-center w-40 shrink-0">
            <div className="w-32 h-40 border border-gray-300 bg-gray-50 flex items-center justify-center overflow-hidden rounded-sm shadow-inner relative">
              {fotoPreview ? (
                <img src={fotoPreview} alt="Vista previa" className="w-full h-full object-cover" />
              ) : (
                <User className="w-16 h-16 text-gray-300 stroke-[1.5]" />
              )}
            </div>

            <div className="w-full text-left flex flex-col items-center mt-1">
              <label className="flex items-center justify-center gap-1.5 cursor-pointer text-[10px] text-gray-700 mb-3 hover:text-blue-600 transition-colors">
                <input type="checkbox" name="mostrar_ampliacion" checked={formData.mostrar_ampliacion} onChange={handleChange} className="w-3.5 h-3.5 rounded border-gray-300 cursor-pointer" />
                Mostrar ampliación
              </label>

              <input type="file" id="foto_upload" accept="image/*" onChange={handleFotoChange} className="hidden" />

              <label htmlFor="foto_upload" className="cursor-pointer bg-gray-200 hover:bg-gray-300 text-gray-800 text-[10px] font-bold uppercase px-4 py-2 rounded transition-colors shadow-sm flex items-center justify-center gap-1.5 w-full border border-gray-300">
                <ImageIcon className="w-3.5 h-3.5" />
                {fotoPreview ? 'Cambiar Foto' : 'Fichero de Foto'}
              </label>

              {fotoPreview && (
                <button type="button" onClick={handleEliminarFoto} className="mt-2 text-[9px] text-red-600 hover:text-red-800 font-bold px-3 py-1 border border-red-200 rounded hover:bg-red-50 transition-colors">
                  Eliminar Foto
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-start pt-2">
            <LabelRow label="Código: " requerido mb="mb-4">
              <input type="text" name="codigo" required value={formData.codigo} onChange={handleChange} className="border border-gray-300 px-2 py-1 w-48 bg-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-sm transition-all" />
            </LabelRow>

            <LabelRow label="Saludo: " mb="mb-4">
              <select name="saludo" value={formData.saludo} onChange={handleChange} className="border border-gray-300 px-2 py-1 w-48 bg-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-sm transition-all">
                <option value="">Seleccione...</option>
                <option value="Sr.">Sr.</option> <option value="Sra.">Sra.</option> <option value="Srta.">Srta.</option>
                <option value="Dr.">Dr.</option> <option value="Dra.">Dra.</option> <option value="Ing.">Ing.</option>
                <option value="Lic.">Lic.</option> <option value="Msc.">Msc.</option>
              </select>
            </LabelRow>

            <LabelRow label="Nombre: " requerido mb="mb-4">
              <input type="text" name="nombre" required value={formData.nombre} onChange={handleChange} className="border border-gray-300 px-2 py-1 w-full max-w-lg bg-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-sm transition-all" />
            </LabelRow>

            <LabelRow label="Apellidos: " requerido mb="mb-4">
              <input type="text" name="apellidos" required value={formData.apellidos} onChange={handleChange} className="border border-gray-300 px-2 py-1 w-full max-w-lg bg-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-sm transition-all" />
            </LabelRow>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 pt-6 border-t border-gray-200 mt-4">
          <div>
            <LabelRow label="C.I. / Pasaporte: " mb="mb-4">
              <input type="text" required name="cedula_identidad" value={formData.cedula_identidad} onChange={handleChange} className="border border-gray-300 px-2 py-1 w-48 bg-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-sm" />
            </LabelRow>
            <LabelRow label="Fecha Nacimiento: " mb="mb-4">
              <input type="date" name="fecha_nacimiento" value={formData.fecha_nacimiento} onChange={handleChange} className="border border-gray-300 px-2 py-1 w-40 bg-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-sm" />
            </LabelRow>
            <LabelRow label="Sexo: " mb="mb-4">
              <div className="flex items-center gap-6 mt-1.5">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="radio" name="sexo" value="M" checked={formData.sexo === 'M'} onChange={handleChange} className="w-3.5 h-3.5 text-blue-600 focus:ring-blue-500 cursor-pointer" /> Masculino
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="radio" name="sexo" value="F" checked={formData.sexo === 'F'} onChange={handleChange} className="w-3.5 h-3.5 text-blue-600 focus:ring-blue-500 cursor-pointer" /> Femenino
                </label>
              </div>
            </LabelRow>
            <LabelRow label="Domicilio: " mb="mb-4">
              <input type="text" name="domicilio" value={formData.domicilio} onChange={handleChange} className="border border-gray-300 px-2 py-1 w-full bg-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-sm" />
            </LabelRow>
            <LabelRow label="Ciudad: " mb="mb-4">
              <input type="text" name="ciudad" value={formData.ciudad} onChange={handleChange} className="border border-gray-300 px-2 py-1 w-full max-w-[250px] bg-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-sm" />
            </LabelRow>
          </div>

          <div>
            <LabelRow label="Provincia: " mb="mb-4">
              <input type="text" name="provincia" value={formData.provincia} onChange={handleChange} className="border border-gray-300 px-2 py-1 w-full max-w-[250px] bg-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-sm" />
            </LabelRow>
            <LabelRow label="Código Postal: " mb="mb-4">
              <input type="text" name="codigo_postal" value={formData.codigo_postal} onChange={handleChange} className="border border-gray-300 px-2 py-1 w-32 bg-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-sm" />
            </LabelRow>
            <LabelRow label="Teléfonos: " mb="mb-4">
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-10 text-gray-600 font-medium">Fijo: </span>
                  <input type="text" name="telefono" value={formData.telefono} onChange={handleChange} className="border border-gray-300 px-2 py-1 w-28 bg-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-sm" />
                  <span className="w-8 text-gray-600 font-medium ml-3">Fax: </span>
                  <input type="text" name="fax" value={formData.fax} onChange={handleChange} className="border border-gray-300 px-2 py-1 w-28 bg-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-sm" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-10 text-gray-600 font-medium">Celular: </span>
                  <input type="text" name="celular" value={formData.celular} onChange={handleChange} className="border border-gray-300 px-2 py-1 w-32 bg-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-sm" />
                </div>
              </div>
            </LabelRow>

            <div className="mt-5">
              <LabelRow label="E-mail 1: " mb="mb-4">
                <input type="email" name="email_1" value={formData.email_1} onChange={handleChange} className="border border-gray-300 px-2 py-1 w-full max-w-[320px] bg-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-sm" />
              </LabelRow>
              <LabelRow label="E-mail 2: " mb="mb-4">
                <input type="email" name="email_2" value={formData.email_2} onChange={handleChange} className="border border-gray-300 px-2 py-1 w-full max-w-[320px] bg-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-sm" />
              </LabelRow>
            </div>
          </div>
        </div>

        <div className="border-t border-b border-gray-300 py-5 mb-8 mt-4 flex flex-col gap-2 bg-gray-50 px-6 -mx-8">
          <div className="flex items-start gap-4">
            <div className="w-40 font-bold pt-1 text-gray-800">
              Documentos adjuntos <br /> <span className="font-normal text-gray-500 text-[9px]">(CV, Certificados, etc)</span>
            </div>
            <div className="flex-1">
              <input type="file" multiple accept=".pdf" onChange={handleDocumentosChange} className="text-[11px] file:mr-4 file:py-1 file:px-3 file:rounded-sm file:border file:border-gray-300 file:bg-gray-200 hover:file:bg-gray-300 cursor-pointer" />
              {documentosFiles.length > 0 && (
                <ul className="mt-3 text-[10px] text-gray-700 bg-white p-3 border border-gray-200 rounded-sm w-full shadow-sm">
                  {documentosFiles.map((file, idx) => (
                    <li key={idx} className="mb-1.5 flex items-center justify-between group">
                      <div className="flex items-center gap-2">
                        <span className="text-blue-700">
                          <FileText className="w-3 h-3 inline mr-1" />
                        </span>
                        <span className="font-semibold text-gray-800">{file.name}</span>
                        <span className="text-gray-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                      </div>
                      <button type="button" onClick={() => handleRemoveDocumento(idx)} className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-1 rounded transition-colors opacity-0 group-hover:opacity-100" title="Eliminar documento">
                        <X className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-5 mt-2">
          <h3 className="font-bold text-[12px] text-gray-900 underline uppercase tracking-wide flex items-center gap-2"> <Briefcase className="w-4 h-4 text-gray-700" /> Puestos </h3>
          <button type="button" onClick={handleLimpiarPuestos} className="text-[10px] text-red-600 hover:text-red-800 font-bold px-3 py-1.5 bg-red-50 hover:bg-red-100 border border-red-200 rounded flex items-center gap-1.5 transition-colors"> <Trash2 className="w-3 h-3" /> Limpiar Puestos </button>
        </div>
        <div className="flex flex-col gap-4 mb-10">
          {formData.puestos_asignados?.map((asignacion: any, index: number) => (
            <div key={index} className="flex items-start bg-gray-50 p-4 rounded border border-gray-200 shadow-sm">
              <div className="w-32 flex items-center gap-1.5 shrink-0 pt-1.5 font-bold text-gray-700"> <User className="w-4 h-4 fill-blue-800 text-blue-800" /> <span>Puesto {index + 1}: </span> </div>
              <div className="flex flex-col md:flex-row gap-4">
                <select value={asignacion.departamento_id || ''} onChange={(e) => handlePuestoChange(index, 'departamento_id', e.target.value)} className="border border-gray-300 px-3 py-1.5 w-64 bg-white rounded-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                  <option value="">Seleccione un departamento</option>{departamentos.map((dep: any) => (<option key={dep.id} value={dep.id}>{dep.nombre}</option>))}
                </select>
                <select value={asignacion.puesto_id || ''} onChange={(e) => handlePuestoChange(index, 'puesto_id', e.target.value)} className="border border-gray-300 px-3 py-1.5 w-64 bg-white rounded-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                  <option value="">Seleccione cargo</option>{puestosLista.map((puesto: any) => (<option key={puesto.id} value={puesto.id}>{puesto.nombre}</option>))}
                </select>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-300 pt-6 mb-10">
          <h3 className="font-bold text-[12px] mb-5 text-gray-900 underline uppercase tracking-wide">Roles</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {rolesLista.map((rol: any) => (
              <label key={rol.id} className="flex items-center gap-2.5 cursor-pointer hover:bg-gray-100 p-2.5 w-full rounded border border-transparent hover:border-gray-200 transition-colors">
                <input type="checkbox" checked={formData.roles.includes(rol.id)} onChange={() => handleRoleToggle(rol.id)} className="w-3.5 h-3.5 text-blue-600 rounded-sm cursor-pointer" />
                <div className="w-4 h-4 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 fill-blue-800 text-blue-800" />
                </div>
                <span className="font-medium text-gray-700">{rol.nombre}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-300 pt-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-center bg-gray-50 p-4 -mx-8">
          <LabelRow label="Orden: " mb="mb-0"> <input type="number" name="orden" value={formData.orden} onChange={handleChange} className="border border-gray-300 px-2 py-1 w-20 bg-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-sm" /> </LabelRow>
          <LabelRow label="Estado Activo: " mb="mb-0"> <input type="checkbox" name="activo" checked={formData.activo} onChange={handleChange} className="w-4 h-4 text-[#006400] rounded mt-1 cursor-pointer" /> </LabelRow>
        </div>
      </div>

      <div className="bg-gray-100 border-t border-gray-300 p-5 flex gap-3">
        <Button variant="submit">{isEdit ? 'Guardar Cambios' : 'Aceptar'}</Button>
        <Button variant="cancelar" />
      </div>
    </form>
  );
};

export default FormPersona;