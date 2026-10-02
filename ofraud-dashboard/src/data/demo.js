// Datos de prueba para usar el dashboard SIN backend (modo demo).
// Tienen exactamente la misma forma que lo que regresa la API de NestJS,
// así el resto del dashboard funciona igual con datos falsos o reales.

// Catálogos: copiados de los INSERT de back-tc2007/src/db/schema.sql
export const estados = [
  { id: 1, nombre: 'Pendiente' },
  { id: 2, nombre: 'En revisión' },
  { id: 3, nombre: 'Verificado' },
  { id: 4, nombre: 'Rechazado' },
  { id: 5, nombre: 'Cerrado' },
]

export const fuentes = [
  { id: 1, tipoFuente: 'Plataforma', valorFuente: 'Airbnb' },
  { id: 2, tipoFuente: 'Plataforma', valorFuente: 'Booking' },
  { id: 3, tipoFuente: 'Plataforma', valorFuente: 'Vrbo' },
  { id: 4, tipoFuente: 'Red social', valorFuente: 'Facebook Marketplace' },
  { id: 5, tipoFuente: 'Red social', valorFuente: 'Instagram' },
  { id: 6, tipoFuente: 'Mensajería', valorFuente: 'WhatsApp' },
  { id: 7, tipoFuente: 'Otro', valorFuente: 'Recomendación personal' },
]

export const tiposPropiedad = [
  { id: 1, nombre: 'Departamento' },
  { id: 2, nombre: 'Casa completa' },
  { id: 3, nombre: 'Habitación privada' },
  { id: 4, nombre: 'Villa' },
  { id: 5, nombre: 'Cabaña' },
  { id: 6, nombre: 'Hotel' },
]

export const tiposFraude = [
  { id: 1, nombre: 'Propiedad inexistente' },
  { id: 2, nombre: 'Suplantación de anfitrión' },
  { id: 3, nombre: 'Cobro fuera de la plataforma' },
  { id: 4, nombre: 'Fotos falsas o engañosas' },
  { id: 5, nombre: 'Doble reservación' },
  { id: 6, nombre: 'Solicitud de depósito fraudulento' },
]

// Cuentas de prueba para entrar al panel:
//   superadmin@0fraudstay.mx / Super1234!   → ve la pestaña de Solicitudes
//   admin@0fraudstay.mx      / Admin1234!
const hace = (dias) => new Date(Date.now() - dias * 86400000).toISOString()
export const usuarios = [
  { id: 'u-super', correo: 'superadmin@0fraudstay.mx', contrasena: 'Super1234!', nombre: 'Superadministrador', rolId: 3, createdAt: hace(200) },
  { id: 'u-admin', correo: 'admin@0fraudstay.mx', contrasena: 'Admin1234!', nombre: 'Administrador', rolId: 2, createdAt: hace(150) },
  { id: 'u-mar', correo: 'mar@0fraudstay.mx', contrasena: 'Demo1234!', nombre: 'Mar López', rolId: 2, createdAt: hace(60) },
  { id: 'u-javi', correo: 'javi@0fraudstay.mx', contrasena: 'Demo1234!', nombre: 'Javier Ruiz', rolId: 4, createdAt: hace(1) },
  { id: 'u-adri', correo: 'adri@0fraudstay.mx', contrasena: 'Demo1234!', nombre: 'Adriana Soto', rolId: 4, createdAt: hace(3) },
  { id: 'u-ana', correo: 'ana@correo.com', contrasena: 'x', nombre: 'Ana Martínez', rolId: 1, createdAt: hace(90) },
  { id: 'u-roberto', correo: 'roberto.p@gmail.com', contrasena: 'x', nombre: 'Roberto Pérez', rolId: 1, createdAt: hace(90) },
  { id: 'u-sofia', correo: 'sofia.g@outlook.com', contrasena: 'x', nombre: 'Sofía Guerrero', rolId: 1, createdAt: hace(90) },
  { id: 'u-felipe', correo: 'ftrevino@empresa.mx', contrasena: 'x', nombre: 'Felipe Treviño', rolId: 1, createdAt: hace(90) },
  { id: 'u-claudia', correo: 'claudia.r@hotmail.com', contrasena: 'x', nombre: 'Claudia Ramos', rolId: 1, createdAt: hace(90) },
  { id: 'u-jorge', correo: 'jhernandez@correo.com', contrasena: 'x', nombre: 'Jorge Hernández', rolId: 1, createdAt: hace(90) },
]

