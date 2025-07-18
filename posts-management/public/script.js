let posts = [];

// Load posts when page loads
document.addEventListener('DOMContentLoaded', () => {
    loadPosts();
    setupEventListeners();
});

function setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    const sortSelect = document.getElementById('sortSelect');
    
    searchInput.addEventListener('input', filterAndDisplayPosts);
    sortSelect.addEventListener('change', filterAndDisplayPosts);
}

async function loadPosts() {
    try {
        const response = await fetch('/api/posts');
        posts = await response.json();
        filterAndDisplayPosts();
    } catch (error) {
        console.error('Error loading posts:', error);
        alert('Error loading posts');
    }
}

function filterAndDisplayPosts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const sortOption = document.getElementById('sortSelect').value;
    
    let filteredPosts = posts.filter(post => 
        post.name.toLowerCase().includes(searchTerm)
    );
    
    // Sort posts
    switch (sortOption) {
        case 'name-asc':
            filteredPosts.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'name-desc':
            filteredPosts.sort((a, b) => b.name.localeCompare(a.name));
            break;
        default:
            filteredPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    
    displayPosts(filteredPosts);
}

function displayPosts(postsToDisplay) {
    const container = document.getElementById('postsContainer');
    
    if (postsToDisplay.length === 0) {
        container.innerHTML = '<p>No posts found.</p>';
        return;
    }
    
    container.innerHTML = postsToDisplay.map(post => `
        <div class="post-card">
            ${post.image ? `<img src="${post.image}" alt="${post.name}" class="post-image">` : ''}
            <h3 class="post-title">${post.name}</h3>
            <p class="post-description">${post.description}</p>
            <div class="post-actions">
                <a href="/edit/${post._id}" class="btn btn-secondary">Edit</a>
                <button onclick="deletePost('${post._id}')" class="btn btn-danger">Delete</button>
            </div>
        </div>
    `).join('');
}

async function deletePost(postId) {
    if (!confirm('Are you sure you want to delete this post?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/posts/${postId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            alert('Post deleted successfully!');
            loadPosts();
        } else {
            const error = await response.json();
            alert('Error: ' + error.error);
        }
    } catch (error) {
        alert('Error deleting post: ' + error.message);
    }
}