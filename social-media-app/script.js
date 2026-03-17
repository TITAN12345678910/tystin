// Data Management
let posts = JSON.parse(localStorage.getItem('socialhub_posts')) || [];
let currentView = 'grid';
let currentPage = 'feed';
let selectedPostIdForComment = null;

const users = [
    { id: 1, name: 'john_doe', avatar: 'https://ui-avatar.com/api/?name=John&size=32&background=0095f6' },
    { id: 2, name: 'jane_smith', avatar: 'https://ui-avatar.com/api/?name=Jane&size=32&background=ed4956' },
    { id: 3, name: 'you', avatar: 'https://ui-avatar.com/api/?name=You&size=32&background=262626' }
];

// Migrate old posts to new format with comments array
posts = posts.map(post => ({
    ...post,
    comments: Array.isArray(post.comments) ? post.comments : []
}));

// Save migrated posts back
if (posts.length > 0) {
    localStorage.setItem('socialhub_posts', JSON.stringify(posts));
}

// Sample posts
if (posts.length === 0) {
    posts = [
        {
            id: 1,
            userId: 1,
            media: 'https://picsum.photos/400/400?random=1',
            type: 'image',
            caption: 'Beautiful sunset at the beach 🌅 #nature #sunset',
            likes: 128,
            comments: [],
            liked: false
        },
        {
            id: 2,
            userId: 2,
            media: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
            type: 'video',
            caption: 'Dancing to my favorite song 💃 #dance #fun',
            likes: 256,
            comments: [],
            liked: false
        }
    ];
    localStorage.setItem('socialhub_posts', JSON.stringify(posts));
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    renderCurrentView();
    setupEventListeners();
});

function setupEventListeners() {\n    document.getElementById('uploadForm').addEventListener('submit', handleUpload);\n    document.getElementById('mediaInput').addEventListener('change', previewMedia);\n    document.getElementById('uploadPreview').addEventListener('click', () => {\n        document.getElementById('mediaInput').click();\n    });\n    document.getElementById('searchInput').addEventListener('input', filterPosts);\n    document.getElementById('commentInput').addEventListener('keypress', (e) => {\n        if (e.key === 'Enter') addComment();\n    });\n}

function renderPosts(postsToRender, filter = '') {
    const grid = document.getElementById('postsGrid');
    const reel = document.getElementById('postsReel');
    
    const filteredPosts = postsToRender.filter(post => 
        !filter || post.caption.toLowerCase().includes(filter.toLowerCase())
    );
    
    // Grid View
    grid.innerHTML = filteredPosts.map(post => createPostCard(post)).join('');
    
    // Reel View
    reel.innerHTML = filteredPosts.map(post => createReelCard(post)).join('');
    
    // Event listeners for actions
    document.querySelectorAll('.like-btn').forEach(btn => {
        btn.addEventListener('click', (e) => toggleLike(e));
    });
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const postId = parseInt(btn.getAttribute('data-post-id'));
            deletePost(postId);
        });
    });
    document.querySelectorAll('.comment-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const postId = parseInt(btn.getAttribute('data-post-id'));
            openCommentModal(postId);
        });
    });
}

function renderCurrentView() {
    const searchValue = document.getElementById('searchInput').value;
    const toggleBtns = document.querySelector('.toggle-buttons');
    const grid = document.getElementById('postsGrid') || document.querySelector('#postsGrid-' + currentPage);
    const reel = document.getElementById('postsReel') || document.querySelector('#postsReel-' + currentPage);
    if (currentPage === 'feed') {
        renderPosts(posts, searchValue);
        toggleBtns.style.display = 'flex';
    } else if (currentPage === 'profile') {
        const userPosts = posts.filter(p => p.userId === 3);
        document.getElementById('userPostCount').textContent = userPosts.length;
        renderPostsToContainers(userPosts, searchValue, grid, reel);
        toggleBtns.style.display = 'none';
    } else if (currentPage === 'explore') {
        const popularPosts = [...posts].sort((a, b) => b.likes - a.likes).slice(0, 20);
        renderPostsToContainers(popularPosts, searchValue, grid, reel);
        toggleBtns.style.display = 'none';
    }
}

