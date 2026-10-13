import { CircleCheck, Pencil, SearchCheck, ShieldAlert, Trash2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { ESTILOS_ESTADO, claveEstado, nombreDe } from '../data/formato.js'
import EditarReporte from './EditarReporte.jsx'
import { obtenerAutor } from '../api.js'

const BOTONES = [
  { clave: 'fraude', clase: 'clasificar-rojo', icono: ShieldAlert, titulo: 'Confirmar fraude', texto: 'El reporte será publicado como fraude verificado' },
  { clave: 'revision', clase: 'clasificar-naranja', icono: SearchCheck, titulo: 'Poner en revisión', texto: 'Requiere más información antes de clasificar' },
  { clave: 'no_fraude', clase: 'clasificar-verde', icono:   CircleCheck, titulo: 'Rechazar — no es fraude', texto: 'El reporte no cumple con criterios de fraude' },
]

export default function DetalleReporte({ reporte, catalogos, onCerrar, onActualizar, onEliminar }) {
  const [editando, setEditando] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [autor, setAutor] = useState(null)
  const [errorAutor, setErrorAutor] = useState('')

  // Cada vez que se abre un reporte, pide los datos de quien lo creó
  useEffect(() => {
    let vigente = true
    setAutor(null)
    setErrorAutor('')
    obtenerAutor(reporte.id)
      .then((datos) => vigente && setAutor(datos))
      .catch((e) => vigente && setErrorAutor(e.message))
    return () => {
      vigente = false
    }
  }, [reporte.id])

  // Busca en el catálogo de estados el id que corresponde a cada botón
  function estadoPara(clave) {
    return catalogos.estados.find((e) => claveEstado(nombreDe(e)) === clave)
  }

  async function ejecutar(accion) {
    setGuardando(true)
    setError('')
    try {
      await accion()
      return true
    } catch (e) {
      setError(e.message)
      return false
    } finally {
      setGuardando(false)
    }
  }

  function clasificar(clave) {
    const estado = estadoPara(clave)
    ejecutar(() => onActualizar({ estadoId: estado.id }))
  }

  function eliminar() {
    if (window.confirm(`¿Eliminar el reporte ${reporte.folio}? Esta acción no se puede deshacer.`)) {
      ejecutar(onEliminar)
    }
  }

  const mapa = reporte.latitud != null && reporte.longitud != null
    ? `https://www.google.com/maps?q=${reporte.latitud},${reporte.longitud}`
    : null

  return (
    <aside className="panel">
      <div className="panel-encabezado">
        <div>
          <div className="panel-eyebrow">DETALLE DEL REPORTE · {reporte.folio}</div>
          <h2 className="panel-titulo">{reporte.titulo}</h2>
          {!editando && <span className={'badge ' + ESTILOS_ESTADO[reporte.estado]}>{reporte.estadoNombre}</span>}
        </div>
        <div className="panel-acciones">
          {!editando && (
            <>
              <button className="boton-borde" onClick={() => setEditando(true)}><Pencil size={15} /> Editar</button>
              <button className="boton-borde boton-borde-rojo" onClick={eliminar} disabled={guardando}><Trash2 size={15} /> Eliminar</button>
            </>
          )}
          <button className="boton-cerrar" aria-label="Cerrar" onClick={onCerrar}><X size={18} /></button>
        </div>
      </div>

      {editando ? (
        <EditarReporte
          reporte={reporte}
          catalogos={catalogos}
          onCancelar={() => setEditando(false)}
          onGuardar={async (cambios) => {
            await onActualizar(cambios)
            setEditando(false)
          }}
        />
      ) : (
        <div className="panel-cuerpo">
          {error && <p className="aviso-error">{error}</p>}

          <div className="datos-grid">
            <div className="dato"><span>USUARIO</span> {autor ? autor.nombre : errorAutor ? '—' : 'Cargando…'}</div>
            <div className="dato"><span>CORREO</span>  {autor ? autor.correo : errorAutor ? '—' : 'Cargando…'}</div>
            {errorAutor && <p className="aviso-error dato-ancho">{errorAutor}</p>}
            <div className="dato"><span>PLATAFORMA</span>{reporte.plataforma}</div>
            <div className="dato"><span>TIPOLOGÍA</span>{reporte.tipologia}</div>
            <div className="dato"><span>TIPO DE PROPIEDAD</span>{reporte.tipoPropiedad}</div>
            <div className="dato"><span>FECHA DE REPORTE</span>{reporte.fecha}</div>
            <div className="dato dato-ancho">
              <span>UBICACIÓN</span>
              {mapa ? (
                <>
                  {Number(reporte.latitud).toFixed(5)}, {Number(reporte.longitud).toFixed(5)}{' '}
                  <a href={mapa} target="_blank" rel="noreferrer" className="enlace">Ver en mapa</a>
                </>
              ) : '—'}
            </div>
          </div>

          <div className="seccion-titulo">DESCRIPCIÓN DEL FRAUDE</div>
          <div className="descripcion">{reporte.descripcion}</div>

          <div className="seccion-titulo">EVIDENCIA ADJUNTA</div>
          {reporte.fotoUrl || reporte.evidenciaUrl ? (
            <div className="fotos-reporte">
              {reporte.fotoUrl && (
                <figure>
                  <a href={reporte.fotoUrl} target="_blank" rel="noreferrer">
                    <img className="foto-evidencia" src={reporte.fotoUrl} alt={`Portada del reporte ${reporte.folio}`} />
                  </a>
                  <figcaption>Portada</figcaption>
                </figure>
              )}
              {reporte.evidenciaUrl && (
                <figure>
                  <a href={reporte.evidenciaUrl} target="_blank" rel="noreferrer">
                    <img className="foto-evidencia" src={reporte.evidenciaUrl} alt={`Evidencia del reporte ${reporte.folio}`} />
                  </a>
                  <figcaption>Evidencia</figcaption>
                </figure>
              )}
            </div>
          ) : (
            <div className="evidencia evidencia-vacia">Este reporte no tiene archivos adjuntos</div>
          )}

          <hr />

          <div className="seccion-titulo">CLASIFICAR REPORTE</div>
          {BOTONES.map((b) => {
            const existe = Boolean(estadoPara(b.clave))
            return (
              <button
                key={b.clave}
                className={`clasificar ${b.clase}${reporte.estado === b.clave ? ' elegido' : ''}`}
                onClick={() => clasificar(b.clave)}
                disabled={guardando || !existe}
                title={existe ? '' : 'Este estado no existe en la base de datos'}
              >
                <span className="clasificar-icono"><b.icono size={18} /></span>
                <span>
                  <strong>{b.titulo}</strong>
                  <small>{existe ? b.texto : 'No hay un estado equivalente en la base de datos'}</small>
                </span>
              </button>
            )
          })}
        </div>
      )}
    </aside>
  )
}