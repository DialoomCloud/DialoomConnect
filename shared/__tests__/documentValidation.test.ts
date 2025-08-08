import { describe, it, expect } from 'vitest';
import { createHostVerificationDocumentSchema } from '../schema';

describe('Host verification document validation', () => {
  it('accepts valid document data', () => {
    const data = {
      userId: 'user123',
      documentType: 'passport',
      documentUrl: '/docs/passport.png'
    };
    expect(() => createHostVerificationDocumentSchema.parse(data)).not.toThrow();
  });

  it('rejects missing document type', () => {
    const data = {
      userId: 'user123',
      documentUrl: '/docs/passport.png'
    } as any;
    expect(() => createHostVerificationDocumentSchema.parse(data)).toThrow();
  });
});
