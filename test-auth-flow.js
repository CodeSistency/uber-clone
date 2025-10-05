/**
 * Test script to verify auth flow handles Firebase fields correctly
 */

// Mock the firebase service
const mockFirebaseService = {
  getFirebaseTokenData: async () => {
    throw new Error("Firebase not available");
  },
};

// Mock fetchAPI
const mockFetchAPI = async (endpoint, options) => {
  const body = JSON.parse(options.body);
  
  

  // Check if Firebase fields are present
  const hasFirebaseFields =
    body.firebaseToken || body.deviceType || body.deviceId;

  if (hasFirebaseFields) {
    return {
      message: ["property firebaseToken should not exist"],
      statusCode: 400,
    };
  }

  return {
    accessToken: "mock-token",
    refreshToken: "mock-refresh-token",
    user: { id: 1, email: "test@example.com", name: "Test User" },
  };
};

// Simulate the login function logic
const simulateLogin = async () => {
  

  const credentials = {
    email: "test@example.com",
    password: "password123",
  };

  try {
    

    // Simulate Firebase token retrieval (this will fail)
    let firebaseData = null;
    try {
      firebaseData = await mockFirebaseService.getFirebaseTokenData();
    } catch (error) {
      
    }

    // Prepare base credentials
    const baseCredentials = {
      email: credentials.email,
      password: credentials.password,
    };

    // Create request body conditionally
    const requestBody = { ...baseCredentials };

    // Only add Firebase fields if they exist and are valid
    const hasValidFirebaseToken =
      firebaseData?.token && firebaseData.token.trim().length > 0;
    const hasValidDeviceType =
      firebaseData?.deviceType && firebaseData.deviceType.trim().length > 0;
    const hasValidDeviceId =
      firebaseData?.deviceId && firebaseData.deviceId.trim().length > 0;

    if (hasValidFirebaseToken && hasValidDeviceType && hasValidDeviceId) {
      requestBody.firebaseToken = firebaseData.token;
      requestBody.deviceType = firebaseData.deviceType;
      requestBody.deviceId = firebaseData.deviceId;
      
    } else {
      
      // Explicitly ensure Firebase fields are not in the request
      delete requestBody.firebaseToken;
      delete requestBody.deviceType;
      delete requestBody.deviceId;
    }

    

    // Simulate API call
    const response = await mockFetchAPI("auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    if (response.statusCode === 400) {
      
      
      return { success: false, message: "Firebase fields rejected" };
    } else if (response.accessToken) {
      
      return { success: true, message: "Login successful" };
    }
  } catch (error) {
    
    return { success: false, message: error.message };
  }
};

// Run the simulation
simulateLogin().then((result) => {
  
  if (result.success) {
    
  } else {
    
  }
});
