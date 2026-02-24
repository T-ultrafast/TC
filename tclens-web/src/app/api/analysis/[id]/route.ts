import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/storage';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        if (!id) {
            return NextResponse.json({ error: 'Missing report ID' }, { status: 400 });
        }

        const analysis = await storage.getAnalysisByIdOnly(id);

        if (!analysis) {
            return NextResponse.json({ error: 'Report not found' }, { status: 404 });
        }

        return NextResponse.json(analysis);

    } catch (error) {
        console.error('Error fetching public analysis:', error);
        return NextResponse.json(
            { error: 'Failed to fetch analysis' },
            { status: 500 }
        );
    }
}
