# Guía de Configuración de Dialoom

Esta guía proporciona toda la información necesaria para configurar y ejecutar la aplicación Dialoom en un nuevo entorno.

## 📋 Requisitos Previos

- Node.js 20 o superior
- PostgreSQL
- Cuenta de Replit (para autenticación)
- NPM o Yarn

## 🔑 Variables de Entorno Requeridas

Crear un archivo `.env` en la raíz del proyecto con las siguientes variables:

### Base de Datos
```env
# URL de conexión a PostgreSQL (✅ Configurado en Replit)
DATABASE_URL=[Proporcionado automáticamente por Replit PostgreSQL]
```

### Autenticación (Replit Auth)
```env
# Dominios de Replit (proporcionado automáticamente en Replit)
REPLIT_DOMAINS=[Proporcionado automáticamente por Replit]

# ID del Repl (proporcionado automáticamente en Replit)
REPL_ID=[Proporcionado automáticamente por Replit]

# Secreto para las sesiones (✅ Configurado)
SESSION_SECRET=[Ya configurado en los secrets de Replit]
```

### Pagos (Stripe)
```env
# Clave secreta de Stripe (✅ Configurado)
STRIPE_SECRET_KEY=[Ya configurado en los secrets de Replit]

# Clave pública de Stripe (✅ Configurado)
VITE_STRIPE_PUBLIC_KEY=[Ya configurado en los secrets de Replit]

# Secreto para webhooks de Stripe (❌ Pendiente de configurar)
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxx

# Secreto para webhooks de Stripe Connect (❌ Pendiente de configurar)
STRIPE_CONNECT_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxx
```

### Videollamadas (Agora.io)
```env
# ID de la aplicación de Agora (❌ Pendiente de configurar)
AGORA_APP_ID=your-agora-app-id

# Certificado de la aplicación de Agora (❌ Pendiente de configurar)
AGORA_APP_CERTIFICATE=your-agora-app-certificate
```

### IA y Procesamiento (OpenAI)
```env
# Clave API de OpenAI (✅ Configurado)
OPENAI_API_KEY=[Ya configurado en los secrets de Replit]
```

### Email (Resend)
```env
# Clave API de Resend (❌ Pendiente de configurar)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx

# Email remitente para Resend (❌ Pendiente de configurar)
RESEND_FROM_EMAIL=noreply@tudomain.com
```

### Almacenamiento de Objetos (Replit Object Storage)
```env
# Rutas de búsqueda para objetos públicos (✅ Configurado)
PUBLIC_OBJECT_SEARCH_PATHS=/replit-objstore-46fcbff3-adc5-49f0-bb85-39ea50a708d7/public

# Directorio para objetos privados (✅ Configurado)
PRIVATE_OBJECT_DIR=/replit-objstore-46fcbff3-adc5-49f0-bb85-39ea50a708d7/.private

# ID del bucket por defecto (✅ Configurado)
DEFAULT_BUCKET_ID=replit-objstore-0e2d05cd-3197-4482-900e-063db86b7a64
```

### Configuración del Servidor
```env
# Puerto del servidor (opcional, por defecto 3000)
PORT=3000

# Entorno (development o production)
NODE_ENV=development
```

## 🛠️ Scripts de Configuración

### 1. Instalar Dependencias
```bash
npm install
```

### 2. Configurar la Base de Datos
```bash
# Aplicar el esquema a la base de datos
npm run db:push
```

### 3. Scripts Disponibles
```bash
# Desarrollo (con recarga automática)
npm run dev

# Construir para producción
npm run build

# Ejecutar en producción
npm start

# Verificar tipos de TypeScript
npm run check

# Actualizar esquema de base de datos
npm run db:push
```

## 🗄️ Configuración de Base de Datos

La aplicación utiliza PostgreSQL con Drizzle ORM. El esquema se encuentra en `/shared/schema.ts`.

