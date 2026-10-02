// Todas las llamadas a la API de NestJS (back-tc2007) viven aquí.

import * as demo from './data/demo.js'

// ⭐ MODO DEMO: true = usa datos de prueba (no necesita backend).
//    Para conectar al backend real, cámbialo a false.
export const MODO_DEMO = true

// Roles (tabla `rol`). El 3 y el 4 hay que agregarlos a la base (ver README del dashboard).
export const ROLES = {
  USUARIO: 1,
  ADMIN: 2,
  SUPERADMIN: 3,
  PENDIENTE: 4, // pidió cuenta de administrador y espera aprobación
}

const ACCESS_KEY = 'ofraud_access'
const REFRESH_KEY = 'ofraud_refresh'
let accessToken = sessionStorage.getItem(ACCESS_KEY)
let refreshToken = sessionStorage.getItem(REFRESH_KEY)
let avisarSesionExpirada = () => {}

// Copias de los datos demo; los cambios duran mientras no recargues la página
let demoReportes = demo.reportes.map((r) => ({ ...r }))
let demoUsuarios = demo.usuarios.map((u) => ({ ...u }))

// ---------- Token ----------
function leerToken(token) {
  try {
    const parte = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(decodeURIComponent(escape(atob(parte))))
  } catch {
    return null
  }
}

// En modo demo se arma un token "de mentira" con la misma forma que el real
function tokenDemo(usuario) {
  const datos = { sub: usuario.id, email: usuario.correo, rolId: usuario.rolId, type: 'access' }
  return 'demo.' + btoa(unescape(encodeURIComponent(JSON.stringify(datos)))) + '.demo'
}

function guardarTokens(access, refresh) {
  accessToken = access
  sessionStorage.setItem(ACCESS_KEY, access)
  if (refresh) {
    refreshToken = refresh
    sessionStorage.setItem(REFRESH_KEY, refresh)
  }
}

// Datos de quien inició sesión: { id, correo, rolId } o null
export function sesionActual() {
  if (!accessToken) return null
  const datos = leerToken(accessToken)
  if (!datos) return null
  return { id: datos.sub, correo: datos.email, rolId: datos.rolId }
}

export function alExpirarSesion(funcion) {
  avisarSesionExpirada = funcion
}

export function cerrarSesion() {
  accessToken = null
  refreshToken = null
  sessionStorage.removeItem(ACCESS_KEY)
  sessionStorage.removeItem(REFRESH_KEY)
}

async function leerMensajeError(res) {
  try {
    const datos = await res.json()
    return Array.isArray(datos.message) ? datos.message.join('. ') : datos.message
  } catch {
    return null
  }
}

// El token de acceso dura 15 minutos; con el refreshToken se pide uno nuevo sin volver a loguearse
async function renovarToken() {
  if (!refreshToken) return false
  try {
    const res = await fetch('/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
    if (!res.ok) return false
    const datos = await res.json()
    guardarTokens(datos.accessToken)
    return true
  } catch {
    return false
  }
}

// Función base: agrega el token, lo renueva si expiró y maneja errores
async function pedir(ruta, opciones = {}, reintento = true, tokenPropio = null) {
  const token = tokenPropio ?? accessToken
  let res
  try {
    res = await fetch(ruta, {
      ...opciones,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
  } catch {
    throw new Error('No se pudo conectar con la API. Revisa que el backend esté corriendo.')
  }

  if (res.status === 401 && !tokenPropio) {
    if (reintento && (await renovarToken())) {
      return pedir(ruta, opciones, false)
    }
    cerrarSesion()
    avisarSesionExpirada()
    throw new Error('Tu sesión expiró. Vuelve a iniciar sesión.')
  }
  if (res.status === 403) {
    throw new Error('Tu usuario no tiene permiso para esta acción.')
  }
  if (!res.ok) {
    const mensaje = await leerMensajeError(res)
    throw new Error(mensaje || `La API respondió con error ${res.status}.`)
  }
  if (res.status === 204) return null
  return res.json()
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

  let res
  try {
    res = await fetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: correo, password }),
    })
  } catch {
    throw new Error('No se pudo conectar con la API. Revisa que el backend esté corriendo.')
  }

  if (res.status === 401) {
    throw new Error('Correo o contraseña incorrectos. Revisa tus datos e intenta de nuevo.')
  }
  if (res.status === 400) {
    throw new Error('Escribe un correo válido, por ejemplo admin@0fraudstay.mx.')
  }
  if (!res.ok) {
    const mensaje = await leerMensajeError(res)
    throw new Error(mensaje || `La API respondió con error ${res.status}.`)
  }

  const datos = await res.json()
  validarRol(leerToken(datos.accessToken)?.rolId)
  guardarTokens(datos.accessToken, datos.refreshToken)
}

