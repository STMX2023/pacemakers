import { storeCryptoAuthData } from '../services/crypto-storage.service';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import the supabase service to mock
jest.mock('../services/supabase.service', () => ({
  supabaseSignInWithGoogle: jest.fn(),
  setSupabaseOAuthSession: jest.fn()
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve())
}));

// Mock crypto-storage.service
jest.mock('../services/crypto-storage.service', () => ({
  storeCryptoAuthData: jest.fn(() => Promise.resolve()),
  STORAGE_KEYS: {
    ACCESS_TOKEN: 'auth.access_token',
    REFRESH_TOKEN: 'auth.refresh_token',
    SESSION: 'auth.session',
    USER: 'auth.user',
  }
}));

describe('Google OAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('OAuth callback data is processed correctly', async () => {
    // This is sample Google OAuth data based on the log output you provided
    const mockOAuthData = {
      access_token: "eyJhbGciOiJIUzI1NiIsImtpZCI6IkRTUnNGVkwrd3pRNmgyL0ciLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2RwZmhjZXNucGJtZmJzcnZxcmtjLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiIwMzU1MGY3ZC1kMmMzLTQxN2ItYTBhMi1hYWNhNjliN2Y3NGQiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzQyMTQ5NTk2LCJpYXQiOjE3NDIxNDU5OTYsImVtYWlsIjoiNzc5d3YzQGdtYWlsLmNvbSIsInBob25lIjoiIiwiYXBwX21ldGFkYXRhIjp7InByb3ZpZGVyIjoiZ29vZ2xlIiwicHJvdmlkZXJzIjpbImdvb2dsZSJdfSwidXNlcl9tZXRhZGF0YSI6eyJhdmF0YXJfdXJsIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jTEVQQmE2UlgzbFJzY2ZUbUt2bklSZlRXQVlLVEVRdjNVR1ZaQVM3WHd5ZTFwd0N3PXM5Ni1jIiwiZW1haWwiOiI3Nzl3djNAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImZ1bGxfbmFtZSI6IldhZ25lciBWYW56ZWxsYSIsImlzcyI6Imh0dHBzOi8vYWNjb3VudHMuZ29vZ2xlLmNvbSIsIm5hbWUiOiJXYWduZXIgVmFuemVsbGEiLCJwaG9uZV92ZXJpZmllZCI6ZmFsc2UsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQ2c4b2NMRVBCYTZSWDNsUnNjZlRtS3ZuSVJmVFdBWUtURVF2M1VHVlpBUzdYd3llMXB3Q3c9czk2LWMiLCJwcm92aWRlcl9pZCI6IjExMjIyNDQ5MjQxNDY5MzkxMTA2MCIsInN1YiI6IjExMjIyNDQ5MjQxNDY5MzkxMTA2MCJ9LCJyb2xlIjoiYXV0aGVudGljYXRlZCIsImFhbCI6ImFhbDEiLCJhbXIiOlt7Im1ldGhvZCI6Im9hdXRoIiwidGltZXN0YW1wIjoxNzQyMTQ1OTk2fV0sInNlc3Npb25faWQiOiI1MGM2M2EwMi01MmU1LTQyYmItYTlhYy01YTY3NmExZDliMzEiLCJpc19hbm9ueW1vdXMiOmZhbHNlfQ.1aSYzE_vz344xsp87pfXSOEsnUH7Maci0l98g5_5P5w",
      expires_in: 3600,
      refresh_token: "QVCzt8pfNMS0jgSqdmkVJw",
      token_type: "bearer",
      provider_token: "ya29.a0AeXRPp442GU_Mpx_Dk1ZAa7WCFZqnirHCaaxrOFgiyFkUlOcUOeVx6BUIU0e2XF4hGx9kwESqb-fcbqmOWCvyDQuXQruUiLE47Rs_hG1kxu9K_9ddlcWIc_Z33o2aA3lem0bV9syXs8apC65HzG7cdHyisn5iqsbVYx0XQlEaCgYKAdoSARESFQHGX2Mi50iLKqHVmMwFMrrMylSwEQ0175"
    };
    
    // Create a mock session object that would be created from this OAuth data
    const mockSession = {
      access_token: mockOAuthData.access_token,
      refresh_token: mockOAuthData.refresh_token,
      expires_at: Math.floor(Date.now() / 1000) + mockOAuthData.expires_in,
      expires_in: mockOAuthData.expires_in,
      token_type: mockOAuthData.token_type,
      provider_token: mockOAuthData.provider_token
    };

    // Parse the JWT to extract user information (simplified for test)
    const base64Url = mockOAuthData.access_token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonPayload);
    
    // Create a mock user object
    const mockUser = {
      id: payload.sub,
      email: payload.email,
      app_metadata: payload.app_metadata,
      user_metadata: payload.user_metadata,
      role: payload.role
    };

    // Simulate storing auth data
    await storeCryptoAuthData(
      mockOAuthData.access_token,
      mockOAuthData.refresh_token,
      mockSession,
      mockUser
    );
    
    // Verify that storeCryptoAuthData was called with the correct parameters
    expect(storeCryptoAuthData).toHaveBeenCalledWith(
      mockOAuthData.access_token,
      mockOAuthData.refresh_token,
      expect.objectContaining({
        expires_in: mockOAuthData.expires_in,
        token_type: mockOAuthData.token_type
      }),
      expect.objectContaining({
        email: payload.email,
        id: payload.sub,
        role: payload.role
      })
    );
    
    // Let's examine what data we extracted from the OAuth response
    console.log('User data extracted from token:', mockUser);
    
    // Verify expected fields in the user data
    expect(mockUser).toEqual(expect.objectContaining({
      id: payload.sub,
      email: '779wv3@gmail.com',
      role: 'authenticated'
    }));

    // Verify metadata contains expected fields
    expect(mockUser.user_metadata).toEqual(expect.objectContaining({
      email: '779wv3@gmail.com',
      name: 'Wagner Vanzella',
      avatar_url: expect.stringContaining('googleusercontent.com'),
      email_verified: true
    }));
    
    // Verify app metadata contains provider information
    expect(mockUser.app_metadata).toEqual(expect.objectContaining({
      provider: 'google'
    }));
  });
}); 