#  SIPA - Dashboard Frontend

**Sistema de Vigilancia y Seguimiento de Etapa Productiva** para el SENA — Panel web (Frontend).

Construido con **React** + **Vite**, con enrutamiento y layouts diferenciados por rol de usuario (Administrador, Apoyo, Aprendiz, Coordinador, Instructor).

---

##  Tabla de Contenidos

- [Requisitos Previos](#-requisitos-previos)
- [Instalación](#-instalación)
  - [1. Clonar el repositorio](#1-clonar-el-repositorio)
  - [2. Instalar dependencias](#2-instalar-dependencias)
  - [3. Configurar variables de entorno](#3-configurar-variables-de-entorno)
  - [4. Iniciar el servidor de desarrollo](#4-iniciar-el-servidor-de-desarrollo)
  - [5. Compilar para producción](#5-compilar-para-producción)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Roles y Layouts](#-roles-y-layouts)

---

## Requisitos Previos

| Requisito | Versión | Descarga |
|-----------|---------|----------|
| **Node.js** | 18 o superior | [nodejs.org](https://nodejs.org/) |
| **npm** | 9 o superior (incluido con Node.js) | — |
| **Git** | Cualquier versión | [git-scm.com](https://git-scm.com/downloads) |
| **Backend SIPA** | Debe estar corriendo | Ver repositorio del backend |

---

##  Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/hecto294/dashboard-sipa.git
cd dashboard-sipa
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto (puedes basarte en `.env.example` si existe):

```bash
# Windows
notepad .env

# Linux/Mac
nano .env
```

Variables mínimas esperadas:

```env
VITE_API_URL=http://localhost:8000
```

> Ajusta `VITE_API_URL` a la URL donde esté corriendo el backend de SIPA.

### 4. Iniciar el servidor de desarrollo

```bash
npm run dev
```

La aplicación quedará disponible en [http://localhost:5173](http://localhost:5173).

### 5. Compilar para producción

```bash
npm run build
```

Los archivos optimizados se generarán en la carpeta `dist/`.

---

##  Estructura del Proyecto

```
dashboard-sipa/
├── src/
│   ├── modules/
│   │   └── shared/
│   │       ├── hooks/          # Hooks personalizados (useSearch, etc.)
│   │       ├── layouts/        # Layouts por rol de usuario
│   │       ├── services/       # Llamadas a la API
│   │       ├── styles/         # Estilos compartidos
│   │       ├── ui/             # Componentes de interfaz reutilizables
│   │       └── utils/          # Utilidades (seedUsers, helpers, etc.)
│   ├── providers/
│   │   ├── AuthProvider.jsx    # Contexto de autenticación
│   │   └── ThemeProvider.jsx   # Contexto de tema (claro/oscuro)
│   ├── routes/
│   │   ├── AppRouter.jsx       # Enrutador principal
│   │   ├── ProtectedRoute.jsx  # Rutas protegidas por autenticación
│   │   └── roleRoutes.js       # Definición de rutas por rol
│   ├── store/                  # Manejo de estado global
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── index.html
├── vite.config.js
├── package.json
└── README.md
```

---

##  Roles y Layouts

El dashboard cuenta con un layout independiente para cada rol de usuario:

| Rol | Layout |
|-----|--------|
| Administrador | `LayoutAdmin.jsx` |
| Apoyo | `LayoutApoyo.jsx` |
| Aprendiz | `LayoutAprendiz.jsx` |
| Coordinador | `LayoutCoordinador.jsx` |
| Instructor | `LayoutInstructor.jsx` |

El acceso a cada layout está controlado mediante `ProtectedRoute.jsx` y `roleRoutes.js`, en conjunto con el contexto provisto por `AuthProvider.jsx`.

---

##  Licencia

Este proyecto es de uso interno para el SENA. Ajusta esta sección según la licencia que corresponda.