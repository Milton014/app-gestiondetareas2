# Gestor de tareas 2

Aplicación móvil del taller, preparada para Expo Go en Android. Al abrirla muestra las tareas de la API del profesor. El título, la descripción y el estado se comparten con el curso. Cada dispositivo guarda sus prioridades.

## Instalación en Windows

1. Instalá Node.js 24 LTS y npm en la PC si aún no los tenés. En PowerShell podés comprobarlos con `node -v` y `npm.cmd -v`. Esta entrega usa Expo SDK 57 y conserva las versiones del proyecto anterior.
2. Instalá o conservá Expo Go compatible con SDK 57 en Android. Si ya abrís el proyecto anterior en ese celular, podés usar la misma instalación.
3. Descomprimí el ZIP en el Escritorio. Abrí la carpeta `app-gestiondetaresas2` que contiene `package.json`. Si Windows creó dos carpetas con el mismo nombre, entrá en la interior.
4. Desde PowerShell, ejecutá una sola vez en esa carpeta:

```powershell
cd "$env:USERPROFILE\Desktop\app-gestiondetaresas2"
npm.cmd ci
```

`npm.cmd ci` instala todas las dependencias enumeradas en el archivo de versiones, incluido el almacenamiento de prioridades. Si tu Escritorio está en OneDrive, abrí la carpeta desde el Explorador y usá **Abrir en Terminal** para usar su ruta real.

## Abrir la app

Conectá el teléfono y la PC a la misma Wi-Fi con acceso a Internet. Desde la carpeta del proyecto ejecutá:

```powershell
npx.cmd expo start --go
```

Abrí Expo Go en Android, elegí **Scan QR code** y escaneá el QR de la terminal. Dejá la terminal abierta mientras desarrollás. Para detener Expo presioná **Ctrl + C**. La próxima vez solo repetí el comando de inicio. El backend que atiende las tareas ya corre en el servidor del profesor.

## Conexión

El archivo `.env` junto a `package.json` ya contiene:

```dotenv
EXPO_PUBLIC_API_URL=https://api.montenegroariel.com.ar
```

El proyecto incluye `.env.example` con el mismo dominio público. El teléfono consulta la API por HTTPS. La PC sirve el código de desarrollo mediante Expo. Podés revisar las operaciones del curso en [Swagger](https://api.montenegroariel.com.ar/docs).

## Archivos principales

| Ubicación | Función |
| --- | --- |
| `app/_layout.tsx` | Abre el gestor y habilita la navegación a Ayuda. |
| `app/index.tsx` | Lista y formulario de tareas, filtros y operaciones. |
| `app/guia.tsx` | Ayuda de uso dentro de la app. |
| `src/services/api.ts` | Lee la dirección del servidor, realiza las peticiones y traduce errores. |
| `src/services/taskService.ts` | Lista, crea, actualiza y elimina tareas con el contrato público del profesor. |
| `src/services/priorityStore.ts` | Lee y guarda las prioridades por identificador en los documentos de la app. |
| `src/components/`, `src/types/`, `src/utils/` | Tarjetas, selectores, tipos, búsquedas y validaciones. |
| `__tests__/` | Pruebas automáticas que simulan el servidor y el almacenamiento. |

## Probar en el celular

1. Abrí el listado. Tocá **Recargar tareas** para consultar cambios hechos por otras personas.
2. En una tarea de práctica propia, elegí **Editar tarea**, cambiá solo la prioridad y guardá. Al recargar o volver a abrir el mismo proyecto con Expo Go, el color y la prioridad deberían conservarse. Borrar los datos de la app elimina las prioridades locales.
3. Probá los filtros por título, estado y prioridad. Una tarea sin preferencia en este celular figura como **Sin prioridad**.
4. Agregar, cambiar el título, completar o eliminar una tarea modifica la lista compartida del servidor. Usá tareas de prueba propias.

Para verificar los tipos y las pruebas en la PC:

```powershell
npm.cmd run typecheck
npm.cmd test
```

Si el QR no conecta, revisá que la PC y el celular estén en la misma Wi-Fi y que la red permita la comunicación entre dispositivos. Si el gestor abre pero las tareas no cargan, probá abrir Swagger desde el navegador del celular y luego tocá **Recargar tareas**.
