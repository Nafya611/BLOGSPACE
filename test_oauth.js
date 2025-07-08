// Simple test to debug the OAuth issue
// This will help us understand what's happening

const testOAuthFlow = async () => {
  try {
    console.log('Testing OAuth flow...');

    // Test 1: Direct fetch to the endpoint
    const response = await fetch('http://localhost:8000/api/user/google-login/');
    const data = await response.json();
    console.log('OAuth endpoint response:', data);

    if (data.oauth_url) {
      console.log('OAuth URL received:', data.oauth_url);
      // Test 2: Try to redirect
      window.location.href = data.oauth_url;
    } else {
      console.error('No OAuth URL in response');
    }

  } catch (error) {
    console.error('Error testing OAuth:', error);
  }
};

// Run the test
testOAuthFlow();
