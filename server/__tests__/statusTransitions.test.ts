import { describe, it, expect, vi } from 'vitest';

var mockSet: any;

vi.mock('../object-storage', () => ({
  replitStorage: {},
  ReplitObjectStorage: class {}
}));
vi.mock('@replit/object-storage', () => ({}));

vi.mock('../db', () => {
  const mockWhere = vi.fn().mockResolvedValue({});
  mockSet = vi.fn().mockReturnValue({ where: mockWhere });
  const mockUpdate = vi.fn().mockReturnValue({ set: mockSet });
  return { db: { update: mockUpdate } };
});

import { storage } from '../storage';

describe('Host verification status transitions', () => {
  it('approves host verification', async () => {
    await storage.approveHostVerification('user1', 'admin1');
    expect(mockSet).toHaveBeenCalledWith(expect.objectContaining({ isHost: true }));
    expect(mockSet).toHaveBeenCalledWith(expect.objectContaining({ verificationStatus: 'approved' }));
  });

  it('rejects host verification', async () => {
    mockSet.mockClear();
    await storage.rejectHostVerification('user2', 'admin1', 'bad docs');
    expect(mockSet).toHaveBeenCalledWith(expect.objectContaining({ hostVerificationStatus: 'REJECTED' }));
    expect(mockSet).toHaveBeenCalledWith(expect.objectContaining({ verificationStatus: 'rejected' }));
  });
});
