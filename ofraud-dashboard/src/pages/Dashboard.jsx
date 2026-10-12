import { useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { cargarEstadisticas } from '../api.js'
import { ESTILOS_ESTADO, claveEstado } from '../data/formato.js'

const ROJO = '#FF4433'
const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

// Arma los últimos 6 meses y les pone el total que manda la API (0 si no hubo reportes)
function armarTendencia(porMes = []) {
  const hoy = new Date()
  const meses = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1)
    const clave = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const encontrado = porMes.find((m) => m.mes === clave)
    meses.push({ anio: d.getFullYear(), etiqueta: MESES[d.getMonth()], reportes: encontrado ? encontrado.total : 0 })
  }
  return meses
}

// Convierte la lista de estados de la API en { fraude, revision, no_fraude }
function contarEstados(porEstado = []) {
  const conteo = { fraude: 0, revision: 0, no_fraude: 0 }
  porEstado.forEach((e) => {
    const clave = claveEstado(e.nombre)
    if (clave in conteo) conteo[clave] += e.total
  })
  return conteo
}

function rangoMeses(tendencia) {
  const primero = tendencia[0]
  const ultimo = tendencia[tendencia.length - 1]
  return `${primero.etiqueta.toLowerCase()} ${primero.anio} – ${ultimo.etiqueta.toLowerCase()} ${ultimo.anio}`
}

export default function Dashboard({ reportes, onAbrirReporte, onRecargar, cargando }) {
  const [stats, setStats] = useState(null)
  const [cargandoStats, setCargandoStats] = useState(false)
  const [errorStats, setErrorStats] = useState('')

  async function pedirEstadisticas() {
    setCargandoStats(true)
    setErrorStats('')
    try {
      setStats(await cargarEstadisticas())
    } catch (e) {
      setErrorStats(e.message)
    } finally {
      setCargandoStats(false)
    }
  }

  useEffect(() => {
    pedirEstadisticas()
  }, [])

  function actualizar() {
    onRecargar()
    pedirEstadisticas()
  }

  const total = stats?.totalReportes ?? 0
  const conteo = contarEstados(stats?.porEstado)
  const porcentajeFraude = total ? Math.round((conteo.fraude / total) * 100) : 0
  const tendencia = armarTendencia(stats?.porMes)
  const tipologias = (stats?.porTipoFraude ?? []).map((t) => ({ tipo: t.nombre, total: t.total }))
  const esteMes = tendencia[tendencia.length - 1].reportes
  const recientes = reportes.slice(0, 6)
  const ocupado = cargando || cargandoStats

  return (
    <div className="dashboard">
      <div className="encabezado-pagina encabezado-con-boton">
        <div>
          <h1>Dashboard general</h1>
          <p>Estadísticas de actividad · {rangoMeses(tendencia)}</p>
        </div>
        <button className="boton-borde" onClick={actualizar} disabled={ocupado}>
          <RefreshCw size={15} className={ocupado ? 'girando' : ''} />
          {ocupado ? 'Actualizando…' : 'Actualizar'}
        </button>
      </div>

      {errorStats && <p className="aviso-error">No se pudieron cargar las estadísticas: {errorStats}</p>}

      <div className="tarjetas">
        <div className="tarjeta">
          <div className="tarjeta-fila">
            <span>Reportes totales</span>
            <span className="etiqueta etiqueta-azul">{esteMes} este mes</span>
          </div>
          <div className="numero azul">{total}</div>
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
            <span>No es fraude</span>
            <span className="etiqueta etiqueta-gris">Descartados</span>
          </div>
          <div className="numero gris">{conteo.no_fraude}</div>
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