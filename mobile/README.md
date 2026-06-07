# Dirbook Mobile App

App móvil profesional para iOS y Android conectada al backend de Dirbook.

## Características

- **Home**: Negocios destacados, descuentos y eventos activos
- **Explorar**: Búsqueda + filtros por categoría y ciudad
- **Profesionales**: Directorio de abogados, médicos, etc.
- **Detalle de negocio**: Info, posts, reseñas, follow, calificar
- **Detalle de profesional**: Perfil, reseñas, contacto
- **Notificaciones**: Alerts de follows y calificaciones
- **Perfil**: Mis negocios, estadísticas, cerrar sesión
- **Login / Registro**: Conectado al backend real

## Estructura

```
mobile/
├── App.js                  ← Entrada principal
├── src/
│   ├── api.js              ← Cliente HTTP para dirbook.com.co
│   ├── theme.js            ← Colores, tipografía, espaciado
│   ├── context/
│   │   └── AuthContext.js  ← Estado global de usuario
│   ├── navigation/
│   │   └── index.js        ← Stack + Bottom Tabs
│   ├── components/
│   │   ├── LocalCard.js
│   │   ├── ProfessionalCard.js
│   │   ├── PostCard.js
│   │   ├── StarRating.js
│   │   └── CategoryPill.js
│   └── screens/
│       ├── auth/           ← Login, Register
│       ├── main/           ← Home, Explore, Professionals, Notifications, Profile
│       └── detail/         ← LocalDetail, ProfessionalDetail
└── assets/
    ├── icon.png
    └── splash.png
```

## Iniciar en desarrollo

```bash
cd mobile
npm install
npx expo start
```

Luego escanea el QR con la app **Expo Go** desde tu celular.

## Generar APK (Android)

```bash
# Primero vincula con tu cuenta Expo
npx eas-cli@12.6.2 login

# Inicializa el proyecto en Expo
npx eas-cli@12.6.2 init

# Genera el APK
npx eas-cli@12.6.2 build --platform android --profile preview
```

## Generar IPA (iOS)

```bash
npx eas-cli@12.6.2 build --platform ios --profile preview
```

## Cambiar el backend

Edita `src/api.js` línea 3:
```js
export const API_URL = 'https://dirbook.com.co'; // producción
// o
export const API_URL = 'http://192.168.1.X:8000'; // desarrollo local
```
