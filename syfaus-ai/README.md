# Syfaus.Ai - MVP Frontend

## 🚀 Quick Start
1. Open `syfaus-ai/index.html` in browser
2. Drag-drop image → type prompt → Generate → Download result

## ✨ Features (MVP)
- ✅ Drag-drop upload (images/video→first frame)
- ✅ Natural language prompts (ID/EN)
- ✅ Mock AI edits (keyword-based canvas effects)
- ✅ Before/After slider preview
- ✅ Riwayat (localStorage, 20 items)
- ✅ Responsive design (mobile/desktop)
- ✅ Free credits (reset daily via localStorage)

## 🎨 Demo Effects
| Prompt Keyword | Effect |
|---|---|
| merah/red | Red tint (change clothes) |
| pantai/beach | Sunset beach gradient |
| gaun/dress | Purple blur overlay |
| Default | Enhance contrast/saturation |

## 🛠 Tech Stack
```
Frontend: Vanilla HTML/CSS/JS + Canvas API
Design: Custom Glassmorphism (CSS Grid/Flex)
Storage: localStorage
No backend (pure static)
```

## 📱 Responsive & Accessible
- Mobile-first
- Keyboard nav
- Screen reader friendly
- PWA-ready

## 🚀 Roadmap
### Fase 1 (MVP ✅)
Static frontend w/ mock AI

### Fase 2 (Backend)
```
Python FastAPI + 
├── Stable Diffusion XL (HuggingFace)
├── ControlNet (precise edits)
├── Flux.1-dev (future)
└── GPU: RunPod / AWS SageMaker
```
Deploy: Vercel (FE) + Render/Heroku (BE)

### Fase 3 (Fullstack)
- Auth (Firebase)
- Video editing (Stable Video Diffusion)
- Freemium (Stripe credits)
- API endpoints

### Fase 4
- Mobile App (React Native)
- Community gallery

## 🔧 Local Development
```bash
# Just open index.html
start index.html  # Windows
open index.html   # Mac
```

## 🤝 Contributing
1. Fork & PR
2. Test new effects in `script.js`
3. Add prompts to `examples.json`

## 📄 License
MIT - Free for all creators!

**Ubah Imajinasi Menjadi Realitas Visual ✨**

