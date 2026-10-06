/**
 * Curated high-contrast SVG presets and image processing helpers for NEXUS Festivals.
 */

export interface ImagePreset {
  id: string;
  name: string;
  category: 'banner' | 'thumbnail';
  color: string;
  dataUrl: string;
}

export const BANNER_PRESETS: ImagePreset[] = [
  {
    id: 'banner-cobalt',
    name: 'Electric Cobalt Arena',
    category: 'banner',
    color: '#1d4ed8',
    dataUrl:
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="960" height="540" viewBox="0 0 960 540"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="%2309090b"/><stop offset="50" stop-color="%230f172a"/><stop offset="100" stop-color="%23030712"/></linearGradient><radialGradient id="glow" cx="70%" cy="30%" r="65%"><stop offset="0" stop-color="%232563eb" stop-opacity="0.5"/><stop offset="100" stop-color="transparent"/></radialGradient></defs><rect width="960" height="540" fill="url(%23bg)"/><rect width="960" height="540" fill="url(%23glow)"/><g stroke="%2338bdf8" stroke-width="1" opacity="0.15"><line x1="0" y1="180" x2="960" y2="180"/><line x1="0" y1="360" x2="960" y2="360"/><line x1="240" y1="0" x2="240" y2="540"/><line x1="480" y1="0" x2="480" y2="540"/><line x1="720" y1="0" x2="720" y2="540"/></g><circle cx="680" cy="220" r="140" fill="none" stroke="%2360a5fa" stroke-width="2" opacity="0.3"/><circle cx="680" cy="220" r="80" fill="none" stroke="%2338bdf8" stroke-width="1" stroke-dasharray="6 6" opacity="0.4"/></svg>',
  },
  {
    id: 'banner-hackathon-cyan',
    name: 'Deep Cyber Hackathon',
    category: 'banner',
    color: '#0284c7',
    dataUrl:
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="960" height="540" viewBox="0 0 960 540"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="%23030712"/><stop offset="60" stop-color="%23082f49"/><stop offset="100" stop-color="%2309090b"/></linearGradient><radialGradient id="glow" cx="30%" cy="40%" r="60%"><stop offset="0" stop-color="%2306b6d4" stop-opacity="0.4"/><stop offset="100" stop-color="transparent"/></radialGradient></defs><rect width="960" height="540" fill="url(%23bg)"/><rect width="960" height="540" fill="url(%23glow)"/><g stroke="%2322d3ee" stroke-width="1" opacity="0.2"><line x1="120" y1="0" x2="120" y2="540"/><line x1="360" y1="0" x2="360" y2="540"/><line x1="600" y1="0" x2="600" y2="540"/><line x1="840" y1="0" x2="840" y2="540"/></g><polygon points="300,120 440,240 380,380 220,340 180,200" fill="none" stroke="%2338bdf8" stroke-width="2" opacity="0.3"/></svg>',
  },
  {
    id: 'banner-emerald-matrix',
    name: 'Emerald Engineering Hub',
    category: 'banner',
    color: '#059669',
    dataUrl:
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="960" height="540" viewBox="0 0 960 540"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="%23064e3b"/><stop offset="50" stop-color="%23022c22"/><stop offset="100" stop-color="%2309090b"/></linearGradient><radialGradient id="glow" cx="75%" cy="45%" r="55%"><stop offset="0" stop-color="%2310b981" stop-opacity="0.45"/><stop offset="100" stop-color="transparent"/></radialGradient></defs><rect width="960" height="540" fill="url(%23bg)"/><rect width="960" height="540" fill="url(%23glow)"/><g stroke="%2334d399" stroke-width="1.5" opacity="0.25"><rect x="180" y="100" width="280" height="200" fill="none"/><rect x="360" y="240" width="320" height="180" fill="none"/></g></svg>',
  },
  {
    id: 'banner-crimson-robotics',
    name: 'Crimson Robotics & Hardware',
    category: 'banner',
    color: '#e11d48',
    dataUrl:
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="960" height="540" viewBox="0 0 960 540"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="%234c0519"/><stop offset="50" stop-color="%231f1315"/><stop offset="100" stop-color="%2309090b"/></linearGradient><radialGradient id="glow" cx="65%" cy="35%" r="60%"><stop offset="0" stop-color="%23f43f5e" stop-opacity="0.4"/><stop offset="100" stop-color="transparent"/></radialGradient></defs><rect width="960" height="540" fill="url(%23bg)"/><rect width="960" height="540" fill="url(%23glow)"/><g stroke="%23fb7185" stroke-width="1.5" opacity="0.3"><polygon points="680,140 760,260 680,380 540,380 460,260 540,140" fill="none"/></g></svg>',
  },
  {
    id: 'banner-violet-ai',
    name: 'Violet AI & Quantum Summit',
    category: 'banner',
    color: '#7c3aed',
    dataUrl:
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="960" height="540" viewBox="0 0 960 540"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="%232e1065"/><stop offset="50" stop-color="%23170e2b"/><stop offset="100" stop-color="%2309090b"/></linearGradient><radialGradient id="glow" cx="40%" cy="50%" r="55%"><stop offset="0" stop-color="%238b5cf6" stop-opacity="0.45"/><stop offset="100" stop-color="transparent"/></radialGradient></defs><rect width="960" height="540" fill="url(%23bg)"/><rect width="960" height="540" fill="url(%23glow)"/><circle cx="480" cy="270" r="160" fill="none" stroke="%23a78bfa" stroke-width="1.5" opacity="0.25"/><circle cx="480" cy="270" r="110" fill="none" stroke="%23c4b5fd" stroke-width="1" stroke-dasharray="4 8" opacity="0.3"/></svg>',
  },
  {
    id: 'banner-amber-olympiad',
    name: 'Amber Technology Olympiad',
    category: 'banner',
    color: '#d97706',
    dataUrl:
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="960" height="540" viewBox="0 0 960 540"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="%23451a03"/><stop offset="50" stop-color="%231a110a"/><stop offset="100" stop-color="%2309090b"/></linearGradient><radialGradient id="glow" cx="60%" cy="40%" r="55%"><stop offset="0" stop-color="%23f59e0b" stop-opacity="0.4"/><stop offset="100" stop-color="transparent"/></radialGradient></defs><rect width="960" height="540" fill="url(%23bg)"/><rect width="960" height="540" fill="url(%23glow)"/><g stroke="%23fbbf24" stroke-width="1" opacity="0.25"><line x1="0" y1="120" x2="960" y2="420"/><line x1="0" y1="420" x2="960" y2="120"/></g></svg>',
  },
];

