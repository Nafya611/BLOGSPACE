// Quick test script to check API response and image URLs
const API_URL = 'https://blogspace-vuer.onrender.com';

async function testAPI() {
    try {
        // First test health check
        console.log('Testing health endpoint:', `${API_URL}/health/`);
        const healthResponse = await fetch(`${API_URL}/health/`);
        console.log('Health check status:', healthResponse.status);
        if (healthResponse.ok) {
            const healthData = await healthResponse.text();
            console.log('Health check response:', healthData);
        }

        console.log('\nTesting API endpoint:', `${API_URL}/api/Post/blog_list/`);

        const response = await fetch(`${API_URL}/api/Post/blog_list/`);
        console.log('Blog list status:', response.status);
        console.log('Blog list status text:', response.statusText);

        if (!response.ok) {
            const errorText = await response.text();
            console.log('Error response:', errorText);
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('API Response:', data);

        // Check if there are posts with images
        if (data.results && data.results.length > 0) {
            const postsWithImages = data.results.filter(post => post.image);
            console.log('Posts with images:', postsWithImages.length);

            postsWithImages.forEach((post, index) => {
                console.log(`Post ${index + 1}: ${post.title}`);
                console.log(`Image URL: ${post.image}`);
                console.log('---');
            });
        } else {
            console.log('No posts found or no posts with images');
        }

    } catch (error) {
        console.error('Error testing API:', error);
    }
}

testAPI();
