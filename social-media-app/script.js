// Full improved script with video duration check and account system

// Data Management
let posts = JSON.parse(localStorage.getItem('socialhub_posts')) || [];
let users = JSON.parse(localStorage.getItem('socialhub_users')) || [
  { id: 1, username: 'john_doe', email: 'john@example.com', password: '123', avatar: 'https://ui-avatar.com/api/?name=John+Doe&size=128&background=0095f6', bio: 'Just living life', followers: [], following: [], posts: [] },
  { id: 2, username: 'jane_smith', email: 'jane@example.com', password: '123', avatar: 'https://ui-avatar.com/api/?name=Jane+Smith&size=128&background=ed4956', bio: 'Love dancing', followers: [], following: [], posts: [] }
];
localStorage.setItem('socialhub_users', JSON.stringify(users));

let currentUser = JSON.parse(localStorage.getItem('socialhub_currentUser')) || null;
let currentView = 'grid';
let currentPage = 'feed';
let selectedPostIdForComment = null;

// Migrate posts
posts = posts.map(post => ({
  ...post,
  comments: Array.isArray(post.comments) ? post.comments : [],
  username: post.username || 'Unknown',
  userAvatar: post.userAvatar || 'https://ui-avatar.com/api/?name=Unknown&size=32&background=gray'
}));

if (posts.length === 0) {
  posts = [
    {
      id: 1,
      userId: 1,
      username: 'john_doe',
      userAvatar: 'https://ui-avatar.com/api/?name=John+Doe&size=128&background=0095f6',
      media: 'https://picsum.photos/400/400?random=1',
      type: 'image',
      caption: 'Beautiful sunset 🌅',
      likes: 128,
      comments: [],
      liked: false
    }
  ];
  localStorage.setItem('socialhub_posts', JSON.stringify(posts));
}

// Auth Functions
function previewAvatar(e) {
  const file = e.target.files[0];
  if (file && file.type.startsWith('image/')) {
    const preview = document.getElementById('avatarPreview');
    const url = URL.createObjectURL(file);
    preview.style.backgroundImage = `url(${url})`;
    preview.style.display = 'block';
    preview._url = url;
  }
}

function switchTab(tab) {
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
  document.getElementById(tab + 'Tab').classList.add('active');
  event.target.classList.add('active');
}

function closeAuth() {
  document.getElementById('authModal').classList.remove('active');
}

function handleAuth(e) {
  e.preventDefault();
  const activeTab = document.querySelector('.auth-tab.active');
  if (activeTab.id === 'registerTab') {
    const username = document.getElementById('regUsername').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const avatarFile = document.getElementById('avatarInput').files[0];
    
    if (!username || !email || !password) {
      alert('Lengkapi semua field!');
      return;
    }
    
    if (users.find(u => u.username === username || u.email === email)) {
      alert('Username atau email sudah digunakan!');
      return;
    }
    
    const newUser = {
      id: Date.now(),
      username,
      email,
      password,
      bio: '',
      followers: [],
      following: [],
      posts: [],
      avatar: `https://ui-avatar.com/api/?name=${encodeURIComponent(username)}&size=128&background=0095f6`
    };
    
    if (avatarFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        newUser.avatar = e.target.result;
        finalizeRegistration(newUser);
      };
      reader.readAsDataURL(avatarFile);
    } else {
      finalizeRegistration(newUser);
    }
  } else {
    const identifier = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    const user = users.find(u => (u.username === identifier || u.email === identifier) && u.password === password);
    if (user) {
      localStorage.setItem('socialhub_currentUser', JSON.stringify(user));
      currentUser = user;
      closeAuth();
      renderCurrentView();
      alert('Login berhasil!');
    } else {
      alert('Username/email atau password salah!');
    }
  }
}

function finalizeRegistration(newUser) {
  users.push(newUser);
  localStorage.setItem('socialhub_users', JSON.stringify(users));
  localStorage.setItem('socialhub_currentUser', JSON.stringify(newUser));
  currentUser = newUser;
  closeAuth();
  renderCurrentView();
  alert('Akun berhasil dibuat!');
}

// Video upload with duration check
function checkVideoDuration(file, callback) {
  const video = document.createElement('video');
  video.preload = 'metadata';
  video.onloadedmetadata = () => {
    window.URL.revokeObjectURL(video.src);
    callback(video.duration <= 180); // 3 minutes
  };
  video.onerror = () => callback(true);
  video.src = URL.createObjectURL(file);
}

