# Solución para Cambiar de Cuenta Email en Replit Auth

## El Problema Principal
**Replit Auth SIEMPRE envía email de verificación para acceso externo**. Esto es una característica de seguridad obligatoria, no un error.

### Comportamiento Normal de Replit Auth:
1. Usuario accede desde fuera del entorno Replit
2. Replit detecta acceso externo → envía email de verificación
3. Usuario debe verificar desde el email para continuar
4. Una vez verificado, puede usar la aplicación normalmente

## Limitaciones Técnicas
- Replit Auth NO soporta `prompt=select_account`
- El email de verificación es OBLIGATORIO para acceso externo
- No hay manera de omitir este paso de seguridad

## Soluciones para Cambiar de Cuenta

### 1. Usar Navegación Privada/Incógnito (RECOMENDADO)
```
1. Abre ventana privada/incógnito
2. Ve a la URL de tu aplicación 
3. Acepta que recibirás email de verificación
4. Verifica desde el email
```

### 2. Limpiar Cookies del Navegador
```
1. F12 → Application → Cookies
2. Elimina todas las cookies de replit.com
3. Recarga e intenta login con otra cuenta
4. Verifica desde el email que recibas
```

### 3. Usar Endpoint de Limpieza de Sesión
```
1. Ve a: /api/clear-session
2. Intenta login con otra cuenta
3. Verifica desde el email
```

## Importante: Email de Verificación
- **ES NORMAL** que Replit envíe email de verificación
- **ES OBLIGATORIO** verificar desde el email
- **NO SE PUEDE OMITIR** este paso de seguridad
- Revisa tu bandeja de entrada y spam

## Recomendación Final
Para desarrollo, acepta que necesitarás verificar por email cada vez que cambies de cuenta o uses navegación privada. Es el comportamiento de seguridad estándar de Replit Auth.