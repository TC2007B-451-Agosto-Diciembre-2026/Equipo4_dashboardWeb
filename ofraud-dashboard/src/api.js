// Todas las llamadas a la API de NestJS (back-tc2007) viven aquí.
// Se usa axios en lugar de fetch.

import axios from 'axios'
import * as demo from './data/demo.js'

// MODO DEMO: false = datos del Backend 
export const MODO_DEMO = false

// Roles - El 3 y el 4 hay que agregarlos a la base 
export const ROLES = {
  USUARIO: 1,
  ADMIN: 2,
  SUPERADMIN: 3,
  PENDIENTE: 4, 
}

const ACCESS_KEY = 'ofraud_access'
const REFRESH_KEY = 'ofraud_refresh'
let avisarSesionExpirada = () => {}

// Copias de los datos demo
let demoReportes = demo.reportes.map((r) => ({ ...r }))
let demoUsuarios = demo.usuarios.map((u) => ({ ...u }))

// ---------- Tokens ----------
function getAccessToken() {
  return sessionStorage.getItem(ACCESS_KEY)
}

function getRefreshToken() {
  return sessionStorage.getItem(REFRESH_KEY)
}

function guardarTokens(access, refresh) {
  sessionStorage.setItem(ACCESS_KEY, access)
  if (refresh) sessionStorage.setItem(REFRESH_KEY, refresh)
}

function leerToken(token) {
  try {
    const parte = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(decodeURIComponent(escape(atob(parte))))
  } catch {
    return null
  }
}

// Token "de mentira" para demo
function tokenDemo(usuario) {
  const datos = { sub: usuario.id, email: usuario.correo, rolId: usuario.rolId, type: 'access' }
  return 'demo.' + btoa(unescape(encodeURIComponent(JSON.stringify(datos)))) + '.demo'
}

// Datos de quien inició sesión
export function sesionActual() {
  const token = getAccessToken()
  if (!token) return null
  const datos = leerToken(token)
  if (!datos) return null
  return { id: datos.sub, correo: datos.email, rolId: datos.rolId }
}

export function alExpirarSesion(funcion) {
  avisarSesionExpirada = funcion
}

export function cerrarSesion() {
  sessionStorage.removeItem(ACCESS_KEY)
  sessionStorage.removeItem(REFRESH_KEY)
}

// ---------- Cliente axios ----------
// Todas las peticiones van a /api (el proxy de Vite las manda al backend)
axios.defaults.baseURL = '/api'
const api = axios.create()

// Pone el Bearer en cada petición
api.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Si llega 401, pide un token nuevo con el refreshToken y reintenta una vez
let renovando = null

function renovarToken() {
  // Esta petición no pasa por los interceptores de `api`
  renovando ??= axios
    .post('/auth/refresh', { refreshToken: getRefreshToken() })
    .then(({ data }) => guardarTokens(data.accessToken))
    .finally(() => {
      renovando = null
    })
  return renovando
}

api.interceptors.response.use(
  (respuesta) => respuesta,
  async (error) => {
    const original = error.config
    const es401 = error.response?.status === 401
    const esRutaAuth = original?.url?.startsWith('/auth/')
    if (!es401 || !original || original._reintento || esRutaAuth) {
      return Promise.reject(error)
    }

    original._reintento = true
    try {
      await renovarToken()
    } catch (e) {
      cerrarSesion()
      avisarSesionExpirada()
      return Promise.reject(e)
    }
    return api(original)
  },
)

// Convierte cualquier error de axios en un mensaje para mostrar
function mensajeDeError(e) {
  if (axios.isAxiosError(e)) {
    if (!e.response) return 'No se pudo conectar con la API. Revisa que el backend esté corriendo.'
    if (e.response.status === 401) return 'Tu sesión expiró. Vuelve a iniciar sesión.'
    if (e.response.status === 403) return 'Tu usuario no tiene permiso para esta acción.'
    const mensaje = e.response.data?.message
    if (mensaje) return Array.isArray(mensaje) ? mensaje.join('. ') : mensaje
    return `La API respondió con error ${e.response.status}.`
  }
  return e?.message || 'Ocurrió un error inesperado'
}

// Hace la petición y, si falla, lanza un Error con un mensaje entendible
async function pedir(promesa) {
  try {
    const { data } = await promesa
    return data
  } catch (e) {
    throw new Error(mensajeDeError(e))
  }
}

// Revisa el rol y decide si puede entrar al panel
function validarRol(rolId) {
  if (rolId === ROLES.ADMIN || rolId === ROLES.SUPERADMIN) return
  if (rolId === ROLES.PENDIENTE) {
    throw new Error('Tu solicitud sigue pendiente. Podrás entrar cuando un superadministrador la apruebe.')
  }
  throw new Error('Esta cuenta no es de administrador. Solo los administradores pueden entrar al panel.')
}

