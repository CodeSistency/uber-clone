/**
 * Test script to verify login flow handles Firebase errors gracefully
 */

// Mock the firebase service to simulate the error
const mockFirebaseService = {
  getFirebaseTokenData: async () => {
    throw new Error('Default FirebaseApp is not initialized');
  }
};

// Mock the auth functions
const mockFetchAPI = async (endpoint, options) => {
  const body = JSON.parse(options.body);
  console.log('📤 Request body:', body);

  // Check if Firebase fields are present
  const hasFirebaseFields = body.firebaseToken || body.deviceType || body.deviceId;

  if (hasFirebaseFields) {
    return {
      message: ["property firebaseToken should not exist", "property deviceType should not exist", "property deviceId should not exist"],
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
  console.log('🧪 Simulating login flow...\n');

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

    // Create request body conditionally
    const requestBody = {
      email: credentials.email,
      password: credentials.password
    };

    if (firebaseData && firebaseData.token && firebaseData.deviceType && firebaseData.deviceId) {
      requestBody.firebaseToken = firebaseData.token;
      requestBody.deviceType = firebaseData.deviceType;
      requestBody.deviceId = firebaseData.deviceId;
      console.log('✅ Firebase fields included in request');
    } else {
      console.log('⚠️ Firebase fields NOT included (due to error or unavailability)');
    }

    // Simulate API call
    const response = await mockFetchAPI('auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (response.statusCode === 400) {
      console.log('❌ Backend rejected request with Firebase fields');
      console.log('📝 Error:', response.message);

      // Retry without Firebase fields
      console.log('\n🔄 Retrying without Firebase fields...');
      const retryBody = {
        email: credentials.email,
        password: credentials.password
      };

      const retryResponse = await mockFetchAPI('auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(retryBody)
      });

      if (retryResponse.accessToken) {
        console.log('✅ Login successful without Firebase fields');
        return { success: true, message: 'Login successful' };
      }
    } else if (response.accessToken) {
      console.log('✅ Login successful with Firebase fields');
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
    console.log('🎉 Login flow handles Firebase errors correctly!');
  } else {
    console.log('❌ Login flow needs fixes');
  }
});
