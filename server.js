// ========================================
// POA CAPS - Server with Replicate API Proxy
// Resolve CORS issues for AI image generation
// ========================================

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.static('.'));

// Replicate API Token (REQUIRED - set in Railway environment variables)
const REPLICATE_TOKEN = process.env.REPLICATE_TOKEN;

if (!REPLICATE_TOKEN) {
    console.warn('⚠️  REPLICATE_TOKEN not set. AI generation will not work.');
}

// ========================================
// API PROXY ENDPOINT
// ========================================

// Generate cap image using SDXL Lightning (fast & cheap)
// Logo will be composited on frontend using Canvas for pixel-perfect accuracy
app.post('/api/generate', async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        console.log('Creating prediction with prompt:', prompt.substring(0, 50) + '...');

        // Use SDXL Lightning - $0.003/image, fast (~1-2 seconds)
        const response = await fetch('https://api.replicate.com/v1/predictions', {
            method: 'POST',
            headers: {
                'Authorization': `Token ${REPLICATE_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                version: "5599ed30703defd1d160a25a63321b4dec97101d98b4674bcc56e41f62f35637",
                input: {
                    prompt: prompt,
                    num_outputs: 1,
                    aspect_ratio: "1:1",
                    output_format: "png", // PNG for better quality compositing
                    output_quality: 90,
                    num_inference_steps: 4
                }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Replicate API error:', errorText);
            return res.status(response.status).json({ error: 'Failed to create prediction', details: errorText });
        }

        const prediction = await response.json();
        console.log('Prediction created:', prediction.id);
        res.json(prediction);

    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: 'Internal server error', message: error.message });
    }
});

// Poll prediction status
app.get('/api/prediction/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const response = await fetch(`https://api.replicate.com/v1/predictions/${id}`, {
            headers: {
                'Authorization': `Token ${REPLICATE_TOKEN}`,
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            return res.status(response.status).json({ error: 'Failed to get prediction', details: errorText });
        }

        const result = await response.json();
        res.json(result);

    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: 'Internal server error', message: error.message });
    }
});

// ========================================
// IMAGE PROXY - Resolve CORS for Canvas
// ========================================

app.get('/api/proxy-image', async (req, res) => {
    try {
        const imageUrl = req.query.url;
        if (!imageUrl) {
            return res.status(400).json({ error: 'URL is required' });
        }

        console.log('Proxying image:', imageUrl.substring(0, 50) + '...');

        const response = await fetch(imageUrl);
        if (!response.ok) {
            return res.status(response.status).json({ error: 'Failed to fetch image' });
        }

        const buffer = await response.arrayBuffer();
        const contentType = response.headers.get('content-type') || 'image/png';

        res.setHeader('Content-Type', contentType);
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.send(Buffer.from(buffer));

    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).json({ error: 'Failed to proxy image' });
    }
});

// ========================================
// SERVE STATIC FILES
// ========================================

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 POA Caps server running on port ${PORT}`);
    console.log(`📍 Local: http://localhost:${PORT}`);
});
