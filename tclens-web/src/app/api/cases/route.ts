import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/storage';

export async function GET(req: NextRequest) {
    const userId = req.headers.get('x-user-id');
    const isLoggedIn = req.headers.get('x-is-logged-in') === 'true';

    if (!isLoggedIn || !userId) {
        return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    try {
        const cases = await storage.getCases(userId);
        return NextResponse.json({ ok: true, data: cases });
    } catch (error) {
        console.error("Failed to fetch cases:", error);
        return NextResponse.json({ ok: false, error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const userId = req.headers.get('x-user-id');
    const isLoggedIn = req.headers.get('x-is-logged-in') === 'true';

    if (!isLoggedIn || !userId) {
        return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { title, description } = body;

        if (!title || !title.trim()) {
            return NextResponse.json({ ok: false, error: "Title is required" }, { status: 400 });
        }

        const newCase = await storage.createCase({
            userId,
            title,
            description: description || ""
        });

        return NextResponse.json({ ok: true, data: newCase });
    } catch (error) {
        console.error("Failed to create case:", error);
        return NextResponse.json({ ok: false, error: "Internal Server Error" }, { status: 500 });
    }
}
