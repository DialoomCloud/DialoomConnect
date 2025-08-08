import express from 'express';
import request from 'supertest';
import { describe, it, expect, beforeEach, vi } from 'vitest';

process.env.STRIPE_SECRET_KEY = 'sk_test_123';
process.env.OPENAI_API_KEY = 'test';

vi.mock('../object-storage', () => ({
  replitStorage: {},
  ReplitObjectStorage: class {}
}));
vi.mock('@replit/object-storage', () => ({}));
vi.mock('../ai-search', () => ({ aiSearchService: {} }));
vi.mock('../translation-service', () => ({
  translateArticle: vi.fn(),
  detectLanguage: vi.fn(),
  translateHostDescription: vi.fn()
}));
vi.mock('../db', () => ({ db: {} }));
vi.mock('../storage', () => ({ storage: { createBooking: vi.fn(), getUser: vi.fn() } }));
vi.mock('../supabaseAuth', () => ({
  isAuthenticated: (req: any, _res: any, next: any) => { req.userId = 'guest1'; next(); },
  isAdminAuthenticated: (_req: any, _res: any, next: any) => next(),
  setupAuthRoutes: () => {},
  supabaseAdmin: {}
}));

describe('Booking API integration', () => {
  let app: express.Express;
  let registerRoutes: any;
  let storage: any;

  beforeEach(async () => {
    app = express();
    app.use(express.json());
    ({ registerRoutes } = await import('../routes'));
    ({ storage } = await import('../storage'));
    await registerRoutes(app);
  });

  it('rejects booking creation if host is not verified', async () => {
    (storage.getUser as any).mockImplementation((id: string) => {
      if (id === 'host1') {
        return Promise.resolve({ id: 'host1', hostVerificationStatus: 'registered' });
      }
      return Promise.resolve({ id });
    });

    const res = await request(app)
      .post('/api/bookings')
      .send({ hostId: 'host1', scheduledDate: '2024-01-01', startTime: '10:00', duration: 60, price: 100 });

    expect(res.status).toBe(403);
    expect(storage.createBooking).not.toHaveBeenCalled();
  });
});
