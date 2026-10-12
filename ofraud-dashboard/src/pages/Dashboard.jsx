import { RefreshCw } from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { ESTILOS_ESTADO, contarPorEstado, nombreDe } from '../data/formato.js'

const ROJO = '#FF4433'
const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

// Cuenta cuántos reportes hubo en cada uno de los últimos 6 meses
function calcularTendencia(reportes) {
  const hoy = new Date()
  const meses = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1)
    meses.push({ anio: d.getFullYear(), mes: d.getMonth(), etiqueta: MESES[d.getMonth()], reportes: 0 })
  }
  reportes.forEach((r) => {
    if (!r.creado) return
    const d = new Date(r.creado)
    const m = meses.find((x) => x.anio === d.getFullYear() && x.mes === d.getMonth())
    if (m) m.reportes++
  })
  return meses
}

// Cuenta cuántos reportes hay de cada tipo de fraude, de mayor a menor
function calcularTipologias(reportes, tiposFraude) {
  return tiposFraude
    .map((t) => ({
      tipo: nombreDe(t),
      total: reportes.filter((r) => String(r.tipoFraudeId) === String(t.id)).length,
    }))
    .sort((a, b) => b.total - a.total)
}

function rangoMeses(tendencia) {
  const primero = tendencia[0]
  const ultimo = tendencia[tendencia.length - 1]
  return `${primero.etiqueta.toLowerCase()} ${primero.anio} – ${ultimo.etiqueta.toLowerCase()} ${ultimo.anio}`
}

export default function Dashboard({ reportes, catalogos, onAbrirReporte, onRecargar, cargando }) {
  const conteo = contarPorEstado(reportes)
  const porcentajeFraude = conteo.total ? Math.round((conteo.fraude / conteo.total) * 100) : 0
  const tendencia = calcularTendencia(reportes)
  const tipologias = calcularTipologias(reportes, catalogos.tiposFraude)
  const esteMes = tendencia[tendencia.length - 1].reportes
  const recientes = reportes.slice(0, 6)

  return (
    <div className="dashboard">
      <div className="encabezado-pagina encabezado-con-boton">
        <div>
          <h1>Dashboard general</h1>
          <p>Estadísticas de actividad · {rangoMeses(tendencia)}</p>
        </div>
        <button className="boton-borde" onClick={onRecargar} disabled={cargando}>
          <RefreshCw size={15} className={cargando ? 'girando' : ''} />
          {cargando ? 'Actualizando…' : 'Actualizar'}
        </button>
      </div>

      <div className="tarjetas">
        <div className="tarjeta">
          <div className="tarjeta-fila">
            <span>Reportes totales</span>
            <span className="etiqueta etiqueta-azul">{esteMes} este mes</span>
          </div>
          <div className="numero azul">{conteo.total}</div>
        </div>
        <div className="tarjeta">
          <div className="tarjeta-fila">
            <span>Fraudes confirmados</span>
            <span className="etiqueta etiqueta-roja">{porcentajeFraude}% del total</span>
          </div>
          <div className="numero rojo">{conteo.fraude}</div>
        </div>
        <div className="tarjeta">
          <div className="tarjeta-fila">
            <span>En revisión</span>
            <span className="etiqueta etiqueta-naranja">Requieren acción</span>
          </div>
          <div className="numero naranja">{conteo.revision}</div>
        </div>
        <div className="tarjeta">
          <div className="tarjeta-fila">
            <span>Pendientes</span>
            <span className="etiqueta etiqueta-gris">Sin clasificar</span>
          </div>
          <div className="numero gris">{conteo.pendiente}</div>
        </div>
      </div>

      <div className="graficas">
        <div className="caja">
          <h3>Tendencia de reportes</h3>
          <p className="caja-sub">Reportes mensuales · últimos 6 meses</p>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={tendencia} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="relleno" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={ROJO} stopOpacity={0.15} />
                  <stop offset="100%" stopColor={ROJO} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#E8E8EC" />
              <XAxis dataKey="etiqueta" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#8A8A93' }} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#8A8A93' }} />
              <Tooltip />
              <Area type="monotone" dataKey="reportes" stroke={ROJO} strokeWidth={2.5} fill="url(#relleno)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="caja">
          <h3>Por tipología</h3>
          <p className="caja-sub">Tipo de fraude más frecuente</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={tipologias} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#8A8A93' }} />
              <YAxis type="category" dataKey="tipo" width={100} tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#55555E' }} />
              <Tooltip cursor={{ fill: '#F5F5F7' }} />
              <Bar dataKey="total" fill={ROJO} radius={[0, 4, 4, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="caja caja-tabla">
        <div className="caja-encabezado">
          <h3>Reportes recientes</h3>
          <p className="caja-sub">Últimos {recientes.length} enviados</p>
        </div>
        <div className="tabla-scroll">
          <table className="tabla">
            <thead>
              <tr>
                <th>FOLIO</th>
                <th>TÍTULO / USUARIO</th>
                <th>PLATAFORMA</th>
                <th>TIPOLOGÍA</th>
                <th>ESTADO</th>
              </tr>
            </thead>
            <tbody>
              {recientes.map((r) => (
                <tr key={r.id} onClick={() => onAbrirReporte(r.id)}>
                  <td className="folio">{r.folio}</td>
                  <td>
                    <div className="fila-titulo normal">{r.titulo}</div>
                    <div className="fila-sub">{r.usuario}</div>
                  </td>
                  <td className="celda-chica">{r.plataforma}</td>
                  <td className="celda-chica">{r.tipologia}</td>
                  <td><span className={'badge ' + ESTILOS_ESTADO[r.estado]}>{r.estadoNombre}</span></td>
                </tr>
              ))}
              {recientes.length === 0 && (
                <tr><td colSpan="5" className="vacio">Todavía no hay reportes enviados desde la app.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}