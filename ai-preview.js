// ========================================
// AI PREVIEW TOOL
// ========================================

class AIPreview {
    constructor() {
        this.selectedModel = null;
        this.uploadedLogo = null;
        this.logoData = null;

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
                // Remove selected from all
                modelOptions.forEach(opt => opt.classList.remove('selected'));

                // Add selected to clicked
                option.classList.add('selected');
                this.selectedModel = option.dataset.model;

                // Show step 2
                document.getElementById('step2').style.display = 'block';

                // Smooth scroll to step 2
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
        const logoPreview = document.getElementById('uploadedLogoPreview');
        const removeBtn = document.getElementById('removeLogo');
        const generateBtn = document.getElementById('generateBtn');

        // Click to upload
        fileInput.addEventListener('change', (e) => {
            this.handleFileUpload(e.target.files[0]);
        });

        // Drag and drop
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

            const file = e.dataTransfer.files[0];
            this.handleFileUpload(file);
        });

        // Remove logo
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

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            alert('Arquivo muito grande! Tamanho máximo: 5MB');
            return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Por favor, envie apenas imagens (PNG, JPG, SVG)');
            return;
        }

        // Read file
        const reader = new FileReader();
        reader.onload = (e) => {
            this.logoData = e.target.result;
            this.uploadedLogo = file;

            // Show preview
            const logoPreview = document.getElementById('uploadedLogoPreview');
            const logoThumb = document.getElementById('logoThumb');
            const uploadArea = document.querySelector('.upload-area-ai');
            const generateBtn = document.getElementById('generateBtn');

            logoPreview.src = this.logoData;
            logoThumb.style.display = 'block';
            uploadArea.style.display = 'none';
            generateBtn.style.display = 'inline-flex';
        };
        reader.readAsDataURL(file);
    }

    setupGeneration() {
        const generateBtn = document.getElementById('generateBtn');
        const regenerateBtn = document.getElementById('regenerateBtn');

        generateBtn.addEventListener('click', () => {
            this.generateAIImages();
        });

        regenerateBtn.addEventListener('click', () => {
            this.generateAIImages();
        });
    }

    async generateAIImages() {
        // Show step 3
        document.getElementById('step3').style.display = 'block';
        document.getElementById('generationStatus').style.display = 'block';
        document.getElementById('aiResults').style.display = 'none';

        // Scroll to step 3
        setTimeout(() => {
            document.getElementById('step3').scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }, 300);

        // Simulate AI generation (3 seconds)
        await new Promise(resolve => setTimeout(resolve, 3000));

        // For now, we'll use placeholder images
        // In production, you would call an AI API here (Replicate, Stability AI, etc.)
        this.displayResults();
    }

    displayResults() {
        const generationStatus = document.getElementById('generationStatus');
        const aiResults = document.getElementById('aiResults');

        generationStatus.style.display = 'none';
        aiResults.style.display = 'block';

        // In a real implementation, you would:
        // 1. Send the logo + model selection to your backend
        // 2. Backend calls AI API (Replicate Flux, Stability AI, etc.)
        // 3. AI generates 4 images with different prompts:
        //    - "Person wearing [model] cap with [logo], realistic photo"
        //    - "[Model] cap on table, product photography"
        //    - "Close-up of [model] cap, side view, detailed"
        //    - "Mannequin wearing [model] cap, retail display"
        // 4. Display the generated images

        // For demo purposes, we'll show the uploaded logo in placeholders
        const results = ['result1', 'result2', 'result3', 'result4'];
        results.forEach(id => {
            const resultDiv = document.getElementById(id);
            const placeholder = resultDiv.querySelector('.result-placeholder');

            // Create a composite image (logo on placeholder background)
            placeholder.innerHTML = `
                <div style="position: relative; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #1E1E1E 0%, #0A0A0A 100%);">
                    <img src="${this.logoData}" style="max-width: 60%; max-height: 60%; object-fit: contain; opacity: 0.9;">
                    <div style="position: absolute; bottom: 10px; left: 10px; background: rgba(0,217,142,0.1); padding: 8px 12px; border-radius: 6px; border: 1px solid rgba(0,217,142,0.3);">
                        <small style="color: #00D98E; font-size: 0.75rem; font-weight: 600;">Visualização Simulada</small>
                    </div>
                </div>
            `;
        });

        // Show message about real AI integration
        const resultsGrid = document.querySelector('.results-grid');
        if (!document.querySelector('.ai-demo-notice')) {
            const notice = document.createElement('div');
            notice.className = 'ai-demo-notice';
            notice.style.cssText = `
                grid-column: 1 / -1;
                padding: var(--spacing-lg);
                background: rgba(0, 217, 142, 0.1);
                border: 1px solid rgba(0, 217, 142, 0.3);
                border-radius: var(--radius-md);
                text-align: center;
                margin-bottom: var(--spacing-md);
            `;
            notice.innerHTML = `
                <p style="color: var(--color-primary); font-weight: 600; margin-bottom: var(--spacing-xs);">
                    🚀 Demonstração do Sistema de IA
                </p>
                <p style="color: var(--color-text-light); font-size: 0.875rem;">
                    Nas visualizações acima mostramos sua logo. Na versão completa, nossa IA gerará imagens fotorrealistas do boné ${this.selectedModel} com sua logo em 4 contextos diferentes: pessoa usando, produto em mesa, close-up lateral e display/manequim.
                </p>
            `;
            resultsGrid.insertBefore(notice, resultsGrid.firstChild);
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AIPreview();
});
