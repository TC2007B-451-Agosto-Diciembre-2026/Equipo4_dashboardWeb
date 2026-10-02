import { useState } from 'react'
import { ROLES } from '../api.js'
import { formatearFecha } from '../data/formato.js'

export default function Solicitudes({ usuarios, sesion, onCambiarRol }) {
  const [trabajando, setTrabajando] = useState(null) // id del usuario que se está procesando
  const [error, setError] = useState('')
  const [aviso, setAviso] = useState('')

  const pendientes = usuarios
    .filter((u) => u.rolId === ROLES.PENDIENTE)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  const administradores = usuarios
    .filter((u) => u.rolId === ROLES.ADMIN || u.rolId === ROLES.SUPERADMIN)
    .sort((a, b) => b.rolId - a.rolId || a.nombre.localeCompare(b.nombre))

  async function cambiar(usuario, rolId, mensaje, confirmar) {
    if (confirmar && !window.confirm(confirmar)) return
    setTrabajando(usuario.id)
    setError('')
    setAviso('')
    try {
      await onCambiarRol(usuario.id, rolId)
      setAviso(mensaje)
    } catch (e) {
      setError(e.message)
    } finally {
      setTrabajando(null)
    }
  }

  return (
    <div className="solicitudes">
      <div className="encabezado-pagina">
        <h1>Solicitudes de acceso</h1>
        <p>Aprueba o rechaza a quienes pidieron una cuenta de administrador</p>

        <div className="pildoras">
          <div className="pildora pildora-naranja"><strong>{pendientes.length}</strong> Pendientes</div>
          <div className="pildora pildora-azul"><strong>{administradores.length}</strong> Con acceso</div>
        </div>
      </div>

      {(error || aviso) && (
        <div className="avisos">
          {error && <p className="aviso-error">{error}</p>}
          {aviso && <p className="aviso-ok">{aviso}</p>}
        </div>
      )}

      <div className="caja caja-tabla">
        <div className="caja-encabezado">
          <h3>Por aprobar</h3>
          <p className="caja-sub">Cuentas creadas desde la pantalla de registro</p>
        </div>
        <div className="tabla-scroll">
          <table className="tabla tabla-fija">
            <thead>
              <tr>
                <th>NOMBRE / CORREO</th>
                <th>SOLICITADO</th>
                <th className="th-acciones">ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {pendientes.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="fila-titulo">{u.nombre}</div>
                    <div className="fila-sub">{u.correo}</div>
                  </td>
                  <td className="celda-gris">{formatearFecha(u.createdAt)}</td>
                  <td>
                    <div className="acciones">
                      <button
                        className="boton-accion boton-aprobar"
                        disabled={trabajando === u.id}
                        onClick={() => cambiar(u, ROLES.ADMIN, `${u.nombre} ya puede entrar al panel.`)}
                      >
                        ✓ Aprobar
                      </button>
                      <button
                        className="boton-accion boton-rechazar"
                        disabled={trabajando === u.id}
                        onClick={() =>
                          cambiar(u, ROLES.USUARIO, `Se rechazó la solicitud de ${u.nombre}.`,
                            `¿Rechazar la solicitud de ${u.nombre}? Su cuenta quedará como usuario normal de la app.`)
                        }
                      >
                        Rechazar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {pendientes.length === 0 && (
                <tr><td colSpan="3" className="vacio">No hay solicitudes pendientes. Las nuevas aparecerán aquí.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="caja caja-tabla">
        <div className="caja-encabezado">
          <h3>Administradores con acceso</h3>
          <p className="caja-sub">Personas que hoy pueden entrar al panel</p>
        </div>
        <div className="tabla-scroll">
          <table className="tabla tabla-fija">
            <thead>
              <tr>
                <th>NOMBRE / CORREO</th>
                <th>ROL</th>
                <th className="th-acciones">ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {administradores.map((u) => {
                const esSuper = u.rolId === ROLES.SUPERADMIN
                const esYo = u.id === sesion?.id
                return (
                  <tr key={u.id}>
                    <td>
                      <div className="fila-titulo">{u.nombre}{esYo && <span className="tu"> (tú)</span>}</div>
                      <div className="fila-sub">{u.correo}</div>
                    </td>
                    <td>
                      <span className={'badge badge-chico ' + (esSuper ? 'badge-rojo' : 'badge-azul')}>
                        {esSuper ? 'Superadmin' : 'Administrador'}
                      </span>
                    </td>
                    <td>
                      {!esSuper && (
                        <div className="acciones">
                          <button
                            className="boton-accion boton-rechazar"
                            disabled={trabajando === u.id}
                            onClick={() =>
                              cambiar(u, ROLES.USUARIO, `${u.nombre} ya no tiene acceso al panel.`,
                                `¿Quitarle el acceso al panel a ${u.nombre}?`)
                            }
                          >
                            Quitar acceso
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}