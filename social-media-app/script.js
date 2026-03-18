// Complete Pinterest-like SocialHub script with all features

// Global variables
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
let currentProfileUserId = null; // For public profiles

// Migrate old data
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
    },
    {
      id: 2,
      userId: 2,
      username: 'jane_smith',
      userAvatar: 'https://ui-avatar.com/api/?name=Jane+Smith&size=128&background=ed4956',
      media: 'https://picsum.photos/400/600?random=2',
      type: 'image',
      caption: 'Dance practice!',
      likes: 89,
      comments: [],
      liked: false
    }
  ];
  localStorage.setItem('socialhub_posts', JSON.stringify(posts));
}

// Utility functions
function getUserById(id) {
  return users.find(u => u.id === id) || { username: 'Unknown', avatar: 'https://ui-avatar.com/api/?name=Unknown&size=32&background=gray', bio: '', followers: [], following: [] };
}

function saveData() {
  localStorage.setItem('socialhub_posts', JSON.stringify(posts));
  localStorage.setItem('socialhub_users', JSON.stringify(users));
}

// Auth functions
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
  document.getElementById('authForm').reset();
  document.getElementById('avatarPreview').style.display = 'none';
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
      updateNavbar();
      alert('Login berhasil!');
    } else {
      alert('Username/email atau password salah!');
    }
  }
}

function finalizeRegistration(newUser) {
  users.push(newUser);
  saveData();
  localStorage.setItem('socialhub_currentUser', JSON.stringify(newUser));
  currentUser = newUser;
  closeAuth();
  renderCurrentView();
  updateNavbar();
  alert('Akun berhasil dibuat!');
}

// Video duration validation - STRICT 3s min, 3min max
function validateVideoDuration(file, callback) {
  const video = document.createElement('video');
  video.preload = 'metadata';
  video.onloadedmetadata = () => {
    const duration = video.duration;
    window.URL.revokeObjectURL(video.src);
    const valid = duration >= 3 && duration <= 180;
    callback(valid, duration);
  };
  video.onerror = () => callback(false, 0);
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
  
  if (file.size > 10 * 1024 * 1024) { // 10MB max
    alert('File terlalu besar! Maks 10MB.');
    return;
  }
  
  preview.classList.add('loading');
  submitBtn.textContent = 'Memproses...';
  submitBtn.disabled = true;
  
  if (file.type.startsWith('video/')) {
    validateVideoDuration(file, (valid, duration) => {
      preview.classList.remove('loading');
      if (!valid) {
        alert(`Video tidak valid. Durasi: ${Math.round(duration)}s. Harus 3-180s.`);
        submitBtn.disabled = false;
        submitBtn.textContent = 'Bagikan';
        return;
      }
      uploadFile(file, caption, preview, submitBtn);
    });
  } else {
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
        caption: caption || '',
        likes: 0,
        comments: [],
        liked: false,
        timestamp: Date.now()
      };
      
      posts.unshift(newPost);
      const user = getUserById(currentUser.id);
      user.posts.push(newPost.id);
      saveData();
      renderCurrentView();
      closeUpload();
      document.getElementById('uploadForm').reset();
      alert('Post berhasil dibagikan!');
    } catch (err) {
      alert('Gagal menyimpan. Coba hapus post lama.');
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
    alert('Gagal membaca file!');
  };
  reader.readAsDataURL(file);
}

// View navigation
function showFeed() {
  currentPage = 'feed';
  currentProfileUserId = null;
  document.querySelector('.nav-icon.active').classList.remove('active');
  event.target.classList.add('active');
  renderCurrentView();
}

function showExplore() {
  currentPage = 'explore';
  currentProfileUserId = null;
  document.querySelector('.nav-icon.active').classList.remove('active');
  event.target.classList.add('active');
  renderCurrentView();
}

function showUpload() {
  if (!currentUser) {
    document.getElementById('authModal').classList.add('active');
    return;
  }
  document.getElementById('uploadModal').classList.add('active');
}

function showProfile(userId = null) {
  currentPage = 'profile';
  currentProfileUserId = userId || currentUser?.id;
  document.querySelector('.nav-icon.active').classList.remove('active');
  event.target.classList.add('active');
  renderCurrentView();
}