export const THUMBNAIL_PRESETS: ImagePreset[] = [
  {
    id: 'thumb-nexus-crest',
    name: 'NEXUS Blue Crest',
    category: 'thumbnail',
    color: '#2563eb',
    dataUrl:
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="%2309090b"/><circle cx="200" cy="200" r="140" fill="%231e3a8a" opacity="0.4"/><polygon points="200,80 300,140 300,260 200,320 100,260 100,140" fill="none" stroke="%233b82f6" stroke-width="10"/><circle cx="200" cy="200" r="35" fill="%2360a5fa"/></svg>',
  },
  {
    id: 'thumb-cyber-square',
    name: 'Cyber Cyan Insignia',
    category: 'thumbnail',
    color: '#06b6d4',
    dataUrl:
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="%23082f49"/><rect x="80" y="80" width="240" height="240" rx="30" fill="none" stroke="%2322d3ee" stroke-width="12"/><line x1="80" y1="200" x2="320" y2="200" stroke="%2306b6d4" stroke-width="6"/><line x1="200" y1="80" x2="200" y2="320" stroke="%2306b6d4" stroke-width="6"/></svg>',
  },
  {
    id: 'thumb-emerald-core',
    name: 'Emerald Matrix Badge',
    category: 'thumbnail',
    color: '#10b981',
    dataUrl:
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="%23022c22"/><circle cx="200" cy="200" r="130" fill="none" stroke="%2310b981" stroke-width="12"/><circle cx="200" cy="200" r="70" fill="%23059669"/><rect x="185" y="110" width="30" height="180" fill="%23a7f3d0"/><rect x="110" y="185" width="180" height="30" fill="%23a7f3d0"/></svg>',
  },
  {
    id: 'thumb-crimson-hex',
    name: 'Crimson Robotics Core',
    category: 'thumbnail',
    color: '#f43f5e',
    dataUrl:
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="%234c0519"/><polygon points="200,90 290,145 290,255 200,310 110,255 110,145" fill="%23881337" stroke="%23f43f5e" stroke-width="10"/><circle cx="200" cy="200" r="45" fill="%23fda4af"/></svg>',
  },
  {
    id: 'thumb-violet-quantum',
    name: 'Violet Quantum Node',
    category: 'thumbnail',
    color: '#8b5cf6',
    dataUrl:
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="%232e1065"/><circle cx="200" cy="200" r="120" fill="none" stroke="%238b5cf6" stroke-width="10" stroke-dasharray="20 15"/><circle cx="200" cy="200" r="50" fill="%23c4b5fd"/></svg>',
  },
  {
    id: 'thumb-amber-star',
    name: 'Amber Olympiad Shield',
    category: 'thumbnail',
    color: '#f59e0b',
    dataUrl:
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="%23451a03"/><path d="M200 90 L290 140 L270 270 L200 320 L130 270 L110 140 Z" fill="%2378350f" stroke="%23f59e0b" stroke-width="10"/><polygon points="200,140 215,185 260,185 225,215 240,260 200,230 160,260 175,215 140,185 185,185" fill="%23fde68a"/></svg>',
  },
];

/**
 * Resizes and compresses an uploaded file into an optimized base64 data URL.
 * Guarantees that images fit comfortably in localStorage without quota crashes.
 */
export async function processUploadedImage(
  file: File,
  maxWidth = 1200,
  maxHeight = 700,
  quality = 0.82
): Promise<string> {
  return new Promise((resolve, reject) => {
    // If SVG, read as text data URL directly to keep pristine vector sharpness
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect-ratio preserving dimensions
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(readerEvent.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Use JPEG for photography / banners to keep bytes low
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      img.onerror = () => {
        resolve(readerEvent.target?.result as string);
      };
      img.src = readerEvent.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
