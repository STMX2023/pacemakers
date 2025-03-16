/**
 * This test analyzes a Google OAuth token to display all available user data fields
 * It helps understand what information we receive from Google authentication
 */

describe('Google OAuth Data Fields Analysis', () => {
  test('Extract and display all fields from Google OAuth token', () => {
    // This is a sample Google OAuth JWT token (the same one from our other test)
    const token = "eyJhbGciOiJIUzI1NiIsImtpZCI6IkRTUnNGVkwrd3pRNmgyL0ciLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2RwZmhjZXNucGJtZmJzcnZxcmtjLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiIwMzU1MGY3ZC1kMmMzLTQxN2ItYTBhMi1hYWNhNjliN2Y3NGQiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzQyMTQ5NTk2LCJpYXQiOjE3NDIxNDU5OTYsImVtYWlsIjoiNzc5d3YzQGdtYWlsLmNvbSIsInBob25lIjoiIiwiYXBwX21ldGFkYXRhIjp7InByb3ZpZGVyIjoiZ29vZ2xlIiwicHJvdmlkZXJzIjpbImdvb2dsZSJdfSwidXNlcl9tZXRhZGF0YSI6eyJhdmF0YXJfdXJsIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jTEVQQmE2UlgzbFJzY2ZUbUt2bklSZlRXQVlLVEVRdjNVR1ZaQVM3WHd5ZTFwd0N3PXM5Ni1jIiwiZW1haWwiOiI3Nzl3djNAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImZ1bGxfbmFtZSI6IldhZ25lciBWYW56ZWxsYSIsImlzcyI6Imh0dHBzOi8vYWNjb3VudHMuZ29vZ2xlLmNvbSIsIm5hbWUiOiJXYWduZXIgVmFuemVsbGEiLCJwaG9uZV92ZXJpZmllZCI6ZmFsc2UsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQ2c4b2NMRVBCYTZSWDNsUnNjZlRtS3ZuSVJmVFdBWUtURVF2M1VHVlpBUzdYd3llMXB3Q3c9czk2LWMiLCJwcm92aWRlcl9pZCI6IjExMjIyNDQ5MjQxNDY5MzkxMTA2MCIsInN1YiI6IjExMjIyNDQ5MjQxNDY5MzkxMTA2MCJ9LCJyb2xlIjoiYXV0aGVudGljYXRlZCIsImFhbCI6ImFhbDEiLCJhbXIiOlt7Im1ldGhvZCI6Im9hdXRoIiwidGltZXN0YW1wIjoxNzQyMTQ1OTk2fV0sInNlc3Npb25faWQiOiI1MGM2M2EwMi01MmU1LTQyYmItYTlhYy01YTY3NmExZDliMzEiLCJpc19hbm9ueW1vdXMiOmZhbHNlfQ.1aSYzE_vz344xsp87pfXSOEsnUH7Maci0l98g5_5P5w";
    
    // Parse the JWT to extract the payload
    const parts = token.split('.');
    const base64Payload = parts[1];
    const payload = JSON.parse(atob(base64Payload));
    
    // Log the entire decoded payload
    console.log('Full decoded JWT payload:');
    console.log(JSON.stringify(payload, null, 2));
    
    // Log specific sections for clarity
    console.log('\n--- JWT Header Fields ---');
    console.log('Token issuer (iss):', payload.iss);
    console.log('Subject (sub):', payload.sub);
    console.log('Audience (aud):', payload.aud);
    console.log('Expiration time (exp):', new Date(payload.exp * 1000).toLocaleString());
    console.log('Issued at (iat):', new Date(payload.iat * 1000).toLocaleString());
    console.log('Session ID:', payload.session_id);
    console.log('Is anonymous:', payload.is_anonymous);
    
    console.log('\n--- User Basic Info ---');
    console.log('Email:', payload.email);
    console.log('Phone:', payload.phone || 'Not provided');
    console.log('Role:', payload.role);
    
    console.log('\n--- Authentication Method Info ---');
    console.log('Auth assurance level (aal):', payload.aal);
    console.log('Authentication methods used:');
    payload.amr.forEach((method: any, index: number) => {
      console.log(`  Method ${index + 1}:`, method.method);
      console.log(`  Timestamp:`, new Date(method.timestamp * 1000).toLocaleString());
    });
    
    console.log('\n--- App Metadata ---');
    console.log('Provider:', payload.app_metadata.provider);
    console.log('All providers:', payload.app_metadata.providers.join(', '));
    
    console.log('\n--- User Metadata (Google Profile) ---');
    const userMeta = payload.user_metadata;
    Object.keys(userMeta).forEach(key => {
      console.log(`${key}:`, userMeta[key]);
    });
    
    // Analyze what fields we might want to store
    console.log('\n--- Recommended Fields to Store ---');
    const essentialFields = {
      // Core user identity
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      
      // User profile from Google
      name: userMeta.name,
      avatar_url: userMeta.avatar_url,
      email_verified: userMeta.email_verified,
      
      // Provider information
      provider: payload.app_metadata.provider
    };
    
    console.log(JSON.stringify(essentialFields, null, 2));
    
    // Verify we have all the expected fields
    expect(payload).toBeDefined();
    expect(payload.user_metadata).toBeDefined();
    expect(payload.app_metadata).toBeDefined();
  });
}); 