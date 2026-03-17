   import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Upload, 
  Menu, 
  Home, 
  PlaySquare, 
  ThumbsUp, 
  Share2, 
  CheckCircle2,
  X,
  Play,
  Users,
  Video,
  ChevronLeft,
  Plus,
  FileVideo,
  MessageCircle,
  Send,
  User,
  Camera,
  Edit3,
  ArrowLeft,
  Image as ImageIcon,
  Trash2,
  Save,
  LogOut,
  LayoutGrid
} from 'lucide-react';
import { BG_IMAGE_URL } from './BG_IMAGE_URL';

/**
 * DATA BRAND DEFAULT
 */
const DEFAULT_BRAND_PHOTO = "Gemini_Generated_Image_xa7arfxa7arfxa7a.png";
const CATEGORIES = ["Semua", "Vlog", "Eksklusif", "Lifestyle", "Tutorial", "Terbaru"];

const INITIAL_VIDEOS = [
  {
    id: '1',
    title: "Momen Spesial: Keseharian di Balik Layar",
    thumbnail: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80",
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    creator: "BbyKhansa",
    creatorPhoto: DEFAULT_BRAND_PHOTO,
    views: "1.2jt",
    timestamp: "2 hari yang lalu",
    category: "Vlog",
    duration: "00:13",
    subscribers: "500rb",
    description: "Halo semua! Video ini adalah rangkuman aktivitas saya minggu ini.",
    likes: 12500,
    comments: [
      { id: 1, user: "Andi", text: "Keren banget kak kontennya!", time: "1 jam yang lalu" }
    ]
  },
  {
    id: '2',
    title: "Tips Produktifitas Untuk Kreator Pemula",
    thumbnail: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80",
    videoUrl: "https://www.w3schools.com/html/movie.mp4",
    creator: "TechEnthusiast",
    creatorPhoto: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80",
    views: "85rb",
    timestamp: "5 jam yang lalu",
    category: "Tutorial",
    duration: "00:12",
    subscribers: "12rb",
    description: "Bagaimana cara mengatur jadwal konten agar konsisten.",
    likes: 4200,
    comments: []
  }
];

