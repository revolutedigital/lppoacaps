// ========================================
// AI PREVIEW TOOL - PRODUCTION VERSION
// Using Replicate Flux Schnell (cheapest & fast)
// Cost: ~$0.003/image = $0.012 for 4 images
// ========================================

class AIPreview {
    constructor() {
        this.selectedModel = null;
        this.selectedColor = 'preto';
        this.uploadedLogo = null;
        this.logoData = null;

        // Replicate API (você vai precisar de um backend proxy para não expor a API key)
        this.API_ENDPOINT = 'https://your-backend.com/api/generate'; // Substitua pelo seu backend

        // Model descriptions for prompts
        this.modelDescriptions = {
            trucker: 'trucker snapback cap with mesh back panel',
            americano: 'classic baseball cap, full fabric, structured crown',
            camurca: 'premium suede cap, soft texture, luxury finish'
        };

        this.init();
    }

    init() {
        this.setupModelSelection();
        this.setupLogoUpload();
        this.setupGeneration();
    }

    setupModelSelection() {
        const modelOptions = document.querySelectorAll('.model-option');

        modelOptions.forEach(option => {
            option.addEventListener('click', () => {
                modelOptions.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                this.selectedModel = option.dataset.model;

                document.getElementById('step2').style.display = 'block';
                setTimeout(() => {
                    document.getElementById('step2').scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                }, 300);
            });
        });
    }

