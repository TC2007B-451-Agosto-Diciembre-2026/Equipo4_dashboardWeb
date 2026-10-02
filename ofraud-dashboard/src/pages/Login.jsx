import { useState } from 'react'
import { iniciarSesion, MODO_DEMO } from '../api.js'

export default function Login({ onEntrar, onCrearCuenta }) {
  const [usuario, setUsuario] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [verContrasena, setVerContrasena] = useState(false)
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function manejarEnvio(e) {
    e.preventDefault()
    setError('')
    setEnviando(true)
    try {
      await iniciarSesion(usuario, contrasena)
      onEntrar()
    } catch (err) {
      setError(err.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="login-fondo">
      <div className="login-caja">
        <div className="login-encabezado">
          <div className="logo">🏠</div>
          <h1 className="login-titulo">0Fraud Stay</h1>
          <div className="login-sub">ACCESO ADMINISTRADOR</div>
        </div>

        <form className="login-tarjeta" onSubmit={manejarEnvio}>
          <h2>Iniciar sesión</h2>
          <p className="login-texto">Solo personal autorizado de 0Fraud Stay</p>

          <label className="login-label" htmlFor="usuario">CORREO</label>
          <input
            id="usuario"
            className="login-input"
            type="email"
            placeholder="admin@0fraudstay.mx"
            autoComplete="username"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
          />

          <label className="login-label" htmlFor="contrasena">CONTRASEÑA</label>
          <div className="input-con-boton">
            <input
              id="contrasena"
              className="login-input"
              type={verContrasena ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="current-password"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
            />
            <button
              type="button"
              className="ojo"
              aria-label={verContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              onClick={() => setVerContrasena(!verContrasena)}
            >
              {verContrasena ? '🙈' : '👁'}
            </button>
          </div>

          {error && <p className="login-error">{error}</p>}

          <button type="submit" className="boton-rojo" disabled={enviando || !usuario || !contrasena}>
            {enviando ? 'Ingresando…' : 'Ingresar al panel'}
          </button>

        </form>

        <p className="login-volver">
          ¿No tienes cuenta?{' '}
          <button type="button" className="login-enlace" onClick={onCrearCuenta}>Crear cuenta de administrador</button>
        </p>
        {MODO_DEMO && (
          <p className="login-pista">
            Modo demo · superadmin@0fraudstay.mx / Super1234! · admin@0fraudstay.mx / Admin1234!
          </p>
        )}
      </div>
    </div>
  )
}