function renderPostsToContainers(postsToRender, filter = '', grid, reel) {
    const filteredPosts = postsToRender.filter(post => 
        !filter || post.caption.toLowerCase().includes(filter.toLowerCase())
    );
    
    grid.innerHTML = filteredPosts.map(post => createPostCard(post)).join('');
    reel.innerHTML = filteredPosts.map(post => createReelCard(post)).join('');
    
    document.querySelectorAll('.like-btn').forEach(btn => {
        btn.addEventListener('click', (e) => toggleLike(e));
    });
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const postId = parseInt(btn.getAttribute('data-post-id'));
            deletePost(postId);
        });
    });
    document.querySelectorAll('.comment-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const postId = parseInt(btn.getAttribute('data-post-id'));
            openCommentModal(postId);
        });
    });
}

function createPostCard(post) {
    const user = users.find(u => u.id === post.userId);
    const isOwn = post.userId === 3;
    const commentCount = Array.isArray(post.comments) ? post.comments.length : 0;
    return `
        <div class="post-card" data-post-id="${post.id}">
            <div class="post-header">
                <img src="${user.avatar}" alt="${user.name}" class="post-avatar">
                <div class="post-user">${user.name}</div>
                ${isOwn ? `<div class="action-btn delete-btn" data-post-id="${post.id}" style="margin-left: auto;"><i class="fas fa-trash"></i></div>` : ''}

            </div>
            <div class="post-media">
                ${post.type === 'video' ? `<video src="${post.media}" muted loop playsinline></video>` : `<img src="${post.media}" alt="Post">`}
                <div class="post-overlay">
                    <div class="post-actions">
                        <div class="action-btn like-btn ${post.liked ? 'liked' : ''}" data-post-id="${post.id}">
                            <i class="far fa-heart"></i> <span>${post.likes}</span>
                        </div>
                        <div class="action-btn comment-btn" data-post-id="${post.id}">
                            <i class="far fa-comment"></i> <span>${commentCount}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="post-info">
                <div class="post-user">${user.name}</div>
                <p class="post-caption">${post.caption}</p>
            </div>
        </div>
    `;
}