function closeUpload() {
  document.getElementById('uploadModal').classList.remove('active');
  document.getElementById('uploadForm').reset();
  document.getElementById('uploadPreview').classList.remove('has-media', 'loading');
  document.getElementById('uploadPreview').innerHTML = '<i class="fas fa-cloud-upload-alt"></i><p>Pilih foto atau video</p>';
}

function setView(view) {
  currentView = view;
  document.querySelectorAll('.toggle-btn').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
  renderCurrentView();
}

// Profile functions
function toggleFollow(userId) {
  if (!currentUser) {
    alert('Login dulu untuk follow!');
    return;
  }
  
  const targetUser = getUserById(userId);
  const currentUserData = getUserById(currentUser.id);
  
  const isFollowing = currentUserData.following.includes(userId);
  
  if (isFollowing) {
    currentUserData.following = currentUserData.following.filter(id => id !== userId);
    targetUser.followers = targetUser.followers.filter(id => id !== currentUser.id);
  } else {
    currentUserData.following.push(userId);
    targetUser.followers.push(currentUser.id);
  }
  
  saveData();
  renderProfileHeader();
}

function updateBio(bio) {
  if (currentProfileUserId !== currentUser?.id) return;
  const user = getUserById(currentUser.id);
  user.bio = bio;
  saveData();
  renderProfileHeader();
}

// Post rendering
function createPostCard(post, isReel = false) {
  const user = getUserById(post.userId);
  const card = document.createElement('div');
  card.className = 'post-card';
  card.onclick = (e) => {
    if (e.target.closest('.reel-delete')) return;
    showProfile(post.userId);
  };
  
  if (isReel) {
    card.innerHTML = `
      <div class="reel-player">
        ${post.type === 'video' ? `<video class="reel-video" src="${post.media}" loop muted playsinline autoplay></video>` : `<div class="reel-video" style="background-image:url(${post.media});background-size:cover;background-position:center;"></div>`}
        <div class="reel-delete" onclick="deletePost(${post.id});event.stopPropagation();" style="display: ${post.userId === currentUser?.id ? 'flex' : 'none'}">
          <i class="fas fa-trash"></i>
        </div>
      </div>
      <div class="post-overlay">
        <div class="post-user">${post.username}</div>
        <div class="post-caption">${post.caption}</div>
      </div>
    `;
  } else {
    card.innerHTML = `
      <div class="post-media">
        <div class="post-media-inner" style="background-image: url(${post.media});" data-video="${post.type === 'video'}"></div>
      </div>
      <div class="post-overlay">
        <div class="post-user" onclick="showProfile(${post.userId});event.stopPropagation();">${post.username}</div>
        <div class="post-caption">${post.caption}</div>
      </div>
    `;
  }
  
  return card;
}

function renderPosts(containerId, postsToRender) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  
  if (postsToRender.length === 0) {
    container.innerHTML = '<div style="text-align:center;padding:40px;color:#8e8e8e;">Tidak ada post</div>';
    return;
  }
  
  postsToRender.forEach(post => {
    const card = createPostCard(post, currentView === 'reel');
    container.appendChild(card);
  });
}

function filterPosts() {
  renderCurrentView();
}

function renderCurrentView() {
  const searchValue = document.getElementById('searchInput').value.toLowerCase();
  let filteredPosts = posts.filter(p => 
    p.caption.toLowerCase().includes(searchValue) || 
    p.username.toLowerCase().includes(searchValue)
  );
  
  if (currentPage === 'profile') {
    filteredPosts = filteredPosts.filter(p => p.userId === currentProfileUserId);
    renderProfileHeader();
    document.getElementById('userPostCount').textContent = filteredPosts.length;
  }
  
  // Grid view
  const gridContainers = {
    feed: 'postsGrid',
    explore: 'postsGrid-explore',
    profile: 'postsGrid-profile'
  };
  
  // Reel view
  const reelContainers = {
    feed: 'postsReel',
    explore: 'postsReel-explore',
    profile: 'postsReel-profile'
  };
  
  const gridContainer = gridContainers[currentPage];
  const reelContainer = reelContainers[currentPage];
  
  if (currentView === 'grid') {
    document.getElementById(gridContainer).style.display = 'grid';
    document.getElementById(reelContainer).style.display = 'none';
    renderPosts(gridContainer, filteredPosts);
  } else {
    document.getElementById(gridContainer).style.display = 'none';
    document.getElementById(reelContainer).style.display = 'block';
    renderPosts(reelContainer, filteredPosts);
  }
  
  updateViewVisibility();
}

