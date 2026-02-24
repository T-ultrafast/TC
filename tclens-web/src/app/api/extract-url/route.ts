import { NextRequest, NextResponse } from 'next/server';
import { extractFromUrl } from '@/lib/extractor';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
    try {
        const { url, jurisdiction } = await req.json();

        if (!url) {
            return NextResponse.json({ ok: false, error: 'URL is required' }, { status: 400 });
        }

        let normalizedUrl = url.trim();
        if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
            normalizedUrl = 'https://' + normalizedUrl;
        }

        const result = await extractFromUrl(normalizedUrl);

        return NextResponse.json({
            ok: true,
            data: {
                ...result,
                jurisdiction: jurisdiction || null
            }
        });

    } catch (error: any) {
        console.error('[API_EXTRACT_URL] Error:', error);
        return NextResponse.json({
            ok: false,
            error: error.message || 'Failed to extract content from URL'
        }, { status: 500 });
    }
}
