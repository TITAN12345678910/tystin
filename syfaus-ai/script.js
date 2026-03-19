// Syfaus.Ai Frontend MVP - Mock AI Editing with Canvas Effects
// Keywords trigger effects: 'merah'→red tint, 'pantai'→beach bg, 'gaun'→blur+overlay, etc.

class SyfausAI {
    constructor() {
        this.originalCanvas = document.getElementById('originalCanvas');
        this.originalCtx = this.originalCanvas.getContext('2d');
        this.resultCanvas = document.getElementById('resultCanvas');
        this.resultCtx = this.resultCanvas.getContext('2d');
        this.originalImage = null;
        this.originalVideo = document.getElementById('originalVideo');
        this.currentPrompt = '';
        this.credits = 10;
        this.history = JSON.parse(localStorage.getItem('syfaus_history')) || [];
        this.isProcessing = false;
        this.sliderHandle = document.querySelector('.slider-handle');
        this.splitPosition = 0.5;

        this.init();
    }

    init() {
        this.setupDragDrop();
        this.setupSlider();
        this.updateCredits();
        this.renderHistory();
        this.loadExamples();
    }

    setupDragDrop() {
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');

        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, preventDefaults, false);
        });

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        ['dragenter', 'dragover'].forEach(eventName => {
            uploadArea.addEventListener(eventName, () => uploadArea.classList.add('dragover'), false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, () => uploadArea.classList.remove('dragover'), false);
        });

        uploadArea.addEventListener('drop', handleDrop, false);
        fileInput.addEventListener('change', handleFileSelect);

        function handleDrop(e) {
            const files = e.dataTransfer.files;
            handleFiles(files);
        }

        function handleFileSelect(e) {
            handleFiles(e.target.files);
        }

        function handleFiles(files) {
            const file = files[0];
            if (file && (file.type.startsWith('image/') || file.type.startsWith('video/'))) {
                syfaus.loadMedia(file);
            }
        }
    }

    async loadMedia(file) {
        if (file.type.startsWith('image/')) {
            const img = new Image();
            img.onload = () => {
                this.originalImage = img;
                this.setupCanvas(this.originalCanvas, img);
                document.getElementById('originalPreview').classList.remove('hidden');
                document.getElementById('promptInput').focus();
                this.showGenerateBtn();
            };
            img.src = URL.createObjectURL(file);
        } else {
            // Video support (mock first frame)
            this.originalVideo.src = URL.createObjectURL(file);
            this.originalVideo.onloadeddata = () => {
                this.originalVideo.currentTime = 1; // Second frame
                this.originalVideo.onseeked = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = this.originalVideo.videoWidth;
                    canvas.height = this.originalVideo.videoHeight;
                    canvas.getContext('2d').drawImage(this.originalVideo, 0, 0);
                    const img = new Image();
                    img.src = canvas.toDataURL();
                    img.onload = () => {
                        this.originalImage = img;
                        this.setupCanvas(this.originalCanvas, img);
                        document.getElementById('originalPreview').classList.remove('hidden');
                        this.originalVideo.classList.remove('hidden');
                        this.showGenerateBtn();
                    };
                };
            };
        }
    }

    setupCanvas(canvas, img) {
        canvas.width = Math.min(img.width, 500);
        canvas.height = (img.height / img.width) * canvas.width;
        this.originalCtx.drawImage(img, 0, 0, canvas.width, canvas.height);
    }

    showGenerateBtn() {
        document.getElementById('generateBtn').classList.remove('hidden');
        document.getElementById('regenerateBtn').classList.add('hidden');
    }

    async generateEdit() {
        if (this.isProcessing) return;
        
        this.isProcessing = true;
        const btn = document.getElementById('generateBtn');
        const text = document.getElementById('generateText');
        const spinner = document.getElementById('loadingSpinner');
        
        text.textContent = 'Memproses AI...';
        spinner.classList.remove('hidden');
        btn.disabled = true;

        this.currentPrompt = document.getElementById('promptInput').value.toLowerCase();

        // Simulate AI processing (2-4s)
        await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 2000));

        // Mock AI effects based on keywords
        this.applyMockAIEffect();

        // Update UI
        document.getElementById('resultsSection').classList.remove('hidden');
        document.getElementById('historySidebar').classList.remove('hidden');
        document.getElementById('regenerateBtn').classList.remove('hidden');
        btn.disabled = false;
        text.textContent = 'Generate Ulang';
        spinner.classList.add('hidden');
        this.useCredit();

        this.saveToHistory();
    }

    applyMockAIEffect() {
        const ctx = this.resultCtx;
        const width = this.originalCanvas.width;
        const height = this.originalCanvas.height;
        
        this.resultCanvas.width = width;
        this.resultCanvas.height = height;
        
        // Copy original
        ctx.drawImage(this.originalCanvas, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;

        // Keyword-based effects
        if (this.currentPrompt.includes('merah') || this.currentPrompt.includes('red')) {
            // Red tint (change clothes sim)
            for (let i = 0; i < data.length; i += 4) {
                data[i] = Math.min(255, data[i] * 1.4);     // R boost
                data[i + 1] *= 0.7;                          // G reduce
                data[i + 2] *= 0.7;                          // B reduce
            }
        } else if (this.currentPrompt.includes('pantai') || this.currentPrompt.includes('beach')) {
            // Beach sunset gradient bg (simple overlay)
            const gradient = ctx.createLinearGradient(0, 0, 0, height);
            gradient.addColorStop(0, 'rgba(255, 193, 7, 0.8)');
            gradient.addColorStop(0.5, 'rgba(245, 101, 101, 0.8)');
            gradient.addColorStop(1, 'rgba(120, 119, 198, 0.8)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);
            ctx.globalCompositeOperation = 'multiply';
            ctx.drawImage(this.originalCanvas, 0, 0);
            ctx.globalCompositeOperation = 'source-over';
        } else if (this.currentPrompt.includes('gaun') || this.currentPrompt.includes('dress')) {
            // Dress effect: selective blur + purple tint
            ctx.filter = 'blur(3px) contrast(1.2)';
            ctx.drawImage(this.originalCanvas, 0, height * 0.3, width, height * 0.4);
            ctx.filter = 'none';
            // Purple overlay
            ctx.fillStyle = 'rgba(168, 85, 247, 0.3)';
            ctx.fillRect(0, height * 0.3, width, height * 0.4);
        } else {
            // Default: enhance + random effect
            ctx.filter = 'contrast(1.1) brightness(1.05) saturate(1.2)';
            ctx.drawImage(this.originalCanvas, 0, 0);
            ctx.filter = 'none';
        }

        ctx.putImageData(imageData, 0, 0);
    }

    regenerateEdit() {
        this.generateEdit();
    }

    setupSlider() {
        let isDragging = false;

        this.sliderHandle.addEventListener('mousedown', (e) => {
            isDragging = true;
            document.addEventListener('mousemove', handleMove);
            document.addEventListener('mouseup', handleUp);
        });

        function handleMove(e) {
            if (!isDragging) return;
            const rect = document.querySelector('.before-after-slider').getBoundingClientRect();
            const x = e.clientX - rect.left;
            syfaus.splitPosition = Math.max(0, Math.min(1, x / rect.width));
            syfaus.updateSliderMask();
        }

        function handleUp() {
            isDragging = false;
            document.removeEventListener('mousemove', handleMove);
            document.removeEventListener('mouseup', handleUp);
        }
    }

    updateSliderMask() {
        const ctx = this.resultCtx;
        const width = this.resultCanvas.width;
        const splitX = width * this.splitPosition;

        // Draw mask effect
        ctx.save();
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.rect(splitX, 0, width - splitX, this.resultCanvas.height);
        ctx.fill();
        ctx.restore();
    }

    useCredit() {
        if (this.credits > 0) {
            this.credits--;
            localStorage.setItem('syfaus_credits', this.credits);
            this.updateCredits();
        }
    }

    updateCredits() {
        document.getElementById('credits').textContent = this.credits;
    }

    saveToHistory() {
        const item = {
            id: Date.now(),
            prompt: this.currentPrompt.substring(0, 50) + '...',
            timestamp: new Date().toLocaleString('id-ID'),
            preview: this.resultCanvas.toDataURL('image/jpeg', 0.8)
        };
        this.history.unshift(item);
        if (this.history.length > 20) this.history = this.history.slice(0, 20);
        localStorage.setItem('syfaus_history', JSON.stringify(this.history));
        this.renderHistory();
    }

    renderHistory() {
        const container = document.getElementById('historyList');
        container.innerHTML = this.history.map(item => `
            <div class="history-item" onclick="syfaus.loadHistoryItem('${item.id}')">
                <img src="${item.preview}" alt="Preview">
                <div class="history-info">
                    <h4>${item.prompt}</h4>
                    <p>${item.timestamp}</p>
                </div>
            </div>
        `).join('');
    }

    loadHistoryItem(id) {
        const item = this.history.find(h => h.id == id);
        if (item) {
            // Load preview to result canvas
            const img = new Image();
            img.onload = () => {
                this.resultCanvas.width = 500;
                this.resultCanvas.height = 400;
                this.resultCtx.drawImage(img, 0, 0, 500, 400);
            };
            img.src = item.preview;
        }
    }

    clearHistory() {
        this.history = [];
        localStorage.removeItem('syfaus_history');
        this.renderHistory();
    }

    loadExamples() {
        fetch('examples.json')
            .then(r => r.json())
            .then(examples => {
                const container = document.getElementById('promptExamples');
                container.innerHTML = examples.map(ex => 
                    `<button onclick="setPrompt('${ex}')">${ex}</button>`
                ).join('');
                container.classList.toggle('hidden');
            })
            .catch(() => {
                // Fallback examples
                const fallback = [
                    'Ganti baju menjadi gaun merah elegan',
                    'Ubah latar belakang menjadi pantai saat sunset',
                    'Ubah rambut menjadi pirang panjang bergelombang',
                    'Tambahkan kacamata hitam dan topi fedora',
                    'Ubah menjadi gaya anime chibi'
                ];
                document.getElementById('promptExamples').innerHTML = 
                    fallback.map(ex => `<button onclick="setPrompt('${ex}')">${ex}</button>`).join('');
                document.getElementById('promptExamples').classList.remove('hidden');
            });
    }
}

const syfaus = new SyfausAI();

function startEditing() {
    document.querySelector('.hero').classList.add('hidden');
    document.getElementById('editor').classList.remove('hidden');
}

function setPrompt(prompt) {
    document.getElementById('promptInput').value = prompt;
    document.getElementById('promptInput').focus();
}

function downloadResult() {
    const link = document.createElement('a');
    link.download = `syfaus-edit-${Date.now()}.png`;
    link.href = syfaus.resultCanvas.toDataURL('image/png');
    link.click();
}

document.getElementById('downloadBtn').onclick = downloadResult;