// ---------- Crear cuenta (queda como solicitud pendiente) ----------
// Con el backend actual se hace en 3 pasos:
// 1) POST /auth/register crea la cuenta (nace con rol 1)
// 2) POST /auth/login para obtener un token de esa cuenta nueva
// 3) PATCH /usuarios/:id con rolId 4 para marcarla como "pendiente de aprobación"
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

  let res
  try {
    res = await fetch('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: correo, password, nombre: nombre.trim() }),
    })
  } catch {
    throw new Error('No se pudo conectar con la API. Revisa que el backend esté corriendo.')
  }
  if (res.status === 409) {
    throw new Error('Ese correo ya tiene una cuenta. Inicia sesión o usa otro correo.')
  }
  if (!res.ok) {
    const mensaje = await leerMensajeError(res)
    throw new Error(mensaje || `La API respondió con error ${res.status}.`)
  }
  const nuevo = await res.json() // { id, email }

  const login = await fetch('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: correo, password }),
  })
  if (!login.ok) throw new Error('La cuenta se creó, pero no se pudo registrar la solicitud. Avisa a un superadministrador.')
  const { accessToken: tokenNuevo } = await login.json()

  await pedir(`/usuarios/${nuevo.id}`, { method: 'PATCH', body: JSON.stringify({ rolId: ROLES.PENDIENTE }) }, false, tokenNuevo)
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
    pedir('/reportes'),
    pedir('/estados'),
    pedir('/tipos-fraude'),
    pedir('/fuentes'),
    pedir('/tipos-propiedad'),
    pedir('/usuarios').catch(() => []), // si falla, se muestra el id del usuario
  ])
  return { reportes, estados, tiposFraude, fuentes, tiposPropiedad, usuarios }
}

// ---------- Escritura ----------
export async function actualizarReporte(id, cambios) {
  if (MODO_DEMO) {
    demoReportes = demoReportes.map((r) => (r.id === id ? { ...r, ...cambios, updatedAt: new Date().toISOString() } : r))
    return demoReportes.find((r) => r.id === id)
  }
  return pedir(`/reportes/${id}`, { method: 'PATCH', body: JSON.stringify(cambios) })
}

export async function eliminarReporte(id) {
  if (MODO_DEMO) {
    demoReportes = demoReportes.filter((r) => r.id !== id)
    return null
  }
  return pedir(`/reportes/${id}`, { method: 'DELETE' })
}

// Cambia el rol de un usuario: aprobar (→ ADMIN), rechazar o quitar acceso (→ USUARIO)
export async function cambiarRol(idUsuario, rolId) {
  if (MODO_DEMO) {
    demoUsuarios = demoUsuarios.map((u) => (u.id === idUsuario ? { ...u, rolId } : u))
    const { contrasena, ...usuario } = demoUsuarios.find((u) => u.id === idUsuario)
    return usuario
  }
  return pedir(`/usuarios/${idUsuario}`, { method: 'PATCH', body: JSON.stringify({ rolId }) })
}