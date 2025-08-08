# Variables de Entorno de Dialoom

Este documento contiene todas las variables de entorno necesarias para ejecutar Dialoom.

## 🟢 Variables Configuradas Automáticamente por Replit

```bash
DATABASE_URL=[Proporcionado automáticamente por Replit PostgreSQL]
REPLIT_DOMAINS=[Proporcionado automáticamente por Replit]
REPL_ID=[Proporcionado automáticamente por Replit]
PUBLIC_OBJECT_SEARCH_PATHS=/replit-objstore-46fcbff3-adc5-49f0-bb85-39ea50a708d7/public
PRIVATE_OBJECT_DIR=/replit-objstore-46fcbff3-adc5-49f0-bb85-39ea50a708d7/.private
```

## 🟢 Secrets Ya Configurados en Replit

Estos valores ya están configurados en la pestaña "Secrets" de Replit:

```bash
SESSION_SECRET=[Configurado - String aleatorio seguro]
STRIPE_SECRET_KEY=[Configurado - Clave secreta de Stripe]
VITE_STRIPE_PUBLIC_KEY=[Configurado - Clave pública de Stripe]
OPENAI_API_KEY=[Configurado - API Key de OpenAI]
VITE_SUPABASE_URL=[Configurado - URL de Supabase]
VITE_SUPABASE_ANON_KEY=[Configurado - Clave anónima de Supabase]
```

## 🔴 Secrets Pendientes de Configurar

Estos valores necesitan ser añadidos en la pestaña "Secrets" de Replit:

### Stripe Webhooks
```bash
STRIPE_WEBHOOK_SECRET=whsec_[obtener de dashboard.stripe.com]
STRIPE_CONNECT_WEBHOOK_SECRET=whsec_[obtener de dashboard.stripe.com]
```

**Pasos para obtener estos valores:**
1. Ir a https://dashboard.stripe.com/webhooks
2. Crear endpoint: `https://[tu-dominio].replit.app/stripe/webhook`
3. Seleccionar eventos: payment_intent.succeeded, checkout.session.completed, etc.
4. Copiar el signing secret
5. Repetir para Connect webhook con endpoint: `https://[tu-dominio].replit.app/stripe/connect-webhook`

### Agora.io (Videollamadas)
```bash
AGORA_APP_ID=[obtener de console.agora.io]
AGORA_APP_CERTIFICATE=[obtener de console.agora.io]
```

**Pasos para obtener estos valores:**
1. Crear cuenta en https://www.agora.io/
2. Ir a Console → Project Management
3. Crear nuevo proyecto
4. Copiar App ID
5. Habilitar App Certificate y copiarlo

### Resend (Email)
```bash
RESEND_API_KEY=re_[obtener de resend.com]
RESEND_FROM_EMAIL=noreply@tudominio.com
```

> Si no se configuran estas variables, el servicio de correo se desactivará, pero la aplicación continuará funcionando.

**Pasos para obtener estos valores:**
1. Crear cuenta en https://resend.com/
2. Verificar tu dominio
3. Ir a API Keys → Create API Key
4. Configurar el email remitente verificado

## 🔧 Variables de Configuración Opcionales

```bash
PORT=3000
NODE_ENV=development
SUPPORT_TEAM_EMAIL=support@dialoom.cloud # Enviar copia de mensajes de contacto a este correo (opcional)
```

## 📋 Plantilla para .env (Desarrollo Local)

Si estás desarrollando fuera de Replit, crea un archivo `.env` con este contenido:

```env
# Base de Datos
DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/dialoom

# Sesiones
SESSION_SECRET=genera-un-string-aleatorio-seguro-de-al-menos-32-caracteres

# Stripe
STRIPE_SECRET_KEY=sk_test_51...
VITE_STRIPE_PUBLIC_KEY=pk_test_51...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_CONNECT_WEBHOOK_SECRET=whsec_...

# Agora.io
AGORA_APP_ID=tu_app_id_aqui
AGORA_APP_CERTIFICATE=tu_app_certificate_aqui

# OpenAI
OPENAI_API_KEY=sk-...

# Resend
# (Opcional) Requerido solo si se desea habilitar el envío de correos
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@tudominio.com

# Almacenamiento (ajustar según tu configuración)
PUBLIC_OBJECT_SEARCH_PATHS=/path/to/public
PRIVATE_OBJECT_DIR=/path/to/private

# Servidor
PORT=3000
NODE_ENV=development
```

## ⚠️ Notas de Seguridad

1. **Nunca** commitear archivos .env con valores reales
2. **Siempre** usar la pestaña Secrets en Replit para valores sensibles
3. **Rotar** las claves regularmente
4. **Usar** claves de test (sk_test_) en desarrollo
5. **Verificar** que las claves de producción solo estén en producción

## 🚀 Cómo Añadir Secrets en Replit

1. Ir a la pestaña "Secrets" en el panel izquierdo
2. Hacer clic en "New Secret"
3. Ingresar el nombre de la variable (ej: `AGORA_APP_ID`)
4. Ingresar el valor
5. Hacer clic en "Add Secret"
6. Reiniciar el workflow si es necesario