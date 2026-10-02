import { useState } from 'react'
import { nombreDe } from '../data/formato.js'

export default function EditarReporte({ reporte, catalogos, onCancelar, onGuardar }) {
  // Copia local del formulario: solo se manda a la API al dar "Guardar cambios"
  const [form, setForm] = useState({
    nombre: reporte.titulo,
    descripcion: reporte.descripcion,
    fuenteId: reporte.fuenteId,
    tipoFraudeId: reporte.tipoFraudeId,
    tipoPropiedadId: reporte.tipoPropiedadId,
  })
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  function cambiar(campo, valor) {
    setForm({ ...form, [campo]: valor })
  }

  async function guardar() {
    setGuardando(true)
    setError('')
    try {
      await onGuardar({
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim(),
        fuenteId: Number(form.fuenteId),
        tipoFraudeId: Number(form.tipoFraudeId),
        tipoPropiedadId: Number(form.tipoPropiedadId),
      })
    } catch (e) {
      setError(e.message)
      setGuardando(false)
    }
  }

  return (
    <div className="panel-cuerpo">
      <div className="seccion-titulo naranja">MODO EDICIÓN</div>

      <label className="campo-label">TÍTULO DEL ANUNCIO</label>
      <input className="campo" value={form.nombre} onChange={(e) => cambiar('nombre', e.target.value)} />

      <label className="campo-label">PLATAFORMA</label>
      <select className="campo" value={form.fuenteId} onChange={(e) => cambiar('fuenteId', e.target.value)}>
        {catalogos.fuentes.map((f) => (
          <option key={f.id} value={f.id}>{nombreDe(f)}</option>
        ))}
      </select>

      <label className="campo-label">TIPOLOGÍA</label>
      <select className="campo" value={form.tipoFraudeId} onChange={(e) => cambiar('tipoFraudeId', e.target.value)}>
        {catalogos.tiposFraude.map((t) => (
          <option key={t.id} value={t.id}>{nombreDe(t)}</option>
        ))}
      </select>

      <label className="campo-label">TIPO DE PROPIEDAD</label>
      <select className="campo" value={form.tipoPropiedadId} onChange={(e) => cambiar('tipoPropiedadId', e.target.value)}>
        {catalogos.tiposPropiedad.map((t) => (
          <option key={t.id} value={t.id}>{nombreDe(t)}</option>
        ))}
      </select>

      <label className="campo-label">DESCRIPCIÓN</label>
      <textarea
        className="campo"
        rows="4"
        value={form.descripcion}
        onChange={(e) => cambiar('descripcion', e.target.value)}
      />

      {error && <p className="aviso-error">{error}</p>}

      <div className="botones-edicion">
        <button className="boton-gris" onClick={onCancelar} disabled={guardando}>Cancelar</button>
        <button
          className="boton-azul"
          onClick={guardar}
          disabled={guardando || !form.nombre.trim() || !form.descripcion.trim()}
        >
          {guardando ? 'Guardando…' : 'Guardar cambios'}
        </button>
      </div>
    </div>
  )
}