// ---------- Login (POST /auth/login pide { email, password }) ----------
export async function iniciarSesion(email, password) {
  const correo = email.trim().toLowerCase()

  if (MODO_DEMO) {
    const usuario = demoUsuarios.find((u) => u.correo === correo)
    if (!usuario || usuario.contrasena !== password) {
      throw new Error('Correo o contraseña incorrectos. Revisa tus datos e intenta de nuevo.')
    }
    validarRol(usuario.rolId)
    guardarTokens(tokenDemo(usuario))
    return
  }

  let datos
  try {
    const respuesta = await api.post('/auth/login', { email: correo, password })
    datos = respuesta.data
  } catch (e) {
    if (e.response?.status === 401) {
      throw new Error('Correo o contraseña incorrectos. Revisa tus datos e intenta de nuevo.')
    }
    if (e.response?.status === 400) {
      throw new Error('Escribe un correo válido, por ejemplo admin@0fraudstay.mx.')
    }
    throw new Error(mensajeDeError(e))
  }

  validarRol(leerToken(datos.accessToken)?.rolId)
  guardarTokens(datos.accessToken, datos.refreshToken)
}

// ---------- Crear cuenta (solicitud pendiente) ----------
export async function solicitarCuenta({ nombre, email, password }) {
  const correo = email.trim().toLowerCase()

  if (MODO_DEMO) {
    if (demoUsuarios.some((u) => u.correo === correo)) {
      throw new Error('Ese correo ya tiene una cuenta. Inicia sesión o usa otro correo.')
    }
    demoUsuarios.push({
      id: 'u-' + Date.now(),
      correo,
      contrasena: password,
      nombre: nombre.trim(),
      rolId: ROLES.PENDIENTE,
      createdAt: new Date().toISOString(),
    })
    return
  }

  let nuevo
  try {
    await api.post('/auth/register-admin', { email: correo, password, nombre: nombre.trim() })
  } catch (e) {
    if (e.response?.status === 409) {
      throw new Error('Ese correo ya tiene una cuenta. Inicia sesión o usa otro correo.')
    }
    throw new Error(mensajeDeError(e))
  }

}

// ---------- Lectura ----------
export async function cargarTodo() {
  if (MODO_DEMO) {
    return {
      reportes: demoReportes.map((r) => ({ ...r })),
      estados: demo.estados,
      tiposFraude: demo.tiposFraude,
      fuentes: demo.fuentes,
      tiposPropiedad: demo.tiposPropiedad,
      usuarios: demoUsuarios.map(({ contrasena, ...u }) => u), // sin contraseñas
    }
  }

  const [reportes, estados, tiposFraude, fuentes, tiposPropiedad, usuarios] = await Promise.all([
    pedir(api.get('/reportes')),
    pedir(api.get('/estados')),
    pedir(api.get('/tipos-fraude')),
    pedir(api.get('/fuentes')),
    pedir(api.get('/tipos-propiedad')),
    pedir(api.get('/usuarios')).catch(() => []), // si falla, se muestra el id del usuario
  ])
  return { reportes, estados, tiposFraude, fuentes, tiposPropiedad, usuarios }
}

// ---------- Escritura ----------
export async function actualizarReporte(id, cambios) {
  if (MODO_DEMO) {
    demoReportes = demoReportes.map((r) => (r.id === id ? { ...r, ...cambios, updatedAt: new Date().toISOString() } : r))
    return demoReportes.find((r) => r.id === id)
  }
  return pedir(api.patch(`/reportes/${id}`, cambios))
}

export async function eliminarReporte(id) {
  if (MODO_DEMO) {
    demoReportes = demoReportes.filter((r) => r.id !== id)
    return null
  }
  return pedir(api.delete(`/reportes/${id}`))
}

// Cambia el rol de un usuario: aprobar (→ ADMIN), rechazar o quitar acceso (→ USUARIO)
export async function cambiarRol(idUsuario, rolId, rolActual) {
  if (MODO_DEMO) {
    demoUsuarios = demoUsuarios.map((u) => (u.id === idUsuario ? { ...u, rolId } : u))
    const { contrasena, ...usuario } = demoUsuarios.find((u) => u.id === idUsuario)
    return usuario
  }

  if (rolId === ROLES.ADMIN) {
    return pedir(api.patch(`/auth/admins/${idUsuario}/approve`))
  }

  if (rolId === ROLES.USUARIO) {
    if (Number(rolActual) === ROLES.PENDIENTE) {
      return pedir(api.patch(`/auth/admins/${idUsuario}/reject`))
    }
    return pedir(api.patch(`/auth/admins/${idUsuario}/revoke`))
  }

  throw new Error('Cambio de rol no permitido desde el panel.')
}

// ---------- Datos del denunciante (solo admin) ----------
export async function obtenerAutor(idReporte) {
  if (MODO_DEMO) {
    const reporte = demoReportes.find((r) => r.id === idReporte)
    const usuario = demoUsuarios.find((u) => u.id === reporte?.usuarioId)
    if (!usuario) throw new Error('No se encontró al autor del reporte.')
    const { contrasena, ...datos } = usuario
    return datos
  }
  return pedir(api.get(`/reportes/${idReporte}/autor`)) // { id, correo, nombre, rolId, createdAt }

}

// ---------- Estadísticas del dashboard (GET /estadisticas, solo admin) ----------
export async function cargarEstadisticas() {
  return pedir(api.get('/estadisticas'))
}


