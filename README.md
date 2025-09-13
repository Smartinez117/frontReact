# redema-front

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
```