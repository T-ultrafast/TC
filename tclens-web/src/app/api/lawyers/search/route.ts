import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/storage';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const query = searchParams.get('query') || '';
        const location = searchParams.get('location') || '';

        const results = await storage.searchLawyers(query, location);

        // Sanitize results (remove internal IDs if necessary, though storage usually returns what we need)
        const sanitized = results.map(l => ({
            id: l.id,
            name: l.name,
            title: l.title,
            avatarUrl: l.avatarUrl,
            specialties: l.specialties,
            city: l.city,
            state: l.state,
            country: l.country,
            hourlyRate: l.hourlyRate,
            bio: l.bio,
            rating: l.rating ?? 0, // Default to 0/New if undefined
            reviewsCount: l.reviewsCount ?? 0,
        }));

        return NextResponse.json({ ok: true, data: sanitized });
    } catch (error) {
        console.error("Search API Error:", error);
        return NextResponse.json({ ok: false, error: "Failed to search lawyers" }, { status: 500 });
    }
}