// Fecha "hace N días" para que las gráficas siempre muestren los últimos meses
function haceDias(dias) {
  const d = new Date()
  d.setDate(d.getDate() - dias)
  return d.toISOString()
}

// [id, título, descripción, usuario, fuenteId, estadoId, tipoPropiedadId, tipoFraudeId, latitud, longitud, días atrás]
const filas = [
  [112, 'Depto Condesa — anfitrión desapareció tras cobro', 'El anfitrión solicitó depósito de $4,200 MXN y dejó de responder. El perfil fue eliminado horas después del pago.', 'u-ana', 4, 2, 1, 6, 19.4111, -99.1735, 2],
  [111, 'Casa Tulum — fotos idénticas a listing verificado de Airbnb', 'El anuncio usaba las mismas fotos que una casa verificada, pero con otro anfitrión y pago por transferencia.', 'u-roberto', 1, 3, 2, 4, 20.2114, -87.4654, 5],
  [110, 'Penthouse Roma Norte — precio 80% abajo del mercado', 'Penthouse de 3 recámaras a $6,000 MXN por semana. Piden apartar con depósito antes de la visita.', 'u-sofia', 7, 1, 1, 6, 19.4194, -99.1622, 9],
  [109, 'Villa Cancún — pago en criptomoneda exigido', 'Solo aceptaban pago en USDT y se negaron a hacer videollamada para mostrar la villa.', 'u-felipe', 5, 3, 4, 3, 21.1333, -86.7467, 14],
  [108, 'Cabaña Valle de Bravo — llave nunca entregada', 'Se pagó la estancia completa y el día de llegada nadie entregó la llave. La dirección era de otra casa.', 'u-claudia', 4, 2, 5, 1, 19.1950, -100.1311, 22],
  [107, 'Studio Polanco — contrato falso con RFC inexistente', 'Se revisó el RFC y sí existe; el contrato tenía un error de captura. No cumple criterios de fraude.', 'u-jorge', 4, 4, 1, 2, 19.4326, -99.1950, 31],
  [106, 'Depto Guadalajara — switch de propiedad el día del check-in', 'Al llegar entregaron un departamento distinto y más pequeño que el de las fotos.', 'u-ana', 6, 2, 1, 4, 20.6736, -103.3687, 40],
  [105, 'Casa Mazatlán — fotos de Google Street View usadas', 'La fachada del anuncio es una captura de Street View y el anfitrión no tiene reseñas.', 'u-sofia', 3, 1, 2, 1, 23.2167, -106.4167, 52],
  [104, 'Loft Monterrey — reseñas todas del mismo mes', 'Veinte reseñas publicadas en el mismo mes por cuentas nuevas. Pidieron salir de la plataforma para pagar.', 'u-roberto', 1, 3, 1, 3, 25.6714, -100.3089, 68],
  [103, 'Bungalow Oaxaca — precio trampa semana santa', 'Precio muy por debajo de la temporada y exigen el pago completo en las próximas 2 horas.', 'u-felipe', 4, 1, 2, 6, 17.0606, -96.7253, 85],
  [102, 'Departamento Puerto Vallarta — perfil clonado de Booking', 'La página imita a Booking pero el dominio es distinto y el pago se hace por SPEI.', 'u-claudia', 2, 2, 1, 2, 20.6000, -105.2333, 110],
  [101, 'Suite Mérida — pedía pago en Oxxo y no daba comprobante', 'El anfitrión sí entregó la suite; el comprobante llegó después. Se descarta fraude.', 'u-jorge', 6, 4, 6, 3, 20.9670, -89.6230, 140],
]

export const reportes = filas.map(([id, nombre, descripcion, usuarioId, fuenteId, estadoId, tipoPropiedadId, tipoFraudeId, latitud, longitud, dias]) => ({
  id, nombre, descripcion, usuarioId, fuenteId, estadoId, tipoPropiedadId, tipoFraudeId, latitud, longitud,
  fotoUrl: null, // en modo demo no hay fotos
  createdAt: haceDias(dias),
  updatedAt: null,
}))