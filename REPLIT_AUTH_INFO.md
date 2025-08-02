# Información sobre Replit Auth y Verificación por Email

## El Problema
Cuando intentas hacer login, Replit Auth te pide verificación por email en lugar de permitir acceso directo.

## Por qué ocurre
1. **Acceso Externo**: Estás accediendo desde tu navegador local (no desde el editor de Replit)
2. **Medida de Seguridad**: Replit Auth implementa verificación por email para proteger las cuentas

## Soluciones

### Opción 1: Usar el flujo de verificación por email (Recomendado)
- Simplemente sigue el proceso de verificación
- Revisa tu email y haz clic en el enlace
- Es el método más seguro

### Opción 2: Acceder desde Replit
- Abre tu proyecto directamente en replit.com
- Usa la preview dentro del editor de Replit
- El login funcionará sin verificación por email

### Opción 3: Para desarrollo local
Si necesitas trabajar localmente sin verificación por email:
1. Considera usar un sistema de autenticación alternativo para desarrollo
2. O acepta el flujo de verificación por email como parte del proceso

## Nota Importante
La verificación por email es una característica de seguridad de Replit Auth y no puede ser desactivada mediante configuración. Esto es intencional para proteger las cuentas de los usuarios.