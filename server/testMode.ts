// Test mode configuration for development and testing purposes
export const testModeConfig = {
  enabled: process.env.NODE_ENV === 'development',
  
  // Skip payment processing for test bookings
  skipPayment: true,
  
  // Auto-confirm bookings for test users
  autoConfirmBookings: true,
  
  // Test user identifiers
  testUsers: ['billing@thopters.com', 'test1dialoom'],
  
  // Enable instant video calls without waiting for scheduled time
  instantVideoCall: true,
  
  // Test mode session duration (minutes)
  testSessionDuration: 15,
};

export function isTestUser(email: string | undefined, username: string | undefined): boolean {
  if (!testModeConfig.enabled) return false;
  
  return !!(
    (email && testModeConfig.testUsers.includes(email)) ||
    (username && testModeConfig.testUsers.includes(username))
  );
}

export function isTestBooking(hostEmail: string | undefined, guestEmail: string | undefined): boolean {
  if (!testModeConfig.enabled) return false;
  
  return !!(
    (hostEmail && isTestUser(hostEmail, undefined)) ||
    (guestEmail && isTestUser(guestEmail, undefined))
  );
}