function renderProfileHeader() {
  if (currentPage !== 'profile') return;
  
  const profileUser = getUserById(currentProfileUserId);
  const isOwnProfile = currentProfileUserId === currentUser?.id;
  const header = document.querySelector('#profileView h2');
  
  const followersCount = profileUser.followers.length;
  const followingCount = profileUser.following.length;
  
  header.innerHTML = `
    <img src="${profileUser.avatar}" class="profile-avatar-large">
    <div>
      <div style="font-weight:600;font-size:24px;margin-bottom:4px;">${profileUser.username}</div>
      <div style="font-size:14px;color:#666;">
        <span><strong>${followersCount}</strong> followers</span> • 
        <span><strong>${followingCount}</strong> following</span>
      </div>
    </div>
    ${isOwnProfile ? '' : `<button class="follow-btn" onclick="toggleFollow(${profileUser.id})">
      ${currentUser?.following?.includes(profileUser.id) ? 'Following' : 'Follow'}
    </button>`}
  `;
  
  // Bio
  const profileSection = document.querySelector('#profileView');
  let bioDiv = profileSection.querySelector('.profile-bio');
  if (profileUser.bio) {
    if (!bioDiv) {
      bioDiv = document.createElement('div');
      bioDiv.className = 'profile-bio';
      profileSection.insertBefore(bioDiv, document.querySelector('#postsGrid-profile'));
    }
    bioDiv.innerHTML = `<p>"${profileUser.bio}"</p>`;
  } else if (bioDiv) {
    bioDiv.remove();
  }
  
  // Bio edit for own profile
  if (isOwnProfile) {
    let bioEdit = profileSection.querySelector('.bio-edit');
    if (!bioEdit) {
      bioEdit = document.createElement('div');
      bioEdit.className = 'bio-edit';
      bioEdit.innerHTML = `
        <textarea placeholder="Tambahkan bio...">${profileUser.bio}</textarea>
        <button onclick="updateBio(this.previousElementSibling.value.trim() || '')">Simpan</button>
      `;
      profileSection.insertBefore(bioEdit, document.querySelector('#postsGrid-profile'));
    }
  }
}

function updateViewVisibility() {
  const views = ['feedView', 'exploreView', 'profileView'];
  views.forEach(v => {
    document.getElementById(v).classList.toggle('active', currentPage === v.replace('View', ''));
  });
  
  const toggleBtns = document.querySelectorAll('.toggle-buttons');
  toggleBtns.forEach(btns => btns.style.display = currentPage === 'feed' ? 'flex' : 'none');
}

function updateNavbar() {
  const profileIcon = document.querySelector('.fa-user');
  if (profileIcon) profileIcon.style.color = currentUser ? '#0095f6' : '#262626';
}

// Other functions
function deletePost(postId) {
  if (confirm('Hapus post ini?')) {
    posts = posts.filter(p => p.id !== postId);
    const user = getUserById(currentUser?.id);
    if (user) user.posts = user.posts.filter(id => id !== postId);
    saveData();
    renderCurrentView();
  }
}

function closeCommentModal() {
  document.getElementById('commentModal').classList.remove('active');
}

function addComment() {
  const text = document.getElementById('commentInput').value.trim();
  if (!text || !currentUser) return;
  
  const post = posts.find(p => p.id === selectedPostIdForComment);
  if (post) {
    post.comments.unshift({
      id: Date.now(),
      username: currentUser.username,
      text,
      timestamp: Date.now()
    });
    saveData();
  }
  closeCommentModal();
}

function previewMedia(e) {
  const file = e.target.files[0];
  const preview = document.getElementById('uploadPreview');
  
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
}

// Init
document.addEventListener('DOMContentLoaded', function() {
  // Auth form
  document.getElementById('authForm').addEventListener('submit', handleAuth);
  document.getElementById('avatarInput').addEventListener('change', previewAvatar);
  
  // Upload
  document.getElementById('uploadForm').addEventListener('submit', handleUpload);
  document.getElementById('mediaInput').addEventListener('change', previewMedia);
  document.getElementById('uploadPreview').addEventListener('click', () => document.getElementById('mediaInput').click());
  
  // Search
  document.getElementById('searchInput').addEventListener('input', filterPosts);
  
  updateNavbar();
  renderCurrentView();
  console.log('SocialHub Pinterest clone ready! All features implemented.');
});
