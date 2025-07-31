export async function generateAgoraToken(channelName: string, userId: string): Promise<string> {
  const appId = process.env.AGORA_APP_ID;
  const appCertificate = process.env.AGORA_APP_CERTIFICATE;
  
  if (!appId) {
    // In development/testing, return empty token if no app ID
    console.warn("AGORA_APP_ID not set, returning empty token");
    return "";
  }
  
  // If no certificate, return empty token (testing mode)
  if (!appCertificate) {
    console.warn("AGORA_APP_CERTIFICATE not set, using testing mode (no token)");
    return "";
  }
  
  // Dynamic import for CommonJS module
  const AgoraAccessToken = await import('agora-access-token');
  const { RtcTokenBuilder, RtcRole } = AgoraAccessToken.default || AgoraAccessToken;
  
  const role = RtcRole.PUBLISHER;
  const expirationTimeInSeconds = 3600; // 1 hour
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;
  
  // Build token with user ID
  const token = RtcTokenBuilder.buildTokenWithUid(
    appId,
    appCertificate,
    channelName,
    parseInt(userId) || 0, // Convert string ID to number, default to 0
    role,
    privilegeExpiredTs
  );
  
  return token;
}