    setupLogoUpload() {
        const fileInput = document.getElementById('logoFileInput');
        const uploadZone = document.getElementById('uploadZone');
        const uploadArea = uploadZone.querySelector('.upload-area-ai');
        const logoThumb = document.getElementById('logoThumb');
        const removeBtn = document.getElementById('removeLogo');
        const generateBtn = document.getElementById('generateBtn');

        fileInput.addEventListener('change', (e) => {
            this.handleFileUpload(e.target.files[0]);
        });

        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = 'var(--color-primary)';
            uploadArea.style.background = 'rgba(0, 217, 142, 0.1)';
        });

        uploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = 'var(--color-border)';
            uploadArea.style.background = 'var(--color-bg-primary)';
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = 'var(--color-border)';
            uploadArea.style.background = 'var(--color-bg-primary)';
            this.handleFileUpload(e.dataTransfer.files[0]);
        });

        removeBtn.addEventListener('click', () => {
            this.uploadedLogo = null;
            this.logoData = null;
            logoThumb.style.display = 'none';
            uploadArea.style.display = 'flex';
            generateBtn.style.display = 'none';
            fileInput.value = '';
        });
    }

    handleFileUpload(file) {
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            alert('Arquivo muito grande! Máximo: 5MB');
            return;
        }

        if (!file.type.startsWith('image/')) {
            alert('Envie apenas imagens (PNG, JPG, SVG)');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            this.logoData = e.target.result;
            this.uploadedLogo = file;

            document.getElementById('uploadedLogoPreview').src = this.logoData;
            document.getElementById('logoThumb').style.display = 'block';
            document.querySelector('.upload-area-ai').style.display = 'none';
            document.getElementById('generateBtn').style.display = 'inline-flex';
        };
        reader.readAsDataURL(file);
    }

    setupGeneration() {
        document.getElementById('generateBtn').addEventListener('click', () => this.generateAIImages());
        document.getElementById('regenerateBtn').addEventListener('click', () => this.generateAIImages());
    }

    // ========================================
    // PROMPTS OTIMIZADOS - ENTERPRISE LEVEL
    // Estratégia: Prompts curtos e específicos
    // Menos tokens = menor custo = mais rápido
    // ========================================

    getOptimizedPrompts() {
        const cap = this.modelDescriptions[this.selectedModel];

        // PROMPTS ULTRA-OTIMIZADOS (40-60 tokens cada)
        // Técnica: Começar com o objeto principal, contexto mínimo, estilo no final
        return [
            {
                id: 'result1',
                context: 'Uso Real',
                // Prompt 1: Pessoa usando (lifestyle)
                prompt: `${cap}, custom embroidered logo on front, worn by young professional, outdoor urban setting, natural daylight, lifestyle photography, shallow depth of field, 8k`
            },
            {
                id: 'result2',
                context: 'Product Shot',
                // Prompt 2: Produto em mesa (e-commerce)
                prompt: `${cap}, embroidered logo centered, floating on clean white background, soft studio lighting, product photography, commercial catalog style, high detail, 8k`
            },
            {
                id: 'result3',
                context: 'Close-up',
                // Prompt 3: Close-up do bordado (detalhe)
                prompt: `${cap}, macro close-up of embroidered logo detail, stitching texture visible, dramatic side lighting, extreme detail, professional product photo, 8k`
            },
            {
                id: 'result4',
                context: 'Display',
                // Prompt 4: Manequim/display (retail)
                prompt: `${cap}, on mannequin head display, retail store setting, soft ambient lighting, merchandise presentation, clean background, commercial photography, 8k`
            }
        ];
    }

    async generateAIImages() {
        document.getElementById('step3').style.display = 'block';
        document.getElementById('generationStatus').style.display = 'block';
        document.getElementById('aiResults').style.display = 'none';

        setTimeout(() => {
            document.getElementById('step3').scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);

        const prompts = this.getOptimizedPrompts();

        // MODO DEMO: Simula a geração (remova isso quando tiver o backend)
        if (!this.API_ENDPOINT || this.API_ENDPOINT.includes('your-backend')) {
            await this.simulateGeneration(prompts);
            return;
        }

        // MODO PRODUÇÃO: Chama a API real
        try {
            const results = await Promise.all(
                prompts.map(p => this.callReplicateAPI(p.prompt))
            );
            this.displayRealResults(prompts, results);
        } catch (error) {
            console.error('Erro na geração:', error);
            this.displayError();
        }
    }

    // ========================================
    // INTEGRAÇÃO COM REPLICATE API
    // Modelo: Flux Schnell (mais barato)
    // ========================================

    async callReplicateAPI(prompt) {
        const response = await fetch(this.API_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt: prompt,
                logo_image: this.logoData, // Base64 da logo
                model: 'flux-schnell', // Mais barato: ~$0.003/imagem
                // Parâmetros otimizados para custo
                num_inference_steps: 4, // Mínimo para Schnell
                guidance_scale: 0, // Schnell não usa guidance
                width: 1024,
                height: 1024,
                output_format: 'webp', // Menor, mais rápido
                output_quality: 80 // Bom o suficiente
            })
        });

        if (!response.ok) throw new Error('API Error');
        const data = await response.json();
        return data.image_url;
    }

    displayRealResults(prompts, imageUrls) {
        document.getElementById('generationStatus').style.display = 'none';
        document.getElementById('aiResults').style.display = 'block';

        prompts.forEach((p, index) => {
            const resultDiv = document.getElementById(p.id);
            resultDiv.innerHTML = `
                <img src="${imageUrls[index]}" alt="${p.context}" style="width:100%;height:100%;object-fit:cover;">
            `;
        });
    }

    // ========================================
    // MODO DEMONSTRAÇÃO (sem API)
    // ========================================

    async simulateGeneration(prompts) {
        // Simula tempo de geração
        await new Promise(resolve => setTimeout(resolve, 2500));

        document.getElementById('generationStatus').style.display = 'none';
        document.getElementById('aiResults').style.display = 'block';

        // Mostra placeholders com a logo do usuário
        prompts.forEach(p => {
            const resultDiv = document.getElementById(p.id);
            const placeholder = resultDiv.querySelector('.result-placeholder');

            placeholder.innerHTML = `
                <div style="position:relative;width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f0f23 100%);">
                    <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;">
                        <img src="${this.logoData}" style="max-width:120px;max-height:80px;object-fit:contain;margin-bottom:12px;filter:drop-shadow(0 4px 12px rgba(0,217,142,0.3));">
                        <div style="background:rgba(0,0,0,0.6);padding:8px 16px;border-radius:20px;backdrop-filter:blur(4px);">
                            <small style="color:#00D98E;font-size:0.7rem;font-weight:600;text-transform:uppercase;letter-spacing:1px;">${p.context}</small>
                        </div>
                    </div>
                    <div style="position:absolute;bottom:12px;right:12px;background:rgba(0,217,142,0.15);padding:6px 10px;border-radius:6px;border:1px solid rgba(0,217,142,0.3);">
                        <small style="color:#00D98E;font-size:0.65rem;font-weight:600;">PREVIEW</small>
                    </div>
                </div>
            `;
        });

        // Adiciona notice explicativo
        this.addDemoNotice();
    }

    addDemoNotice() {
        const resultsGrid = document.querySelector('.results-grid');
        if (document.querySelector('.ai-demo-notice')) return;

        const notice = document.createElement('div');
        notice.className = 'ai-demo-notice';
        notice.style.cssText = `
            grid-column: 1 / -1;
            padding: 20px;
            background: linear-gradient(135deg, rgba(0,217,142,0.1) 0%, rgba(0,217,142,0.05) 100%);
            border: 1px solid rgba(0,217,142,0.3);
            border-radius: 12px;
            text-align: center;
            margin-bottom: 16px;
        `;
        notice.innerHTML = `
            <div style="display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:8px;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00D98E" stroke-width="2">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                </svg>
                <span style="color:#00D98E;font-weight:700;font-size:0.95rem;">Prévia da Sua Logo</span>
            </div>
            <p style="color:#B5B5B5;font-size:0.85rem;line-height:1.5;max-width:500px;margin:0 auto;">
                Acima você vê sua logo aplicada. Ao fazer o pedido, nossa equipe criará mockups profissionais do seu boné <strong style="color:#fff;">${this.selectedModel}</strong> personalizado!
            </p>
        `;
        resultsGrid.insertBefore(notice, resultsGrid.firstChild);
    }

    displayError() {
        document.getElementById('generationStatus').innerHTML = `
            <div style="color:#ff4444;text-align:center;padding:40px;">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-bottom:16px;">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                <p style="font-weight:600;margin-bottom:8px;">Erro ao gerar imagens</p>
                <p style="font-size:0.875rem;opacity:0.8;">Tente novamente ou entre em contato pelo WhatsApp</p>
            </div>
        `;
    }
}

// ========================================
// BACKEND EXAMPLE (Node.js/Express)
// Coloque isso em seu servidor
// ========================================
/*
const Replicate = require('replicate');

const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN, // Sua API key
});

app.post('/api/generate', async (req, res) => {
    try {
        const { prompt, num_inference_steps, width, height, output_format, output_quality } = req.body;

        const output = await replicate.run(
            "black-forest-labs/flux-schnell", // Modelo mais barato
            {
                input: {
                    prompt: prompt,
                    num_inference_steps: num_inference_steps || 4,
                    width: width || 1024,
                    height: height || 1024,
                    output_format: output_format || "webp",
                    output_quality: output_quality || 80,
                    disable_safety_checker: true
                }
            }
        );

        res.json({ image_url: output[0] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Custo estimado por geração:
// - Flux Schnell: ~$0.003/imagem
// - 4 imagens por usuário: ~$0.012 (R$ 0,07)
// - 1000 usuários/mês: ~$12 (R$ 70)
*/

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    new AIPreview();
});
