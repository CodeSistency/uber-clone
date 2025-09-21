/**
 * Test script to verify auth flow handles Firebase fields correctly
 */

// Mock the firebase service
const mockFirebaseService = {
  getFirebaseTokenData: async () => {
    throw new Error('Firebase not available');
  }
};

// Mock fetchAPI
const mockFetchAPI = async (endpoint, options) => {
  const body = JSON.parse(options.body);
  console.log('📤 Request to:', endpoint);
  console.log('📤 Request body:', JSON.stringify(body, null, 2));

  // Check if Firebase fields are present
  const hasFirebaseFields = body.firebaseToken || body.deviceType || body.deviceId;

  if (hasFirebaseFields) {
    return {
      message: ["property firebaseToken should not exist"],
      statusCode: 400
    };
  }

  return {
    accessToken: 'mock-token',
    refreshToken: 'mock-refresh-token',
    user: { id: 1, email: 'test@example.com', name: 'Test User' }
  };
};

// Simulate the login function logic
const simulateLogin = async () => {
  console.log('🧪 Testing login flow with Firebase error...\n');

  const credentials = {
    email: 'test@example.com',
    password: 'password123'
  };

  try {
    console.log('📧 Attempting login for:', credentials.email);

    // Simulate Firebase token retrieval (this will fail)
    let firebaseData = null;
    try {
      firebaseData = await mockFirebaseService.getFirebaseTokenData();
    } catch (error) {
      console.warn('⚠️ Firebase service error (expected):', error.message);
    }

    // Prepare base credentials
    const baseCredentials = {
      email: credentials.email,
      password: credentials.password
    };

    // Create request body conditionally
    const requestBody = { ...baseCredentials };

    // Only add Firebase fields if they exist and are valid
    const hasValidFirebaseToken = firebaseData?.token && firebaseData.token.trim().length > 0;
    const hasValidDeviceType = firebaseData?.deviceType && firebaseData.deviceType.trim().length > 0;
    const hasValidDeviceId = firebaseData?.deviceId && firebaseData.deviceId.trim().length > 0;

    if (hasValidFirebaseToken && hasValidDeviceType && hasValidDeviceId) {
      requestBody.firebaseToken = firebaseData.token;
      requestBody.deviceType = firebaseData.deviceType;
      requestBody.deviceId = firebaseData.deviceId;
      console.log('✅ Firebase fields included in request');
    } else {
      console.log('⚠️ Firebase fields not available, sending basic login');
      // Explicitly ensure Firebase fields are not in the request
      delete requestBody.firebaseToken;
      delete requestBody.deviceType;
      delete requestBody.deviceId;
    }

    console.log('📦 Final request body:', JSON.stringify(requestBody, null, 2));

    // Simulate API call
    const response = await mockFetchAPI('auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (response.statusCode === 400) {
      console.log('❌ Backend rejected request with Firebase fields');
      console.log('📝 Error:', response.message);
      return { success: false, message: 'Firebase fields rejected' };
    } else if (response.accessToken) {
      console.log('✅ Login successful without Firebase fields');
      return { success: true, message: 'Login successful' };
    }

  } catch (error) {
    console.error('❌ Login failed:', error);
    return { success: false, message: error.message };
  }
};

// Run the simulation
simulateLogin().then(result => {
  console.log('\n📊 Final Result:', result);
  if (result.success) {
    console.log('🎉 Auth flow handles Firebase errors correctly!');
  } else {
    console.log('❌ Auth flow needs fixes');
  }
});