export default function App() {
  const [view, setView] = useState('intro'); 
  const [videos, setVideos] = useState(INITIAL_VIDEOS);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Semua');
  
  const [userProfile, setUserProfile] = useState({
    name: "Kreator Baru",
    bio: "Selamat datang di channel saya!",
    photo: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&q=80",
    subscribers: "0"
  });

  const [isSubscribed, setIsSubscribed] = useState(false);
  const [likedVideos, setLikedVideos] = useState(new Set());
  const [editingVideoId, setEditingVideoId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  const [uploadData, setUploadData] = useState({
    title: '',
    category: 'Vlog',
    description: '',
    videoFile: null,
    videoPreview: null,
    thumbnailPreview: null,
    autoThumbnail: null,
    duration: '00:00' 
  });

  const filteredVideos = useMemo(() => {
    let result = [...videos];
    if (activeCategory !== 'Semua') result = result.filter(v => v.category === activeCategory);
    if (searchQuery) result = result.filter(v => v.title.toLowerCase().includes(searchQuery.toLowerCase()));
    return result;
  }, [activeCategory, searchQuery, videos]);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const processVideoMetadata = (fileUrl) => {
    const video = document.createElement('video');
    video.src = fileUrl;
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      const durationFormatted = formatDuration(video.duration);
      video.currentTime = 1;
      video.onseeked = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        setUploadData(prev => ({ 
          ...prev, 
          autoThumbnail: canvas.toDataURL('image/jpeg'),
          duration: durationFormatted
        }));
      };
    };
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUploadData({ ...uploadData, videoFile: file, videoPreview: url });
      processVideoMetadata(url);
    }
  };

  const handleUploadSubmit = () => {
    if (!uploadData.title || !uploadData.videoFile) return;
    const newVideo = {
      id: Date.now().toString(),
      title: uploadData.title,
      thumbnail: uploadData.thumbnailPreview || uploadData.autoThumbnail || "https://images.unsplash.com/photo-1593642532400-2682810df593?w=800&q=80",
      videoUrl: uploadData.videoPreview,
      creator: userProfile.name,
      creatorPhoto: userProfile.photo,
      views: "0",
      timestamp: "Baru saja",
      category: uploadData.category,
      duration: uploadData.duration,
      subscribers: userProfile.subscribers,
      description: uploadData.description || "Tidak ada deskripsi.",
      likes: 0,
      comments: []
    };
    setVideos([newVideo, ...videos]);
    setUploadData({ title: '', category: 'Vlog', description: '', videoFile: null, videoPreview: null, thumbnailPreview: null, autoThumbnail: null, duration: '00:00' });
    setView('creator'); 
  };

  const handleDeleteVideo = (id) => {
    setVideos(videos.filter(v => v.id !== id));
  };

  const handleStartEdit = (video) => {
    setEditingVideoId(video.id);
    setEditTitle(video.title);
  };

  const handleSaveEdit = () => {
    setVideos(videos.map(v => v.id === editingVideoId ? { ...v, title: editTitle } : v));
    setEditingVideoId(null);
  };

  const goHome = () => { setView('home'); setSelectedVideo(null); };

  const Avatar = ({ src, className = "w-10 h-10", onClick }) => (
    <div onClick={onClick} className={`relative flex items-center justify-center bg-sky-50 overflow-hidden rounded-full border border-sky-100 shadow-sm transition-transform hover:scale-105 cursor-pointer ${className}`}>
      <img src={src} alt="User" className="w-full h-full object-cover" onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80"; }} />
    </div>
  );

  if (view === 'intro') {
    return (
      <div className="min-h-screen relative flex items-center justify-center p-6 text-center overflow-hidden">
        {/* Background Layer */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat grayscale brightness-[0.2]"
          style={{ backgroundImage: `url(${BG_IMAGE_URL})` }}
        />
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-slate-900/60 via-slate-900/40 to-slate-900/80" />

        <div className="relative z-10 max-w-md space-y-8 animate-in fade-in zoom-in duration-700">
          <Avatar src={DEFAULT_BRAND_PHOTO} className="w-32 h-32 mx-auto shadow-2xl border-4 border-white/20" />
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-white tracking-tight drop-shadow-lg">BbyKhansa Platform</h1>
            <p className="text-slate-300 font-medium">Ruang kreatif untuk inspirasi tanpa batas</p>
          </div>
          <div className="space-y-4">
            <button onClick={() => setView('home')} className="w-full py-4 bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white hover:text-slate-900 rounded-3xl font-black shadow-lg transition-all flex items-center justify-center gap-3">
              <Users size={20} /> Masuk sebagai Fans
            </button>
            <button onClick={() => setView('profile')} className="w-full py-4 bg-sky-500 hover:bg-sky-600 text-white rounded-3xl font-black shadow-lg transition-all flex items-center justify-center gap-3">
              <Video size={20} /> Masuk sebagai Kreator
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col relative">
      {/* Universal Body Background Layer - Very subtle */}
      <div 
        className="fixed inset-0 z-0 pointer-events-none bg-cover bg-fixed bg-center bg-no-repeat grayscale opacity-[0.03]"
        style={{ backgroundImage: `url(${BG_IMAGE_URL})` }}
      />

      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-100 z-50 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={goHome}>
          <div className="bg-sky-500 p-1.5 rounded-xl text-white group-hover:scale-110 transition-transform">
            <Video size={20} />
          </div>
          <span className="font-black text-xl tracking-tighter">BbyKhansa</span>
        </div>
        
        {(view === 'home') && (
          <div className="flex-1 max-w-lg mx-8 hidden md:block">
            <div className="relative">
              <input 
                type="text" placeholder="Cari video creator favoritmu..." 
                className="w-full bg-slate-100 border-none rounded-2xl py-2.5 px-10 focus:ring-2 focus:ring-sky-200 transition-all font-medium"
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-3 text-slate-400" size={18} />
            </div>
          </div>
        )}

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setView('upload')} 
            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-xl shadow-lg hover:bg-sky-600 transition-all font-black text-sm"
          >
            <Plus size={18}/> Upload
          </button>
          <div className="h-8 w-px bg-slate-200 hidden sm:block mx-2" />
          <Avatar src={userProfile.photo} onClick={() => setView('profile')} className="w-10 h-10 border-2 border-white shadow-sm" />
          <button onClick={() => setView('intro')} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><LogOut size={20}/></button>
        </div>
      </nav>

      <div className="pt-20 flex flex-1 relative z-10">
        <aside className="w-64 fixed left-0 h-[calc(100vh-80px)] bg-white/80 backdrop-blur-sm border-r border-slate-100 p-6 hidden lg:block overflow-y-auto">
          <div className="space-y-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 mb-4">Menu Utama</p>
            <SidebarItem icon={<Home size={20}/>} label="Beranda Video" active={view === 'home' || view === 'watch'} onClick={goHome} />
            <SidebarItem icon={<Users size={20}/>} label="Subscription" active={false} onClick={() => {}} />
            
            <div className="my-8 h-px bg-slate-50" />
            
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 mb-4">Fitur Kreator</p>
            <SidebarItem icon={<PlaySquare size={20}/>} label="Dashboard Video" active={view === 'creator'} onClick={() => setView('creator')} />
            <SidebarItem icon={<Upload size={20}/>} label="Upload Konten" active={view === 'upload'} onClick={() => setView('upload')} />
            <SidebarItem icon={<User size={20}/>} label="Profil Saya" active={view === 'profile'} onClick={() => setView('profile')} />
          </div>

          <div className="absolute bottom-8 left-6 right-6 p-6 bg-slate-900 rounded-[2rem] text-white">
            <p className="text-xs font-black opacity-60 uppercase tracking-tighter mb-1">Status Akun</p>
            <p className="text-sm font-black flex items-center gap-2">
              Creator Mode <CheckCircle2 size={14} className="text-sky-400" />
            </p>
          </div>
        </aside>

        <main className={`flex-1 ${['watch', 'creator', 'profile', 'upload'].includes(view) ? 'lg:pl-0' : 'lg:pl-64'} p-6 transition-all`}>
          
          {view === 'home' && (
             <div className="lg:pl-64 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-2xl font-black text-slate-800">Eksplorasi Video</h1>
                  <div className="flex gap-2 overflow-x-auto no-scrollbar max-w-[60%]">
                    {CATEGORIES.map(c => (
                      <button key={c} onClick={() => setActiveCategory(c)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all ${activeCategory === c ? 'bg-slate-800 text-white shadow-lg shadow-slate-200' : 'bg-white border border-slate-100 text-slate-400 hover:bg-slate-50'}`}>{c}</button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                  {filteredVideos.map(v => (
                    <div key={v.id} onClick={() => { setSelectedVideo(v); setView('watch'); }} className="group cursor-pointer space-y-4">
                      <div className="aspect-video rounded-[2.5rem] overflow-hidden bg-slate-200 relative shadow-md transition-all group-hover:-translate-y-2 group-hover:shadow-2xl group-hover:shadow-sky-100">
                        <img src={v.thumbnail} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={v.title} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="bg-white/20 backdrop-blur-md p-4 rounded-full">
                            <Play className="text-white fill-current" size={32} />
                          </div>
                        </div>
                        <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-black px-2 py-1 rounded-md">
                          {v.duration || "00:00"}
                        </div>
                      </div>
                      <div className="flex gap-4 px-2">
                        <Avatar src={v.creatorPhoto} className="w-12 h-12 shrink-0 shadow-sm ring-2 ring-white" />
                        <div>
                          <h3 className="font-black text-slate-800 leading-tight line-clamp-2 group-hover:text-sky-600 transition-colors">{v.title}</h3>
                          <div className="flex items-center gap-1 mt-1">
                            <p className="text-xs text-slate-400 font-bold">{v.creator}</p>
                            <CheckCircle2 size={12} className="text-blue-500"/>
                          </div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{v.views} Tayangan • {v.timestamp}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
             </div>
          )}

          {view === 'creator' && (
            <div className="max-w-5xl mx-auto lg:pl-64 space-y-8 animate-in fade-in duration-500">
               <div className="flex flex-col md:flex-row md:items-center justify-between bg-white/80 backdrop-blur-md p-8 rounded-[3rem] shadow-sm border border-slate-100 gap-6">
                  <div>
                    <h1 className="text-3xl font-black text-slate-800">Dashboard Kreator</h1>
                    <p className="text-slate-400 font-bold">Kelola konten dan interaksi channel Anda.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={goHome} 
                      className="flex items-center gap-2 bg-slate-100 text-slate-600 px-6 py-3 rounded-2xl font-black text-sm hover:bg-slate-200 transition-all"
                    >
                      <LayoutGrid size={18}/> Ke Beranda
                    </button>
                    <button 
                      onClick={() => setView('upload')} 
                      className="flex items-center gap-2 bg-sky-500 text-white px-6 py-3 rounded-2xl font-black text-sm shadow-xl shadow-sky-100 hover:bg-sky-600 transition-all"
                    >
                      <Upload size={18}/> Video Baru
                    </button>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {videos.filter(v => v.creator === userProfile.name).map(v => (
                    <div key={v.id} className="bg-white/80 backdrop-blur-md p-5 rounded-[2.5rem] border border-slate-100 shadow-sm flex gap-5 group hover:shadow-xl transition-all">
                       <div className="w-44 aspect-video rounded-2xl overflow-hidden bg-slate-100 shrink-0 relative">
                          <img src={v.thumbnail} className="w-full h-full object-cover" />
                          <div className="absolute bottom-1 right-1 bg-black/70 text-[8px] text-white px-1.5 py-0.5 rounded font-black">{v.duration}</div>
                       </div>
                       <div className="flex-1 flex flex-col justify-between py-1">
                          {editingVideoId === v.id ? (
                            <div className="space-y-3">
                               <input 
                                  value={editTitle} 
                                  onChange={(e) => setEditTitle(e.target.value)}
                                  className="w-full bg-slate-50 border-2 border-sky-300 rounded-xl px-3 py-2 font-black text-sm outline-none"
                                  autoFocus
                               />
                               <div className="flex gap-2">
                                  <button onClick={handleSaveEdit} className="bg-sky-500 text-white p-2 rounded-xl shadow-md"><Save size={16}/></button>
                                  <button onClick={() => setEditingVideoId(null)} className="bg-slate-100 text-slate-500 p-2 rounded-xl"><X size={16}/></button>
                               </div>
                            </div>
                          ) : (
                            <>
                              <div>
                                <h3 className="font-black text-slate-800 leading-tight mb-1 line-clamp-2">{v.title}</h3>
                                <div className="flex items-center gap-2">
                                  <span className="bg-slate-100 text-slate-400 text-[9px] font-black px-2 py-0.5 rounded-full uppercase">{v.category}</span>
                                  <p className="text-[10px] font-bold text-slate-400">{v.views} Tayangan</p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button onClick={() => handleStartEdit(v)} className="flex items-center gap-2 text-[10px] font-black text-sky-500 hover:bg-sky-50 px-3 py-2 rounded-xl transition-colors">
                                   <Edit3 size={14} /> Edit
                                </button>
                                <button onClick={() => handleDeleteVideo(v.id)} className="flex items-center gap-2 text-[10px] font-black text-red-500 hover:bg-red-50 px-3 py-2 rounded-xl transition-colors">
                                   <Trash2 size={14} /> Hapus
                                </button>
                              </div>
                            </>
                          )}
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          )}

          {view === 'upload' && (
            <div className="max-w-2xl mx-auto bg-white/90 backdrop-blur-md p-12 rounded-[3.5rem] shadow-2xl space-y-8 animate-in slide-in-from-bottom-8">
               <div className="flex items-center gap-4">
                  <button onClick={goHome} className="p-3 hover:bg-slate-50 rounded-2xl transition-all border border-slate-100 shadow-sm"><ChevronLeft/></button>
                  <div>
                    <h2 className="text-2xl font-black tracking-tight">Terbitkan Karya Anda</h2>
                    <p className="text-sm font-bold text-slate-400">Pastikan video mematuhi pedoman komunitas.</p>
                  </div>
               </div>
               
               <div className="space-y-6">
                  <div className="relative border-4 border-dashed border-sky-100 rounded-[2.5rem] p-12 text-center bg-sky-50/30 group hover:bg-sky-50 transition-all">
                     <input type="file" accept="video/*" onChange={handleVideoChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                     {uploadData.videoPreview ? (
                        <div className="flex flex-col items-center gap-2">
                           <PlaySquare size={56} className="text-sky-500" />
                           <p className="font-black text-sm text-sky-600 truncate max-w-xs">{uploadData.videoFile.name}</p>
                           <p className="text-xs font-black bg-sky-100 text-sky-600 px-3 py-1 rounded-full">Durasi: {uploadData.duration}</p>
                        </div>
                     ) : (
                        <div className="space-y-3">
                           <div className="w-16 h-16 bg-white rounded-3xl shadow-lg flex items-center justify-center mx-auto mb-2 text-sky-500">
                            <Upload size={28} />
                           </div>
                           <p className="text-sm font-black text-slate-800 tracking-tight">Klik atau seret file video</p>
                           <p className="text-xs font-bold text-slate-400">MP4, WEBM up to 500MB</p>
                        </div>
                     )}
                  </div>

                  <div className="space-y-4">
                    <input 
                      placeholder="Apa judul video menarik Anda?" 
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-black outline-none focus:border-sky-300 transition-all"
                      value={uploadData.title} onChange={(e) => setUploadData({...uploadData, title: e.target.value})}
                    />

                    <select 
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-black outline-none focus:border-sky-300 transition-all appearance-none cursor-pointer"
                      value={uploadData.category} onChange={(e) => setUploadData({...uploadData, category: e.target.value})}
                    >
                      {CATEGORIES.slice(1).map(c => <option key={c}>{c}</option>)}
                    </select>

                    <textarea 
                      placeholder="Deskripsi singkat tentang video..."
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-black outline-none h-24 focus:border-sky-300"
                      value={uploadData.description} onChange={(e) => setUploadData({...uploadData, description: e.target.value})}
                    />
                  </div>

                  <button 
                    disabled={!uploadData.videoFile || !uploadData.title}
                    onClick={handleUploadSubmit}
                    className="w-full py-5 bg-slate-800 text-white rounded-[2rem] font-black shadow-xl hover:bg-slate-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95"
                  >
                    Mulai Publikasi
                  </button>
               </div>
            </div>
          )}

          {view === 'watch' && selectedVideo && (
            <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-500">
               <button onClick={goHome} className="flex items-center gap-2 font-black text-slate-400 hover:text-slate-800 mb-4 transition-colors">
                  <ArrowLeft size={20}/> Kembali ke Eksplorasi
               </button>
               <div className="aspect-video bg-black rounded-[3rem] overflow-hidden shadow-2xl ring-8 ring-white">
                  <video src={selectedVideo.videoUrl} controls autoPlay className="w-full h-full" />
               </div>
               <div className="bg-white/90 backdrop-blur-md p-10 rounded-[3rem] shadow-sm border border-slate-100 space-y-8">
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <span className="px-3 py-1 bg-sky-100 text-sky-600 text-[10px] font-black rounded-full uppercase">{selectedVideo.category}</span>
                    </div>
                    <h1 className="text-3xl font-black text-slate-800 leading-tight">{selectedVideo.title}</h1>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-8 border-b border-slate-100">
                    <div className="flex items-center gap-4">
                       <Avatar src={selectedVideo.creatorPhoto} className="w-14 h-14 border-2 border-sky-100" />
                       <div>
                          <p className="font-black text-slate-800 flex items-center gap-1.5 text-lg">
                            {selectedVideo.creator} <CheckCircle2 size={16} className="text-blue-500"/>
                          </p>
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{selectedVideo.subscribers} Pengikut</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <button onClick={() => setIsSubscribed(!isSubscribed)} className={`flex-1 sm:flex-none px-8 py-3 rounded-2xl font-black text-xs tracking-widest transition-all ${isSubscribed ? 'bg-slate-100 text-slate-500' : 'bg-sky-500 text-white shadow-xl shadow-sky-100 hover:bg-sky-600'}`}>
                        {isSubscribed ? 'TERDAFTAR' : 'SUBSCRIBE'}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4">
                     <button onClick={() => {
                        const next = new Set(likedVideos);
                        next.has(selectedVideo.id) ? next.delete(selectedVideo.id) : next.add(selectedVideo.id);
                        setLikedVideos(next);
                     }} className={`flex items-center gap-2 px-8 py-3.5 rounded-2xl font-black text-sm border transition-all ${likedVideos.has(selectedVideo.id) ? 'bg-sky-50 border-sky-100 text-sky-600' : 'bg-slate-50 border-slate-100 hover:bg-slate-100'}`}>
                        <ThumbsUp size={18} fill={likedVideos.has(selectedVideo.id) ? "currentColor" : "none"} /> 
                        {likedVideos.has(selectedVideo.id) ? 'Disukai' : 'Suka'}
                     </button>
                     <button className="flex items-center gap-2 px-8 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-sm hover:bg-slate-100 transition-all"><Share2 size={18}/> Bagikan</button>
                  </div>

                  <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
                    <p className="font-black text-slate-800 mb-2">Deskripsi Video</p>
                    <p className="text-sm font-medium text-slate-500 leading-relaxed italic">
                      {selectedVideo.description}
                    </p>
                  </div>
               </div>
            </div>
          )}

          {view === 'profile' && (
            <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
               <div className="flex items-center gap-4">
                  <button onClick={goHome} className="p-2 hover:bg-slate-100 rounded-xl transition-all"><ArrowLeft/></button>
                  <h1 className="text-3xl font-black text-slate-800">Profil Kreator</h1>
               </div>
               <div className="bg-white/90 backdrop-blur-md p-12 rounded-[3.5rem] shadow-xl border border-slate-100 space-y-10 text-center">
                  <div className="relative w-40 h-40 mx-auto">
                     <Avatar src={userProfile.photo} className="w-full h-full shadow-2xl border-8 border-white ring-1 ring-slate-100" />
                     <label className="absolute bottom-1 right-1 p-3 bg-sky-500 text-white rounded-2xl cursor-pointer hover:bg-sky-600 transition-all shadow-xl border-4 border-white">
                        <Camera size={20}/>
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                          const file = e.target.files[0];
                          if(file) setUserProfile({...userProfile, photo: URL.createObjectURL(file)});
                        }} />
                     </label>
                  </div>
                  <div className="space-y-6">
                     <div className="text-left space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Nama Channel Publik</label>
                        <input value={userProfile.name} onChange={(e) => setUserProfile({...userProfile, name: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-black outline-none focus:border-sky-300 transition-all" />
                     </div>
                     <div className="text-left space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Tentang Channel (Bio)</label>
                        <textarea value={userProfile.bio} onChange={(e) => setUserProfile({...userProfile, bio: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-black outline-none h-32 resize-none focus:border-sky-300 transition-all" />
                     </div>
                  </div>
                  <div className="flex gap-4">
                    <button onClick={goHome} className="flex-1 py-4 bg-slate-800 text-white rounded-2xl font-black shadow-xl hover:bg-slate-900 transition-all">Simpan Perubahan</button>
                    <button onClick={() => setView('creator')} className="px-6 py-4 bg-sky-50 text-sky-600 border border-sky-100 rounded-2xl font-black hover:bg-sky-100 transition-all">Dashboard</button>
                  </div>
               </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function SidebarItem({ icon, label, active, onClick }) {
  return (
    <button 
      onClick={onClick} 
      className={`w-full flex items-center gap-4 px-5 py-4 rounded-[1.5rem] transition-all group ${
        active 
        ? 'bg-slate-900 text-white font-black shadow-xl shadow-slate-200' 
        : 'hover:bg-sky-50 text-slate-400 hover:text-sky-500 font-bold'
      }`}
    >
      <div className={`${active ? 'text-sky-400' : 'group-hover:text-sky-500'} transition-colors`}>
        {icon}
      </div>
      <span className="text-sm tracking-tight">{label}</span>
      {active && <div className="ml-auto w-1.5 h-1.5 bg-sky-400 rounded-full" />}
    </button>
  )
};
