# redema-front

## Configuración del entorno

1. Se requiere Node.js para ejecutar la aplicación. [Descargar](https://nodejs.org/es/download)
2. Se recomienda Visual Studio Code como IDE. [Descargar](https://code.visualstudio.com/)
3. Se recomienda instalar la extensión de ESLint (Microsoft) para detectar errores.
4. Se recomienda instalar la extensión de Prettier (Prettier), usar Prettier como Default Formatter y activar Format On Save.

## Comandos útiles

- ´npm install´ instala las dependencias. Ejecutar siempre después de hacer un pull.
- ´npm run --dev´ ejecuta la aplicación en modo developer.
- ´npx eslint --fix´ eslint detecta errores en el proyecto y corrige los que puede.
- ´npx prettier . --write´ prettier formatea todo el código del proyecto.

## Estructura del proyecto

```
redema-front/
├── src/
│   ├── main.tsx                        // define las rutas
│   ├── global.css                      // estilo de todas páginas
│   ├── components/
│   │   ├── shared/                     // componentes personalizados
│   │   └── ui/                         // componentes importados
│   └── else/                           // páginas que NO usan el MainLayout
│       ├── GoogleLogin.jsx             // página para iniciar sesión
│       └── admin/                      // páginas para el rol administrador
│           └── ...
│   └── main/                           // páginas que usan el MainLayout
│       ├── MainLayout.jsx              // implementa las barras de navegación lateral y superior
│       └── pages/
│           ├── Home.jsx                // página inicial
│           ├── Post.jsx                // página para crear publicación
│           ├── Profile.jsx             // página para ver perfil
│           ├── Settings.jsx            // página para configuraciones
│           ├── View.jsx                // página para ver publicaciones
│           └── Browse.jsx              // página para navegar entre las publicaciones
│   └── models/
│       └── ...
│   └── services/
│       └── ...
├── eslint.config.js                    // configuración de eslint
```
