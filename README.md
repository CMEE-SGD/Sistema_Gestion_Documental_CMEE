# Sistema Informático del Centro de Metrología del Ejército Ecuatoriano (CMEE)

Aplicación web para la gestión administrativa, gestión de calidad, y validación/firma de certificados de los cinco laboratorios del Centro de Metrología del Ejército Ecuatoriano (CMEE). Desarrollada en el marco de las pasantías de la Universidad de las Fuerzas Armadas ESPE.

> Monorepo con dos paquetes NPM independientes: [`backend/`](backend) (API REST) y [`frontend/`](frontend) (SPA). No existe orquestador de workspace: cada comando se ejecuta dentro de su respectiva carpeta.

## Tabla de contenidos

- [Características](#características)
- [Stack tecnológico](#stack-tecnológico)
- [Estructura del repositorio](#estructura-del-repositorio)
- [Requisitos previos](#requisitos-previos)
- [Instalación](#instalación)
  - [Backend](#backend)
  - [Frontend](#frontend)
- [Scripts disponibles](#scripts-disponibles)
- [Documentación de la API](#documentación-de-la-api)
- [Autenticación y permisos](#autenticación-y-permisos)
- [Licencia](#licencia)

## Características

- **Gestión administrativa**: personas, puestos, departamentos, laboratorios y grupos.
- **Gestor documental**: carpetas, documentos y certificados con flujo de validación/firma.
- **Recepción de equipos**: registro de equipos y circuitos asociados a los laboratorios.
- **Clientes institucionales** y servicios ofrecidos por el Centro.
- **Gestión de calidad**: módulo dedicado a los procesos de calidad de los laboratorios.
- **Usuarios y permisos**: control de acceso basado en roles (RBAC) mediante grupos y aplicaciones con niveles de acceso.
- **Auditoría**: registro automático de todas las operaciones de escritura (crear/actualizar/eliminar) y consultas filtradas.
- **Notificaciones** en tiempo real.
- **Reportes** y configuración general del sistema.

## Stack tecnológico

| Capa | Tecnologías |
|---|---|
| Backend | NestJS 10, Prisma ORM, PostgreSQL, JWT (Passport), Socket.IO, Swagger |
| Frontend | React 18, Vite 5, TypeScript, Tailwind CSS v4, shadcn/ui (Radix), TanStack React Query v5, react-hook-form + zod |

## Estructura del repositorio

```
CMEE_SGD/
├── backend/     # API REST (NestJS + Prisma), puerto 3001
├── frontend/    # SPA (React + Vite), puerto 5173
├── AGENTS.md    # Guía para agentes de IA (instrucciones equivalentes a este archivo)
└── CLAUDE.md    # Guía para Claude Code
```

Cada paquete mantiene su propio `package.json` y `package-lock.json`; no hay `package.json` en la raíz.

## Requisitos previos

- [Node.js](https://nodejs.org/) 18 o superior
- [PostgreSQL](https://www.postgresql.org/) en ejecución (local o remoto)
- npm (gestor de paquetes usado en ambos proyectos)

## Instalación

Clona el repositorio:

```bash
git clone <url-del-repositorio>
cd CMEE_SGD
```

### Backend

```bash
cd backend
npm install
cp .env.example .env   # completa DATABASE_URL, JWT_SECRET, etc.
npx prisma migrate dev # crea/actualiza el esquema en tu base de datos
npx prisma generate    # regenera el cliente de Prisma
npm run start:dev      # http://localhost:3001
```

Variables de entorno (`backend/.env`):

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | Cadena de conexión a PostgreSQL |
| `JWT_SECRET` | Secreto para firmar los tokens JWT |
| `JWT_EXPIRES_IN` | Tiempo de expiración del token (ej. `7d`) |
| `PORT` | Puerto del servidor (por defecto `3001`) |
| `NODE_ENV` | `development` \| `production` |

### Frontend

```bash
cd frontend
npm install
cp .env.example .env   # define VITE_API_URL
npm run dev            # http://localhost:5173
```

Variables de entorno (`frontend/.env`):

| Variable | Descripción |
|---|---|
| `VITE_API_URL` | URL base de la API backend (ej. `http://localhost:3001/api`) |

## Scripts disponibles

### Backend (`cd backend`)

| Script | Descripción |
|---|---|
| `npm run build` | Compila con `nest build` → `dist/` |
| `npm run start:dev` | Levanta el servidor en modo watch |
| `npm run start:prod` | Ejecuta la build de producción (`dist/main`) |
| `npm run test` | Pruebas unitarias con Jest |
| `npm run test:cov` | Pruebas unitarias con reporte de cobertura |
| `npm run test:e2e` | Pruebas end-to-end |
| `npm run lint` | ESLint con `--fix` |
| `npm run format` | Formatea `src/` y `test/` con Prettier |
| `npm run docs:backend` | Genera documentación con Compodoc en `docs/backend/` |

### Frontend (`cd frontend`)

| Script | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo de Vite |
| `npm run build` | Typecheck (`tsc -b`) + build de producción |
| `npm run lint` | ESLint (flat config) |
| `npm run preview` | Sirve la build de producción localmente |

> El frontend aún no cuenta con un framework de pruebas configurado.

## Documentación de la API

Con el backend corriendo, la documentación interactiva (Swagger) está disponible en:

```
http://localhost:3001/api/docs
```

## Autenticación y permisos

La API utiliza JWT (`Authorization: Bearer <token>`). El control de acceso es por RBAC: cada usuario pertenece a uno o más grupos, y cada grupo tiene niveles de acceso (1–5) sobre distintas aplicaciones del sistema. Los endpoints protegidos declaran el permiso requerido mediante el decorador `@RequireAccess('nombreAplicacion', nivel)`.

## Licencia

Proyecto privado desarrollado para el Centro de Metrología del Ejército Ecuatoriano. Todos los derechos reservados.
