# Mini Proyecto Final — Todo List App

## Descripción del proyecto

Todo List App es una aplicación de gestión de tareas desarrollada con **React Native usando Expo**, conectada a un **backend propio en Node.js/Express**.

La aplicación permite registrar usuarios, iniciar sesión, crear listas de tareas, visualizar listas, entrar al detalle de una lista, crear tareas, editar tareas, marcar tareas como completadas, eliminar tareas, buscar listas/tareas y cerrar sesión.

El proyecto implementa autenticación con **Firebase Authentication**, validación de tokens mediante **Firebase Admin** en el backend, generación de **JWT propio** para autorización y persistencia de datos en **PostgreSQL usando Neon**.

---

## Tecnologías utilizadas

### Frontend

* Expo
* React Native
* Expo Router
* Firebase Authentication
* Axios
* Axios interceptors
* AsyncStorage
* Componentes reutilizables

### Backend

* Node.js
* Express
* PostgreSQL
* Neon Database
* Firebase Admin SDK
* JSON Web Token
* CORS
* dotenv
* pg

---

## Funcionalidades implementadas

* Registro de usuario con Firebase Authentication.
* Login con Firebase Authentication.
* Creación de sesión en backend usando token de Firebase.
* Generación de JWT propio en backend.
* Persistencia de sesión en frontend.
* Rutas protegidas mediante JWT.
* Axios instance personalizada.
* Axios interceptors para enviar el token automáticamente.
* CRUD de listas de tareas.
* CRUD de tareas dentro de una lista.
* Marcado de tareas como completadas.
* Búsqueda por listas y tareas.
* Página de perfil/about.
* Logout funcional.
* Manejo visual de errores.
* Indicadores de carga.
* Navegación completa con Expo Router.
* Backend deployado públicamente en Render.

---

## Estructura del proyecto

```txt
toDo_final/
├── todo/
│   ├── src/
│   │   ├── api/
│   │   ├── app/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── lib/
│   ├── package.json
│   └── app.json
│
└── todo_back_end/
    └── todo-backend/
        ├── src/
        │   ├── config/
        │   └── server.js
        ├── scripts/
        │   └── init-db.js
        └── package.json
```

---

## Backend deployado

URL base del backend:

```txt
https://todo-final-backend-lsfc.onrender.com
```

Ruta de prueba:

```txt
https://todo-final-backend-lsfc.onrender.com/health
```

Respuesta esperada:

```json
{
  "status": "OK",
  "message": "Todo backend is running",
  "database": "connected",
  "firebaseAdmin": "configured"
}
```

---

## Endpoints principales del backend

### Health

```txt
GET /health
```

### Autenticación

```txt
POST /auth/session
GET /auth/me
```

### Listas

```txt
GET /lists
POST /lists
GET /lists/:id
PUT /lists/:id
DELETE /lists/:id
```

### Tareas

```txt
GET /lists/:listId/tasks
POST /lists/:listId/tasks
GET /tasks/:id
PUT /tasks/:id
DELETE /tasks/:id
```

### Búsqueda

```txt
GET /search?q=texto
```

---

## Variables de entorno del frontend

Archivo:

```txt
todo/.env.local
```

Ejemplo:

```env
EXPO_PUBLIC_API_URL=https://todo-final-backend-lsfc.onrender.com
```

Nota: la configuración pública de Firebase se encuentra en `src/lib/firebase.js`.

---

## Variables de entorno del backend

Archivo local:

```txt
todo_back_end/todo-backend/.env
```

Ejemplo:

```env
DATABASE_URL=postgresql://USUARIO:PASSWORD@HOST/neondb?sslmode=require
JWT_SECRET=clave_larga_para_firmar_tokens
FIREBASE_SERVICE_ACCOUNT_BASE64=service_account_de_firebase_en_base64
```

Estas variables también deben estar configuradas en Render.

Importante: no subir `.env`, claves privadas ni archivos de service account al repositorio.

---

## Instalación y ejecución local

### 1. Clonar el repositorio

```bash
git clone https://github.com/a0127Carl6627/toDo_final.git
cd toDo_final
```

---

## Ejecutar backend local

Entrar a la carpeta del backend:

```bash
cd todo_back_end/todo-backend
```

Instalar dependencias:

```bash
npm install
```

Crear tablas en la base de datos:

```bash
npm run init-db
```

Ejecutar backend:

```bash
npm run dev
```

El backend local corre en:

```txt
http://localhost:4000
```

---

## Ejecutar frontend local

Desde la raíz del repositorio:

```bash
cd todo
```

Instalar dependencias:

```bash
npm install
```

Ejecutar Expo Web:

```bash
npx expo start --web --clear
```

La app se abre en:

```txt
http://localhost:8081
```

---

## Usuario de prueba

```txt
Correo: carmanolmon@gmail.com
Contraseña: 1234567
```

---

## Flujo de autenticación

1. El usuario inicia sesión con Firebase Authentication.
2. Firebase devuelve un `idToken`.
3. El frontend envía ese token al backend mediante `POST /auth/session`.
4. El backend valida el token usando Firebase Admin.
5. El backend crea o actualiza el usuario en PostgreSQL.
6. El backend genera un JWT propio.
7. El frontend guarda el JWT.
8. Axios envía el JWT automáticamente en cada request protegido.
9. El backend autoriza las operaciones de listas, tareas y búsqueda.

---

## Pantallas implementadas

* Login.
* Registro.
* Home / Dashboard.
* Visualización de listas.
* Detalle de lista.
* Visualización de tareas por lista.
* CRUD de listas.
* CRUD de tareas.
* Búsqueda.
* Perfil / About.
* Logout.

---

## Evidencia para el video

El video demostrativo debe mostrar:

1. Apertura de la aplicación.
2. Login con Firebase.
3. Navegación al dashboard.
4. Visualización de listas.
5. Creación de lista.
6. Edición de lista.
7. Entrada al detalle de lista.
8. Creación de tarea.
9. Edición de tarea.
10. Marcar tarea como completada.
11. Eliminación de tarea.
12. Búsqueda por listas/tareas.
13. Página de perfil/about.
14. Logout.
15. Prueba del backend deployado en `/health`.

---

## Buenas prácticas aplicadas

* Separación entre frontend y backend.
* Separación de llamadas API en archivos específicos.
* Uso de componentes reutilizables.
* Uso de hooks.
* Manejo de estado con `useState` y `useEffect`.
* Uso de Axios instance.
* Uso de interceptors.
* Manejo de errores HTTP.
* Manejo visual de loading y errores.
* Persistencia de sesión.
* Protección básica de rutas.
* Backend deployado públicamente.
