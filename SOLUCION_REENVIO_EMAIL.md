# Solución para Problemas con Reenvío de Email en Replit Auth

## El Problema
El botón "Resend mail" en Replit Auth no funciona o no envía emails de verificación.

## Causa Raíz
Replit Auth puede tener problemas con el reenvío de emails cuando hay estado de autenticación cacheado o sesiones persistentes.

## Soluciones Implementadas

### 1. Endpoint de Login Fresco (NUEVO)
**URL**: `/api/login-fresh`

Este endpoint:
- Limpia completamente toda la sesión y cookies
- Fuerza una nueva autenticación desde cero
- Evita problemas de caché de Replit Auth

**Cómo usar:**
```
1. Ve a: tu-app-url/api/login-fresh
2. Esto limpiará todo y te redirigirá a login limpio
3. Replit enviará un nuevo email de verificación
```

### 2. Endpoint de Limpieza Manual
**URL**: `/api/clear-session`

Para limpiar solo la sesión sin redirigir.

### 3. Método Manual (Si los endpoints no funcionan)

#### Opción A: Navegación Privada
```
1. Abre ventana privada/incógnito
2. Ve a tu aplicación
3. Intenta login - será completamente nuevo
```

#### Opción B: Limpiar Cookies Manualmente
```
1. F12 → Application → Cookies
2. Elimina TODAS las cookies de:
   - replit.com
   - tu-dominio-de-app.replit.dev
3. Recarga la página
4. Intenta login nuevamente
```

#### Opción C: Limpiar Caché del Navegador
```
1. Ctrl+Shift+Delete (Chrome/Edge)
2. Selecciona "Cookies y otros datos del sitio"
3. Selecciona "Todo el tiempo"
4. Limpia
```

## Proceso Recomendado

1. **Primero**: Prueba `/api/login-fresh`
2. **Si no funciona**: Usa navegación privada
3. **Si sigue sin funcionar**: Limpia cookies manualmente
4. **Último recurso**: Contacta soporte de Replit

## Importante
- Cada login en nueva cuenta SIEMPRE requerirá verificación por email
- El problema del "resend" es conocido en Replit Auth
- No es un error de tu aplicación, es limitación de Replit Auth

## Verificación de Funcionamiento
Después de usar cualquier solución:
1. Deberías ver pantalla de login de Replit limpia
2. Al intentar login, debería enviar email de verificación
3. Revisa bandeja de entrada Y spam
4. El email puede tardar 1-5 minutos en llegar