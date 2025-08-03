import { Express } from "express";
import { isAuthenticated } from "../replitAuth";
import { storage } from "../storage";
import { testModeConfig, isTestUser } from "../testMode";

export function registerTestRoutes(app: Express): void {
  // Test booking creation endpoint - creates instant confirmed bookings for testing
  app.post('/api/test/instant-booking', isAuthenticated, async (req: any, res) => {
    try {
      if (!testModeConfig.enabled) {
        return res.status(403).json({ message: 'Test mode is not enabled' });
      }

      const guestId = req.user.claims.sub;
      const { hostId } = req.body;
      
      // Verify at least one user is a test user
      const guest = await storage.getUser(guestId);
      const host = await storage.getUser(hostId);
      
      if (!isTestUser(guest?.email, guest?.username) && !isTestUser(host?.email, host?.username)) {
        return res.status(403).json({ message: 'Al menos un usuario debe ser de prueba' });
      }

      // Create instant booking with current time
      const now = new Date();
      const booking = await storage.createBooking({
        hostId,
        guestId,
        scheduledDate: now.toISOString().split('T')[0],
        startTime: now.toTimeString().split(' ')[0].substring(0, 5),
        duration: testModeConfig.testSessionDuration,
        price: '0',
        status: 'confirmed', // Auto-confirmed for test
        notes: 'Sesión de prueba instantánea',
        services: JSON.stringify({
          screenSharing: false,
          translation: false,
          recording: false,
          transcription: false
        }),
      });

      console.log(`Test instant booking created: ${booking.id}`);
      
      res.status(201).json({
        ...booking,
        isTest: true,
        instantSession: true,
        message: 'Reserva de prueba creada. Puedes iniciar la videollamada inmediatamente.'
      });
    } catch (error) {
      console.error('Error creating test booking:', error);
      res.status(500).json({ message: 'Error al crear la reserva de prueba' });
    }
  });

  // Test mode status endpoint
  app.get('/api/test/status', isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const user = await storage.getUser(userId);
    
    res.json({
      testModeEnabled: testModeConfig.enabled,
      isTestUser: isTestUser(user?.email, user?.username),
      testConfig: testModeConfig.enabled ? {
        skipPayment: testModeConfig.skipPayment,
        autoConfirmBookings: testModeConfig.autoConfirmBookings,
        instantVideoCall: testModeConfig.instantVideoCall,
        testSessionDuration: testModeConfig.testSessionDuration
      } : null
    });
  });
}