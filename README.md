
# 0Fraud Stay — Panel de administración

Panel web de administración de **0Fraud Stay**, una plataforma orientada a la prevención y divulgación de posibles fraudes relacionados con rentas vacacionales. Permite al personal autorizado consultar reportes, revisar estadísticas y gestionar solicitudes de acceso de administradores.

> Este repositorio/archivo contiene la carpeta `src/` del frontend. Para ejecutar la aplicación también necesitas el archivo de configuración del proyecto (por ejemplo, `package.json` y `vite.config.js`) y el backend correspondiente.

## Funcionalidades

- **Inicio de sesión de administradores** mediante la API.
- **Registro de solicitudes de acceso** para nuevas cuentas administrativas.
- **Dashboard** con estadísticas generales, distribución por estado, tipologías y tendencias mensuales.
- **Historial de reportes** con búsqueda por folio, título, usuario o correo, y filtros por estado y plataforma.
- **Detalle y edición de reportes**, además de la opción de eliminarlos según los permisos disponibles en el backend.
- **Gestión de solicitudes**: el superadministrador puede aprobar o rechazar solicitudes de acceso.
- **Control de sesión** con tokens de acceso y renovación de sesión.
- **Diseño adaptable** con barra lateral de navegación.

## Tecnologías

- React
- JavaScript (ES Modules / JSX)
- Vite (configuración esperada del proyecto)
- Axios para las peticiones HTTP
- Recharts para las gráficas
- Lucide React para los iconos
- CSS

## Estructura del código

```text
src/
├── api.js
├── App.jsx
├── main.jsx
├── index.css
├── components/
│   ├── DetalleReporte.jsx
│   ├── EditarReporte.jsx
│   └── Sidebar.jsx
├── data/
│   ├── demo.js
│   └── formato.js
└── pages/
    ├── Dashboard.jsx
    ├── Login.jsx
    ├── Registro.jsx
    ├── Reportes.jsx
    └── Solicitudes.jsx
```

### Archivos principales

- `api.js`: centraliza las llamadas al backend, autenticación, manejo de tokens y operaciones sobre reportes y usuarios.
- `App.jsx`: administra la sesión, navegación, carga de datos y acciones principales.
- `pages/Dashboard.jsx`: presenta métricas y gráficas.
- `pages/Reportes.jsx`: permite buscar, filtrar y seleccionar reportes.
- `pages/Login.jsx` y `pages/Registro.jsx`: gestionan el acceso y las solicitudes de cuenta.
- `pages/Solicitudes.jsx`: permite al superadministrador gestionar solicitudes pendientes.
- `data/formato.js`: transforma datos de la API para mostrarlos en la interfaz y normaliza los estados.
- `data/demo.js`: contiene datos de ejemplo para el modo demo.

## Requisitos

- Node.js y npm instalados.
- El proyecto frontend completo, incluidos `package.json` y la configuración de Vite.
- El backend de 0Fraud Stay ejecutándose y accesible desde el frontend, si se utiliza la API real.

## Instalación y ejecución

1. Coloca la carpeta `src/` dentro del proyecto frontend completo.
2. Abre una terminal en la raíz del proyecto.
3. Instala las dependencias declaradas en `package.json`:

   ```bash
   npm install
   ```

4. Inicia el servidor de desarrollo:

   ```bash
   npm run dev
   ```

5. Abre en el navegador la URL local que indique Vite en la terminal.

### Dependencias utilizadas por el código

Comprueba que el proyecto tenga instaladas, como mínimo, las dependencias que utiliza este código:

```bash
npm install react react-dom axios recharts lucide-react
```

También debe estar configurado Vite y su plugin de React si el proyecto todavía no los incluye. Los comandos exactos pueden variar según el `package.json` original.

## Conexión con el backend

En `src/api.js`, Axios utiliza `/api` como URL base. El código espera que el servidor de desarrollo redirija las solicitudes `/api` al backend mediante un proxy de Vite.

La interfaz utiliza endpoints de autenticación como:

- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/register-admin`

Además, `api.js` contiene operaciones para consultar catálogos y reportes, cargar estadísticas, actualizar o eliminar reportes y cambiar roles de usuarios. Los endpoints y formatos exactos deben coincidir con la implementación del backend.

**Importante:** configura el proxy en `vite.config.js` para apuntar al backend correcto. La URL y el puerto dependen de tu entorno; no se incluyen aquí porque no aparecen en los archivos proporcionados.

## Roles de usuario

El frontend define estos identificadores de rol en `api.js`:

| Rol | Identificador | Acceso previsto |
|---|---:|---|
| Usuario | `1` | No puede entrar al panel administrativo |
| Administrador | `2` | Puede acceder a las funciones administrativas |
| Superadministrador | `3` | Puede acceder y gestionar solicitudes de cuentas |
| Pendiente | `4` | Debe esperar la aprobación de un superadministrador |

Los permisos definitivos deben validarse también en el backend; ocultar o mostrar opciones en el frontend no sustituye la autorización del servidor.

## Modo demo

`src/api.js` contiene la constante `MODO_DEMO`, actualmente configurada como `false`. En ese estado, el frontend utiliza el backend.

Para probar el flujo con los datos locales de `src/data/demo.js`, cambia temporalmente la constante a `true`. El archivo de datos incluye estas cuentas de ejemplo:

| Cuenta | Correo | Contraseña |
|---|---|---|
| Superadministrador | `superadmin@0fraudstay.mx` | `Super1234!` |
| Administrador | `admin@0fraudstay.mx` | `Admin1234!` |

Estas credenciales son únicamente para datos de demostración. **No las uses en producción.** El modo demo almacena los datos en memoria y no equivale a un sistema de autenticación seguro.

## Seguridad

- No incluyas contraseñas reales, tokens ni secretos en el repositorio.
- Usa HTTPS en entornos desplegados.
- Valida permisos y roles en el backend.
- Revisa las políticas de almacenamiento y renovación de tokens antes de publicar la aplicación.
- Desactiva los datos de prueba y las credenciales demo en producción.

## Estado y alcance

Este README se preparó a partir de los archivos disponibles en `src/`. No se proporcionaron `package.json`, `vite.config.js` ni el código del backend, por lo que los scripts, la configuración del proxy y algunos endpoints deben confirmarse con el proyecto completo.

## Equipo

**0Fraud Stay** — Panel de administración.
