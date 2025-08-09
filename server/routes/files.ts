import { Router } from 'express';
import { UnifiedImageService } from '../unified-image-service';

/**
 * Unified File Routes - Endpoint único para todos los archivos
 * Maneja Object Storage + local filesystem con fallbacks automáticos
 */

const router = Router();

// Endpoint unificado para servir archivos
router.get('/files/:path(*)', async (req, res) => {
  try {
    const filePath = UnifiedImageService.sanitizePath(req.params.path);
    
    if (!filePath) {
      return res.status(400).json({ error: 'Invalid file path' });
    }

    const result = await UnifiedImageService.serveFile(filePath);
    
    if (!result) {
      // Servir imagen por defecto si no se encuentra
      return res.redirect('/api/files/default-avatar.png');
    }

    // Headers correctos para CORS y caching
    res.set({
      'Content-Type': result.contentType,
      'Cache-Control': 'public, max-age=86400', // 24 horas
      'Access-Control-Allow-Origin': '*',
      'Cross-Origin-Resource-Policy': 'cross-origin',
    });

    res.send(result.buffer);
  } catch (error) {
    console.error('Error serving file:', error);
    res.status(500).json({ error: 'Failed to serve file' });
  }
});

// Endpoint específico para avatares con generación automática
router.get('/files/avatars/generated-:userId.png', async (req, res) => {
  const { userId } = req.params;
  
  // Generar avatar simple SVG como fallback
  const svg = `
    <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="100" r="100" fill="#e5e7eb"/>
      <circle cx="100" cy="80" r="35" fill="#9ca3af"/>
      <ellipse cx="100" cy="140" rx="50" ry="30" fill="#9ca3af"/>
    </svg>
  `;

  res.set({
    'Content-Type': 'image/svg+xml',
    'Cache-Control': 'public, max-age=86400',
    'Access-Control-Allow-Origin': '*',
  });

  res.send(svg);
});

// Imagen por defecto
router.get('/files/default-avatar.png', (req, res) => {
  const svg = `
    <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="#f3f4f6"/>
      <circle cx="100" cy="100" r="80" fill="#d1d5db" stroke="#9ca3af" stroke-width="2"/>
      <circle cx="100" cy="75" r="25" fill="#9ca3af"/>
      <path d="M100 110 Q130 130 130 160 L70 160 Q70 130 100 110" fill="#9ca3af"/>
    </svg>
  `;

  res.set({
    'Content-Type': 'image/svg+xml',
    'Cache-Control': 'public, max-age=86400',
    'Access-Control-Allow-Origin': '*',
  });

  res.send(svg);
});

export default router;