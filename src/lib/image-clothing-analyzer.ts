/**
 * Image Clothing Analyzer
 * Extracts visual attributes (dominant color, category heuristics)
 * Handles transparent fallback when no external vision model is connected.
 */

export interface AnalysisResult {
  colorName: string;
  colorHex: string;
  suggestedCategory?: string;
  suggestedStyle?: string;
  suggestedPattern?: string;
  isAiVisionConnected: boolean;
  confidence: 'real_model' | 'client_heuristic';
  statusMessage: string;
}

const COLOR_MAP: Array<{ name: string; hex: string; r: number; g: number; b: number }> = [
  { name: 'Hitam', hex: '#1C1C1C', r: 28, g: 28, b: 28 },
  { name: 'Putih Bersih', hex: '#FDFDFD', r: 250, g: 250, b: 250 },
  { name: 'Krem / Ivory', hex: '#F7F2E7', r: 247, g: 242, b: 231 },
  { name: 'Biru Navy', hex: '#1B2A4A', r: 27, g: 42, b: 74 },
  { name: 'Biru Denim', hex: '#3B597B', r: 59, g: 89, b: 123 },
  { name: 'Biru Muda', hex: '#7BA0C0', r: 123, g: 160, b: 192 },
  { name: 'Hijau Sage', hex: '#7D988D', r: 125, g: 152, b: 141 },
  { name: 'Olive Green', hex: '#556B2F', r: 85, g: 107, b: 47 },
  { name: 'Terracotta', hex: '#B85D43', r: 184, g: 93, b: 67 },
  { name: 'Cokelat Mocha', hex: '#6F4E37', r: 111, g: 78, b: 55 },
  { name: 'Cokelat Khaki', hex: '#C3B091', r: 195, g: 176, b: 145 },
  { name: 'Abu-abu Netral', hex: '#808080', r: 128, g: 128, b: 128 },
  { name: 'Dusty Pink', hex: '#E8B4B8', r: 232, g: 180, b: 184 },
  { name: 'Mustard Gold', hex: '#C59B27', r: 197, g: 155, b: 39 }
];

/**
 * Extract dominant RGB color from an image URL or Base64 string using canvas
 */
export async function extractDominantColor(imageUrl: string): Promise<{ colorName: string; hex: string }> {
  if (typeof window === 'undefined') {
    return { colorName: 'Netral', hex: '#162D24' };
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({ colorName: 'Hitam', hex: '#1C1C1C' });
          return;
        }

        canvas.width = 64;
        canvas.height = 64;
        ctx.drawImage(img, 0, 0, 64, 64);

        const imgData = ctx.getImageData(0, 0, 64, 64).data;
        let rSum = 0;
        let gSum = 0;
        let bSum = 0;
        let count = 0;

        for (let i = 0; i < imgData.length; i += 16) {
          const r = imgData[i];
          const g = imgData[i + 1];
          const b = imgData[i + 2];
          const a = imgData[i + 3];

          // Skip completely transparent or near-blown-out background pixels
          if (a > 128 && !(r > 250 && g > 250 && b > 250)) {
            rSum += r;
            gSum += g;
            bSum += b;
            count++;
          }
        }

        if (count === 0) {
          resolve({ colorName: 'Putih Bersih', hex: '#FDFDFD' });
          return;
        }

        const avgR = Math.round(rSum / count);
        const avgG = Math.round(gSum / count);
        const avgB = Math.round(bSum / count);

        // Find closest color in fashion palette
        let closestColor = COLOR_MAP[0];
        let minDistance = Infinity;

        for (const c of COLOR_MAP) {
          const d = Math.sqrt(
            Math.pow(avgR - c.r, 2) + Math.pow(avgG - c.g, 2) + Math.pow(avgB - c.b, 2)
          );
          if (d < minDistance) {
            minDistance = d;
            closestColor = c;
          }
        }

        resolve({ colorName: closestColor.name, hex: closestColor.hex });
      } catch (e) {
        resolve({ colorName: 'Netral', hex: '#162D24' });
      }
    };

    img.onerror = () => {
      resolve({ colorName: 'Netral', hex: '#162D24' });
    };

    img.src = imageUrl;
  });
}

/**
 * Analyze clothing item metadata from an uploaded image
 */
export async function analyzeClothingImage(imageUrl: string): Promise<AnalysisResult> {
  const colorData = await extractDominantColor(imageUrl);

  // Check if server-side AI Vision model is available
  try {
    const res = await fetch('/api/analyze-clothing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrl })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.aiVisionAvailable) {
        return {
          colorName: data.colorName || colorData.colorName,
          colorHex: data.colorHex || colorData.hex,
          suggestedCategory: data.category,
          suggestedStyle: data.style,
          suggestedPattern: data.pattern,
          isAiVisionConnected: true,
          confidence: 'real_model',
          statusMessage: 'Analisis AI terverifikasi: Kategori dan atribut pakaian berhasil dideteksi.'
        };
      }
    }
  } catch (err) {
    // Fallback to client heuristic
  }

  // Honest fallback
  return {
    colorName: colorData.colorName,
    colorHex: colorData.hex,
    isAiVisionConnected: false,
    confidence: 'client_heuristic',
    statusMessage: 'Warna dominan terdeteksi otomatis dari gambar. Silakan lengkapi kategori dan atribut pakaian Anda di bawah ini.'
  };
}
