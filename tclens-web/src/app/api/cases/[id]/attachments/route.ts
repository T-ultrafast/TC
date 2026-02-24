import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/storage';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const userId = req.headers.get('x-user-id');
    const isLoggedIn = req.headers.get('x-is-logged-in') === 'true';
    const { id: caseId } = await params;

    if (!isLoggedIn || !userId) {
        return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    try {
        const formData = await req.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json({ ok: false, error: "No file provided" }, { status: 400 });
        }

        // Validate file type
        const allowedTypes = ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        const allowedExtensions = ['.pdf', '.txt', '.doc', '.docx'];
        const fileExtension = path.extname(file.name).toLowerCase();

        if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
            return NextResponse.json({ ok: false, error: "Invalid file type. Only PDF, TXT, DOC, and DOCX are allowed." }, { status: 400 });
        }

        // Validate size (10MB)
        if (file.size > 10 * 1024 * 1024) {
            return NextResponse.json({ ok: false, error: "File too large. Maximum size is 10MB." }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const uploadDir = path.join(process.cwd(), 'public/uploads');
        await mkdir(uploadDir, { recursive: true });

        const uniqueFilename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const filePath = path.join(uploadDir, uniqueFilename);

        await writeFile(filePath, buffer);

        const attachment = await storage.addAttachment({
            caseId,
            userId,
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            storagePath: `/uploads/${uniqueFilename}`
        });

        return NextResponse.json({ ok: true, data: attachment });

    } catch (error) {
        console.error("Failed to upload attachment:", error);
        return NextResponse.json({ ok: false, error: "Upload failed" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    // Note: This route is for deleting attachments, but the ID in the URL is usually the case ID.
    // Ideally we'd have /api/cases/[caseId]/attachments/[attachmentId], but for simplicity
    // we can pass attachment ID in query param or body? 
    // The architecture plan said /api/cases/[id]/attachments, implying this handles the collection.
    // But RESTful delete typically targets a resource. 
    // Let's modify to accept attachmentId in query param for deletion as a quick pragmatic solution 
    // or assume we might traverse to a specific attachment route. 
    // Given the task description "Implement Attachments API (/api/cases/[id]/attachments)", 
    // I will use query param ?attachmentId=... for DELETE to keep it in one file if possible, 
    // or I'll just rely on the body. Query param is safer for DELETE.

    const userId = req.headers.get('x-user-id');
    const isLoggedIn = req.headers.get('x-is-logged-in') === 'true';
    const { searchParams } = new URL(req.url);
    const attachmentId = searchParams.get('attachmentId');

    if (!isLoggedIn || !userId) {
        return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!attachmentId) {
        return NextResponse.json({ ok: false, error: "Attachment ID is required" }, { status: 400 });
    }

    try {
        const success = await storage.deleteAttachment(attachmentId, userId);
        if (!success) {
            return NextResponse.json({ ok: false, error: "Attachment not found or unauthorized" }, { status: 404 });
        }
        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error("Failed to delete attachment:", error);
        return NextResponse.json({ ok: false, error: "Internal Server Error" }, { status: 500 });
    }
}