### Base de Datos Actual
- **Estado**: ✅ Configurada y funcionando en Replit
- **Motor**: PostgreSQL (proporcionado por Replit)
- **ORM**: Drizzle ORM
- **Conexión**: Automática mediante `DATABASE_URL`

### Usuarios Administradores por Defecto
Los siguientes usuarios tienen permisos de administrador:
- nachosaladrigas
- marcgarcia10

## 📊 Estado Actual de Configuración

### ✅ Servicios Configurados
1. **Base de Datos PostgreSQL** - Funcionando en Replit
2. **Autenticación Replit Auth** - Activa y funcionando
3. **Stripe (Pagos básicos)** - Claves configuradas
4. **OpenAI API** - Integración activa
5. **Almacenamiento de Objetos** - Buckets configurados en Replit
6. **Sesiones** - Secret configurado

### ❌ Servicios Pendientes de Configurar
1. **Stripe Webhooks** - Necesita configurar endpoints en dashboard de Stripe
2. **Agora.io** - Requiere cuenta y credenciales
3. **Resend (Email)** - Requiere cuenta y API key

## 🔐 Secrets Actuales en Replit

Para ver o modificar los secrets existentes:
1. Ir a la pestaña "Secrets" en Replit
2. Los siguientes secrets ya están configurados:
   - `DATABASE_URL` (automático)
   - `SESSION_SECRET`
   - `STRIPE_SECRET_KEY`
   - `VITE_STRIPE_PUBLIC_KEY`
   - `OPENAI_API_KEY`

### Secrets Necesarios para Completar la Configuración

#### Para Agora.io (Videollamadas)
1. Crear cuenta en https://www.agora.io/
2. Crear un proyecto nuevo
3. Obtener App ID y App Certificate
4. Añadir en Replit Secrets:
   - `AGORA_APP_ID`
   - `AGORA_APP_CERTIFICATE`

#### Para Resend (Emails)
1. Crear cuenta en https://resend.com/
2. Verificar dominio de envío
3. Obtener API Key
4. Añadir en Replit Secrets:
   - `RESEND_API_KEY`
   - `RESEND_FROM_EMAIL` (ej: noreply@tudominio.com)

#### Para Stripe Webhooks
1. Ir a https://dashboard.stripe.com/webhooks
2. Crear endpoint: `https://[tu-dominio-replit].replit.app/stripe/webhook`
3. Crear endpoint Connect: `https://[tu-dominio-replit].replit.app/stripe/connect-webhook`
4. Obtener los signing secrets
5. Añadir en Replit Secrets:
   - `STRIPE_WEBHOOK_SECRET`
   - `STRIPE_CONNECT_WEBHOOK_SECRET`

## 🔧 Configuración Adicional

### 1. Almacenamiento de Objetos
En Replit, el almacenamiento de objetos se configura automáticamente. En otros entornos, deberás configurar un servicio compatible como Google Cloud Storage o AWS S3.

### 2. Webhooks de Stripe
Configurar los siguientes endpoints en el dashboard de Stripe:
- `/stripe/webhook` - Para eventos generales de Stripe
- `/stripe/connect-webhook` - Para eventos de Stripe Connect

### 3. Dominios Permitidos
Si no estás usando Replit, actualizar la configuración de autenticación para tu dominio específico.

## 📦 Dependencias Principales

- **Frontend**: React + TypeScript + Vite
- **Backend**: Express + Node.js
- **Base de Datos**: PostgreSQL + Drizzle ORM
- **Autenticación**: Replit Auth (OpenID Connect)
- **Pagos**: Stripe + Stripe Connect
- **Videollamadas**: Agora.io SDK
- **IA**: OpenAI API
- **Email**: Resend
- **UI**: shadcn/ui + Tailwind CSS
- **Estado**: TanStack Query

## 🚀 Pasos de Implementación en Replit

### Para el entorno actual de Replit:
1. Los servicios básicos ya están configurados
2. Solo necesitas añadir los secrets pendientes mencionados arriba
3. La aplicación está ejecutándose en el workflow "Start application"

