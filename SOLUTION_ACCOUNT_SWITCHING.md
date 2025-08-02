# Solución para Cambiar de Cuenta Email en Replit Auth

## El Problema
Replit Auth no soporta el parámetro `prompt=select_account` y persiste con la cuenta anterior.

## Soluciones Disponibles

### 1. Usar Navegación Privada/Incógnito (RECOMENDADO)
- Abre una ventana de navegación privada
- Ve a la URL de tu aplicación 
- Esto forzará un login completamente nuevo

### 2. Limpiar Cookies del Navegador
1. Abre las herramientas de desarrollador (F12)
2. Ve a la pestaña "Application" > "Cookies"
3. Elimina todas las cookies de replit.com
4. Recarga la página e intenta hacer login

### 3. Usar el Endpoint de Limpieza de Sesión
- Antes de hacer login, ve a: `/api/clear-session`
- Esto elimina la sesión del servidor
- Luego intenta hacer login normalmente

### 4. Logout Completo
- Usa el endpoint `/api/logout` para cerrar sesión completamente
- Esto debería redirigir y limpiar todas las cookies

## Por qué No Funciona `select_account`
Replit Auth devuelve el error: "unsupported prompt value requested"
Esto significa que no soporta parámetros OAuth estándar como `select_account`.

## Mejor Práctica
Para desarrollo, usa navegación privada cuando necesites cambiar de cuenta.
Para producción, implementa un flujo de logout más robusto si es necesario.