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
# URL de conexión a PostgreSQL
DATABASE_URL=postgresql://usuario:contraseña@host:puerto/nombre_db
```

### Autenticación (Replit Auth)
```env
# Dominios de Replit (proporcionado automáticamente en Replit)
REPLIT_DOMAINS=your-replit-domain.replit.app

# ID del Repl (proporcionado automáticamente en Replit)
REPL_ID=your-repl-id

# Secreto para las sesiones (generar una cadena aleatoria segura)
SESSION_SECRET=your-secure-random-string-here
```

### Pagos (Stripe)
```env
# Clave secreta de Stripe
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxx

# Clave pública de Stripe (para el frontend)
VITE_STRIPE_PUBLIC_KEY=pk_test_xxxxxxxxxxxxxxxxxxxx

# Secreto para webhooks de Stripe
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxx

# Secreto para webhooks de Stripe Connect
STRIPE_CONNECT_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxx
```

### Videollamadas (Agora.io)
```env
# ID de la aplicación de Agora
AGORA_APP_ID=your-agora-app-id

# Certificado de la aplicación de Agora
AGORA_APP_CERTIFICATE=your-agora-app-certificate
```

### IA y Procesamiento (OpenAI)
```env
# Clave API de OpenAI
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxx
```

### Email (Resend)
```env
# Clave API de Resend
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx

# Email remitente para Resend
RESEND_FROM_EMAIL=noreply@tudomain.com
```

### Almacenamiento de Objetos (Replit Object Storage)
```env
# Rutas de búsqueda para objetos públicos (configurado automáticamente en Replit)
PUBLIC_OBJECT_SEARCH_PATHS=repl-default-bucket-xxxxxxxxxx/public

# Directorio para objetos privados (configurado automáticamente en Replit)
PRIVATE_OBJECT_DIR=repl-default-bucket-xxxxxxxxxx/.private
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

### Crear Base de Datos
```sql
CREATE DATABASE dialoom;
```

### Usuarios Administradores por Defecto
Los siguientes usuarios tienen permisos de administrador:
- nachosaladrigas
- marcgarcia10

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

## 🚀 Pasos de Implementación

1. **Clonar el repositorio**
   ```bash
   git clone [url-del-repositorio]
   cd dialoom
   ```

2. **Configurar variables de entorno**
   - Copiar el contenido de las variables de entorno anteriores
   - Crear archivo `.env` con los valores correspondientes

3. **Instalar dependencias**
   ```bash
   npm install
   ```

4. **Configurar base de datos**
   ```bash
   npm run db:push
   ```

5. **Ejecutar en modo desarrollo**
   ```bash
   npm run dev
   ```

## 🔍 Verificación

Para verificar que todo está configurado correctamente:

1. Acceder a `http://localhost:3000`
2. Verificar que la página de inicio carga correctamente
3. Probar el proceso de autenticación
4. Verificar la conexión a la base de datos en los logs

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