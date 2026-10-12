import { Check, Circle, Eye, EyeOff, House } from 'lucide-react'
import { useState } from 'react'
import { solicitarCuenta } from '../api.js'

// Mismas reglas que pide el backend (RegisterDto) para la contraseña
const REGLAS = [
  { texto: 'Al menos 10 caracteres', cumple: (c) => c.length >= 10 },
  { texto: 'Una mayúscula', cumple: (c) => /[A-Z]/.test(c) },
  { texto: 'Una minúscula', cumple: (c) => /[a-z]/.test(c) },
  { texto: 'Un número', cumple: (c) => /[0-9]/.test(c) },
  { texto: 'Un símbolo (!, @, #…)', cumple: (c) => /[^A-Za-z0-9]/.test(c) },
  { texto: 'Sin 3 caracteres iguales seguidos', cumple: (c) => c.length > 0 && !/(.)\1\1/.test(c) },
]

export default function Registro({ onVolver }) {
  const [nombre, setNombre] = useState('')
  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [verContrasena, setVerContrasena] = useState(false)
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [enviada, setEnviada] = useState(false)

  const reglasOk = REGLAS.every((r) => r.cumple(contrasena))
  const coinciden = contrasena === confirmar
  const listo = nombre.trim().length >= 2 && correo.includes('@') && reglasOk && coinciden

  async function manejarEnvio(e) {
    e.preventDefault()
    setError('')
    setEnviando(true)
    try {
      await solicitarCuenta({ nombre, email: correo, password: contrasena })
      setEnviada(true)
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
          <div className="logo"><House size={30} /></div>
          <h1 className="login-titulo">0Fraud Stay</h1>
          <div className="login-sub">SOLICITUD DE ACCESO</div>
        </div>

        {enviada ? (
          <div className="login-tarjeta registro-exito">
            <div className="exito-icono"><Check size={26} strokeWidth={2.5} /></div>
            <h2>Solicitud enviada</h2>
            <p className="login-texto">
              Un superadministrador revisará tu solicitud. Cuando la apruebe, podrás entrar al panel con{' '}
              <strong>{correo.trim().toLowerCase()}</strong>.
            </p>
            <button type="button" className="boton-rojo" onClick={onVolver}>Volver a iniciar sesión</button>
          </div>
        ) : (
          <form className="login-tarjeta" onSubmit={manejarEnvio}>
            <h2>Crear cuenta de administrador</h2>
            <p className="login-texto">Un superadministrador revisará tus datos y aprobará tu acceso al panel</p>

            <label className="login-label" htmlFor="nombre">NOMBRE COMPLETO</label>
            <input id="nombre" className="login-input" placeholder="Ana Martínez" autoComplete="name"
              value={nombre} onChange={(e) => setNombre(e.target.value)} />

            <label className="login-label" htmlFor="correo">CORREO</label>
            <input id="correo" className="login-input" type="email" placeholder="tu.correo@0fraudstay.mx" autoComplete="email"
              value={correo} onChange={(e) => setCorreo(e.target.value)} />

            <label className="login-label" htmlFor="nueva">CONTRASEÑA</label>
            <div className="input-con-boton">
              <input id="nueva" className="login-input" type={verContrasena ? 'text' : 'password'} placeholder="••••••••••"
                autoComplete="new-password" value={contrasena} onChange={(e) => setContrasena(e.target.value)} />
              <button type="button" className="ojo" aria-label={verContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                onClick={() => setVerContrasena(!verContrasena)}>
                {verContrasena ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <ul className="reglas">
              {REGLAS.map((r) => (
                <li key={r.texto} className={r.cumple(contrasena) ? 'regla-ok' : ''}>
                  {r.cumple(contrasena) ? <Check size={14} strokeWidth={2.5} /> : <Circle size={12} />} {r.texto}
                </li>
              ))}
            </ul>

            <label className="login-label" htmlFor="confirmar">CONFIRMAR CONTRASEÑA</label>
            <input id="confirmar" className="login-input" type={verContrasena ? 'text' : 'password'} placeholder="••••••••••"
              autoComplete="new-password" value={confirmar} onChange={(e) => setConfirmar(e.target.value)} />
            {confirmar && !coinciden && <p className="login-error">Las contraseñas no coinciden.</p>}

            {error && <p className="login-error">{error}</p>}

            <button type="submit" className="boton-rojo" disabled={!listo || enviando}>
              {enviando ? 'Enviando…' : 'Solicitar acceso'}
            </button>

          </form>
        )}

        {!enviada && (
          <p className="login-volver">
            ¿Ya tienes cuenta?{' '}
            <button type="button" className="login-enlace" onClick={onVolver}>Iniciar sesión</button>
          </p>
        )}
      </div>
    </div>
  )
}