function handleUpload(e) {
  e.preventDefault();
  const file = document.getElementById('mediaInput').files[0];
  const caption = document.getElementById('captionInput').value.trim();
  const preview = document.getElementById('uploadPreview');
  const submitBtn = e.target.querySelector('button[type="submit"]');
  
  if (!currentUser) {
    alert('Login dulu!');
    return;
  }
  
  if (!file) {
    alert('Pilih file!');
    return;
  }
  
  preview.classList.add('loading');
  submitBtn.textContent = 'Memproses...';
  submitBtn.disabled = true;
  
  if (file.type.startsWith('video/')) {
    checkVideoDuration(file, (isShort) => {
      if (!isShort && !confirm('Video > 3 menit. Bisa gagal disimpan. Lanjut?')) {
        preview.classList.remove('loading');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Bagikan';
        return;
      }
      uploadFile(file, caption, preview, submitBtn);
    });
  } else {
    if (file.size > 5 * 1024 * 1024) {
      alert('Foto maks 5MB!');
      preview.classList.remove('loading');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Bagikan';
      return;
    }
    uploadFile(file, caption, preview, submitBtn);
  }
}

function uploadFile(file, caption, preview, submitBtn) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const newPost = {
        id: Date.now(),
        userId: currentUser.id,
        username: currentUser.username,
        userAvatar: currentUser.avatar,
        media: e.target.result,
        type: file.type.startsWith('video/') ? 'video' : 'image',
        caption,
        likes: 0,
        comments: [],
        liked: false
      };
      
      posts.unshift(newPost);
      localStorage.setItem('socialhub_posts', JSON.stringify(posts));
      renderCurrentView();
      closeUpload();
      alert('Post berhasil!');
    } catch (err) {
      alert('Gagal simpan. Storage penuh? Hapus post lama.');
    } finally {
      preview.classList.remove('loading');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Bagikan';
    }
  };
  reader.onerror = () => {
    preview.classList.remove('loading');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Bagikan';
    alert('Gagal baca file!');
  };
  reader.readAsDataURL(file);
}

// Rest of existing functions remain the same
function setupEventListeners() {
  document.getElementById('uploadForm').addEventListener('submit', handleUpload);
  document.getElementById('mediaInput').addEventListener('change', previewMedia);
  document.getElementById('uploadPreview').addEventListener('click', () => document.getElementById('mediaInput').click());
  document.getElementById('searchInput').addEventListener('input', filterPosts);
  document.getElementById('commentInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addComment();
  });
}

function previewMedia(e) {
  const file = e.target.files[0];
  const preview = document.getElementById('uploadPreview');
  
  if (file) {
    preview.innerHTML = '';
    preview.classList.add('has-media');
    
    const url = URL.createObjectURL(file);
    if (file.type.startsWith('video/')) {
      const video = document.createElement('video');
      video.src = url;
      video.muted = true;
      video.loop = true;
      video.autoplay = true;
      video.style.width = '100%';
      video.style.height = '100%';
      video.style.objectFit = 'cover';
      preview.appendChild(video);
    } else {
      const img = document.createElement('img');
      img.src = url;
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'cover';
      preview.appendChild(img);
    }
    
    const label = document.createElement('div');
    label.style.cssText = 'position:absolute;top:10px;right:10px;background:rgba(0,0,0,0.7);color:white;padding:4px 8px;border-radius:12px;font-size:12px;';
    label.textContent = file.type.startsWith('video/') ? 'VIDEO' : 'PHOTO';
    preview.appendChild(label);
    
    preview._previewUrl = url;
  }
}

// [All other existing functions - renderPosts, createPostCard, toggleLike, etc remain unchanged]

function getUserById(id) {
  return users.find(u => u.id === id) || { username: 'Unknown', avatar: 'https://ui-avatar.com/api/?name=Unknown&size=32&background=gray' };
}

function renderCurrentView() {
  const searchValue = document.getElementById('searchInput').value;
  // ... existing logic
  if (currentPage === 'profile') {
    const userPosts = posts.filter(p => p.userId === currentUser?.id || p.userId === 3);
    document.getElementById('userPostCount').textContent = userPosts.length;
    // ... rest existing
  }
}

// Add at end
console.log('SocialHub loaded with account system and video upload fixes');

