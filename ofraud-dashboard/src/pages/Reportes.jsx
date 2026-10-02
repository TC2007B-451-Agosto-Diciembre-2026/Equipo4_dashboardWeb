import { useState } from 'react'
import { ESTILOS_ESTADO, contarPorEstado, nombreDe } from '../data/formato.js'
import DetalleReporte from '../components/DetalleReporte.jsx'

export default function Reportes({ reportes, catalogos, seleccionado, onSeleccionar, onActualizar, onEliminar }) {
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [filtroPlataforma, setFiltroPlataforma] = useState('todas')

  const conteo = contarPorEstado(reportes)
  const texto = busqueda.toLowerCase()

  const filtrados = reportes.filter((r) => {
    const coincideTexto =
      r.folio.toLowerCase().includes(texto) ||
      (r.titulo || '').toLowerCase().includes(texto) ||
      r.usuario.toLowerCase().includes(texto) ||
      r.correo.toLowerCase().includes(texto)
    const coincideEstado = filtroEstado === 'todos' || String(r.estadoId) === filtroEstado
    const coincidePlataforma = filtroPlataforma === 'todas' || String(r.fuenteId) === filtroPlataforma
    return coincideTexto && coincideEstado && coincidePlataforma
  })

  const reporteAbierto = reportes.find((r) => r.id === seleccionado)

  return (
    <div className={reporteAbierto ? 'reportes con-panel' : 'reportes'}>
      <section className="reportes-lista">
        <div className="encabezado-pagina">
          <h1>Historial de reportes</h1>
          <p>Gestiona, clasifica y edita los reportes de la comunidad</p>

          <div className="pildoras">
            <div className="pildora pildora-azul"><strong>{conteo.total}</strong> Total</div>
            <div className="pildora pildora-roja"><strong>{conteo.fraude}</strong> Fraudes conf.</div>
            <div className="pildora pildora-naranja"><strong>{conteo.revision}</strong> En revisión</div>
            <div className="pildora pildora-gris"><strong>{conteo.pendiente}</strong> Pendientes</div>
          </div>

          <div className="filtros">
            <div className="buscador">
              <span>🔍</span>
              <input
                placeholder="Buscar por folio, título o usuario…"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
            <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
              <option value="todos">Todos los estados</option>
              {catalogos.estados.map((e) => (
                <option key={e.id} value={String(e.id)}>{nombreDe(e)}</option>
              ))}
            </select>
            <select value={filtroPlataforma} onChange={(e) => setFiltroPlataforma(e.target.value)}>
              <option value="todas">Todas</option>
              {catalogos.fuentes.map((f) => (
                <option key={f.id} value={String(f.id)}>{nombreDe(f)}</option>
              ))}
            </select>
            <span className="resultados">{filtrados.length} resultados</span>
          </div>
        </div>

        <div className="tabla-scroll">
          <table className="tabla">
            <thead>
              <tr>
                <th>FOLIO</th>
                <th>REPORTE / USUARIO</th>
                <th>PLATAFORMA</th>
                <th>TIPOLOGÍA</th>
                <th>FECHA</th>
                <th>ESTADO</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((r) => (
                <tr
                  key={r.id}
                  className={r.id === seleccionado ? 'fila-activa' : ''}
                  onClick={() => onSeleccionar(r.id)}
                >
                  <td className="folio">{r.folio}</td>
                  <td>
                    <div className="fila-titulo">{r.titulo}</div>
                    <div className="fila-sub">{r.usuario}{r.correo && ` · ${r.correo}`}</div>
                  </td>
                  <td className="celda-chica">{r.plataforma}</td>
                  <td className="celda-chica">{r.tipologia}</td>
                  <td className="celda-gris">{r.fecha}</td>
                  <td><span className={'badge ' + ESTILOS_ESTADO[r.estado]}>{r.estadoNombre}</span></td>
                </tr>
              ))}
              {filtrados.length === 0 && (
                <tr>
                  <td colSpan="6" className="vacio">
                    {reportes.length === 0
                      ? 'Todavía no hay reportes. Cuando alguien envíe uno desde la app, aparecerá aquí.'
                      : 'Ningún reporte coincide con tu búsqueda. Prueba con otro folio o quita los filtros.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {reporteAbierto && (
        <DetalleReporte
          key={reporteAbierto.id}
          reporte={reporteAbierto}
          catalogos={catalogos}
          onCerrar={() => onSeleccionar(null)}
          onActualizar={(cambios) => onActualizar(reporteAbierto.id, cambios)}
          onEliminar={() => onEliminar(reporteAbierto.id)}
        />
      )}
    </div>
  )
}