function createReelCard(post) {
    const user = users.find(u => u.id === post.userId);
    const isOwn = post.userId === 3;
    const commentCount = Array.isArray(post.comments) ? post.comments.length : 0;
    return `
        <div class="reel-item">
            <div class="reel-player">
                ${post.type === 'video' ? `<video class="reel-video" src="${post.media}" muted loop playsinline autoplay></video>` : `<img src="${post.media}" class="reel-video">`}
                <div class="reel-overlay">
                    <div class="reel-user">${user.name}</div>
                    ${isOwn ? `<div class="reel-delete delete-btn" data-post-id="${post.id}"><i class="fas fa-trash"></i></div>` : ''}

                    <div class="reel-actions">
                        <div class="action-btn like-btn ${post.liked ? 'liked' : ''}" data-post-id="${post.id}">
                            <i class="far fa-heart"></i>
                        </div>
                        <div class="action-btn comment-btn" data-post-id="${post.id}" title="Komentar">
                            <i class="far fa-comment"></i> <span>${commentCount}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function previewMedia(e) {\n    const file = e.target.files[0];\n    const preview = document.getElementById('uploadPreview');\n    \n    if (file) {\n        // Clear previous preview\n        preview.innerHTML = '';\n        preview.classList.add('has-media');\n        \n        const url = URL.createObjectURL(file);\n        if (file.type.startsWith('video/')) {\n            const video = document.createElement('video');\n            video.src = url;\n            video.muted = true;\n            video.loop = true;\n            video.autoplay = true;\n            video.style.width = '100%';\n            video.style.height = '100%';\n            video.style.objectFit = 'cover';\n            preview.appendChild(video);\n        } else {\n            const img = document.createElement('img');\n            img.src = url;\n            img.style.width = '100%';\n            img.style.height = '100%';\n            img.style.objectFit = 'cover';\n            preview.appendChild(img);\n        }\n        \n        const label = document.createElement('div');\n        label.style.position = 'absolute';\n        label.style.top = '10px';\n        label.style.right = '10px';\n        label.style.background = 'rgba(0,0,0,0.7)';\n        label.style.color = 'white';\n        label.style.padding = '4px 8px';\n        label.style.borderRadius = '12px';\n        label.style.fontSize = '12px';\n        label.textContent = file.type.startsWith('video/') ? 'VIDEO' : 'PHOTO';\n        preview.appendChild(label);\n        \n        // Store URL for cleanup\n        preview._previewUrl = url;\n    }\n}

function handleUpload(e) {\n    e.preventDefault();\n    const file = document.getElementById('mediaInput').files[0];\n    const caption = document.getElementById('captionInput').value;\n    const preview = document.getElementById('uploadPreview');\n    const submitBtn = preview.parentElement.querySelector('button[type=\"submit\"]');\n    \n    if (!file) {\n        alert('Pilih file terlebih dahulu!');\n        return;\n    }\n    \n    // Validation\n    if (file.size > 5 * 1024 * 1024) {\n        preview.classList.add('error');\n        preview.innerHTML = '<i class=\"fas fa-exclamation-triangle\"></i><p>File terlalu besar! Maksimal 5MB.</p>';\n        setTimeout(() => preview.classList.remove('error'), 3000);\n        return;\n    }\n    \n    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {\n        preview.classList.add('error');\n        preview.innerHTML = '<i class=\"fas fa-exclamation-triangle\"></i><p>Hanya foto dan video yang diizinkan!</p>';\n        setTimeout(() => preview.classList.remove('error'), 3000);\n        return;\n    }\n    \n    // Loading state\n    preview.classList.add('loading');\n    submitBtn.textContent = 'Mengunggah...';\n    submitBtn.disabled = true;\n    \n    const reader = new FileReader();\n    reader.onload = (e) => {\n        try {\n            const newPost = {\n                id: Date.now(),\n                userId: 3,\n                media: e.target.result,\n                type: file.type.startsWith('video/') ? 'video' : 'image',\n                caption: caption,\n                likes: 0,\n                comments: [],\n                liked: false\n            };\n            \n            posts.unshift(newPost);\n            localStorage.setItem('socialhub_posts', JSON.stringify(posts));\n            renderCurrentView();\n            closeUpload();\n            alert('Post berhasil dibagikan!');\n        } catch (err) {\n            alert('Gagal menyimpan post. Kemungkinan storage penuh. Coba hapus beberapa post lama.');\n        }\n    };\n    reader.onerror = () => {\n        preview.classList.remove('loading');\n        submitBtn.textContent = 'Bagikan';\n        submitBtn.disabled = false;\n        alert('Gagal membaca file!');\n    };\n    reader.readAsDataURL(file);\n}

function toggleLike(e) {
    e.stopPropagation();
    const btn = e.target.closest('.like-btn');
    const postId = parseInt(btn.getAttribute('data-post-id'));
    const post = posts.find(p => p.id === postId);
    
    if (post) {
        post.liked = !post.liked;
        post.likes += post.liked ? 1 : -1;
        localStorage.setItem('socialhub_posts', JSON.stringify(posts));
        renderCurrentView();
    }
}

function deletePost(postId) {
    if (confirm('Hapus post ini?')) {
        const post = posts.find(p => p.id === postId);
        if (post && post.userId === 3) {  // only own posts
            posts = posts.filter(p => p.id !== postId);
            localStorage.setItem('socialhub_posts', JSON.stringify(posts));
            renderCurrentView();
            alert('Post dihapus!');
        } else {
            alert('Hanya bisa hapus post sendiri!');
        }
    }
}

function setActiveNav(newPage) {
    document.querySelectorAll('.nav-icon').forEach(icon => icon.classList.remove('active'));
    document.querySelector(`[onclick="show${newPage.charAt(0).toUpperCase() + newPage.slice(1)}()"]`).classList.add('active');
    const toggleBtns = document.querySelector('.toggle-buttons');
    const grid = document.getElementById('postsGrid');
    const reel = document.getElementById('postsReel');
    if (newPage === 'feed') {
        toggleBtns.style.display = 'flex';
        grid.style.display = currentView === 'grid' ? 'grid' : 'none';
        reel.style.display = currentView === 'reel' ? 'block' : 'none';
    } else {
        toggleBtns.style.display = 'none';
        grid.style.display = 'grid';
        reel.style.display = 'none';
    }
}

function showFeed() {
    currentPage = 'feed';
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById('feedView').classList.add('active');
    setActiveNav('feed');
    renderCurrentView();
}

function showProfile() {
    currentPage = 'profile';
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById('profileView').classList.add('active');
    setActiveNav('profile');
    renderCurrentView();
}

function showExplore() {
    currentPage = 'explore';
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById('exploreView').classList.add('active');
    setActiveNav('explore');
    renderCurrentView();
}

// View Controls
function toggleView() { /* Toggle grid/reel */ }
function setView(view) {
    currentView = view;
    document.querySelectorAll('.toggle-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    document.getElementById('postsGrid').style.display = view === 'grid' ? 'grid' : 'none';
    document.getElementById('postsReel').style.display = view === 'reel' ? 'block' : 'none';
}

function showUpload() {
    document.getElementById('uploadModal').classList.add('active');
}

function closeUpload() {
    document.getElementById('uploadModal').classList.remove('active');
    document.getElementById('uploadForm').reset();
    document.getElementById('uploadPreview').classList.remove('has-media');
    document.getElementById('uploadPreview').innerHTML = '<i class="fas fa-cloud-upload-alt"></i><p>Pilih foto atau video</p>';
}

function filterPosts() {
    renderCurrentView();
}

// Comment Functions
function openCommentModal(postId) {
    selectedPostIdForComment = postId;
    const post = posts.find(p => p.id === postId);
    
    if (!post) return;
    
    const commentsList = document.getElementById('commentsList');
    const comments = Array.isArray(post.comments) ? post.comments : [];
    
    commentsList.innerHTML = comments.length === 0 
        ? '<p class="no-comments">Belum ada komentar. Jadilah yang pertama berkomentar!</p>'
        : comments.map((comment, index) => `
            <div class="comment-item">
                <img src="${comment.avatar}" alt="${comment.username}" class="comment-avatar">
                <div class="comment-content">
                    <p><strong>${comment.username}</strong></p>
                    <p class="comment-text">${comment.text}</p>
                </div>
                ${comment.userId === 3 ? `<div class="delete-comment-btn" onclick="deleteComment(${postId}, ${index})"><i class="fas fa-trash-alt"></i></div>` : ''}
            </div>
        `).join('');
    
    document.getElementById('commentInput').value = '';
    document.getElementById('commentModal').classList.add('active');
}

function closeCommentModal() {
    document.getElementById('commentModal').classList.remove('active');
    selectedPostIdForComment = null;
}

function addComment() {
    const commentInput = document.getElementById('commentInput');
    const text = commentInput.value.trim();
    
    if (!text) return alert('Tulis komentar terlebih dahulu!');
    if (!selectedPostIdForComment) return;
    
    const post = posts.find(p => p.id === selectedPostIdForComment);
    if (!post) return;
    
    // Ensure comments is an array
    if (!Array.isArray(post.comments)) {
        post.comments = [];
    }
    
    const currentUser = users.find(u => u.id === 3); // Current user
    const newComment = {
        id: Date.now(),
        userId: 3,
        username: currentUser.name,
        avatar: currentUser.avatar,
        text: text,
        timestamp: new Date().toLocaleString()
    };
    
    post.comments.push(newComment);
    localStorage.setItem('socialhub_posts', JSON.stringify(posts));
    
    commentInput.value = '';
    openCommentModal(selectedPostIdForComment); // Refresh comments display
    renderCurrentView();
}

function deleteComment(postId, commentIndex) {
    if (confirm('Hapus komentar ini?')) {
        const post = posts.find(p => p.id === postId);
        if (post && Array.isArray(post.comments)) {
            const comment = post.comments[commentIndex];
            if (comment && comment.userId === 3) { // Only delete own comments
                post.comments.splice(commentIndex, 1);
                localStorage.setItem('socialhub_posts', JSON.stringify(posts));
                openCommentModal(postId); // Refresh comments display
                renderCurrentView();
            } else {
                alert('Hanya bisa hapus komentar sendiri!');
            }
        }
    }
}
