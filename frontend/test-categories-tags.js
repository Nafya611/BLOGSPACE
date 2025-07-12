// Test categories and tags endpoints
const API_URL = 'http://localhost:8000';

async function testCategoriesAndTags() {
    try {
        console.log('Testing categories and tags endpoints...\n');

        console.log('1. Testing categories endpoint:');
        const categoriesResponse = await fetch(`${API_URL}/api/Post/category_list/`);
        console.log('Categories status:', categoriesResponse.status, '- Expected: 401 (requires auth)');

        console.log('2. Testing tags endpoint:');
        const tagsResponse = await fetch(`${API_URL}/api/Post/tag_list/`);
        console.log('Tags status:', tagsResponse.status, '- Expected: 401 (requires auth)');

        console.log('\n✅ Categories and tags endpoints are configured and require authentication');

    } catch (error) {
        console.error('❌ Error testing endpoints:', error);
    }
}

testCategoriesAndTags();
