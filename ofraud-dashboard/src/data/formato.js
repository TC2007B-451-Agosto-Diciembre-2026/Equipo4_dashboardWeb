// Funciones para convertir lo que manda la API a lo que muestra la pantalla

// Estilo de cada estado (colores del Figma)
export const ESTILOS_ESTADO = {
  pendiente: 'badge-gris',
  revision: 'badge-naranja',
  fraude: 'badge-rojo',
  no_fraude: 'badge-verde',
  otro: 'badge-gris',
}

// Los catálogos traen el texto en "nombre"; las fuentes lo traen en "valorFuente" (ej. "Airbnb")
export function nombreDe(item) {
  if (!item) return '—'
  return item.nombre ?? item.valorFuente ?? `#${item.id}`
}

function sinAcentos(texto) {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

// Traduce el nombre del estado de la BD a una clave fija para colores y botones.
// Estados en la BD: Pendiente, En revisión, Verificado (= fraude confirmado), Rechazado (= no es fraude), Cerrado
export function claveEstado(nombre) {
  const t = sinAcentos(nombre || '')
  if (t.includes('pend')) return 'pendiente'
  if (t.includes('revis')) return 'revision'
  if (t.includes('rechaz') || t.includes('no es')) return 'no_fraude'
  if (t.includes('verific') || t.includes('confirm')) return 'fraude'
  return 'otro'
}

export function crearFolio(reporte) {
  const anio = reporte.createdAt ? new Date(reporte.createdAt).getFullYear() : '0000'
  return `RS-${anio}-${String(reporte.id).padStart(4, '0')}`
}

export function formatearFecha(fecha) {
  if (!fecha) return '—'
  return new Date(fecha)
    .toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
    .replace('.', '')
}

function buscar(lista, id) {
  return lista.find((x) => String(x.id) === String(id))
}

// Junta un reporte crudo de la API con los nombres de sus catálogos
export function armarReporte(r, cat) {
  const estado = buscar(cat.estados, r.estadoId)
  const usuario = buscar(cat.usuarios, r.usuarioId)
  return {
    id: r.id,
    folio: crearFolio(r),
    titulo: r.nombre,
    descripcion: r.descripcion,
    usuario: usuario ? usuario.nombre : `Usuario ${String(r.usuarioId).slice(0, 8)}`,
    correo: usuario ? usuario.correo : '',
    estadoId: r.estadoId,
    estadoNombre: nombreDe(estado),
    estado: claveEstado(nombreDe(estado)),
    fuenteId: r.fuenteId,
    plataforma: nombreDe(buscar(cat.fuentes, r.fuenteId)),
    tipoFraudeId: r.tipoFraudeId,
    tipologia: nombreDe(buscar(cat.tiposFraude, r.tipoFraudeId)),
    tipoPropiedadId: r.tipoPropiedadId,
    tipoPropiedad: nombreDe(buscar(cat.tiposPropiedad, r.tipoPropiedadId)),
    latitud: r.latitud,
    longitud: r.longitud,
    fotoUrl: r.portada ? `/api${r.portada}` : null,
    evidenciaUrl: r.evidencia ? `/api${r.evidencia}` : null,
    creado: r.createdAt,
    fecha: formatearFecha(r.createdAt),
  }
}

export function contarPorEstado(reportes) {
  return {
    total: reportes.length,
    fraude: reportes.filter((r) => r.estado === 'fraude').length,
    revision: reportes.filter((r) => r.estado === 'revision').length,
    pendiente: reportes.filter((r) => r.estado === 'pendiente').length,
  }
}