import { useEffect, useMemo, useState } from 'react'
import Login from './pages/Login.jsx'
import Registro from './pages/Registro.jsx'
import Reportes from './pages/Reportes.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Solicitudes from './pages/Solicitudes.jsx'
import Sidebar from './components/Sidebar.jsx'
import * as api from './api.js'
import { armarReporte } from './data/formato.js'

const CATALOGOS_VACIOS = { estados: [], tiposFraude: [], fuentes: [], tiposPropiedad: [], usuarios: [] }

// Recuerda si la barra lateral estaba oculta
function leerColapsada() {
  try {
    return localStorage.getItem('ofraud_sidebar') === 'oculta'
  } catch {
    return false
  }
}

export default function App() {
  const [sesion, setSesion] = useState(api.sesionActual()) // { id, correo, rolId } o null
  const [vistaAcceso, setVistaAcceso] = useState('login') // 'login' | 'registro'
  const [pagina, setPagina] = useState('reportes') // 'reportes' | 'dashboard' | 'solicitudes'
  const [crudos, setCrudos] = useState([]) // reportes tal como llegan de la API
  const [catalogos, setCatalogos] = useState(CATALOGOS_VACIOS)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [seleccionado, setSeleccionado] = useState(null) // id del reporte abierto
  const [colapsada, setColapsada] = useState(leerColapsada)

  const esSuper = sesion?.rolId === api.ROLES.SUPERADMIN

  // Si el token expira, regresa al login
  useEffect(() => {
    api.alExpirarSesion(() => setSesion(null))
  }, [])

  async function cargar() {
    setCargando(true)
    setError('')
    try {
      const datos = await api.cargarTodo()
      setCrudos(datos.reportes)
      setCatalogos(datos)
    } catch (e) {
      setError(e.message)
    } finally {
      setCargando(false)
    }
  }

  // Al iniciar sesión, trae todo de la API
  useEffect(() => {
    if (sesion) cargar()
  }, [sesion])

  // Reportes ya "traducidos" (con nombres en vez de ids), del más nuevo al más viejo
  const reportes = useMemo(
    () =>
      crudos
        .map((r) => armarReporte(r, catalogos))
        .sort((a, b) => new Date(b.creado) - new Date(a.creado)),
    [crudos, catalogos],
  )

  if (!sesion) {
    return vistaAcceso === 'registro' ? (
      <Registro onVolver={() => setVistaAcceso('login')} />
    ) : (
      <Login onEntrar={() => setSesion(api.sesionActual())} onCrearCuenta={() => setVistaAcceso('registro')} />
    )
  }

  function alternarSidebar() {
    const nueva = !colapsada
    setColapsada(nueva)
    try {
      localStorage.setItem('ofraud_sidebar', nueva ? 'oculta' : 'visible')
    } catch {
      // si el navegador no deja guardar, solo no se recuerda
    }
  }

  // Manda cambios a la API y actualiza la lista con lo que regresa
  async function actualizar(id, cambios) {
    const actualizado = await api.actualizarReporte(id, cambios)
    setCrudos((lista) => lista.map((r) => (r.id === id ? { ...r, ...cambios, ...(actualizado || {}) } : r)))
  }

  async function eliminar(id) {
    await api.eliminarReporte(id)
    setCrudos((lista) => lista.filter((r) => r.id !== id))
    setSeleccionado(null)
  }

  async function cambiarRol(idUsuario, rolId) {
    const rolActual = catalogos.usuarios.find((u) => u.id === idUsuario)?.rolId
    console.log('cambiarRol', { idUsuario, rolId, rolActual })
    await api.cambiarRol(idUsuario, rolId, rolActual)
    setCatalogos((c) => ({
      ...c,
      usuarios: c.usuarios.map((u) => (u.id === idUsuario ? { ...u, rolId } : u)),
    }))
  }

  function abrirReporte(id) {
    setSeleccionado(id)
    setPagina('reportes')
  }

  function salir() {
    api.cerrarSesion()
    setSesion(null)
    setVistaAcceso('login')
    setPagina('reportes')
    setSeleccionado(null)
    setCrudos([])
  }

  const pendientes = catalogos.usuarios.filter((u) => u.rolId === api.ROLES.PENDIENTE).length
  const miNombre = catalogos.usuarios.find((u) => u.id === sesion.id)?.nombre

  let contenido
  if (cargando && crudos.length === 0 && catalogos.estados.length === 0) {
    contenido = <div className="estado-carga">Cargando reportes…</div>
  } else if (error && catalogos.estados.length === 0) {
    contenido = (
      <div className="estado-carga">
        <p className="error-texto">{error}</p>
        <button className="boton-azul boton-chico" onClick={cargar}>Intentar de nuevo</button>
      </div>
    )
  } else if (pagina === 'solicitudes' && esSuper) {
    contenido = <Solicitudes usuarios={catalogos.usuarios} sesion={sesion} onCambiarRol={cambiarRol} />
  } else if (pagina === 'dashboard') {
    contenido = <Dashboard reportes={reportes} catalogos={catalogos} onAbrirReporte={abrirReporte} onRecargar={cargar} cargando={cargando} />
  } else {
    contenido = (
      <Reportes
        reportes={reportes}
        catalogos={catalogos}
        seleccionado={seleccionado}
        onSeleccionar={setSeleccionado}
        onActualizar={actualizar}
        onEliminar={eliminar}
      />
    )
  }

  return (
    <div className="layout">
      <Sidebar
        pagina={pagina}
        onCambiarPagina={setPagina}
        onSalir={salir}
        sesion={sesion}
        nombre={miNombre}
        colapsada={colapsada}
        onAlternar={alternarSidebar}
        pendientes={pendientes}
      />
      <main className="contenido">{contenido}</main>
    </div>
  )
}