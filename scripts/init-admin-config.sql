-- Initialize admin configuration with default values
-- This script sets up the default pricing and commission structure for Dialoom

INSERT INTO admin_config (key, value, description, updated_by, created_at, updated_at)
VALUES
  ('commission_rate', '0.10', 'Porcentaje de comisión que cobra Dialoom por cada transacción', 'system', NOW(), NOW()),
  ('vat_rate', '0.21', 'Porcentaje de IVA aplicado sobre la comisión', 'system', NOW(), NOW()),
  ('screen_sharing_price', '5.00', 'Precio adicional por servicio de compartir pantalla', 'system', NOW(), NOW()),
  ('translation_price', '10.00', 'Precio adicional por servicio de traducción simultánea', 'system', NOW(), NOW()),
  ('recording_price', '8.00', 'Precio adicional por grabación de videollamada', 'system', NOW(), NOW()),
  ('transcription_price', '12.00', 'Precio adicional por transcripción automática', 'system', NOW(), NOW()),
  ('show_verified_badge', 'false', 'Muestra la insignia de verificación en los perfiles', 'system', NOW(), NOW())
ON CONFLICT (key) DO NOTHING;

-- Verify the configuration was inserted
SELECT * FROM admin_config ORDER BY key;