### Para un nuevo Repl:
1. **Importar el repositorio en Replit**
2. **Instalar PostgreSQL** desde la pestaña de herramientas
3. **Configurar Object Storage** desde la pestaña de herramientas
4. **Añadir todos los secrets necesarios**
5. **Ejecutar** `npm install` y luego `npm run db:push`
6. **Iniciar** con `npm run dev`

## 💻 Implementación Externa (fuera de Replit)

### 1. Configurar PostgreSQL
```bash
# Crear base de datos
createdb dialoom

# Actualizar DATABASE_URL en .env
DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/dialoom
```

### 2. Configurar Autenticación Alternativa
Sin Replit Auth, necesitarás implementar otro sistema:
- Modificar `server/replitAuth.ts` para usar otra estrategia
- Opciones: Auth0, NextAuth, o autenticación propia

### 3. Configurar Almacenamiento de Archivos
Sin Replit Object Storage, usar:
- AWS S3
- Google Cloud Storage
- Sistema de archivos local (desarrollo)

Actualizar `server/object-storage.ts` con la nueva configuración.

### 4. Variables de Entorno para Producción Externa
```env
# Base de datos
DATABASE_URL=postgresql://usuario:contraseña@host:5432/dialoom

# Sesiones
SESSION_SECRET=generar-string-aleatorio-seguro-aqui

# Stripe
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxx
VITE_STRIPE_PUBLIC_KEY=pk_live_xxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxx
STRIPE_CONNECT_WEBHOOK_SECRET=whsec_xxxxxxxxxxxx

# Agora
AGORA_APP_ID=tu-app-id
AGORA_APP_CERTIFICATE=tu-app-certificate

# OpenAI
OPENAI_API_KEY=sk-xxxxxxxxxxxx

# Resend
RESEND_API_KEY=re_xxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@tudominio.com

# Servidor
PORT=3000
NODE_ENV=production
```

## 🔍 Verificación del Sistema

### En Replit:
1. La aplicación está en: `https://[tu-repl].replit.app`
2. Los logs aparecen en la consola del workflow
3. La base de datos se gestiona automáticamente

### En Producción Externa:
1. Acceder a `http://localhost:3000` (desarrollo)
2. Verificar logs del servidor
3. Comprobar conexión a base de datos
4. Verificar que todos los servicios externos respondan

## 🚨 Configuración Crítica de Producción

1. **SSL/TLS**: Usar HTTPS obligatoriamente
2. **CORS**: Configurar dominios permitidos en `server/index.ts`
3. **Rate Limiting**: Implementar límites de peticiones
4. **Backups**: Configurar copias de seguridad de BD
5. **Monitoreo**: Implementar sistema de logs y alertas

## 📝 Notas Importantes

- **Seguridad**: Nunca commitar archivos `.env` al repositorio
- **Backups**: Configurar backups regulares de la base de datos
- **Logs**: Revisar logs del servidor para detectar errores
- **SSL**: En producción, asegurar que se use HTTPS
- **CORS**: La configuración de CORS está manejada en el servidor

## 🆘 Solución de Problemas

### Error de conexión a base de datos
- Verificar que PostgreSQL esté ejecutándose
- Verificar credenciales en `DATABASE_URL`
- Verificar que la base de datos exista

### Error de autenticación
- Verificar variables `REPLIT_DOMAINS` y `REPL_ID`
- Verificar `SESSION_SECRET` esté configurado

### Error de Stripe
- Verificar que las claves de Stripe sean correctas
- Verificar configuración de webhooks en dashboard de Stripe

### Error de Agora
- Verificar `AGORA_APP_ID` y `AGORA_APP_CERTIFICATE`
- Verificar que el proyecto de Agora esté activo

## 📞 Contacto y Soporte

Para soporte adicional o preguntas sobre la configuración, contactar al equipo de desarrollo de Dialoom.

---

**Última actualización**: Enero 2025