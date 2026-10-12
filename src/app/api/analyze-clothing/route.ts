import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { imageUrl }: { imageUrl: string } = await req.json();

    if (!imageUrl) {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Disclose honestly that external vision API key is not configured
      return NextResponse.json({
        success: true,
        aiVisionAvailable: false,
        message: 'Layanan vision API eksternal belum dikonfigurasi. Menggunakan analisis warna lokal.'
      });
    }

    // If Gemini key is available, call Google Gemini Vision model
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Identifikasi pakaian dalam foto ini. Berikan respons dalam format JSON murni:
{
  "category": "tops" | "bottoms" | "outerwear" | "dresses" | "shoes" | "bags" | "accessories",
  "colorName": "string",
  "colorHex": "string",
  "pattern": "solid" | "stripes" | "plaid" | "floral" | "batik" | "graphic" | "polka" | "other",
  "style": "minimalist" | "casual" | "formal" | "streetwear" | "vintage_retro"
}`
                  }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.2,
              responseMimeType: 'application/json'
            }
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const parsed = JSON.parse(text);
          return NextResponse.json({
            success: true,
            aiVisionAvailable: true,
            ...parsed
          });
        }
      }
    } catch (apiErr) {
      console.warn('Gemini vision API error, falling back to local analysis:', apiErr);
    }

    return NextResponse.json({
      success: true,
      aiVisionAvailable: false,
      message: 'Layanan vision API gagal memproses gambar. Menggunakan deteksi warna lokal.'
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, aiVisionAvailable: false, message: 'Server error' },
      { status: 500 }
    );
  }
}
