import { ROLES } from '../api.js'

export default function Sidebar({ pagina, onCambiarPagina, onSalir, sesion, nombre, colapsada, onAlternar, pendientes }) {
  const esSuper = sesion?.rolId === ROLES.SUPERADMIN

  const opciones = [
    { id: 'reportes', icono: '⚠', texto: 'Reportes' },
    { id: 'dashboard', icono: '◈', texto: 'Dashboard' },
    ...(esSuper ? [{ id: 'solicitudes', icono: '👥', texto: 'Solicitudes', contador: pendientes }] : []),
  ]

  return (
    <aside className={colapsada ? 'sidebar colapsada' : 'sidebar'}>
      <div className="sidebar-marca">
        <div className="logo logo-chico">🏠</div>
        <div className="sidebar-texto">
          <div className="marca-nombre">0Fraud Stay</div>
          <div className="marca-sub">{esSuper ? 'SUPERADMIN' : 'ADMIN PANEL'}</div>
        </div>
      </div>

      <button
        className="sidebar-alternar"
        onClick={onAlternar}
        aria-label={colapsada ? 'Mostrar barra lateral' : 'Ocultar barra lateral'}
        title={colapsada ? 'Mostrar barra lateral' : 'Ocultar barra lateral'}
      >
        {colapsada ? '»' : '«'}
      </button>

      <nav className="sidebar-nav">
        {opciones.map((o) => (
          <button
            key={o.id}
            className={pagina === o.id ? 'nav-item activo' : 'nav-item'}
            onClick={() => onCambiarPagina(o.id)}
            title={colapsada ? o.texto : undefined}
          >
            <span className="nav-icono">{o.icono}</span>
            <span className="sidebar-texto">{o.texto}</span>
            {o.contador > 0 && <span className="nav-contador">{o.contador}</span>}
          </button>
        ))}
      </nav>

      <div className="sidebar-pie">
        <div className="admin" title={colapsada ? sesion?.correo : undefined}>
          <div className="admin-avatar">👤</div>
          <div className="sidebar-texto">
            <div className="admin-nombre">{nombre || (esSuper ? 'Superadministrador' : 'Administrador')}</div>
            <div className="admin-correo">{sesion?.correo}</div>
          </div>
        </div>
        <button className="salir" onClick={onSalir} title={colapsada ? 'Salir al app' : undefined}>
          ← <span className="sidebar-texto">Salir al app</span>
        </button>
      </div>
    </aside>
  )
}